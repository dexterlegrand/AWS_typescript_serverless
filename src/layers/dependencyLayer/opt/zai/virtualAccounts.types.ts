export interface ZaiVirtualAccount {
  event: string;
  id: string;
  link: string;
  name: string;
  updatedAt: string;
}

export interface ZaiVirtualAccountWebhookEvent {
  virtual_accounts: ZaiVirtualAccount;
}
