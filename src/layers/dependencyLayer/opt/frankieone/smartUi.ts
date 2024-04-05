const {
  FRANKIEONE_API_KEY,
  FRANKIEONE_CUSTOMER_ID,
  FRANKIEONE_SMARTUI_DOMAIN,
} = process.env;

export interface CreateFrankieOneAuthTokenRequest {
  preset: string;
  referrer: string;
  entityId?: string;
  sub?: string;
}
export const createFrankieOneAuthToken = async ({
  preset,
  referrer,
  entityId,
  sub,
}: CreateFrankieOneAuthTokenRequest) => {
  const creds = `${FRANKIEONE_CUSTOMER_ID}:${FRANKIEONE_API_KEY}`;
  const permissions: any = {
    preset,
  };

  if (entityId) {
    permissions.entityId = entityId;
  }

  if (sub) {
    permissions.reference = sub;
  }

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `machine ${Buffer.from(creds).toString('base64')}`,
    },
    body: JSON.stringify({
      referrer,
      permissions,
    }),
  };

  const response = await fetch(
    `${FRANKIEONE_SMARTUI_DOMAIN}/auth/v2/machine-session`,
    options
  );

  return response.headers.get('token');
};

export const getBusinessLookup = async (query: string): Promise<any> => {
  const response = await fetch(
    `${FRANKIEONE_SMARTUI_DOMAIN}/data/v2/businesses?search=${query}`,
    {
      method: 'POST',
      headers: {
        'X-Frankie-CustomerID': FRANKIEONE_CUSTOMER_ID ?? '',
        api_key: FRANKIEONE_API_KEY ?? '',
        authorization: `${FRANKIEONE_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.log('ERROR getBusinessLookup: ', JSON.stringify(error));
    throw new Error(`ERROR getBusinessLookup: ${JSON.stringify(error)}`);
  }

  return response.json();
};

// create smart ui session token
//export const createSmartUiSession = async (
//  token: string,
//  businessId: string
//): Promise<any> => {
//  const response = await fetch(
//    `${FRANKIEONE_SMARTUI_DOMAIN}/data/v2/businesses/${businessId}/smart-ui-session`,
//    {
//      headers: {
//        Authorization: `Bearer ${token}`,
//      },
//    }
//  );
//
//  if (!response.ok) {
//    const error = await response.text();
//    console.log('ERROR createSmartUiSession: ', JSON.stringify(error));
//    throw new Error(`ERROR createSmartUiSession: ${JSON.stringify(error)}`);
//  }
//
//  return response.json();
//};
