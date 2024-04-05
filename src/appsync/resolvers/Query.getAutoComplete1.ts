import { Context, util, DynamoDBGetItemRequest } from '@aws-appsync/utils';
import { dynamoDBGetItemRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBGetItemRequest {
  console.log('Query.getAutoComplete1.ts request ctx: ', ctx);

  const {
    args: { id },
  } = ctx;
  return dynamoDBGetItemRequest({ id });
}

export function response(ctx: Context) {
  console.log('Query.getAutoComplete1.ts response ctx: ', ctx);

  const { error, result } = ctx;
  const foundEntity = ctx.stash.foundEntity;

  if (error) {
    return util.appendError(error.message, error.type, result);
  }

  return { entity: foundEntity, contact: ctx.result };
}
