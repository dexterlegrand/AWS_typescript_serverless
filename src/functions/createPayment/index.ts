const {
  ENV,
  REGION,
  TABLE_CONTACT,
  TABLE_ENTITY,
  TABLE_ENTITY_USER,
  TABLE_TASKS,
  TABLE_PAYMENTS,
  TABLE_PAYMENT_METHODS,
} = process.env;
const isProd = ENV === 'prod';
import {
  BillsPaymentInput,
  CreatePaymentInput,
  FromToType,
  PaymentMethodType,
  PaymentProvider,
  PaymentStatus,
  PaymentType,
  Task,
  TaskPaymentStatus,
  TaskSearchStatus,
  TaskSignatureStatus,
  TaskStatus,
} from '/opt/API';
import { batchGet, batchPut, getRecord, updateRecord } from '/opt/dynamoDB';
import {
  createZaiAuthToken,
  CreateZaiAuthTokenResponse,
  createZaiItem,
  CreateZaiItemRequest,
  getZaiItem,
  isAuthTokenExpired,
  ItemStatuses,
  listZaiFees,
  makeZaiPayment,
  updateZaiItem,
  validateBills,
  validateEntityUser,
  validateFeeId,
  validateInstallments,
  validatePaymentMethod,
  validateScheduled,
} from '/opt/zai';
import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { AppSyncResolverHandler } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { DateTime } from 'luxon';

const secretManager = new SecretsManagerClient({ region: REGION });

let zaiAuthToken: CreateZaiAuthTokenResponse;
let zaiClientSecret: string;

// init zai
const initZai = async () => {
  // get secret from aws secrets manager after init from aws-sdk v3
  try {
    const zaiEnv = isProd ? 'prod' : 'dev';
    const response = await secretManager.send(
      new GetSecretValueCommand({ SecretId: `ZaiSecrets-${zaiEnv}` })
    );

    // access zaiClientSecret from secret
    if (response.SecretString) {
      const secrets = JSON.parse(response.SecretString);
      zaiClientSecret = secrets.zaiClientSecret;
    }
  } catch (err: any) {
    console.log('ERROR get secret: ', err);
    throw new Error(err.message);
  }

  if (isAuthTokenExpired(zaiAuthToken)) {
    try {
      zaiAuthToken = await createZaiAuthToken({ zaiClientSecret });
      console.log('zaiAuthToken: ', zaiAuthToken);
    } catch (err: any) {
      console.log('ERROR createZaiAuthToken: ', err);
      throw new Error(err.message);
    }
  }

  return {
    zaiAuthToken,
    zaiClientSecret,
  };
};

const getPaymentAmount = (
  paymentType: string,
  amount: number,
  installments = 1,
  isFirstInstallment = false
) => {
  if (paymentType === 'INSTALLMENTS') {
    const amountPerInstallment = Math.floor(amount / installments);

    // first installment + remainder cents
    if (isFirstInstallment) {
      const remainder = amount % installments;
      return amountPerInstallment + remainder;
    }

    return amountPerInstallment;
  }

  return amount;
};

