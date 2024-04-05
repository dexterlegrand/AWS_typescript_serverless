import { Context, util, DynamoDBScanRequest } from '@aws-appsync/utils';
import { dynamoDBScanRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBScanRequest {
  const { filter, limit = 20, nextToken } = ctx.args;
  return dynamoDBScanRequest({ filter, limit, nextToken });
}

//TODO: authorisation
export function response(ctx: Context) {
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  const { items = [], nextToken } = result;
  return { items, nextToken };
}
