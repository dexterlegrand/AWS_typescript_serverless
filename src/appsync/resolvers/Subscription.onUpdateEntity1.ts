import { util, Context, extensions } from '@aws-appsync/utils';

//https://docs.aws.amazon.com/appsync/latest/devguide/aws-appsync-real-time-enhanced-filtering.html

export function request(ctx: Context) {
  console.log('Subscription.onUpdateEntity request: ', ctx);
  //runtime.earlyReturn();
  return { payload: null };
}

export function response(ctx: Context) {
  console.log('Subscription.onUpdateEntity   response: ', ctx);
  const { entityId } = ctx.args;
  // get sub
  const filter = { id: { eq: entityId } };
  extensions.setSubscriptionFilter(util.transform.toSubscriptionFilter(filter));
  return null;
}
