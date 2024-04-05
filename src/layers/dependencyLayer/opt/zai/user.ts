import {
  CreateZaiUserRequest,
  CreateZaiUserResponse,
  UpdateZaiUserRequest,
  UpdateZaiUserResponse,
  GetZaiUserResponse,
  SetUserDisbursementRequest,
  SetUserDisbursementResponse,
  GetZaiUserWalletResponse,
} from '/opt/zai';

const { ZAI_DOMAIN } = process.env;

export const getZaiUser = async (
  zaiAuthToken: string,
  userId: string
): Promise<GetZaiUserResponse> => {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
  };

  const response = await fetch(`${ZAI_DOMAIN}/users/${userId}`, options);

  if (!response.ok) {
    console.log('ERROR getZaiUser: ', JSON.stringify(response));
    throw new Error(`ERROR getZaiUser: ${response.status}`);
  }

  return response.json();
};

export const getZaiUserWallet = async (
  zaiAuthToken: string,
  userId: string
): Promise<GetZaiUserWalletResponse> => {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
  };

  const response = await fetch(
    `${ZAI_DOMAIN}/users/${userId}/wallet_accounts`,
    options
  );

  if (!response.ok) {
    console.log('ERROR getZaiUserWallet: ', JSON.stringify(response));
    throw new Error(`ERROR getZaiUserWallet: ${response.status}`);
  }

  return response.json();
};

export const createZaiUser = async (
  zaiAuthToken: string,
  user: CreateZaiUserRequest
): Promise<CreateZaiUserResponse> => {
  console.log('ZAI_DOMAIN:', ZAI_DOMAIN);
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
    body: JSON.stringify(user),
  };

  const response = await fetch(`${ZAI_DOMAIN}/users`, options);

  if (!response.ok) {
    const error = await response.text();
    console.log('ERROR createZaiUser: ', JSON.stringify(error));
    throw new Error(`ERROR createZaiUser: ${JSON.stringify(error)}`);
  }

  console.log('createZaiUser response: ', response);
  return response.json();
};

export const updateZaiUser = async (
  zaiAuthToken: string,
  userId: string,
  user: UpdateZaiUserRequest
): Promise<UpdateZaiUserResponse> => {
  const options = {
    method: 'PATCH',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
    body: JSON.stringify(user),
  };

  const response = await fetch(`${ZAI_DOMAIN}/users/${userId}`, options);

  if (!response.ok) {
    const error = await response.text();
    console.log('ERROR updateZaiUser: ', JSON.stringify(error));
    throw new Error(`ERROR updateZaiUser: ${JSON.stringify(error)}`);
  }

  return response.json();
};

export const setUserDisbursement = async (
  zaiAuthToken: string,
  userId: string,
  disbursement: SetUserDisbursementRequest
): Promise<SetUserDisbursementResponse> => {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
    body: JSON.stringify(disbursement),
  };

  const response = await fetch(
    `${ZAI_DOMAIN}/users/${userId}/disbursement`,
    options
  );

  if (!response.ok) {
    const error = await response.text();
    console.log('ERROR setUserDisbursement: ', JSON.stringify(error));
    throw new Error(`ERROR setUserDisbursement: ${JSON.stringify(error)}`);
  }

  return response.json();
};
