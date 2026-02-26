import { addDays, endOfWeek, format, parseISO, startOfWeek, subWeeks } from 'date-fns';

import { DEFAULT_WEEKLY_PLAN, SUBJECTS, WEEKDAY_LABELS } from '@/lib/constants';
import { getTodayDateString, getWeekRange, getYesterdayDateString } from '@/lib/date';
import { buildWeekDates, getOrCreateWeeklyPlan, listRecentStudySessions, listStudySessionsInRange } from '@/lib/supabase/queries';
import type { StudySessionRow, WeeklyPlanRow } from '@/lib/supabase/queries';

type WeeklyPlanRatios = {
  weekdayHours: number;
  weekendHours: number;
  exerciseRatio: number;
  subjectRatios: Record<string, number>;
};

type FocusSubject = {
  subject: string;
  weeklyMinutes: number;
  currentPct: number;
  targetPct: number;
  gapPct: number;
};

type ActivityMix = {
  activity: string;
  label: string;
  minutes: number;
  pct: number;
};

export type DashboardData = {
  weekDates: string[];
  weekLabels: string[];
  dailyMinutes: Array<{ date: string; minutes: number }>;
  heatmapDays: Array<{ date: string; minutes: number; sessions: number }>;
  heatmapMaxMinutes: number;
  todaySessions: StudySessionRow[];
  recentSessions: StudySessionRow[];
  yesterdayMemos: StudySessionRow[];
  weeklyHoursText: string;
  weeklyMinutes: number;
  exerciseRatio: number;
  subjectBreakdown: Record<string, number>;
  weakPoints: Array<[string, number]>;
  reviewPattern: Array<[string, number]>;
  plan: WeeklyPlanRow;
  planRatios: WeeklyPlanRatios;
  targetHours: number;
  previousWeeklyMinutes: number;
  momentumPercent: number;
  coverageCount: number;
  focusSubjects: FocusSubject[];
  activityMix: ActivityMix[];
  ronbunCauseCounts: Array<{ category: string; count: number; pct: number }>;
};

const fallbackPlanRatios: WeeklyPlanRatios = {
  weekdayHours: DEFAULT_WEEKLY_PLAN.weekdayHours,
  weekendHours: DEFAULT_WEEKLY_PLAN.weekendHours,
  exerciseRatio: DEFAULT_WEEKLY_PLAN.exerciseRatio,
  subjectRatios: { ...DEFAULT_WEEKLY_PLAN.subjectRatios },
};

const parsePlanRatios = (plan: WeeklyPlanRow): WeeklyPlanRatios => {
  const ratios = plan.ratios;
  if (!ratios || typeof ratios !== 'object' || Array.isArray(ratios)) {
    return fallbackPlanRatios;
  }

  const raw = ratios as Record<string, unknown>;
  const subjectRatios =
    raw.subjectRatios && typeof raw.subjectRatios === 'object' && !Array.isArray(raw.subjectRatios)
      ? (raw.subjectRatios as Record<string, number>)
      : fallbackPlanRatios.subjectRatios;

  return {
    weekdayHours:
      typeof raw.weekdayHours === 'number' ? raw.weekdayHours : fallbackPlanRatios.weekdayHours,
    weekendHours:
      typeof raw.weekendHours === 'number' ? raw.weekendHours : fallbackPlanRatios.weekendHours,
    exerciseRatio:
      typeof raw.exerciseRatio === 'number' ? raw.exerciseRatio : fallbackPlanRatios.exerciseRatio,
    subjectRatios,
  };
};

const getPatternKey = (memo: string | null): string | null => {
  if (!memo) return null;
  if (memo.includes('処分性')) return '処分性';
  if (memo.includes('原告適格')) return '原告適格';
  if (memo.includes('あてはめ')) return 'あてはめ';
  if (memo.includes('時間')) return '時間配分';
  if (memo.length > 0) return '規範・論点整理';
  return null;
};

const ACTIVITY_LABELS: Record<string, string> = {
  input: 'インプット',
  drill: '演習',
  review: '復習',
  write: '答案作成',
};

const buildHeatmapRange = (baseDate: Date = new Date(), weeks = 26) => {
  const start = startOfWeek(subWeeks(baseDate, weeks - 1), { weekStartsOn: 1 });
  const end = endOfWeek(baseDate, { weekStartsOn: 1 });
  const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const dates = Array.from({ length: days }, (_, idx) => format(addDays(start, idx), 'yyyy-MM-dd'));
  return {
    dates,
    start: format(start, "yyyy-MM-dd'T'00:00:00XXX"),
    end: format(end, "yyyy-MM-dd'T'23:59:59XXX"),
  };
};

