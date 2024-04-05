const { TABLE_BENEFICIAL_OWNER, TABLE_ENTITY_USER } = process.env;
import { getRecord } from '/opt/dynamoDB';
import { createFrankieOneAuthToken } from '/opt/frankieone';
import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import { AppSyncResolverHandler } from 'aws-lambda';

export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  console.log('EVENT RECEIVED: ', JSON.stringify(ctx));
  const { sub } = ctx.identity as AppSyncIdentityCognito;
  const { beneficialOwnerId } = ctx.arguments.input;

  // referer url
  const referrer = ctx.request.headers.referer ?? '';

  console.log('referrer:', referrer);
  console.log('sub: ', sub);

  let beneficialOwner;
  try {
    beneficialOwner = await getRecord(TABLE_BENEFICIAL_OWNER ?? '', {
      id: beneficialOwnerId,
    });
  } catch (err: any) {
    console.log('ERROR get beneficial owner: ', err);
    throw new Error(err.message);
  }

  if (!beneficialOwner) {
    throw new Error('BENEFICIAL_OWNER_NOT_FOUND');
  }

  let entityUser;
  try {
    entityUser = await getRecord(TABLE_ENTITY_USER ?? '', {
      entityId: beneficialOwner.entityId,
      userId: sub,
    });
  } catch (err: any) {
    console.log('ERROR get entity user: ', err);
    throw new Error(err.message);
  }

  if (!entityUser) {
    throw new Error('UNAUTHORISED_ENTITY');
  }

  // generate session token
  let token;
  try {
    token = await createFrankieOneAuthToken({
      preset: 'smart-ui',
      referrer,
      entityId: beneficialOwner.providerEntityId,
    });
  } catch (err: any) {
    console.log('ERROR generate session token: ', err);
    throw new Error(err.message);
  }

  console.log('sessionTokenResponse: ', token);

  return {
    token,
  };
};
