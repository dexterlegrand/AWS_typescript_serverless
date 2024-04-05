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
  'Mutation.createEntity0',
  () => {
    const file =
      './apps/backend/src/test/appsync/resolvers/bundled/Mutation.createEntity0.js';
    // test create company entity
    it('should create company entity', async () => {
      // Arrange
      const context = {
        arguments: {
          input: {
            type: 'COMPANY',
            name: 'APPTRACTIVE PTY LTD',
            abn: '37627379800',
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

      const normalizedResult = unmarshall(result.attributeValues);
      expect(result.operation).toEqual('PutItem');

      expect(normalizedResult.type).toEqual('COMPANY');
      // check OCR email generated as expected
      expect(normalizedResult.ocrEmail).toMatch(/^apptractiveptyltd_/);
    });
  },
  { timeout: 10000 }
);
