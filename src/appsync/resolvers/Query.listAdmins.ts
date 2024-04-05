import {
  Context,
  util,
  DynamoDBScanRequest,
  AppSyncIdentityCognito,
} from '@aws-appsync/utils';
import { USER_GROUPS } from '../helpers/cognito';
import { dynamoDBScanRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBScanRequest {
  const { filter, limit = 20, nextToken } = ctx.args;
  const { groups } = ctx.identity as AppSyncIdentityCognito;
  if (!groups || !groups?.includes(USER_GROUPS.SUPER_ADMINS)) {
    util.unauthorized();
  }

  return dynamoDBScanRequest({ filter, limit, nextToken });
}

export function response(ctx: Context) {
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  const { items = [], nextToken } = result;
  return { items, nextToken };
}
