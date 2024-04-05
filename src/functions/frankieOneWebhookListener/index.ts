const { FUNCTION_FRANKIEONEWEBHOOKHANDLER } = process.env;
import {
  InvocationType,
  InvokeCommand,
  LambdaClient,
} from '@aws-sdk/client-lambda';
import { APIGatewayProxyHandler } from 'aws-lambda';

const lambda = new LambdaClient({ apiVersion: '2015-03-31' });

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log(`EVENT RECEIVED: ${JSON.stringify(event)}`);

  //TODO: validate request

  if (event.body) {
    try {
      const payload = JSON.parse(event.body);
      console.log('payload: ', payload);
      const params = {
        FunctionName: FUNCTION_FRANKIEONEWEBHOOKHANDLER,
        InvocationType: InvocationType.Event, // | RequestResponse | DryRun - event = not wait for response
        Payload: Buffer.from(
          JSON.stringify({
            webhookEvent: { payload },
          })
        ),
      };
      const command = new InvokeCommand(params);
      await lambda.send(command);
    } catch (err: any) {
      console.log('ERROR invoke frankieone handler: ', err);
      throw new Error(err.message);
    }
  }

  return {
    statusCode: 200,
    body: 'Frankieone webhook listener executed successfully',
  };
};
