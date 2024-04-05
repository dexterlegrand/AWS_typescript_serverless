const { ENV, REGION } = process.env;
const isProd = ENV === 'prod';
import {
  createZaiAuthToken,
  CreateZaiAuthTokenResponse,
  getFailedPayToPayment,
  getPayToAgreement,
  isAuthTokenExpired,
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

//TODO: does this need authorisation check for user?

export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  console.log('EVENT RECEIVED: ', JSON.stringify(ctx));
  const { sourceIp } = ctx.identity as AppSyncIdentityCognito;
  const { instructionId } = ctx.arguments;

  await initZai();

  console.log('sourceIp: ', sourceIp);

  let failedPayment;
  try {
    failedPayment = await getFailedPayToPayment(
      zaiAuthToken?.access_token,
      instructionId
    );
    console.log('failedPayment: ', failedPayment);
  } catch (err: any) {
    console.log('ERROR getPayToFailedAgreement: ', err);
    throw new Error(err.message);
  }

  return {
    id: failedPayment.id,
    agreementUuid: failedPayment.agreement_uuid,
    errorMessage: failedPayment.error_message,
  };
};
