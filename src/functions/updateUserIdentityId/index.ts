import { updateCustomAttributes } from '/opt/cognito';
import { updateRecord } from '/opt/dynamoDB';
import { APIGatewayEvent } from 'aws-lambda';
import {
  CognitoIdentityClient,
  GetIdCommand,
} from '@aws-sdk/client-cognito-identity';
const { AUTH_IDENTITYPOOLID, AUTH_USERPOOLID, TABLE_USER } = process.env;

export const handler = async (event: APIGatewayEvent) => {
  console.log('EVENT received: ', JSON.stringify(event));
  const sub = event.requestContext.authorizer?.claims?.sub;

  const client = new CognitoIdentityClient();
  const providerName = event?.requestContext?.authorizer?.claims?.iss.replace(
    'https://',
    ''
  );

  const input = {
    IdentityPoolId: AUTH_IDENTITYPOOLID ?? '',
    Logins: {
      [providerName]: event.headers.Authorization ?? '',
    },
  };

  console.log('input: ', input);

  const command = new GetIdCommand(input);
  const { IdentityId } = await client.send(command);

  console.log('IdentityId: ', IdentityId);

  // update custom attribute
  try {
    const cognitoParams = [
      {
        Name: 'custom:identityId',
        Value: IdentityId,
      },
    ];

    await updateCustomAttributes(AUTH_USERPOOLID ?? '', sub, cognitoParams);
  } catch (err: any) {
    console.log('ERROR update custom attribute', err);
    throw new Error(err.message);
  }

  // update user record
  try {
    const userParams = {
      identityId: IdentityId,
    };

    await updateRecord(TABLE_USER ?? '', { id: sub }, userParams);
  } catch (err: any) {
    console.log('ERROR update user record', err);
    throw new Error(err.message);
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT',
    },
    body: JSON.stringify({ identityId: IdentityId }),
  };
};
