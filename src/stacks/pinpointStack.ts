import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { aws_pinpoint as pinpoint } from 'aws-cdk-lib';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';
import {
  appPrefix,
  env,
  fromEmail,
  transactionalEmailDomain,
} from '../helpers/constants';

dotenv.config({ path: join(__dirname, '..', '.env') }); // TODO: refactor so i dont need to do for each file?

interface PinpointStackProps extends StackProps {
  test?: boolean;
}

export class PinpointStack extends Stack {
  public readonly pinpointApp: pinpoint.CfnApp;

  constructor(scope: Construct, id: string, props: PinpointStackProps) {
    super(scope, id, props);

    // new iam role for pinpoint
    const pinpointRole = new Role(this, 'PinpointRole', {
      assumedBy: new ServicePrincipal('pinpoint.amazonaws.com'),
    });

    // pinpoint policies
    pinpointRole.addToPolicy(
      new PolicyStatement({
        actions: [
          'mobiletargeting:PutEvents',
          'mobiletargeting:PutItems',
          'mobiletargeting:PutEventStream',
          'mobiletargeting:SendUsersMessages',
          'mobiletargeting:SendMessages',
          'ses:SendEmail',
          'ses:SendTemplatedEmail',
          'mobiletargeting:GetEmailTemplate',
        ],
        resources: ['*'],
      })
    );

    // create a new Pinpoint application
    const pinpointApp = new pinpoint.CfnApp(this, 'PinpointApp', {
      name: `${appPrefix}-pinpoint-app-${env}`,
    });

    // enable the Email channel for the Pinpoint application
    new pinpoint.CfnEmailChannel(this, 'PinpointEmailChannel', {
      applicationId: pinpointApp.ref,
      enabled: true,
      fromAddress: fromEmail, //The verified email address that you want to send email from when you send email through the channel.
      identity: `arn:aws:ses:${props.env?.region}:${props.env?.account}:identity/${transactionalEmailDomain}`, //The Amazon Resource Name (ARN) of the email identity that you want to use when you send email through the channel.
      roleArn: pinpointRole.roleArn, //The ARN of the AWS Identity and Access Management (IAM) role that you want Amazon Pinpoint to use when it submits email-related event data for the channel.
      //configurationSet: '', //The name of the configuration set that you want to use when sending email through the channel.
    });

    // read the welcome email template html content
    const htmlPart = readFileSync(
      join(__dirname, '../pinpoint/email-templates/welcome/content.html'),
      'utf8'
    );
    const textPart = readFileSync(
      join(__dirname, '../pinpoint/email-templates/welcome/content.txt'),
      'utf8'
    );

    // welcome email
    new pinpoint.CfnEmailTemplate(this, 'WelcomeEmailTemplate', {
      templateName: `user-welcome-email-${env}`,
      templateDescription:
        'Welcome email sent to users when they sign up for our app.',
      subject: 'Welcome to Admiin',
      htmlPart,
      textPart,
      //defaultSubstitutions: JSON.stringify({
      //  subject: 'Welcome to Admiin',
      //  senderName: 'Admiin',
      //  senderEmail: fromEmail,
      //  htmlPart: htmlContent,
      //  textPart: 'Welcome to our app!'
      //}),
    });

    // cloud function output
    new CfnOutput(this, 'PinpointAppId', {
      value: pinpointApp.ref,
      exportName: `${appPrefix}-${env}-PinpointApiId`,
    });

    this.pinpointApp = pinpointApp;
  }
}
