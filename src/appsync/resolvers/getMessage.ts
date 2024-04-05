import { Context, util, DynamoDBGetItemRequest } from '@aws-appsync/utils';
import { dynamoDBGetItemRequest } from '../helpers/dynamodb';
//TODO: authorisation or remove altogether?
export function request(ctx: Context): DynamoDBGetItemRequest {
  const {
    args: { id },
  } = ctx;
  return dynamoDBGetItemRequest({ id });
}

export function response(ctx: Context) {
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  return ctx.result;
}
