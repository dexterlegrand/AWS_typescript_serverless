import { Context, DynamoDBGetItemRequest, util } from '@aws-appsync/utils';
import { dynamoDBGetItemRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBGetItemRequest {
  console.log('Mutation.updateTask1.ts ctx: ', ctx);
  const {
    input: { id, entityId },
  } = ctx.args;

  return dynamoDBGetItemRequest({
    id,
    entityId,
  });
}

export function response(ctx: Context) {
  console.log('Mutation.updateTask1.ts ctx: ', ctx);
  const { error, result } = ctx;

  if (error) {
    return util.appendError(error.message, error.type, result);
  }

  ctx.stash.existingTask = result;

  return result;
}
