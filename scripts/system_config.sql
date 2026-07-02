-- Run once in Supabase SQL Editor (JJ)
create table if not exists system_config (
  key text primary key,
  value text not null,
  expires_at timestamptz,
  updated_at timestamptz default now()
);

-- Insert the initial long-lived token (replace EL_TOKEN_AQUI):
-- insert into system_config (key, value, expires_at)
-- values ('ig_access_token', 'EL_TOKEN_AQUI', '2026-08-31T00:03:28-06:00');
