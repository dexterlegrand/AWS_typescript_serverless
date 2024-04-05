const { ENV, REGION, TABLE_USER } = process.env;
const isProd = ENV === 'prod';
import { getRecord } from '/opt/dynamoDB';
import {
  createZaiAuthToken,
  CreateZaiAuthTokenResponse,
  createZaiPaymentMethodToken,
  isAuthTokenExpired,
} from '/opt/zai';
import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import { AppSyncResolverHandler } from 'aws-lambda';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

const secretManager = new SecretsManagerClient({ region: REGION });

let zaiAuthToken: CreateZaiAuthTokenResponse;
let zaiClientSecret: string;

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
  const { sub } = ctx.identity as AppSyncIdentityCognito;
  const { tokenType } = ctx.arguments.input;

  await initZai();

  // get user
  let user;
  try {
    user = await getRecord(TABLE_USER ?? '', { id: sub });
    console.log('user: ', user);
  } catch (err: any) {
    console.log('ERROR get user: ', err);
    throw new Error(err.message);
  }

  if (!user?.zaiUserId) {
    throw new Error('NO_ZAI_USER');
  }

  // create payment method token
  try {
    const response = await createZaiPaymentMethodToken(
      zaiAuthToken?.access_token,
      {
        user_id: user.zaiUserId,
        token_type: tokenType,
      }
    );
    console.log('createZaiPaymentMethodToken response: ', response);
    return response?.token_auth?.token;
  } catch (err: any) {
    console.log('ERROR createZaiPaymentMethodToken: ', err);
    throw new Error(err.message);
  }
};
