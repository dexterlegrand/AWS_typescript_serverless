import { Context, DynamoDBQueryRequest } from '@aws-appsync/utils';
import { dynamodbQueryRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBQueryRequest {
  console.log('Query.tasksBySearchName1.ts request ctx: ', ctx);
  const {
    args: { searchName, limit, nextToken, sortDirection, filter },
  } = ctx;

  return dynamodbQueryRequest({
    key: 'searchName',
    value: searchName,
    index: 'tasksBySearchName',
    filter,
    limit,
    nextToken,
    sortDirection,
  });
}

export function response(ctx: Context) {
  console.log('Query.tasksBySearchName1.ts response ctx: ', ctx);
  const { error, result } = ctx;

  if (error) {
    return util.appendError(error.message, error.type, result);
  }

  return ctx.result;
}
