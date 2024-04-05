import {
  Context,
  util,
  AppSyncIdentityCognito,
  DynamoDBFilterObject,
  DynamoDBDeleteItemRequest,
} from '@aws-appsync/utils';
import { isAdmin } from '../helpers/cognito';
import { dynamodbDeleteRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBDeleteItemRequest {
  const { sub, groups } = ctx.identity as AppSyncIdentityCognito;
  const {
    arguments: {
      input: { id },
    },
  } = ctx;

  let condition: DynamoDBFilterObject = {};
  const key = { id };
  // check if is user
  if (util.authType() !== 'IAM Authorization' && !isAdmin(groups)) {
    condition = {
      owner: { eq: sub },
    };
  }

  return dynamodbDeleteRequest({ key, condition });
}

export function response(ctx: Context) {
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  return ctx.result;
}
