const { AUTH_USERPOOLID, TABLE_TEAM, TABLE_TEAMUSER, TABLE_USER } = process.env;
import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import { AppSyncResolverHandler } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { createRecord, updateRecord } from '/opt/dynamoDB';
import { updateCustomAttributes } from '/opt/cognito';

export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  const { sub } = ctx.identity as AppSyncIdentityCognito;
  const { title } = ctx.arguments.input;
  const createdAt = new Date().toISOString();

  const teamParams = {
    id: randomUUID(),
    title,
    createdAt,
    owner: sub,
    updatedAt: createdAt,
  };
  try {
    await createRecord(TABLE_TEAM ?? '', teamParams);
  } catch (err: any) {
    console.log('ERROR create team: ', err);
  }

  // create team member
  const teamUserParams = {
    id: randomUUID(),
    teamId: teamParams.id,
    userId: sub,
    createdBy: sub,
    createdAt,
    owners: [sub],
    updatedAt: createdAt,
  };
  try {
    await createRecord(TABLE_TEAMUSER ?? '', teamUserParams);
  } catch (err: any) {
    console.log('ERROR create team user: ', err);
  }

  // update user with team id
  try {
    const keys = {
      id: sub,
    };

    const userParams = {
      teamId: teamParams.id,
      updatedAt: new Date().toISOString(),
    };

    await updateRecord(TABLE_USER ?? '', keys, userParams);
  } catch (err: any) {
    console.log('ERROR update user: ', err.message);
    throw new Error(err.message);
  }

  try {
    const cognitoParams = [
      {
        Name: 'custom:teamId',
        Value: teamParams.id,
      },
    ];

    await updateCustomAttributes(AUTH_USERPOOLID ?? '', sub, cognitoParams);
  } catch (err: any) {
    console.log('ERROR update custom attribute', err);
    throw new Error(err.message);
  }

  return teamParams;
};
