-- 001_init.sql — базовая схема NSK-RENT.
-- Идемпотентна и безопасна для уже работающей базы: существующие таблицы и данные не удаляются.

create table if not exists cars (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  brand text not null,
  model text not null,
  year integer not null,
  class text not null default 'Econom',
  transmission text not null default 'AT',
  seats integer not null default 4,
  price_city numeric(12,2) not null default 0,
  price_out numeric(12,2) not null default 0,
  status text not null default 'available',
  images jsonb not null default '[]'::jsonb,
  specs jsonb not null default '{}'::jsonb,
  plate text,
  created_at timestamptz not null default now()
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  name text,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references cars(id) on delete restrict,
  client_id uuid references clients(id) on delete set null,
  date_from timestamptz not null,
  date_to timestamptz not null,
  total numeric(12,2) not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint bookings_valid_dates check (date_to > date_from)
);

create index if not exists cars_slug_idx on cars (slug);
create index if not exists clients_phone_idx on clients (phone);
create index if not exists bookings_client_idx on bookings (client_id);
