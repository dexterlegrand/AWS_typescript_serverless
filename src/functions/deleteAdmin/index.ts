import {
  deleteCognitoUser,
  USER_GROUPS,
  isInGroupFromClaims,
} from '/opt/cognito';
import { deleteRecord } from '/opt/dynamoDB';
import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import { AppSyncResolverHandler } from 'aws-lambda';
const { AUTH_USERPOOLID, TABLE_ADMIN, TABLE_USER } = process.env;

export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  console.log(`EVENT: ${JSON.stringify(ctx)}`);
  const { claims } = ctx.identity as AppSyncIdentityCognito;
  const { id } = ctx.arguments.input;

  if (!isInGroupFromClaims(claims, USER_GROUPS.SUPER_ADMINS)) {
    throw new Error('User is not authorised to delete admin');
  }

  let deletedAdmin;
  try {
    deletedAdmin = await deleteRecord(TABLE_ADMIN ?? '', { id });
  } catch (err: any) {
    console.log('ERROR deleteAdmin: ', err);
    throw new Error(err.message);
  }

  console.log('deletedAdmin: ', deletedAdmin);

  if (deletedAdmin?.owner) {
    let deletedUser;
    try {
      deletedUser = await deleteRecord(TABLE_USER ?? '', {
        id: deletedAdmin.owner,
      });
      console.log('deletedUser: ', deletedUser);
    } catch (err: any) {
      console.log('ERROR deletedUser: ', err);
      throw new Error(err.message);
    }

    try {
      await deleteCognitoUser(AUTH_USERPOOLID ?? '', deletedAdmin.owner);
    } catch (err: any) {
      console.log('ERROR delete cognito user', err);
      throw new Error(err.message);
    }

    return deletedAdmin;
  }

  return null;
};
