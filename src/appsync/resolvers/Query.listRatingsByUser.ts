import {
  Context,
  util,
  DynamoDBQueryRequest,
  AppSyncIdentityCognito,
} from '@aws-appsync/utils';
import { isAdmin } from '../helpers/cognito';
import { dynamodbQueryRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBQueryRequest {
  const { sub, groups } = ctx.identity as AppSyncIdentityCognito;
  const { owner, filter, limit = 20, nextToken } = ctx.args;

  const userId =
    util.authType() !== 'IAM Authorization' && !isAdmin(groups) ? sub : owner;

  return dynamodbQueryRequest({
    key: 'owner',
    value: userId,
    index: 'ratingsByUser',
    filter,
    limit,
    nextToken,
  });
}

export function response(ctx: Context) {
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  return result;
}
