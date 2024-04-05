const { REGION, STORAGE_BUCKETNAME } = process.env;
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: REGION, apiVersion: '2012-10-17' });
import { LANGUAGES, NAMESPACES } from '/opt/i18n';

export const handler = async () => {
  const requests = [];

  // get translation files for each language and namespace
  for (const i in LANGUAGES) {
    const language = LANGUAGES[i];
    console.log('language: ', language);

    for (const j in NAMESPACES) {
      const namespace = NAMESPACES[j];

      //const request = s3
      //  .getObject({
      //    Bucket: STORAGE_BUCKETNAME,
      //    Key: `translations/${language}/${namespace}.json`
      //  })
      //  .promise();

      const command = new GetObjectCommand({
        Bucket: STORAGE_BUCKETNAME,
        Key: `translations/${language}/${namespace}.json`,
      });

      const request = s3.send(command);

      requests.push(request);
    }
  }

  let translationData = [];
  try {
    translationData = await Promise.all(requests);
  } catch (err: any) {
    console.log('ERROR translation data requests: ', err);
    throw new Error(err.message);
  }

  // transform language files into json
  const translations = [];
  let index = 0;
  for (const i in LANGUAGES) {
    const language = LANGUAGES[i];
    const data: any = {
      language,
      items: [],
    };
    for (const j in NAMESPACES) {
      const namespace = NAMESPACES[j];
      data.items.push({
        language,
        namespace,
        data: translationData[index],
      });

      index += 1;
    }

    translations.push(data);
  }

  return translations;
};
