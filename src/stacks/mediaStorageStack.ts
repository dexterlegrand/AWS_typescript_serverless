import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import {
  AnyPrincipal,
  Effect,
  IRole,
  ManagedPolicy,
  PolicyStatement,
} from 'aws-cdk-lib/aws-iam';
import { Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import * as path from 'path';
import { appName, appPrefix, env, isProd } from '../helpers/constants';

interface MediaStorageStackProps extends StackProps {
  readonly authenticatedRole: IRole;
  readonly unauthenticatedRole: IRole;
}

export class MediaStorageStack extends Stack {
  public mediaStorageBucket: Bucket;

  constructor(scope: Construct, id: string, props: MediaStorageStackProps) {
    super(scope, id, props);

    const mediaStorageBucket = new Bucket(this, 'S3MediaBucket', {
      bucketName: `${appName.toLowerCase()}-media-${env}`,
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      autoDeleteObjects: !isProd,
      cors: [
        {
          allowedMethods: [
            HttpMethods.GET,
            HttpMethods.POST,
            HttpMethods.PUT,
            HttpMethods.DELETE,
          ],
          allowedOrigins: ['*'], //TODO: check amplify behaviour
          allowedHeaders: ['*'], //TODO: check amplify behaviour
        },
      ],
      //TODO: see if necessary
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      //TODO: should we change something here? for objectOwnership
      //objectOwnership: ,
      transferAcceleration: isProd,
    });

    new BucketDeployment(this, 'TranslationFiles', {
      sources: [
        Source.asset(path.join(__dirname, '../s3/media-storage-bucket')),
      ],
      destinationBucket: mediaStorageBucket,
    });

    // allow guests read access to the bucket.
    mediaStorageBucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['s3:GetObject'],
        principals: [new AnyPrincipal()],
        resources: [
          `arn:aws:s3:::${mediaStorageBucket.bucketName}/public/*`,
          `arn:aws:s3:::${mediaStorageBucket.bucketName}/translations/*`,
        ],
      })
    );

    new ManagedPolicy(this, 'mangedPolicyForAmplifyUnauth', {
      description:
        'managed policy to allow usage of Storage Library for unauth',
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['s3:GetObject'],
          resources: [`arn:aws:s3:::${mediaStorageBucket.bucketName}/public/*`],
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['s3:GetObject'],
          resources: [
            `arn:aws:s3:::${mediaStorageBucket.bucketName}/protected/*`,
          ],
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['s3:ListBucket'],
          resources: [`arn:aws:s3:::${mediaStorageBucket.bucketName}`],
          conditions: {
            StringLike: {
              's3:prefix': ['public/', 'public/*', 'protected/', 'protected/*'],
            },
          },
        }),
      ],
      roles: [props.unauthenticatedRole],
    });

    new ManagedPolicy(this, 'mangedPolicyForAmplifyAuth', {
      description: 'managed Policy to allow usage of storage library for auth',
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['s3:PutObject', 's3:GetObject', 's3:DeleteObject'],
          resources: [`arn:aws:s3:::${mediaStorageBucket.bucketName}/public/*`],
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['s3:PutObject', 's3:GetObject', 's3:DeleteObject'],
          resources: [
            `arn:aws:s3:::${mediaStorageBucket.bucketName}/protected/\${cognito-identity.amazonaws.com:sub}/*`,
          ],
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['s3:PutObject', 's3:GetObject', 's3:DeleteObject'],
          resources: [
            `arn:aws:s3:::${mediaStorageBucket.bucketName}/private/\${cognito-identity.amazonaws.com:sub}/*`,
          ],
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['s3:GetObject'],
          resources: [
            `arn:aws:s3:::${mediaStorageBucket.bucketName}/protected/*`,
          ],
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['s3:ListBucket'],
          resources: [`arn:aws:s3:::${mediaStorageBucket.bucketName}`],
          conditions: {
            StringLike: {
              's3:prefix': [
                'public/',
                'public/*',
                'protected/',
                'protected/*',
                'private/${cognito-identity.amazonaws.com:sub}/',
                'private/${cognito-identity.amazonaws.com:sub}/*',
              ],
            },
          },
        }),
      ],
      roles: [props.authenticatedRole],
    });

    this.mediaStorageBucket = mediaStorageBucket;

    new CfnOutput(this, 'MediaBucketName', {
      value: mediaStorageBucket.bucketName,
      exportName: `${appPrefix}-${env}-MediaBucketName`,
    });

    new CfnOutput(this, 'MediaStorageBucketName', {
      value: mediaStorageBucket.bucketName,
      exportName: `${appName}-${env}-MediaStorageBucketName`,
    });

    new CfnOutput(this, 'MediaBucketRegion', {
      value: this.region,
    });
  }
}
