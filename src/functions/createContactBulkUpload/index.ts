import { validateIsEntityUser } from '/opt/entity';
import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import { AppSyncResolverHandler } from 'aws-lambda';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
const { REGION, SQS_QUEUE_URL } = process.env;
const sqs = new SQSClient({ region: REGION });

export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  console.log(`EVENT: ${JSON.stringify(ctx)}`);
  const { claims, sub } = ctx.identity as AppSyncIdentityCognito;
  const { entityId, fileKey, fields } = ctx.arguments.input;

  // get entity user
  try {
    await validateIsEntityUser({ entityId, userId: sub });
  } catch (err: any) {
    console.log('ERROR validate entity user: ', err);
    throw new Error(err.message);
  }

  // TODO: ensure duplication message does not occur by using fileKey as unique ID
  // send bulk upload contact to sqs queue
  const params = {
    MessageBody: `Bulk upload contacts - entityId: ${entityId} fileKey: ${fileKey} createdBy: ${sub}`,
    MessageAttributes: {
      entityId: {
        DataType: 'String',
        StringValue: entityId,
      },
      userId: {
        DataType: 'String',
        StringValue: sub,
      },
      identityId: {
        DataType: 'String',
        StringValue: claims['custom:identityId'],
      },
      fileKey: {
        DataType: 'String',
        StringValue: fileKey,
      },
      fields: {
        DataType: 'String',
        StringValue: JSON.stringify(fields),
      },
    },
    QueueUrl: SQS_QUEUE_URL,
    //MessageDeduplicationId: fileKey
  };

  try {
    const command = new SendMessageCommand(params);
    const response = await sqs.send(command);
    console.log('response: ', response);
  } catch (err: any) {
    console.log('Error send SQS message', err);
    throw new Error(err.message);
  }
};