export const handler: AppSyncResolverHandler<any, any> = async (
  ctx,
  _check1,
  _check2
) => {
  console.log(`EVENT: ${JSON.stringify(ctx)}`);
  console.log('_check1: ', JSON.stringify(_check1));
  console.log('_check2: ', JSON.stringify(_check2));
  const { claims, sub, sourceIp } = ctx.identity as AppSyncIdentityCognito;
  const { input } = ctx.arguments;
  const { entityId, billPayments, paymentMethodId } =
    input as CreatePaymentInput;

  console.log('claims.phone: ', claims.phone_number);
  console.log('sourceIp: ', sourceIp);

  if (!sourceIp || sourceIp?.length === 0) {
    throw new Error('Unable to find IP address for user');
  }

  const ip = sourceIp[0];

  // get entity user to ensure they have permission to update the entity
  let entityUser;
  try {
    entityUser = await getRecord(TABLE_ENTITY_USER ?? '', {
      userId: sub,
      entityId,
    });
  } catch (err: any) {
    console.log('ERROR get entity user: ', err);
    throw new Error(err.message);
  }

  console.log('entityUser: ', entityUser);

  validateEntityUser(entityUser);

  await initZai();

  // buyer - //TODO: contact or entity?
  let entity;
  try {
    entity = await getRecord(TABLE_ENTITY ?? '', {
      id: entityId,
    });
  } catch (err: any) {
    console.log('ERROR get entity: ', err);
    throw new Error(err.message);
  }

  console.log('entity: ', entity);

  // get payment method for payment
  let paymentMethod;
  try {
    paymentMethod = await getRecord(TABLE_PAYMENT_METHODS ?? '', {
      id: paymentMethodId,
    });
  } catch (err: any) {
    console.log('ERROR get paymentMethod: ', err);
    throw new Error(err.message);
  }

  validatePaymentMethod(paymentMethod);

  // list bills from batch get using billIds
  const paymentsResponse = [];
  let tasks: Task[] = [];
  const keys = billPayments.map(({ id }: { id: string }) => ({ entityId, id }));
  try {
    tasks = await batchGet({
      tableName: TABLE_TASKS ?? '',
      keys,
    });

    console.log('tasks: ', tasks);
  } catch (err: any) {
    console.log('ERROR batch get bills: ', err);
    throw new Error(err.message);
  }

  validateBills(tasks, billPayments, entityId);

  // get zai fee to apply to payment if cc payment
  let feeId;
  if (paymentMethod?.paymentMethodType === PaymentMethodType.CARD) {
    try {
      const zaiFeeData = await listZaiFees(zaiAuthToken?.access_token, {
        limit: 200,
        offset: 0,
      });
      console.log('zaiFeeData: ', zaiFeeData);
      const fee = zaiFeeData.fees.find((fee) => fee.name === 'CARD_50');
      feeId = fee?.id;
    } catch (err: any) {
      console.log('ERROR get zai fee: ', err);
      throw new Error(err.message);
    }
  }

  validateFeeId(feeId);

  let payment;
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const billPayment = billPayments.find(
      (billPayment: BillsPaymentInput) => billPayment.id === task.id
    );

    if (!billPayment) {
      throw new Error(`UNABLE_TO_MATCH_BILL_PAYMENT - ${task.id}`);
    }

    if (!task.amount) {
      throw new Error(`BILL_AMOUNT_REQUIRED - ${tasks[i].id}`);
    }

    // pay now validation
    if (billPayment.paymentType === PaymentType.PAY_NOW) {
      //
    }

    // scheduled validation
    if (billPayment.paymentType === PaymentType.SCHEDULED) {
      validateScheduled({ scheduledAt: billPayment.scheduledAt });
    }

    // installments validation
    if (billPayment.paymentType === PaymentType.INSTALLMENTS) {
      validateInstallments({
        installments: billPayment.installments,
        scheduledAt: billPayment.scheduledAt,
      });
    }

    // get amount for this payment
    const amount = getPaymentAmount(
      billPayment.paymentType,
      task.amount,
      billPayment.installments,
      true
    );

    // seller - //TODO - is it always an entity?
    let zaiBuyerId;
    let zaiSellerId;
    // payment buyer is an entity
    if (task.toType === FromToType.ENTITY) {
      let buyerEntity;
      try {
        buyerEntity = await getRecord(TABLE_ENTITY ?? '', {
          id: task.toId,
        });
        console.log('entityTo: ', buyerEntity);
        zaiBuyerId = buyerEntity.owner;
      } catch (err: any) {
        console.log('ERROR get entity: ', err);
        throw new Error(err.message);
      }

      if (!buyerEntity) {
        throw new Error('ERROR_GET_ENTITY_TO');
      }
    }

    // payment buyer is a contact
    else if (task.toType === FromToType.CONTACT) {
      let buyerContact;
      try {
        buyerContact = await getRecord(TABLE_CONTACT ?? '', {
          id: task.toId,
        });
        console.log('contactTo: ', buyerContact);
        zaiBuyerId = buyerContact.zaiUserId;
      } catch (err: any) {
        console.log('ERROR get contact: ', err);
        throw new Error(err.message);
      }

      if (!buyerContact) {
        throw new Error('ERROR_GET_CONTACT_TO');
      }
    }

    let sellerEntity;
    try {
      sellerEntity = await getRecord(TABLE_ENTITY ?? '', {
        id: task.toId,
      });
      console.log('entityTo: ', sellerEntity);
      zaiSellerId = sellerEntity.owner;
    } catch (err: any) {
      console.log('ERROR get entity: ', err);
      throw new Error(err.message);
    }

    if (!sellerEntity) {
      throw new Error('ERROR_GET_ENTITY_TO');
    }

    const futurePayments = [];
    let zaiItem;
    // get zai item
    try {
      const zaiItemData = await getZaiItem(zaiAuthToken?.access_token, task.id);
      zaiItem = zaiItemData?.items;
    } catch (err: any) {
      console.log('ERROR getZaiItem: ', err);
      //throw new Error(err.message);
    }

    // existing zai item - update it
    if (zaiItem) {
      try {
        const zaiItemData = await updateZaiItem(
          zaiAuthToken?.access_token,
          task.id,
          {
            amount,
            name: `task: ${task.id}`,
            buyer_id: zaiBuyerId,
            seller_id: zaiSellerId,
            //custom_descriptors: '' //TODO: review with Zai, need some kind of descriptor? review with transaction / zai? Invoice ID?
          }
        );
        zaiItem = zaiItemData?.items;
      } catch (err: any) {
        console.log('ERROR updateZaiItem: ', err);
        throw new Error(err.message);
      }
    }

    // new zai item required - create it
    else {
      try {
        const itemParams: CreateZaiItemRequest = {
          id: task.id,
          name: `task: ${task.id}`,
          amount,
          currency: 'AUD',
          payment_type: 2, //TODO: payment type? not well documented on Zai api docs
          buyer_id: zaiBuyerId,
          seller_id: zaiSellerId,
          //custom_descriptors: '' //TODO: review with Zai, need some kind of descriptor? review with transaction / zai? Invoice ID?
        };

        if (feeId) {
          itemParams.fee_ids = feeId;
        }

        console.log('create item params: ', itemParams);

        const zaiItemData = await createZaiItem(
          zaiAuthToken?.access_token,
          itemParams
        );
        console.log('zaiItemData: ', zaiItemData);
        zaiItem = zaiItemData?.items;
      } catch (err: any) {
        console.log('ERROR createZaiItem err: ', err);
        console.log('ERROR createZaiItem err?.errors: ', err?.errors);
        throw new Error(err.message);
      }
    }

    if (!zaiItem) {
      throw new Error('ERROR_CREATE_UPDATE_ZAI_ITEM');
    }

    const underThousand = zaiItem.amount < 1000 * 100;
    console.log('underThousand: ', underThousand);
    // take payment in future if scheduled as scheduled for future
    if (billPayment.paymentType === PaymentType.SCHEDULED) {
      payment = {
        id: zaiItem.id,
        entityId: task.entityId,
        taskId: task.id,
        amount: zaiItem.amount,
        status: underThousand
          ? PaymentStatus.USER_CONFIRMED
          : PaymentStatus.SCHEDULED,
        installment: 1,
        installments: billPayment.installments,
        paymentType: billPayment.paymentType,
        paymentProvider: PaymentProvider.ZAI,
        ipAddress: ip,
        feeId,
        fromId: task.fromId,
        toId: task.toId,
        zaiBuyerId,
        zaiSellerId,
        createdAt: zaiItem.created_at + '',
        updatedAt: zaiItem.updated_at + '',
        zaiUpdatedAt: zaiItem.updated_at + '',
        scheduledAt: billPayment.scheduledAt,
      };

      // update task to scheduled
      try {
        const taskParams = {
          // TODO: task params type
          paymentStatus: TaskPaymentStatus.SCHEDULED,
          status: TaskPaymentStatus.SCHEDULED,
          updatedAt: new Date().toISOString(),
        };

        await updateRecord(
          TABLE_TASKS ?? '',
          { entityId: task.entityId, id: task.id },
          taskParams
        );
      } catch (err: any) {
        console.log('ERROR update task status: ', err);
        throw new Error(err.message);
      }
    }

    // take payment for pay now / installments
    else {
      let itemPaymentData;
      const itemPaymentParams = {
        account_id: paymentMethod?.id,
        ip_address: ip,
        merchant_phone: sellerEntity?.phone,
      };
      console.log('makeZaiPayment params: ', itemPaymentParams);
      try {
        itemPaymentData = await makeZaiPayment(
          zaiAuthToken?.access_token,
          zaiItem.id,
          itemPaymentParams
        );
        console.log('makeZaiPayment data: ', itemPaymentData);
        zaiItem = itemPaymentData?.items;
      } catch (err: any) {
        console.log('ERROR makeZaiPayment: ', JSON.stringify(err));
        throw new Error(err.message);
      }

      // TODO: handle bank. Also what if released amount = 0?
      if (
        zaiItem?.state === 'completed' &&
        zaiItem?.released_amount === zaiItem?.amount
      ) {
        let taskParams: any;
        if (billPayment.paymentType === 'PAY_NOW') {
          taskParams = {
            paymentStatus: TaskPaymentStatus.PAID,
          };

          // set completed if signature completed / not required
          if (
            task?.status !== TaskStatus.COMPLETED &&
            task.signatureStatus !== TaskSignatureStatus.PENDING_SIGNATURE
          ) {
            taskParams.status = TaskStatus.COMPLETED;
            taskParams.fromSearchStatus = `${task.fromId}#${TaskSearchStatus.COMPLETED}`;
            taskParams.toSearchStatus = `${task.toId}#${TaskSearchStatus.COMPLETED}`;
          }
        } else if (billPayment.paymentType === 'INSTALLMENTS') {
          taskParams = {
            paymentStatus: TaskPaymentStatus.SCHEDULED,
            status: TaskPaymentStatus.SCHEDULED,
          };
        }

        if (taskParams) {
          try {
            await updateRecord(
              TABLE_TASKS ?? '',
              { entityId: task.entityId, id: task.id },
              {
                ...taskParams,
                updatedAt: new Date().toISOString(),
              }
            );
          } catch (err: any) {
            console.log('ERROR update task status: ', err);
            throw new Error(err.message);
          }
        }
      } else {
        console.log('UNHANDLED ZAI PAYMENT STATE: ', zaiItem?.state, zaiItem);
      }

      // create payment record with details from transaction
      payment = {
        id: zaiItem.id,
        entityId: task.entityId,
        // providerTransactionId: '',
        taskId: task.id,
        amount: zaiItem.amount,
        paymentType: billPayment.paymentType,
        paymentProvider: PaymentProvider.ZAI,
        ipAddress: ip,
        feeId,
        fromId: task.fromId,
        toId: task.toId,
        scheduledAt: billPayment.scheduledAt,
        installment: 1,
        installments: billPayment.installments,
        status: ItemStatuses[zaiItem.status],
        createdAt: zaiItem.created_at + '',
        updatedAt: zaiItem.updated_at + '',
        zaiUpdatedAt: zaiItem.updated_at + '',
        paidAt: new Date().toISOString(),
      };
    }

    // push payment to future payment requests
    futurePayments.push(payment);

    // create further installments if installments payment
    for (let j = 1; j < (billPayment.installments ?? 1); j++) {
      const nextScheduledAt = DateTime.fromFormat(
        billPayment.scheduledAt ?? '',
        'yyyy-MM-dd'
      )
        .plus({ months: j })
        .toFormat('yyyy-MM-dd');
      // create installment
      const createdAt = new Date().toISOString();
      const installment = {
        id: randomUUID(),
        entityId: task.entityId,
        taskId: task.id,
        paymentType: PaymentType.INSTALLMENTS,
        paymentProvider: PaymentProvider.ZAI,
        ipAddress: ip,
        feeId,
        fromId: task.fromId,
        toId: task.toId,
        amount: getPaymentAmount(
          billPayment.paymentType,
          task.amount,
          billPayment.installments,
          false
        ),
        status: PaymentStatus.SCHEDULED,
        scheduledAt: nextScheduledAt,
        installment: j + 1,
        installments: billPayment.installments,
        createdAt,
        updatedAt: createdAt,
        zaiUpdatedAt: null,
      };

      futurePayments.push(installment);
    }

    if (futurePayments.length > 0) {
      try {
        await batchPut({
          tableName: TABLE_PAYMENTS ?? '',
          items: futurePayments,
        });
      } catch (err: any) {
        console.log('ERROR batch put installments: ', err);
        throw new Error(err.message);
      }
    }

    // if scheduled, update task to scheduled
    if (billPayment.paymentType === PaymentType.SCHEDULED) {
      try {
        await updateRecord(
          TABLE_TASKS ?? '',
          { entityId: task.entityId, id: task.id },
          {
            paymentStatus: TaskPaymentStatus.SCHEDULED,
            taskStatus: TaskPaymentStatus.SCHEDULED, //TODO: review do we need task status
          }
        );
      } catch (err: any) {
        console.log('ERROR update task status: ', err);
        throw new Error(err.message);
      }
    }

    paymentsResponse.push(...futurePayments);
  }

  return paymentsResponse;
};
