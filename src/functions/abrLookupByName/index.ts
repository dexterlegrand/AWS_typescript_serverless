import { abrLookupByName } from '/opt/abr';
import { AppSyncResolverHandler } from 'aws-lambda';

export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  const { name } = ctx.arguments;
  console.log('name: ', name);

  let response;
  try {
    response = await abrLookupByName(name);
    console.log('response: ', response);
  } catch (err: any) {
    console.log('ERROR search abr by name: ', err);
    throw new Error(err.message);
  }

  return {
    items: response ?? [], //TODO: do we want to filter out IsCurrent = false entities?
  };
};
