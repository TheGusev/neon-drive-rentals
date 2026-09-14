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

-- Таблица booking_extensions и её индексы создаются в 025_booking_extensions_compat.sql:
-- типы связей там подбираются под реальную схему базы.

create index if not exists payments_extension_idx
  on payments (booking_id, purpose, status, created_at desc);