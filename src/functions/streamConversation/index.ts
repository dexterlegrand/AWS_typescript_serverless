import { Message } from '/opt/API';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb';
const { ANALYTICS_PINPOINT_ID, TABLE_MESSAGE } = process.env;
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { QueryCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { sendPushNotification } from '/opt/pinpoint';
import { batchDelete } from '/opt/dynamoDB';
import { DynamoDBStreamHandler } from 'aws-lambda';

const DdbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DdbClient);

/**
 * Query messages by conversations
 * @param conversationId
 */
const queryMessages = async (conversationId: string): Promise<any> => {
  const params = {
    TableName: TABLE_MESSAGE,
    IndexName: 'messagesByConversation',
    KeyConditionExpression: '#conversationId = :conversationId',
    ExpressionAttributeNames: {
      '#conversationId': 'conversationId',
    },
    ExpressionAttributeValues: {
      ':conversationId': conversationId,
    },
  };

  const command = new QueryCommand(params);
  const userData = await docClient.send(command);
  return userData.Items;
};

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export const handler: DynamoDBStreamHandler = async (event) => {
  for (let i = 0; i < event.Records.length; i++) {
    const data = event.Records[i];

    // record created
    if (data.eventName === 'INSERT' && data?.dynamodb?.NewImage) {
      const conversation = unmarshall(
        data.dynamodb.NewImage as { [key: string]: AttributeValue }
      );
      console.log('conversation: ', conversation);

      if (conversation?.users?.length > 0) {
        const userIds = conversation.users.filter(
          (user: string) => user !== conversation.createdBy
        );

        console.log('userIds: ', userIds);

        for (let j = 0; j < userIds.length; j++) {
          const userId = userIds[j];

          const params = {
            pinpointAppId: ANALYTICS_PINPOINT_ID ?? '',
            userId,
            title: 'New Conversation',
            message: `You have a new conversation: ${conversation.title}`,
            data: {
              conversationId: conversation.conversationId,
            },
          };

          try {
            const response = await sendPushNotification(params);
            console.log('push response: ', JSON.stringify(response));
          } catch (err: any) {
            console.log('ERROR send push: ', err);
          }
        }
      }
    }

    // record deleted
    if (data.eventName === 'REMOVE' && data?.dynamodb?.OldImage) {
      const conversation = unmarshall(
        data.dynamodb.OldImage as { [key: string]: AttributeValue }
      );

      // get messages for conversation
      // query user products
      let messages: Message[] = [];
      try {
        messages = await queryMessages(conversation.id);
        console.log('messages: ', messages);
      } catch (err: any) {
        console.log('ERROR query messages: ', err);
        throw new Error(err.message);
      }

      if (messages?.length > 0) {
        const conversationIds = messages.map((message) => ({ id: message.id }));
        // erase conversation messages
        let deletedConversations;
        try {
          deletedConversations = await batchDelete(
            TABLE_MESSAGE ?? '',
            conversationIds
          );
          console.log('deletedConversations: ', deletedConversations);
        } catch (err: any) {
          console.log('ERROR get conversations: ', err);
        }
      }
    }
  }
};
