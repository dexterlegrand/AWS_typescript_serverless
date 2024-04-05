const { AUTH_USERPOOLID, ENV, TABLE_USER, MIXPANEL_TOKEN } = process.env;
import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import { AppSyncResolverHandler } from 'aws-lambda';
import * as util from 'util';
import * as mixpanelPackage from 'mixpanel';
import * as Sentry from '@sentry/serverless';
import { updateCustomAttributes } from '/opt/cognito';
import { UpdateZaiUserRequest } from '/opt/zai';
import { getOnboardingStepCompleted } from '/opt/onboarding';
import { updateRecord } from '/opt/dynamoDB';
import { SENTRY_DSN } from '/opt/sentry';

const mixpanel = mixpanelPackage.init(MIXPANEL_TOKEN ?? '');
const trackAsync = util.promisify(mixpanel.track);

const peopleSetAsync = (sub: string, mixpanelUserParams: any) => {
  return new Promise((resolve, reject) => {
    mixpanel.people.set(sub, mixpanelUserParams, (err: Error | undefined) => {
      if (err) {
        reject(err);
      } else {
        resolve(null);
      }
    });
  });
};

Sentry.AWSLambda.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 1,
  environment: ENV,
  debug: false,
});

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const main: AppSyncResolverHandler<any, any> = async (ctx) => {
  console.log(`EVENT: ${JSON.stringify(ctx)}`);
  const { sub, sourceIp } = ctx.identity as AppSyncIdentityCognito;
  const { input } = ctx.arguments;

  //await initZai();

  if (sub !== input.id) {
    throw new Error('Not Authorised to update user');
  }

  const ipAddress = sourceIp?.pop() || null;

  const userParams: any = {
    ipAddress,
    updatedAt: new Date().toISOString(),
  }; //TODO: UpdateUserInput - https://github.com/apptractive/project-template/issues/3

  const zaiUpdateUserParams: UpdateZaiUserRequest = {};
  const mixpanelUserParams: any = {};

  const requests = [];
  const userAttributes = [];
  if (ipAddress) {
    mixpanelUserParams.$ip = ipAddress;
  }

  if (Object.prototype.hasOwnProperty.call(input, 'about')) {
    userParams.about = input.about;
  }

  if (Object.prototype.hasOwnProperty.call(input, 'firstName')) {
    userParams.firstName = input.firstName;
    zaiUpdateUserParams.first_name = input.firstName;
    mixpanelUserParams.$firstName = input.firstName;

    // update user attributes is not possible in user stream as there is dependency to create entity / entity user
    userAttributes.push({
      Name: 'given_name',
      Value: input.firstName,
    });
  }

  if (Object.prototype.hasOwnProperty.call(input, 'lastName')) {
    userParams.lastName = input.lastName;
    zaiUpdateUserParams.last_name = input.lastName;
    mixpanelUserParams.$lastName = input.lastName;

    // update user attributes is not possible in user stream as there is dependency to create entity / entity user
    userAttributes.push({
      Name: 'family_name',
      Value: input.lastName,
    });
  }

  if (Object.prototype.hasOwnProperty.call(input, 'country')) {
    userParams.country = input.country;
    mixpanelUserParams.country = input.country;
  }

  if (Object.prototype.hasOwnProperty.call(input, 'profileImg')) {
    userParams.profileImg = input.profileImg;
  }

  if (Object.prototype.hasOwnProperty.call(input, 'interests')) {
    userParams.interests = input.interests;
    mixpanelUserParams.interests = input.interests;
  }

  if (Object.prototype.hasOwnProperty.call(input, 'locale')) {
    userParams.locale = input.locale;
  }

  if (Object.prototype.hasOwnProperty.call(input, 'notificationPreferences')) {
    userParams.notificationPreferences = input.notificationPreferences;
  }

  if (Object.prototype.hasOwnProperty.call(input, 'onboardingStatus')) {
    userParams.onboardingStatus = input.onboardingStatus;
    mixpanelUserParams.onboardingStatus = input.onboardingStatus;

    try {
      //@ts-ignore
      await trackAsync('Onboarding step', {
        distinct_id: sub,
        onboarding_status: getOnboardingStepCompleted(input.onboardingStatus),
      });
    } catch (err: any) {
      console.log('ERROR mixpanel track Onboarding step: ', err);
    }
  }

  if (Object.prototype.hasOwnProperty.call(input, 'userType')) {
    userParams.userType = input.userType;
    mixpanelUserParams.userType = input.userType;
  }

  if (Object.prototype.hasOwnProperty.call(input, 'onboardingEntity')) {
    userParams.onboardingEntity = input.onboardingEntity;
    mixpanelUserParams.onboardingEntity = input.onboardingEntity;
  }

  requests.unshift(updateRecord(TABLE_USER ?? '', { id: sub }, userParams));

  if (userAttributes.length > 0) {
    requests.push(
      updateCustomAttributes(AUTH_USERPOOLID ?? '', sub, userAttributes)
    );
  }
  //TODO: review mixpanel code here. perhaps see how createUser works?
  // update user in mixpanel
  try {
    await peopleSetAsync(sub, mixpanelUserParams);
  } catch (err: any) {
    console.log('ERROR mixpanel people set: ', err);
  }

  // update user in mixpanel
  try {
    await mixpanel.people.set(sub, mixpanelUserParams);
  } catch (err: any) {
    console.log('ERROR mixpanel people set: ', err);
  }

  let updatedUser;
  try {
    [updatedUser] = await Promise.all(requests);
    console.log('updated user record: ', updatedUser);
  } catch (err: any) {
    console.log('ERROR update user: ', err);
    throw new Error(err.message);
  }

  return updatedUser;
};

export const handler: AppSyncResolverHandler<any, any> =
  Sentry.AWSLambda.wrapHandler(main);
