import { PostConfirmationTriggerEvent } from 'aws-lambda';
const { FUNCTION_CREATEUSER } = process.env;
import {
  LambdaClient,
  InvokeCommand,
  InvocationType,
} from '@aws-sdk/client-lambda';
const lambda = new LambdaClient({ apiVersion: '2015-03-31' });
export const handler = async (event: PostConfirmationTriggerEvent) => {
  console.log('event', event);
  if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
    const { userName, userPoolId } = event;
    const { userAttributes } = event.request;

    const params = {
      FunctionName: FUNCTION_CREATEUSER,
      InvocationType: InvocationType.Event, // | RequestResponse | DryRun - event = not wait for response
      Payload: Buffer.from(
        JSON.stringify({ userAttributes, userName, userPoolId })
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

  //TODO: anything for forgot password?

  return event;
};
