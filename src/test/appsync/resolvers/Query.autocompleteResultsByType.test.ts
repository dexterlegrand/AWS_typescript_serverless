import { EvaluateCodeCommandInput } from '@aws-sdk/client-appsync';
import { readFile } from 'fs/promises';
import { describe, expect, it } from 'vitest';

describe('Query.autocompleteResultsByType', () => {
  const {
    AppSyncClient,
    EvaluateCodeCommand,
  } = require('@aws-sdk/client-appsync');
  const appsync = new AppSyncClient({ region: 'us-east-1' });
  const file =
    './apps/backend/src/test/appsync/resolvers/bundled/Query.autocompleteResultsByType.js';

  it('should return query to list autocomplete results by type', async () => {
    const context = {
      arguments: {
        type: 'ENTITY',
      },
    };

    const input: EvaluateCodeCommandInput = {
      runtime: { name: 'APPSYNC_JS', runtimeVersion: '1.0.0' },
      code: await readFile(file, { encoding: 'utf8' }),
      context: JSON.stringify(context),
      function: 'request',
    };

    const evaluateCodeCommand = new EvaluateCodeCommand(input);
    const response = await appsync.send(evaluateCodeCommand);
    expect(response.message).toBeUndefined();
    expect(response.evaluationResult).toBeDefined();

    const result = JSON.parse(response.evaluationResult ?? '{}');
    expect(result.operation).toEqual('Query');
    expect(result.query.expressionNames).toEqual({ '#key': 'type' });
  });

  it('should return query to list autocomplete results by type and searchname', async () => {
    const context = {
      arguments: {
        searchName: 'test',
        type: 'ENTITY',
      },
    };

    const input: EvaluateCodeCommandInput = {
      runtime: { name: 'APPSYNC_JS', runtimeVersion: '1.0.0' },
      code: await readFile(file, { encoding: 'utf8' }),
      context: JSON.stringify(context),
      function: 'request',
    };

    const evaluateCodeCommand = new EvaluateCodeCommand(input);
    const response = await appsync.send(evaluateCodeCommand);
    expect(response.message).toBeUndefined();
    expect(response.evaluationResult).toBeDefined();

    const result = JSON.parse(response.evaluationResult ?? '{}');
    expect(result.operation).toEqual('Query');
    expect(result.query.expression).toEqual(
      '#type = :type and begins_with(#searchName, :searchName)'
    );
  });
});
