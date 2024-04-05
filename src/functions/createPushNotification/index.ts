import { scanAllRecords } from '/opt/dynamoDB';
import { sendPushNotification, sendUsersPushNotification } from '/opt/pinpoint';
import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import { AppSyncResolverHandler } from 'aws-lambda';
import { isAdmin } from '../../appsync/helpers/cognito';

const { ANALYTICS_PINPOINT_ID, TABLE_USER } = process.env;

export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  console.log('EVENT RECEIVED: ', ctx);
  const { groups } = ctx.identity as AppSyncIdentityCognito;
  const { userId, title, message } = ctx.arguments.input;

  if (!isAdmin(groups)) {
    throw new Error('Unauthorized');
  }
  let response: any; //TODO: whats returned?
  // send push notifications to single user
  if (userId) {
    const params = {
      userId,
      pinpointAppId: ANALYTICS_PINPOINT_ID ?? '',
      title,
      message,
    };

    try {
      response = await sendPushNotification(params);
    } catch (err: any) {
      console.log('ERROR send single push: ', err);
      throw new Error(err.message);
    }
  }

  // send push notifications to many users
  else {
    const users = await scanAllRecords(TABLE_USER ?? '');
    const userIds: string[] = users?.map((user) => user.id);
    const params = {
      userIds,
      pinpointAppId: ANALYTICS_PINPOINT_ID ?? '',
      title,
      message,
    };
    try {
      response = await sendUsersPushNotification(params);
    } catch (err: any) {
      console.log('ERROR send multiple push: ', err);
      throw new Error(err.message);
    }
  }

  console.log('push send response: ', response);

  return response;
};
