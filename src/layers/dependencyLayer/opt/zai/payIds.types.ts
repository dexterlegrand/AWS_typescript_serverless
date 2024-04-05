export interface ZaiPayIds {
  event: string;
  id: string;
  name: string;
  newStatus: string;
  oldStatus: string;
  updatedAt: string;
  link: string;
}

export interface ZaiPayIdsWebhookEvent {
  pay_ids?: ZaiPayIds;
}
