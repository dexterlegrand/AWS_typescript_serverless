const {
  ENV,
  REGION,
  TABLE_ENTITY,
  TABLE_ENTITY_USER,
  TABLE_TASKS,
  TABLE_PAYMENTS,
  TABLE_PAYMENT_METHODS,
} = process.env;
const isProd = ENV === 'prod';
import {
  Payment,
  PaymentMethodType,
  PaymentStatus,
  TaskPaymentStatus,
  TaskSearchStatus,
  TaskSignatureStatus,
  TaskStatus,
} from '/opt/API';
import { createRecord, getRecord, updateRecord } from '/opt/dynamoDB';
import {
  createZaiAuthToken,
  CreateZaiAuthTokenResponse,
  createZaiItem,
  CreateZaiItemRequest,
  isAuthTokenExpired,
  ItemStatuses,
  listZaiFees,
  makeZaiPayment,
  validateEntityUser,
  validateFeeId,
  validatePaymentMethod,
} from '/opt/zai';
import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { AppSyncResolverHandler } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { DateTime } from 'luxon';

const secretManager = new SecretsManagerClient({ region: REGION });
const DdbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DdbClient);

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

const queryTaskPayments = async (taskId: string) => {
  const today = DateTime.now().setZone('Australia/Sydney').toISODate();
  console.log("today's date: ", today);

  let nextToken = undefined;
  let allItems: (Payment | Record<string, any>)[] = [];

  do {
    const params = {
      TableName: TABLE_PAYMENTS,
      IndexName: 'paymentsByTask',
      KeyConditionExpression: '#taskId = :taskId',
      ExpressionAttributeNames: {
        '#taskId': 'taskId',
      },
      ExpressionAttributeValues: {
        ':taskId': taskId,
      },
      ExclusiveStartKey: nextToken,
    };

    const command: QueryCommand = new QueryCommand(params);
    const data = await docClient.send(command);
    if (data.Items) {
      allItems = [...allItems, ...data.Items];
    }
    nextToken = data.LastEvaluatedKey;
  } while (nextToken);

  return allItems;
};

