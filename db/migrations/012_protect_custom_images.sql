-- Galleries saved by an administrator must not be replaced by fleet photo seeds.
alter table cars
  add column if not exists images_managed boolean not null default false;
