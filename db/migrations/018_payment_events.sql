-- 018_payment_events.sql — журнал уведомлений платёжного провайдера и поля возвратов.

create table if not exists payment_events (
  id bigserial primary key,
  provider text not null default 'yookassa',
  provider_id text,
  booking_id text,
  event text,
  status text,
  amount numeric(12,2),
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists payment_events_provider_idx on payment_events (provider_id, created_at desc);
create index if not exists payment_events_created_idx on payment_events (created_at desc);

-- Идемпотентность webhook: одно и то же событие по платежу не обрабатываем дважды.
create unique index if not exists payment_events_unique_idx
  on payment_events (provider_id, coalesce(event, ''), coalesce(status, ''))
  where provider_id is not null;

alter table payments add column if not exists refunded_amount numeric(12,2) not null default 0;
alter table payments add column if not exists receipt_registered boolean not null default false;
alter table payments add column if not exists customer_email text;
alter table payments add column if not exists customer_phone text;
