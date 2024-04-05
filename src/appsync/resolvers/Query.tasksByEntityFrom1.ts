import { Context, DynamoDBQueryRequest } from '@aws-appsync/utils';
import { dynamodbQueryRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBQueryRequest {
  const {
    args: { entityId, status, limit, nextToken, sortDirection, filter },
  } = ctx;

  return dynamodbQueryRequest({
    key: 'fromSearchStatus',
    value: `${entityId}#${status}`,
    index: 'tasksByEntityFrom',
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
