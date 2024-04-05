import { Context, DynamoDBQueryRequest, util } from '@aws-appsync/utils';
import { dynamodbQueryRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBQueryRequest {
  console.log('Entity.tasks1.request.ctx: ', ctx);
  const { id, fromNextToken, limit = 20 } = ctx.source;

  return dynamodbQueryRequest({
    key: 'fromSearchStatus',
    value: `${id}#INCOMPLETE`,
    index: 'tasksByEntityFrom',
    limit,
    nextToken: fromNextToken,
  });
}

export function response(ctx: Context) {
  console.log('Entity.tasks1.response.ctx: ', ctx);
  const { error, result } = ctx;
  const { toItems, toNextToken } = ctx.stash;

  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  const { items = [], nextToken } = result;
  const allItems = [...toItems, ...items];
  return { items: allItems, fromNextToken: nextToken, toNextToken };
}
