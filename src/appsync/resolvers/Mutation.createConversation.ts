import { Context, DynamoDBPutItemRequest, util } from '@aws-appsync/utils';
import { dynamodbPutRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBPutItemRequest {
  console.log('CTX create conversation: ', ctx);
  const { input } = ctx.arguments;

  const key = { id: util.autoId() };
  const createdAt = util.time.nowISO8601();
  const data = {
    ...input,
    createdAt,
    updatedAt: createdAt,
  };
  const condition = { id: { attributeExists: false } };
  return dynamodbPutRequest({ key, data, condition });
}

export function response(ctx: Context) {
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  return ctx.result;
}
