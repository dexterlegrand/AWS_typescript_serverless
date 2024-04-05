import { mockClient } from 'aws-sdk-client-mock';
import { describe, it, vi } from 'vitest';
import {
  CognitoIdentityProviderClient,
  AdminUpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { updateCustomAttributes } from '../../layers/dependencyLayer/opt/cognito';

vi.mock('generate-password');

const cipMock = mockClient(CognitoIdentityProviderClient);
cipMock.on(AdminUpdateUserAttributesCommand).resolves({});

describe('cognito.ts', () => {
  describe('updateCustomAttribute', () => {
    it('should update custom attribute', async () => {
      const sub = 'test-sub';
      const cognitoParams = [
        {
          Name: 'custom:identityId',
          Value: 'test-identityId',
        },
      ];

      await updateCustomAttributes(
        process.env.AUTH_USERPOOLID ?? '',
        sub,
        cognitoParams
      );
    });
  });
});
