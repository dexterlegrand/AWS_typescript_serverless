import {
  Context,
  util,
  DynamoDBGetItemRequest,
  AppSyncIdentityCognito,
  AppSyncIdentityIAM,
} from '@aws-appsync/utils';
import { isAdmin } from '../helpers/cognito';
import { dynamoDBGetItemRequest } from '../helpers/dynamodb';
const isAuthorised = (ctx: Context) => {
  if (util.authType() === 'User Pool Authorization') {
    const { groups } = ctx.identity as AppSyncIdentityCognito;
    if (!isAdmin(groups)) {
      util.unauthorized();
    }

    return true;
  } else if (util.authType() === 'IAM Authorization') {
    const { userArn } = ctx.identity as AppSyncIdentityIAM;
    const adminRoles = [''];

    //#if( $ctx.identity.userArn.contains($adminRole) && $ctx.identity.userArn != $ctx.stash.authRole && $ctx.identity.userArn != $ctx.stash.unauthRole )
    for (const adminRole in adminRoles) {
      if (
        userArn.includes(adminRole) &&
        userArn != ctx.stash.authRole &&
        userArn != ctx.stash.unauthRole
      ) {
        return true;
      }
    }
  } else if (util.authType() === 'Open ID Connect Authorization') {
    //
  } else if (util.authType() === 'API Key Authorization') {
    //
  }

  return false;
};

export function request(ctx: Context): DynamoDBGetItemRequest {
  const {
    args: { id },
  } = ctx;

  if (!isAuthorised(ctx)) {
    util.unauthorized();
  }

  return dynamoDBGetItemRequest({ id });
}

export function response(ctx: Context) {
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  return ctx.result;
}
