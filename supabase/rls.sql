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
