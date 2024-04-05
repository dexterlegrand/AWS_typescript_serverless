import {
  util,
  Context,
  extensions,
  AppSyncIdentityCognito,
} from '@aws-appsync/utils';

//https://docs.aws.amazon.com/appsync/latest/devguide/aws-appsync-real-time-enhanced-filtering.html

export function request(ctx: Context) {
  console.log('Subscription.onCreateNotification request: ', ctx);
  //runtime.earlyReturn();
  return { payload: null };
}

export function response(ctx: Context) {
  console.log('Subscription.onCreateNotification response: ', ctx);
  // get sub
  const { sub } = ctx.identity as AppSyncIdentityCognito;
  const filter = { owner: { eq: sub }, status: { eq: 'UNREAD' } };
  extensions.setSubscriptionFilter(util.transform.toSubscriptionFilter(filter));
  return null;
}
