import { Fn, Stack, StackProps } from 'aws-cdk-lib';
import { GraphqlApi } from 'aws-cdk-lib/aws-appsync';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { StartingPosition } from 'aws-cdk-lib/aws-lambda';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { JsResolverConstruct } from '../constructs/jsResolverConstruct';
import { LambdaAppSyncOperationConstruct } from '../constructs/lambdaAppSyncOperationConstruct';
import { getLambdaDefaultProps } from '../helpers';
import { appPrefix, env } from '../helpers/constants';

interface ChatApiStackProps extends StackProps {
  readonly api: GraphqlApi;
  //readonly conversationTable: Table;
  //readonly messageTable: Table;
  //readonly userTable: Table;
  //readonly userConversationTable: Table;
}

export class ChatApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ChatApiStackProps) {
    super(scope, id, props);

    const pinpointAppId = Fn.importValue(`${appPrefix}-${env}-PinpointAppId`);

    const conversationTableArn = Fn.importValue('ConversationTableArn');
    const conversationTable = Table.fromTableArn(
      this,
      'ConversationTable',
      conversationTableArn
    );
    const conversationDS = props.api.addDynamoDbDataSource(
      'ConversationTableDataSource',
      conversationTable
    );

    const messageTableArn = Fn.importValue('MessageTableArn');
    const messageTable = Table.fromTableArn(
      this,
      'MessageTable',
      messageTableArn
    );
    const messageDS = props.api.addDynamoDbDataSource(
      'MessageTableDataSource',
      messageTable
    );

    const userTableArn = Fn.importValue('UserTableArn');
    const userTable = Table.fromTableArn(this, 'UserTable', userTableArn);

    const userConversationTableArn = Fn.importValue('UserConversationTableArn');
    const userConversationTable = Table.fromTableArn(
      this,
      'UserConversationTable',
      userConversationTableArn
    );
    const userConversationDS = props.api.addDynamoDbDataSource(
      'UserConversationTableDataSource',
      userTable
    );

    // CONVERSATION
    // get conversations
    new JsResolverConstruct(this, 'GetConversationResolver', {
      api: props.api,
      dataSource: conversationDS,
      typeName: 'Query',
      fieldName: 'getConversation',
      pathName: 'Query.getConversation',
    });

    // list conversations
    new JsResolverConstruct(this, 'ListConversationsResolver', {
      api: props.api,
      dataSource: conversationDS,
      typeName: 'Query',
      fieldName: 'listConversations',
      pathName: 'listConversations',
    });

    new JsResolverConstruct(this, 'ConversationMessagesResolver', {
      api: props.api,
      dataSource: messageDS,
      typeName: 'Conversation',
      fieldName: 'messages',
      pathName: 'Conversation.messages',
    });

    new JsResolverConstruct(this, 'ConversationUserConversationsResolver', {
      api: props.api,
      dataSource: userConversationDS,
      typeName: 'Conversation',
      fieldName: 'userConversations',
      pathName: 'Conversation.userConversations',
    });

    // create conversation
    new JsResolverConstruct(this, 'CreateConversationResolver', {
      api: props.api,
      dataSource: conversationDS,
      typeName: 'Mutation',
      fieldName: 'createConversation',
      pathName: 'Mutation.createConversation',
    });

    // conversation stream
    const conversationStreamFunc = new NodejsFunction(
      this,
      'ConversationStreamFunction',
      {
        ...getLambdaDefaultProps(this, 'streamConversation'),
        environment: {
          ANALYTICS_PINPOINT_ID: pinpointAppId,
          TABLE_MESSAGE: messageTable.tableName,
        },
      }
    );

    messageTable.grantReadWriteData(conversationStreamFunc);
    conversationStreamFunc.addEventSource(
      new DynamoEventSource(conversationTable, {
        startingPosition: StartingPosition.TRIM_HORIZON,
      })
    );

    // block user
    const blockUser = new LambdaAppSyncOperationConstruct(this, 'BlockUser', {
      api: props.api,
      typeName: 'Mutation',
      fieldName: 'blockUser',
      environmentVars: {
        TABLE_CONVERSATION: conversationTable.tableName,
        TABLE_USER: userTable.tableName,
        TABLE_USERCONVERSATION: userConversationTable.tableName,
        API_GRAPHQLAPIENDPOINT: props.api.graphqlUrl,
      },
    });

    conversationTable.grantReadData(blockUser.lambda);
    userConversationTable.grantReadWriteData(blockUser.lambda);
    userTable.grantReadWriteData(blockUser.lambda);

    // MESSAGES
    // message stream
    const messageStreamFunc = new NodejsFunction(
      this,
      'MessageStreamFunction',
      {
        ...getLambdaDefaultProps(this, 'streamMessage'),
        environment: {
          ANALYTICS_PINPOINT_ID: pinpointAppId,
          TABLE_CONVERSATION: conversationTable.tableName,
        },
      }
    );

    messageStreamFunc.addEventSource(
      new DynamoEventSource(messageTable, {
        startingPosition: StartingPosition.TRIM_HORIZON,
      })
    );

    //get message
    new JsResolverConstruct(this, 'GetMessageResolver', {
      api: props.api,
      dataSource: messageDS,
      typeName: 'Query',
      fieldName: 'getMessage',
      pathName: 'getMessage',
    });

    new JsResolverConstruct(this, 'ListMessagesResolver', {
      api: props.api,
      dataSource: messageDS,
      typeName: 'Query',
      fieldName: 'listMessages',
      pathName: 'Query.listMessages',
    });

    // USER CONVERSATIONS
    // get user conversation
    new JsResolverConstruct(this, 'GetUserConversationResolver', {
      api: props.api,
      dataSource: userConversationDS,
      typeName: 'Query',
      fieldName: 'getUserConversation',
      pathName: 'getUserConversation',
    });

    // list user conversation
    new JsResolverConstruct(this, 'ListUserConversations', {
      api: props.api,
      dataSource: userConversationDS,
      typeName: 'Query',
      fieldName: 'listUserConversations',
      pathName: 'Query.listUserConversations',
    });

    new JsResolverConstruct(this, 'UserConversationConversationResolver', {
      api: props.api,
      dataSource: userConversationDS,
      typeName: 'UserConversation',
      fieldName: 'conversation',
      pathName: 'UserConversation.conversation',
    });

    // create user conversation
    new JsResolverConstruct(this, 'CreateUserConversationResolver', {
      api: props.api,
      dataSource: userConversationDS,
      typeName: 'Mutation',
      fieldName: 'createUserConversation',
      pathName: 'Mutation.createUserConversation',
    });
  }
}
