export interface ZaiUser {
  created_at: string; // date-time
  updated_at: string; // date-time
  full_name: string;
  email: string;
  mobile: string;
  phone: string;
  logo_url: string;
  color_1: string;
  color_2: string;
  first_name: string;
  last_name: string;
  id: string;
  custom_descriptor: string;
  location: string;
  verification_status: string;
  held_state: boolean;
  roles: string[];
  dob: string;
  government_number: string;
  drivers_license: string;
  flags: object; // HAS ADDITIONAL FIELDS
  related: {
    links: object; // LINKS OBJECT
  };
}

export interface ZaiUserWebhookEvent {
  users?: ZaiUser;
}

export interface GetZaiUserResponse {
  users: ZaiUser;
}

export interface CreateZaiUserRequest {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  mobile?: string;
  address_line1?: string;
  address_line2?: string;
  state?: string;
  city?: string;
  zip?: string;
  country: string;
  dob?: string;
  government_number?: string;
  drivers_license_number?: string;
  drivers_license_state?: string;
  ip_address?: string;
  logo_url?: string;
  color_1?: string;
  color_2?: string;
  custom_descriptor?: string;
}

export interface CreateZaiUserResponse {
  users: ZaiUser;
}

export interface UpdateZaiUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  mobile?: string;
  address_line1?: string;
  address_line2?: string;
  state?: string;
  city?: string;
  zip?: string;
  country?: string;
  dob?: string;
  government_number?: string;
  drivers_license_number?: string;
  drivers_license_state?: string;
  ip_address?: string;
  logo_url?: string;
  color_1?: string;
  color_2?: string;
  custom_descriptor?: string;
}

export interface UpdateZaiUserResponse {
  users: ZaiUser;
}

export interface SetUserDisbursementRequest {
  account_id: string;
}

export interface LinksObject {
  self: string;
  items: string;
  card_accounts: string;
  paypal_accounts: string;
  payid_accounts: string;
  bpay_accounts: string;
  bank_accounts: string;
  wallet_accounts: string;
}

export interface RelatedObject {
  addresses: string;
  links: LinksObject;
}

export interface SetUserDisbursementResponse {
  users: {
    created_at: string; // date-time
    updated_at: string; // date-time
    full_name: string;
    email: string;
    mobile: string;
    phone: string;
    logo_url: string;
    color_1: string;
    color_2: string;
    first_name: string;
    last_name: string;
    id: string;
    custom_descriptor: string;
    location: string;
    verification_status: string;
    held_state: boolean;
    roles: string[];
    dob: string;
    government_number: string;
    drivers_license: string;
    flags: object; // HAS ADDITIONAL FIELDS
    related: RelatedObject;
  };
}

interface LinkDetails {
  self: object;
  users: object;
  batch_transactions: object;
  transactions: object;
  bpay_details: object;
  npp_details: object;
  virtual_accounts: object;
}

interface WalletAccount {
  active: boolean;
  created_at: string;
  updated_at: string;
  id: string;
  currency: string;
  verification_status: 'verified' | 'not_verified';
  balance: number;
  links: LinkDetails;
}

export interface GetZaiUserWalletResponse {
  wallet_accounts: WalletAccount;
}
