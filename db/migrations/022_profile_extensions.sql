-- 022_profile_extensions.sql — ручные реквизиты документов, пробег выдачи и продления.

alter table client_documents add column if not exists birth_date date;
alter table client_documents add column if not exists issued_by text;
alter table client_documents add column if not exists issue_date date;
alter table client_documents add column if not exists department_code text;
alter table client_documents add column if not exists registration_address text;
alter table client_documents add column if not exists expiry_date date;

-- Одна актуальная запись паспорта и прав на клиента.
delete from client_documents a
using client_documents b
where a.client_id = b.client_id and a.type = b.type and a.uploaded_at < b.uploaded_at;
create unique index if not exists client_documents_client_type_idx
  on client_documents (client_id, type);

alter table bookings add column if not exists start_mileage integer;
alter table bookings add column if not exists tariff text not null default 'city';
alter table bookings add column if not exists extension_status text not null default 'none';
alter table bookings add column if not exists extension_end_date timestamptz;
alter table bookings add column if not exists extension_amount numeric(12,2);

alter table payments add column if not exists purpose text not null default 'booking';
alter table payments add column if not exists extension_end_date timestamptz;
alter table payments add column if not exists extension_id uuid;

create table if not exists booking_extensions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  previous_date_to timestamptz not null,
  new_date_to timestamptz not null,
  amount numeric(12,2) not null,
  status text not null default 'pending',
  payment_id bigint references payments(id) on delete set null,
  created_at timestamptz not null default now(),
  applied_at timestamptz,
  constraint booking_extensions_dates check (new_date_to > previous_date_to)
);

create index if not exists booking_extensions_booking_idx
  on booking_extensions (booking_id, created_at desc);
create unique index if not exists booking_extensions_payment_idx
  on booking_extensions (payment_id) where payment_id is not null;

create index if not exists payments_extension_idx
  on payments (booking_id, purpose, status, created_at desc);