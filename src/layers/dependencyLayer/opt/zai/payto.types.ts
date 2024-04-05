export interface ValidatePayToAgreementRequest {
  user_external_id: string; // buyer user id
  priority: 'ATTENDED' | 'UNATTENDED';
  response_requested_by?: string; // provide dateTime iso to cancel request earlier than the default 5 days
  agreement_info: AgreementInfo;
  debtor_info: DebtorInfo;
  creditor_info: CreditorInfo;
  payment_initiator_info: PaymentInitiatorInfo;
  payment_terms: PaymentTerms;
}

interface AgreementInfo {
  description?: string;
  short_description?: string;
  purpose_code:
    | 'MORT' //Mortgage payments, including payments for a home/business loan
    | 'UTIL' //Utility payments such as gas, electricity, water etc
    | 'LOAN' //Loan payments, other than mortgage payments
    | 'DEPD' //Dependant support payments (e.g. child support)
    | 'RETL' //Retail payments, including e-commerce and online shopping (payments are for provision of goods or services)
    | 'SALA' //Salary payments
    | 'PERS' //Personal payments (payments to an individual which excludes any payments for salary and superannuation purposes)
    | 'GOVT' //Government payments
    | 'PENS' //Pension payments (superannuation payments)
    | 'TAXS' //Tax payments (tax payments to Australian Taxation Office (ATO) and Australian Commonwealth, State, Territory, or other local government body)
    | 'OTHR'; //Other service related payments (when there is no other appropriate purpose code)
  agreement_type: 'AUPM' | 'MGCR';
  automatic_renewal: boolean;
  validity_start_date: string;
  validity_end_date?: string;
  transfer_arrangement?: string;
}

interface DebtorInfo {
  debtor_account_details: DebtorAccountDetails;
  debtor_details: DebtorDetails;
}

interface DebtorAccountDetails {
  account_id_type: 'BBAN' | 'PAYID';
  account_id?: string;
  payid_details?: PayIdDetails;
}

interface PayIdDetails {
  payid_type: 'TELE' | 'EMAL' | 'AUBN' | 'ORGN';
  payid: string;
}

interface DebtorDetails {
  debtor_name: string;
  debtor_type: 'ORGN' | 'PERS';
  ultimate_debtor_name?: string;
  debtor_id?: string;
  debtor_id_type?: string;
  debtor_reference?: string;
}

interface CreditorInfo {
  ultimate_creditor_name: string;
  creditor_reference?: string;
}

interface PaymentInitiatorInfo {
  initiator_id: string;
  initiator_id_type_code: string;
  initiator_legal_name: string;
  initiator_name: string;
}

interface PaymentTerms {
  payment_amount_info: PaymentAmountInfo;
  first_payment_info?: PaymentDateInfo;
  last_payment_info?: PaymentDateInfo;
  maximum_amount_info?: MaximumAmountInfo;
  payment_executed_not_before_time?: string;
  point_in_time?: string;
  count_per_period?: string;
  frequency:
    | 'ADHOC'
    | 'INTRDY'
    | 'DAILY'
    | 'WEEKLY'
    | 'FRTNLY'
    | 'MNTHLY'
    | 'QURTLY'
    | 'HFYRLY'
    | 'YEARLY';
}

interface PaymentAmountInfo {
  amount: string;
  currency: 'AUD';
  type: 'FIXE' | 'BALN' | 'USGB' | 'VARI';
}

interface PaymentDateInfo {
  amount: string;
  currency: 'AUD';
  date: string;
}

interface MaximumAmountInfo {
  amount: string;
  currency: 'AUD';
}

