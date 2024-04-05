// create signature mutation
import {
  AppSyncIdentityCognito,
  Context,
  DynamoDBPutItemRequest,
  util,
} from '@aws-appsync/utils';
import { dynamodbPutRequest } from '../helpers/dynamodb';
export function request(ctx: Context): DynamoDBPutItemRequest {
  const { sub } = ctx.identity as AppSyncIdentityCognito;
  const {
    arguments: { input },
  } = ctx;

  const createdAt = util.time.nowISO8601();
  const key = {
    userId: sub,
    createdAt,
  };
  const data = {
    id: util.autoId(),
    createdAt,
    updatedAt: createdAt,
    ...input,
  };

  const condition = { createdAt: { attributeExists: false } };
  return dynamodbPutRequest({ key, data, condition });
}

export function response(ctx: Context) {
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }

  return ctx.result;
}
