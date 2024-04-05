import { IdentityPool } from '@aws-cdk/aws-cognito-identitypool-alpha';
import {
  CfnOutput,
  Duration,
  Expiration,
  Fn,
  SecretValue,
  Stack,
  StackProps,
} from 'aws-cdk-lib';
import {
  AuthorizationType as RESTAuthorizationType,
  BasePathMapping,
  CognitoUserPoolsAuthorizer,
  Cors,
  DomainName,
  EndpointType,
  LambdaIntegration,
  RestApi,
  SecurityPolicy,
} from 'aws-cdk-lib/aws-apigateway';
import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { StartingPosition } from 'aws-cdk-lib/aws-lambda';
import {
  DynamoEventSource,
  SqsEventSource,
} from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { CnameRecord, IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import * as path from 'path';
import {
  GraphqlApi,
  SchemaFile,
  AuthorizationType as AppSyncAuthorizationType,
  FieldLogLevel,
} from 'aws-cdk-lib/aws-appsync';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import {
  Effect,
  ManagedPolicy,
  Policy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { JsPipelineResolverConstruct } from '../constructs/jsPipelineResolverConstruct';
import { JsResolverConstruct } from '../constructs/jsResolverConstruct';
import { LambdaAppSyncOperationConstruct } from '../constructs/lambdaAppSyncOperationConstruct';
import { getLambdaDefaultProps } from '../helpers';
import {
  abrGuid,
  apiDomainName,
  env,
  mixpanelToken,
  restApiDomainName,
  restApiName,
  xeroClientId,
  xeroClientSecret,
  zaiClientId,
  zaiClientScope,
  zaiDomain,
  zaiTokenDomain,
  zaiWebhookDomain,
  createUserFuncName,
  xeroWebhookSecret,
  apiId,
  apiName,
  appPrefix,
  frankieOneApiKey,
  frankieOneApiDomain,
  frankieOneCustomerId,
  frankieOneSmartUiDomain,
  zaiEnv,
  account,
  region,
} from '../helpers/constants';
import { ContactsApiStack } from './contactsApiStack';

interface APIStackProps extends StackProps {
  readonly activityTable: Table;
  readonly autoCompleteResultsTable: Table;
  readonly contactsTable: Table;
  readonly conversationTable: Table;
  readonly entityUserTable: Table;
  readonly messageTable: Table;
  readonly notificationTable: Table;
  readonly optionTable: Table;
  readonly paymentAccountTable: Table;
  readonly paymentTable: Table;
  readonly paymentMethodTable: Table;
  readonly ratingsTable: Table;
  readonly referrerTable: Table;
  readonly signatureTable: Table;
  readonly taskTable: Table;
  readonly taskPaymentTable: Table;
  readonly teamTable: Table;
  readonly teamUserTable: Table;
  readonly transactionTable: Table;
  readonly userConversationTable: Table;
  readonly userTable: Table;
  readonly entityTable: Table;
  readonly zone: IHostedZone;
}

export class AppSyncAPIStack extends Stack {
  public readonly api: GraphqlApi;

  //public readonly restApi: RestApi;

  constructor(scope: Construct, id: string, props: APIStackProps) {
    super(scope, id, props);

    // s3 from bucket name
    const s3mediaBucketName = Fn.importValue(
      `${appPrefix}-${env}-MediaBucketName`
    );
    const s3mediaBucket = Bucket.fromBucketName(
      this,
      'S3MediaBucket',
      s3mediaBucketName
    );

    // userpool from userpool id
    //const userPoolId = Fn.importValue(`${appPrefix}-${env}-UserPoolId`);
    const userPool = UserPool.fromUserPoolId(
      this,
      'UserPool',
      'us-east-1_3Rf0icAxR'
    );

    // identity pool from identity pool id
    //const identityPoolId = Fn.importValue(`${appPrefix}-${env}-IdentityPoolId`);
    const identityPool = IdentityPool.fromIdentityPoolId(
      this,
      'IdentityPool',
      'us-east-1:8f5e3f28-0896-4623-bc16-f32818c865e5'
    );

    //TABLES
    const beneficialOwnerTableArn = Fn.importValue(
      `${appPrefix}-${env}-BeneficialOwnerTableArn`
    );
    const beneficialOwnerTable = Table.fromTableArn(
      this,
      'BeneficialOwnerTable',
      beneficialOwnerTableArn
    );

    // PINPOINT
    const pinpointAppId = Fn.importValue(`${appPrefix}-${env}-PinpointApiId`);

    // SECRETS TODO: move to secrets stack
    //zai webhook secret
    const zaiSecrets = new Secret(this, 'ZaiSecrets', {
      secretName: `ZaiSecrets-${zaiEnv}`,
      secretObjectValue: {
        zaiClientSecret: SecretValue.unsafePlainText(''),
        zaiWebhookSecret: SecretValue.unsafePlainText(''),
      },
    });

    // rest api
    const restCertificate = new Certificate(this, 'RestApiCertificate', {
      domainName: restApiDomainName,
      validation: CertificateValidation.fromDns(props.zone),
    });
    const restApi = new RestApi(this, 'RestApiGateway', {
      description: 'Rest API gateway',
      restApiName: restApiName,
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
      },
      //domainName: {
      //  domainName: restApiDomainName,
      //  certificate,
      //},
      deployOptions: {
        stageName: env,
      },
    });

    // export api id
    new CfnOutput(this, 'RestApiId', { value: restApi.restApiId });

    const customDomain = new DomainName(this, 'RestAPICustomDomain', {
      domainName: restApiDomainName,
      certificate: restCertificate,
      endpointType: EndpointType.EDGE,
      securityPolicy: SecurityPolicy.TLS_1_2,
    });

    new BasePathMapping(this, 'RestAPIBasePathMapping', {
      domainName: customDomain,
      restApi,
    });

    // cname for custom api domain name
    new CnameRecord(this, 'RestAPICustomDomainCnameRecord', {
      recordName: restApiDomainName,
      domainName: customDomain.domainNameAliasDomainName,
      zone: props.zone,
    });

    // authorizer for lambdas linked with rest api
    const restApiCognitoAuthorizer = new CognitoUserPoolsAuthorizer(
      this,
      'RestApiCognitoAuthorizer',
      {
        cognitoUserPools: [userPool],
      }
    );

    new CfnOutput(this, 'RESTAPIName', {
      value: restApi.restApiName,
    });

    // RestApiGatewayEndpoint
    new CfnOutput(this, 'RestApiGatewayEndpoint', {
      value: restApiDomainName,
    });

    //this.restApi = restApi;

    // certificate for api domain
    const appsyncCertificate = new Certificate(this, 'GraphQLApiCertificate', {
      domainName: apiDomainName,
      validation: CertificateValidation.fromDns(props.zone),
    });

    // logs
    const apiLogRole = new Role(this, 'ApiLogRole', {
      roleName: 'ApiCloudWatchRole',
      assumedBy: new ServicePrincipal('appsync.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSAppSyncPushToCloudWatchLogs'
        ),
      ],
    });

    // graphql api
    const api = new GraphqlApi(this, apiId, {
      //project name
      name: apiName, //api name
      domainName: {
        certificate: appsyncCertificate,
        domainName: apiDomainName,
      },
      schema: SchemaFile.fromAsset(
        path.join(__dirname, '../appsync/schema.graphql')
      ), //TODO: https://github.com/cdklabs/awscdk-appsync-utils should we implement?
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AppSyncAuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: userPool,
          },
        },
        additionalAuthorizationModes: [
          // remove if not required
          {
            authorizationType: AppSyncAuthorizationType.API_KEY,
            apiKeyConfig: {
              description: 'API Key for AppSync',
              expires: Expiration.after(Duration.days(30)), //update days if required
            },
          },
          // remove if not required
          { authorizationType: AppSyncAuthorizationType.IAM },
        ],
      },
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
        retention: RetentionDays.ONE_WEEK,
        role: apiLogRole,
      },
      xrayEnabled: true,
    });

    // create a cname to the appsync domain. will map to something like xxxx.cloudfront.net
    new CnameRecord(this, `CnameApiRecord`, {
      recordName: apiDomainName,
      zone: props.zone,
      domainName: api.appSyncDomainName,
    });

    new CfnOutput(this, 'GraphqlApiId', {
      value: api.apiId,
      exportName: `${appPrefix}-${env}-GraphqlApiId`,
    });

    new CfnOutput(this, 'GraphqlApiKey', {
      value: api.apiKey as string,
    });

    new CfnOutput(this, 'GraphqlApiUrl', {
      value: api.graphqlUrl,
      exportName: `${appPrefix}-${env}-GraphqlApiUrl`,
    });

    new CfnOutput(this, 'GraphqlApiArn', {
      value: api.graphqlUrl,
      exportName: `${appPrefix}-${env}-GraphqlApiArn`,
    });

    new CfnOutput(this, 'AppsyncApiId', {
      value: api.apiId,
      exportName: `${appPrefix}-${env}-AppsyncApiId`,
    });

    this.api = api;

    // DATA SOURCES
    const activityDS = api.addDynamoDbDataSource(
      'ActivityTableDataSource',
      props.activityTable
    );
    const autocompleteResultsDS = api.addDynamoDbDataSource(
      'AutocompleteResultsDataSource',
      props.autoCompleteResultsTable
    );
    const contactsDS = api.addDynamoDbDataSource(
      'ContactsTableDataSource',
      props.contactsTable
    );
    //const conversationDS = api.addDynamoDbDataSource(
    //  'ConversationTableDataSource',
    //  props.conversationTable
    //);
    const entityUserDS = api.addDynamoDbDataSource(
      'EntityUserTableDataSource',
      props.entityUserTable
    );
    const ratingsDS = api.addDynamoDbDataSource(
      'RatingsTableDataSource',
      props.ratingsTable
    );
    const signatureDS = api.addDynamoDbDataSource(
      'SignatureTableDataSource',
      props.signatureTable
    );
    const taskDS = api.addDynamoDbDataSource(
      'TaskTableDataSource',
      props.taskTable
    );
    const taskPaymentDS = api.addDynamoDbDataSource(
      'TaskPaymentTableDataSource',
      props.taskPaymentTable
    );
    //const teamDS = api.addDynamoDbDataSource(
    //  'TeamTableDataSource',
    //  props.teamTable
    //);
    //const messageDS = api.addDynamoDbDataSource(
    //  'MessageTableDataSource',
    //  props.messageTable
    //);
    const paymentDS = api.addDynamoDbDataSource(
      'PaymentTableDataSource',
      props.paymentTable
    );
    const paymentMethodTableDS = api.addDynamoDbDataSource(
      'PaymentMethodTableDataSource',
      props.paymentMethodTable
    );
    //const userConversationDS = api.addDynamoDbDataSource(
    //  'UserConversationTableDataSource',
    //  props.userConversationTable
    //);
    const entityDS = api.addDynamoDbDataSource(
      'EntityTableDataSource',
      props.entityTable
    );
    const noDS = api.addNoneDataSource('NoDataSource', {
      name: 'NoDataSource',
    });

    // AUTOCOMPLETE RESULTS
    // query autocomplete results by type
    new JsResolverConstruct(this, 'AutocompleteResultsByTypeResolver', {
      api,
      dataSource: autocompleteResultsDS,
      typeName: 'Query',
      fieldName: 'autocompleteResultsByType',
      pathName: 'Query.autocompleteResultsByType',
    });

    //// CONTACTS
    //// contact stream
    const contactStreamFunc = new NodejsFunction(
      this,
      'ContactStreamFunction',
      {
        ...getLambdaDefaultProps(this, 'streamContact'),
        environment: {
          TABLE_CONTACT: props.contactsTable.tableName,
          ZAI_DOMAIN: zaiDomain,
          ZAI_TOKEN_DOMAIN: zaiTokenDomain,
          ZAI_CLIENT_ID: zaiClientId,
          ZAI_CLIENT_SCOPE: zaiClientScope,
          ENV: env,
        },
      }
    );

    contactStreamFunc.addEventSource(
      new DynamoEventSource(props.contactsTable, {
        startingPosition: StartingPosition.TRIM_HORIZON,
      })
    );

    props.contactsTable.grantReadWriteData(contactStreamFunc);
    zaiSecrets.grantRead(contactStreamFunc);

    //get contact
    new JsResolverConstruct(this, 'GetContactResolver', {
      api,
      dataSource: contactsDS,
      typeName: 'Query',
      fieldName: 'getContact',
      pathName: 'Query.getContact',
    });

    // list contacts by entity
    new JsPipelineResolverConstruct(this, 'ListContactsResolver', {
      api,
      dataSources: [entityUserDS, contactsDS],
      typeName: 'Query',
      fieldName: 'contactsByEntity',
      pathName: 'Query.contactsByEntity',
    });

    // create contact
    new JsResolverConstruct(this, 'CreateContactResolver', {
      api,
      dataSource: contactsDS,
      typeName: 'Mutation',
      fieldName: 'createContact',
      pathName: 'Mutation.createContact',
    });

    // update contact
    new JsResolverConstruct(this, 'UpdateContactResolver', {
      api,
      dataSource: contactsDS,
      typeName: 'Mutation',
      fieldName: 'updateContact',
      pathName: 'Mutation.updateContact',
    });
    //
    // csv bulk upload
    const contactsBulkUploadQueue = new Queue(this, 'ContactsBulkUploadQueue', {
      queueName: 'ContactsBulkUploadQueue',
    });

    const createContactBulkUpload = new LambdaAppSyncOperationConstruct(
      this,
      'CreateContactBulkUploadResolver',
      {
        api,
        typeName: 'Mutation',
        fieldName: 'createContactBulkUpload',
        environmentVars: {
          SQS_QUEUE_URL: contactsBulkUploadQueue.queueUrl,
          TABLE_ENTITYUSER: props.entityUserTable.tableName,
          MIXPANEL_TOKEN: mixpanelToken,
        },
      }
    );

    props.entityUserTable.grantReadData(createContactBulkUpload.lambda);
    contactsBulkUploadQueue.grantSendMessages(createContactBulkUpload.lambda);

    const processContactBulkUpload = new NodejsFunction(
      this,
      'ProcessContactBulkUploadFunc',
      {
        ...getLambdaDefaultProps(this, 'processContactBulkUpload'),
        environment: {
          TABLE_ENTITY: props.entityTable.tableName,
          TABLE_CONTACT: props.contactsTable.tableName,
          STORAGE_BUCKETNAME: s3mediaBucket.bucketName,
          TABLE_NOTIFICATION: props.notificationTable.tableName,
          API_GRAPHQLAPIENDPOINT: api.graphqlUrl,
        },
      }
    );
    props.entityTable.grantReadData(processContactBulkUpload);
    props.contactsTable.grantWriteData(processContactBulkUpload);
    props.notificationTable.grantWriteData(processContactBulkUpload);
    s3mediaBucket.grantReadWrite(processContactBulkUpload);
    processContactBulkUpload.role?.attachInlinePolicy(
      new Policy(this, 'AppSyncInvokeProcessBulkUploadPolicy', {
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['appsync:GraphQL'],
            resources: [
              `arn:aws:appsync:${this.region}:${this.account}:apis/${api.apiId}/*`,
            ],
          }),
        ],
      })
    );
    contactsBulkUploadQueue.grantConsumeMessages(processContactBulkUpload);

    // lambda trigger for SQS messages
    // add trigger to receive SQS messages
    const contactBulkUploadEventSource = new SqsEventSource(
      contactsBulkUploadQueue,
      {
        batchSize: 1,
      }
    );
    processContactBulkUpload.addEventSource(contactBulkUploadEventSource);

    //// CONVERSATION
    //// get conversations
    //new JsResolverConstruct(this, 'GetConversationResolver', {
    //  api,
    //  dataSource: conversationDS,
    //  typeName: 'Query',
    //  fieldName: 'getConversation',
    //  pathName: 'Query.getConversation',
    //});
    //
    //// list conversations
    //new JsResolverConstruct(this, 'ListConversationsResolver', {
    //  api,
    //  dataSource: conversationDS,
    //  typeName: 'Query',
    //  fieldName: 'listConversations',
    //  pathName: 'listConversations',
    //});
    //
    //new JsResolverConstruct(this, 'ConversationMessagesResolver', {
    //  api,
    //  dataSource: messageDS,
    //  typeName: 'Conversation',
    //  fieldName: 'messages',
    //  pathName: 'Conversation.messages',
    //});
    //
    //new JsResolverConstruct(this, 'ConversationUserConversationsResolver', {
    //  api,
    //  dataSource: userConversationDS,
    //  typeName: 'Conversation',
    //  fieldName: 'userConversations',
    //  pathName: 'Conversation.userConversations',
    //});
    //
    //// create conversation
    //new JsResolverConstruct(this, 'CreateConversationResolver', {
    //  api,
    //  dataSource: conversationDS,
    //  typeName: 'Mutation',
    //  fieldName: 'createConversation',
    //  pathName: 'Mutation.createConversation',
    //});
    //
    //// conversation stream
    //const conversationStreamFunc = new NodejsFunction(
    //  this,
    //  'ConversationStreamFunction',
    //  {
    //    ...getLambdaDefaultProps(this, 'streamConversation'),
    //    environment: {
    //      ANALYTICS_PINPOINT_ID: pinpointAppId,
    //      TABLE_MESSAGE: props.messageTable.tableName,
    //    },
    //  }
    //);
    //
    //props.messageTable.grantReadWriteData(conversationStreamFunc);
    //conversationStreamFunc.addEventSource(
    //  new DynamoEventSource(props.conversationTable, {
    //    startingPosition: StartingPosition.TRIM_HORIZON,
    //  })
    //);

    //// block user
    //const blockUser = new LambdaAppSyncOperationConstruct(this, 'BlockUser', {
    //  api,
    //  typeName: 'Mutation',
    //  fieldName: 'blockUser',
    //  environmentVars: {
    //    TABLE_CONVERSATION: props.conversationTable.tableName,
    //    TABLE_USER: props.userTable.tableName,
    //    TABLE_USERCONVERSATION: props.userConversationTable.tableName,
    //    API_GRAPHQLAPIENDPOINT: api.graphqlUrl,
    //  },
    //});
    //
    //props.conversationTable.grantReadData(blockUser.lambda);
    //props.userConversationTable.grantReadWriteData(blockUser.lambda);
    //props.userTable.grantReadWriteData(blockUser.lambda);

    // ACCOUNT
    // delete account
    //const deleteAccount = new LambdaAppSyncOperationConstruct(
    //  this,
    //  'DeleteAccount',
    //  {
    //    api,
    //    typeName: 'Mutation',
    //    fieldName: 'deleteAccount',
    //    environmentVars: {
    //      AUTH_USERPOOLID: userPool.userPoolId,
    //      TABLE_USER: props.userTable.tableName,
    //      MIXPANEL_TOKEN: mixpanelToken,
    //    },
    //  }
    //);

    //userPool.grant(deleteAccount.lambda, 'cognito-idp:AdminDeleteUser');
    //props.userTable.grantWriteData(deleteAccount.lambda);

    ////IAP
    //// validate user IAP receipt
    //const validateUserIAPReceipt = new LambdaAppSyncOperationConstruct(
    //  this,
    //  'ValidateUserIAPReceipt',
    //  {
    //    api,
    //    typeName: 'Mutation',
    //    fieldName: 'validateUserIAPReceipt',
    //    environmentVars: {
    //      TABLE_TRANSACTION: props.transactionTable.tableName,
    //      TABLE_USER: props.userTable.tableName,
    //      ENV: env,
    //      APPLE_BUNDLE_ID: appleBundleId,
    //      APPLE_CONNECT_KEY: appleConnectKey,
    //      APPLE_CONNECT_KEY_ID: appleConnectKeyId,
    //      APPLE_CONNECT_ISSUER_ID: appleConnectIssuerId,
    //      GOOGLE_BUNDLE_ID: googleBundleId,
    //    },
    //  }
    //);
    //
    //props.transactionTable.grantWriteData(validateUserIAPReceipt.lambda);
    //props.userTable.grantReadWriteData(validateUserIAPReceipt.lambda);
    //
    //// apple webhook handler function
    //const appleHandlerFunc = new NodejsFunction(this, 'AppleHandlerFunction', {
    //  ...getLambdaDefaultProps(this, 'appleWebhookHandler'),
    //  environment: {
    //    TABLE_USER: props.userTable.tableName,
    //    ENV: env,
    //  },
    //});
    //
    //props.userTable.grantReadWriteData(appleHandlerFunc);
    //
    //// apple webhook listener function
    //const appleListenerFunc = new NodejsFunction(
    //  this,
    //  'AppleWebhookListenerFunction',
    //  {
    //    ...getLambdaDefaultProps(this, 'appleWebhookListener'),
    //    environment: {
    //      FUNCTION_APPLEWEBHOOKHANDLER: appleHandlerFunc.functionName,
    //      APPLE_BUNDLE_ID: appleBundleId,
    //    },
    //  }
    //);
    //
    //appleHandlerFunc.grantInvoke(appleListenerFunc);
    //
    //const appleIntegration = new LambdaIntegration(appleListenerFunc);
    //
    //const appleWebhookEndpoint = restApi.root.addResource('webhook-apple'); //TODO: obfuscation of webhook endpoint
    //appleWebhookEndpoint.addMethod('ANY', appleIntegration, {
    //  authorizationType: RESTAuthorizationType.NONE,
    //});
    //
    ////TODO: implement apple ip address whitelist
    ////const appleIamPolicy = new PolicyDocument({
    ////  statements: [
    ////    new PolicyStatement({
    ////      effect: Effect.DENY,
    ////      principals: [new AnyPrincipal()],
    ////      actions: ["execute-api:Invoke"],
    ////      resources: [appleMethod.methodArn]
    ////    }),
    ////    new PolicyStatement({
    ////      effect: Effect.ALLOW,
    ////      principals: [new AnyPrincipal()],
    ////      resources: [appleMethod.methodArn],
    ////      actions: ['execute-api:Invoke'],
    ////      conditions: {
    ////        'NotIpAddress': {
    ////          'aws:SourceIp': '17.0.0.0/8'
    ////        }
    ////      }
    ////    })
    ////  ]
    ////})
    //
    //// google webhook handler function
    //const googleHandlerFunc = new NodejsFunction(
    //  this,
    //  'GoogleHandlerFunction',
    //  {
    //    ...getLambdaDefaultProps(this, 'googleWebhookHandler'),
    //    environment: {
    //      TABLE_TRANSACTION: props.transactionTable.tableName,
    //      TABLE_USER: props.userTable.tableName,
    //      ENV: env,
    //      GOOGLE_BUNDLE_ID: googleBundleId,
    //    },
    //  }
    //);
    //
    //props.transactionTable.grantReadWriteData(googleHandlerFunc);
    //props.userTable.grantReadWriteData(googleHandlerFunc);
    //
    //// google webhook listener function
    //const googleListenerFunc = new NodejsFunction(
    //  this,
    //  'GoogleWebhookListenerFunction',
    //  {
    //    ...getLambdaDefaultProps(this, 'googleWebhookListener'),
    //    environment: {
    //      FUNCTION_GOOGLEWEBHOOKHANDLER: googleHandlerFunc.functionName,
    //      GOOGLE_BUNDLE_ID: googleBundleId,
    //    },
    //  }
    //);
    //
    //const googleIntegration = new LambdaIntegration(googleListenerFunc);
    //
    //const googleWebhookEndpoint = restApi.root.addResource('webhook-google'); //TODO: obfuscation of webhook endpoint
    //googleWebhookEndpoint.addMethod('ANY', googleIntegration, {
    //  authorizationType: RESTAuthorizationType.NONE,
    //});
    //
    ////TODO: IP whitelist

    // USERS
    const userDS = api.addDynamoDbDataSource(
      'UserTableDataSource',
      props.userTable
    );

    // user stream
    const userStreamFunc = new NodejsFunction(this, 'UserStreamFunction', {
      ...getLambdaDefaultProps(this, 'streamUser'),
      environment: {
        TABLE_ENTITY: props.entityTable.tableName,
        TABLE_ENTITYUSER: props.entityUserTable.tableName,
        TABLE_USER: props.userTable.tableName,
        ZAI_DOMAIN: zaiDomain,
        ZAI_TOKEN_DOMAIN: zaiTokenDomain,
        ZAI_CLIENT_ID: zaiClientId,
        ZAI_CLIENT_SCOPE: zaiClientScope,
        ENV: env,
      },
    });
    userStreamFunc.addEventSource(
      new DynamoEventSource(props.userTable, {
        startingPosition: StartingPosition.TRIM_HORIZON,
      })
    );
    props.entityTable.grantReadWriteData(userStreamFunc);
    props.entityUserTable.grantReadWriteData(userStreamFunc);
    props.userTable.grantWriteData(userStreamFunc);
    zaiSecrets.grantRead(userStreamFunc);

    // update user
    const updateUser = new LambdaAppSyncOperationConstruct(this, 'UpdateUser', {
      api,
      typeName: 'Mutation',
      fieldName: 'updateUser',
      environmentVars: {
        AUTH_USERPOOLID: userPool.userPoolId,
        TABLE_USER: props.userTable.tableName,
        MIXPANEL_TOKEN: mixpanelToken,
        ENV: env,
        ZAI_DOMAIN: zaiDomain,
        ZAI_TOKEN_DOMAIN: zaiTokenDomain,
        ZAI_CLIENT_ID: zaiClientId,
        ZAI_CLIENT_SCOPE: zaiClientScope,
      },
    });
    props.userTable.grantWriteData(updateUser.lambda);
    zaiSecrets.grantRead(updateUser.lambda);

    updateUser.lambda.role?.attachInlinePolicy(
      new Policy(this, 'UpdateUserFuncUserPoolPolicy', {
        statements: [
          new PolicyStatement({
            actions: ['cognito-idp:AdminUpdateUserAttributes'],
            effect: Effect.ALLOW,
            resources: [userPool.userPoolArn],
          }),
        ],
      })
    );

    // update user identity id
    const updateUserIdentityIdFunc = new NodejsFunction(
      this,
      'UpdateUserIdentityIdFunction',
      {
        ...getLambdaDefaultProps(this, 'updateUserIdentityId'),
        environment: {
          TABLE_USER: props.userTable.tableName,
          AUTH_USERPOOLID: userPool.userPoolId,
          AUTH_IDENTITYPOOLID: identityPool.identityPoolId,
        },
      }
    );
    const updateUserIdentityIdIntegration = new LambdaIntegration(
      updateUserIdentityIdFunc
    );
    const identityIdEndpoint = restApi.root.addResource('identity-id');
    identityIdEndpoint.addMethod('ANY', updateUserIdentityIdIntegration, {
      authorizer: restApiCognitoAuthorizer,
      authorizationType: RESTAuthorizationType.COGNITO,
    });

    props.userTable.grantWriteData(updateUserIdentityIdFunc);
    updateUserIdentityIdFunc.role?.attachInlinePolicy(
      new Policy(this, 'UpdateUserIdentityIdFuncUserPoolPolicy', {
        statements: [
          new PolicyStatement({
            actions: ['cognito-idp:AdminUpdateUserAttributes'],
            effect: Effect.ALLOW,
            resources: [userPool.userPoolArn],
          }),
        ],
      })
    );

    // get user
    new JsResolverConstruct(this, 'GetUserResolver', {
      api,
      dataSource: userDS,
      typeName: 'Query',
      fieldName: 'getUser',
      pathName: 'getUser',
    });

    // list users
    new JsResolverConstruct(this, 'ListUsersResolver', {
      api,
      dataSource: userDS,
      typeName: 'Query',
      fieldName: 'listUsers',
      pathName: 'Query.listUsers',
    });

    //new JsResolverConstruct(this, 'UserBillingResolver', {
    //  api,
    //  dataSource: billingDS,
    //  typeName: 'User',
    //  fieldName: 'billing',
    //  pathName: 'User.billing',
    //});

    //new JsResolverConstruct(this, 'UserTeamResolver', {
    //  api,
    //  dataSource: teamDS,
    //  typeName: 'User',
    //  fieldName: 'team',
    //  pathName: 'User.team',
    //});

    //new JsResolverConstruct(this, 'UserRatingsResolver', {
    //  api,
    //  dataSource: ratingsDS,
    //  typeName: 'User',
    //  fieldName: 'ratings',
    //  pathName: 'User.ratings'
    //});

    // SIGNATURES
    // create signature
    new JsResolverConstruct(this, 'CreateSignatureResolver', {
      api,
      dataSource: signatureDS,
      typeName: 'Mutation',
      fieldName: 'createSignature',
      pathName: 'Mutation.createSignature',
    });

    // delete signature
    new JsResolverConstruct(this, 'DeleteSignatureResolver', {
      api,
      dataSource: signatureDS,
      typeName: 'Mutation',
      fieldName: 'deleteSignature',
      pathName: 'Mutation.deleteSignature',
    });

    // user signatures
    new JsResolverConstruct(this, 'UserSignaturesResolver', {
      api,
      dataSource: signatureDS,
      typeName: 'User',
      fieldName: 'signatures',
      pathName: 'User.signatures',
    });

    // TASKS
    // task stream
    const taskStreamFunc = new NodejsFunction(this, 'TaskStreamFunction', {
      ...getLambdaDefaultProps(this, 'streamTask'),
      environment: {
        TABLE_ACTIVITY: props.activityTable.tableName,
      },
    });

    taskStreamFunc.addEventSource(
      new DynamoEventSource(props.taskTable, {
        startingPosition: StartingPosition.TRIM_HORIZON,
      })
    );
    props.activityTable.grantReadWriteData(taskStreamFunc);
    props.taskTable.grantReadWriteData(taskStreamFunc);

    // task activity
    new JsResolverConstruct(this, 'TaskActivityResolver', {
      api,
      dataSource: activityDS,
      typeName: 'Task',
      fieldName: 'activity',
      pathName: 'Task.activity',
    });

    // TODO: rename TaskPaymentsResolver
    new JsResolverConstruct(this, 'TaskPaymentResolver', {
      api,
      dataSource: paymentDS,
      typeName: 'Task',
      fieldName: 'payments',
      pathName: 'Task.payments',
    });

    //TODO: remove
    new JsResolverConstruct(this, 'TaskPaymentsResolver', {
      api,
      dataSource: taskPaymentDS,
      typeName: 'Task',
      fieldName: 'taskPayments',
      pathName: 'Task.taskPayments',
    });

    // get task
    new JsPipelineResolverConstruct(this, 'GetTaskResolver', {
      api,
      dataSources: [entityUserDS, taskDS],
      typeName: 'Query',
      fieldName: 'getTask',
      pathName: 'Query.getTask',
    });

    // create task
    new JsPipelineResolverConstruct(this, 'CreateTaskResolver', {
      api,
      dataSources: [entityUserDS, taskDS],
      typeName: 'Mutation',
      fieldName: 'createTask',
      pathName: 'Mutation.createTask',
    });

    // update task
    new JsPipelineResolverConstruct(this, 'UpdateTaskResolver', {
      api,
      dataSources: [entityUserDS, taskDS, taskDS],
      typeName: 'Mutation',
      fieldName: 'updateTask',
      pathName: 'Mutation.updateTask',
    });

    // list tasks by entity from and search status
    new JsPipelineResolverConstruct(this, 'TasksByEntityFromResolver', {
      api,
      dataSources: [entityUserDS, taskDS],
      typeName: 'Query',
      fieldName: 'tasksByEntityFrom',
      pathName: 'Query.tasksByEntityFrom',
    });

    // list tasks by entity to and search status
    new JsPipelineResolverConstruct(this, 'TasksByEntityToResolver', {
      api,
      dataSources: [entityUserDS, taskDS],
      typeName: 'Query',
      fieldName: 'tasksByEntityTo',
      pathName: 'Query.tasksByEntityTo',
    });

    // list tasks by entity by
    new JsPipelineResolverConstruct(this, 'TasksByEntityByResolver', {
      api,
      dataSources: [entityUserDS, taskDS],
      typeName: 'Query',
      fieldName: 'tasksByEntityBy',
      pathName: 'Query.tasksByEntityBy',
    });

    // TASK DOCUMENT URL
    // create task presigned document url from lambda
    const createTaskDocumentUrl = new LambdaAppSyncOperationConstruct(
      this,
      'CreateTaskDocumentUrl',
      {
        api,
        typeName: 'Mutation',
        fieldName: 'createTaskDocumentUrl',
        environmentVars: {
          STORAGE_BUCKETNAME: s3mediaBucket.bucketName,
          TABLE_ENTITYUSER: props.entityUserTable.tableName,
          TABLE_TASK: props.taskTable.tableName,
        },
      }
    );
    props.entityUserTable.grantReadData(createTaskDocumentUrl.lambda);
    props.taskTable.grantReadData(createTaskDocumentUrl.lambda);
    s3mediaBucket.grantReadWrite(createTaskDocumentUrl.lambda);

    //// MESSAGES
    //// message stream
    //const messageStreamFunc = new NodejsFunction(
    //  this,
    //  'MessageStreamFunction',
    //  {
    //    ...getLambdaDefaultProps(this, 'streamMessage'),
    //    environment: {
    //      ANALYTICS_PINPOINT_ID: pinpointAppId,
    //      TABLE_CONVERSATION: props.conversationTable.tableName,
    //    },
    //  }
    //);
    //
    //messageStreamFunc.addEventSource(
    //  new DynamoEventSource(props.messageTable, {
    //    startingPosition: StartingPosition.TRIM_HORIZON,
    //  })
    //);
    //
    ////get message
    //new JsResolverConstruct(this, 'GetMessageResolver', {
    //  api,
    //  dataSource: messageDS,
    //  typeName: 'Query',
    //  fieldName: 'getMessage',
    //  pathName: 'getMessage',
    //});
    //
    //new JsResolverConstruct(this, 'ListMessagesResolver', {
    //  api,
    //  dataSource: messageDS,
    //  typeName: 'Query',
    //  fieldName: 'listMessages',
    //  pathName: 'Query.listMessages',
    //});

    // NOTIFICATIONS
    const notificationDS = api.addDynamoDbDataSource(
      'NotificationTableDataSource',
      props.notificationTable
    );

    // list notifications by user
    new JsResolverConstruct(this, 'NotificationsByUserResolver', {
      api,
      dataSource: notificationDS,
      typeName: 'Query',
      fieldName: 'notificationsByUser',
      pathName: 'Query.notificationsByUser',
    });
    // create notification
    new JsResolverConstruct(this, 'CreateNotificationResolver', {
      api,
      dataSource: notificationDS,
      typeName: 'Mutation',
      fieldName: 'createNotification',
      pathName: 'Mutation.createNotification',
    });
    // update notification
    new JsResolverConstruct(this, 'UpdateNotificationResolver', {
      api,
      dataSource: notificationDS,
      typeName: 'Mutation',
      fieldName: 'updateNotification',
      pathName: 'Mutation.updateNotification',
    });
    // subscription to be notified when notification created
    new JsResolverConstruct(this, 'OnCreateNotificationResolver', {
      api,
      dataSource: noDS,
      typeName: 'Subscription',
      fieldName: 'onCreateNotification',
      pathName: 'Subscription.onCreateNotification',
    });

    // OPTIONS
    const optionDS = api.addDynamoDbDataSource(
      'OptionTableDataSource',
      props.optionTable
    );
    new JsResolverConstruct(this, 'GetOptionResolver', {
      api,
      dataSource: optionDS,
      typeName: 'Query',
      fieldName: 'getOption',
      pathName: 'Query.getOption',
    });

    new JsResolverConstruct(this, 'CreateOptionResolver', {
      api,
      dataSource: optionDS,
      typeName: 'Mutation',
      fieldName: 'createOption',
      pathName: 'Mutation.createOption',
    });

    // init env
    const initEnvFunc = new NodejsFunction(this, 'InitEnvFunction', {
      ...getLambdaDefaultProps(this, 'initEnv'),
      environment: {
        TABLE_ENTITY: props.entityTable.tableName,
        TABLE_OPTION: props.optionTable.tableName,
        ZAI_DOMAIN: zaiDomain,
        ZAI_TOKEN_DOMAIN: zaiTokenDomain,
        ZAI_WEBHOOK_DOMAIN: zaiWebhookDomain,
        ZAI_WEBHOOK_LISTENER_DOMAIN: `${restApiDomainName}/webhook-zai`, //TODO: obfuscation of webhook endpoint
        ZAI_CLIENT_ID: zaiClientId,
        ZAI_CLIENT_SCOPE: zaiClientScope,
        ENV: env,
      },
    });

    props.entityTable.grantWriteData(initEnvFunc);
    props.optionTable.grantWriteData(initEnvFunc);
    zaiSecrets.grantRead(initEnvFunc);

    new JsResolverConstruct(this, 'ListOptionsResolver', {
      api,
      dataSource: optionDS,
      typeName: 'Query',
      fieldName: 'listOptions',
      pathName: 'Query.listOptions',
    });

    // billings by user id
    new JsResolverConstruct(this, 'OptionsByGroupResolver', {
      api,
      dataSource: optionDS,
      typeName: 'Query',
      fieldName: 'optionsByGroup',
      pathName: 'Query.optionsByGroup',
    });

    // ENTITY
    // entity stream
    const entityStream = new NodejsFunction(this, 'EntityStreamFunction', {
      ...getLambdaDefaultProps(this, 'streamEntity'),
      environment: {
        TABLE_AUTOCOMPLETE_RESULT: props.autoCompleteResultsTable.tableName,
        TABLE_BENEFICIAL_OWNER: beneficialOwnerTable.tableName,
        TABLE_ENTITY: props.entityTable.tableName,
        ZAI_DOMAIN: zaiDomain,
        ZAI_TOKEN_DOMAIN: zaiTokenDomain,
        ZAI_CLIENT_ID: zaiClientId,
        ZAI_CLIENT_SCOPE: zaiClientScope,
        ENV: env,
        ABR_GUID: abrGuid,
        FRANKIEONE_API_KEY: frankieOneApiKey,
        FRANKIEONE_API_DOMAIN: frankieOneApiDomain,
        FRANKIEONE_CUSTOMER_ID: frankieOneCustomerId,
      },
    });
    entityStream.addEventSource(
      new DynamoEventSource(props.entityTable, {
        startingPosition: StartingPosition.TRIM_HORIZON,
      })
    );
    beneficialOwnerTable.grantReadWriteData(entityStream);
    props.entityTable.grantReadWriteData(entityStream);
    props.autoCompleteResultsTable.grantReadWriteData(entityStream);
    zaiSecrets.grantRead(entityStream);

    //get entity
    new JsPipelineResolverConstruct(this, 'GetAutoCompleteResolver', {
      api,
      dataSources: [entityDS, contactsDS],
      typeName: 'Query',
      fieldName: 'getAutoComplete',
      pathName: 'Query.getAutoComplete',
    });

    //get entity
    new JsPipelineResolverConstruct(this, 'GetEntityResolver', {
      api,
      dataSources: [entityUserDS, entityDS],
      typeName: 'Query',
      fieldName: 'getEntity',
      pathName: 'Query.getEntity',
    });

    //list entities by user
    //new JsPipelineResolverConstruct(this, 'EntitiesByUserResolver', {
    //  api,
    //  dataSources: [entityUserDS, entityDS],
    //  typeName: 'Query',
    //  fieldName: 'entitiesByUser',
    //  pathName: 'Query.entitiesByUser',
    //});

    // Entity's entity users
    new JsResolverConstruct(this, 'EntityEntityUsersResolver', {
      api,
      dataSource: entityUserDS,
      typeName: 'Entity',
      fieldName: 'entityUsers',
      pathName: 'Entity.entityUsers',
    });

    // Entity's tasks
    //new JsResolverConstruct(this, 'EntityTasksResolver', {
    //  api,
    //  dataSource: taskDS,
    //  typeName: 'Entity',
    //  fieldName: 'tasks',
    //  pathName: 'Entity.tasks',
    //});

    new JsPipelineResolverConstruct(this, 'EntityTasksResolver', {
      api,
      dataSources: [taskDS, taskDS],
      typeName: 'Entity',
      fieldName: 'tasks',
      pathName: 'Entity.tasks',
    });

    // Entity's payment methods
    new JsResolverConstruct(this, 'EntityPaymentMethodsResolver', {
      api,
      dataSource: paymentMethodTableDS,
      typeName: 'Entity',
      fieldName: 'paymentMethods',
      pathName: 'Entity.paymentMethods',
    });

    // delete entity
    new JsResolverConstruct(this, 'DeleteEntityResolver', {
      api,
      dataSource: entityDS,
      typeName: 'Mutation',
      fieldName: 'deleteEntity',
      pathName: 'Mutation.deleteEntity',
    });

    // create entity
    new JsPipelineResolverConstruct(this, 'CreateEntityResolver', {
      api,
      dataSources: [entityDS, entityUserDS],
      typeName: 'Mutation',
      fieldName: 'createEntity',
      pathName: 'Mutation.createEntity',
    });

    // update entity
    new JsResolverConstruct(this, 'UpdateEntityResolver', {
      api,
      dataSource: entityDS,
      typeName: 'Mutation',
      fieldName: 'updateEntity',
      pathName: 'Mutation.updateEntity',
    });

    new JsPipelineResolverConstruct(this, 'OnUpdateEntityResolver', {
      api,
      dataSources: [entityUserDS, noDS],
      typeName: 'Subscription',
      fieldName: 'onUpdateEntity',
      pathName: 'Subscription.onUpdateEntity',
    });

    // abr lookup
    new LambdaAppSyncOperationConstruct(this, 'ABRLookupQuery', {
      api,
      typeName: 'Query',
      fieldName: 'abrLookup', //TODO: rename to abrLookupByAbn
      environmentVars: {
        ABR_GUID: abrGuid,
      },
    });

    // abr lookup by name
    new LambdaAppSyncOperationConstruct(this, 'ABRLookupByNameQuery', {
      api,
      typeName: 'Query',
      fieldName: 'abrLookupByName',
      environmentVars: {
        ABR_GUID: abrGuid,
      },
    });

    // create entity
    //const createEntity = new LambdaAppSyncOperationConstruct(
    //  this,
    //  'CreateEntity',
    //  {
    //    api,
    //
    //    typeName: 'Mutation',
    //    fieldName: 'createEntity',
    //    environmentVars: {
    //      TABLE_ENTITY: props.entityTable.tableName,
    //      TABLE_ENTITY_USER: props.entityTableUser.tableName,
    //      MIXPANEL_TOKEN: mixpanelToken,
    //    },
    //  }
    //);
    //props.entityTable.grantWriteData(createEntity.lambda);
    //props.entityUserTable.grantWriteData(createEntity.lambda);

    // // update Entity
    // const updateEntity = new LambdaAppSyncOperationConstruct(
    //   this,
    //   'UpdateEntity',
    //   {
    //     api,
    //     typeName: 'Mutation',
    //     fieldName: 'updateEntity',
    //     environmentVars: {
    //       TABLE_Entity: props.entityTable.tableName,
    //     },
    //   }
    // );
    // props.entityTable.grantWriteData(updateEntity.lambda);

    // updateEntity.lambda.role?.attachInlinePolicy(
    //   new Policy(this, 'UpdateEntityFuncUserPoolPolicy', {
    //     statements: [
    //       new PolicyStatement({
    //         actions: ['cognito-idp:AdminUpdateUserAttributes'],
    //         effect: Effect.ALLOW,
    //         resources: [userPool.userPoolArn],
    //       }),
    //     ],
    //   })
    // );

    // ENTITY USERS

    // query entity users by user id
    new JsPipelineResolverConstruct(this, 'EntityUsersByEntityIdResolver', {
      api,
      dataSources: [entityUserDS, entityUserDS],
      typeName: 'Query',
      fieldName: 'entityUsersByEntityId',
      pathName: 'Query.entityUsersByEntityId',
    });

    // query entity users by user id
    new JsResolverConstruct(this, 'EntityUsersByUserResolver', {
      api,
      dataSource: entityUserDS,
      typeName: 'Query',
      fieldName: 'entityUsersByUser',
      pathName: 'Query.entityUsersByUser',
    });

    // Entity user's entity
    new JsResolverConstruct(this, 'EntityUserEntityResolver', {
      api,
      dataSource: entityDS,
      typeName: 'EntityUser',
      fieldName: 'entity',
      pathName: 'EntityUser.entity',
    });

    const createEntityUserFunc = new LambdaAppSyncOperationConstruct(
      this,
      'CreateEntityUserResolver',
      {
        api,
        typeName: 'Mutation',
        fieldName: 'createEntityUser',
        environmentVars: {
          AUTH_USERPOOLID: userPool.userPoolId,
          TABLE_ENTITY: props.entityTable.tableName,
          TABLE_ENTITYUSER: props.entityUserTable.tableName,
          FUNCTION_CREATEUSER: createUserFuncName,
        },
      }
    );

    props.entityTable.grantReadData(createEntityUserFunc.lambda);
    props.entityUserTable.grantReadWriteData(createEntityUserFunc.lambda);

    // allow create cognito user permissions
    createEntityUserFunc.lambda.role?.attachInlinePolicy(
      new Policy(this, 'CreateEntityUserFuncUserPoolPolicy', {
        statements: [
          new PolicyStatement({
            actions: [
              'cognito-idp:AdminGetUser',
              'cognito-idp:AdminCreateUser',
            ],
            resources: [userPool.userPoolArn],
          }),
        ],
      })
    );

    // invoke create user permissions
    createEntityUserFunc.lambda.role?.attachInlinePolicy(
      new Policy(this, 'CreateEntityUserFuncInvokeCreateUserFunc', {
        statements: [
          new PolicyStatement({
            actions: ['lambda:InvokeFunction'],
            resources: [
              `arn:aws:lambda:${props.env?.region}:${props.env?.account}:function:${createUserFuncName}`,
            ],
          }),
        ],
      })
    );

    // delete entity user
    new JsPipelineResolverConstruct(this, 'DeleteEntityUserResolver', {
      api,
      dataSources: [entityUserDS, entityUserDS],
      typeName: 'Mutation',
      fieldName: 'deleteEntityUser',
      pathName: 'Mutation.deleteEntityUser',
    });

    //TODO: remove this function? Or use for team?
    const createTeamUserFunc = new NodejsFunction(
      this,
      'CreateTeamUserFunction',
      {
        ...getLambdaDefaultProps(this, 'createTeamUser'),
        environment: {
          AUTH_USERPOOLID: userPool.userPoolId, //TODO: cyclic dependency
          TABLE_TEAM: props.teamTable.tableName,
          FUNCTION_CREATEUSER: createUserFuncName,
        },
      }
    );

    // invoke create user permissions
    createTeamUserFunc.role?.attachInlinePolicy(
      new Policy(this, 'CreateTeamUserFuncInvokeCreateUserFunc', {
        statements: [
          new PolicyStatement({
            actions: ['lambda:InvokeFunction'],
            resources: [
              `arn:aws:lambda:${props.env?.region}:${props.env?.account}:function:${createUserFuncName}`,
            ],
          }),
        ],
      })
    );

    props.teamTable.grantReadWriteData(createTeamUserFunc);

    //TODO: remove this function? or use for team?
    const deleteTeamUserFunc = new NodejsFunction(
      this,
      'DeleteTeamUserFunction',
      {
        ...getLambdaDefaultProps(this, 'deleteTeamUser'),
        environment: {
          AUTH_USERPOOLID: userPool.userPoolId, //TODO: cyclic dependency
          TABLE_TEAM: props.teamTable.tableName,
          TABLE_TEAMUSER: props.teamUserTable.tableName,
          TABLE_USER: props.userTable.tableName,
        },
      }
    );

    props.teamTable.grantReadData(deleteTeamUserFunc);
    props.teamUserTable.grantReadWriteData(deleteTeamUserFunc);

    // invoke create user permissions
    deleteTeamUserFunc.role?.attachInlinePolicy(
      new Policy(this, 'DeleteTeamUserFuncUserPoolPolicy', {
        statements: [
          new PolicyStatement({
            actions: ['cognito-idp:AdminUpdateUserAttributes'],
            resources: [userPool.userPoolArn],
          }),
        ],
      })
    );

    // FRANKIEONE
    // frankieone webhook handler function
    const frankieOneHandlerFunc = new NodejsFunction(
      this,
      'FrankieOneHandlerFunction',
      {
        ...getLambdaDefaultProps(this, 'frankieOneWebhookHandler'),
        environment: {
          TABLE_ENTITY: props.entityTable.tableName,
          FRANKIEONE_API_KEY: frankieOneApiKey,
          FRANKIEONE_API_DOMAIN: frankieOneApiDomain,
          FRANKIEONE_CUSTOMER_ID: frankieOneCustomerId,
        },
      }
    );

    props.entityTable.grantReadWriteData(frankieOneHandlerFunc);

    // frankieone webhook listener function
    const frankieOneListenerFunc = new NodejsFunction(
      this,
      'FrankieOneWebhookListenerFunction',
      {
        ...getLambdaDefaultProps(this, 'frankieOneWebhookListener'),
        environment: {
          FUNCTION_FRANKIEONEWEBHOOKHANDLER: frankieOneHandlerFunc.functionName,
          FRANKIEONE_API_KEY: frankieOneApiKey,
          FRANKIEONE_API_DOMAIN: frankieOneApiDomain,
          FRANKIEONE_CUSTOMER_ID: frankieOneCustomerId,
        },
      }
    );
    frankieOneHandlerFunc.grantInvoke(frankieOneListenerFunc);
    const frankieOneIntegration = new LambdaIntegration(frankieOneListenerFunc);

    const frankieOneWebhookEndpoint =
      restApi.root.addResource('webhook-frankieone'); //TODO: obfuscation of webhook endpoint
    const frankieOneWebhookProxy =
      frankieOneWebhookEndpoint.addResource('{proxy+}');

    frankieOneWebhookProxy.addMethod('POST', frankieOneIntegration, {
      authorizationType: RESTAuthorizationType.NONE,
    });

    // TODO: ip whitelist for frankeione endpoint

    // getBusinessLookup
    new LambdaAppSyncOperationConstruct(this, 'GetBusinessLookup', {
      api,
      typeName: 'Query',
      fieldName: 'getBusinessLookup',
      environmentVars: {
        FRANKIEONE_API_KEY: frankieOneApiKey,
        FRANKIEONE_API_DOMAIN: frankieOneApiDomain,
        FRANKIEONE_CUSTOMER_ID: frankieOneCustomerId,
        FRANKIEONE_SMARTUI_DOMAIN: frankieOneSmartUiDomain,
      },
    });

    // lookup entity ownership
    const lookupEntityOwnership = new LambdaAppSyncOperationConstruct(
      this,
      'LookupEntityOwnership',
      {
        api,
        typeName: 'Mutation',
        fieldName: 'lookupEntityOwnership',
        environmentVars: {
          TABLE_ENTITY: props.entityTable.tableName,
          TABLE_ENTITY_USER: props.entityUserTable.tableName,
          FRANKIEONE_API_KEY: frankieOneApiKey,
          FRANKIEONE_API_DOMAIN: frankieOneApiDomain,
          FRANKIEONE_CUSTOMER_ID: frankieOneCustomerId,
        },
      }
    );

    props.entityTable.grantReadWriteData(lookupEntityOwnership.lambda);
    props.entityUserTable.grantReadData(lookupEntityOwnership.lambda);

    // create frankieone smart ui session
    const createVerificationToken = new LambdaAppSyncOperationConstruct(
      this,
      'CreateFrankieOneSmartUiSession',
      {
        api,
        typeName: 'Mutation',
        fieldName: 'createVerificationToken',
        environmentVars: {
          TABLE_ENTITY_USER: props.entityUserTable.tableName,
          TABLE_BENEFICIAL_OWNER: beneficialOwnerTable.tableName,
          FRANKIEONE_API_KEY: frankieOneApiKey,
          FRANKIEONE_API_DOMAIN: frankieOneApiDomain,
          FRANKIEONE_CUSTOMER_ID: frankieOneCustomerId,
          FRANKIEONE_SMARTUI_DOMAIN: frankieOneSmartUiDomain,
        },
      }
    );

    props.entityUserTable.grantReadWriteData(createVerificationToken.lambda);
    beneficialOwnerTable.grantReadWriteData(createVerificationToken.lambda);

    // PAYMENTS
    // payments stream
    const paymentStreamFunc = new NodejsFunction(
      this,
      'PaymentStreamFunction',
      {
        ...getLambdaDefaultProps(this, 'streamPayment'),
        environment: {
          ANALYTICS_PINPOINT_ID: pinpointAppId,
          TABLE_ENTITY: props.entityTable.tableName,
          TABLE_TASKS: props.taskTable.tableName,
          TABLE_USER: props.userTable.tableName,
        },
      }
    );

    paymentStreamFunc.addEventSource(
      new DynamoEventSource(props.paymentTable, {
        startingPosition: StartingPosition.TRIM_HORIZON,
      })
    );

    paymentStreamFunc.role?.attachInlinePolicy(
      new Policy(this, 'PaymentStreamSendPinpointMessages', {
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['mobiletargeting:SendMessages'],
            resources: [
              `arn:aws:mobiletargeting:${this.region}:${this.account}:apps/${pinpointAppId}`,
            ],
          }),
        ],
      })
    );

    props.entityTable.grantReadWriteData(paymentStreamFunc);
    props.taskTable.grantReadWriteData(paymentStreamFunc);
    props.userTable.grantReadWriteData(paymentStreamFunc);

    // payment cron run daily at 14:00 (3pm AEST)
    const paymentCronFunc = new NodejsFunction(this, 'PaymentCronFunction', {
      ...getLambdaDefaultProps(this, 'cronPayment'),
      environment: {
        TABLE_ENTITY: props.entityTable.tableName,
        TABLE_PAYMENTS: props.paymentTable.tableName,
        MIXPANEL_TOKEN: mixpanelToken,
        ZAI_DOMAIN: zaiDomain,
        ZAI_TOKEN_DOMAIN: zaiTokenDomain,
        ZAI_CLIENT_ID: zaiClientId,
        ZAI_CLIENT_SCOPE: zaiClientScope,
      },
    });
    props.entityTable.grantReadData(paymentCronFunc);
    props.paymentTable.grantReadWriteData(paymentCronFunc);
    zaiSecrets.grantRead(paymentCronFunc);

    // cron rule and target
    const paymentCronRule = new Rule(this, 'PaymentCron', {
      schedule: Schedule.cron({ hour: '5', minute: '0' }),
    });
    paymentCronRule.addTarget(new LambdaFunction(paymentCronFunc));

    // payment user confirmation cron run daily at 14:00 (3pm AEST)
    const paymentUserConfirmationCronFunc = new NodejsFunction(
      this,
      'PaymentUserConfirmationCronFunction',
      {
        ...getLambdaDefaultProps(this, 'cronPaymentUserConfirmation'),
        environment: {
          TABLE_PAYMENTS: props.paymentTable.tableName,
        },
      }
    );

    props.paymentTable.grantReadWriteData(paymentUserConfirmationCronFunc);

    const createPayment = new LambdaAppSyncOperationConstruct(
      this,
      'CreatePaymentResolver',
      {
        api,
        typeName: 'Mutation',
        fieldName: 'createPayment',
        environmentVars: {
          TABLE_ENTITY: props.entityTable.tableName,
          TABLE_ENTITY_USER: props.entityUserTable.tableName,
          TABLE_TASKS: props.taskTable.tableName,
          TABLE_PAYMENTS: props.paymentTable.tableName,
          TABLE_PAYMENT_METHODS: props.paymentMethodTable.tableName,
          MIXPANEL_TOKEN: mixpanelToken,
          ZAI_DOMAIN: zaiDomain,
          ZAI_TOKEN_DOMAIN: zaiTokenDomain,
          ZAI_CLIENT_ID: zaiClientId,
          ZAI_CLIENT_SCOPE: zaiClientScope,
        },
      }
    );

    props.entityTable.grantReadData(createPayment.lambda);
    props.entityUserTable.grantReadData(createPayment.lambda);
    props.taskTable.grantReadWriteData(createPayment.lambda);
    props.paymentTable.grantWriteData(createPayment.lambda);
    props.paymentMethodTable.grantReadData(createPayment.lambda);
    zaiSecrets.grantRead(createPayment.lambda);

    // retry payment
    const retryPayment = new LambdaAppSyncOperationConstruct(
      this,
      'RetryPaymentResolver',
      {
        api,
        typeName: 'Mutation',
        fieldName: 'retryPayment',
        environmentVars: {
          TABLE_ENTITY: props.entityTable.tableName,
          TABLE_ENTITY_USER: props.entityUserTable.tableName,
          TABLE_PAYMENTS: props.paymentTable.tableName,
          TABLE_PAYMENT_METHODS: props.paymentMethodTable.tableName,
          MIXPANEL_TOKEN: mixpanelToken,
          ZAI_DOMAIN: zaiDomain,
          ZAI_TOKEN_DOMAIN: zaiTokenDomain,
          ZAI_CLIENT_ID: zaiClientId,
          ZAI_CLIENT_SCOPE: zaiClientScope,
        },
      }
    );

    props.entityTable.grantReadData(retryPayment.lambda);
    props.entityUserTable.grantReadData(retryPayment.lambda);
    props.paymentTable.grantReadWriteData(retryPayment.lambda);
    props.paymentMethodTable.grantReadData(retryPayment.lambda);
    zaiSecrets.grantRead(retryPayment.lambda);

    // create task payment
    const createTaskPayment = new LambdaAppSyncOperationConstruct(
      this,
      'CreateTaskPaymentResolver',
      {
        api,
        typeName: 'Mutation',
        fieldName: 'createTaskPayment',
        environmentVars: {
          TABLE_ENTITY: props.entityTable.tableName,
          TABLE_ENTITY_USER: props.entityUserTable.tableName,
          TABLE_TASKS: props.taskTable.tableName,
          TABLE_PAYMENTS: props.paymentTable.tableName,
          TABLE_PAYMENT_METHODS: props.paymentMethodTable.tableName,
          MIXPANEL_TOKEN: mixpanelToken,
          ZAI_DOMAIN: zaiDomain,
          ZAI_TOKEN_DOMAIN: zaiTokenDomain,
          ZAI_CLIENT_ID: zaiClientId,
          ZAI_CLIENT_SCOPE: zaiClientScope,
        },
      }
    );

    props.entityTable.grantReadData(createTaskPayment.lambda);
    props.entityUserTable.grantReadData(createTaskPayment.lambda);
    props.taskTable.grantReadWriteData(createTaskPayment.lambda);
    props.paymentTable.grantReadWriteData(createTaskPayment.lambda);
    props.paymentMethodTable.grantReadData(createTaskPayment.lambda);
    zaiSecrets.grantRead(createTaskPayment.lambda);

    // update paymentMethod
    new JsResolverConstruct(this, 'UpdatePaymentMethodResolver', {
      api,
      dataSource: paymentMethodTableDS,
      typeName: 'Mutation',
      fieldName: 'updatePaymentMethod',
      pathName: 'Mutation.updatePaymentMethod',
    });

    // create payment method
    const createPaymentMethod = new LambdaAppSyncOperationConstruct(
      this,
      'CreatePaymentMethodResolver',
      {
        api,
        typeName: 'Mutation',
        fieldName: 'createPaymentMethod',
        environmentVars: {
          MIXPANEL_TOKEN: mixpanelToken,
          TABLE_ENTITY: props.entityTable.tableName,
          TABLE_ENTITY_USER: props.entityUserTable.tableName,
          TABLE_PAYMENT_METHODS: props.paymentMethodTable.tableName,
          ZAI_TOKEN_DOMAIN: zaiTokenDomain,
          ZAI_CLIENT_ID: zaiClientId,
          ZAI_DOMAIN: zaiDomain,
          ZAI_CLIENT_SCOPE: zaiClientScope,
        },
      }
    );

    props.entityTable.grantReadWriteData(createPaymentMethod.lambda);
    props.entityUserTable.grantReadData(createPaymentMethod.lambda);
    props.paymentMethodTable.grantWriteData(createPaymentMethod.lambda);
    zaiSecrets.grantRead(createPaymentMethod.lambda);

    // PUSH NOTIFICATION
    const createPushNotification = new LambdaAppSyncOperationConstruct(
      this,
      'CreatePushNotification',
      {
        api,
        typeName: 'Mutation',
        fieldName: 'createPushNotification',
        environmentVars: {
          TABLE_USER: props.userTable.tableName,
          ANALYTICS_PINPOINT_ID: pinpointAppId, //TODO pinpoint id and permissions
        },
      }
    );
    props.userTable.grantReadData(createPushNotification.lambda);

    // RATINGS
    // update rating
    new JsResolverConstruct(this, 'updateRatingResolver', {
      api,
      dataSource: ratingsDS,
      typeName: 'Mutation',
      fieldName: 'updateRating',
      pathName: 'Mutation.updateRating',
    });

    // list ratings by user
    new JsResolverConstruct(this, 'ListRatingsByUserResolver', {
      api,
      dataSource: ratingsDS,
      typeName: 'Query',
      fieldName: 'listRatingsByUser',
      pathName: 'Query.listRatingsByUser',
    });

    // REFERRER
    api.addDynamoDbDataSource('ReferrerTableDataSource', props.referrerTable);

    // SIGNATURE

    // TRANSACTION
    const transactionDS = api.addDynamoDbDataSource(
      'TransactionTableDataSource',
      props.transactionTable
    );
    new JsResolverConstruct(this, 'GetTransactionResolver', {
      api,
      dataSource: transactionDS,
      typeName: 'Query',
      fieldName: 'getTransaction',
      pathName: 'getTransaction',
    });

    //// USER CONVERSATIONS
    //// get user conversation
    //new JsResolverConstruct(this, 'GetUserConversationResolver', {
    //  api,
    //  dataSource: userConversationDS,
    //  typeName: 'Query',
    //  fieldName: 'getUserConversation',
    //  pathName: 'getUserConversation',
    //});
    //
    //// list user conversation
    //new JsResolverConstruct(this, 'ListUserConversations', {
    //  api,
    //  dataSource: userConversationDS,
    //  typeName: 'Query',
    //  fieldName: 'listUserConversations',
    //  pathName: 'Query.listUserConversations',
    //});
    //
    //new JsResolverConstruct(this, 'UserConversationConversationResolver', {
    //  api,
    //  dataSource: userConversationDS,
    //  typeName: 'UserConversation',
    //  fieldName: 'conversation',
    //  pathName: 'UserConversation.conversation',
    //});
    //
    //// create user conversation
    //new JsResolverConstruct(this, 'CreateUserConversationResolver', {
    //  api,
    //  dataSource: userConversationDS,
    //  typeName: 'Mutation',
    //  fieldName: 'createUserConversation',
    //  pathName: 'Mutation.createUserConversation',
    //});

    // XERO
    // xero consent url
    new LambdaAppSyncOperationConstruct(this, 'XeroCreateConsentUrlMutation', {
      api,
      fieldName: 'xeroCreateConsentUrl',
      typeName: 'Mutation',
      environmentVars: {
        XERO_CLIENT_ID: xeroClientId,
        XERO_CLIENT_SECRET: xeroClientSecret,
        ENV: env,
      },
    });

    // xero create token set
    const xeroCreateTokenSet = new LambdaAppSyncOperationConstruct(
      this,
      'XeroCreateTokenSetMutation',
      {
        api,
        fieldName: 'xeroCreateTokenSet',
        typeName: 'Mutation',
        environmentVars: {
          AUTH_USERPOOLID: userPool.userPoolId,
          FUNCTION_CREATEUSER: createUserFuncName,
          TABLE_USER: props.userTable.tableName,
          XERO_CLIENT_ID: xeroClientId,
          XERO_CLIENT_SECRET: xeroClientSecret,
          ENV: env,
        },
      }
    );

    //  xero token set user pool policy
    xeroCreateTokenSet.lambda.role?.attachInlinePolicy(
      new Policy(this, 'XeroTokenSetUserPoolPolicy', {
        statements: [
          new PolicyStatement({
            actions: [
              'cognito-idp:AdminGetUser',
              'cognito-idp:AdminCreateUser',
              'cognito-idp:AdminAddUserToGroup',
            ],
            resources: [userPool.userPoolArn],
          }),
        ],
      })
    );

    // invoke create user permissions
    xeroCreateTokenSet.lambda.role?.attachInlinePolicy(
      new Policy(this, 'XeroTokenSetFunc', {
        statements: [
          new PolicyStatement({
            actions: ['lambda:InvokeFunction'],
            resources: [
              `arn:aws:lambda:${props.env?.region}:${props.env?.account}:function:${createUserFuncName}`,
            ],
          }),
        ],
      })
    );
    props.userTable.grantReadWriteData(xeroCreateTokenSet.lambda);

    // xero list contacts
    const xeroListContacts = new LambdaAppSyncOperationConstruct(
      this,
      'XeroListContactsQuery',
      {
        api,
        fieldName: 'xeroListContacts',
        typeName: 'Query',
        environmentVars: {
          XERO_CLIENT_ID: xeroClientId,
          XERO_CLIENT_SECRET: xeroClientSecret,
          TABLE_USER: props.userTable.tableName,
          ENV: env,
        },
      }
    );
    props.userTable.grantReadWriteData(xeroListContacts.lambda);

    // xero list transactions
    const xeroListTransactions = new LambdaAppSyncOperationConstruct(
      this,
      'XeroListTransactionsQuery',
      {
        api,
        fieldName: 'xeroListTransactions',
        typeName: 'Query',
        environmentVars: {
          XERO_CLIENT_ID: xeroClientId,
          XERO_CLIENT_SECRET: xeroClientSecret,
          TABLE_USER: props.userTable.tableName,
          ENV: env,
        },
      }
    );
    props.userTable.grantReadWriteData(xeroListTransactions.lambda);

    // xero webhook handler
    const xeroWebhookHandlerFunc = new NodejsFunction(
      this,
      'xeroWebhookHandlerFunction',
      {
        ...getLambdaDefaultProps(this, 'xeroWebhookHandler'),
        environment: {
          AUTH_USERPOOLID: userPool.userPoolId,
          XERO_WEBHOOK_SECRET: xeroWebhookSecret,
          TABLE_USER: props.userTable.tableName,
          ENV: env,
        },
      }
    );

    xeroWebhookHandlerFunc.role?.attachInlinePolicy(
      new Policy(this, 'XeroWebhookHandlerFuncUserPoolPolicy', {
        statements: [
          new PolicyStatement({
            actions: ['cognito-idp:AdminUpdateUserAttributes'],
            effect: Effect.ALLOW,
            resources: [userPool.userPoolArn],
          }),
        ],
      })
    );

    props.userTable.grantReadWriteData(xeroWebhookHandlerFunc);

    // xero webhook listener
    const xeroWebhookListenerFunc = new NodejsFunction(
      this,
      'xeroWebhookListenerFunction',
      {
        ...getLambdaDefaultProps(this, 'xeroWebhookListener'),
        environment: {
          XERO_SECRET_KEY: xeroClientSecret,
          XERO_WEBHOOK_SECRET: xeroWebhookSecret,
          FUNCTION_XEROWEBHOOKHANDLER: xeroWebhookHandlerFunc.functionName,
        },
      }
    );

    xeroWebhookHandlerFunc.grantInvoke(xeroWebhookListenerFunc);

    const xeroIntegration = new LambdaIntegration(xeroWebhookListenerFunc);
    const xeroWebhookEndpoint = restApi.root.addResource('webhook-xero'); //TODO: obfuscation of webhook endpoint
    xeroWebhookEndpoint.addMethod('ANY', xeroIntegration, {
      authorizationType: RESTAuthorizationType.NONE,
    });

    //TODO: IP whitelist

    // ZAI
    // zai webhook handler function
    const zaiWebhookHandlerFunc = new NodejsFunction(
      this,
      'ZaiWebhookHandlerFunction',
      {
        ...getLambdaDefaultProps(this, 'zaiWebhookHandler'),
        environment: {
          TABLE_ENTITY: props.entityTable.tableName,
          TABLE_USER: props.userTable.tableName,
          TABLE_PAYMENT_ACCOUNT: props.paymentAccountTable.tableName,
          TABLE_PAYMENTS: props.paymentTable.tableName,
          TABLE_TRANSACTION: props.transactionTable.tableName,
          ENV: env,
          ZAI_DOMAIN: zaiDomain,
          ZAI_TOKEN_DOMAIN: zaiTokenDomain,
          ZAI_CLIENT_ID: zaiClientId,
          ZAI_CLIENT_SCOPE: zaiClientScope,
        },
      }
    );
    props.entityTable.grantReadWriteData(zaiWebhookHandlerFunc);
    props.userTable.grantReadWriteData(zaiWebhookHandlerFunc);
    props.paymentAccountTable.grantReadWriteData(zaiWebhookHandlerFunc);
    props.paymentTable.grantReadWriteData(zaiWebhookHandlerFunc);
    props.transactionTable.grantReadWriteData(zaiWebhookHandlerFunc);
    zaiSecrets.grantRead(zaiWebhookHandlerFunc);

    // zai webhook listener function
    const zaiWebhookListenerFunc = new NodejsFunction(
      this,
      'ZaiWebhookListenerFunction',
      {
        ...getLambdaDefaultProps(this, 'zaiWebhookListener'),
        environment: {
          FUNCTION_ZAIWEBHOOKHANDLER: zaiWebhookHandlerFunc.functionName,
        },
      }
    );
    zaiSecrets.grantRead(zaiWebhookListenerFunc);
    zaiWebhookHandlerFunc.grantInvoke(zaiWebhookListenerFunc);

    const zaiIntegration = new LambdaIntegration(zaiWebhookListenerFunc);
    const zaiWebhookEndpoint = restApi.root.addResource('webhook-zai'); //TODO: obfuscation of webhook endpoint
    zaiWebhookEndpoint.addMethod('ANY', zaiIntegration, {
      authorizationType: RESTAuthorizationType.NONE,
    });

    //TODO: IP whitelist - https://developer.hellozai.com/docs/best-practices-for-webhooks

    // create zai payment method token
    const createZaiPaymentMethod = new LambdaAppSyncOperationConstruct(
      this,
      'CreateZaiPaymentMethodTokenMutation',
      {
        api,
        fieldName: 'createZaiPaymentMethodToken',
        typeName: 'Mutation',
        environmentVars: {
          TABLE_USER: props.userTable.tableName,
          ZAI_DOMAIN: zaiDomain,
          ZAI_TOKEN_DOMAIN: zaiTokenDomain,
          ZAI_CLIENT_ID: zaiClientId,
          ZAI_CLIENT_SCOPE: zaiClientScope,
          ENV: env,
        },
      }
    );
    props.userTable.grantReadData(createZaiPaymentMethod.lambda);
    zaiSecrets.grantRead(createZaiPaymentMethod.lambda);

    // get PayTo agreement
    const getPayToAgreement = new LambdaAppSyncOperationConstruct(
      this,
      'GetPayToAgreementQuery',
      {
        api,
        fieldName: 'getPayToAgreement',
        typeName: 'Query',
        environmentVars: {
          ZAI_DOMAIN: zaiDomain,
          ZAI_TOKEN_DOMAIN: zaiTokenDomain,
          ZAI_CLIENT_ID: zaiClientId,
          ZAI_CLIENT_SCOPE: zaiClientScope,
          ENV: env,
        },
      }
    );

    zaiSecrets.grantRead(getPayToAgreement.lambda);

    // create PayTo agreement
    const createPayToAgreement = new LambdaAppSyncOperationConstruct(
      this,
      'CreatePayToAgreementMutation',
      {
        api,
        fieldName: 'createPayToAgreement',
        typeName: 'Mutation',
        environmentVars: {
          ZAI_DOMAIN: zaiDomain,
          ZAI_TOKEN_DOMAIN: zaiTokenDomain,
          ZAI_CLIENT_ID: zaiClientId,
          ZAI_CLIENT_SCOPE: zaiClientScope,
          ENV: env,
        },
      }
    );

    zaiSecrets.grantRead(createPayToAgreement.lambda);

    // validate Pay To agreement
    const validatePayToAgreement = new LambdaAppSyncOperationConstruct(
      this,
      'ZaiValidatePayToAgreementMutation',
      {
        api,
        fieldName: 'validatePayToAgreement',
        typeName: 'Mutation',
        environmentVars: {
          TABLE_ENTITY: props.entityTable.tableName,
          TABLE_ENTITY_USER: props.entityUserTable.tableName,
          TABLE_TASKS: props.taskTable.tableName,
          ZAI_DOMAIN: zaiDomain,
          ZAI_TOKEN_DOMAIN: zaiTokenDomain,
          ZAI_CLIENT_ID: zaiClientId,
          ZAI_CLIENT_SCOPE: zaiClientScope,
          ENV: env,
        },
      }
    );

    props.entityTable.grantReadData(validatePayToAgreement.lambda);
    props.entityUserTable.grantReadData(validatePayToAgreement.lambda);
    props.taskTable.grantReadData(validatePayToAgreement.lambda);
    zaiSecrets.grantRead(validatePayToAgreement.lambda);

    // get failed pay to payment
    const getPayToFailedPayment = new LambdaAppSyncOperationConstruct(
      this,
      'GetPayToFailedPaymentQuery',
      {
        api,
        fieldName: 'getPayToFailedPayment',
        typeName: 'Query',
        environmentVars: {
          ZAI_DOMAIN: zaiDomain,
          ZAI_TOKEN_DOMAIN: zaiTokenDomain,
          ZAI_CLIENT_ID: zaiClientId,
          ZAI_CLIENT_SCOPE: zaiClientScope,
          ENV: env,
        },
      }
    );

    zaiSecrets.grantRead(getPayToFailedPayment.lambda);

    //new ChatApiStack(this, `${appPrefix}ChatStack`, {
    //  env: {
    //    account,
    //    region
    //  },
    //  api,
    //});

    //new ContactsApiStack(this, `${appPrefix}ContactsStack`, {
    //  contactsDS,
    //  entityUserDS
    //});
  }
}
