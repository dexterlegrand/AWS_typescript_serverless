import { CfnOutput, RemovalPolicy, StackProps } from 'aws-cdk-lib';
import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager';
import {
  Distribution,
  OriginAccessIdentity,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { CnameRecord, IHostedZone } from 'aws-cdk-lib/aws-route53';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { existsSync } from 'fs';
import { join } from 'path';
import { generateRandomNDigits } from '../helpers';

interface WebDeploymentProps extends StackProps {
  readonly appName: string;
  readonly stage: string;
  readonly domain: string;
  readonly zone: IHostedZone;
  readonly type: string;
  readonly buildPath: string;
  readonly memoryLimit?: number;
}

export class WebDeploymentConstruct extends Construct {
  public readonly distribution: Distribution;

  constructor(scope: Construct, id: string, props: WebDeploymentProps) {
    super(scope, id);

    const certificate = new Certificate(this, 'WebCertificate', {
      domainName: props.domain,
      validation: CertificateValidation.fromDns(props.zone),
    });

    const deploymentBucket = new Bucket(this, 'WebDeploymentBucket', {
      bucketName: `${props.appName.toLowerCase()}-${props.type}-deployment-${
        props.stage
      }-${generateRandomNDigits(5)}`,
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const uiDirectory = join(__dirname, props.buildPath);

    if (!existsSync(uiDirectory)) {
      console.warn('no ui directory found');
      return;
    }

    const originIdentity = new OriginAccessIdentity(
      this,
      'OriginAccessIdentity',
      {}
    );
    deploymentBucket.grantRead(originIdentity);

    const distribution = new Distribution(this, 'WebCloudfrontDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new S3Origin(deploymentBucket, {
          originAccessIdentity: originIdentity,
        }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
      certificate,
      domainNames: [props.domain],
    });

    new CnameRecord(this, 'WebCloudfrontDistributionARecord', {
      recordName: props.domain,
      zone: props.zone,
      domainName: distribution.domainName,
    });

    new BucketDeployment(this, `WebBucketDeployment`, {
      destinationBucket: deploymentBucket,
      sources: [Source.asset(uiDirectory)],
      distribution,
      distributionPaths: ['/*'],
      memoryLimit: props.memoryLimit ?? 128,
    });

    new CfnOutput(this, `${props.appName}CloudfrontUrl`, {
      value: distribution.distributionDomainName,
      exportName: `${props.type}WebCloudfrontUrl`, //TODO: add deployment type?
    });

    new CfnOutput(this, `DeploymentBucketName`, {
      value: deploymentBucket.bucketName,
      exportName: `${props.type}DeploymentBucketName`, //TODO: add deployment type?
    });

    this.distribution = distribution;
  }
}
