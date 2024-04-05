export const externalLibs = [
  'aws-sdk',
  '@aws-crypto/util',
  '@aws-appsync/utils',
  '@aws-sdk/client-lambda',
  '@aws-sdk/client-location',
  '@aws-sdk/client-sqs',
  '@aws-sdk/lib-dynamodb',
  '@aws-sdk/client-dynamodb',
  '@aws-sdk/credential-provider-cognito-identity',
  '@aws-sdk/client-cognito-identity',
  '@sentry/serverless',
  'tslib',
  'googleapis-common',
  'csv-parse',
  'protobufjs',
  'uuid',
  'aws-lambda',
];

export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
