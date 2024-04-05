import { Stack, StackProps } from 'aws-cdk-lib';
import { HostedZone, IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import { domain, hostedZoneId } from '../helpers/constants';

export class Route53Stack extends Stack {
  public readonly zone: IHostedZone;
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    this.zone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: hostedZoneId,
      zoneName: domain,
    });
  }
}
