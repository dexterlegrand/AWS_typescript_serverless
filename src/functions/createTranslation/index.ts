//TODO: IAM: s3:PutObjectAcl
const { REGION, STORAGE_BUCKETNAME } = process.env;
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { sortObjectAlphabetical } from '/opt/utils';
import { AppSyncResolverHandler } from 'aws-lambda';

const s3 = new S3Client({ region: REGION, apiVersion: '2012-10-17' });

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  const { language, namespace, name, value } = ctx.arguments.input;

  console.log('CTX received: ', ctx);
  console.log('value: ', value);

  //get file to add translation

  let jsonData;
  let data;
  try {
    const getParams = {
      Bucket: STORAGE_BUCKETNAME,
      Key: `translations/${language}/${namespace}.json`,
      //ResponseContentType: 'application/json'
    };
    const command = new GetObjectCommand(getParams);
    data = await s3.send(command);
  } catch (err: any) {
    console.log('ERROR: get s3 file: ', err);
    throw new err.code();
  }

  console.log('data: ', data);

  if (!data.Body) {
    throw new Error(`Translations not found for ${language}`);
  }

  try {
    jsonData = JSON.parse(data.Body.toString());
  } catch (err: any) {
    console.log('ERROR: parsing s3 data');
    throw new Error(err.message);
  }

  console.log('jsonData: ', jsonData);

  if (!jsonData) {
    throw new Error(`Translations not found for ${language}`);
  }

  const newTranslations = {
    ...jsonData,
    ...{ [name]: value },
  };

  console.log('newTranslations: ', newTranslations);
  const sortedData = sortObjectAlphabetical(newTranslations);
  console.log('sortedData jsonData: ', sortedData);
  try {
    //save file
    const putParams: PutObjectCommandInput = {
      Bucket: STORAGE_BUCKETNAME,
      Key: `translations/${language}/${namespace}.json`,
      Body: JSON.stringify(sortedData),
      ACL: 'public-read',
    };

    const command = new PutObjectCommand(putParams);
    await s3.send(command);

    return {
      language,
      namespace,
      name,
      value,
    };
  } catch (err: any) {
    console.log('ERROR: put s3 file: ', err);
    throw new err.code();
  }
};
