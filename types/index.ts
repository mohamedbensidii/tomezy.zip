export type Shop = {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  status: 'open' | 'closed' | 'break' | 'busy';
  avg_service_minutes: number;
  cover_image: string | null;
  created_at: string;
};

export type QueueEntry = {
  id: string;
  shop_id: string;
  customer_name: string;
  queue_number: number;
  status: 'waiting' | 'serving' | 'done' | 'skipped' | 'left';
  push_subscription: any | null;
  joined_at: string;
  served_at: string | null;
};
