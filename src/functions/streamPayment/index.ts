const { ANALYTICS_PINPOINT_ID, REGION, TABLE_ENTITY, TABLE_USER } = process.env;
import {
  Payment,
  PaymentStatus,
  Task,
  TaskPaymentStatus,
  TaskSearchStatus,
  TaskSignatureStatus,
  TaskStatus,
} from '/opt/API';
import { getRecord, updateRecord } from '/opt/dynamoDB';
import {
  ChannelType,
  MessageType,
  PinpointClient,
  SendMessagesCommand,
} from '@aws-sdk/client-pinpoint';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { AttributeValue, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBStreamHandler } from 'aws-lambda';
import { DateTime } from 'luxon';

const DdbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DdbClient);
const pinpoint = new PinpointClient({ region: REGION }); // replace with your region

const { TABLE_TASKS, TABLE_PAYMENTS } = process.env;

const queryTaskPayments = async (taskId: string) => {
  const today = DateTime.now().setZone('Australia/Sydney').toISODate();
  console.log("today's date: ", today);

  let nextToken = undefined;
  let allItems: (Payment | Record<string, any>)[] = [];

  do {
    const params = {
      TableName: TABLE_PAYMENTS,
      IndexName: 'paymentsByTask',
      KeyConditionExpression: '#taskId = :taskId',
      ExpressionAttributeNames: {
        '#taskId': 'taskId',
      },
      ExpressionAttributeValues: {
        ':taskId': taskId,
      },
      ExclusiveStartKey: nextToken,
    };

    const command: QueryCommand = new QueryCommand(params);
    const data = await docClient.send(command);
    if (data.Items) {
      allItems = [...allItems, ...data.Items];
    }
    nextToken = data.LastEvaluatedKey;
  } while (nextToken);

  return allItems;
};

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export const handler: DynamoDBStreamHandler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  for (let i = 0; i < event.Records.length; i++) {
    const data = event.Records[i];

    // record created
    if (data.eventName === 'INSERT' && data?.dynamodb?.NewImage) {
      const payment = unmarshall(
        data.dynamodb.NewImage as { [key: string]: AttributeValue }
      );

      console.log('payment: ', payment);
    }

    // record updated
    if (
      data.eventName === 'MODIFY' &&
      data?.dynamodb?.NewImage &&
      data?.dynamodb?.OldImage
    ) {
      const newPayment = unmarshall(
        data.dynamodb.NewImage as { [key: string]: AttributeValue }
      );
      const oldPayment = unmarshall(
        data.dynamodb.OldImage as { [key: string]: AttributeValue }
      );
      console.log('newPayment: ', newPayment);
      console.log('oldPayment: ', oldPayment);

      // update task status to paid if all installments are paid
      if (
        oldPayment?.paymentStatus !== PaymentStatus.COMPLETED &&
        newPayment?.paymentStatus === PaymentStatus.COMPLETED
      ) {
        // check if all payments made are completed
        let taskPayments: Payment[] | Record<string, any> = [];
        try {
          taskPayments = await queryTaskPayments(newPayment.taskId);
          console.log('taskPayments: ', taskPayments);
        } catch (err: any) {
          console.log('ERROR get task payments: ', err);
        }

        // if all payments made are status completed, update task status to paid
        const isCompleted =
          taskPayments?.length > 0 &&
          taskPayments?.every(
            (payment: Payment) => payment.status === PaymentStatus.COMPLETED
          );
        console.log('isCompleted: ', isCompleted);
        if (isCompleted) {
          // get task
          let task: Task = {} as Task;
          try {
            task = await getRecord(TABLE_TASKS ?? '', {
              id: newPayment.taskId,
            });
          } catch (err: any) {
            console.log('ERROR get task record: ', err);
          }

          console.log('task to update?: ', task);

          // if task is not already paid, update task status to paid
          if (task?.paymentStatus !== TaskPaymentStatus.PAID) {
            const taskParams: any = {
              paymentStatus: TaskPaymentStatus.PAID,
              updatedAt: new Date().toISOString(),
            };

            if (
              task?.status !== TaskStatus.COMPLETED &&
              task.signatureStatus !== TaskSignatureStatus.PENDING_SIGNATURE
            ) {
              taskParams.status = TaskStatus.COMPLETED;
              taskParams.fromSearchStatus = `${task.fromId}#${TaskSearchStatus.COMPLETED}`;
              taskParams.toSearchStatus = `${task.toId}#${TaskSearchStatus.COMPLETED}`;
            }

            console.log('taskParams: ', taskParams);

            try {
              await updateRecord(
                TABLE_TASKS ?? '',
                { id: newPayment.taskId },
                taskParams
              );
            } catch (err: any) {
              console.log('ERROR update task record', err);
            }
          }
        }
      }

      // send notification if payment requires user confirmation
      if (
        oldPayment?.paymentStatus !== PaymentStatus.PENDING_USER_CONFIRMATION &&
        newPayment?.paymentStatus === PaymentStatus.PENDING_USER_CONFIRMATION
      ) {
        let entity;
        try {
          entity = await getRecord(TABLE_ENTITY ?? '', {
            id: newPayment.fromId,
          });
        } catch (err: any) {
          console.log('ERROR get entity: ', err);
          throw new Error(err.message);
        }

        let user;
        try {
          user = await getRecord(TABLE_USER ?? '', { id: entity.owner });
          console.log('user: ', user);
        } catch (err: any) {
          console.log('ERROR get user: ', err);
          throw new Error(err.message);
        }

        // send user sms
        if (newPayment.amount && user.phone && newPayment.scheduledAt) {
          let entityTo; //seller
          try {
            entityTo = await getRecord(TABLE_ENTITY ?? '', {
              id: newPayment.toId,
            });
            console.log('entityTo: ', entityTo);
          } catch (err: any) {
            console.log('ERROR get entity: ', err);
            throw new Error(err.message);
          }

          //TODO: handle if to is contact

          const amountInDollars = (newPayment.amount / 100).toFixed(2);
          const companyName = entityTo.name.substring(0, 5) + '...';
          const scheduledDate = DateTime.fromISO(
            newPayment.scheduledAt
          ).toFormat('dd/LL/yy');

          const params = {
            ApplicationId: ANALYTICS_PINPOINT_ID ?? '', // replace with your Application ID
            MessageRequest: {
              Addresses: {
                [user.phone]: {
                  // replace with the recipient's phone number
                  ChannelType: ChannelType.SMS,
                },
              },
              MessageConfiguration: {
                SMSMessage: {
                  Body: `Your payment of $${amountInDollars} to ${companyName} is scheduled on ${scheduledDate}. As a security measure we require confirmation. Reply 'YES' or log into admiin.com to confirm`,
                  MessageType: MessageType.TRANSACTIONAL,
                  //OriginationNumber: '+0987654321' // replace with your origination number
                },
              },
            },
          };

          try {
            const command = new SendMessagesCommand(params);
            const data = await pinpoint.send(command);
            console.log('Message response: ', data); // successful response
          } catch (err: any) {
            console.log(err, err.stack); // an error occurred
          }
        }
      }
    }
  }
};
