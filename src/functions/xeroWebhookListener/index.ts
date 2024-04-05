import { AppSyncResolverHandler } from 'aws-lambda';

export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  console.log('ctx received: ', JSON.stringify(ctx));
};
