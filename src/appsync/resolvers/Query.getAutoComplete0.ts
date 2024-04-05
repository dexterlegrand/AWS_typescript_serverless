import { Context, DynamoDBGetItemRequest, util } from '@aws-appsync/utils';
import { dynamoDBGetItemRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBGetItemRequest {
  console.log('Query.getAutoComplete0.ts request ctx: ', ctx);
  const { id } = ctx.args;

  return dynamoDBGetItemRequest({
    id,
  });
}

export function response(ctx: Context) {
  console.log('Query.getAutoComplete0.ts response ctx: ', ctx);
  const { error, result } = ctx;

  if (error) {
    return util.appendError(error.message, error.type, result);
  }

  ctx.stash.foundEntity = result;

  return ctx.result;
}
