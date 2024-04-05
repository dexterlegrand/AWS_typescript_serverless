import { Stack, StackProps, Fn } from 'aws-cdk-lib';
import { GraphqlApi } from 'aws-cdk-lib/aws-appsync';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { JsResolverConstruct } from '../constructs/jsResolverConstruct';
import { LambdaAppSyncOperationConstruct } from '../constructs/lambdaAppSyncOperationConstruct';
import { getLambdaDefaultProps, setEnvVar } from '../helpers';

const { APP_PREFIX, ENV } = process.env;
const appPrefix = setEnvVar(APP_PREFIX);
const env = setEnvVar(ENV);

const createUserFuncName = `${appPrefix}AuthStack-createUserFunc-${env}`;

export class AdminStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const appsyncApiId = Fn.importValue(`${appPrefix}-${env}-AppsyncApiId`);
    const api = GraphqlApi.fromGraphqlApiAttributes(this, 'Api', {
      graphqlApiId: appsyncApiId,
    });

    const userPoolId = Fn.importValue('UserPoolId');
    const userPool = UserPool.fromUserPoolId(this, 'UserPoolId', userPoolId);

    const adminTableArn = Fn.importValue('AdminTableArn');
    const adminTable = TableV2.fromTableArn(this, 'AdminTable', adminTableArn);

    const userTableArn = Fn.importValue('UserTableArn');
    const userTable = TableV2.fromTableArn(this, 'UserTable', userTableArn);
    console.log('adminTable: ', adminTable);

    const adminDS = api.addDynamoDbDataSource(
      'AdminTableDataSource',
      adminTable
    );

    //ADMIN
    //get admin
    new JsResolverConstruct(this, 'GetAdminResolver', {
      api,
      dataSource: adminDS,
      typeName: 'Query',
      fieldName: 'getAdmin',
      pathName: 'Query.getAdmin',
    });

    //list admin
    new JsResolverConstruct(this, 'ListAdminsResolver', {
      api,
      dataSource: adminDS,
      typeName: 'Query',
      fieldName: 'listAdmins',
      pathName: 'Query.listAdmins',
    });

    //create admin
    const createAdmin = new LambdaAppSyncOperationConstruct(
      this,
      'CreateAdmin',
      {
        api,
        typeName: 'Mutation',
        fieldName: 'createAdmin',
        environmentVars: {
          TABLE_ADMIN: adminTable.tableName,
          TABLE_USER: userTable.tableName,
          AUTH_USERPOOLID: userPool.userPoolId,
        },
      }
    );

    adminTable.grantWriteData(createAdmin.lambda);
    userTable.grantWriteData(createAdmin.lambda);

    createAdmin.lambda.role?.attachInlinePolicy(
      new Policy(this, 'CreateAdminFuncUserPoolPolicy', {
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
    createAdmin.lambda.role?.attachInlinePolicy(
      new Policy(this, 'CreateAdminFuncInvokeCreateUserFunc', {
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

    // update admin
    //TODO - lambda function to change group if role changed?
    const updateAdminFunc = new NodejsFunction(this, 'UpdateAdminFunction', {
      ...getLambdaDefaultProps(this, 'updateAdmin'),
      environment: {
        AUTH_USERPOOLID: userPool.userPoolId,
        TABLE_ADMIN: adminTable.tableName,
        TABLE_USER: userTable.tableName,
      },
    });

    adminTable.grantWriteData(updateAdminFunc);

    updateAdminFunc.role?.attachInlinePolicy(
      new Policy(this, 'UpdateAdminFuncUserPoolPolicy', {
        statements: [
          new PolicyStatement({
            actions: [
              'cognito-idp:AdminListGroupsForUser',
              'cognito-idp:AdminRemoveUserFromGroup',
              'cognito-idp:AdminAddUserToGroup',
            ],
            resources: [userPool.userPoolArn],
          }),
        ],
      })
    );

    // delete admin
    const deleteAdmin = new LambdaAppSyncOperationConstruct(
      this,
      'DeleteAdmin',
      {
        api,
        typeName: 'Mutation',
        fieldName: 'deleteAdmin',
        environmentVars: {
          TABLE_ADMIN: adminTable.tableName,
          TABLE_USER: userTable.tableName,
          AUTH_USERPOOLID: userPool.userPoolId,
        },
      }
    );

    adminTable.grantWriteData(deleteAdmin.lambda);
    userTable.grantWriteData(deleteAdmin.lambda);

    deleteAdmin.lambda.role?.attachInlinePolicy(
      new Policy(this, 'DeleteAdminFuncUserPoolPolicy', {
        statements: [
          new PolicyStatement({
            actions: ['cognito-idp:AdminDeleteUser'],
            resources: [userPool.userPoolArn],
          }),
        ],
      })
    );

    userPool.grant(deleteAdmin.lambda, 'cognito-idp:AdminDeleteUser');
    userTable.grantWriteData(deleteAdmin.lambda);
    adminTable.grantReadWriteData(deleteAdmin.lambda);
  }
}
