import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import {
  AttributeType,
  BillingMode,
  StreamViewType,
  Table, //TODO: update to TableV2
} from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { appPrefix, env, isProd } from '../helpers/constants';

export class DatabaseStack extends Stack {
  public readonly defaultTableProps: () => Record<string, any>;
  public readonly activityTable: Table;
  public readonly adminTable: Table;
  public readonly autoCompleteResultsTable: Table;
  public readonly beneficialOwnerTable: Table;
  public readonly contactsTable: Table;
  public readonly conversationTable: Table;
  public readonly entityTable: Table;
  public readonly entityUserTable: Table;
  public readonly notificationTable: Table;
  public readonly messageTable: Table;
  public readonly optionTable: Table;
  public readonly paymentTable: Table;
  public readonly paymentMethodTable: Table;
  public readonly paymentAccountTable: Table;
  public readonly ratingsTable: Table;
  public readonly referrerTable: Table;
  public readonly signatureTable: Table;
  public readonly taskTable: Table;
  public readonly taskPaymentTable: Table;
  public readonly teamTable: Table;
  public readonly teamUserTable: Table;
  public readonly transactionTable: Table;
  public readonly userConversationTable: Table;
  public readonly userTable: Table;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    this.defaultTableProps = () => ({
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY, //update if table shouldn't automatically destroy
      billingMode: BillingMode.PAY_PER_REQUEST,
      deletionProtection: isProd,
      pointInTimeRecovery: isProd,
    });

