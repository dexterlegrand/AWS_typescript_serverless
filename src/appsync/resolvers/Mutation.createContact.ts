import {
  AppSyncIdentityCognito,
  Context,
  DynamoDBPutItemRequest,
  util,
} from '@aws-appsync/utils';
import { dynamodbPutRequest } from '../helpers/dynamodb';
import { ContactStatus, ContactType } from '/opt/API';

export function request(ctx: Context): DynamoDBPutItemRequest {
  const { sub } = ctx.identity as AppSyncIdentityCognito;
  const { input } = ctx.arguments;

  const key = { id: util.autoId() };
  const createdAt = util.time.nowISO8601();
  const data = {
    ...input,
    owner: sub,
    status: ContactStatus.ACTIVE,
    type: ContactType.NORMAL,
    searchName: (
      input.companyName || `${input.firstName ?? ''} ${input.lastName ?? ''}`
    ).toLowerCase(),
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
