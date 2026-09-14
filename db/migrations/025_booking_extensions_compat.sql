-- 025_booking_extensions_compat.sql — таблица продлений с типами связей из реальной базы.
-- Идемпотентно: повторный запуск безопасен.

do $$
declare
  booking_type text;
  payment_type text;
  current_booking_type text;
  has_table boolean;
  row_count bigint;
  bad_count bigint;
begin
  select format_type(a.atttypid, a.atttypmod) into booking_type
    from pg_attribute a
    join pg_class c on c.oid = a.attrelid
    join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname = 'bookings' and a.attname = 'id' and a.attnum > 0;

  select format_type(a.atttypid, a.atttypmod) into payment_type
    from pg_attribute a
    join pg_class c on c.oid = a.attrelid
    join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname = 'payments' and a.attname = 'id' and a.attnum > 0;

  if booking_type is null then
    raise warning '025: таблица bookings не найдена, пропуск';
    return;
  end if;
  payment_type := coalesce(payment_type, 'bigint');

  select to_regclass('public.booking_extensions') is not null into has_table;

  if has_table then
    select format_type(a.atttypid, a.atttypmod) into current_booking_type
      from pg_attribute a
      join pg_class c on c.oid = a.attrelid
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relname = 'booking_extensions'
       and a.attname = 'booking_id' and a.attnum > 0;

    if current_booking_type is distinct from booking_type then
      execute 'select count(*) from booking_extensions' into row_count;
      if row_count = 0 then
        execute 'drop table booking_extensions cascade';
        has_table := false;
      else
        execute format(
          'select count(*) from booking_extensions e where e.booking_id is not null
             and not exists (select 1 from bookings b where b.id::text = e.booking_id::text)'
        ) into bad_count;
        if bad_count > 0 then
          raise warning '025: % строк продлений без совпадающей брони, тип не меняем', bad_count;
          return;
        end if;
        begin
          execute format('alter table booking_extensions drop constraint if exists booking_extensions_booking_id_fkey');
          execute format('alter table booking_extensions alter column booking_id type %s using booking_id::text::%s',
                         booking_type, booking_type);
        exception when others then
          raise warning '025: не удалось привести booking_extensions.booking_id: %', sqlerrm;
          return;
        end;
      end if;
    end if;
  end if;

  if not has_table then
    execute format($f$
      create table booking_extensions (
        id uuid primary key default gen_random_uuid(),
        booking_id %s not null references bookings(id) on delete cascade,
        previous_date_to timestamptz not null,
        new_date_to timestamptz not null,
        amount numeric(12,2) not null,
        status text not null default 'pending',
        payment_id %s references payments(id) on delete set null,
        created_at timestamptz not null default now(),
        applied_at timestamptz,
        constraint booking_extensions_dates check (new_date_to > previous_date_to)
      )
    $f$, booking_type, payment_type);
  else
    execute format('alter table booking_extensions add column if not exists payment_id %s', payment_type);
    begin
      execute 'alter table booking_extensions add constraint booking_extensions_booking_id_fkey
               foreign key (booking_id) references bookings(id) on delete cascade';
    exception when duplicate_object then null;
      when others then raise warning '025: внешний ключ продлений не создан: %', sqlerrm;
    end;
  end if;

  execute 'create index if not exists booking_extensions_booking_idx on booking_extensions (booking_id, created_at desc)';
  execute 'create unique index if not exists booking_extensions_payment_idx on booking_extensions (payment_id) where payment_id is not null';
end $$;

alter table payments add column if not exists purpose text not null default 'booking';
alter table payments add column if not exists extension_end_date timestamptz;
alter table payments add column if not exists extension_id uuid;

create index if not exists payments_extension_idx
  on payments (booking_id, purpose, status, created_at desc);
