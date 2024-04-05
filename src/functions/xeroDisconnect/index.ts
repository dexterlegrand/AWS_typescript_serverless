import { getRecord } from '/opt/dynamoDB';
import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import { AppSyncResolverHandler } from 'aws-lambda';
const { TABLE_USER } = process.env;

export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  const { sub } = ctx.identity as AppSyncIdentityCognito;
  const { input } = ctx.arguments;

  console.log('input: ', input);
  console.log('sub: ', sub);

  let user;
  try {
    user = await getRecord(TABLE_USER ?? '', { id: sub });
    console.log('user: ', user);
  } catch (err: any) {
    console.log('ERROR get user: ', err);
    throw new Error(err.message);
  }
};
