const {
  TABLE_BILLING,
  TABLE_TRANSACTION,
  TABLE_USER,
  ENV,
  APPLE_BUNDLE_ID,
  APPLE_CONNECT_KEY,
  APPLE_CONNECT_KEY_ID,
  APPLE_CONNECT_ISSUER_ID,
  GOOGLE_BUNDLE_ID,
} = process.env;
import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import {
  AppStoreServerAPI,
  Environment,
  decodeRenewalInfo,
  decodeTransaction,
} from 'app-store-server-api';
import { GOOGLE_KEY_FILE } from '/opt/google';

const appStoreConnectionEnv =
  ENV === 'prod' || ENV === 'production'
    ? Environment.Production
    : Environment.Sandbox;
const reverseAppStoreConnectionEnv =
  ENV === 'prod' || ENV === 'production'
    ? Environment.Sandbox
    : Environment.Production;

let api = new AppStoreServerAPI(
  APPLE_CONNECT_KEY ?? '',
  APPLE_CONNECT_KEY_ID ?? '',
  APPLE_CONNECT_ISSUER_ID ?? '',
  APPLE_BUNDLE_ID ?? '',
  appStoreConnectionEnv
);

import { createRecord, getRecord, updateRecord } from '/opt/dynamoDB';
import { AppSyncResolverHandler } from 'aws-lambda';

import { DateTime } from 'luxon';

import * as androidPublisher from '@googleapis/androidpublisher';

