import { Stack, StackProps } from 'aws-cdk-lib';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { EmailIdentity, Identity } from 'aws-cdk-lib/aws-ses';
import { Construct } from 'constructs';

interface SesStackProps extends StackProps {
  hostedZoneId: string;
  zoneName: string;
  mailFromDomain: string;
}

export class SesStack extends Stack {
  constructor(scope: Construct, id: string, props: SesStackProps) {
    super(scope, id, props);

    const zone = HostedZone.fromHostedZoneAttributes(this, `HostedZone`, {
      hostedZoneId: props.hostedZoneId,
      zoneName: props.zoneName,
    });

    // verify domain name for sending emails
    new EmailIdentity(this, 'EmailIdentity', {
      identity: Identity.publicHostedZone(zone),
      mailFromDomain: props.mailFromDomain,
    });
  }
}
