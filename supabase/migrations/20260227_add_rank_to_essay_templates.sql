alter table public.essay_templates
add column rank text default 'C' check (rank in ('A', 'B', 'C'));
