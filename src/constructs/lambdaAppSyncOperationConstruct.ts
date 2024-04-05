import { IGraphqlApi } from 'aws-cdk-lib/aws-appsync';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { capitalizeFirstLetter, getLambdaDefaultProps } from '../helpers';

export interface lambdaAppSyncOperationConstructProps {
  api: IGraphqlApi;
  fieldName: string;
  typeName: 'Mutation' | 'Query';
  environmentVars?: Record<string, any>;
}

export class LambdaAppSyncOperationConstruct extends Construct {
  public readonly lambda: NodejsFunction;
  constructor(
    scope: Construct,
    id: string,
    props: lambdaAppSyncOperationConstructProps
  ) {
    super(scope, id);
    const { api, environmentVars = {}, fieldName, typeName } = props;

    // lambda function
    const lambdaFunction = new NodejsFunction(
      this,
      `${capitalizeFirstLetter(fieldName)}Function`,
      {
        ...getLambdaDefaultProps(this, fieldName),
        environment: {
          ...environmentVars,
        },
      }
    );

    // lambda datasource for appsync
    const lambdaDataSource = api.addLambdaDataSource(
      `${capitalizeFirstLetter(fieldName)}FuncDS`,
      lambdaFunction
    );

    // mutation or query resolver
    lambdaDataSource.createResolver(
      `${capitalizeFirstLetter(fieldName)}FuncResolver`,
      {
        typeName,
        fieldName,
      }
    );

    this.lambda = lambdaFunction;
  }
}
