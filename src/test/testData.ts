import { USER_GROUPS } from '../appsync/helpers/cognito';

export const region = 'us-east-1';

export const userIdentity = {
  sub: 'uuid',
  issuer: 'https://cognito-idp.{region}.amazonaws.com/{userPoolId}',
  username: 'John User',
  claims: {
    sub: 'uuid',
    'cognito:groups': USER_GROUPS.USERS,
    email_verified: 'false',
    iss: 'https://cognito-idp.us-east-1.amazonaws.com/{userPoolId}',
    phone_number_verified: 'true',
    'cognito:username': 'uuid',
    locale: 'en',
    origin_jti: 'origin_jti',
    aud: 'aud',
    event_id: 'event_id',
    token_use: 'id',
    //"auth_time": "1709017382",
    phone_number: '+61401111111',
    'custom:identityId': 'us-east-1:XXXX-XXXXXX-XXXX-XXXX',
    //"exp": "Wed Mar 06 22:23:55 UTC 2050",
    //"iat": "Wed Mar 06 21:23:55 UTC 2050",
    jti: 'jti',
    email: 'email',
  },
  groups: [USER_GROUPS.USERS],
  sourceIp: ['x.x.x.x'],
  defaultAuthStrategy: 'ALLOW',
};

export const adminIdentity = {
  sub: 'uuid',
  issuer: 'https://cognito-idp.{region}.amazonaws.com/{userPoolId}',
  username: 'Sandra Admin',
  claims: {},
  groups: [USER_GROUPS.ADMINS],
  sourceIp: ['x.x.x.x'],
  defaultAuthStrategy: 'ALLOW',
};

export const superAdminIdentity = {
  sub: 'uuid',
  issuer: 'https://cognito-idp.{region}.amazonaws.com/{userPoolId}',
  username: 'Keith SuperAdmin',
  claims: {},
  groups: [USER_GROUPS.SUPER_ADMINS],
  sourceIp: ['x.x.x.x'],
  defaultAuthStrategy: 'ALLOW',
};

export const mockUser = {
  firstName: '',
};

export const mockCreateNotification = {
  message: 'Hello World',
  title: 'Hello',
  owner: 'uuid',
};

export const mockLambdaContext = {};
