import {
  Context,
  DynamoDBGetItemRequest,
  runtime,
  util,
} from '@aws-appsync/utils';
import { dynamoDBGetItemRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBGetItemRequest {
  const { teamId } = ctx.source;
  console.log('User.team.ctx: ', ctx);

  if (!teamId) {
    runtime.earlyReturn();
  }

  return dynamoDBGetItemRequest({ id: teamId });
}

export function response(ctx: Context) {
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  return ctx.result;
}
