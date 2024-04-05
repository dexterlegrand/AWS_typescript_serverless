import {
  CognitoIdentityClient,
  GetIdCommand,
} from '@aws-sdk/client-cognito-identity';
import {
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { describe, expect, it } from 'vitest';
import { handler } from '../../functions/updateUserIdentityId';
import { userIdentity } from '../testData';

//vi.mock('@aws-sdk/client-cognito-identity', async () => {
//  const cognitoIdentityClient: any = await vi.importActual('@aws-sdk/client-cognito-identity');
//  const cognitoIdentityProviderClient: any = await vi.importActual('@aws-sdk/client-cognito-identity-provider');
//  return {
//    ...cognitoIdentityClient,
//    ...cognitoIdentityProviderClient,
//    CognitoIdentityClient: vi.fn().mockImplementation(() => ({
//      send: vi.fn().mockResolvedValue({ IdentityId: 'mockIdentityId' })
//    })),
//    CognitoIdentityServiceProvider: vi.fn().mockImplementation(() => ({
//      send: vi.fn().mockResolvedValue({ UserPoolId: 'mockUserPoolId' }) // Mock the UserPoolId
//    }))
//  };
//});

const ciMock = mockClient(CognitoIdentityClient);
ciMock.on(GetIdCommand).resolves({ IdentityId: 'mockIdentityId' });

const cipMock = mockClient(CognitoIdentityProviderClient);
cipMock.on(AdminUpdateUserAttributesCommand).resolves({});
mockClient(DynamoDBClient);
const docMock = mockClient(DynamoDBDocumentClient);
docMock.on(UpdateCommand).resolves({
  Attributes: {
    id: 'mockId',
    IdentityId: 'mockIdentityId',
  },
});

describe('updateUserIdentityId Lambda Function', () => {
  it('should return 200 status code', async () => {
    const event = {
      requestContext: {
        authorizer: {
          ...userIdentity,
        },
      },
      headers: {
        Authorization: 'test-authorization',
      },
    };

    const result = await handler(event as any);
    expect(result.statusCode).toBe(200);
  });

  // Add more test cases as needed
});
