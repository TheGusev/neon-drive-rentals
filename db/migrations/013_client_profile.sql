-- 013_client_profile.sql — личный кабинет на реальных данных.
-- Только неразрушающие операции.

create table if not exists client_documents (
  id uuid primary key default gen_random_uuid(),
  client_id integer not null references clients(id) on delete cascade,
  type text not null default 'passport',
  number text,
  file_url text,
  status text not null default 'pending',
  comment text,
  uploaded_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists client_documents_client_idx on client_documents (client_id);

create table if not exists client_reviews (
  id uuid primary key default gen_random_uuid(),
  client_id integer not null references clients(id) on delete cascade,
  booking_id integer references bookings(id) on delete set null,
  author text not null default 'NSK-RENT',
  rating integer not null default 5,
  text text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists client_reviews_client_idx on client_reviews (client_id);

create table if not exists client_favorites (
  client_id integer not null references clients(id) on delete cascade,
  car_id integer not null references cars(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (client_id, car_id)
);

alter table clients add column if not exists rating numeric(3,2);
