const { ZAI_DOMAIN } = process.env;
// fee_type_id:
//1: Fixed
//2: Percentage
//3: Percentage with Cap
//4: Percentage with Min
export interface CreateZaiFeeRequest {
  name: string; // Name
  fee_type_id: string; // Fee type ID
  amount: number; // Amount in cents
  cap?: number; // Cap the Fee
  min?: number; // Minimum Fee
  max?: number; // Maximum Fee
  to: 'buyer' | 'seller' | 'cc' | 'int_wire'; // Who pays the Fee
}

export interface ZaiFeeResponse {
  fees: {
    id: string; // Fee ID
    created_at: string; // Creation date-time
    updated_at: string; // Update date-time
    name: string; // Name
    fee_type_id: string; // Fee type ID
    amount: string; // Amount in cents
    cap?: string; // Cap the Fee
    min?: string; // Minimum Fee
    max?: string; // Maximum Fee
    to: string; // Who pays the Fee
    calculated_fee?: number; // Calculated fee, only shown if an item amount is passed
  };
}

export const createZaiFee = async (
  zaiAuthToken: string,
  fee: CreateZaiFeeRequest
): Promise<ZaiFeeResponse> => {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
    body: JSON.stringify(fee),
  };

  const response = await fetch(`${ZAI_DOMAIN}/fees`, options);

  if (!response.ok) {
    console.log('ERROR createZaiFee: ', JSON.stringify(response));
    throw new Error(`ERROR createZaiFee: ${response.status}`);
  }

  return response.json();
};

export interface GetZaiFeeResponse {
  fees: {
    id: string; // Fee ID
    created_at: string; // Creation date-time
    updated_at: string; // Update date-time
    name: string; // Name
    fee_type_id: string; // Fee type ID
    amount: string; // Amount in cents
    cap?: string; // Cap the Fee
    min?: string; // Minimum Fee
    max?: string; // Maximum Fee
    to: string; // Who pays the Fee
    calculated_fee?: number; // Calculated fee, only shown if an item amount is passed
  };
}

export const getZaiFee = async (zaiAuthToken: string, feeId: string) => {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
  };

  const response = await fetch(`${ZAI_DOMAIN}/fees/${feeId}`, options);

  if (!response.ok) {
    const error = await response.text();
    console.log('ERROR getZaiFee: ', JSON.stringify(error));
    throw new Error(`ERROR getZaiFee: ${JSON.stringify(error)}`);
  }

  return response.json();
};

export interface ListZaiFeeRequest {
  limit: number; // Number of records to retrieve
  offset: number; // Number of records to offset for pagination
}

export interface ListZaiFeeResponse {
  fees: {
    id: string; // Fee ID
    created_at: string; // Creation date-time
    updated_at: string; // Update date-time
    name: string; // Name
    fee_type_id: string; // Fee type ID
    amount: string; // Amount in cents
    cap?: string; // Cap the Fee
    min?: string; // Minimum Fee
    max?: string; // Maximum Fee
    to: string; // Who pays the Fee
    calculated_fee?: number; // Calculated fee, only shown if an item amount is passed
  }[];
  links: {
    self: string; // Link to the current page of fees
  };
  meta: {
    limit: number; // Number of records retrieved
    offset: number; // Number of records offset for pagination
    total: number; // Total number of records
  };
}

export const listZaiFees = async (
  zaiAuthToken: string,
  query: ListZaiFeeRequest
): Promise<ListZaiFeeResponse> => {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
  };

  const response = await fetch(
    `${ZAI_DOMAIN}/fees?limit=${query.limit}&offset=${query.offset}`,
    options
  );

  if (!response.ok) {
    const error = await response.text();
    console.log('ERROR listZaiFees: ', JSON.stringify(error));
    throw new Error(`ERROR listZaiFees: ${JSON.stringify(error)}`);
  }

  return response.json();
};
