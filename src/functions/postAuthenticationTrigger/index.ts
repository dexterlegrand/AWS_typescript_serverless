import { AppSyncResolverHandler } from 'aws-lambda';

export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  console.log('EVENT RECEIVED: ', ctx);
  console.log('EVENT RECEIVED STRINGIFIED: ', JSON.stringify(ctx));

  //const createdAt = new Date().toISOString();
};
