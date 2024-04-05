interface Links {
  self: string;
  users: string;
  fees: string;
  wallet_accounts: string;
  card_accounts: string;
  paypal_accounts: string;
  bank_accounts: string;
  items: string;
  marketplaces: string;
  npp_payin_transaction_detail: string;
  supplementary_data: string;
}

interface PayeeDetails {
  debtor_name: string;
  debtor_legal_name: string;
  debtor_bsb: string;
  debtor_account: string;
  clearing_system_transaction_id: string;
  remittance_information: string;
  pay_id: string;
  pay_id_type: string;
  end_to_end_id: string;
  npp_payin_internal_id: string;
}

interface RelatedTransaction {
  id: string;
  account_id: string;
  account_type: string;
  user_id: string;
  user_name: string;
  item_name: string;
  payee_details: PayeeDetails;
}

interface Related {
  transactions: RelatedTransaction[];
}

interface Marketplace {
  group_name: string;
  name: string;
  short_name: string;
  uuid: string;
  related: Related;
}

export interface ZaiTransaction {
  id: string;
  reference_id: string;
  created_at: string; // date-time
  updated_at: string; // date-time
  description: string;
  payee_name: string;
  type: string;
  type_method: string;
  state: string;
  user_id: string;
  user_name: string;
  item_name: string;
  dynamic_descriptor: string;
  account_id: string;
  account_type: string;
  amount: string;
  currency: string;
  debit_credit: string;
  marketplace: Marketplace;
  links: Links;
}

export interface ZaiTransactionWebhookEvent {
  transactions: ZaiTransaction;
}

export interface ZaiTransactionFailureAdvice {
  event_type: string;
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
  links: Links;
}

interface NppDetails {
  pay_id: string;
  pay_id_type: string;
  clearing_system_transaction_id: string;
  end_to_end_id: string;
  cdtr_ref_inf: string;
  ultm_cdtr_id: string;
  ultm_cdtr_scheme_nm: string;
  ultm_cdtr_nm: string;
  ctgy_purp: string;
  debtor_legal_name: string;
  instruction_id: string;
  agreement_id: string;
  agreement_uuid: string;
}

interface Links {
  self: string;
  agreements: string;
}

export interface ZaiTransactionFailureAdviceWebhookEvent {
  transaction_failure_advice: ZaiTransactionFailureAdvice;
}
