import { Context, util, DynamoDBDeleteItemRequest } from '@aws-appsync/utils';
import { dynamodbDeleteRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBDeleteItemRequest {
  console.log('Query.deleteEntityUser1.ts request ctx: ', ctx);
  const {
    input: { entityId, userId },
  } = ctx.args;

  const key = {
    entityId,
    userId,
  };

  //const condition = {
  //  expression: '#role <> :roleVal',
  //  expressionNames: {
  //    '#role': 'role',
  //  },
  //  expressionValues: {
  //    ':roleVal': 'OWNER',
  //  },
  //};

  const condition = {
    role: { ne: 'OWNER' },
  };

  return dynamodbDeleteRequest({ key, condition });
}

export function response(ctx: Context) {
  console.log('Query.deleteEntityUser1.ts response ctx: ', ctx);
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  return ctx.result;
}
