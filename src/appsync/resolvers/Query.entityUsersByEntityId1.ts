import { Context, DynamoDBQueryRequest, util } from '@aws-appsync/utils';
import { dynamodbQueryRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBQueryRequest {
  console.log('Query.entityUsersByEntity request ctx: ', ctx);
  const { entityId, filter, nextToken } = ctx.args;

  return dynamodbQueryRequest({
    key: 'entityId',
    value: entityId,
    filter,
    index: 'entityUsersByEntity',
    limit: 20,
    nextToken,
  });
}

export function response(ctx: Context) {
  console.log('Query.entityUsersByEntity response ctx: ', ctx);
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  const { items = [], nextToken } = result;
  return { items, nextToken };
}
