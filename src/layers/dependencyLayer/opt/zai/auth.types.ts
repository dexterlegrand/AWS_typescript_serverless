export interface CreateZaiAuthTokenResponse {
  access_token: string; //JWT issued by AWS Cognito.
  expires_in: number; // Lifetime of access token in seconds.
  token_type: string; //Authorization header value prefix. This is a constant.
  token_expires_at: number; // Unix timestamp of when the token expires.
}

export interface CreateZaiPaymentMethodTokenRequest {
  token_type: 'bank' | 'card';
  user_id: string;
}

export interface CreateZaiPaymentMethodTokenResponse {
  token_auth: {
    user_id: string;
    token_type: string;
    token: string;
  };
}
