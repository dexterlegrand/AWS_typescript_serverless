import { Api } from '/opt/frankieone/frankieone.types';
const { FRANKIEONE_API_DOMAIN, FRANKIEONE_API_KEY, FRANKIEONE_CUSTOMER_ID } =
  process.env;

export const initApi = () => {
  const api = new Api({
    baseUrl: `${FRANKIEONE_API_DOMAIN}/compliance/v1.2`,
    securityWorker: () => ({
      headers: {
        //'Accept': 'application/json',
        //'Content-Type': 'application/json',
        'X-Frankie-CustomerID': FRANKIEONE_CUSTOMER_ID ?? '',
        api_key: FRANKIEONE_API_KEY ?? '',
      },
    }),
  });

  console.log('api: ', api);

  return api;
};

//export const getFrankieOneEntity = async (entityId: string): Promise<EntityResultObject> => {
//  //const url = `${FRANKIEONE_API_DOMAIN}/compliance/v1.2/entity/${entityId}`;
//  //
//  //const options = {
//  //  method: 'GET',
//  //  headers: {
//  //    accept: 'application/json',
//  //    'content-type': 'application/json',
//  //    'X-Frankie-CustomerID': FRANKIEONE_CUSTOMER_ID ?? '',
//  //    api_key: FRANKIEONE_API_KEY ?? ''
//  //  }
//  //};
//  //
//  //const response = await fetch(url, options);
//  //if (!response.ok) {
//  //  const error = await response.text();
//  //  console.log('ERROR getFrankieOneEntity: ', JSON.stringify(error));
//  //  throw new Error(error);
//  //}
//  //
//  //return response.json();
//}
//
//export const createFrankieOneEntity = async (data: EntityObject): Promise<EntityResultObject> => {
//  const url = `${FRANKIEONE_API_DOMAIN}/compliance/v1.2/entity`;
//
//  const options = {
//    method: 'POST',
//    headers: {
//      accept: 'application/json',
//      'content-type': 'application/json',
//      'X-Frankie-CustomerID': FRANKIEONE_CUSTOMER_ID ?? '',
//      api_key: FRANKIEONE_API_KEY ?? ''
//    },
//    body: JSON.stringify({
//      data
//    })
//  };
//
//  const response = await fetch(url, options);
//  if (!response.ok) {
//    const error = await response.text();
//    console.log('ERROR createFrankieOneEntity: ', JSON.stringify(error));
//    throw new Error(error);
//  }
//
//  return response.json();
//}
//
//export const updateFrankieOneEntity = async (entityId: string, data: EntityObject, query?: {
//  /** Disable check result invalidation for this update request. */
//  noInvalidate?: boolean;
//}): Promise<EntityResultObject> => {
//  const url = `${FRANKIEONE_API_DOMAIN}/compliance/v1.2/entity/${entityId}`;
//
//  const options = {
//    method: 'PUT',
//    headers: {
//      accept: 'application/json',
//      'content-type': 'application/json',
//      'X-Frankie-CustomerID': FRANKIEONE_CUSTOMER_ID ?? '',
//      api_key: FRANKIEONE_API_KEY ?? ''
//    },
//    body: JSON.stringify({
//      data
//    })
//  };
//
//  const response = await fetch(url, options);
//  if (!response.ok) {
//    const error = await response.text();
//    console.log('ERROR updateFrankieOneEntity: ', JSON.stringify(error));
//    throw new Error(error);
//  }
//
//  return response.json();
//}
