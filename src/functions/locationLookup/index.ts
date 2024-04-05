const { PLACE_INDEX_NAME } = process.env;
import { AppSyncResolverHandler } from 'aws-lambda';
import { locationLookup } from '/opt/location';

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  const { searchText, maxResults } = ctx.arguments;
  let data;
  try {
    data = locationLookup(PLACE_INDEX_NAME ?? '', searchText, maxResults);

    return data;
  } catch (err: any) {
    console.log('ERROR: location lookup: ', err);
    throw new err.message();
  }
};
