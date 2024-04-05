import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Code, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import * as path from 'path';

// https://github.com/aws/aws-cdk/issues/1972
// https://github.com/ranguard/cdk-talk-examples/tree/master/code/lambda_layer_example/lib
export class LayerStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // Create a Lambda layer
    const dependencyLayer = new LayerVersion(this, 'DependencyLayer', {
      code: Code.fromAsset(path.join(__dirname, '../layers/dependencyLayer')),
      compatibleRuntimes: [Runtime.NODEJS_16_X, Runtime.NODEJS_18_X],
      removalPolicy: RemovalPolicy.RETAIN, //??
      description: 'Layer for dependency packages and helper functions',
    });

    // store layer version in ssm and reference to. https://github.com/aws/aws-cdk/issues/1972

    // create ssm string param of layer version arn
    new StringParameter(this, 'VersionArn', {
      parameterName: 'dependencyLambdaLayer',
      stringValue: dependencyLayer.layerVersionArn,
    });
  }
}
