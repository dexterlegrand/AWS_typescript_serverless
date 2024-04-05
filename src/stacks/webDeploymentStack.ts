import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import { WebDeploymentConstruct } from '../constructs/webDeploymentConstruct';

interface WebDeploymentStackProps extends StackProps {
  readonly appName: string;
  readonly stage: string;
  readonly domain: string;
  readonly zone: IHostedZone;
  readonly type: string;
  readonly buildPath: string;
  readonly memoryLimit?: number;
}

export class WebDeploymentStack extends Stack {
  public readonly webDistribution: Distribution;
  constructor(scope: Construct, id: string, props: WebDeploymentStackProps) {
    super(scope, id, props);

    const web = new WebDeploymentConstruct(this, 'WebDeployment', props);
    this.webDistribution = web.distribution;

    new CfnOutput(this, 'DistributionId', {
      value: web.distribution.distributionId,
    });
  }
}
