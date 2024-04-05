// https://developer.hellozai.com/docs/simulate-payto-apis-in-pre-live
import {
  GetFailedPayToPaymentResponse,
  GetPayToAgreementResponse,
  PayToAgreementResponse,
  ValidatePayToAgreementRequest,
} from '/opt/zai/payto.types';

const { ZAI_DOMAIN } = process.env;

export const validatePayToAgreement = async (
  zaiAuthToken: string,
  request: ValidatePayToAgreementRequest
): Promise<PayToAgreementResponse> => {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
    body: JSON.stringify(request),
  };

  const response = await fetch(
    `${ZAI_DOMAIN}/payto/agreements/validate`,
    options
  );
  if (!response.ok) {
    console.log('ERROR validatePayToAgreement: ', JSON.stringify(response));
    throw new Error(`ERROR validatePayToAgreement: ${response.status}`);
  }
  return response.json();
};

export const getPayToAgreement = async (
  zaiAuthToken: string,
  agreementId: string
): Promise<GetPayToAgreementResponse> => {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
  };

  const response = await fetch(
    `${ZAI_DOMAIN}/payto/agreements/${agreementId}`,
    options
  );
  if (!response.ok) {
    console.log('ERROR getPayToAgreement: ', JSON.stringify(response));
    throw new Error(`ERROR getPayToAgreement: ${response.status}`);
  }
  return response.json();
};

export const createPayToAgreement = async (
  zaiAuthToken: string,
  agreementId: string
): Promise<PayToAgreementResponse> => {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
  };

  const response = await fetch(
    `${ZAI_DOMAIN}/payto/agreements/${agreementId}/create`,
    options
  );
  if (!response.ok) {
    console.log('ERROR createPayToAgreement: ', JSON.stringify(response));
    throw new Error(`ERROR createPayToAgreement: ${response.status}`);
  }
  return response.json();
};

export interface InitiatePayToPaymentRequest {
  priority: 'ATTENDED' | 'UNATTENDED';
  payment_info: {
    instructed_amount: string;
    last_payment: boolean;
    end_to_end_id?: string;
    remittance_info?: string;
    unique_superannuation_id?: string;
    unique_superannuation_code?: string;
  };
  retry_info?: {
    payment_request_uuid: string;
  };
}

export interface InitiatePayToPaymentResponse {
  payment_request_uuid: string;
  agreement_uuid: string;
  instruction_id: string;
  status: 'PENDING_PAYMENT_INITIATION' | 'PAYMENT_INITIATION_REJECTED';
  created_at: string;
  updated_at: string;
  agreement_id: string;
}

export const initiatePayToPayment = async (
  zaiAuthToken: string,
  agreementId: string,
  request: InitiatePayToPaymentRequest
): Promise<InitiatePayToPaymentResponse> => {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
    body: JSON.stringify(request),
  };

  const response = await fetch(
    `${ZAI_DOMAIN}/payto/agreements/${agreementId}/payment_requests/initiate`,
    options
  );

  if (!response.ok) {
    const error = await response.text();
    console.log('ERROR initiatePayToPayment: ', JSON.stringify(error));
    throw new Error(`ERROR initiatePayToPayment: ${JSON.stringify(error)}`);
  }

  return response.json();
};

export const getFailedPayToPayment = async (
  zaiAuthToken: string,
  instructionId: string
): Promise<GetFailedPayToPaymentResponse> => {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${zaiAuthToken}`,
    },
  };

  const response = await fetch(
    `${ZAI_DOMAIN}/payment_details/failed/${instructionId}`,
    options
  );
  if (!response.ok) {
    const error = await response.text();
    console.log('ERROR getFailedPayToPayment: ', JSON.stringify(error));
    throw new Error(`ERROR getFailedPayToPayment: ${JSON.stringify(error)}`);
  }
  return response.json();
};
