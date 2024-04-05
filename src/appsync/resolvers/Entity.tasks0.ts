import { Context, DynamoDBQueryRequest, util } from '@aws-appsync/utils';
import { dynamodbQueryRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBQueryRequest {
  console.log('Entity.tasks0.request.ctx: ', ctx);
  const { id, toNextToken, limit = 20 } = ctx.source;

  return dynamodbQueryRequest({
    key: 'toSearchStatus',
    value: `${id}#INCOMPLETE`,
    index: 'tasksByEntityTo',
    limit,
    nextToken: toNextToken,
  });
}

export function response(ctx: Context) {
  const { error, result } = ctx;

  console.log('Entity.tasks0.response.ctx: ', ctx);

  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  const { items = [], nextToken } = result;
  ctx.stash.toItems = items;
  ctx.stash.toNextToken = nextToken;
  return { items, nextToken };
}
