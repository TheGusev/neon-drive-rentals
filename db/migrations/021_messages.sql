-- Переписка клиента с администратором.

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  client_id integer not null references clients(id) on delete cascade,
  sender text not null check (sender in ('client', 'admin')),
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists messages_client_idx on messages (client_id, created_at desc);
create index if not exists messages_unread_idx on messages (client_id, sender) where read_at is null;