export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  console.log(`EVENT: ${JSON.stringify(ctx)}`);
  const { claims, sub, sourceIp } = ctx.identity as AppSyncIdentityCognito;
  const { input } = ctx.arguments;
  const { taskId, entityId, paymentMethodId } = input;

  console.log('claims.phone: ', claims.phone_number);

  if (!sourceIp || sourceIp?.length === 0) {
    throw new Error('Unable to find IP address for user');
  }

  const ip = sourceIp[0];

  let task;
  try {
    task = await getRecord(TABLE_TASKS ?? '', { id: taskId, entityId });
  } catch (err: any) {
    console.log('ERROR get task record: ', err);
  }

  if (!task) {
    throw new Error('NO_TASK_FOUND');
  }

  console.log('task to make payments for?: ', task);

  let entity;
  try {
    entity = await getRecord(TABLE_ENTITY ?? '', {
      id: task.entityIdFrom,
    });
  } catch (err: any) {
    console.log('ERROR get entity: ', err);
    throw new Error(err.message);
  }

  console.log('entity: ', entity);

  let entityTo; //seller
  try {
    entityTo = await getRecord(TABLE_ENTITY ?? '', {
      id: task.entityIdTo,
    });
    console.log('entityTo: ', entityTo);
  } catch (err: any) {
    console.log('ERROR get entity: ', err);
    throw new Error(err.message);
  }

  // get entity user to ensure they have permission to update the entity
  let entityUser;
  try {
    entityUser = await getRecord(TABLE_ENTITY_USER ?? '', {
      userId: sub,
      entityId: task.entityId,
    });
  } catch (err: any) {
    console.log('ERROR get entity user: ', err);
    throw new Error(err.message);
  }

  console.log('entityUser: ', entityUser);

  validateEntityUser(entityUser);

  // query payments for task that requirement payment
  let taskPayments: Payment[] | Record<string, any> = [];
  try {
    taskPayments = await queryTaskPayments(taskId);
    console.log('taskPayments: ', taskPayments);
  } catch (err: any) {
    console.log('ERROR get task payments: ', err);
    throw new Error(err.message);
  }

  const payableTaskPayments = taskPayments.filter(
    (payment: Payment) =>
      payment.status === PaymentStatus.PENDING_USER_CONFIRMATION ||
      payment.status === PaymentStatus.USER_CONFIRMED ||
      payment.status === PaymentStatus.DECLINED
  );

  //TODO: declined payment items inclusive?  || payment.status === PaymentStatus.DECLINED
  const alreadyPaidTaskPayments = taskPayments.filter(
    (payment: Payment) => payment.status === PaymentStatus.COMPLETED
  );

  //TODO: declined payment items, need to void via zai api?

  if (payableTaskPayments?.length === 0) {
    throw new Error('NO_PAYABLE_TASK_PAYMENTS');
  }

  // calculate the remaining amount to be paid
  const amount = payableTaskPayments.reduce(
    (acc: number, payment: Payment) => acc + (payment.amount ?? 0),
    0
  );
  console.log('Amount remaining to be paid: ', amount);

  // paymentMethod for payment
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

  await initZai();

  let feeId;
  if (paymentMethod?.paymentMethodType === PaymentMethodType.CARD) {
    try {
      // get zai fee
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

  // create zai item
  let zaiItem;
  try {
    const itemParams: CreateZaiItemRequest = {
      id: randomUUID(),
      name: `task: ${task.id}`,
      amount,
      currency: 'AUD',
      payment_type: 2, //TODO: payment type? not well documented on Zai api docs
      buyer_id: entity.owner,
      seller_id: entityTo.owner, //TODO: should be entityId?
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

  let itemPaymentData;
  const itemPaymentParams = {
    account_id: paymentMethod?.id,
    ip_address: ip,
    merchant_phone: entityTo?.phone,
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

  console.log('zaiItem: ', zaiItem);

  // TODO: handle bank. Also what if released amount = 0?
  let payment;
  if (
    zaiItem?.state === 'completed' &&
    zaiItem?.released_amount === zaiItem?.amount
  ) {
    const taskParams: any = {
      //TODO: task type
      paymentStatus: TaskPaymentStatus.PAID,
      fromSearchStatus: `${task.entityIdFrom}#${TaskSearchStatus.COMPLETED}`,
      toSearchStatus: `${task.entityIdTo}#${TaskSearchStatus.COMPLETED}`,
      updatedAt: new Date().toISOString(),
    };

    // if not pending signature, update status to completed
    if (task.signatureStatus !== TaskSignatureStatus.PENDING_SIGNATURE) {
      taskParams.status = TaskStatus.COMPLETED;
    }

    try {
      await updateRecord(
        TABLE_TASKS ?? '',
        { entityId: task.entityId, id: task.id },
        taskParams
      );
    } catch (err: any) {
      console.log('ERROR update task status: ', err);
      throw new Error(err.message);
    }

    // create payment record
    const today = DateTime.now().setZone('Australia/Sydney').toISODate();
    console.log("today's date: ", today);

    payment = {
      id: zaiItem.id,
      entityId: task.entityId,
      // providerTransactionId: '',
      //paymentGroupId,
      taskId: task.id,
      amount: zaiItem.amount,
      paymentType: 'PAY_NOW',
      paymentProvider: 'ZAI',
      ipAddress: ip,
      feeId,
      entityIdFrom: entity.id,
      entityIdTo: entityTo.id,
      scheduledAt: today,
      installment: alreadyPaidTaskPayments?.length + 1,
      installments: alreadyPaidTaskPayments?.length + 1 ?? 1,
      status: ItemStatuses[zaiItem.status],
      createdAt: zaiItem.created_at + '',
      updatedAt: zaiItem.updated_at + '',
      zaiUpdatedAt: zaiItem.updated_at + '',
    };

    try {
      await createRecord(TABLE_PAYMENTS ?? '', payment);
    } catch (err: any) {
      console.log('ERROR create payment record: ', err);
      throw new Error(err.message);
    }

    // update existing payment records
    const requests = payableTaskPayments.map((payment: Payment) =>
      updateRecord(
        TABLE_PAYMENTS ?? '',
        { id: payment.id },
        { status: PaymentStatus.VOIDED }
      )
    );

    try {
      const updatedPayments = await Promise.all(requests);
      console.log('updatedPayments: ', updatedPayments);
    } catch (err: any) {
      console.log('ERROR update payment records: ', err);
      throw new Error(err.message);
    }
  } else {
    console.log('UNHANDLED ZAI PAYMENT STATE: ', zaiItem?.state, zaiItem);
  }

  return [payment];
};
