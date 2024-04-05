const { TABLE_ENTITY, TABLE_ENTITY_USER } = process.env;
import { getRecord } from '/opt/dynamoDB';
import { initApi } from '/opt/frankieone';
import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import { AppSyncResolverHandler } from 'aws-lambda';

export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  console.log('EVENT RECEIVED: ', JSON.stringify(ctx));
  const { sub } = ctx.identity as AppSyncIdentityCognito;
  const { entityId } = ctx.arguments.input;

  const frankieOne = initApi();
  console.log('frankieOne: ', frankieOne);

  console.log('entityId: ', entityId);
  console.log('sub: ', sub);

  let entityUser;
  try {
    entityUser = await getRecord(TABLE_ENTITY_USER ?? '', {
      entityId,
      userId: sub,
    });
  } catch (err: any) {
    console.log('ERROR get entity user: ', err);
    throw new Error(err.message);
  }

  if (!entityUser) {
    throw new Error('UNAUTHORISED_ENTITY');
  }

  let entity;
  try {
    entity = await getRecord(TABLE_ENTITY ?? '', { id: entityId });
    console.log('entity: ', entity);
  } catch (err: any) {
    console.log('ERROR get entity: ', err);
    throw new Error(err.message);
  }

  //if (entity.entityType === EntityType.INDIVIDUAL || entity.entityType === EntityType.SOLE_TRADER) {
  //  throw new Error('ENTITY_NOT_BUSINESS');
  //}

  // query frankieone business ownership
  //TODO: prevent check run 2nd time?
  const ownershipParams = {
    organisation: {
      entityId: entity.frankieOneEntityId,
    },
  };

  try {
    const response = await frankieOne.business.businessOwnershipQuery(
      ownershipParams
    );

    console.log('response: ', response?.data ?? response);
    console.log('response.status: ', response?.status);
    return {};
  } catch (err: any) {
    console.log(
      'ERROR frankieOne.business.businessOwnershipQuery: ',
      JSON.stringify(err)
    );
    throw new Error(`${err?.error?.errorCode}: ${err?.error?.errorMsg}`);
  }
};
