import {
  IdentityPool,
  UserPoolAuthenticationProvider,
} from '@aws-cdk/aws-cognito-identitypool-alpha';
import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from 'aws-cdk-lib';
import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager';
import {
  AccountRecovery,
  CfnUserPoolGroup,
  ClientAttributes,
  Mfa,
  StringAttribute,
  UserPool,
  UserPoolClient,
  UserPoolEmail,
  UserPoolIdentityProviderOidc,
  VerificationEmailStyle,
  ProviderAttribute,
  UserPoolClientIdentityProvider,
} from 'aws-cdk-lib/aws-cognito';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Effect, IRole, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { ARecord, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { UserPoolDomainTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';
import { getLambdaDefaultProps } from '../helpers';
import {
  generateCognitoWelcomeEmail,
  GenerateCognitoWelcomeEmailProps,
} from '../helpers/cognitoEmailTemplate';
import {
  appName,
  appPrefix,
  companyName,
  createUserFuncName,
  domain,
  env,
  fromEmail,
  isProd,
  mixpanelToken,
  replyToEmail,
  webDomainName,
  xeroClientId,
  xeroClientSecret,
} from '../helpers/constants';

//STEPS to init stack
// 1. Verify email address for SES https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-email.html#user-pool-email-developer

interface AuthStackProps extends StackProps {
  readonly userTable: Table;
  readonly zone: IHostedZone;
}

export class AuthStack extends Stack {
  //public readonly identityPoolId: CfnOutput;
  public readonly identityPool: IdentityPool;
  public readonly authenticatedRole: IRole;
  public readonly unauthenticatedRole: IRole;
  //public readonly adminRole: IRole;
  //public readonly superAdminRole: IRole;
  public readonly userPool: UserPool;
  public readonly createUserFunc: NodejsFunction;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    const cognitoCustomDomain = isProd
      ? `auth.${domain}`
      : `auth-${env}.${domain}`;
    const groupNames = ['SuperAdmins', 'Admins', 'Users'];

    const identitypoolConstructName = `${appPrefix}-IdentityPool-${env}`;
    const appClientConstructName = `${appPrefix}-UserPoolClient-${env}`;
    const userpoolConstructName = `${appPrefix}-UserPool-${env}`;
    //TODO: pool sms role?
    //const poolSmsRole = new Role(this, 'UserPoolSmsRole', {
    //  assumedBy: new ServicePrincipal('cognito-idp.amazonaws.com')
    //});

    // add user function
    const createUserFunc = new NodejsFunction(this, 'createUserFunc', {
      //TODO: capital C
      ...getLambdaDefaultProps(this, 'createUser'),
      environment: {
        MIXPANEL_TOKEN: mixpanelToken,
        TABLE_USER: props.userTable.tableName,
      },
      functionName: createUserFuncName,
    });

    props.userTable.grantWriteData(createUserFunc);
    //TODO: Grant userpool access to create user function

    // post confirmation trigger function
    const postConfirmFunc = new NodejsFunction(
      this,
      'postConfirmationTriggerFunc',
      {
        ...getLambdaDefaultProps(this, 'postConfirmationTrigger'),
        environment: {
          FUNCTION_CREATEUSER: createUserFunc.functionName,
        },
      }
    );

    // allow create user function to be invoked by post confirmation trigger function
    createUserFunc.grantInvoke(postConfirmFunc);

    // post confirmation trigger function
    new NodejsFunction(this, 'postAuthenticationTriggerFunc', {
      ...getLambdaDefaultProps(this, 'postAuthenticationTrigger'),
    });

    const cognitoEmailProps: GenerateCognitoWelcomeEmailProps = {
      appName: appName,
      companyName: companyName,
      domain: domain,
      replyToEmail: replyToEmail,
      webDomainName: webDomainName,
    };
    // userpool
    const userPool = new UserPool(this, userpoolConstructName, {
      userPoolName: userpoolConstructName,
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      signInCaseSensitive: false,
      selfSignUpEnabled: true,
      accountRecovery: AccountRecovery.PHONE_AND_EMAIL,
      userVerification: {
        emailSubject: `${appName} Verification Code`,
        emailBody: generateCognitoWelcomeEmail(cognitoEmailProps, false),
        smsMessage: `Your ${appName} verification code is {####}`,
        emailStyle: VerificationEmailStyle.CODE,
      },
      userInvitation: {
        emailSubject: `Invite to join ${appName}!`,
        emailBody: generateCognitoWelcomeEmail(cognitoEmailProps, true),
        smsMessage: `Hello {username}, your temporary password for ${appName} is {####}`,
      },
      signInAliases: {
        email: true,
        phone: true,
      },
      autoVerify: {
        email: true,
        phone: true,
      },
      standardAttributes: {
        email: {
          required: false,
          mutable: true,
        },
        familyName: {
          required: false,
          mutable: true,
        },
        givenName: {
          required: false,
          mutable: true,
        },
        locale: {
          required: false,
          mutable: true,
        },
        phoneNumber: {
          required: false,
          mutable: true,
        },
      },
      keepOriginal: {
        email: true,
        phone: true,
      },
      //smsRole: poolSmsRole,
      //smsRoleExternalId: 'c87467be-4f34-11ea-b77f-2e728ce88125',
      customAttributes: {
        teamId: new StringAttribute({ mutable: true }),
        userType: new StringAttribute({ mutable: true }),
        identityId: new StringAttribute({ mutable: true }),
        billingId: new StringAttribute({ mutable: true }), //TODO: remove if able to, if stack is creatable form scratch. Otherwise remove this message
      },
      mfa: Mfa.OPTIONAL,
      //mfaMessage: "",
      mfaSecondFactor: {
        otp: true,
        sms: true,
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
        tempPasswordValidity: Duration.days(60),
      },
      email: UserPoolEmail.withSES({
        fromEmail: fromEmail,
        fromName: appName,
        replyTo: replyToEmail,
      }),
      deletionProtection: isProd,
      lambdaTriggers: {
        postConfirmation: postConfirmFunc,
        //postAuthentication: postAuthFunc
      },
    });

    groupNames.forEach(
      (groupName) =>
        new CfnUserPoolGroup(
          this,
          `${userpoolConstructName}${groupName}Group`,
          {
            userPoolId: userPool.userPoolId,
            groupName: groupName,
          }
        )
    );
    //// IDENTITY PROVIDERS

    const xeroIdentityProvider = new UserPoolIdentityProviderOidc(
      this,
      'XeroUserPoolIdentityProviderOidc',
      {
        name: 'Xero',
        clientId: xeroClientId,
        clientSecret: xeroClientSecret,
        issuerUrl: 'https://identity.xero.com',
        scopes: ['openid', 'profile', 'email', 'offline_access'],
        userPool,
        attributeMapping: {
          email: ProviderAttribute.other('email'),
          givenName: ProviderAttribute.other('given_name'),
          familyName: ProviderAttribute.other('family_name'),
          preferredUsername: ProviderAttribute.other('sub'),
        },
      }
    );
    //const appleProvider = new UserPoolIdentityProviderApple(this, 'AppleProvider', {
    //  userPool: userPool,
    //  clientId: 'com.example.apple',  // https://developer.apple.com/documentation/sign_in_with_apple/clientconfigi/3230948-clientid
    //  teamId: 'XXXXXX',
    //  keyId: 'XXXXXX',
    //  privateKey: 'XXXXXX',
    //  scopes: [], //https://developer.apple.com/documentation/sign_in_with_apple/clientconfigi/3230955-scope
    //  attributeMapping: {
    //    email: ProviderAttribute.APPLE_EMAIL,
    //    givenName: ProviderAttribute.APPLE_FIRST_NAME,
    //    familyName: ProviderAttribute.APPLE_LAST_NAME
    //  }
    //});
    //
    //const clientSecretValue = Secret.fromSecretAttributes(this, "CognitoClientSecret", {
    //  secretCompleteArn: "arn:aws:secretsmanager:xxx:xxx:secret:xxx-xxx"
    //}).secretValue
    //
    //// sign in with Google
    //const googleProvider = new UserPoolIdentityProviderGoogle(this, 'GoogleProvider', {
    //  userPool: userPool,
    //  clientId: 'XXXXXX', //TODO: update
    //  clientSecretValue: clientSecretValue,
    //  scopes: [],
    //  attributeMapping: {
    //    email: ProviderAttribute.GOOGLE_EMAIL,
    //    givenName: ProviderAttribute.GOOGLE_GIVEN_NAME,
    //    familyName: ProviderAttribute.GOOGLE_FAMILY_NAME
    //  }
    //});

    createUserFunc.role?.attachInlinePolicy(
      new Policy(this, 'CreateUserFuncUserPoolPolicy', {
        statements: [
          new PolicyStatement({
            actions: [
              'cognito-idp:AdminUpdateUserAttributes',
              'cognito-idp:AdminAddUserToGroup',
            ],
            effect: Effect.ALLOW,
            resources: [userPool.userPoolArn],
          }),
        ],
      })
    );

    // set attributes that are readable by a user
    const readAttributes = new ClientAttributes()
      .withStandardAttributes({
        email: true,
        emailVerified: true,
        phoneNumber: true,
        phoneNumberVerified: true,
        familyName: true,
        givenName: true,
        locale: true,
      })
      .withCustomAttributes('teamId', 'userType', 'identityId', 'billingId');

    // set attributes that are writable for a user
    const writeAttributes = new ClientAttributes().withStandardAttributes({
      email: true,
      phoneNumber: true,
      familyName: true,
      givenName: true,
      locale: true,
    });

    const clientProps = {
      //preventUserExistenceErrors: true, //if true, prevents user not found errors return to client
      authFlows: {
        userPassword: true,
        userSrp: true,
        custom: true,
      },
      oAuth: {
        callbackUrls: ['http://localhost:4200/xero-redirect'],
      },
      supportedIdentityProviders: [
        UserPoolClientIdentityProvider.custom('Xero'),
        //UserPoolClientIdentityProvider.APPLE,
        //UserPoolClientIdentityProvider.GOOGLE
      ],
      readAttributes,
      writeAttributes,
      userPool,
    };

    const userPoolClient = new UserPoolClient(
      this,
      `${appClientConstructName}`,
      {
        ...clientProps,
      }
    );

    userPoolClient.node.addDependency(xeroIdentityProvider);
    //userPoolClient.node.addDependency(appleProvider);
    //userPoolClient.node.addDependency(googleProvider);

    const userPoolWebClient = new UserPoolClient(
      this,
      `${appClientConstructName}-web`,
      {
        ...clientProps,
      }
    );
    userPoolWebClient.node.addDependency(xeroIdentityProvider);
    //userPoolWebClient.node.addDependency(appleProvider);
    //userPoolWebClient.node.addDependency(googleProvider);

    // authenticated / non-authenticated users
    const identityPool = new IdentityPool(this, identitypoolConstructName, {
      identityPoolName: identitypoolConstructName,
      allowUnauthenticatedIdentities: false,
      authenticationProviders: {
        userPools: [
          //TODO: review this
          new UserPoolAuthenticationProvider({ userPool, userPoolClient }),
          new UserPoolAuthenticationProvider({
            userPool,
            userPoolClient: userPoolWebClient,
          }),
        ],
        //apple: {
        //  servicesId: 'com.myappleapp.auth' //TODO: update
        //},
        //google: {
        //  clientId: '12345678012.apps.googleusercontent.com' //TODO: update
        //},
      },
    });

    // certificate for custom domain
    const certificate = new Certificate(this, 'UserPoolCertificate', {
      domainName: cognitoCustomDomain,
      validation: CertificateValidation.fromDns(props.zone),
    });

    // cognito custom domain
    const userPoolDomain = userPool.addDomain('UserPoolCustomDomain', {
      customDomain: {
        domainName: cognitoCustomDomain,
        certificate,
      },
    });

    // a record for userpool custom domain name
    new ARecord(this, 'UserPoolDomainAliasRecord', {
      zone: props.zone,
      recordName: cognitoCustomDomain,
      target: RecordTarget.fromAlias(new UserPoolDomainTarget(userPoolDomain)),
    });

    new CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      exportName: `${appPrefix}-${env}-UserPoolId`,
    });

    new CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      exportName: `${appPrefix}-${env}-UserPoolClientId`,
    });

    //this.identityPoolId = new CfnOutput(this, 'IdentityPoolId', {
    new CfnOutput(this, 'IdentityPoolId', {
      value: identityPool.identityPoolId,
      exportName: `${appPrefix}-${env}-IdentityPoolId`,
    });

    this.authenticatedRole = identityPool.authenticatedRole;
    this.unauthenticatedRole = identityPool.unauthenticatedRole;
    this.userPool = userPool;
    this.identityPool = identityPool;
  }
}
