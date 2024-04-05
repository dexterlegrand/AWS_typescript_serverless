const { REGION, STORAGE_BUCKETNAME } = process.env;
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { AppSyncResolverHandler } from 'aws-lambda';
const s3 = new S3Client({ region: REGION, apiVersion: '2012-10-17' });

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  const { language, namespace, data } = ctx.arguments.input;

  console.log('ctx received: ', ctx);
  console.log('data: ', data);
  console.log('typeof data: ', typeof data);

  const params: PutObjectCommandInput = {
    Bucket: STORAGE_BUCKETNAME,
    Key: `translations/${language}/${namespace}.json`,
    Body: JSON.stringify(data),
    ACL: 'public-read',
  };
  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);

    return {
      language,
      namespace,
      data,
    };
  } catch (err: any) {
    console.log('ERROR: update translation: ', err);
    throw new (err?.message || err?.code || 'Error update translation')();
  }
};
