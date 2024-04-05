import {
  AppSyncIdentityCognito,
  Context,
  DynamoDBScanRequest,
  util,
} from '@aws-appsync/utils';
import { isAdmin } from '../helpers/cognito';
import { dynamoDBScanRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBScanRequest {
  const { filter, limit, nextToken } = ctx.args;
  const { groups } = ctx.identity as AppSyncIdentityCognito;
  if (!isAdmin(groups)) {
    util.unauthorized();
  }

  return dynamoDBScanRequest({ filter, limit, nextToken });
}

export function response(ctx: Context) {
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  return ctx.result;
}
