import { beforeEach, vi } from 'vitest';
import { describe, it } from 'vitest';

vi.mock('@aws-sdk/client-secrets-manager', () => {
  const actual = vi.importActual('@aws-sdk/client-secrets-manager');
  return {
    ...actual,
    SecretsManagerClient: vi.fn(() => ({
      send: vi.fn(),
    })),
    GetSecretValueCommand: vi.fn().mockResolvedValue({
      SecretString: JSON.stringify({ zaiClientSecret: 'test-zai-secret' }),
    }),
  };
});

vi.mock('/opt/dynamoDB', () => ({
  batchGet: vi.fn(),
  batchPut: vi.fn(),
  getRecord: vi.fn(),
}));

vi.mock('/opt/zai', () => ({
  createZaiAuthToken: vi.fn(),
  createZaiItem: vi.fn(),
  listZaiFees: vi.fn(),
  makeZaiPayment: vi.fn(),
  isAuthTokenExpired: vi.fn(),
}));

vi.mock('crypto', () => ({
  randomUUID: vi.fn(),
}));

vi.mock('/opt/dates', () => ({
  isFutureDate: vi.fn(),
}));

describe('lambda createPayment', () => {
  beforeEach(() => {
    process.env.ENV = 'dev';
    process.env.REGION = 'us-east-1';
    // Mock dependencies like getRecord, batchGet, etc., to return expected values for the test
  });

  it('initializes with correct environment settings', async () => {
    //const mockCtx: AppSyncResolverEvent<any, Record<any, any>> = {
    //  identity: {
    //    ...userIdentity
    //  },
    //  arguments: {
    //    input: {
    //      entityId: 'entity-id',
    //      bills: ['bill1', 'bill2'],
    //      paymentMethodId: 'payment-method-id',
    //      paymentType: 'PAY_NOW',
    //      scheduledAt: '2023-12-31',
    //      installments: 2
    //    }
    //  },
    //  source: {},
    //  info: {
    //    "selectionSetList": [
    //      "id"
    //    ],
    //    "selectionSetGraphQL": "{\n  id\n}",
    //    "fieldName": "createPayment",
    //    "parentTypeName": "Mutation",
    //    "variables": {}
    //  },
    //  "prev": null,
    //  "stash": {},
    //  "request": {
    //    "headers": {
    //      "host": "localhost:20002",
    //      "connection": "keep-alive",
    //      "content-length": "0",
    //      "accept": "application/json, text/plain, */*",
    //    },
    //    "domainName": null
    //  }
    //};
    // call handler
    //const mockEvent: Context = {
    //  awsRequestId: 'uuid',
    //  callbackWaitsForEmptyEventLoop: true,
    //  functionName: 'createPayment',
    //  functionVersion: '1',
    //  invokedFunctionArn: 'arn:aws:lambda:us-east-1:uuid:function:createPayment',
    //  memoryLimitInMB: '128',
    //  logGroupName: '/aws/lambda/createPayment',
    //  logStreamName: '2021/12/31/[$LATEST]uuid',
    //  clientContext: {
    //    client: {
    //      installationId: 'uuid',
    //      appTitle: 'title',
    //      appVersionName: '1.0.0',
    //      appVersionCode: '1',
    //      appPackageName: 'com.example'
    //    },
    //    Custom: {
    //      custom: 'custom'
    //    },
    //    env: {
    //      env: 'env'
    //    }
    //  },
    //  getRemainingTimeInMillis: () => 1000
    //};
    //const mockContext = {};
    //const result = await handler(mockCtx);
  });
});
