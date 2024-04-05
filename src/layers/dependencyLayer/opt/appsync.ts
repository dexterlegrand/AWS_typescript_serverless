import { Sha256 } from '@aws-crypto/sha256-js';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { HttpRequest } from '@aws-sdk/protocol-http';

import { Request, default as fetch } from 'node-fetch';

const { API_GRAPHQLAPIENDPOINT, AWS_REGION } = process.env;

export const appSyncRequest = async (bodyRequest: Record<any, any>) => {
  const endpoint = new URL(API_GRAPHQLAPIENDPOINT ?? '');

  const signer = new SignatureV4({
    credentials: defaultProvider(),
    region: AWS_REGION ?? '',
    service: 'appsync',
    sha256: Sha256,
  });

  const requestToBeSigned = new HttpRequest({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      host: endpoint.host,
    },
    hostname: endpoint.host,
    body: JSON.stringify(bodyRequest),
    path: endpoint.pathname,
  });

  const signed = await signer.sign(requestToBeSigned);
  const request = new Request(endpoint, signed);

  let statusCode = 200;
  let body;
  let response;
  try {
    response = await fetch(request);
    body = await response.json();
    if (body.errors) statusCode = 400;
  } catch (err: any) {
    statusCode = 500;
    body = {
      errors: [
        {
          status: err.status,
          message: err.message,
          stack: err.stack,
        },
      ],
    };
  }

  return {
    statusCode,
    body: JSON.stringify(body),
  };
};
