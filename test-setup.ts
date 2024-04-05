import { vi } from 'vitest';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '.env') });

// env variables
process.env.AUTH_IDENTITYPOOLID = 'us-east-1:xxxxxxxx-xxxx';
process.env.AUTH_USERPOOLID = 'us-east-1_XXXXXXXX';
process.env.TABLE_USER = 'user-table';

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
