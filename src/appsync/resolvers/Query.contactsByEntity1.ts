import { Context, DynamoDBQueryRequest, util } from '@aws-appsync/utils';
import { dynamodbQueryRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBQueryRequest {
  console.log('contactsByEntity ctx: ', ctx);
  const { entityId, filter, nextToken } = ctx.args;

  return dynamodbQueryRequest({
    key: 'entityId',
    value: entityId,
    filter,
    index: 'contactsByEntity',
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
