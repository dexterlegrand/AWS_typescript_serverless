import {
  Context,
  util,
  AppSyncIdentityCognito,
  DynamoDBFilterObject,
  DynamoDBDeleteItemRequest,
} from '@aws-appsync/utils';
import { dynamodbDeleteRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBDeleteItemRequest {
  const { sub } = ctx.identity as AppSyncIdentityCognito;
  const {
    arguments: {
      input: { userId, createdAt },
    },
  } = ctx;

  if (sub !== userId) {
    util.unauthorized();
  }

  const condition: DynamoDBFilterObject = {
    userId: { eq: sub },
  };

  const key = { userId, createdAt };

  return dynamodbDeleteRequest({ key, condition });
}

export function response(ctx: Context) {
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  return ctx.result;
}
