-- 007: lastmod для sitemap.xml
alter table cars add column if not exists updated_at timestamptz not null default now();
