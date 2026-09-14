-- 023_reviews_rating.sql — рейтинг автомобилей из опубликованных отзывов.

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