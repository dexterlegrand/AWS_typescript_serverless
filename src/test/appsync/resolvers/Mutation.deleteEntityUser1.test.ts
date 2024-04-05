import { EvaluateCodeCommandInput } from '@aws-sdk/client-appsync';
import { readFile } from 'fs/promises';
import { region, userIdentity } from '../../testData';
import { describe, expect, it } from 'vitest';

const file =
  './apps/backend/src/test/appsync/resolvers/bundled/Mutation.deleteEntityUser1.js';

describe('Mutation.deleteEntityUser1', () => {
  const {
    AppSyncClient,
    EvaluateCodeCommand,
  } = require('@aws-sdk/client-appsync');
  const appsync = new AppSyncClient({ region });

  it('should delete entity user ', async () => {
    const context = {
      arguments: {
        input: {
          entityId: 'entity1',
          userId: 'userid1',
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
    expect(response?.error).toBeUndefined();

    expect(response.evaluationResult).toBeDefined();

    const result = JSON.parse(response.evaluationResult ?? '{}');
    expect(result.operation).toEqual('DeleteItem');
    expect(result.condition.expression).toEqual('(#role <> :role_ne)');
  });
});
