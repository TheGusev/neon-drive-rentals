-- Фиксация пробега при завершении аренды.

alter table bookings add column if not exists return_mileage integer;
alter table bookings add column if not exists return_mileage_source text;

alter table cars add column if not exists mileage integer;
