const { TABLE_PAYMENTS } = process.env;
import { Payment, PaymentStatus } from '/opt/API';
import { updateRecord } from '/opt/dynamoDB';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ScheduledEvent, Context } from 'aws-lambda';
import { DateTime } from 'luxon';

const DdbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DdbClient);

const queryCustomerConfirmPayments = async () => {
  const today = DateTime.now().setZone('Australia/Sydney').toISODate();
  const twoDaysFromNow = DateTime.now()
    .setZone('Australia/Sydney')
    .plus({ days: 2 })
    .toISODate();
  console.log('Dates between: ', today, twoDaysFromNow);

  let nextToken = undefined;
  let allItems: (Payment | Record<string, any>)[] = [];

  do {
    const params = {
      TableName: TABLE_PAYMENTS,
      IndexName: 'paymentsByStatus',
      KeyConditionExpression:
        '#status = :status and #scheduledAt BETWEEN :today AND :twoDaysFromNow',
      ExpressionAttributeNames: {
        '#status': 'status',
        '#scheduledAt': 'scheduledAt',
      },
      ExpressionAttributeValues: {
        ':status': PaymentStatus.SCHEDULED,
        ':today': today,
        ':twoDaysFromNow': twoDaysFromNow,
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

export const handler = async (event: ScheduledEvent, context: Context) => {
  console.log('Cron Lambda triggered with event:', event);
  console.log('Context:', context);

  let payments;
  try {
    payments = await queryCustomerConfirmPayments();
  } catch (err: any) {
    console.log('ERROR queryScheduledPayments: ', err);
    throw new Error(err.message);
  }

  console.log('customer pending payments: ', payments);

  if (payments?.length > 0) {
    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i] as Payment;
      console.log('payment: ', payment);

      // update payment to status PENDING_USER_CONFIRMATION
      let updatedPayment;
      try {
        updatedPayment = await updateRecord(
          TABLE_PAYMENTS ?? '',
          {
            id: payment.id,
          },
          { status: PaymentStatus.PENDING_USER_CONFIRMATION }
        );
        console.log('updatedPayment: ', updatedPayment);
      } catch (err: any) {
        console.log('ERROR update payment: ', err);
        //throw new Error(err.message);
      }
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Payment user confirmation cron job executed successfully',
    }),
  };
};
