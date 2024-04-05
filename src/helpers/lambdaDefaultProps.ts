import { Duration } from 'aws-cdk-lib';
import { LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import * as path from 'path';
import { externalLibs } from './code';

export const getLambdaDefaultProps = (scope: Construct, funcName: string) => {
  const dependencyLayerArn = StringParameter.valueFromLookup(
    scope,
    'dependencyLambdaLayer'
  );
  const dependencyLayerFromArn = LayerVersion.fromLayerVersionArn(
    scope,
    `DependencyLayerFromArn${funcName}`,
    dependencyLayerArn
  );

  return {
    runtime: Runtime.NODEJS_18_X,
    layers: [dependencyLayerFromArn],
    logRetention: RetentionDays.ONE_MONTH,
    // TODO: ensure fine without as error was appearing on deploy: [WARNING] aws-cdk-lib.aws_logs.LogRetentionRetryOptions#base is deprecated. Unused since the upgrade to AWS SDK v3, which uses a different retry strategy This API will be removed in the next major release.
    //logRetentionRetryOptions: {
    //  base: Duration.millis(200),
    //  maxRetries: 10,
    //},
    timeout: Duration.seconds(30),
    entry: path.join(__dirname, `../functions/${funcName}/index.ts`),
    handler: 'handler',
    bundling: {
      externalModules: externalLibs, //Added external libraries because error was showing for pnp
    },
  };
};
