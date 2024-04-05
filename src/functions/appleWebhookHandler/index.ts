const { TABLE_BILLING, TABLE_USER, ENV } = process.env;
const IS_PROD = ENV === 'prod' || ENV === 'production';
import { DateTime } from 'luxon';
import {
  decodeRenewalInfo,
  decodeTransaction,
  JWSTransactionDecodedPayload,
  DecodedNotificationPayload,
  JWSRenewalInfoDecodedPayload,
  NotificationType,
  NotificationSubtype,
} from 'app-store-server-api';

import { getRecord } from '/opt/dynamoDB';

import { DynamoDBClient, ReturnValue } from '@aws-sdk/client-dynamodb';
import { UpdateCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const DdbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DdbClient);

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

const isSubscriptionExtended = (
  billing: any,
  transactionInfo: JWSTransactionDecodedPayload
) =>
  !billing.expiresAt ||
  (transactionInfo.expiresDate &&
    DateTime.fromMillis(transactionInfo.expiresDate) >
      DateTime.fromISO(billing.expiresAt));

const setRenewedBillingParams = (
  transactionInfo: JWSTransactionDecodedPayload,
  renewalInfo: JWSRenewalInfoDecodedPayload,
  status: SubscriptionStatus
) => {
  if (transactionInfo.expiresDate) {
    const expiresAtGrace = IS_PROD ? { days: 3 } : { minutes: 5 };
    let params: any = {
      customerId: transactionInfo.appAccountToken,
      autoRenewProductId: renewalInfo.autoRenewProductId,
      productId: renewalInfo.productId,
      paymentProvider: 'APP_STORE',
      plan: renewalInfo?.productId?.includes('standard')
        ? 'standard'
        : 'premium',
      expiresAt: DateTime.fromMillis(transactionInfo.expiresDate)
        .plus(expiresAtGrace)
        .toISO(),
      updatedAt: DateTime.now().toISO(),
    };

    if (renewalInfo.gracePeriodExpiresDate) {
      params = {
        ...params,
        expiresAt: DateTime.fromMillis(
          renewalInfo.gracePeriodExpiresDate
        ).toISO(),
      };
    }

    if (status) {
      params = {
        ...params,
        status,
      };
    }

    return params;
  }
};

