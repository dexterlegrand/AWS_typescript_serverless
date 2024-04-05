export interface ZaiCompany {
  legal_name: string;
  name: string;
  tax_number: string;
  charge_tax: boolean | null;
  phone: string;
  id: string;
  related: {
    address: string;
    users: string;
    self: {
      self: string;
    };
  };
}

export interface CreateZaiCompanyRequest {
  name: string; // Company name
  legal_name: string; // Company legal name
  tax_number: string; // ABN / Tax number
  charge_tax?: boolean | null; // Charge GST or not? allowed values are true or false
  address_line1?: string; // Address line 1
  address_line2?: string; // Address line 2
  city?: string; // City
  state?: string; // State
  zip?: string; // Zip
  country: string; // 3 digit country code (eg. AUS)
  phone?: string; // Company phone number
  user_id: string; // User ID to associate with the company
  email?: string;
  mobile?: string;
  logo_url?: string;
  color_1?: string;
  color_2?: string;
  custom_descriptor?: string;
}

export interface CreateZaiCompanyResponse {
  companies: ZaiCompany;
}

export interface UpdateZaiCompanyRequest {
  name: string; // Company name
  legal_name: string; // Company legal name
  tax_number: string; // ABN / Tax number
  charge_tax?: boolean | null; // Charge GST or not? allowed values are true or false
  address_line1?: string; // Address line 1
  address_line2?: string; // Address line 2
  city?: string; // City
  state?: string; // State
  zip?: string; // Zip
  country: string; // 3 digit country code (eg. AUS)
  phone?: string; // Company phone number
  user_id: string; // User ID to associate with the company
}

export interface UpdateZaiCompanyResponse {
  companies: ZaiCompany;
}

export interface ZaiCompanyWebhookEvent {
  companies: ZaiCompany;
}
