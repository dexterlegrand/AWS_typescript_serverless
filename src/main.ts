#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { join } from 'path';
import {
  account,
  appName,
  appPrefix,
  env,
  region,
  webDomainName,
} from './helpers/constants';

import { AppSyncAPIStack } from './stacks/appSyncAPIStack';
import { AuthStack } from './stacks/authStack';
import { DatabaseStack } from './stacks/databaseStack';
import { MediaStorageStack } from './stacks/mediaStorageStack';
import { LayerStack } from './stacks/layerStack';
import { PinpointStack } from './stacks/pinpointStack';
import { Route53Stack } from './stacks/route53Stack';
import { TranslationsStack } from './stacks/translationsStack';
import { WebDeploymentStack } from './stacks/webDeploymentStack';
import { LocationLambdaStack } from './stacks/locationStack';

import * as dotenv from 'dotenv';
dotenv.config({ path: join(__dirname, '..', '.env') });

const indexName = 'EsriPlaceIndexName';

const defaultEnv = {
  account,
  region,
};

const app = new App();

const route53Stack = new Route53Stack(app, `${appPrefix}Route53Stack`, {
  env: {
    ...defaultEnv,
  },
});

new LayerStack(app, `${appPrefix}LayerStack`, {
  env: {
    ...defaultEnv,
  },
});

const databaseStack = new DatabaseStack(app, `${appPrefix}DatabaseStack`, {
  env: {
    ...defaultEnv,
  },
});

const authStack = new AuthStack(app, `${appPrefix}AuthStack`, {
  env: {
    ...defaultEnv,
  },
  userTable: databaseStack.userTable,
  zone: route53Stack.zone,
});

// media storage bucket for files
new MediaStorageStack(app, `${appPrefix}MediaStorageStack`, {
  env: {
    ...defaultEnv,
  },
  authenticatedRole: authStack.authenticatedRole,
  unauthenticatedRole: authStack.unauthenticatedRole,
});

new PinpointStack(app, `${appPrefix}PinpointStack`, {
  env: {
    ...defaultEnv,
  },
});

// graphql api stack
new AppSyncAPIStack(app, `${appPrefix}AppSyncAPIStack`, {
  env: {
    ...defaultEnv,
  },
  activityTable: databaseStack.activityTable,
  autoCompleteResultsTable: databaseStack.autoCompleteResultsTable,
  contactsTable: databaseStack.contactsTable,
  conversationTable: databaseStack.conversationTable,
  entityUserTable: databaseStack.entityUserTable,
  userConversationTable: databaseStack.userConversationTable,
  userTable: databaseStack.userTable,
  messageTable: databaseStack.messageTable,
  notificationTable: databaseStack.notificationTable,
  optionTable: databaseStack.optionTable,
  paymentAccountTable: databaseStack.paymentAccountTable,
  paymentTable: databaseStack.paymentTable,
  paymentMethodTable: databaseStack.paymentMethodTable,
  ratingsTable: databaseStack.ratingsTable,
  referrerTable: databaseStack.referrerTable,
  signatureTable: databaseStack.signatureTable,
  taskTable: databaseStack.taskTable,
  taskPaymentTable: databaseStack.taskPaymentTable,
  teamTable: databaseStack.teamTable,
  teamUserTable: databaseStack.teamUserTable,
  transactionTable: databaseStack.transactionTable,
  entityTable: databaseStack.entityTable,
  zone: route53Stack.zone,
});

// react app
new WebDeploymentStack(app, `${appPrefix}WebDeploymentStack`, {
  env: {
    ...defaultEnv,
  },
  appName,
  stage: env,
  domain: webDomainName,
  zone: route53Stack.zone,
  type: 'web',
  buildPath: '../../../../dist/apps/react-app',
  memoryLimit: 512,
});

// backoffice app
//new WebDeploymentStack(app, `${appPrefix}BackofficeDeploymentStack`, {
//  env: {
//    ...defaultEnv,
//  },
//  appName,
//  stage,
//  domain: backofficeDomainName,
//  zone: route53Stack.zone,
//  type: 'backoffice',
//  buildPath: '../../../../dist/apps/backoffice-app',
//});

new LocationLambdaStack(app, `${appPrefix}LocationStack`, {
  env: { ...defaultEnv },
  indexName,
  authenticatedRole: authStack.authenticatedRole,
});

// i18n translations
new TranslationsStack(app, `${appPrefix}TranslationsStack`, {
  env: {
    ...defaultEnv,
  },
});

//new CiCdStack(app, 'CiCdStack', {
//  env: {
//    ...defaultEnv,
//  },
//  repoPath: 'apptractive/project-template',
//  branch: 'main',
//  directory: 'backend-app',
//  stage,
//  connectionArn
//});

app.synth();

//Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }))
