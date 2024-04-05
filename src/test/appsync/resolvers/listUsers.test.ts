import { EvaluateCodeCommandInput } from '@aws-sdk/client-appsync';
import { readFile } from 'fs/promises';
import { adminIdentity, userIdentity } from '../../testData';
import { vi } from 'vitest';

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

describe('listUsers', () => {
  const {
    AppSyncClient,
    EvaluateCodeCommand,
  } = require('@aws-sdk/client-appsync');
  const appsync = new AppSyncClient({ region: 'us-east-1' });
  const file =
    './apps/backend/src/test/appsync/resolvers/bundled/Query.listUsers.js';
  it('unauthorised for non-user', async () => {
    // Arrange
    const context = {
      arguments: {},
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
  }, 10000);
  it('unauthorised for normal user', async () => {
    // Arrange
    const context = {
      arguments: {},
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

    expect(response.error).toBeDefined();
    expect(response.error?.message).toEqual('Unauthorized');
  });

  it('Authorised and response for Admin group', async () => {
    // Arrange
    const context = {
      arguments: {},
      result: {
        items: [],
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
    expect(result.operation).toEqual('Scan');
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
