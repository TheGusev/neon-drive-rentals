-- 003_add_signature.sql — подпись договора и служебные поля брони.

alter table bookings add column if not exists signed_at timestamptz;
alter table bookings add column if not exists signature_ip text;
alter table bookings add column if not exists tariff text;
alter table bookings add column if not exists comment text;

create index if not exists bookings_car_dates_idx on bookings (car_id, date_from, date_to);
create index if not exists bookings_status_idx on bookings (status);
