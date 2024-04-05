import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { isProd } from '../helpers/constants';

const frankieOneEnv = isProd ? 'prod' : 'dev';

export class SecretsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // frankieone secret
    new Secret(this, 'FrankieOneSecret', {
      secretName: `FrankieOneSecret-${frankieOneEnv}`,
      secretObjectValue: {
        frankieOneSecret: SecretValue.unsafePlainText(''),
      },
    });
  }
}
