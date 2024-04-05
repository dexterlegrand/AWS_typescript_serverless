import {
  CreateZaiItemRequest,
  CreateZaiItemResponse,
  CreateZaiPaymentRequest,
  CreateZaiPaymentResponse,
  GetZaiItemResponse,
  UpdateZaiItemRequest,
  ZaiUpdateItemResponse,
} from '/opt/zai/items.types';

const { ZAI_DOMAIN } = process.env;

// get item
export const getZaiItem = async (
  zaiAuthToken: string,
  itemId: string
): Promise<GetZaiItemResponse> => {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
  };

  const response = await fetch(`${ZAI_DOMAIN}/items/${itemId}`, options);

  if (!response.ok) {
    const error = await response.text();
    console.log('ERROR getZaiItem: ', JSON.stringify(error));
    throw new Error(error);
  }

  return response.json();
};

// Create an Item. Items require two Users, a buyer and a seller. The buyer_id and seller_id are your unique user identifiers.
export const createZaiItem = async (
  zaiAuthToken: string,
  item: CreateZaiItemRequest
): Promise<CreateZaiItemResponse> => {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
    body: JSON.stringify(item),
  };

  const response = await fetch(`${ZAI_DOMAIN}/items`, options);

  console.log('response: ', JSON.stringify(response));

  if (!response.ok) {
    const error = await response.text();
    console.log('error: ', error);
    console.log('response.status: ', response.status);
    console.log(error);
    throw new Error(error);
  }

  return response.json();
};

export const makeZaiPayment = async (
  zaiAuthToken: string,
  itemId: string,
  item: CreateZaiPaymentRequest
): Promise<CreateZaiPaymentResponse> => {
  const options = {
    method: 'PATCH',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
    body: JSON.stringify(item),
  };

  const response = await fetch(
    `${ZAI_DOMAIN}/items/${itemId}/make_payment`,
    options
  );

  if (!response.ok) {
    const error = await response.text();
    console.log('ERROR makeZaiPayment: ', JSON.stringify(error));
    throw new Error(error);
  }

  return response.json();
};

// update item

export const updateZaiItem = async (
  zaiAuthToken: string,
  itemId: string,
  item: UpdateZaiItemRequest
): Promise<ZaiUpdateItemResponse> => {
  const options = {
    method: 'PUT',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
    body: JSON.stringify(item),
  };

  const response = await fetch(`${ZAI_DOMAIN}/items/${itemId}`, options);

  if (!response.ok) {
    const error = await response.text();
    console.log('ERROR updateZaiItem: ', JSON.stringify(error));
    throw new Error(error);
  }

  return response.json();
};
