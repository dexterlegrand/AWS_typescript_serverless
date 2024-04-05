const { TABLE_BILLING, TABLE_TRANSACTION, TABLE_USER, ENV, GOOGLE_BUNDLE_ID } =
  process.env;
import { GOOGLE_KEY_FILE } from '/opt/google';
import { DateTime } from 'luxon';

import { getRecord, updateRecord } from '/opt/dynamoDB';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  QueryCommand,
  DynamoDBDocumentClient,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';

const DdbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DdbClient);
const IS_PROD = ENV === 'prod' || ENV === 'production';

import * as androidPublisher from '@googleapis/androidpublisher';

const jwtClient = new androidPublisher.auth.JWT(
  GOOGLE_KEY_FILE.client_email,
  undefined,
  GOOGLE_KEY_FILE.private_key,
  ['https://www.googleapis.com/auth/androidpublisher'],
  undefined
);

enum SubscriptionStatus {
  INCOMPLETE = 'INCOMPLETE',
  INCOMPLETE_EXPIRED = 'INCOMPLETE_EXPIRED',
  TRIALING = 'TRIALING',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELLED = 'CANCELLED',
  UN_PAID = 'UN_PAID',
  GRACE_PERIOD = 'GRACE_PERIOD',
  EXPIRED = 'EXPIRED',
  PAUSED = 'PAUSED',
  REFUNDED = 'REFUNDED',
}

/**
 * Retrieves billing by user
 *
 * @param userId
 */
const billingByUser = async (userId: string): Promise<any> => {
  const params = {
    TableName: TABLE_BILLING,
    IndexName: 'billingByUser',
    KeyConditionExpression: '#userId = :userId',
    ExpressionAttributeNames: { '#userId': 'userId' },
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  };

  const command = new QueryCommand(params);
  const userData = await docClient.send(command);
  return userData.Items?.[0] || null;
};

/**
 * Query transaction by purchaseToken
 * @param purchaseToken
 */
const queryTransactions = async (purchaseToken: string): Promise<any> => {
  const params = {
    TableName: TABLE_TRANSACTION,
    IndexName: 'transactionByPurchaseToken',
    KeyConditionExpression: '#purchaseToken = :purchaseToken',
    ExpressionAttributeNames: { '#purchaseToken': 'purchaseToken' },
    ExpressionAttributeValues: {
      ':purchaseToken': purchaseToken,
    },
  };

  const command = new QueryCommand(params);
  const data = await docClient.send(command);
  console.log('queryTransactions data: ', data);
  return data.Items;
};

const setRenewedBillingParams = (
  subscription: any,
  status: SubscriptionStatus
) => {
  const expiresAtGrace = IS_PROD ? { days: 3 } : { minutes: 5 };

  const lineItem = subscription?.lineItems?.[0];
  const params: any = {
    productId: lineItem.productId,
    paymentProvider: 'GOOGLE_PLAY',
    status,
    plan: lineItem.productId?.includes('standard') ? 'standard' : 'premium',
    expiresAt: DateTime.fromISO(lineItem.expiryTime)
      .plus(expiresAtGrace)
      .toISO(),
    updatedAt: new Date().toISOString(),
  };

  return params;
};

const isSubscriptionExtended = (billing: any, lineItem: any) => {
  return (
    !lineItem.expiryTime ||
    (billing.expiresAt &&
      DateTime.fromISO(lineItem.expiryTime) >
        DateTime.fromISO(billing.expiresAt))
  );
};

const createTransaction = async (data: any) => {
  const params = {
    Item: data,
    TableName: TABLE_TRANSACTION,
    ConditionExpression: 'attribute_not_exists(id)',
  };
  const command = new PutCommand(params);
  return docClient.send(command);
};

interface GoogleWebhookHandlerEvent {
  webhookEvent: any;
}

