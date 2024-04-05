import {
  USER_GROUPS,
  adminAddUserToGroup,
  createCognitoUser,
  getCognitoUser,
  isInGroupFromClaims,
} from '/opt/cognito';
//import {
//  AttributeType
//} from "@aws-sdk/client-cognito-identity-provider";
import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import { createRecord } from '/opt/dynamoDB';
import { AppSyncResolverHandler } from 'aws-lambda';

const {
  TABLE_ADMIN,
  //TABLE_USER,
  AUTH_USERPOOLID,
} = process.env;
export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  const { claims, sub } = ctx.identity as AppSyncIdentityCognito;
  const { input } = ctx.arguments;
  const { firstName, lastName, email, phone, role } = input;

  if (!isInGroupFromClaims(claims, USER_GROUPS.SUPER_ADMINS)) {
    throw new Error('Not authorised to create an admin');
  }

  let cognitoUserDetails;
  try {
    cognitoUserDetails = await getCognitoUser(AUTH_USERPOOLID ?? '', email);
    console.log('cognitoUserDetails: ', cognitoUserDetails);
  } catch (err: any) {
    console.log('ERROR get cognito user details (expected): ', err);
  }

  if (cognitoUserDetails) {
    // already a user
    throw new Error('User already exists for email');
  }

  // set params for admin
  const date = new Date().toISOString();
  const adminParams: any = {
    firstName,
    lastName,
    email,
    phone: phone || null,
    role,
    createdBy: sub,
    createdAt: date,
    updatedAt: date,
  };

  // create cognito user
  let cognitoUser: any;
  try {
    cognitoUser = await createCognitoUser(AUTH_USERPOOLID ?? '', adminParams);
  } catch (err: any) {
    console.log('ERROR create cognito user: ', err);
    throw new Error(err.message);
  }

  const {
    User: { Username, Attributes },
  } = cognitoUser;
  console.log('New cognito user details: ', cognitoUser);
  console.log('new user: ', Username, Attributes);

  //const newSub = Attributes.find(
  //  (attribute: AttributeType) => attribute.Name === 'sub'
  //)?.Value;

  // set params for user
  //const userParams = {
  //  id: newSub,
  //  email,
  //  phone: phone || null,
  //  userType: null,
  //  identityId: null,
  //  firstName,
  //  lastName: lastName || null,
  //  locale: locale || null,
  //  blocked: [],
  //  blockedBy: [],
  //  interests: [],
  //  profileImg: null,
  //  completed: false,
  //  owner: newSub,
  //  createdAt: date,
  //  updatedAt: date
  //};

  // create user record
  //try {
  //  await createRecord(TABLE_USER ?? '', userParams);
  //  console.log('New user details: ', userParams);
  //} catch (err: any) {
  //  console.log('err creating user: ', err);
  //  throw new Error(err.message);
  //}

  // set new user data for new admin
  adminParams.id = Username;
  adminParams.owner = Username;

  // add admin to Admins group
  try {
    const params = {
      GroupName: role,
      UserPoolId: AUTH_USERPOOLID,
      Username: adminParams.id,
    };

    await adminAddUserToGroup(params);
  } catch (err: any) {
    console.log('Error adding admin group', err);
    throw new Error(err.message);
  }

  // create admin
  try {
    await createRecord(TABLE_ADMIN ?? '', adminParams);
    console.log('New admin details: ', adminParams);
    return adminParams;
  } catch (err: any) {
    console.log('Error creating admin', err);
    throw new Error(err.message);
  }
};
