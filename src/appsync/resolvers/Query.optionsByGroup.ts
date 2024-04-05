import { Context, DynamoDBQueryRequest } from '@aws-appsync/utils';
import { dynamodbQueryRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBQueryRequest {
  console.log('optionsByGroup ctx: ', ctx);
  const { group, nextToken } = ctx.args;

  return dynamodbQueryRequest({
    key: 'group',
    value: group,
    index: 'optionsByGroup',
    limit: 20,
    nextToken,
  });
}

export function response(ctx: Context) {
  const { error, result } = ctx;
  console.log('result: ', result);

  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  const { items = [], nextToken } = result;
  return { items, nextToken };
}
