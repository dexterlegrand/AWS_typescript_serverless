import { Fn, NestedStack, NestedStackProps } from 'aws-cdk-lib';
import {
  AuthorizationType as RESTAuthorizationType,
  LambdaIntegration,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { GraphqlApi } from 'aws-cdk-lib/aws-appsync';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { LambdaAppSyncOperationConstruct } from '../constructs/lambdaAppSyncOperationConstruct';
import { getLambdaDefaultProps } from '../helpers';
import {
  appleBundleId,
  appleConnectIssuerId,
  appleConnectKey,
  appleConnectKeyId,
  appPrefix,
  env,
  googleBundleId,
} from '../helpers/constants';
import { Table } from 'aws-cdk-lib/aws-dynamodb';

/* eslint-disable-next-line */
interface IapApiStackProps extends NestedStackProps {}

export class IapApiStack extends NestedStack {
  constructor(scope: Construct, id: string, props: IapApiStackProps) {
    super(scope, id, props);

    const graphqlApiId = Fn.importValue(`${appPrefix}-${env}-GraphqlApiId`);
    const graphqlApiArn = Fn.importValue(`${appPrefix}-${env}-GraphqlApiArn`);

    const api = GraphqlApi.fromGraphqlApiAttributes(this, 'Api', {
      graphqlApiId,
      graphqlApiArn,
    });

    const restApiId = Fn.importValue('RestApiId');
    const restApi = RestApi.fromRestApiId(this, 'ImportedRestApi', restApiId);

    const transactionTableArn = Fn.importValue(
      `${appPrefix}-${env}-TransactionTableArn`
    );
    const transactionTable = Table.fromTableArn(
      this,
      'TransactionTable',
      transactionTableArn
    );

    const userTableArn = Fn.importValue(`${appPrefix}-${env}-UserTableArn`);
    const userTable = Table.fromTableArn(this, 'UserTable', userTableArn);

    //IAP
    // validate user IAP receipt
    const validateUserIAPReceipt = new LambdaAppSyncOperationConstruct(
      this,
      'ValidateUserIAPReceipt',
      {
        api,
        typeName: 'Mutation',
        fieldName: 'validateUserIAPReceipt',
        environmentVars: {
          TABLE_TRANSACTION: transactionTable.tableName,
          TABLE_USER: userTable.tableName,
          ENV: env,
          APPLE_BUNDLE_ID: appleBundleId,
          APPLE_CONNECT_KEY: appleConnectKey,
          APPLE_CONNECT_KEY_ID: appleConnectKeyId,
          APPLE_CONNECT_ISSUER_ID: appleConnectIssuerId,
          GOOGLE_BUNDLE_ID: googleBundleId,
        },
      }
    );

    transactionTable.grantWriteData(validateUserIAPReceipt.lambda);
    userTable.grantReadWriteData(validateUserIAPReceipt.lambda);

    // apple webhook handler function
    const appleHandlerFunc = new NodejsFunction(this, 'AppleHandlerFunction', {
      ...getLambdaDefaultProps(this, 'appleWebhookHandler'),
      environment: {
        TABLE_USER: userTable.tableName,
        ENV: env,
      },
    });

    userTable.grantReadWriteData(appleHandlerFunc);

    // apple webhook listener function
    const appleListenerFunc = new NodejsFunction(
      this,
      'AppleWebhookListenerFunction',
      {
        ...getLambdaDefaultProps(this, 'appleWebhookListener'),
        environment: {
          FUNCTION_APPLEWEBHOOKHANDLER: appleHandlerFunc.functionName,
          APPLE_BUNDLE_ID: appleBundleId,
        },
      }
    );

    appleHandlerFunc.grantInvoke(appleListenerFunc);

    const appleIntegration = new LambdaIntegration(appleListenerFunc);

    const appleWebhookEndpoint = restApi.root.addResource('webhook-apple'); //TODO: obfuscation of webhook endpoint
    appleWebhookEndpoint.addMethod('ANY', appleIntegration, {
      authorizationType: RESTAuthorizationType.NONE,
    });

    //TODO: implement apple ip address whitelist
    //const appleIamPolicy = new PolicyDocument({
    //  statements: [
    //    new PolicyStatement({
    //      effect: Effect.DENY,
    //      principals: [new AnyPrincipal()],
    //      actions: ["execute-api:Invoke"],
    //      resources: [appleMethod.methodArn]
    //    }),
    //    new PolicyStatement({
    //      effect: Effect.ALLOW,
    //      principals: [new AnyPrincipal()],
    //      resources: [appleMethod.methodArn],
    //      actions: ['execute-api:Invoke'],
    //      conditions: {
    //        'NotIpAddress': {
    //          'aws:SourceIp': '17.0.0.0/8'
    //        }
    //      }
    //    })
    //  ]
    //})

    // google webhook handler function
    const googleHandlerFunc = new NodejsFunction(
      this,
      'GoogleHandlerFunction',
      {
        ...getLambdaDefaultProps(this, 'googleWebhookHandler'),
        environment: {
          TABLE_TRANSACTION: transactionTable.tableName,
          TABLE_USER: userTable.tableName,
          ENV: env,
          GOOGLE_BUNDLE_ID: googleBundleId,
        },
      }
    );

    transactionTable.grantReadWriteData(googleHandlerFunc);
    userTable.grantReadWriteData(googleHandlerFunc);

    // google webhook listener function
    const googleListenerFunc = new NodejsFunction(
      this,
      'GoogleWebhookListenerFunction',
      {
        ...getLambdaDefaultProps(this, 'googleWebhookListener'),
        environment: {
          FUNCTION_GOOGLEWEBHOOKHANDLER: googleHandlerFunc.functionName,
          GOOGLE_BUNDLE_ID: googleBundleId,
        },
      }
    );

    const googleIntegration = new LambdaIntegration(googleListenerFunc);

    const googleWebhookEndpoint = restApi.root.addResource('webhook-google'); //TODO: obfuscation of webhook endpoint
    googleWebhookEndpoint.addMethod('ANY', googleIntegration, {
      authorizationType: RESTAuthorizationType.NONE,
    });

    //TODO: IP whitelist
  }
}
