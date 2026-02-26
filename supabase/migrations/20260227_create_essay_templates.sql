create table if not exists public.essay_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  title text not null,
  template text,
  norm text,
  pitfall text,
  created_at timestamptz not null default now()
);

alter table public.essay_templates enable row level security;

create policy "Users can manage their own templates"
  on public.essay_templates
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index essay_templates_user_id_created_at
  on public.essay_templates (user_id, created_at desc);
