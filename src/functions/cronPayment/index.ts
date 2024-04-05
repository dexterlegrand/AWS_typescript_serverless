const { ENV, REGION, TABLE_ENTITY, TABLE_PAYMENTS } = process.env;
import { Payment } from '/opt/API';
import { getRecord, updateRecord } from '/opt/dynamoDB';
import {
  createZaiAuthToken,
  CreateZaiAuthTokenResponse,
  createZaiItem,
  CreateZaiItemRequest,
  getZaiItem,
  isAuthTokenExpired,
  ItemStatuses,
  makeZaiPayment,
  updateZaiItem,
} from '/opt/zai';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ScheduledEvent, Context } from 'aws-lambda';
import { DateTime } from 'luxon';

const isProd = ENV === 'prod';

const DdbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DdbClient);

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

const queryScheduledPayments = async () => {
  const today = DateTime.now().setZone('Australia/Sydney').toISODate();
  console.log("today's date: ", today);

  let nextToken = undefined;
  let allItems: (Payment | Record<string, any>)[] = [];

  do {
    const params = {
      TableName: TABLE_PAYMENTS,
      IndexName: 'paymentsByStatus',
      KeyConditionExpression: '#status = :status and #scheduledAt <= :today',
      ExpressionAttributeNames: {
        '#status': 'status',
        '#scheduledAt': 'scheduledAt',
      },
      ExpressionAttributeValues: {
        ':status': 'USER_CONFIRMED',
        ':today': today,
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

export const handler = async (event: ScheduledEvent, context: Context) => {
  console.log('Cron Lambda triggered with event:', event);
  console.log('Context:', context);

  // today aest

  await initZai();

  let payments;
  try {
    payments = await queryScheduledPayments();
  } catch (err: any) {
    console.log('ERROR queryScheduledPayments: ', err);
    throw new Error(err.message);
  }

  console.log('scheduled payments: ', payments);

  if (payments?.length > 0) {
    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i] as Payment;
      console.log('payment: ', payment);

      if (!payment.amount || !payment.entityIdFrom || !payment.entityIdTo) {
        console.log('MISSING MANDATORY PAYMENT FIELDS: ', payment);
      }
      // able to do payment
      else {
        let entity;
        try {
          entity = await getRecord(TABLE_ENTITY ?? '', {
            id: payment.entityIdFrom,
          });
        } catch (err: any) {
          console.log('ERROR get entity: ', err);
          throw new Error(err.message);
        }

        let entityTo; //seller
        try {
          entityTo = await getRecord(TABLE_ENTITY ?? '', {
            id: payment.entityIdTo,
          });
          console.log('entityTo: ', entityTo);
        } catch (err: any) {
          console.log('ERROR get entity: ', err);
          throw new Error(err.message);
        }

        let zaiItem;
        // get zai item
        try {
          const zaiItemData = await getZaiItem(
            zaiAuthToken?.access_token,
            payment.id
          );
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
              payment.id,
              {
                amount: payment.amount,
                name: `payment: ${payment.id}`,
                buyer_id: payment.entityIdFrom,
                seller_id: payment.entityIdTo, //TODO: should be entityId?
                //custom_descriptors: '' //TODO: review with Zai, need some kind of descriptor? review with transaction / zai? Invoice ID?
              }
            );
            zaiItem = zaiItemData?.items;
          } catch (err: any) {
            console.log('ERROR updateZaiItem: ', err);
            throw new Error(err.message);
          }
        }

        // new zai item, create it
        else {
          try {
            const itemParams: CreateZaiItemRequest = {
              id: payment.id,
              name: `payment: ${payment.id}`,
              amount: payment.amount,
              currency: 'AUD',
              payment_type: 2, //TODO: payment type? not well documented on Zai api docs
              buyer_id: payment.entityIdFrom,
              seller_id: payment.entityIdTo, //TODO: should be entityId?
              //custom_descriptors: '' //TODO: review with Zai, need some kind of descriptor? review with transaction / zai? Invoice ID?
            };

            //TODO: do we need to check payment method id is CARd or BANK and only apply fee, as may update?
            if (payment.feeId) {
              itemParams.fee_ids = payment.feeId;
            }

            console.log('create item params: ', itemParams);

            const zaiItemData = await createZaiItem(
              zaiAuthToken?.access_token,
              itemParams
            );
            zaiItem = zaiItemData?.items;
            console.log('zaiItemData: ', zaiItemData);
          } catch (err: any) {
            console.log('ERROR createZaiItem err: ', err);
            console.log('ERROR createZaiItem err?.errors: ', err?.errors);
            throw new Error(err.message);
          }
        }

        console.log('zaiItem: ', zaiItem);
        if (!zaiItem) {
          console.log('NO ZAI ITEM');
        } else {
          let itemPaymentData;
          const itemPaymentParams = {
            account_id: entity?.paymentMethodId,
            ip_address: payment.ipAddress ?? '',
            merchant_phone: entityTo?.phone,
          };

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

          // UPDATE PAYMENT
          const paymentParams: any = {
            status: ItemStatuses[zaiItem.status],
            zaiUpdatedAt: zaiItem.updated_at,
            updatedAt: zaiItem.updated_at,
          };

          if (zaiItem?.state === 'completed') {
            paymentParams.paidAt = new Date().toISOString();
          }

          try {
            await updateRecord(
              TABLE_PAYMENTS ?? '',
              { id: zaiItem.id },
              paymentParams
            );
          } catch (err: any) {
            console.log('ERROR update payment record', err);
            throw new Error(err.message);
          }
        }
      }
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Payment cron job executed successfully' }),
  };
};
