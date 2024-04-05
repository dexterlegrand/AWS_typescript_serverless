const {
  ENV,
  REGION,
  TABLE_PAYMENT,
  TABLE_PAYMENT_METHODS,
  TABLE_ENTITY,
  TABLE_ENTITY_USER,
} = process.env;
const isProd = ENV === 'prod';
import { getRecord } from '/opt/dynamoDB';
import {
  createZaiAuthToken,
  CreateZaiAuthTokenResponse,
  getZaiItem,
  isAuthTokenExpired,
  makeZaiPayment,
  validatePaymentMethod,
} from '/opt/zai';
import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { AppSyncResolverHandler } from 'aws-lambda';

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

export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  console.log(`EVENT: ${JSON.stringify(ctx)}`);
  const { sub, sourceIp } = ctx.identity as AppSyncIdentityCognito;
  const { input } = ctx.arguments;
  const { id, paymentMethodId } = input;

  const ip = sourceIp[0];

  // get payment
  let payment;
  try {
    payment = await getRecord(TABLE_PAYMENT ?? '', {
      id,
    });
  } catch (err: any) {
    console.log('ERROR get payment: ', err);
    throw new Error(err.message);
  }

  // get entity user
  let entityUser;
  try {
    entityUser = await getRecord(TABLE_ENTITY_USER ?? '', {
      userId: sub,
      entityId: payment.entityId,
    });
  } catch (err: any) {
    console.log('ERROR get entity user: ', err);
    throw new Error(err.message);
  }

  console.log('entityUser: ', entityUser);

  if (!entityUser) {
    throw new Error('UNAUTHORISED_ENTITY');
  }

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

  // get existing zai item
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

  if (!zaiItem) {
    throw new Error('ERROR_GET_ZAI_ITEM');
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

  // retry payment
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
};
