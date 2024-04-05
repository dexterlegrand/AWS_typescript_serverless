import { Context, DynamoDBQueryRequest, util } from '@aws-appsync/utils';
import { dynamodbQueryRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBQueryRequest {
  const { id, nextToken, limit = 20 } = ctx.source;

  console.log('Task.taskPayments request ctx: ', ctx);

  return dynamodbQueryRequest({
    key: 'taskId',
    index: 'taskPaymentsByTask',
    value: id,
    limit,
    nextToken,
  });
}

export function response(ctx: Context) {
  console.log('Task.taskPayments response ctx: ', ctx);
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  const { items = [], nextToken } = result;
  return { items, nextToken };
}
