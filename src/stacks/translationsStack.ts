import { Fn, Stack, StackProps } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { getLambdaDefaultProps } from '../helpers';
import { appName, env } from '../helpers/constants';

export class TranslationsStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const s3mediaBucketName = Fn.importValue(
      `${appName}-${env}-MediaStorageBucketName`
    );
    const s3mediaBucket = Bucket.fromBucketName(
      this,
      'S3MediaBucket',
      s3mediaBucketName
    );

    const createTranslationFunc = new NodejsFunction(
      this,
      'CreateTranslationFunction',
      {
        ...getLambdaDefaultProps(this, 'createTranslation'),
        environment: {
          REGION: props.env?.region ?? '',
          STORAGE_BUCKETNAME: s3mediaBucket.bucketName,
        },
      }
    );

    s3mediaBucket.grantReadWrite(createTranslationFunc);

    const getTranslationFunc = new NodejsFunction(
      this,
      'GetTranslationFunction',
      {
        ...getLambdaDefaultProps(this, 'getTranslation'),
        environment: {
          REGION: props.env?.region ?? '',
          STORAGE_BUCKETNAME: s3mediaBucket.bucketName,
        },
      }
    );

    s3mediaBucket.grantReadWrite(getTranslationFunc);

    const listTranslationsFunc = new NodejsFunction(
      this,
      'ListTranslationsFunction',
      {
        ...getLambdaDefaultProps(this, 'listTranslations'),
        environment: {
          REGION: props.env?.region ?? '',
          STORAGE_BUCKETNAME: s3mediaBucket.bucketName,
        },
      }
    );

    s3mediaBucket.grantReadWrite(listTranslationsFunc);

    const updateTranslationFunc = new NodejsFunction(
      this,
      'UpdateTranslationFunction',
      {
        ...getLambdaDefaultProps(this, 'updateTranslation'),
        environment: {
          REGION: props.env?.region ?? '',
          STORAGE_BUCKETNAME: s3mediaBucket.bucketName,
        },
      }
    );

    s3mediaBucket.grantWrite(updateTranslationFunc);
  }
}