export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    const plan = await getOrCreateWeeklyPlan();
    const planRatios = parsePlanRatios(plan);

    const range = getWeekRange(new Date());
    const prevRange = getWeekRange(subWeeks(new Date(), 1));
    const heatmapRange = buildHeatmapRange();
    const heatmapDates = heatmapRange.dates;
    const [weekSessions, previousWeekSessions, recentSessions, heatmapSessions] = await Promise.all([
      listStudySessionsInRange({ from: range.start, to: range.end, limit: 1000 }),
      listStudySessionsInRange({ from: prevRange.start, to: prevRange.end, limit: 1000 }),
      listRecentStudySessions(12),
      listStudySessionsInRange({ from: heatmapRange.start, to: heatmapRange.end, limit: 10000 }),
    ]);

    const weekDates = buildWeekDates();
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    const weeklyMinutes = weekSessions.reduce((acc, cur) => acc + cur.duration_min, 0);
    const weeklyHoursText = (weeklyMinutes / 60).toFixed(1);
    const previousWeeklyMinutes = previousWeekSessions.reduce((acc, cur) => acc + cur.duration_min, 0);
    const momentumPercent =
      previousWeeklyMinutes === 0
        ? weeklyMinutes > 0
          ? 100
          : 0
        : Math.round(((weeklyMinutes - previousWeeklyMinutes) / previousWeeklyMinutes) * 100);

    const exerciseMinutes = weekSessions
      .filter((session) => session.activity === 'drill' || session.activity === 'write')
      .reduce((acc, cur) => acc + cur.duration_min, 0);
    const exerciseRatio = weeklyMinutes > 0 ? Math.round((exerciseMinutes / weeklyMinutes) * 100) : 0;

    const dailyMinutes = weekDates.map((date) => ({
      date,
      minutes: weekSessions
        .filter((session) => session.started_at.startsWith(date))
        .reduce((acc, cur) => acc + cur.duration_min, 0),
    }));

    const heatmapAggregate = new Map<string, { minutes: number; sessions: number }>();
    heatmapSessions.forEach((session) => {
      const dateKey = session.started_at.slice(0, 10);
      const current = heatmapAggregate.get(dateKey) ?? { minutes: 0, sessions: 0 };
      heatmapAggregate.set(dateKey, {
        minutes: current.minutes + session.duration_min,
        sessions: current.sessions + 1,
      });
    });
    const heatmapDays = heatmapDates.map((date) => ({
      date,
      minutes: heatmapAggregate.get(date)?.minutes ?? 0,
      sessions: heatmapAggregate.get(date)?.sessions ?? 0,
    }));
    const heatmapMaxMinutes = heatmapDays.reduce((max, day) => Math.max(max, day.minutes), 0);

    const subjectBreakdown = SUBJECTS.reduce<Record<string, number>>((acc, subject) => {
      acc[subject] = 0;
      return acc;
    }, {});
    weekSessions.forEach((session) => {
      subjectBreakdown[session.subject] = (subjectBreakdown[session.subject] ?? 0) + session.duration_min;
    });
    const coverageCount = Object.values(subjectBreakdown).filter((minutes) => minutes > 0).length;

    const focusSubjects = SUBJECTS.map((subject) => {
      const weeklyMinutesBySubject = subjectBreakdown[subject] ?? 0;
      const currentPct = weeklyMinutes > 0 ? Math.round((weeklyMinutesBySubject / weeklyMinutes) * 100) : 0;
      const targetPct = planRatios.subjectRatios[subject] ?? 0;
      return {
        subject,
        weeklyMinutes: weeklyMinutesBySubject,
        currentPct,
        targetPct,
        gapPct: targetPct - currentPct,
      };
    })
      .sort((a, b) => b.gapPct - a.gapPct || a.weeklyMinutes - b.weeklyMinutes)
      .slice(0, 3);

    const activityMinutes = new Map<string, number>();
    weekSessions.forEach((session) => {
      activityMinutes.set(session.activity, (activityMinutes.get(session.activity) ?? 0) + session.duration_min);
    });
    const activityMix = [...activityMinutes.entries()]
      .map(([activity, minutes]) => ({
        activity,
        label: ACTIVITY_LABELS[activity] ?? activity,
        minutes,
        pct: weeklyMinutes > 0 ? Math.round((minutes / weeklyMinutes) * 100) : 0,
      }))
      .sort((a, b) => b.minutes - a.minutes);

    const weakCounter = new Map<string, number>();
    weekSessions
      .filter((session) => (session.confidence ?? 3) <= 2)
      .forEach((session) => {
        weakCounter.set(session.subject, (weakCounter.get(session.subject) ?? 0) + 1);
      });

    const reviewCounter = new Map<string, number>();
    weekSessions.forEach((session) => {
      const key = getPatternKey(session.memo);
      if (!key) return;
      reviewCounter.set(key, (reviewCounter.get(key) ?? 0) + 1);
    });

    const ronbunSessions = weekSessions.filter((session) => session.track === 'ronbun');
    const ronbunCauseCounter = new Map<string, number>();
    ronbunSessions.forEach((session) => {
      if (!session.cause_category) return;
      ronbunCauseCounter.set(
        session.cause_category,
        (ronbunCauseCounter.get(session.cause_category) ?? 0) + 1
      );
    });
    const ronbunCauseTotal = [...ronbunCauseCounter.values()].reduce((acc, val) => acc + val, 0);
    const ronbunCauseCounts = [...ronbunCauseCounter.entries()]
      .map(([category, count]) => ({
        category,
        count,
        pct: ronbunCauseTotal > 0 ? Math.round((count / ronbunCauseTotal) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const weakPoints = [...weakCounter.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
    const reviewPattern = [...reviewCounter.entries()].sort((a, b) => b[1] - a[1]);

    const todaySessions = weekSessions
      .filter((session) => session.started_at.startsWith(today))
      .sort((a, b) => parseISO(b.started_at).getTime() - parseISO(a.started_at).getTime());

    const yesterdayMemos = weekSessions.filter(
      (session) => session.started_at.startsWith(yesterday) && Boolean(session.memo)
    );

    const targetHours = planRatios.weekdayHours * 5 + planRatios.weekendHours * 2;

    return {
      weekDates,
      weekLabels: [...WEEKDAY_LABELS],
      dailyMinutes,
      heatmapDays,
      heatmapMaxMinutes,
      todaySessions,
      recentSessions,
      yesterdayMemos,
      weeklyHoursText,
      weeklyMinutes,
      exerciseRatio,
      subjectBreakdown,
      weakPoints,
      reviewPattern,
      plan,
      planRatios,
      targetHours,
      previousWeeklyMinutes,
      momentumPercent,
      coverageCount,
      focusSubjects,
      activityMix,
      ronbunCauseCounts,
    };
  } catch {
    const weekDates = buildWeekDates();
    const heatmapDates = buildHeatmapRange().dates;
    const subjectBreakdown = SUBJECTS.reduce<Record<string, number>>((acc, subject) => {
      acc[subject] = 0;
      return acc;
    }, {});

    return {
      weekDates,
      weekLabels: [...WEEKDAY_LABELS],
      dailyMinutes: weekDates.map((date) => ({ date, minutes: 0 })),
      heatmapDays: heatmapDates.map((date) => ({ date, minutes: 0, sessions: 0 })),
      heatmapMaxMinutes: 0,
      todaySessions: [],
      recentSessions: [],
      yesterdayMemos: [],
      weeklyHoursText: '0.0',
      weeklyMinutes: 0,
      exerciseRatio: 0,
      subjectBreakdown,
      weakPoints: [],
      reviewPattern: [],
      plan: {
        id: 'fallback',
        user_id: 'fallback',
        week_start: weekDates[0],
        target_min: DEFAULT_WEEKLY_PLAN.weekdayHours * 5 * 60 + DEFAULT_WEEKLY_PLAN.weekendHours * 2 * 60,
        ratios: DEFAULT_WEEKLY_PLAN as unknown as WeeklyPlanRow['ratios'],
        created_at: new Date().toISOString(),
      },
      planRatios: fallbackPlanRatios,
      targetHours: fallbackPlanRatios.weekdayHours * 5 + fallbackPlanRatios.weekendHours * 2,
      previousWeeklyMinutes: 0,
      momentumPercent: 0,
      coverageCount: 0,
      focusSubjects: SUBJECTS.map((subject) => ({
        subject,
        weeklyMinutes: 0,
        currentPct: 0,
        targetPct: fallbackPlanRatios.subjectRatios[subject] ?? 0,
        gapPct: fallbackPlanRatios.subjectRatios[subject] ?? 0,
      })).slice(0, 3),
      activityMix: [],
      ronbunCauseCounts: [],
    };
  }
};
