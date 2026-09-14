-- 024_schema_compatibility.sql — безопасная совместимость старых установок.
-- Сохраняет строки и приводит ошибочно созданные integer FK к типам родительских ключей.

create or replace function nsk_align_fk_column(child_table text, child_column text, parent_table text)
returns void language plpgsql as $$
declare
  child_type text;
  parent_type text;
  constraint_name text;
  invalid_count bigint;
begin
  select format_type(a.atttypid, a.atttypmod) into child_type
    from pg_attribute a join pg_class c on c.oid = a.attrelid
    join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname = child_table and a.attname = child_column and a.attnum > 0;
  select format_type(a.atttypid, a.atttypmod) into parent_type
    from pg_attribute a join pg_class c on c.oid = a.attrelid
    join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname = parent_table and a.attname = 'id' and a.attnum > 0;
  if child_type is null or parent_type is null or child_type = parent_type then return; end if;

  execute format(
    'select count(*) from %I ch where ch.%I is not null and not exists (select 1 from %I p where p.id::text = ch.%I::text)',
    child_table, child_column, parent_table, child_column
  ) into invalid_count;
  if invalid_count > 0 then
    raise warning 'Skip %.% conversion: % values do not match %.id', child_table, child_column, invalid_count, parent_table;
    return;
  end if;

  for constraint_name in
    select con.conname from pg_constraint con
     join pg_class rel on rel.oid = con.conrelid
     join pg_namespace n on n.oid = rel.relnamespace
    where n.nspname = 'public' and rel.relname = child_table and con.contype = 'f'
      and child_column = any(select att.attname from unnest(con.conkey) k(attnum)
                             join pg_attribute att on att.attrelid = rel.oid and att.attnum = k.attnum)
  loop
    execute format('alter table %I drop constraint %I', child_table, constraint_name);
  end loop;
  execute format('alter table %I alter column %I type %s using %I::text::%s', child_table, child_column, parent_type, child_column, parent_type);
  execute format('alter table %I add constraint %I foreign key (%I) references %I(id) on delete cascade',
                 child_table, child_table || '_' || child_column || '_fkey', child_column, parent_table);
end $$;

select nsk_align_fk_column('client_documents', 'client_id', 'clients');
select nsk_align_fk_column('client_reviews', 'client_id', 'clients');
select nsk_align_fk_column('client_reviews', 'booking_id', 'bookings');
select nsk_align_fk_column('client_favorites', 'client_id', 'clients');
select nsk_align_fk_column('client_favorites', 'car_id', 'cars');
select nsk_align_fk_column('messages', 'client_id', 'clients');
select nsk_align_fk_column('car_reviews', 'booking_id', 'bookings');
select nsk_align_fk_column('car_reviews', 'car_id', 'cars');
select nsk_align_fk_column('car_reviews', 'client_id', 'clients');

drop function nsk_align_fk_column(text, text, text);

create unique index if not exists car_reviews_booking_idx on car_reviews (booking_id);
create index if not exists car_reviews_car_idx on car_reviews (car_id, created_at desc);