    // ACTIVITY
    const activityTable = new Table(this, 'ActivityTable', {
      ...this.defaultTableProps(),
      partitionKey: { name: 'compositeId', type: AttributeType.STRING },
      sortKey: { name: 'createdAt', type: AttributeType.STRING },
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // ADMIN
    const adminTable = new Table(this, 'AdminTable', {
      ...this.defaultTableProps(),
      partitionKey: { name: 'id', type: AttributeType.STRING },
    });

    const autoCompleteResultsTable = new Table(
      this,
      'AutoCompleteResultsTable',
      {
        ...this.defaultTableProps(),
        partitionKey: { name: 'id', type: AttributeType.STRING },
        sortKey: { name: 'type', type: AttributeType.STRING },
      }
    );

    autoCompleteResultsTable.addGlobalSecondaryIndex({
      indexName: 'autocompleteResultsByType',
      partitionKey: { name: 'type', type: AttributeType.STRING },
      sortKey: { name: 'searchName', type: AttributeType.STRING },
    });

    // BENEFICIAL OWNER
    const beneficialOwnerTable = new Table(this, 'BeneficialOwnerTable', {
      ...this.defaultTableProps(),
      partitionKey: { name: 'id', type: AttributeType.STRING },
    });

    beneficialOwnerTable.addGlobalSecondaryIndex({
      indexName: 'beneficialOwnersByEntity',
      partitionKey: { name: 'entityId', type: AttributeType.STRING },
    });

    // CONTACTS
    const contactsTable = new Table(this, 'ContactsTable', {
      ...this.defaultTableProps(),
      partitionKey: { name: 'id', type: AttributeType.STRING },
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
    });

    contactsTable.addGlobalSecondaryIndex({
      indexName: 'contactsByEntity',
      partitionKey: { name: 'entityId', type: AttributeType.STRING },
    });

    // CONVERSATION
    const conversationTable = new Table(this, 'ConversationTable', {
      ...this.defaultTableProps(),
      partitionKey: { name: 'id', type: AttributeType.STRING },
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // ENTITY
    const entityTable = new Table(this, 'EntityTable', {
      ...this.defaultTableProps(),
      partitionKey: { name: 'id', type: AttributeType.STRING },
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
    });

    //entityTable.addGlobalSecondaryIndex({
    //  indexName: 'entityByTaxNumber',
    //  partitionKey: {
    //    name: 'taxNumber',
    //    type: AttributeType.STRING
    //  },
    //  sortKey: {
    //    name: 'createdAt',
    //    type: AttributeType.STRING
    //  }
    //});

    // ENTITY USER
    const entityUserTable = new Table(this, 'EntityUserTable', {
      ...this.defaultTableProps(),
      partitionKey: { name: 'entityId', type: AttributeType.STRING },
      sortKey: { name: 'userId', type: AttributeType.STRING },
    });

    // entity user by userId
    entityUserTable.addGlobalSecondaryIndex({
      indexName: 'entityUsersByEntity',
      partitionKey: {
        name: 'entityId',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: AttributeType.STRING,
      },
    });

    // entity user by userId
    entityUserTable.addGlobalSecondaryIndex({
      indexName: 'entityUsersByUser',
      partitionKey: {
        name: 'userId',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: AttributeType.STRING,
      },
    });

    // NOTIFICATION
    const notificationTable = new Table(this, 'NotificationTable', {
      ...this.defaultTableProps(),
      partitionKey: { name: 'id', type: AttributeType.STRING },
    });

    notificationTable.addGlobalSecondaryIndex({
      indexName: 'notificationsByUser',
      partitionKey: {
        name: 'owner',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: AttributeType.STRING,
      },
    });

    // OPTION
    const optionTable = new Table(this, 'OptionTable', {
      ...this.defaultTableProps(),
      partitionKey: { name: 'id', type: AttributeType.STRING },
    });

    optionTable.addGlobalSecondaryIndex({
      indexName: 'optionsByGroup',
      partitionKey: { name: 'group', type: AttributeType.STRING },
    });

    // PAYMENT
    const paymentTable = new Table(this, 'PaymentTable', {
      ...this.defaultTableProps(),
      partitionKey: { name: 'id', type: AttributeType.STRING },
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
    });

    paymentTable.addGlobalSecondaryIndex({
      indexName: 'paymentsByEntity',
      partitionKey: { name: 'entityId', type: AttributeType.STRING },
      sortKey: { name: 'scheduledAt', type: AttributeType.STRING },
    });

    paymentTable.addGlobalSecondaryIndex({
      indexName: 'paymentsByTask',
      partitionKey: { name: 'taskId', type: AttributeType.STRING },
      sortKey: { name: 'scheduledAt', type: AttributeType.STRING },
    });

    paymentTable.addGlobalSecondaryIndex({
      indexName: 'paymentsByStatus',
      partitionKey: { name: 'status', type: AttributeType.STRING },
      sortKey: { name: 'scheduledAt', type: AttributeType.STRING },
    });

    // PAYMENT ACCOUNT
    const paymentAccountTable = new Table(this, 'PaymentAccountTable', {
      ...this.defaultTableProps(),
      partitionKey: { name: 'id', type: AttributeType.STRING },
    });

    paymentAccountTable.addGlobalSecondaryIndex({
      indexName: 'paymentAccountsByBillerCodeReference',
      partitionKey: { name: 'billerCode', type: AttributeType.STRING },
      sortKey: { name: 'reference', type: AttributeType.STRING },
    });

    // PAYMENT METHOD
    const paymentMethodTable = new Table(this, 'PaymentMethodTable', {
      ...this.defaultTableProps(),
      partitionKey: { name: 'id', type: AttributeType.STRING },
    });

    //paymentMethodTable.addGlobalSecondaryIndex({
    //  indexName: 'paymentMethodsByUser',
    //  partitionKey: { name: 'userId', type: AttributeType.STRING },
    //  sortKey: { name: 'createdAt', type: AttributeType.STRING}
    //});

    paymentMethodTable.addGlobalSecondaryIndex({
      indexName: 'paymentMethodsByEntity',
      partitionKey: { name: 'entityId', type: AttributeType.STRING },
      sortKey: { name: 'createdAt', type: AttributeType.STRING },
    });

    // PROJECT
    const projectTable = new Table(this, 'ProjectTable', {
      ...this.defaultTableProps(),
      partitionKey: { name: 'id', type: AttributeType.STRING },
    });

    projectTable.addGlobalSecondaryIndex({
      indexName: 'projectsByUser',
      partitionKey: {
        name: 'owner',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: AttributeType.STRING,
      },
    });

    // USER CONVERSATION
    const userConversationTable = new Table(this, 'UserConversations', {
      ...this.defaultTableProps(),
      partitionKey: { name: 'id', type: AttributeType.STRING },
    });

    userConversationTable.addGlobalSecondaryIndex({
      indexName: 'userConversationsByConversationIdAndCreatedAt',
      partitionKey: {
        name: 'conversationId',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: AttributeType.STRING,
      },
    });

    userConversationTable.addGlobalSecondaryIndex({
      indexName: 'userConversationsByUserId',
      partitionKey: {
        name: 'userId',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: AttributeType.STRING,
      },
    });

    // MESSAGE
    const messageTable = new Table(this, 'MessageTable', {
      ...this.defaultTableProps(),
      partitionKey: { name: 'id', type: AttributeType.STRING },
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
    });

    messageTable.addGlobalSecondaryIndex({
      indexName: 'messagesByConversation',
      partitionKey: {
        name: 'conversationId',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: AttributeType.STRING,
      },
    });

    // RATINGS
    const ratingsTable = new Table(this, 'RatingTable', {
      ...this.defaultTableProps(),
      partitionKey: { name: 'id', type: AttributeType.STRING },
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
    });

    ratingsTable.addGlobalSecondaryIndex({
      indexName: 'ratingsByUser',
      partitionKey: {
        name: 'owner',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: AttributeType.STRING,
      },
    });

    // REFERRER
    const referrerTable = new Table(this, 'ReferrerTable', {
      ...this.defaultTableProps(),
      partitionKey: { name: 'id', type: AttributeType.STRING },
    });

    // SIGNATURE
    const signatureTable = new Table(this, 'SignatureTable', {
      ...this.defaultTableProps(),
      partitionKey: { name: 'userId', type: AttributeType.STRING },
      sortKey: { name: 'createdAt', type: AttributeType.STRING },
    });

    // TASK
    const taskTable = new Table(this, 'TaskTable', {
      ...this.defaultTableProps(),
      partitionKey: { name: 'entityId', type: AttributeType.STRING },
      sortKey: { name: 'id', type: AttributeType.STRING },
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // list tasks entity to and status, sort by dueAt
    taskTable.addGlobalSecondaryIndex({
      indexName: 'tasksByEntityTo',
      partitionKey: {
        name: 'toSearchStatus',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'dueAt',
        type: AttributeType.STRING,
      },
    });

    // list tasks entity from and status, sort by dueAt
    taskTable.addGlobalSecondaryIndex({
      indexName: 'tasksByEntityFrom',
      partitionKey: {
        name: 'fromSearchStatus',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'dueAt',
        type: AttributeType.STRING,
      },
    });

    // tasks by search name
    taskTable.addGlobalSecondaryIndex({
      indexName: 'tasksBySearchName',
      partitionKey: {
        name: 'searchName',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'dueAt',
        type: AttributeType.STRING,
      },
    });

    // tasks by entity id by
    taskTable.addGlobalSecondaryIndex({
      indexName: 'tasksByEntityBy',
      partitionKey: {
        name: 'entityIdBy',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'dueAt',
        type: AttributeType.STRING,
      },
    });

    // TASK PAYMENT
    const taskPaymentTable = new Table(this, 'TaskPaymentTable', {
      ...this.defaultTableProps(),
      partitionKey: { name: 'taskId', type: AttributeType.STRING },
      sortKey: { name: 'paymentId', type: AttributeType.STRING },
    });

    // entity user by userId
    taskPaymentTable.addGlobalSecondaryIndex({
      indexName: 'taskPaymentsByTask',
      partitionKey: {
        name: 'taskId',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'scheduledAt',
        type: AttributeType.STRING,
      },
    });

    // TEAM
    const teamTable = new Table(this, 'TeamTable', {
      ...this.defaultTableProps(),
      partitionKey: { name: 'id', type: AttributeType.STRING },
    });

    // team user dynamodb table
    const teamUserTable = new Table(this, 'TeamUserTable', {
      ...this.defaultTableProps(),
      partitionKey: { name: 'id', type: AttributeType.STRING },
    });

    // TRANSACTION
    const transactionTable = new Table(this, 'TransactionTable', {
      ...this.defaultTableProps(),
      partitionKey: { name: 'id', type: AttributeType.STRING },
    });

    // USER
    const userTable = new Table(this, 'UserTable', {
      ...this.defaultTableProps(),
      partitionKey: { name: 'id', type: AttributeType.STRING },
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
    });

    this.activityTable = activityTable;
    new CfnOutput(this, 'ActivityTableArn', {
      value: this.activityTable.tableArn,
      exportName: `${appPrefix}-${env}-ActivityTableArn`,
    });

    this.adminTable = adminTable;
    new CfnOutput(this, 'AdminTableArn', {
      value: this.adminTable.tableArn,
      exportName: `${appPrefix}-${env}-AdminTableArn`,
    });

    this.autoCompleteResultsTable = autoCompleteResultsTable;
    new CfnOutput(this, 'AutoCompleteResultsTableArn', {
      value: this.autoCompleteResultsTable.tableArn,
      exportName: `${appPrefix}-${env}-AutoCompleteResultsTableArn`,
    });

    new CfnOutput(this, 'BeneficialOwnerTableArn', {
      value: beneficialOwnerTable.tableArn,
      exportName: `${appPrefix}-${env}-BeneficialOwnerTableArn`,
    });

    this.contactsTable = contactsTable;
    new CfnOutput(this, 'ContactsTableArn', {
      value: contactsTable.tableArn,
      exportName: `${appPrefix}-${env}-ContactsTableArn`,
    });

    if (contactsTable.tableStreamArn) {
      new CfnOutput(this, 'ContactsTableStreamArn', {
        value: contactsTable.tableStreamArn,
        exportName: `${appPrefix}-${env}-ContactsTableStreamArn`,
      });
    }

    this.conversationTable = conversationTable;
    new CfnOutput(this, 'ConversationTableArn', {
      value: this.conversationTable.tableArn,
      exportName: `${appPrefix}-${env}-ConversationTableArn`,
    });

    this.entityTable = entityTable;
    new CfnOutput(this, 'EntityTableArn', {
      value: this.entityTable.tableArn,
      exportName: `${appPrefix}-${env}-EntityTableArn`,
    });

    this.entityUserTable = entityUserTable;
    new CfnOutput(this, 'EntityUserTableArn', {
      value: this.entityUserTable.tableArn,
      exportName: `${appPrefix}-${env}-EntityUserTableArn`,
    });

    this.messageTable = messageTable;
    new CfnOutput(this, 'MessageTableArn', {
      value: this.messageTable.tableArn,
      exportName: `${appPrefix}-${env}-MessageTableArn`,
    });

    this.notificationTable = notificationTable;
    new CfnOutput(this, 'NotificationTableArn', {
      value: this.notificationTable.tableArn,
      exportName: `${appPrefix}-${env}-NotificationTableArn`,
    });

    this.optionTable = optionTable;
    new CfnOutput(this, 'OptionTableArn', {
      value: this.optionTable.tableArn,
      exportName: `${appPrefix}-${env}-OptionTableArn`,
    });

    this.paymentTable = paymentTable;
    new CfnOutput(this, 'PaymentTableArn', {
      value: this.paymentTable.tableArn,
      exportName: `${appPrefix}-${env}-PaymentTableArn`,
    });

    this.paymentMethodTable = paymentMethodTable;
    new CfnOutput(this, 'PaymentMethodTableArn', {
      value: this.paymentMethodTable.tableArn,
      exportName: `${appPrefix}-${env}-PaymentMethodTableArn`,
    });

    this.paymentAccountTable = paymentAccountTable;
    new CfnOutput(this, 'PaymentAccountTableArn', {
      value: this.paymentAccountTable.tableArn,
      exportName: `${appPrefix}-${env}-PaymentAccountTableArn`,
    });

    this.ratingsTable = ratingsTable;
    new CfnOutput(this, 'RatingsTableArn', {
      value: this.ratingsTable.tableArn,
      exportName: `${appPrefix}-${env}-RatingsTableArn`,
    });

    this.referrerTable = referrerTable;
    new CfnOutput(this, 'ReferrerTableArn', {
      value: this.referrerTable.tableArn,
      exportName: `${appPrefix}-${env}-ReferrerTableArn`,
    });

    this.signatureTable = signatureTable;
    new CfnOutput(this, 'SignatureTableArn', {
      value: this.signatureTable.tableArn,
      exportName: `${appPrefix}-${env}-SignatureTableArn`,
    });

    this.taskTable = taskTable;
    new CfnOutput(this, 'TaskTableArn', {
      value: this.taskTable.tableArn,
      exportName: `${appPrefix}-${env}-TaskTableArn`,
    });

    this.taskPaymentTable = taskPaymentTable;
    new CfnOutput(this, 'TaskPaymentTableArn', {
      value: this.taskPaymentTable.tableArn,
      exportName: `${appPrefix}-${env}-TaskPaymentTableArn`,
    });

    this.teamTable = teamTable;
    new CfnOutput(this, 'TeamTableArn', {
      value: this.teamTable.tableArn,
      exportName: `${appPrefix}-${env}-TeamTableArn`,
    });

    this.teamUserTable = teamUserTable;
    new CfnOutput(this, 'TeamUserTableArn', {
      value: this.teamUserTable.tableArn,
      exportName: `${appPrefix}-${env}-TeamUserTableArn`,
    });

    this.transactionTable = transactionTable;
    new CfnOutput(this, 'TransactionTableArn', {
      value: this.transactionTable.tableArn,
      exportName: `${appPrefix}-${env}-TransactionTableArn`,
    });

    this.userConversationTable = userConversationTable;
    new CfnOutput(this, 'UserConversationTableArn', {
      value: this.userConversationTable.tableArn,
      exportName: `${appPrefix}-${env}-UserConversationTableArn`,
    });

    this.userTable = userTable;
    new CfnOutput(this, 'UserTableArn', {
      value: this.userTable.tableArn,
      exportName: `${appPrefix}-${env}-UserTableArn`,
    });
  }
}
