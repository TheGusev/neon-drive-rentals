-- 023_reviews_rating.sql — рейтинг автомобилей из опубликованных отзывов.

create table if not exists car_reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  car_id uuid not null references cars(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  text text not null default '',
  service_comment text,
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  unique (booking_id)
);

-- Ранние установки могли получить ошибочные integer-поля до перехода бронирований на UUID.
-- Такие строки не могли ссылаться на действующие UUID-записи, поэтому безопасно исправляем пустую таблицу.
do $$
declare booking_type text;
begin
  select data_type into booking_type from information_schema.columns
   where table_schema = 'public' and table_name = 'car_reviews' and column_name = 'booking_id';
  if booking_type <> 'uuid' then
    delete from car_reviews;
    alter table car_reviews drop constraint if exists car_reviews_booking_id_fkey;
    alter table car_reviews drop constraint if exists car_reviews_car_id_fkey;
    alter table car_reviews drop constraint if exists car_reviews_client_id_fkey;
    alter table car_reviews alter column booking_id type uuid using null::uuid;
    alter table car_reviews alter column car_id type uuid using null::uuid;
    alter table car_reviews alter column client_id type uuid using null::uuid;
    alter table car_reviews add constraint car_reviews_booking_id_fkey foreign key (booking_id) references bookings(id) on delete cascade;
    alter table car_reviews add constraint car_reviews_car_id_fkey foreign key (car_id) references cars(id) on delete cascade;
    alter table car_reviews add constraint car_reviews_client_id_fkey foreign key (client_id) references clients(id) on delete cascade;
  end if;
end $$;

create unique index if not exists car_reviews_booking_idx on car_reviews (booking_id);
create index if not exists car_reviews_car_idx on car_reviews (car_id, created_at desc);

alter table cars add column if not exists rating numeric(3,2) not null default 5.0;
alter table cars add column if not exists reviews_count integer not null default 0;

create or replace function recalculate_car_rating(target_car uuid) returns void
language plpgsql as $$
begin
  update cars set
    rating = coalesce((select avg(rating)::numeric(3,2) from car_reviews where car_id = target_car and hidden = false), 5.0),
    reviews_count = (select count(*) from car_reviews where car_id = target_car and hidden = false)
  where id = target_car;
end;
$$;

create or replace function sync_car_rating_trigger() returns trigger
language plpgsql as $$
begin
  if tg_op = 'DELETE' then perform recalculate_car_rating(old.car_id);
  else
    perform recalculate_car_rating(new.car_id);
    if tg_op = 'UPDATE' and old.car_id is distinct from new.car_id then perform recalculate_car_rating(old.car_id); end if;
  end if;
  return null;
end;
$$;

drop trigger if exists car_reviews_rating_sync on car_reviews;
create trigger car_reviews_rating_sync after insert or update or delete on car_reviews
for each row execute function sync_car_rating_trigger();

update cars c set
  rating = coalesce((select avg(r.rating)::numeric(3,2) from car_reviews r where r.car_id = c.id and r.hidden = false), 5.0),
  reviews_count = (select count(*) from car_reviews r where r.car_id = c.id and r.hidden = false);