const jwtClient = new androidPublisher.auth.JWT(
  GOOGLE_KEY_FILE.client_email,
  '',
  GOOGLE_KEY_FILE.private_key,
  ['https://www.googleapis.com/auth/androidpublisher'],
  ''
);

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  console.log('EVENT received: ', JSON.stringify(ctx));
  const { sub } = ctx.identity as AppSyncIdentityCognito;
  const { receipt, service } = ctx.arguments.input;

  let billing;
  if (service === 'APP_STORE') {
    let userId;
    let transactionInfo;
    let renewalInfo;
    let response;
    let subscriptionStatusError = false;

    try {
      response = await api.getSubscriptionStatuses(receipt);
      console.log('api.getSubscriptionStatuses: ', JSON.stringify(response));
    } catch (err: any) {
      console.log(
        `ERROR api.getSubscriptionStatuses for env ${Environment.Sandbox}:`,
        err
      );
      //throw new Error(err.message);

      subscriptionStatusError = true;
    }

    // for handling testflight => Sandbox in production environment
    if (subscriptionStatusError) {
      try {
        api = new AppStoreServerAPI(
          APPLE_CONNECT_KEY ?? '',
          APPLE_CONNECT_KEY_ID ?? '',
          APPLE_CONNECT_ISSUER_ID ?? '',
          APPLE_BUNDLE_ID ?? '',
          reverseAppStoreConnectionEnv
        );

        response = await api.getSubscriptionStatuses(receipt);
        console.log('api.getSubscriptionStatuses: ', JSON.stringify(response));
      } catch (err: any) {
        console.log(
          `ERROR api.getSubscriptionStatuses for ${appStoreConnectionEnv} and ${reverseAppStoreConnectionEnv}: `,
          err
        );
        throw new Error(err.message);
      }
    }

    if (response?.data?.length && response.data.length > 0) {
      const matchedTransactionData = response?.data?.find((transactions) =>
        transactions?.lastTransactions?.find(
          (item) => item.originalTransactionId === receipt
        )
      );
      console.log('matchedTransactionData: ', matchedTransactionData);

      if (matchedTransactionData) {
        const matchedTransaction = matchedTransactionData.lastTransactions.find(
          (item) => item.originalTransactionId === receipt
        );

        if (matchedTransaction) {
          transactionInfo = await decodeTransaction(
            matchedTransaction.signedTransactionInfo
          );
          console.log('transactionInfo: ', transactionInfo);
          renewalInfo = await decodeRenewalInfo(
            matchedTransaction.signedRenewalInfo
          );
          console.log('renewalInfo: ', renewalInfo);
          userId = transactionInfo?.appAccountToken;
        }
      }
    }

    if (!userId) {
      throw new Error('No user with transaction - Please contact support');
    }

    if (
      transactionInfo &&
      transactionInfo?.expiresDate &&
      DateTime.fromMillis(transactionInfo.expiresDate) > DateTime.now()
    ) {
      console.log('VALID PURCHASE');
      console.log(
        'transactionInfo.expiresDate: ',
        DateTime.fromMillis(transactionInfo.expiresDate).toISO()
      );
      console.log('datenow: ', new Date().toISOString());
      let user;
      try {
        user = await getRecord(TABLE_USER ?? '', { id: userId });
        console.log('current user: ', user);
      } catch (err: any) {
        console.log('ERROR get user: ', err);
        throw new Error(err.message);
      }

      try {
        billing = await getRecord(TABLE_BILLING ?? '', {
          id: user.billingId,
        });
      } catch (err: any) {
        console.log('ERROR get billing: ', err);
        throw new Error(err.message);
      }

      if (
        !billing.expiresAt ||
        DateTime.fromMillis(transactionInfo.expiresDate) >
          DateTime.fromISO(billing.expiresAt)
      ) {
        // update user's onboarding status
        if (user && user?.onboardingStatus !== 'COMPLETED') {
          try {
            const userKeys = {
              id: user.id,
            };

            const userParams: any = {
              onboardingStatus: 'COMPLETED',
              updatedAt: new Date().toISOString(),
            };

            await updateRecord(TABLE_USER ?? '', userKeys, userParams);
          } catch (err: any) {
            console.log('ERROR get user: ', err.message);
          }
        }

        // update billing with latest transaction info
        try {
          const keys = {
            id: billing.id,
          };

          let billingParams: any = {
            customerId: transactionInfo.appAccountToken,
            productId: renewalInfo?.productId,
            paymentProvider: 'APP_STORE',
            status: 'ACTIVE',
            plan: renewalInfo?.productId?.includes('standard')
              ? 'standard'
              : 'premium',
            expiresAt: DateTime.fromMillis(transactionInfo.expiresDate).toISO(),
            updatedAt: new Date().toISOString(),
          };

          if (!billing?.trialUsed) {
            billingParams = {
              ...billingParams,
              trialUsed: true,
            };
          }

          console.log('billingParams: ', billingParams);
          const updatedBilling = await updateRecord(
            TABLE_BILLING ?? '',
            keys,
            billingParams
          );
          console.log('updatedBilling: ', updatedBilling);

          if (updatedBilling?.userId === sub) {
            return updatedBilling;
          } else {
            console.log('updatedBilling?.userId not equal to sub');
            return null;
          }
        } catch (err: any) {
          console.log('ERROR update billing: ', err.message);
          throw new Error(err.message);
        }
      }
    }
  } else if (service === 'GOOGLE_PLAY') {
    const data = JSON.parse(receipt);
    await jwtClient.authorize();
    // android iap
    let androidPublisherClient;
    try {
      androidPublisherClient = await androidPublisher.androidpublisher({
        version: 'v3',
        auth: jwtClient,
      });
    } catch (err: any) {
      console.log('ERROR get androidPublisher.getClient: ', err);
      throw new Error(err.message);
    }

    let subscriptionData;
    try {
      const subscriptionResponse =
        await androidPublisherClient.purchases.subscriptionsv2.get({
          packageName: GOOGLE_BUNDLE_ID,
          //subscriptionId: data.productId,
          token: data.purchaseToken,
        });

      subscriptionData = subscriptionResponse.data;
      console.log('subscription: ', JSON.stringify(subscriptionData));
    } catch (err: any) {
      console.log(
        'ERROR androidPublisherClient.purchases.subscriptions.get: ',
        err
      );
      // throw new Error(err.message);
    }

    const lineItem: any = subscriptionData?.lineItems?.[0];
    if (subscriptionData) {
      const createdAt = new Date().toISOString();
      const transactionData = {
        id: data.purchaseToken,
        userId: sub,
        purchaseToken: data.purchaseToken,
        expiresAt: lineItem?.expiryTime,
        createdAt,
        updatedAt: createdAt,
      };

      try {
        await createRecord(TABLE_TRANSACTION ?? '', transactionData);
        console.log('transaction record: ', transactionData);
      } catch (err: any) {
        console.log('ERROR create TABLE_TRANSACTION: ', err);
      }
    }

    if (subscriptionData?.subscriptionState === 'SUBSCRIPTION_STATE_ACTIVE') {
      let user;
      try {
        user = await getRecord(TABLE_USER ?? '', { id: sub });
        console.log('current user: ', user);
      } catch (err: any) {
        console.log('ERROR get user: ', err);
        throw new Error(err.message);
      }

      let billing;
      try {
        billing = await getRecord(TABLE_BILLING ?? '', {
          id: user.billingId,
        });
      } catch (err: any) {
        console.log('ERROR get billing: ', err);
        throw new Error(err.message);
      }

      // update user billing & grant access
      if (
        lineItem?.expiryTime &&
        (!billing.expiresAt ||
          DateTime.fromISO(lineItem?.expiryTime) >
            DateTime.fromISO(billing.expiresAt))
      ) {
        //TODO: something with purchase token to link user?

        // update user's onboarding status
        if (user?.onboardingStatus !== 'COMPLETED') {
          try {
            const userKeys = {
              id: user.id,
            };

            const userParams: any = {
              onboardingStatus: 'COMPLETED',
              updatedAt: new Date().toISOString(),
            };

            await updateRecord(TABLE_USER ?? '', userKeys, userParams);
          } catch (err: any) {
            console.log('ERROR get user: ', err.message);
          }
        }

        // update billing with latest transaction info
        let updatedBilling;
        try {
          const keys = {
            id: billing.id,
          };

          let billingParams: any = {
            //customerId: transactionInfo.appAccountToken,
            productId: lineItem.productId,
            paymentProvider: 'GOOGLE_PLAY',
            plan: lineItem.productId?.includes('standard')
              ? 'standard'
              : 'premium',
            expiresAt: lineItem.expiryTime,
            updatedAt: new Date().toISOString(),
          };

          if (!billing?.trialUsed) {
            billingParams = {
              ...billingParams,
              trialUsed: true,
            };
          }

          console.log('billingParams: ', billingParams);
          updatedBilling = await updateRecord(
            TABLE_BILLING ?? '',
            keys,
            billingParams
          );
          console.log('updatedBilling: ', updatedBilling);
        } catch (err: any) {
          console.log('ERROR update billing: ', err.message);
          throw new Error(err.message);
        }

        if (lineItem.acknowledgementState === 'ACKNOWLEDGEMENT_STATE_PENDING') {
          // Acknowledge subscription purchase
          let acknowledgeResponse;
          try {
            //@ts-ignore
            acknowledgeResponse =
              await androidPublisherClient.purchases.subscriptions.acknowledge({
                packageName: GOOGLE_BUNDLE_ID,
                subscriptionId: lineItem.productId,
                token: receipt,
              });
            console.log(
              'Google play acknowledge response: ',
              acknowledgeResponse
            );
          } catch (err: any) {
            console.log(
              'ERROR get androidPublisher.acknowledgeResponse: ',
              err
            );
            throw new Error(err.message);
          }
        }

        if (updatedBilling?.userId === sub) {
          return updatedBilling;
        } else {
          console.log('');
          return null;
        }
      }
    }
  }

  return billing;
};
