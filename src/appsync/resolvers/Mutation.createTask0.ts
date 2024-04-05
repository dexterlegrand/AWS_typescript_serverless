import {
  AppSyncIdentityCognito,
  Context,
  DynamoDBGetItemRequest,
  util,
} from '@aws-appsync/utils';
import { CreateTaskInput } from '../API';
import { dynamoDBGetItemRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBGetItemRequest {
  console.log('create task0 ctx: ', ctx);
  const { sub } = ctx.identity as AppSyncIdentityCognito;
  const { direction, toId, fromId } = ctx.arguments.input as CreateTaskInput;

  let entityId;
  if (direction === 'RECEIVING') {
    entityId = toId;
  } else if (direction === 'SENDING') {
    entityId = fromId;
  }

  return dynamoDBGetItemRequest({
    userId: sub,
    entityId,
  });
}

export function response(ctx: Context) {
  console.log('entity user check: ', ctx);
  const { sub } = ctx.identity as AppSyncIdentityCognito;
  const { error, result } = ctx;

  if (!result?.userId || result.userId !== sub) {
    util.unauthorized();
  }

  if (error) {
    return util.appendError(error.message, error.type, result);
  }

  return ctx.result;
}
