import type { ACTIVITY_OPTIONS, EXAM_OPTIONS, TRACK_OPTIONS } from '@/lib/constants';

export type Exam = (typeof EXAM_OPTIONS)[number]['value'];
export type Track = (typeof TRACK_OPTIONS)[number]['value'];
export type Activity = (typeof ACTIVITY_OPTIONS)[number]['value'];

export type StudySession = {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string;
  duration_min: number;
  exam: Exam;
  track: Track;
  subject: string;
  material: string | null;
  activity: Activity;
  confidence: number | null;
  memo: string | null;
  cause_category: string | null;
  created_at: string;
};

export type WeeklyPlan = {
  id: string;
  user_id: string;
  week_start: string;
  target_min: number;
  ratios: Record<string, unknown>;
  created_at: string;
};

export type PomodoroRun = {
  id: string;
  user_id: string;
  study_session_id: string | null;
  work_min: number;
  break_min: number;
  cycles: number;
  started_at: string;
  ended_at: string | null;
  created_at: string;
};

export type DashboardStats = {
  weeklyHoursText: string;
  exerciseRatio: number;
  todayLogs: number;
  todayMinutes: number;
  weeklyMinutes: number;
};
