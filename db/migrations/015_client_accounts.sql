-- Аккаунты клиентов: e-mail + пароль (регистрация по желанию).
alter table clients add column if not exists email text;
alter table clients add column if not exists password_hash text;
alter table clients add column if not exists email_verified_at timestamptz;
alter table clients add column if not exists last_login_at timestamptz;

-- Уникальность e-mail только среди аккаунтов с паролем: гостевые записи
-- (созданные при бронировании) могут иметь дубли/пустые адреса.
create unique index if not exists clients_email_account_idx
  on clients (lower(email))
  where password_hash is not null and email is not null;

create index if not exists clients_email_idx on clients (lower(email));
