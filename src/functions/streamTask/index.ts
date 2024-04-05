import { createRecord } from '/opt/dynamoDB';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { uuid4 } from '@sentry/utils';
import { DynamoDBStreamHandler } from 'aws-lambda';
const { TABLE_ACTIVITY } = process.env;

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export const handler: DynamoDBStreamHandler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  for (let i = 0; i < event.Records.length; i++) {
    const data = event.Records[i];

    // record created
    if (data.eventName === 'INSERT' && data?.dynamodb?.NewImage) {
      const task = unmarshall(
        data.dynamodb.NewImage as { [key: string]: AttributeValue }
      );

      console.log('task: ', task);

      // create record in activity table
      const createdAt = new Date().toISOString();
      const activityParams = {
        id: uuid4(),
        compositeId: `${task.entityId}#${task.id}`,
        message: 'TASK_CREATED',
        userId: task.createdBy,
        entityId: task.entityId,
        type: 'TASK',
        createdAt,
        updatedAt: createdAt,
      };

      console.log('activityParams: ', activityParams);

      try {
        await createRecord(TABLE_ACTIVITY ?? '', activityParams);
      } catch (error) {
        console.log('ERROR create task activity: ', error);
      }
    }

    // record updated
    if (
      data.eventName === 'MODIFY' &&
      data?.dynamodb?.NewImage &&
      data?.dynamodb?.OldImage
    ) {
      const newTask = unmarshall(
        data.dynamodb.NewImage as { [key: string]: AttributeValue }
      );
      const oldTask = unmarshall(
        data.dynamodb.OldImage as { [key: string]: AttributeValue }
      );
      console.log('newTask: ', newTask);
      console.log('oldTask: ', oldTask);

      //TOOD: activity statuses
      // mark as paid activity status

      // paid / completed
    }
  }
};
