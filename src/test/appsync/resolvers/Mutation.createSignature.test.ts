import {
  AppSyncClient,
  EvaluateCodeCommandInput,
} from '@aws-sdk/client-appsync';
import { readFile } from 'fs/promises';
import { userIdentity } from '../../testData';
import { describe, it } from 'vitest';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const { EvaluateCodeCommand } = require('@aws-sdk/client-appsync');
const appsync = new AppSyncClient({ region: 'us-east-1' });

describe(
  'Mutation.createSignature',
  () => {
    const file =
      './apps/backend/src/test/appsync/resolvers/bundled/Mutation.createSignature.js';
    // test create company entity
    it('should create signature', async () => {
      // Arrange
      const context = {
        arguments: {
          input: {
            key: 'c841b3cf-ed4c-425e-b92a-5698224886db',
          },
        },
        identity: userIdentity,
      };
      const input: EvaluateCodeCommandInput = {
        runtime: { name: 'APPSYNC_JS', runtimeVersion: '1.0.0' },
        code: await readFile(file, { encoding: 'utf8' }),
        context: JSON.stringify(context),
        function: 'request',
      };
      const evaluateCodeCommand = new EvaluateCodeCommand(input);

      // Act
      const response = await appsync.send(evaluateCodeCommand);

      expect(response.message).toBeUndefined();
      expect(response.evaluationResult).toBeDefined();

      const result = JSON.parse(response.evaluationResult ?? '{}');
      const normalisedKey = unmarshall(result.key);
      expect(normalisedKey.userId).toBe(userIdentity.sub);
    });
  },
  { timeout: 10000 }
);
