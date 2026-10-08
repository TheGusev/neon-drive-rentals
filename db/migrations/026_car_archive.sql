-- Мягкое удаление авто: если по машине есть история броней/платежей/отзывов,
-- запись нельзя удалить физически (внешние ключи) — она архивируется и пропадает с сайта и из админки.
alter table cars add column if not exists archived_at timestamptz;
create index if not exists cars_archived_at_idx on cars (archived_at);
