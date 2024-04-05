import { createRecord } from '/opt/dynamoDB';
import { USER_GROUPS, adminAddUserToGroup } from '/opt/cognito';
import { OnboardingStatus } from '/opt/API';

const { TABLE_USER, MIXPANEL_TOKEN } = process.env;

import * as mixpanelPackage from 'mixpanel';

const mixpanel = mixpanelPackage.init(MIXPANEL_TOKEN ?? '');

import * as util from 'util';

const trackAsync = util.promisify(mixpanel.track);

export type CreateUserEvent = {
  userPoolId: string; // userPoolId past to function to prevent circular dependency with Auth
  userAttributes: any;
  userName: string;
};

export const handler = async (event: CreateUserEvent) => {
  console.log('event received:', event);
  const { userPoolId, userAttributes, userName } = event; // https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html

  if (!userPoolId) {
    throw new Error('userPoolId not provided');
  }

  const createdAt = new Date().toISOString();
  let userParams: any = {
    id: userAttributes.sub,
    email: userAttributes.email || null,
    phone: userAttributes.phone_number || null,
    userType: userAttributes['custom:userType'] || null,
    identityId: userAttributes['custom:identityId'] || null,
    firstName: userAttributes.given_name || null,
    lastName: userAttributes.family_name || null,
    locale: userAttributes.locale || null,
    blocked: [],
    blockedBy: [],
    interests: [],
    onboardingStatus: OnboardingStatus.PROFILE,
    owner: userAttributes.sub,
    profileImg: null,
    reportReasons: [],
    notificationPreferences: {
      email: true,
      push: true,
      sms: true,
    },
    createdAt,
    updatedAt: createdAt,
  };

  if (userAttributes?.xeroUserId) {
    userParams = {
      ...userParams,
      xeroUserId: userAttributes.xeroUserId,
    };
  }

  if (userAttributes?.xeroDecodedIdToken) {
    userParams = {
      ...userParams,
      xeroDecodedIdToken: userAttributes.xeroDecodedIdToken,
    };
  }

  if (userAttributes?.xeroTokenSet) {
    userParams = {
      ...userParams,
      xeroTokenSet: userAttributes.xeroTokenSet,
    };
  }

  if (userAttributes?.xeroActiveTenant) {
    userParams = {
      ...userParams,
      xeroActiveTenant: userAttributes.xeroActiveTenant,
    };
  }

  if (userAttributes?.xeroSession) {
    userParams = {
      ...userParams,
      xeroSession: userAttributes.xeroSession,
    };
  }

  try {
    console.log('create user props: ', userParams);
    await createRecord(TABLE_USER ?? '', userParams);
  } catch (err: any) {
    console.log('ERROR create user: ', err);
  }

  const addUserParams = {
    GroupName: USER_GROUPS.USERS,
    UserPoolId: userPoolId,
    Username: userName,
  };

  try {
    await adminAddUserToGroup(addUserParams);
  } catch (err: any) {
    console.log('error adding to group', err);
  }

  try {
    await mixpanel.people.set(userAttributes.sub, {
      $first_name: userAttributes.given_name || null,
      $last_name: userAttributes.family_name || null,
      $email: userAttributes.email,
      $phone: userAttributes.phone_number || null,
      $created: createdAt,
    });
  } catch (err: any) {
    console.log('ERROR mixpanel people set', err);
  }

  try {
    //@ts-ignore
    await trackAsync('Signup', {
      distinct_id: userAttributes.sub,
    });
  } catch (err: any) {
    console.log('ERROR mixpanel track Signup', err);
  }

  return userParams;
};
