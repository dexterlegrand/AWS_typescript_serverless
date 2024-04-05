import { Context, DynamoDBQueryRequest, util } from '@aws-appsync/utils';
import { dynamodbQueryRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBQueryRequest {
  console.log('Entity.entityUsers request ctx: ', ctx);
  const { id, nextToken, limit = 20 } = ctx.source;

  return dynamodbQueryRequest({
    key: 'entityId',
    value: id,
    index: 'entityUsersByEntity',
    limit,
    nextToken,
  });
}
export function response(ctx: Context) {
  const { error, result } = ctx;
  console.log('Entity.entityUsers response ctx: ', ctx);
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  const { items = [], nextToken } = result;
  return { items, nextToken };
}
