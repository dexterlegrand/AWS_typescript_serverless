import { Fn, NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { DynamoDbDataSource, GraphqlApi } from 'aws-cdk-lib/aws-appsync';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Effect, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { StartingPosition } from 'aws-cdk-lib/aws-lambda';
import {
  DynamoEventSource,
  SqsEventSource,
} from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { JsPipelineResolverConstruct } from '../constructs/jsPipelineResolverConstruct';
import { JsResolverConstruct } from '../constructs/jsResolverConstruct';
import { LambdaAppSyncOperationConstruct } from '../constructs/lambdaAppSyncOperationConstruct';
import { getLambdaDefaultProps } from '../helpers';
import {
  appPrefix,
  env,
  mixpanelToken,
  zaiClientId,
  zaiClientScope,
  zaiDomain,
  zaiEnv,
  zaiTokenDomain,
} from '../helpers/constants';

interface ContactsApiStackProps extends NestedStackProps {
  readonly contactsDS: DynamoDbDataSource;
  readonly entityUserDS: DynamoDbDataSource;
}

export class ContactsApiStack extends NestedStack {
  constructor(scope: Construct, id: string, props: ContactsApiStackProps) {
    super(scope, id, props);

    const graphqlApiId = Fn.importValue(`GraphqlApiId`);
    const graphqlApiArn = Fn.importValue(`GraphqlApiArn`);
    const graphqlApiUrl = Fn.importValue(`GraphqlApiUrl`);

    const api = GraphqlApi.fromGraphqlApiAttributes(this, 'Api', {
      graphqlApiId,
      graphqlApiArn,
    });

    const s3mediaBucketName = Fn.importValue(
      `${appPrefix}-${env}-MediaBucketName`
    );
    const s3mediaBucket = Bucket.fromBucketName(
      this,
      'S3MediaBucket',
      s3mediaBucketName
    );

    const contactsTableArn = Fn.importValue('ContactsTableArn');
    const contactsTableStreamArn = Fn.importValue('ContactsTableStreamArn');
    const contactsTable = Table.fromTableAttributes(this, 'ContactsTable', {
      tableStreamArn: contactsTableStreamArn,
      tableArn: contactsTableArn,
    });

    const notificationTableArn = Fn.importValue(
      `${appPrefix}-${env}-NotificationTableArn`
    );
    const notificationTable = Table.fromTableArn(
      this,
      'NotificationTable',
      notificationTableArn
    );

    const entityTableArn = Fn.importValue(`${appPrefix}-${env}-EntityTableArn`);
    const entityTable = Table.fromTableArn(this, 'EntityTable', entityTableArn);

    const entityUserTableArn = Fn.importValue(
      `${appPrefix}-${env}-EntityUserTableArn`
    );
    const entityUserTable = Table.fromTableArn(
      this,
      'EntityUserTable',
      entityUserTableArn
    );

    //const contactsDS = api.addDynamoDbDataSource(
    //  'ContactsTableDataSource',
    //  contactsTable
    //);

    //const entityUserDS = api.addDynamoDbDataSource(
    //  'EntityUserTableDataSource',
    //  entityUserTable
    //);

    const zaiSecrets = Secret.fromSecretNameV2(
      this,
      'ZaiSecrets',
      `ZaiSecrets-${zaiEnv}`
    );

    // CONTACTS
    // contact stream
    const contactStreamFunc = new NodejsFunction(
      this,
      'ContactStreamFunction',
      {
        ...getLambdaDefaultProps(this, 'streamContact'),
        environment: {
          TABLE_CONTACT: contactsTable.tableName,
          ZAI_DOMAIN: zaiDomain,
          ZAI_TOKEN_DOMAIN: zaiTokenDomain,
          ZAI_CLIENT_ID: zaiClientId,
          ZAI_CLIENT_SCOPE: zaiClientScope,
          ENV: env,
        },
      }
    );

    contactStreamFunc.addEventSource(
      new DynamoEventSource(contactsTable, {
        startingPosition: StartingPosition.TRIM_HORIZON,
      })
    );

    contactsTable.grantReadWriteData(contactStreamFunc);
    zaiSecrets.grantRead(contactStreamFunc);

    //get contact
    new JsResolverConstruct(this, 'GetContactResolver', {
      api: api,
      dataSource: props.contactsDS,
      typeName: 'Query',
      fieldName: 'getContact',
      pathName: 'Query.getContact',
    });

    // list contacts by entity
    new JsPipelineResolverConstruct(this, 'ListContactsResolver', {
      api,
      dataSources: [props.entityUserDS, props.contactsDS],
      typeName: 'Query',
      fieldName: 'contactsByEntity',
      pathName: 'Query.contactsByEntity',
    });

    // create contact
    new JsResolverConstruct(this, 'CreateContactResolver', {
      api: api,
      dataSource: props.contactsDS,
      typeName: 'Mutation',
      fieldName: 'createContact',
      pathName: 'Mutation.createContact',
    });

    // update contact
    new JsResolverConstruct(this, 'UpdateContactResolver', {
      api: api,
      dataSource: props.contactsDS,
      typeName: 'Mutation',
      fieldName: 'updateContact',
      pathName: 'Mutation.updateContact',
    });

    // csv bulk upload
    const contactsBulkUploadQueue = new Queue(this, 'ContactsBulkUploadQueue', {
      queueName: 'ContactsBulkUploadQueue',
    });

    const createContactBulkUpload = new LambdaAppSyncOperationConstruct(
      this,
      'CreateContactBulkUploadResolver',
      {
        api: api,
        typeName: 'Mutation',
        fieldName: 'createContactBulkUpload',
        environmentVars: {
          SQS_QUEUE_URL: contactsBulkUploadQueue.queueUrl,
          TABLE_ENTITYUSER: entityUserTable.tableName,
          MIXPANEL_TOKEN: mixpanelToken,
        },
      }
    );

    entityUserTable.grantReadData(createContactBulkUpload.lambda);
    contactsBulkUploadQueue.grantSendMessages(createContactBulkUpload.lambda);

    const processContactBulkUpload = new NodejsFunction(
      this,
      'ProcessContactBulkUploadFunc',
      {
        ...getLambdaDefaultProps(this, 'processContactBulkUpload'),
        environment: {
          TABLE_ENTITY: entityTable.tableName,
          TABLE_CONTACT: contactsTable.tableName,
          STORAGE_BUCKETNAME: s3mediaBucket.bucketName,
          TABLE_NOTIFICATION: notificationTable.tableName,
          API_GRAPHQLAPIENDPOINT: graphqlApiUrl,
        },
      }
    );
    entityTable.grantReadData(processContactBulkUpload);
    contactsTable.grantWriteData(processContactBulkUpload);
    notificationTable.grantWriteData(processContactBulkUpload);
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
  }
}
