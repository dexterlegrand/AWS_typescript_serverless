import { Context, DynamoDBQueryRequest, util } from '@aws-appsync/utils';
import { dynamodbQueryRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBQueryRequest {
  const { id, nextToken, limit = 20 } = ctx.source;
  console.log('Conversation.messages.ctx: ', ctx);

  return dynamodbQueryRequest({
    key: 'conversationId',
    value: id,
    index: 'messagesByConversation',
    limit,
    nextToken,
  });
}

export function response(ctx: Context) {
  const { error, result } = ctx;
  console.log('result: ', result);
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  const { items = [], nextToken } = result;
  return { items, nextToken };
}
