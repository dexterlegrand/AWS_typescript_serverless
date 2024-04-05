const { ZAI_DOMAIN } = process.env;

interface Links {
  self: string;
  users: string;
}

export interface Card {
  type: string;
  full_name: string;
  number: string;
  expiry_month: string;
  expiry_year: string;
  links: Links;
}

interface CardAccounts {
  active: boolean;
  created_at: string;
  updated_at: string;
  id: string;
  currency: string;
  cvv_verified: boolean;
  verification_status: 'verified' | 'not_verified';
  card: Card;
}

interface GetCardAccountResponse {
  card_accounts: CardAccounts;
}

export const getCardAccount = async (
  zaiAuthToken: string,
  accountId: string
): Promise<GetCardAccountResponse> => {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
  };

  const response = await fetch(
    `${ZAI_DOMAIN}/card_accounts/${accountId}`,
    options
  );

  if (!response.ok) {
    const error = await response.text();
    console.log('ERROR getCardAccount: ', JSON.stringify(error));
    throw new Error(`ERROR getCardAccount: ${JSON.stringify(error)}`);
  }

  return response.json();
};
