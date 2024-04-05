import {
  adminAddUserToGroup,
  adminListGroupsForUser,
  adminRemoveUserFromGroup,
  isSuperAdminFromClaims,
} from '/opt/cognito';
import { updateRecord } from '/opt/dynamoDB';
import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import { AppSyncResolverHandler } from 'aws-lambda';
import { UpdateAdminMutationVariables } from '../../appsync/API';
import { USER_GROUPS } from '../../appsync/helpers/cognito';

const { AUTH_USERPOOLID, TABLE_ADMIN } = process.env;

const updateAdminGroup = async (
  id: string,
  existingGroup: string,
  newGroup: string
) => {
  try {
    const input = {
      GroupName: existingGroup,
      UserPoolId: AUTH_USERPOOLID,
      Username: id,
    };

    await adminRemoveUserFromGroup(input);
  } catch (err: any) {
    console.log('Error adding admin group', err);
    throw new Error(err.message);
  }

  // add admin to group
  try {
    const params = {
      GroupName: newGroup,
      UserPoolId: AUTH_USERPOOLID,
      Username: id,
    };

    await adminAddUserToGroup(params);
  } catch (err: any) {
    console.log('Error adding admin group', err);
    throw new Error(err.message);
  }
};

export const handler: AppSyncResolverHandler<
  UpdateAdminMutationVariables,
  any
> = async (ctx) => {
  console.log(`Event: ${JSON.stringify(ctx)}`);
  const { claims } = ctx.identity as AppSyncIdentityCognito;
  const {
    input: { id, ...updateData },
  } = ctx.arguments;

  if (!isSuperAdminFromClaims(claims)) {
    throw new Error('Not authorised to update admin');
  }

  const updatedAt = new Date().toISOString();
  const adminParams = {
    ...updateData,
    updatedAt,
  };

  let updatedAdmin;
  try {
    updatedAdmin = updateRecord(TABLE_ADMIN ?? '', { id }, adminParams);
  } catch (err: any) {
    console.error('ERROR update admin: ', err);
    throw new Error(err.message);
  }

  let userGroups;
  try {
    const params = {
      Username: id,
      UserPoolId: AUTH_USERPOOLID,
    };
    userGroups = await adminListGroupsForUser(params);
  } catch (err: any) {
    console.log('Error updating admin groups', err);
    throw new Error(err.message);
  }

  if (userGroups?.Groups && userGroups.Groups.length > 0) {
    console.log('userGroups: ', userGroups);
    for (const userGroup in userGroups.Groups) {
      console.log('userGroup: ', userGroup);

      // update admin group if role updated
      if (
        //@ts-ignore //TODO: why userGroup?.GroupName not working, it's correct type
        (userGroup?.GroupName === USER_GROUPS.ADMINS &&
          updateData?.role === USER_GROUPS.SUPER_ADMINS) ||
        //@ts-ignore
        (userGroup?.GroupName === USER_GROUPS.ADMINS &&
          updateData?.role === USER_GROUPS.SUPER_ADMINS)
      ) {
        //@ts-ignore
        await updateAdminGroup(id, userGroup?.GroupName, updateData?.role);
      }
    }
  }

  return updatedAdmin;
};
