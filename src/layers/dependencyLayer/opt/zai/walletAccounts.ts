import {
  GetWalletAccountNppDetailsResponse,
  PayBillRequest,
  PayBillResponse,
  WalletAccountsResponse,
} from '/opt/zai/walletAccounts.types';

const { ZAI_DOMAIN } = process.env;

// get wallet
export const getWallet = async (
  zaiAuthToken: string,
  walletId: string
): Promise<WalletAccountsResponse> => {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
  };

  const response = await fetch(
    `${ZAI_DOMAIN}/wallet_accounts/${walletId}`,
    options
  );

  if (!response.ok) {
    console.log('ERROR getWallet: ', JSON.stringify(response));
    throw new Error(`ERROR getWallet: ${response.status}`);
  }

  return response.json();
};

// get wallet account npp details
export const getWalletAccountNppDetails = async (
  zaiAuthToken: string,
  walletAccountId: string
): Promise<GetWalletAccountNppDetailsResponse> => {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
  };

  const response = await fetch(
    `${ZAI_DOMAIN}/wallet_accounts/${walletAccountId}/npp_details`,
    options
  );

  if (!response.ok) {
    console.log('ERROR getWalletAccountNppDetails: ', JSON.stringify(response));
    throw new Error(`ERROR getWalletAccountNppDetails: ${response.status}`);
  }

  return response.json();
};

// pay a bill
export const payBill = async (
  zaiAuthToken: string,
  walletAccountId: string,
  bill: PayBillRequest
): Promise<PayBillResponse> => {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
    body: JSON.stringify(bill),
  };

  const response = await fetch(
    `${ZAI_DOMAIN}/wallet_accounts/${walletAccountId}/bill_payment`,
    options
  );

  if (!response.ok) {
    const error = await response.text();
    console.log('ERROR payBill: ', JSON.stringify(error));
    throw new Error(`ERROR payBill: ${JSON.stringify(error)}`);
  }

  return response.json();
};
