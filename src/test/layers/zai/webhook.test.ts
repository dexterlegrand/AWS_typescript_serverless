// unit test for webhook.ts
import { generateWebhookSecret } from '../../../layers/dependencyLayer/opt/zai/webhook';
import { describe, it } from 'vitest';

describe('webhook', () => {
  it('Should generate webhook secret correctly', async () => {
    const secret = generateWebhookSecret();
    console.log('secret: ', secret);
    expect(secret).toBeDefined();

    // ensure secret is 32 bytes
    expect(secret.length).toBe(32);

    // ensure secret only has ascii characters
    expect(/^[ -~]*$/.test(secret)).toBe(true);
  });
});