export const handler = async (event: GoogleWebhookHandlerEvent) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  // const purchaseToken = message.data.subscriptionNotification.purchaseToken
  // const notificationType = message.data.subscriptionNotification.notificationType
  const { notificationType, purchaseToken, subscriptionId } =
    event.webhookEvent;

  console.log('notificationType: ', notificationType);
  console.log('purchaseToken: ', purchaseToken);
  console.log('subscriptionId: ', subscriptionId);

  await jwtClient.authorize();

  //let androidAuthClient;
  //try {
  //  androidAuthClient = await androidAuth.getClient();
  //  console.log('androidAuthClient: ', androidAuthClient);
  //} catch (err: any) {
  //  console.log('ERROR get androidAuth.getClient: ', err);
  //  throw new Error(err.message);
  //}

  let androidPublisherClient;
  try {
    androidPublisherClient = await androidPublisher.androidpublisher({
      version: 'v3',
      auth: jwtClient,
    });
  } catch (err: any) {
    console.log('ERROR get androidPublisher.getClient: ', err);
    // throw new Error(err.message);
  }

  let subscriptionData;
  try {
    const subscriptionResponse =
      await androidPublisherClient?.purchases.subscriptionsv2.get({
        packageName: GOOGLE_BUNDLE_ID,
        token: purchaseToken,
      });

    subscriptionData = subscriptionResponse?.data;
    console.log('subscription: ', JSON.stringify(subscriptionData));
  } catch (err: any) {
    console.log(
      'ERROR androidPublisherClient.purchases.subscriptions.get: ',
      err
    );
    // throw new Error(err.message);
  }

  const lineItem: any = subscriptionData?.lineItems?.[0];
  console.log('lineItem: ', lineItem);

  // skip if test purchase in prod and vice versa
  const isTestPurchase = subscriptionData?.testPurchase;
  if (IS_PROD && isTestPurchase) {
    console.log('TEST PURCHASE IN PROD ENV');
    // return;
  } else if (!IS_PROD && !isTestPurchase) {
    console.log('PROD PURCHASE IN TEST ENV');
    // return;
  }

  let transaction;
  try {
    const transactionData = await queryTransactions(purchaseToken);
    transaction = transactionData?.[0];
    console.log('transaction: ', transaction);
  } catch (err: any) {
    console.log('ERROR get transaction: ', err);
  }

  if (!transaction) {
    console.log(
      "NO TRANSACTION FOUND FOR PURCHASE TOKEN TO LINK TO USER - BILLING WON'T BE UPDATED"
    );
  }

  // https://developer.android.com/google/play/billing/subscriptions
  let billingParams;
  //TODO: trial used
  switch (notificationType) {
    case 1:
    case 2:
    case 4:
      billingParams = setRenewedBillingParams(
        subscriptionData,
        SubscriptionStatus.ACTIVE
      );
      //Restore the user’s access to your content
      //Show them a recovery message
      // If you query for a subscription after receiving this notification, the expiryTime is now set to a timestamp in the future
      if (notificationType === 1) {
        console.log('SUBSCRIPTION_RECOVERED');
      }

      if (notificationType === 2) {
        console.log('SUBSCRIPTION_RENEWED');
      }

      if (notificationType === 4) {
        // You can use the linkedPurchaseToken to look up the old subscription and identify the existing user account so that you can associate the new purchase with the same account.
        //After the plan change or resignup, we also require that you acknowledge the new subscription purchase
        console.log('SUBSCRIPTION_PURCHASED');

        // trial used
        if (lineItem?.offerDetails?.offerId) {
          billingParams = {
            ...billingParams,
            trialUsed: true,
          };
        }
      }

      //TODO: subscriptionState https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.subscriptionsv2#subscriptionstate
      if (subscriptionData?.subscriptionState === 'SUBSCRIPTION_STATE_ACTIVE') {
        // create transaction if doesn't exist without userId
      } else {
        console.log('NOTE: subscriptionState NOT HANDLED');
      }

      break;

    case 3:
      // retain access to the content until the end of the current billing cycle. When the billing cycle ends, access is revoked
      // expiryTime contains the date when the user should lose access to the subscription. If expiryTime is in the past, then the user loses entitlement immediately
      //Otherwise, the user should retain entitlement until it is expired
      //"Your subscription will expire on _somedate. Your app can also deep link to the Google Play Store to let users restore their subscription.
      //When you query for the subscription that was cancelled in this way, the returned expiryTime is set to a past timestamp:
      billingParams = setRenewedBillingParams(
        subscriptionData,
        SubscriptionStatus.CANCELLED
      );
      console.log('SUBSCRIPTION_CANCELED');
      break;

    case 5:
      //Block the user’s access to your content
      //Show a message notifying them that their payment has failed
      //Route them to fix their payment methods on Google Play Store
      //Recommended — View the updated status of the subscription using the purchase token to update the expiry time etc.
      //you should block access to your content or service
      console.log('SUBSCRIPTION_ON_HOLD');
      billingParams = setRenewedBillingParams(
        subscriptionData,
        SubscriptionStatus.EXPIRED
      );
      break;

    case 6:
      console.log('SUBSCRIPTION_IN_GRACE_PERIOD');
      billingParams = setRenewedBillingParams(
        subscriptionData,
        SubscriptionStatus.GRACE_PERIOD
      );
      break;

    case 7:
      billingParams = setRenewedBillingParams(
        subscriptionData,
        SubscriptionStatus.ACTIVE
      );
      console.log('SUBSCRIPTION_RESTARTED');
      break;

    case 8:
      billingParams = setRenewedBillingParams(
        subscriptionData,
        SubscriptionStatus.ACTIVE
      );
      console.log('SUBSCRIPTION_PRICE_CHANGE_CONFIRMED');
      break;

    case 9:
      console.log('SUBSCRIPTION_DEFERRED');
      billingParams = setRenewedBillingParams(
        subscriptionData,
        SubscriptionStatus.ACTIVE
      );
      break;

    case 10:
      console.log('SUBSCRIPTION_PAUSED');
      billingParams = setRenewedBillingParams(
        subscriptionData,
        SubscriptionStatus.PAUSED
      );
      break;

    case 11:
      console.log('SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED');
      billingParams = setRenewedBillingParams(
        subscriptionData,
        SubscriptionStatus.PAUSED
      );
      break;

    case 12:
      // revoke entitlement from the user immediately
      console.log('SUBSCRIPTION_REVOKED');
      billingParams = setRenewedBillingParams(
        subscriptionData,
        SubscriptionStatus.EXPIRED
      );
      break;

    case 13:
      // the user should lose access to the subscription
      // query the Google Play Developer API to get the latest subscription state
      billingParams = setRenewedBillingParams(
        subscriptionData,
        SubscriptionStatus.EXPIRED
      );
      console.log('SUBSCRIPTION_EXPIRED');
      break;
  }

  const createdAt = new Date().toISOString();
  if (!transaction) {
    let existingTransaction = false;

    const transactionData = {
      id: purchaseToken,
      purchaseToken,
      expiresAt: lineItem?.expiryTime,
      createdAt,
      updatedAt: createdAt,
    };
    try {
      await createTransaction(transactionData);
      transaction = transactionData;
      console.log('new transaction record: ', transactionData);
    } catch (err: any) {
      console.log('ERROR create transaction: ', JSON.stringify(err));

      if (err.code === 'ConditionalCheckFailedException') {
        existingTransaction = true;
      }
    }

    if (existingTransaction) {
      const transactionData = {
        expiresAt: lineItem?.expiryTime,
        updatedAt: createdAt,
      };

      try {
        transaction = await updateRecord(
          TABLE_TRANSACTION ?? '',
          { id: purchaseToken },
          transactionData
        );
        console.log('updated transaction record: ', transactionData);
      } catch (err: any) {
        console.log('ERROR update transaction: ', err);
      }
    }
  }

  // update existing transaction record
  else {
    const transactionParams = {
      expiresAt: lineItem?.expiryTime,
      updatedAt: createdAt,
    };

    try {
      transaction = await updateRecord(
        TABLE_TRANSACTION ?? '',
        { id: purchaseToken },
        transactionParams
      );
      console.log('updated transaction record: ', transactionParams);
    } catch (err: any) {
      console.log('ERROR update transaction: ', err);
    }
  }

  // update billing
  if (billingParams && transaction?.userId) {
    let user;
    try {
      user = await getRecord(TABLE_USER ?? '', {
        id: transaction?.userId,
      });
      console.log('current user: ', user);
    } catch (err: any) {
      console.log('ERROR get user: ', err);
      throw new Error(err.message);
    }

    if (user) {
      let billing;
      try {
        billing = await billingByUser(user?.id);
        console.log('billing: ', billing);
      } catch (err: any) {
        console.log('ERROR get billing: ', err);
        throw new Error(err.message);
      }

      // update billing for user
      if (billing) {
        try {
          const keys = {
            id: billing.id,
          };

          console.log('billingParams: ', billingParams);
          const updatedBilling = await updateRecord(
            TABLE_BILLING ?? '',
            keys,
            billingParams
          );
          console.log('updatedBilling: ', updatedBilling);
        } catch (err: any) {
          console.log('ERROR update billing: ', err.message);
          throw new Error(err.message);
        }

        // update user if hasn't completed onboarding
        if (isSubscriptionExtended(billing, lineItem)) {
          if (user && user?.onboardingStatus !== 'COMPLETED') {
            try {
              const userKeys = {
                id: user.id,
              };

              const userParams: any = {
                onboardingStatus: 'COMPLETED',
                updatedAt: new Date().toISOString(),
              };

              const updatedUser = await updateRecord(
                TABLE_USER ?? '',
                userKeys,
                userParams
              );
              console.log('updatedUser: ', updatedUser);
            } catch (err: any) {
              console.log('ERROR get user: ', err.message);
            }
          }
        }

        if (
          lineItem?.acknowledgementState === 'ACKNOWLEDGEMENT_STATE_PENDING'
        ) {
          // Acknowledge subscription purchase
          let acknowledgeResponse;
          try {
            // @ts-ignore
            acknowledgeResponse =
              await androidPublisherClient?.purchases.subscriptions.acknowledge(
                {
                  packageName: GOOGLE_BUNDLE_ID,
                  subscriptionId: lineItem?.productId,
                  token: purchaseToken,
                }
              );
            console.log('acknowledge response: ', acknowledgeResponse);
          } catch (err: any) {
            console.log(
              'ERROR get androidPublisher.acknowledgeResponse: ',
              err
            );
            throw new Error(err.message);
          }
        }
      }
    }
  }
};
