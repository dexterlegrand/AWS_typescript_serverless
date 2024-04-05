const { AUTH_USERPOOLID, TABLE_TEAM, TABLE_TEAMUSER, TABLE_USER } = process.env;
import { deleteRecord, getRecord, updateRecord } from '/opt/dynamoDB';

import { updateCustomAttributes } from '/opt/cognito';
import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import { AppSyncResolverHandler } from 'aws-lambda';

export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  const { sub } = ctx.identity as AppSyncIdentityCognito;
  const { id } = ctx.arguments.input;

  let teamUser;
  try {
    teamUser = await getRecord(TABLE_TEAMUSER ?? '', { id });
  } catch (err: any) {
    console.log('ERROR get team user: ', err);
    throw new Error(err.message);
  }

  if (teamUser.userId === sub) {
    throw new Error('Team owner cannot delete themself');
  }

  let team;
  try {
    team = await getRecord(TABLE_TEAM ?? '', { id: teamUser.teamId });
  } catch (err: any) {
    console.log('err get team: ', err);
  }

  let deletedTeamUser;
  if (teamUser.userId === sub || team.owner === sub) {
    try {
      deletedTeamUser = await deleteRecord(TABLE_TEAMUSER ?? '', { id });
      console.log('deletedTeamUser: ', deletedTeamUser);
    } catch (err: any) {
      console.log('ERROR: deletedTeamUser: ', err);
      throw new Error(err.message);
    }
  } else {
    throw new Error('Not authorised to delete team user');
  }

  try {
    const keys = {
      id: teamUser.userId,
    };

    const userParams = {
      teamId: null,
    };

    await updateRecord(TABLE_USER ?? '', keys, userParams, 'REMOVE');
  } catch (err: any) {
    console.log('ERROR update user: ', err.message);
    throw new Error(err.message);
  }

  try {
    const cognitoParams = [
      {
        Name: 'custom:teamId',
        Value: null,
      },
    ];

    await updateCustomAttributes(AUTH_USERPOOLID ?? '', sub, cognitoParams);
  } catch (err: any) {
    console.log('ERROR update custom attribute', err);
    throw new Error(err.message);
  }

  return deletedTeamUser;
};
