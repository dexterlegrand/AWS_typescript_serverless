const { ENV, ZAI_WEBHOOK_DOMAIN } = process.env;
import { ZaiMeta } from '/opt/zai/config';
import * as crypto from 'crypto';

export const generateWebhookSecret = () => {
  if (!ENV) {
    throw new Error('cannot create webhook signature secret, ENV not set');
  }
  const prefix = `sk${(ENV ?? '').toLowerCase()}_`;
  const prefixBytes = Buffer.from(prefix).length;
  const randomBytesLength = 32 - prefixBytes;
  const randomBytes = crypto
    .randomBytes(randomBytesLength)
    .toString('hex')
    .slice(0, randomBytesLength);
  return `${prefix}${randomBytes}`;
};

// create zai webhook
export interface CreateZaiWebhookRequest {
  url: string; // URL to which the webhook will notify
  object_type: string; // Object or entity to which the webhook refers
  description?: string; // Description to identify the webhook
}

export interface GetZaiWebhookResponse {
  uuid: string; // Webhook UUID
  object_type: string; // Object or entity to which the webhook refers
  http_method: string; // HTTP method used by the webhook
  url: string; // URL to which the webhook will notify
  description: string; // Description to identify the webhook
  enabled: string; // Whether the webhook is enabled
  created_at: string; // Creation date-time
  updated_at: string; // Update date-time
  links: {
    self: string; // Link to the webhook
    webhooks: string; // Link to the webhooks
  };
}

export const createZaiWebhook = async (
  zaiAuthToken: string,
  webhook: CreateZaiWebhookRequest
): Promise<GetZaiWebhookResponse> => {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
    body: JSON.stringify(webhook),
  };

  const response = await fetch(`${ZAI_WEBHOOK_DOMAIN}/webhooks`, options);

  if (!response.ok) {
    const error = await response.text();
    console.log('ERROR createZaiWebhook: ', JSON.stringify(error));
    throw new Error(`ERROR createZaiWebhook: ${JSON.stringify(error)}`);
  }
  return response.json();
};

// create zai webhook secret
export interface CreateZaiWebhookSecretRequest {
  secret_key: string; // Secret to secure the webhook
}

export const createZaiWebhookSecret = async (
  zaiAuthToken: string,
  webhookSecret: CreateZaiWebhookSecretRequest
) => {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
    body: JSON.stringify(webhookSecret),
  };
  const response = await fetch(
    `${ZAI_WEBHOOK_DOMAIN}/webhooks/secret_key`,
    options
  );

  if (!response.ok) {
    const error = await response.text();
    console.log('ERROR createZaiWebhookSecret: ', JSON.stringify(error));
    throw new Error(`ERROR createZaiWebhookSecret: ${JSON.stringify(error)}`);
  }
  return response.json();
};

export interface ListWebhooksResponse {
  webhooks: GetZaiWebhookResponse[];
  meta: ZaiMeta;
}

export const listZaiWebhooks = async (
  zaiAuthToken: string
): Promise<ListWebhooksResponse[]> => {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
  };

  const response = await fetch(`${ZAI_WEBHOOK_DOMAIN}/webhooks`, options);

  if (!response.ok) {
    const error = await response.text();
    console.log('ERROR listZaiWebhooks: ', JSON.stringify(error));
    throw new Error(`ERROR listZaiWebhooks: ${JSON.stringify(error)}`);
  }
  return response.json();
};
