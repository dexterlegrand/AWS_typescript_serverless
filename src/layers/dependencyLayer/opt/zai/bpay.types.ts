export interface CreateBpayAccountRequest {
  user_id: string;
  account_name: string;
  biller_code: number;
  bpay_crn: string;
}

export interface BpayAccountResponse {
  bpay_accounts: {
    active: boolean;
    created_at: string; // date-time
    updated_at: string; // date-time
    id: string;
    currency: string;
    verification_status: 'verified' | 'not_verified';
    bpay_details: {
      account_name: string;
      biller_code: number;
      biller_name: string;
      crn: number;
      links: {
        self: string;
        users: string;
      };
    };
  };
}
