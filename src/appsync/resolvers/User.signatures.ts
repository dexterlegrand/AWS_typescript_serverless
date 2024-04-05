import {
  AppSyncIdentityCognito,
  Context,
  DynamoDBQueryRequest,
  util,
} from '@aws-appsync/utils';
import { dynamodbQueryRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBQueryRequest {
  console.log('User.signatures.ctx request: ', ctx);
  const { sub } = ctx.identity as AppSyncIdentityCognito;
  const { nextToken, limit = 20 } = ctx.source;

  return dynamodbQueryRequest({
    key: 'userId',
    value: sub,
    index: undefined,
    limit,
    nextToken,
  });
}

export function response(ctx: Context) {
  console.log('User.signatures.ctx response: ', ctx);
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  const { items = [], nextToken } = result;
  return { items, nextToken };
}
