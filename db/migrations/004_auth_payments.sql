-- 004_auth_payments.sql — OTP-коды, чёрный список клиентов, платежи.

create table if not exists otp_codes (
  id bigserial primary key,
  phone text not null,
  code_hash text not null,
  attempts int not null default 0,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists otp_codes_phone_idx on otp_codes (phone, created_at desc);

alter table clients add column if not exists blocked boolean not null default false;
alter table clients add column if not exists email text;
alter table clients add column if not exists yandex_id text;
alter table clients add column if not exists created_at timestamptz not null default now();

create table if not exists payments (
  id bigserial primary key,
  booking_id uuid,
  provider text not null default 'yookassa',
  provider_id text,
  amount numeric(12,2) not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table payments add column if not exists provider text not null default 'yookassa';
alter table payments add column if not exists provider_id text;
alter table payments add column if not exists status text not null default 'pending';
alter table payments add column if not exists updated_at timestamptz not null default now();

create index if not exists payments_booking_idx on payments (booking_id);
create index if not exists payments_created_idx on payments (created_at desc);
