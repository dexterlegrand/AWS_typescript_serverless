export interface ZaiDisbursement {
  id: string;
  reference_id: string;
  amount: number;
  currency: string;
  batch_id: string;
  cuscal_payment_transaction_id: string;
  created_at: string; // date-time
  updated_at: string; // date-time
  state: string;
  to: string;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_routing_number: string;
  npp_payout_state: string;
  account_name: string;
  biller_name: string;
  biller_code: string;
  crn: string;
  links: {
    transactions: string;
    wallet_accounts: string;
    paypal_accounts: string;
    bank_accounts: string;
    bpay_accounts: string;
    items: string;
    users: string;
  };
  meta: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface ZaiDisbursementWebhookEvent {
  disbursements?: ZaiDisbursement;
}
