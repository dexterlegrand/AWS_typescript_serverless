import { Context, DynamoDBQueryRequest, util } from '@aws-appsync/utils';
import { dynamodbQueryRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBQueryRequest {
  const { id, nextToken, entityId, limit = 20 } = ctx.source;

  console.log('Task.activity request ctx: ', ctx);

  return dynamodbQueryRequest({
    key: 'compositeId',
    index: undefined,
    value: `${entityId}#${id}`,
    limit,
    nextToken,
  });
}

export function response(ctx: Context) {
  console.log('Task.activity response ctx: ', ctx);
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  const { items = [], nextToken } = result;
  return { items, nextToken };
}
