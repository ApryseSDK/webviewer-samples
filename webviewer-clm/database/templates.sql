create table public.templates (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  title text null,
  file_extension text null,
  file_data text null,
  constraint templates_pkey primary key (id)
) TABLESPACE pg_default;