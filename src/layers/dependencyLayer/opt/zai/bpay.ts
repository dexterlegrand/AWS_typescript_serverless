const { ZAI_DOMAIN } = process.env;
import {
  CreateBpayAccountRequest,
  BpayAccountResponse,
} from '/opt/zai/bpay.types';
// get bpay account
export const getBpayAccount = async (
  zaiAuthToken: string,
  bpayAccountId: string
): Promise<BpayAccountResponse> => {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
  };

  const response = await fetch(
    `${ZAI_DOMAIN}/bpay_accounts/${bpayAccountId}`,
    options
  );

  if (!response.ok) {
    console.log('ERROR getBpayAccount: ', JSON.stringify(response));
    throw new Error(`ERROR getBpayAccount: ${response.status}`);
  }

  return response.json();
};

// create bpay account

export const createBpayAccount = async (
  zaiAuthToken: string,
  bpayAccount: CreateBpayAccountRequest
): Promise<BpayAccountResponse> => {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
    body: JSON.stringify(bpayAccount),
  };

  const response = await fetch(`${ZAI_DOMAIN}/bpay_accounts`, options);

  if (!response.ok) {
    const error = await response.text();
    console.log('ERROR createBpayAccount: ', JSON.stringify(error));
    throw new Error(`ERROR createBpayAccount: ${JSON.stringify(error)}`);
  }

  return response.json();
};
