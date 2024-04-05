import { Context, DynamoDBQueryRequest, util } from '@aws-appsync/utils';
import { dynamodbQueryRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBQueryRequest {
  console.log('Entity.paymentMethods request: ', ctx);
  const { id, nextToken, limit = 20 } = ctx.source;

  return dynamodbQueryRequest({
    key: 'entityId',
    value: id,
    index: 'paymentMethodsByEntity',
    limit,
    nextToken,
  });
}

export function response(ctx: Context) {
  console.log('Entity.paymentMethods response: ', ctx);
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  const { items = [], nextToken } = result;
  return { items, nextToken };
}
