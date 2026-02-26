import { format } from 'date-fns';

import { DEFAULT_WEEKLY_PLAN, DEFAULT_WEEKLY_TARGET_MIN } from '@/lib/constants';
import { getWeekStartDate, getWeekStartString } from '@/lib/date';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

export type StudySessionRow = Database['public']['Tables']['study_sessions']['Row'];
export type StudySessionInsert = Database['public']['Tables']['study_sessions']['Insert'];
export type WeeklyPlanRow = Database['public']['Tables']['weekly_plans']['Row'];
export type PomodoroRunInsert = Database['public']['Tables']['pomodoro_runs']['Insert'];

export const getUserOrThrow = async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  return user;
};

export const listStudySessionsInRange = async ({
  from,
  to,
  limit,
}: {
  from: string;
  to: string;
  limit?: number;
}): Promise<StudySessionRow[]> => {
  const user = await getUserOrThrow();
  const supabase = await createClient();

  let query = supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', user.id)
    .gte('started_at', from)
    .lte('ended_at', to)
    .order('started_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const listRecentStudySessions = async (limit = 8): Promise<StudySessionRow[]> => {
  const user = await getUserOrThrow();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const createStudySession = async (
  payload: Omit<StudySessionInsert, 'user_id'>
): Promise<StudySessionRow> => {
  const user = await getUserOrThrow();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('study_sessions')
    .insert({ ...payload, user_id: user.id })
    .select('*')
    .single();

  if (error || !data) {
    throw error ?? new Error('Failed to create study session');
  }

  return data;
};

export const createPomodoroRun = async (
  payload: Omit<PomodoroRunInsert, 'user_id'>
): Promise<void> => {
  const user = await getUserOrThrow();
  const supabase = await createClient();

  const { error } = await supabase.from('pomodoro_runs').insert({
    ...payload,
    user_id: user.id,
  });

  if (error) {
    throw error;
  }
};

export const getWeeklyPlanByDate = async (date: Date = new Date()): Promise<WeeklyPlanRow | null> => {
  const user = await getUserOrThrow();
  const supabase = await createClient();
  const weekStart = getWeekStartString(date);

  const { data, error } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_start', weekStart)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const upsertWeeklyPlan = async ({
  date,
  targetMin,
  ratios,
}: {
  date?: Date;
  targetMin: number;
  ratios: Record<string, unknown>;
}) => {
  const user = await getUserOrThrow();
  const supabase = await createClient();
  const weekStart = getWeekStartString(date ?? new Date());

  const { data, error } = await supabase
    .from('weekly_plans')
    .upsert(
      {
        user_id: user.id,
        week_start: weekStart,
        target_min: targetMin,
        ratios,
      },
      { onConflict: 'user_id,week_start' }
    )
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getOrCreateWeeklyPlan = async (date: Date = new Date()): Promise<WeeklyPlanRow> => {
  const plan = await getWeeklyPlanByDate(date);
  if (plan) {
    return plan;
  }

  const weekStart = getWeekStartDate(date);
  return upsertWeeklyPlan({
    date: weekStart,
    targetMin: DEFAULT_WEEKLY_TARGET_MIN,
    ratios: DEFAULT_WEEKLY_PLAN as unknown as Record<string, unknown>,
  });
};

export const buildWeekDates = (baseDate: Date = new Date()): string[] => {
  const monday = getWeekStartDate(baseDate);
  return Array.from({ length: 7 }, (_, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    return format(d, 'yyyy-MM-dd');
  });
};
