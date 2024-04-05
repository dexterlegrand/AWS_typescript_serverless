import { unmarshall } from '@aws-sdk/util-dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb';

const { ANALYTICS_PINPOINT_ID, TABLE_CONVERSATION } = process.env;
import { sendPushNotification } from '/opt/pinpoint';
import { DynamoDBStreamHandler } from 'aws-lambda';

import { getRecord } from '/opt/dynamoDB';

console.log('ANALYTICS_PINPOINT_ID: ', ANALYTICS_PINPOINT_ID);

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export const handler: DynamoDBStreamHandler = async (event) => {
  for (let i = 0; i < event.Records.length; i++) {
    const data = event.Records[i];

    // record created
    if (data.eventName === 'INSERT' && data?.dynamodb?.NewImage) {
      const message = unmarshall(
        data.dynamodb.NewImage as { [key: string]: AttributeValue }
      );
      console.log('message: ', message);

      if (message?.text?.length >= 0) {
        // get conversation
        let conversation;
        try {
          conversation = await getRecord(TABLE_CONVERSATION ?? '', {
            id: message.conversationId,
          });
        } catch (err: any) {
          console.log('ERROR get conversation: ', err);
        }

        if (conversation) {
          const params = {
            pinpointAppId: ANALYTICS_PINPOINT_ID ?? '',
            userId: message.receiver,
            title: conversation.title,
            message: message.text,
            data: {
              conversationId: message.conversationId,
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
  }
};
