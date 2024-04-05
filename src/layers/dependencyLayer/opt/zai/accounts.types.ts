export interface ZaiAccount {
  id: number;
  created_at: string;
  updated_at: string;
  currency_id: number;
  account_type_id: number;
  amount: number;
  legal_entity_id: number;
  uuid: string;
  links: {
    self: null | string;
  };
}

export interface ZaiAccountsWebhookEvent {
  accounts?: ZaiAccount;
}
