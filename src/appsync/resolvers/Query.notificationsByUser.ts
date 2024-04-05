import {
  AppSyncIdentityCognito,
  Context,
  DynamoDBQueryRequest,
} from '@aws-appsync/utils';
import { dynamodbQueryRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBQueryRequest {
  const { sub } = ctx.identity as AppSyncIdentityCognito;
  const {
    args: { limit, nextToken, sortDirection, filter },
  } = ctx;

  return dynamodbQueryRequest({
    key: 'owner',
    value: sub,
    index: 'notificationsByUser',
    filter,
    limit,
    nextToken,
    sortDirection,
  });
}

export function response(ctx: Context) {
  const { error, result } = ctx;

  if (error) {
    return util.appendError(error.message, error.type, result);
  }

  return ctx.result;
}
