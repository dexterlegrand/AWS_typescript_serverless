import { EvaluateCodeCommandInput } from '@aws-sdk/client-appsync';
import { readFile } from 'fs/promises';
import { region, userIdentity } from '../../testData';
import { describe, expect, it } from 'vitest';

const file =
  './apps/backend/src/test/appsync/resolvers/bundled/Mutation.updateTask2.js';
describe(
  'Mutation.createEntity0',
  () => {
    const {
      AppSyncClient,
      EvaluateCodeCommand,
    } = require('@aws-sdk/client-appsync');
    const appsync = new AppSyncClient({ region });

    // test create company entity
    it('should update task', async () => {
      // Arrange
      const context = {
        arguments: {
          input: {
            id: 'task1',
            entityId: 'entity1',
            paymentStatus: 'MARKED_AS_PAID',
          },
        },
        stash: {
          existingTask: {
            id: 'task1',
            entityId: 'entity1',
            paymentStatus: 'PENDING_PAYMENT',
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
      expect(response?.error).toBeUndefined();
    });

    it('should not update task', async () => {
      // Arrange
      const context = {
        arguments: {
          input: {
            id: 'task1',
            entityId: 'entity1',
            paymentStatus: 'MARKED_AS_PAID',
          },
        },
        stash: {
          existingTask: {
            id: 'task1',
            entityId: 'entity1',
            paymentStatus: 'PAID',
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
      const response = await appsync.send(evaluateCodeCommand);
      expect(response?.error).toBeDefined();
    });
  },
  { timeout: 10000 }
);
