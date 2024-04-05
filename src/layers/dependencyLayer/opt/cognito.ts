import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminCreateUserResponse,
  AdminDeleteUserCommand,
  AdminAddUserToGroupCommandInput,
  AdminUpdateUserAttributesCommand,
  AdminGetUserCommand,
  AdminListGroupsForUserCommand,
  AdminListGroupsForUserCommandInput,
  AdminRemoveUserFromGroupCommand,
  AdminRemoveUserFromGroupCommandInput,
  AdminCreateUserRequest,
} from '@aws-sdk/client-cognito-identity-provider';

//import {
//  PASSWORD_POLICY,
//} from '@admiin-com/ds-common'; //TODO: activate

//eslint-disable-next-line @typescript-eslint/ban-ts-comment
import * as generatePassword from 'generate-password';

const cognitoIdentityServiceProvider = new CognitoIdentityProviderClient({
  apiVersion: '2016-04-18',
});

export const USER_GROUPS = {
  SUPER_ADMINS: 'SuperAdmins',
  ADMINS: 'Admins',
  USERS: 'Users',
  BUYERS: 'Buyers',
  SELLERS: 'Sellers',
};

export const PASSWORD_POLICY = {
  length: 8,
  numbers: true,
  symbols: true,
  lowercase: true,
  uppercase: true,
  strict: true,
};

export const getCognitoUser = async (userPoolId: string, username: string) => {
  const input = {
    UserPoolId: userPoolId,
    Username: username,
  };

  const command = new AdminGetUserCommand(input);
  return cognitoIdentityServiceProvider.send(command);
};

type cognitoUserProps = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  teamId?: string;
};

export const adminListGroupsForUser = async (
  input: AdminListGroupsForUserCommandInput
) => {
  const command = new AdminListGroupsForUserCommand(input);
  return cognitoIdentityServiceProvider.send(command);
};
export const adminAddUserToGroup = async (
  input: AdminAddUserToGroupCommandInput
) => {
  const command = new AdminAddUserToGroupCommand(input);
  return cognitoIdentityServiceProvider.send(command);
};
export const createCognitoUser = async (
  userPoolId: string,
  { firstName, lastName, email, phone }: cognitoUserProps
): Promise<AdminCreateUserResponse> => {
  const password = generatePassword.generate({
    ...PASSWORD_POLICY,
    excludeSimilarCharacters: true,
  });

  const input: AdminCreateUserRequest = {
    UserPoolId: userPoolId,
    Username: email,
    TemporaryPassword: password,
    DesiredDeliveryMediums: ['EMAIL'],
    ForceAliasCreation: false,
    UserAttributes: [
      {
        Name: 'email',
        Value: email,
      },
    ],
  };

  if (phone) {
    input?.DesiredDeliveryMediums?.push('SMS');
    input?.UserAttributes?.push({
      Name: 'phone_number',
      Value: phone,
    });
  }

  if (firstName) {
    input?.UserAttributes?.push({
      Name: 'given_name',
      Value: firstName,
    });
  }

  if (lastName) {
    input?.UserAttributes?.push({
      Name: 'family_name',
      Value: lastName,
    });
  }

  const command = new AdminCreateUserCommand(input);
  return cognitoIdentityServiceProvider.send(command);
};

export const adminRemoveUserFromGroup = async (
  input: AdminRemoveUserFromGroupCommandInput
) => {
  const command = new AdminRemoveUserFromGroupCommand(input);
  return cognitoIdentityServiceProvider.send(command);
};

export const updateCustomAttributes = async (
  userPoolId: string, //needs to be passed, createUser can cause circular dependency in aws cdk / cloudformation
  username: string,
  userAttributes: any
) => {
  const input = {
    UserAttributes: userAttributes,
    UserPoolId: userPoolId,
    Username: username,
  };

  const command = new AdminUpdateUserAttributesCommand(input);
  return cognitoIdentityServiceProvider.send(command);
};

export const deleteCognitoUser = async (
  userPoolId: string,
  username: string
) => {
  const input = {
    UserPoolId: userPoolId,
    Username: username,
  };

  const command = new AdminDeleteUserCommand(input);
  return cognitoIdentityServiceProvider.send(command);
};

export const isInGroupFromClaims = (claims: any, group: string) => {
  return (
    claims &&
    claims['cognito:groups'] &&
    claims['cognito:groups'].includes(group)
  );
};

export const isAdminFromClaims = (claims: any) => {
  return (
    isInGroupFromClaims(claims, USER_GROUPS.ADMINS) ||
    isInGroupFromClaims(claims, USER_GROUPS.SUPER_ADMINS)
  );
};

export const isSuperAdminFromClaims = (claims: any) => {
  return isInGroupFromClaims(claims, USER_GROUPS.SUPER_ADMINS);
};
