import { Context, util, DynamoDBQueryRequest } from '@aws-appsync/utils';
import { dynamodbQueryRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBQueryRequest {
  console.log('User.ratings.ctx: ', ctx);
  const { owner, nextToken, limit = 20 } = ctx.source;

  return dynamodbQueryRequest({
    key: 'owner',
    value: owner,
    index: 'ratingsByUser',
    nextToken,
    limit,
  });
}

export function response(ctx: Context) {
  const { error, result } = ctx;
  console.log('User.ratings result: ', result);
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  return ctx.result;
}
