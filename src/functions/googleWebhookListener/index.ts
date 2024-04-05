const { FUNCTION_GOOGLEWEBHOOKHANDLER, GOOGLE_BUNDLE_ID } = process.env;
import {
  LambdaClient,
  InvokeCommand,
  InvocationType,
} from '@aws-sdk/client-lambda';

const lambda = new LambdaClient({ apiVersion: '2015-03-31' });
import { createResponse } from '/opt/lambda';
import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (
  event,
  _context,
  callback
): Promise<any> => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  if (event.body) {
    let b64string;
    try {
      const body = JSON.parse(event.body);
      b64string = body.message.data;
      console.log('b64string: ', b64string);
    } catch (err: any) {
      console.log('ERROR get base64: ', err);
    }

    let data;
    try {
      const bufferString = Buffer.from(b64string, 'base64').toString();
      data = JSON.parse(bufferString);
      console.log('data: ', data);
    } catch (err: any) {
      console.log('ERROR Buffer.from: ', err);
    }

    // Handle the notification if correct app
    if (data.packageName === GOOGLE_BUNDLE_ID) {
      const params = {
        FunctionName: FUNCTION_GOOGLEWEBHOOKHANDLER,
        InvocationType: InvocationType.Event, // | RequestResponse | DryRun - event = not wait for response
        Payload: Buffer.from(
          JSON.stringify({ webhookEvent: data.subscriptionNotification })
        ),
      };

      try {
        const command = new InvokeCommand(params);
        await lambda.send(command);
      } catch (err: any) {
        console.log('ERROR invoke create user: ', err);
        throw new Error(err.message);
      }
    }
  }

  try {
    callback(null, createResponse(200, {}));
  } catch (err: any) {
    console.log('ERROR webhook response: ', err);
  }
};
