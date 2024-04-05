import {
  AppSyncIdentityCognito,
  Context,
  DynamoDBGetItemRequest,
  util,
} from '@aws-appsync/utils';
import { dynamoDBGetItemRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBGetItemRequest {
  console.log('Mutation.updateTask0.ts ctx response: ', ctx);
  const { sub } = ctx.identity as AppSyncIdentityCognito;
  const {
    input: { entityId },
  } = ctx.args;

  return dynamoDBGetItemRequest({
    userId: sub,
    entityId,
  });
}

export function response(ctx: Context) {
  console.log('Mutation.updateTask0.ts ctx response: ', ctx);
  const { error, result } = ctx;

  if (!result) {
    util.unauthorized();
  }

  if (error) {
    return util.appendError(error.message, error.type, result);
  }

  return result;
}
