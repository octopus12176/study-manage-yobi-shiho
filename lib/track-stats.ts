import { addDays, endOfMonth, format, startOfMonth, subMonths } from 'date-fns';

import { CAUSE_CATEGORIES, SUBJECTS } from '@/lib/constants';
import { getTodayDateString } from '@/lib/date';
import { listStudySessionsInRange } from '@/lib/supabase/queries';
import type { StudySessionRow } from '@/lib/supabase/queries';

export type TrackPageData = {
  track: 'tantou' | 'ronbun';
  sessions: StudySessionRow[];
  subjectBreakdown: Record<string, number>;
  weakPoints: Array<[string, number]>;
  causeCounts?: Array<{
    category: string;
    count: number;
    pct: number;
  }>;
  totalMinutes: number;
  sessionCount: number;
  periodLabel: string;
};

/**
 * 直近90日間のトラック別統計データを取得
 */
export async function getTrackPageData(track: 'tantou' | 'ronbun'): Promise<TrackPageData> {
  const today = new Date();
  const ninetyDaysAgo = addDays(today, -90);

  const from = format(ninetyDaysAgo, "yyyy-MM-dd'T'00:00:00XXX");
  const to = format(today, "yyyy-MM-dd'T'23:59:59XXX");

  // トラック別のセッションを取得
  const sessions = await listStudySessionsInRange({
    from,
    to,
    track,
    limit: 5000,
  });

  // 科目別の学習時間を集計
  const subjectBreakdown = SUBJECTS.reduce<Record<string, number>>((acc, subject) => {
    acc[subject] = 0;
    return acc;
  }, {});

  sessions.forEach((session) => {
    subjectBreakdown[session.subject] = (subjectBreakdown[session.subject] ?? 0) + session.duration_min;
  });

  // 信頼度2以下の科目をカウント（弱点）
  const weakCounter = new Map<string, number>();
  sessions
    .filter((session) => (session.confidence ?? 3) <= 2)
    .forEach((session) => {
      weakCounter.set(session.subject, (weakCounter.get(session.subject) ?? 0) + 1);
    });

  const weakPoints = [...weakCounter.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  // 論文の場合のみ原因カテゴリを集計
  let causeCounts: Array<{ category: string; count: number; pct: number }> | undefined;
  if (track === 'ronbun') {
    const causeCounter = new Map<string, number>();
    sessions.forEach((session) => {
      if (!session.cause_category) return;
      causeCounter.set(
        session.cause_category,
        (causeCounter.get(session.cause_category) ?? 0) + 1
      );
    });
    const causeTotal = [...causeCounter.values()].reduce((acc, val) => acc + val, 0);
    causeCounts = [...causeCounter.entries()]
      .map(([category, count]) => ({
        category,
        count,
        pct: causeTotal > 0 ? Math.round((count / causeTotal) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }

  const totalMinutes = sessions.reduce((acc, cur) => acc + cur.duration_min, 0);
  const trackLabel = track === 'tantou' ? '短答' : '論文';

  return {
    track,
    sessions,
    subjectBreakdown,
    weakPoints,
    causeCounts,
    totalMinutes,
    sessionCount: sessions.length,
    periodLabel: `過去90日間の${trackLabel}学習`,
  };
}
