import { marshall } from '@aws-sdk/util-dynamodb';
import { readFile } from 'fs/promises';
import { adminIdentity, superAdminIdentity } from '../../testData';
import { describe, expect, it, vi } from 'vitest';
import { EvaluateCodeCommandInput } from '@aws-sdk/client-appsync';

const file =
  './apps/backend/src/test/appsync/resolvers/bundled/Query.getAdmin.js';
// https://medium.com/ama-tech-blog/developing-and-testing-aws-appsync-javascript-resolvers-d485090f3fe
//https://docs.aws.amazon.com/appsync/latest/devguide/test-debug-resolvers-js.html

// Correctly mock AppSyncClient along with EvaluateCodeCommand
vi.mock('@aws-sdk/client-appsync', async () => {
  const actual: any = await vi.importActual('@aws-sdk/client-appsync');

  return {
    ...actual,
    AppSyncClient: vi.fn().mockImplementation(() => ({
      send: vi.fn((command) => {
        if (command.input.context.includes('adminIdentity')) {
          return Promise.resolve({
            evaluationResult: JSON.stringify({ operation: 'Scan' }),
          });
        } else {
          return Promise.resolve({
            error: { message: 'Unauthorized' },
          });
        }
      }),
    })),
  };
});

describe('getAdmin', () => {
  const {
    AppSyncClient,
    EvaluateCodeCommand,
  } = require('@aws-sdk/client-appsync');
  const appsync = new AppSyncClient({ region: 'us-east-1' });

  it('unauthorised for non admin', async () => {
    // Arrange
    const context = {
      arguments: {
        id: '123',
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

    expect(response.error).toBeDefined();
    expect(response.error?.message).toEqual('Unauthorized');
  });

  it('authorised and response for Admin group', async () => {
    // Arrange
    const context = {
      arguments: {
        id: '123',
      },
      result: {
        id: '123',
      },
      identity: adminIdentity,
    };
    const input: EvaluateCodeCommandInput = {
      runtime: { name: 'APPSYNC_JS', runtimeVersion: '1.0.0' },
      code: await readFile(file, { encoding: 'utf8' }),
      context: JSON.stringify(context),
      function: 'request',
    };
    const evaluateCodeCommand = new EvaluateCodeCommand(input);

    const response = await appsync.send(evaluateCodeCommand);

    expect(response.error).toBeUndefined();
    expect(response.evaluationResult).toBeDefined();

    const result = JSON.parse(response.evaluationResult ?? '{}');
    expect(result.operation).toEqual('GetItem');
    expect(result.key).toEqual(marshall(context.arguments));
  });

  it('authorised and response for SuperAdmin group', async () => {
    // Arrange
    const context = {
      arguments: {
        id: '123',
      },
      result: {
        id: '123',
      },
      identity: superAdminIdentity,
    };
    const input: EvaluateCodeCommandInput = {
      runtime: { name: 'APPSYNC_JS', runtimeVersion: '1.0.0' },
      code: await readFile(file, { encoding: 'utf8' }),
      context: JSON.stringify(context),
      function: 'request',
    };
    const evaluateCodeCommand = new EvaluateCodeCommand(input);
    const response = await appsync.send(evaluateCodeCommand);

    expect(response.error).toBeUndefined();
    expect(response.evaluationResult).toBeDefined();

    const result = JSON.parse(response.evaluationResult ?? '{}');
    expect(result.operation).toEqual('GetItem');
    expect(result.key).toEqual(marshall(context.arguments));
  });
});

//npx esbuild --bundle \
//--sourcemap=inline \
//--sources-content=false \
//--target=esnext \
//--platform=node \
//--format=esm \
//--external:@aws-appsync/utils \
//--outdir=test/appsync/resolvers/bundled \
//lib/appsync/resolvers/**/*.ts
