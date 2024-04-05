import {
  AppSyncIdentityCognito,
  Context,
  DynamoDBUpdateItemRequest,
  util,
} from '@aws-appsync/utils';
import { isAdmin } from '../helpers/cognito';
import { dynamodbUpdateRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBUpdateItemRequest {
  const { sub, groups } = ctx.identity as AppSyncIdentityCognito;
  const { input } = ctx.args;
  const { id, ...values } = input;
  const key = { id };

  let condition;
  if (util.authType() !== 'IAM Authorization' && !isAdmin(groups)) {
    condition = {
      id: { attributeExists: true },
      owner: { eq: sub },
    };
  }

  const data = {
    ...values,
    updatedAt: util.time.nowISO8601(),
  };
  return dynamodbUpdateRequest({ key, data, condition });
}

export function response(ctx: Context) {
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  return result;
}
