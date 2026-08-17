create table public.agreements (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  status text null default 'Awaiting Signature'::text,
  user_id uuid null,
  template_id uuid null,
  file_data text not null,
  constraint agreements_pkey primary key (id),
  constraint agreements_template_id_fkey foreign KEY (template_id) references templates (id),
  constraint agreements_user_id_fkey foreign KEY (user_id) references users (id)
) TABLESPACE pg_default;