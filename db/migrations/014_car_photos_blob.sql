-- 014: надёжное хранение фотографий авто прямо в PostgreSQL.
-- Файлы на диске не переживают передеплой, поэтому источник правды — БД.
create table if not exists car_photos_blob (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  mime_type text not null,
  byte_size integer not null,
  data bytea not null,
  created_at timestamptz not null default now()
);

create index if not exists car_photos_blob_created_at_idx on car_photos_blob (created_at desc);
