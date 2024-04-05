const { ENV, TABLE_ENTITY, TABLE_ENTITY_USER, TABLE_PAYMENT_METHODS, REGION } =
  process.env;
const isProd = ENV === 'prod';
import { AccountDirection } from '/opt/API';
import { createRecord, getRecord, updateRecord } from '/opt/dynamoDB';
import {
  createZaiAuthToken,
  CreateZaiAuthTokenResponse,
  getZaiBankAccount,
  isAuthTokenExpired,
  setUserDisbursement,
} from '/opt/zai';
import { getCardAccount } from '/opt/zai/card';
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
  const { sub } = ctx.identity as AppSyncIdentityCognito;
  const { input } = ctx.arguments;
  const { entityId, paymentMethodId, paymentMethodType, accountDirection } =
    input;

  const [entityUser, entity] = await Promise.all([
    getRecord(TABLE_ENTITY_USER ?? '', { userId: sub, entityId }),
    getRecord(TABLE_ENTITY ?? '', { id: entityId }),
  ]);

  console.log('entityUser: ', entityUser);
  console.log('entity: ', entity);

  if (!entityUser) {
    throw new Error('UNAUTHORISED_ENTITY');
  }

  // verify paymentMethodId allowed for user / entity TODO: verify paymentMethodId allowed for user / entity

  await initZai();

  const paymentMethodDetails: any = {};
  // get information for card account
  if (paymentMethodType === 'CARD') {
    try {
      const cardData = await getCardAccount(
        zaiAuthToken?.access_token,
        paymentMethodId
      );
      console.log('cardData: ', cardData);
      paymentMethodDetails.fullName = cardData.card_accounts.card.full_name;
      paymentMethodDetails.type = cardData.card_accounts.card.type;
      paymentMethodDetails.number = cardData.card_accounts.card.number;
      paymentMethodDetails.expMonth = cardData.card_accounts.card.expiry_month;
      paymentMethodDetails.expYear = cardData.card_accounts.card.expiry_year;
    } catch (err: any) {
      console.log('ERROR get card payment method: ', err);
      throw new Error(err.message);
    }
  }
  // get information for bank account
  else if (paymentMethodType === 'BANK') {
    try {
      const bankData = await getZaiBankAccount(
        zaiAuthToken?.access_token,
        paymentMethodId
      );
      console.log('bankData: ', bankData);
      paymentMethodDetails.accountName =
        bankData.bank_accounts.bank.account_name;
      paymentMethodDetails.bankName = bankData.bank_accounts.bank.bank_name;
      paymentMethodDetails.country = bankData.bank_accounts.bank.country;
      paymentMethodDetails.accountNumber =
        bankData.bank_accounts.bank.account_number;
      paymentMethodDetails.routingNumber =
        bankData.bank_accounts.bank.routing_number;
      paymentMethodDetails.holderType = bankData.bank_accounts.bank.holder_type;
      paymentMethodDetails.accountType =
        bankData.bank_accounts.bank.account_type;
    } catch (err: any) {
      console.log('ERROR get bank payment method: ', err);
      throw new Error(err.message);
    }
  }

  // save payment method to entity
  const createdAt = new Date().toISOString();
  const params = {
    ...paymentMethodDetails,
    id: paymentMethodId,
    entityId,
    owner: entity.owner,
    createdBy: sub,
    paymentMethodType,
    accountDirection,
    status: 'ACTIVE',
    createdAt,
    updatedAt: createdAt,
  };

  console.log('payment method params: ', params);

  //try {
  //  await createRecord(TABLE_PAYMENT_METHODS ?? '', params);
  //} catch (err: any) {
  //  console.log('ERROR update payment method: ', err);
  //  throw new Error(err.message);
  //}
  //
  //try {
  //  await updateRecord(TABLE_ENTITY ?? '', { id: entityId }, { paymentMethodId });
  //} catch (err: any) {
  //  console.log('ERROR update entity: ', err);
  //  throw new Error(err.message);
  //}

  const entityParams =
    accountDirection === AccountDirection.PAYMENT
      ? { paymentMethodId }
      : { disbursementMethodId: paymentMethodId };

  const requests = [
    createRecord(TABLE_PAYMENT_METHODS ?? '', params),
    updateRecord(TABLE_ENTITY ?? '', { id: entityId }, entityParams),
  ];

  if (accountDirection === AccountDirection.DISBURSEMENT) {
    requests.push(
      setUserDisbursement(zaiAuthToken.access_token, entity.owner, {
        account_id: paymentMethodId,
      })
    );
  }

  try {
    const response = await Promise.all(requests);
    console.log('create / update / set response: ', response);
  } catch (err: any) {
    console.log(
      'ERROR update entity / create payment method / set disbursement: ',
      err
    );
    throw new Error(err.message);
  }

  return params;
};
