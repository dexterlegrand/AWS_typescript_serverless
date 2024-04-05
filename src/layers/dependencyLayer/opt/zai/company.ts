import {
  CreateZaiCompanyRequest,
  CreateZaiCompanyResponse,
  UpdateZaiCompanyRequest,
  UpdateZaiCompanyResponse,
} from '/opt/zai/company.types';

export const getZaiCompany = async (
  zaiAuthToken: string,
  companyId: string
) => {
  const { ZAI_DOMAIN } = process.env;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
  };

  const response = await fetch(`${ZAI_DOMAIN}/companies/${companyId}`, options);

  if (!response.ok) {
    console.log('ERROR getZaiCompany: ', JSON.stringify(response));
    throw new Error(`ERROR getZaiCompany: ${response.status}`);
  }

  return response.json();
};

export const createZaiCompany = async (
  zaiAuthToken: string,
  company: CreateZaiCompanyRequest
): Promise<CreateZaiCompanyResponse> => {
  const { ZAI_DOMAIN } = process.env;
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
    body: JSON.stringify(company),
  };

  const response = await fetch(`${ZAI_DOMAIN}/companies`, options);

  if (!response.ok) {
    const error = await response.text();
    console.log('ERROR createZaiCompany: ', JSON.stringify(error));
    throw new Error(`ERROR createZaiCompany: ${JSON.stringify(error)}`);
  }

  return response.json();
};

export const updateZaiCompany = async (
  zaiAuthToken: string,
  companyId: string,
  company: UpdateZaiCompanyRequest
): Promise<UpdateZaiCompanyResponse> => {
  const { ZAI_DOMAIN } = process.env;
  const options = {
    method: 'PATCH',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
    body: JSON.stringify(company),
  };

  const response = await fetch(`${ZAI_DOMAIN}/companies/${companyId}`, options);

  if (!response.ok) {
    const error = await response.text();
    console.log('ERROR updateZaiCompany: ', JSON.stringify(error));
    throw new Error(`ERROR updateZaiCompany: ${JSON.stringify(error)}`);
  }

  return response.json();
};
