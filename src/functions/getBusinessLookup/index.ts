import {
  createFrankieOneAuthToken,
  getBusinessLookup,
} from '/opt/frankieone/smartUi';
import { AppSyncResolverHandler } from 'aws-lambda';

let token;
export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  const { query } = ctx.arguments;
  console.log('input: ', query);

  //TODO: generate frankieone token

  try {
    token = await createFrankieOneAuthToken({
      preset: 'smart-ui',
      referrer: '',
      entityId: '',
    });
  } catch (err: any) {
    console.log('ERROR createFrankieOneAuthToken: ', err);
    throw new Error(err.message);
  }

  let entities;
  try {
    entities = await getBusinessLookup(query);
  } catch (err: any) {
    console.log('ERROR search abr: ', err);
    throw new Error(err.message);
  }

  return entities;
};
