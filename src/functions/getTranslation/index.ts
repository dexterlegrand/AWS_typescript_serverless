const { REGION, STORAGE_BUCKETNAME } = process.env;
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { AppSyncResolverHandler } from 'aws-lambda';

const s3 = new S3Client({ region: REGION, apiVersion: '2012-10-17' });

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  const { language, namespace } = ctx.arguments;
  let data;
  try {
    const getParams = {
      Bucket: STORAGE_BUCKETNAME,
      Key: `translations/${language}/${namespace}.json`,
      //ResponseContentType: 'application/json'
    };
    const command = new GetObjectCommand(getParams);
    data = await s3.send(command);

    if (!data.Body) {
      throw new Error('No data');
    }

    const string = data.Body.toString();
    const json = JSON.parse(string);
    console.log('json: ', json);

    return {
      language,
      namespace,
      data: json,
    };
  } catch (err: any) {
    console.log('ERROR: get translation: ', err);
    throw new err.message();
  }
};