const updateUser = async (id: string, updateParams: Record<string, any>) => {
  let updateExpression = 'set';
  const expressionAttributeValues: Record<string, any> = {};
  const expressionAttributeNames: Record<string, any> = {};
  let i = 0;

  Object.keys(updateParams).forEach((key) => {
    if (i === 0) {
      updateExpression = `${updateExpression} #${key} = :${key}`;
    } else {
      updateExpression = `${updateExpression}, #${key} = :${key}`;
    }

    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = updateParams[key];
    i += 1;
  });

  const params = {
    TableName: TABLE_USER,
    Key: {
      id,
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: ReturnValue.ALL_NEW,
    ConditionExpression: 'attribute_exists(id)',
  };

  const command = new UpdateCommand(params);
  const data = await docClient.send(command);
  return data.Attributes;
};

const updateBilling = async (id: string, updateParams: Record<string, any>) => {
  let updateExpression = 'set';
  const expressionAttributeValues: Record<string, any> = {};
  const expressionAttributeNames: Record<string, any> = {};
  let i = 0;

  Object.keys(updateParams).forEach((key) => {
    if (i === 0) {
      updateExpression = `${updateExpression} #${key} = :${key}`;
    } else {
      updateExpression = `${updateExpression}, #${key} = :${key}`;
    }

    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = updateParams[key];
    i += 1;
  });

  const params = {
    TableName: TABLE_BILLING,
    Key: {
      id,
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: ReturnValue.ALL_NEW,
    ConditionExpression: 'attribute_exists(id)',
  };

  const command = new UpdateCommand(params);
  const data = await docClient.send(command);
  return data.Attributes;
};

interface AppleWebhookHandlerEvent {
  webhookEvent: DecodedNotificationPayload;
}

export const handler = async (event: AppleWebhookHandlerEvent) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  const {
    notificationType,
    subtype,
    data: { signedTransactionInfo, signedRenewalInfo },
  } = event.webhookEvent;

  const transactionInfo = await decodeTransaction(signedTransactionInfo);
  const renewalInfo = await decodeRenewalInfo(signedRenewalInfo);
  console.log('notificationType: ', notificationType);
  console.log('subtype: ', subtype);
  console.log('transactionInfo: ', transactionInfo);
  console.log('renewalInfo: ', renewalInfo);

  if (!transactionInfo) {
    console.log('No transaction info - skipping');
    return;
  }

  // skip if test purchase in prod and vice versa
  const isTestPurchase = transactionInfo?.environment === 'Sandbox';
  if (IS_PROD && isTestPurchase) {
    console.log('TEST PURCHASE IN PROD ENV');
  } else if (!IS_PROD && !isTestPurchase) {
    console.log('PROD PURCHASE IN TEST ENV');
  }

  const userId = transactionInfo?.appAccountToken;
  let user;
  try {
    user = await getRecord(TABLE_USER ?? '', { id: userId });
    console.log('current user: ', user);
  } catch (err: any) {
    console.log('ERROR get user: ', err);
    throw new Error(err.message);
  }

  let billing;
  if (user) {
    try {
      billing = await getRecord(TABLE_BILLING ?? '', {
        id: user.billingId,
      });
    } catch (err: any) {
      console.log('ERROR get user: ', err);
      throw new Error(err.message);
    }
  }

  let billingParams;
  // https://developer.apple.com/documentation/appstoreservernotifications/notificationtype
  switch (notificationType) {
    // user made a change to their subscription plan
    case NotificationType.DidChangeRenewalPref:
      // user upgraded their subscription. The upgrade goes into effect immediately, starting a new billing period
      //if (subtype === 'UPGRADE') {
      //}

      // user downgraded or cross-graded their subscription. Downgrades take effect at the next renewal and don’t affect the currently active plan.
      //if (subtype === 'DOWNGRADE') {
      //}

      // the user changed their renewal preference back to the current subscription, effectively canceling a downgrade.
      //if (!subtype) {
      //}

      billingParams = setRenewedBillingParams(
        transactionInfo,
        renewalInfo,
        SubscriptionStatus.ACTIVE
      );
      break;

    // indicates that the user made a change to the subscription renewal status.
    case NotificationType.DidChangeRenewalStatus:
      // the user re-enabled subscription auto-renewal.
      //if (subtype === 'AUTO_RENEW_ENABLED') {
      //}

      // the user disabled subscription auto-renewal, or the App Store disabled subscription auto-renewal after the user requested a refund.
      //if (subtype === 'AUTO_RENEW_DISABLED') {
      //}

      billingParams = setRenewedBillingParams(
        transactionInfo,
        renewalInfo,
        SubscriptionStatus.ACTIVE
      );
      //TODO
      break;

    // indicates that the subscription successfully renewed.
    case NotificationType.DidRenew:
      // the expired subscription that previously failed to renew has successfully renewed
      //if (subtype === 'BILLING_RECOVERY') {
      //}

      // the active subscription has successfully auto-renewed for a new transaction period.
      //if (!subtype) {
      //}

      // Provide the customer with access to the subscription’s content or service.
      billingParams = setRenewedBillingParams(
        transactionInfo,
        renewalInfo,
        SubscriptionStatus.ACTIVE
      );
      break;

    // subscription failed to renew due to a billing issue
    case NotificationType.DidFailToRenew:
      // continue to provide service through the grace period
      if (subtype === NotificationSubtype.GracePeriod) {
        billingParams = setRenewedBillingParams(
          transactionInfo,
          renewalInfo,
          SubscriptionStatus.GRACE_PERIOD
        );
      }

      //the subscription isn’t in a grace period and you can stop providing the subscription service.
      if (!subtype) {
        billingParams = setRenewedBillingParams(
          transactionInfo,
          renewalInfo,
          SubscriptionStatus.UN_PAID
        );
      }

      break;

    case NotificationType.ConsumptionRequest:
      // A notification type that indicates that the customer initiated a refund request for a consumable in-app purchase
      break;

    // indicates that a subscription expired
    case NotificationType.Expired:
      // the subscription expired after the user disabled subscription renewal
      //if (subtype === 'VOLUNTARY') {
      //}

      // the subscription expired because the billing retry period ended without a successful billing transaction'
      //if (subtype === 'BILLING_RETRY') {
      //}

      // the subscription expired because the user didn’t consent to a price increase that requires user consent
      //if (subtype === 'PRICE_INCREASE') {
      //}

      // the subscription expired because the product wasn’t available for purchase at the time the subscription attempted to renew.
      //if (subtype === 'PRODUCT_NOT_FOR_SALE') {
      //}

      // indicates that the subscription expired for some other reason
      //if (!subtype) {
      //}

      billingParams = setRenewedBillingParams(
        transactionInfo,
        renewalInfo,
        SubscriptionStatus.CANCELLED
      );
      break;

    // indicates that the billing grace period has ended without renewing the subscription
    case NotificationType.GracePeriodExpired:
      // Inform the user that there may be an issue with their billing information
      // The App Store continues to retry billing for 60 days, or until the user resolves their billing issue or cancels their subscription, whichever comes first

      // turn off access to the service or content.
      billingParams = setRenewedBillingParams(
        transactionInfo,
        renewalInfo,
        SubscriptionStatus.UN_PAID
      );
      break;

    // indicates that the user redeemed a promotional offer or offer code.
    case NotificationType.OfferRedeemed:
      // If the subtype is INITIAL_BUY, the user redeemed the offer for a first-time purchase
      // If the subtype is RESUBSCRIBE, the user redeemed an offer to resubscribe to an inactive subscription
      // If the subtype is UPGRADE, the user redeemed an offer to upgrade their active subscription, which goes into effect immediately
      // If the subtype is DOWNGRADE, the user redeemed an offer to downgrade their active subscription, which goes into effect at the next renewal date
      //  If the user redeemed an offer for their active subscription, you receive an OFFER_REDEEMED notification type without a subtype
      //TODO
      billingParams = setRenewedBillingParams(
        transactionInfo,
        renewalInfo,
        SubscriptionStatus.ACTIVE
      );
      break;

    case NotificationType.Refund:
      //A notification type that indicates that the App Store successfully refunded a transaction for a consumable in-app purchase, a non-consumable in-app purchase, an auto-renewable subscription, or a non-renewing subscription.
      // TODO
      billingParams = setRenewedBillingParams(
        transactionInfo,
        renewalInfo,
        SubscriptionStatus.REFUNDED
      );
      break;

    case NotificationType.RefundDeclined:
      //A notification type that indicates the App Store declined a refund request initiated by the app developer using any of the following methods:
      //TODO
      billingParams = setRenewedBillingParams(
        transactionInfo,
        renewalInfo,
        SubscriptionStatus.ACTIVE
      );
      break;

    // indicates the App Store extended the subscription renewal date for a specific subscription
    case NotificationType.RenewalExtended:
      billingParams = setRenewedBillingParams(
        transactionInfo,
        renewalInfo,
        SubscriptionStatus.ACTIVE
      );
      break;

    // indicates that an in-app purchase the user was entitled to through Family Sharing is no longer available through sharing
    case NotificationType.Revoke:
      billingParams = setRenewedBillingParams(
        transactionInfo,
        renewalInfo,
        SubscriptionStatus.CANCELLED
      );
      break;

    // indicates that the user subscribed to a product
    case NotificationType.Subscribed:
      billingParams = setRenewedBillingParams(
        transactionInfo,
        renewalInfo,
        SubscriptionStatus.ACTIVE
      );
      // the user either purchased or received access through Family Sharing to the subscription for the first time
      //if (subtype === 'INITIAL_BUY') {
      //}

      // the user resubscribed or received access through Family Sharing to the same subscription or to another subscription within the same subscription group.
      //if (subtype === 'RESUBSCRIBE') {
      //}

      if (transactionInfo?.offerType) {
        billingParams = {
          ...billingParams,
          trialUsed: true,
        };
      }
      break;

    // the App Store server sends when you request it by calling the Request a Test Notification endpoint
    //case 'TEST':
    //  break;

    default:
      console.log('notificationType not handled: ', notificationType);
      break;
  }

  if (billingParams) {
    // update billing for user
    try {
      console.log('billingParams: ', billingParams);
      const updatedBilling = await updateBilling(billing.id, billingParams);
      console.log('updatedBilling: ', updatedBilling);
    } catch (err: any) {
      console.log('ERROR update billing: ', err.message);
      throw new Error(err.message);
    }

    // update user if hasn't completed onboarding
    if (isSubscriptionExtended(billing, transactionInfo)) {
      if (user && user?.onboardingStatus !== 'COMPLETED') {
        try {
          const userParams: any = {
            onboardingStatus: 'COMPLETED',
            updatedAt: new Date().toISOString(),
          };

          await updateUser(user.id, userParams);
        } catch (err: any) {
          console.log('ERROR get user: ', err.message);
        }
      }
    }
  }
};
