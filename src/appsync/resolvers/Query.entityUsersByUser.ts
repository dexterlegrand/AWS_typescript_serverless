import {
  AppSyncIdentityCognito,
  Context,
  DynamoDBQueryRequest,
  util,
} from '@aws-appsync/utils';
import { dynamodbQueryRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBQueryRequest {
  console.log('Query.entityUsersByUser request ctx: ', ctx);
  const { sub } = ctx.identity as AppSyncIdentityCognito;
  const { filter, nextToken } = ctx.args;

  return dynamodbQueryRequest({
    key: 'userId',
    value: sub,
    filter,
    index: 'entityUsersByUser',
    limit: 20,
    nextToken,
  });
}

export function response(ctx: Context) {
  console.log('Query.entityUsersByUser response ctx: ', ctx);
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  const { items = [], nextToken } = result;
  return { items, nextToken };
}
