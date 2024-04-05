export interface WalletAccountsResponse {
  wallet_accounts: {
    active: boolean;
    created_at: string; // date-time
    updated_at: string; // date-time
    id: string;
    currency: string;
    verification_status: 'verified' | 'not_verified';
    balance: number;
    links: {
      self: any; // object with additional fields
      users: any; // object with additional fields
      batch_transactions: any; // object with additional fields
      transactions: any; // object with additional fields
      bpay_details: any; // object with additional fields
      npp_details: any; // object with additional fields
      virtual_accounts: any; // object with additional fields
    };
  };
}

interface MarketplacePayId {
  pay_id: string;
  type: string;
}

interface NppDetails {
  pay_id: string;
  marketplace_pay_ids: MarketplacePayId[];
  reference: string;
  amount: string;
  currency: string;
}

export interface GetWalletAccountNppDetailsResponse {
  id: string;
  wallet_accounts: {
    npp_details: NppDetails;
  };
}

export interface PayBillRequest {
  account_id: string;
  amount: number;
  reference_id: string;
}

export interface PayBillResponse {
  disbursements: {
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
  };
}