export interface PayToAgreementResponse {
  agreement_uuid: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface GetPayToAgreementResponse {
  agreement_uuid: string;
  user_external_id: string;
  status:
    | 'PENDING_VALIDATION'
    | 'VALIDATED'
    | 'VALIDATION_FAILED'
    | 'PENDING_CREATION'
    | 'CREATED'
    | 'CREATION_FAILED'
    | 'ACTIVE'
    | 'SUSPENDED'
    | 'CANCELLED';
  status_description: string;
  status_reason_code: string;
  status_reason_description: string;
  created_at: string;
  updated_at: string;
  agreement_info: AgreementInfoResponse;
}

interface AgreementInfoResponse {
  agreement_id: string;
  description?: string;
  short_description?: string;
  purpose_code:
    | 'MORT'
    | 'UTIL'
    | 'LOAN'
    | 'DEPD'
    | 'RETL'
    | 'SALA'
    | 'PERS'
    | 'GOVT'
    | 'PENS'
    | 'TAXS'
    | 'OTHR';
  agreement_type: 'AUPM' | 'MGCR';
  automatic_renewal: boolean;
  validity_start_date: string;
  validity_end_date?: string;
  transfer_arrangement?: string;
  debtor_info: DebtorInfoResponse;
  creditor_info: CreditorInfoResponse;
  payment_initiator_info: PaymentInitiatorInfoResponse;
  payment_terms: PaymentTermsResponse;
}

interface DebtorInfoResponse {
  debtor_account_details: DebtorAccountDetailsResponse;
  debtor_details: DebtorDetailsResponse;
}

interface DebtorAccountDetailsResponse {
  account_id_type: 'BBAN' | 'PAYID';
  account_id?: string;
  payid_details?: PayIdDetailsResponse;
}

interface PayIdDetailsResponse {
  payid_type: 'TELE' | 'EMAL' | 'AUBN' | 'ORGN';
  payid: string;
  payid_name?: string;
}

interface DebtorDetailsResponse {
  debtor_name: string;
  debtor_type: 'ORGN' | 'PERS';
  ultimate_debtor_name?: string;
  debtor_id?: string;
  debtor_id_type?: string;
  debtor_reference?: string;
}

interface CreditorInfoResponse {
  creditor_account_details: CreditorAccountDetailsResponse;
  creditor_details: CreditorDetailsResponse;
}

interface CreditorAccountDetailsResponse {
  account_id: string;
  account_id_type: 'BBAN' | 'PAYID';
}

interface CreditorDetailsResponse {
  creditor_id: string;
  creditor_id_type: string;
  creditor_name: string;
  creditor_type: 'ORGN' | 'PERS';
  ultimate_creditor_name?: string;
  creditor_reference?: string;
}

interface PaymentInitiatorInfoResponse {
  initiator_id: string;
  initiator_id_type_code: string;
  initiator_legal_name: string;
  initiator_name: string;
}

interface PaymentTermsResponse {
  payment_amount_info: PaymentAmountInfoResponse;
  first_payment_info?: PaymentDateInfoResponse;
  last_payment_info?: PaymentDateInfoResponse;
  maximum_amount_info?: MaximumAmountInfoResponse;
  payment_executed_not_before_time?: string;
  point_in_time?: string;
  count_per_period?: string;
  frequency:
    | 'ADHOC'
    | 'INTRDY'
    | 'DAILY'
    | 'WEEKLY'
    | 'FRTNLY'
    | 'MNTHLY'
    | 'QURTLY'
    | 'HFYRLY'
    | 'YEARLY';
}

interface PaymentAmountInfoResponse {
  amount: string;
  currency: 'AUD';
  type: 'FIXE' | 'BALN' | 'USGB' | 'VARI';
}

interface PaymentDateInfoResponse {
  amount: string;
  currency: 'AUD';
  date: string;
}

interface MaximumAmountInfoResponse {
  amount: string;
  currency: 'AUD';
}

export interface NppDetails {
  pay_id: string;
  pay_id_type: string;
  clearing_system_transaction_id: string;
  end_to_end_id: string;
  cdtr_ref_inf: string;
  ultm_cdtr_id: string;
  ultmt_cdtr_schme_nm: string;
  ultm_cdtr_nm: string;
  ctgy_purp: string;
  debtor_legal_name: string;
}

export interface Links {
  self: string;
  agreements: string;
}

export interface GetFailedPayToPaymentResponse {
  id: string;
  debtor_name: string;
  debtor_bsb: string;
  debtor_account: string;
  creditor_account: string;
  creditor_name: string;
  remittance_information: string;
  type: string;
  type_method: string;
  error_message: string;
  npp_details: NppDetails;
  instruction_id?: string;
  agreement_id?: string;
  agreement_uuid?: string;
  links: Links;
}
export interface ZaiPaytoAgreementWebhook {
  payto_agreements: {
    event_type: string;
    id: string;
    original_request: ValidatePayToAgreementRequest;
    data: GetPayToAgreementResponse;
    message: string;
  };
}

export interface ZaiPaytoPaymentsWebhookEvent {
  payto_payments: {
    event_type: string;
    id: string;
    original_request: OriginalRequest;
    data: PayToPaymentData;
    message: string;
  };
}

interface OriginalRequest {
  priority: string;
  payment_info: PaymentInfo;
  retry_info: RetryInfo;
}

interface PaymentInfo {
  instructed_amount: string;
  last_payment: boolean;
  end_to_end_id: string;
  remittance_info: string;
  unique_superannuation_id: string;
  unique_superannuation_code: string;
}

interface RetryInfo {
  payment_request_uuid: string;
}

interface PayToPaymentData {
  payment_request_uuid: string;
  instruction_id: string;
  agreement_uuid: string;
  agreement_id: string;
  status: string;
  status_description: string;
  payment_reconciled: null;
  created_at: string;
  updated_at: string;
  payment_info: PaymentInfo;
}
