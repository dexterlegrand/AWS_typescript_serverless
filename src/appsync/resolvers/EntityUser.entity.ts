// pipeline javascript resolver to get the entity based on entityId in source
import { Context, DynamoDBGetItemRequest, util } from '@aws-appsync/utils';
import { dynamoDBGetItemRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBGetItemRequest {
  console.log('EntityUser.entity request: ', ctx);
  const { entityId } = ctx.source;

  return dynamoDBGetItemRequest({
    id: entityId,
  });
}

export function response(ctx: Context) {
  console.log('EntityUser.entity response: ', ctx);
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }

  return result;
}
