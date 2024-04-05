import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import { AppSyncResolverHandler } from 'aws-lambda';
import * as util from 'util';
import { deleteCognitoUser } from '/opt/cognito';
import { deleteRecord } from '/opt/dynamoDB';

const { AUTH_USERPOOLID, TABLE_USER, MIXPANEL_TOKEN } = process.env;

import * as mixpanelPackage from 'mixpanel';

const mixpanel = mixpanelPackage.init(MIXPANEL_TOKEN ?? '');

const peopleDeleteUserAsync = util.promisify(mixpanel.people.delete_user);

export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  console.log(`EVENT: ${JSON.stringify(ctx)}`);
  const { sub, username } = ctx.identity as AppSyncIdentityCognito;

  if (!AUTH_USERPOOLID) {
    throw new Error('AUTH_USERPOOLID is not defined');
  }

  // delete cognito user
  try {
    await deleteCognitoUser(AUTH_USERPOOLID ?? '', username);
  } catch (err: any) {
    console.log('ERROR delete user: ', err);
    throw new Error(err.message);
  }

  // delete user
  let deletedUser;
  try {
    deletedUser = await deleteRecord(TABLE_USER ?? '', { id: sub });
    console.log('deletedUser: ', deletedUser);
  } catch (err: any) {
    console.log('ERROR deletedUser: ', err);
    throw new Error(err.message);
  }

  try {
    await peopleDeleteUserAsync(sub);
  } catch (err: any) {
    console.log('ERROR mixpanel people delete user', err);
  }

  return deletedUser;
};
