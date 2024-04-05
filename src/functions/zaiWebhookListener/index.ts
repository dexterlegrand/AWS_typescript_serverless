const { ENV, REGION, FUNCTION_ZAIWEBHOOKHANDLER } = process.env;
import {
  InvocationType,
  InvokeCommand,
  LambdaClient,
} from '@aws-sdk/client-lambda';
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { createHmac } from 'crypto';

const isProd = ENV === 'prod';

const secretManager = new SecretsManagerClient({ region: REGION });
const lambda = new LambdaClient({ apiVersion: '2015-03-31' });

let zaiWebhookSecret: string;
const initZai = async () => {
  if (!zaiWebhookSecret) {
    try {
      const zaiEnv = isProd ? 'prod' : 'dev';
      const response = await secretManager.send(
        new GetSecretValueCommand({ SecretId: `ZaiSecrets-${zaiEnv}` })
      );

      // access zaiWebhookSecret from secret
      if (response.SecretString) {
        const secrets = JSON.parse(response.SecretString);
        zaiWebhookSecret = secrets.zaiWebhookSecret;
      }
    } catch (err: any) {
      console.log('ERROR get secret: ', err);
      throw new Error(err.message);
    }
  }
};

// zai webhook listener
export const handler: APIGatewayProxyHandler = async (event) => {
  console.log(`EVENT RECEIVED: ${JSON.stringify(event)}`);
  const signatureHeader = event.headers['webhooks-signature'];
  console.log('signatureHeader: ', signatureHeader);

  if (!signatureHeader) {
    return {
      statusCode: 400,
      body: 'No Webhooks-signature header',
    };
  }

  await initZai();

  console.log('event.body: ', event.body);

  const [timestamp, signature] = signatureHeader.split(',');
  console.log('timestamp: ', timestamp);
  console.log('signature: ', signature);

  // timestamp key and value
  const [, timestampValue] = timestamp.split('=');
  //console.log('timestampKey: ', timestampKey);
  console.log('timestampValue: ', timestampValue);

  // signature key and value
  const [, signatureValue] = signature.split('=');
  //console.log('signatureKey: ', signatureKey);
  console.log('signatureValue: ', signatureValue);

  const signedPayload = `${timestampValue}.${event.body}`;

  //const expectedSignature = crypto.createHmac('sha256', zaiWebhookSecret)
  //  .update(signedPayload)
  //  .digest('base64');

  //
  const expectedSignature = createHmac('sha256', zaiWebhookSecret)
    .update(signedPayload)
    .digest('base64url')
    .toString();

  console.log('expectedSignature: ', expectedSignature);

  // ensure signature is valid (matches expected signature)
  if (signatureValue !== expectedSignature) {
    return {
      statusCode: 400,
      body: 'Invalid signature',
    };
  }

  // ensure signed payload is within 5 minutes
  const timeDifference = Math.abs(Date.now() / 1000 - Number(timestampValue));
  if (timeDifference > 300) {
    // 5 minutes tolerance
    return {
      statusCode: 400,
      body: 'Timestamp out of 5 minute allowed range',
    };
  }

  // send data to handler function
  if (event.body) {
    try {
      const payload = JSON.parse(event.body);
      console.log('payload: ', payload);
      const params = {
        FunctionName: FUNCTION_ZAIWEBHOOKHANDLER,
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
      console.log('ERROR invoke zai webhook handler: ', err);
      throw new Error(err.message);
    }
  }
  return {
    statusCode: 200,
    body: 'Zai webook listener executed successfully',
  };
};

// Webhooks-signature includes a signature
// Webhooks-signature includes a timestamp
// timestamp is also verified by the signature

//timestamp and signature are generated each time Zai sends an event to your endpoint. If Zai retries an event, a new signature and timestamp is generated.
