import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import { AppSyncResolverHandler } from 'aws-lambda';
import * as util from 'util';
import { getOnboardingStepCompleted } from '/opt/onboarding';
import { updateRecord } from '/opt/dynamoDB';
import { SENTRY_DSN } from '/opt/sentry';

const { TABLE_USER, MIXPANEL_TOKEN, ENV } = process.env;

import * as mixpanelPackage from 'mixpanel';

const mixpanel = mixpanelPackage.init(MIXPANEL_TOKEN ?? '');

const trackAsync = util.promisify(mixpanel.track);

import * as Sentry from '@sentry/serverless';

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

  if (sub !== input.id) {
    throw new Error('Not Authorised to update user');
  }

  const ip = sourceIp?.pop() || null;

  const userParams: any = {
    updatedAt: new Date().toISOString(),
  }; //TODO: UpdateUserInput - https://github.com/apptractive/project-template/issues/3
  const mixpanelUserParams: any = {};

  if (ip) {
    mixpanelUserParams.$ip = ip;
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

  let updatedUser;
  try {
    updatedUser = await updateRecord(TABLE_USER ?? '', { id: sub }, userParams);
    console.log('updated user record: ', updatedUser);
  } catch (err: any) {
    console.log('ERROR update user: ', err);
    throw new Error(err.message);
  }

  // update user in mixpanel
  try {
    await mixpanel.people.set(sub, mixpanelUserParams);
  } catch (err: any) {
    console.log('ERROR mixpanel people set: ', err);
  }

  return updatedUser;
};

export const handler: AppSyncResolverHandler<any, any> =
  Sentry.AWSLambda.wrapHandler(main);
