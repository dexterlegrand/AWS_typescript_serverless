import { decodeNotificationPayload } from 'app-store-server-api';
import {
  LambdaClient,
  InvokeCommand,
  InvocationType,
} from '@aws-sdk/client-lambda';

const lambda = new LambdaClient({ apiVersion: '2015-03-31' });
const { APPLE_BUNDLE_ID, FUNCTION_APPLEWEBHOOKHANDLER } = process.env;

interface AppleWebhookListenerContext {
  body: string;
}

export const handler = async (ctx: AppleWebhookListenerContext) => {
  console.log(`EVENT received: ${JSON.stringify(ctx)}`);
  const { body } = ctx;

  // signedPayload is the body sent by Apple
  const parsedBody = JSON.parse(body);
  console.log('parsedBodyparsedBodyparsedBody: ', parsedBody);
  const payload = await decodeNotificationPayload(parsedBody.signedPayload);

  // You might want to check that the bundle ID matches that of your app
  if (payload.data.bundleId === APPLE_BUNDLE_ID) {
    console.log('payload: ', payload);
    console.log('payload.data: ', payload.data);

    // Handle the notification...
    const params = {
      FunctionName: FUNCTION_APPLEWEBHOOKHANDLER,
      InvocationType: InvocationType.Event, // | RequestResponse | DryRun - event = not wait for response
      Payload: Buffer.from(JSON.stringify({ webhookEvent: payload })),
    };

    try {
      const command = new InvokeCommand(params);
      await lambda.send(command);
    } catch (err: any) {
      console.log('ERROR invoke lambda: ', err);
    }
  }
};
