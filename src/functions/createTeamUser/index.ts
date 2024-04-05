const { AUTH_USERPOOLID, TABLE_TEAM, FUNCTION_CREATEUSER } = process.env;
import { createRecord, getRecord } from '/opt/dynamoDB';
import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import { AppSyncResolverHandler } from 'aws-lambda';
import { randomUUID } from 'crypto';
import {
  LambdaClient,
  InvokeCommand,
  InvocationType,
} from '@aws-sdk/client-lambda';
import {
  createCognitoUser,
  getCognitoUser,
  updateCustomAttributes,
} from '/opt/cognito';

const lambda = new LambdaClient({ apiVersion: '2015-03-31' });

export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  const { sub } = ctx.identity as AppSyncIdentityCognito;
  const { teamId, firstName, lastName, email } = ctx.arguments.input;

  // get team
  let team;
  try {
    team = await getRecord(TABLE_TEAM ?? '', { id: teamId });
  } catch (err: any) {
    console.log('ERROR get team: ', err);
    throw new Error(err.message);
  }

  // check sub is team owner
  if (team.owner !== sub) {
    throw new Error('Not authorised to add team user');
  }

  // check existing cognito user
  let cognitoUser;
  try {
    cognitoUser = await getCognitoUser(AUTH_USERPOOLID ?? '', email);
    console.log('Existing cognito user: ', cognitoUser);
  } catch (err: any) {
    if (err.code !== 'UserNotFoundException') {
      console.log('err get cognito user: ', err);
      throw new Error(err.message);
    }
  }

  console.log('cognitoUser: ', cognitoUser);

  // create cognito if not
  if (!cognitoUser) {
    const cognitoParams = {
      firstName,
      lastName,
      email,
      'custom:teamId': team.id,
    };

    try {
      const { User } = await createCognitoUser(
        AUTH_USERPOOLID ?? '',
        cognitoParams
      );
      cognitoUser = User;
      console.log('New cognito user: ', cognitoUser);
    } catch (err: any) {
      console.log('err create cognito user: ', err);
      throw new Error(err.message);
    }

    const userAttributes = {
      sub: cognitoUser?.Username,
      email,
      given_name: firstName,
      family_name: lastName,
      'custom:teamId': team.id,
    };

    const params = {
      FunctionName: FUNCTION_CREATEUSER,
      InvocationType: InvocationType.RequestResponse, // | RequestResponse | DryRun - event = not wait for response
      Payload: Buffer.from(
        JSON.stringify({
          userPoolId: AUTH_USERPOOLID,
          userAttributes,
          userName: cognitoUser?.Username,
        })
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

  // create team user
  const createdAt = new Date().toISOString();
  const teamUserParams = {
    id: randomUUID(),
    teamId: team.id,
    userId: cognitoUser?.Username,
    owner: sub, // owner is team owner
    owners: [sub, cognitoUser?.Username],
    createdBy: sub,
    createdAt,
    updatedAt: createdAt,
  };
  try {
    await createRecord(TABLE_TEAM ?? '', teamUserParams);
  } catch (err: any) {
    console.log('err create team user: ', err);
    throw new Error(err.message);
  }

  if (!cognitoUser) {
    try {
      const cognitoParams = [
        {
          Name: 'custom:teamId',
          Value: team.id,
        },
      ];

      await updateCustomAttributes(AUTH_USERPOOLID ?? '', sub, cognitoParams);
    } catch (err: any) {
      console.log('ERROR update custom attribute', err);
      throw new Error(err.message);
    }
  }

  return teamUserParams;
};
