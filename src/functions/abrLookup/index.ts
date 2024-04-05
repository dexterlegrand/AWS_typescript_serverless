import { abrLookupByAbn } from '/opt/abr';
import { AppSyncResolverHandler } from 'aws-lambda';

export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  const { abn } = ctx.arguments;
  console.log('input: ', abn);

  let entity;
  try {
    entity = await abrLookupByAbn(abn);
  } catch (err: any) {
    console.log('ERROR search abr: ', err);
    throw new Error(err.message);
  }

  return entity;
};
