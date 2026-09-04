-- Маршрут аренды: выдача ключей, возврат авто и отзывы клиентов.

alter table bookings add column if not exists keys_issued_at timestamptz;
alter table bookings add column if not exists returned_at timestamptz;
alter table bookings add column if not exists handled_by text;

create table if not exists car_reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  car_id uuid not null references cars(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  text text not null default '',
  service_comment text not null default '',
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists car_reviews_booking_idx on car_reviews (booking_id);
create index if not exists car_reviews_car_idx on car_reviews (car_id) where hidden = false;
create index if not exists car_reviews_client_idx on car_reviews (client_id);
