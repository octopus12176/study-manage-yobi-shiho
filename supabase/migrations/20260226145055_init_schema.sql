create extension if not exists pgcrypto;

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_min int not null check (duration_min >= 0),
  exam text not null check (exam in ('yobi', 'shiho', 'both')),
  track text not null check (track in ('tantou', 'ronbun', 'review', 'mock', 'other')),
  subject text not null,
  material text,
  activity text not null check (activity in ('input', 'drill', 'review', 'write')),
  confidence int check (confidence between 1 and 5),
  memo text,
  cause_category text,
  created_at timestamptz not null default now()
);

create table if not exists public.weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  target_min int not null check (target_min >= 0),
  ratios jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint weekly_plans_week_start_monday check (extract(isodow from week_start) = 1),
  unique (user_id, week_start)
);

create table if not exists public.pomodoro_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  study_session_id uuid references public.study_sessions(id) on delete set null,
  work_min int not null,
  break_min int not null,
  cycles int not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_study_sessions_user_started_at
  on public.study_sessions (user_id, started_at desc);

create index if not exists idx_weekly_plans_user_week_start
  on public.weekly_plans (user_id, week_start desc);

create index if not exists idx_pomodoro_runs_user_started_at
  on public.pomodoro_runs (user_id, started_at desc);
alter table public.study_sessions enable row level security;
alter table public.weekly_plans enable row level security;
alter table public.pomodoro_runs enable row level security;

drop policy if exists study_sessions_select_own on public.study_sessions;
drop policy if exists study_sessions_insert_own on public.study_sessions;
drop policy if exists study_sessions_update_own on public.study_sessions;
drop policy if exists study_sessions_delete_own on public.study_sessions;

create policy study_sessions_select_own on public.study_sessions
for select using (auth.uid() = user_id);

create policy study_sessions_insert_own on public.study_sessions
for insert with check (auth.uid() = user_id);

create policy study_sessions_update_own on public.study_sessions
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy study_sessions_delete_own on public.study_sessions
for delete using (auth.uid() = user_id);

drop policy if exists weekly_plans_select_own on public.weekly_plans;
drop policy if exists weekly_plans_insert_own on public.weekly_plans;
drop policy if exists weekly_plans_update_own on public.weekly_plans;
drop policy if exists weekly_plans_delete_own on public.weekly_plans;

create policy weekly_plans_select_own on public.weekly_plans
for select using (auth.uid() = user_id);

create policy weekly_plans_insert_own on public.weekly_plans
for insert with check (auth.uid() = user_id);

create policy weekly_plans_update_own on public.weekly_plans
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy weekly_plans_delete_own on public.weekly_plans
for delete using (auth.uid() = user_id);

drop policy if exists pomodoro_runs_select_own on public.pomodoro_runs;
drop policy if exists pomodoro_runs_insert_own on public.pomodoro_runs;
drop policy if exists pomodoro_runs_update_own on public.pomodoro_runs;
drop policy if exists pomodoro_runs_delete_own on public.pomodoro_runs;

create policy pomodoro_runs_select_own on public.pomodoro_runs
for select using (auth.uid() = user_id);

create policy pomodoro_runs_insert_own on public.pomodoro_runs
for insert with check (auth.uid() = user_id);

create policy pomodoro_runs_update_own on public.pomodoro_runs
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy pomodoro_runs_delete_own on public.pomodoro_runs
for delete using (auth.uid() = user_id);
