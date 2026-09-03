-- 017_consents.sql — журнал согласий пользователей (152-ФЗ, требования РКН).

create table if not exists consents (
  id bigserial primary key,
  kind text not null,                 -- pdn_registration | pdn_booking | offer | cookie
  doc_version text not null default '1.0',
  client_id text,
  phone text,
  email text,
  ip text,
  user_agent text,
  page text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists consents_kind_idx on consents (kind, created_at desc);
create index if not exists consents_phone_idx on consents (phone);
create index if not exists consents_email_idx on consents (email);
