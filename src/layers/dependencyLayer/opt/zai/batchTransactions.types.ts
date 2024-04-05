interface Currency {
  code: string;
}

interface Marketplace {
  group_name: string;
  name: string;
  short_name: string;
  uuid: string;
}

interface AccountExternal {
  account_type_id: string;
  currency: Currency;
}

interface AddressCountry {
  id: string;
  name: string;
  three_code: string;
  two_code: string;
  currency_id: string;
  numeric_code: string;
  country: string;
}

interface Item {
  id: string;
  item_number: string;
  deposit_reference: string;
}

interface AccountTo {
  id: string;
  account_type: string;
  user_id: string;
}

interface Links {
  self: string;
  users: string;
  fees: string;
  wallet_accounts: string;
  card_accounts: string;
  paypal_accounts: string;
  bank_accounts: string;
  items: string;
  marketplace: string;
}

interface Related {
  account_to: AccountTo;
  links: Links;
}

export interface ZaiBatchTransaction {
  id: string;
  reference_id?: string;
  created_at: Date;
  updated_at: Date;
  status?: string;
  uuid?: string;
  disbursement_bank?: string;
  processing_bank?: string;
  external_reference?: string;
  reference_amount?: string;
  internal_state?: string;
  internal_status?: string;
  account_external?: AccountExternal;
  external_account_details: string;
  external_account_details_encrypted: boolean;
  marketplace: Marketplace;
  account_details: string;
  account_details_encrypted: boolean;
  first_name: string;
  last_name: string;
  user_email: string;
  user_external_id: string;
  legal_entity_id: string;
  phone: string;
  payout_currency: string;
  type: string;
  type_method: string;
  batch_id?: number;
  cuscal_payment_transaction_id?: string;
  reference?: string;
  state?: string;
  user_id?: string;
  account_id?: string;
  account_type?: string;
  from_user_name?: string;
  from_user_id?: string;
  refund_state?: string;
  amount: number;
  currency?: string;
  company?: string;
  address_line1?: string;
  address_line2?: string;
  address_city?: string;
  address_state?: string;
  address_postcode?: string;
  address_country?: AddressCountry;
  debit_credit?: string;
  description?: string;
  item?: Item;
  related?: Related;
}

export interface ZaiBatchTransactionsWebhookEvent {
  batch_transactions: ZaiBatchTransaction;
}
