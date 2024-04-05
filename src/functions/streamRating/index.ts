import { unmarshall } from '@aws-sdk/util-dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb';

const { ANALYTICS_PINPOINT_ID } = process.env;
import { DynamoDBStreamHandler } from 'aws-lambda';

console.log('ANALYTICS_PINPOINT_ID: ', ANALYTICS_PINPOINT_ID);

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export const handler: DynamoDBStreamHandler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  for (let i = 0; i < event.Records.length; i++) {
    const data = event.Records[i];

    // record created
    if (data.eventName === 'INSERT' && data?.dynamodb?.NewImage) {
      const rating = unmarshall(
        data.dynamodb.NewImage as { [key: string]: AttributeValue }
      );

      console.log('rating: ', rating);
    }

    // record updated
    if (
      data.eventName === 'MODIFY' &&
      data?.dynamodb?.NewImage &&
      data?.dynamodb?.OldImage
    ) {
      const newRating = unmarshall(
        data.dynamodb.NewImage as { [key: string]: AttributeValue }
      );
      const oldRating = unmarshall(
        data.dynamodb.OldImage as { [key: string]: AttributeValue }
      );
      console.log('newRating: ', newRating);
      console.log('oldRating: ', oldRating);
    }
  }
};
