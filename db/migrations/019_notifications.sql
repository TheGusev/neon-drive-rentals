-- Оповещения администратора и подписки устройств на push.

create table if not exists admin_notifications (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  title text not null,
  body text not null default '',
  link text,
  entity_id text,
  dedupe_key text unique,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists admin_notifications_created_idx on admin_notifications (created_at desc);
create index if not exists admin_notifications_unread_idx on admin_notifications (read_at) where read_at is null;

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  label text,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
