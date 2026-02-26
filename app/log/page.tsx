import { format, startOfWeek } from 'date-fns';
import { Activity, BookOpenText, Clock3, Gauge, NotebookPen, Sparkles } from 'lucide-react';

import { LogHistoryPanel } from '@/components/log/log-history-panel';
import { LogForm } from '@/components/log/log-form';
import { MiniBar } from '@/components/ui/minibar';
import { listRecentStudySessions } from '@/lib/supabase/queries';
import type { StudySessionRow } from '@/lib/supabase/queries';

const activityLabelMap: Record<string, string> = {
  input: 'インプット',
  drill: '演習',
  review: '復習',
  write: '答案作成',
};

export default async function LogPage() {
  let sessions: StudySessionRow[] = [];
  try {
    sessions = await listRecentStudySessions(60);
  } catch {
    sessions = [];
  }

  const now = new Date();
  const todayKey = format(now, 'yyyy-MM-dd');
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });

  const todaySessions = sessions.filter((s) => s.started_at.startsWith(todayKey));
  const weekSessions = sessions.filter((s) => new Date(s.started_at) >= weekStart);
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.duration_min, 0);
  const weekMinutes = weekSessions.reduce((acc, s) => acc + s.duration_min, 0);
  const avgConfidence = sessions.length
    ? (sessions.reduce((acc, s) => acc + (s.confidence ?? 3), 0) / sessions.length).toFixed(1)
    : '0.0';
  const coverageCount = new Set(weekSessions.map((s) => s.subject)).size;

  const minutesBySubject = new Map<string, number>();
  weekSessions.forEach((session) => {
    minutesBySubject.set(session.subject, (minutesBySubject.get(session.subject) ?? 0) + session.duration_min);
  });
  const focusSubject =
    [...minutesBySubject.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '民法';
  const focusMinutes =
    [...minutesBySubject.entries()].sort((a, b) => b[1] - a[1])[0]?.[1] ?? 0;

  const activityMinutes = new Map<string, number>();
  weekSessions.forEach((session) => {
    activityMinutes.set(session.activity, (activityMinutes.get(session.activity) ?? 0) + session.duration_min);
  });
  const activityRows = [...activityMinutes.entries()].sort((a, b) => b[1] - a[1]);
  const topActivity = activityRows[0];

  return (
    <div className='flex flex-col gap-4'>
      <section className='relative overflow-hidden rounded-[22px] border border-white/20 bg-[linear-gradient(135deg,rgba(126,87,255,0.88),rgba(255,95,109,0.85)_55%,rgba(18,27,54,0.9))] p-6 text-white shadow-[0_22px_50px_rgba(24,14,62,0.35)]'>
        <div className='pointer-events-none absolute -left-12 -top-12 h-52 w-52 rounded-full bg-white/15 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-14 right-0 h-48 w-48 rounded-full bg-cyan-300/25 blur-3xl' />

        <div className='relative grid grid-cols-[1.2fr_1fr] gap-4 max-lg:grid-cols-1'>
          <div>
            <p className='mb-2 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/20 px-3 py-1 font-mono text-[10px] tracking-[0.12em]'>
              <NotebookPen size={12} />
              LOG STATION
            </p>
            <h1 className='text-[30px] font-black leading-[1.12] tracking-[-0.03em]'>学習ログ管理</h1>
            <p className='mt-1.5 text-[13px] text-white/85'>
              1セッションごとに記録して、後から復習優先度と科目バランスを最適化します。
            </p>
            <div className='mt-3 flex flex-wrap gap-2'>
              <span className='rounded-full border border-white/30 bg-black/20 px-3 py-1 text-[11px] font-semibold'>
                今週 {weekMinutes > 0 ? (weekMinutes / 60).toFixed(1) : '0.0'}h
              </span>
              <span className='rounded-full border border-white/30 bg-black/20 px-3 py-1 text-[11px] font-semibold'>
                最多科目 {focusSubject}
              </span>
              <span className='rounded-full border border-white/30 bg-black/20 px-3 py-1 text-[11px] font-semibold'>
                科目カバー {coverageCount}
              </span>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-2.5'>
            <div className='rounded-[14px] border border-white/25 bg-black/20 p-3'>
              <p className='font-mono text-[10px] tracking-[0.12em] text-white/70'>TODAY</p>
              <p className='mt-1 text-[28px] font-black leading-none'>{todaySessions.length}</p>
              <p className='mt-1 text-[11px] text-white/75'>本日の記録件数</p>
            </div>
            <div className='rounded-[14px] border border-white/25 bg-black/20 p-3'>
              <p className='font-mono text-[10px] tracking-[0.12em] text-white/70'>WEEK</p>
              <p className='mt-1 text-[28px] font-black leading-none'>{(weekMinutes / 60).toFixed(1)}h</p>
              <p className='mt-1 text-[11px] text-white/75'>週合計時間</p>
            </div>
            <div className='rounded-[14px] border border-white/25 bg-black/20 p-3'>
              <p className='font-mono text-[10px] tracking-[0.12em] text-white/70'>CONF</p>
              <p className='mt-1 text-[28px] font-black leading-none'>{avgConfidence}</p>
              <p className='mt-1 text-[11px] text-white/75'>平均手応え</p>
            </div>
            <div className='rounded-[14px] border border-white/25 bg-black/20 p-3'>
              <p className='font-mono text-[10px] tracking-[0.12em] text-white/70'>FOCUS</p>
              <p className='mt-1 text-[28px] font-black leading-none'>{(focusMinutes / 60).toFixed(1)}h</p>
              <p className='mt-1 text-[11px] text-white/75'>{focusSubject}</p>
            </div>
          </div>
        </div>
      </section>

      <div className='grid grid-cols-[minmax(340px,1fr)_320px] gap-4 max-xl:grid-cols-1'>
        <LogForm defaultSubject={focusSubject} />

        <aside className='flex flex-col gap-4'>
          <section className='card card-soft p-5'>
            <div className='mb-3 flex items-center justify-between'>
              <p className='text-sm font-bold'>今週の記録サマリー</p>
              <Sparkles size={14} color='var(--accent)' />
            </div>
            <div className='space-y-3'>
              <div>
                <div className='mb-1 flex items-center justify-between text-[12px]'>
                  <span className='inline-flex items-center gap-1 text-sub'>
                    <Clock3 size={13} />
                    今日の学習時間
                  </span>
                  <span className='font-mono text-[11px] text-sub'>{(todayMinutes / 60).toFixed(1)}h</span>
                </div>
                <MiniBar value={todayMinutes} max={Math.max(weekMinutes, 1)} color='var(--accent)' h={7} />
              </div>
              <div>
                <div className='mb-1 flex items-center justify-between text-[12px]'>
                  <span className='inline-flex items-center gap-1 text-sub'>
                    <BookOpenText size={13} />
                    科目カバー率
                  </span>
                  <span className='font-mono text-[11px] text-sub'>{coverageCount}/8</span>
                </div>
                <MiniBar value={coverageCount} max={8} color='var(--accent2)' h={7} />
              </div>
              <div>
                <div className='mb-1 flex items-center justify-between text-[12px]'>
                  <span className='inline-flex items-center gap-1 text-sub'>
                    <Activity size={13} />
                    最多アクティビティ
                  </span>
                  <span className='font-mono text-[11px] text-sub'>
                    {topActivity ? `${activityLabelMap[topActivity[0]] ?? topActivity[0]} ${(topActivity[1] / 60).toFixed(1)}h` : '未記録'}
                  </span>
                </div>
                <MiniBar
                  value={topActivity?.[1] ?? 0}
                  max={Math.max(...activityRows.map(([, minutes]) => minutes), 1)}
                  color='var(--accent3)'
                  h={7}
                />
              </div>
            </div>
          </section>

          <section className='card card-soft p-5'>
            <div className='mb-2 flex items-center gap-2'>
              <Gauge size={15} color='var(--accent2)' />
              <p className='text-sm font-bold'>入力ガイド</p>
            </div>
            <ul className='space-y-2 text-[12px] text-sub'>
              <li>科目と教材だけは必須。まずここを決める。</li>
              <li>手応え1-2の時は、メモを必ず1行残す。</li>
              <li>時間は迷ったら 60分 または 90分 を使う。</li>
              <li>同一テーマは分割して記録すると後の分析精度が上がる。</li>
            </ul>
          </section>
        </aside>
      </div>

      <LogHistoryPanel sessions={sessions} />
    </div>
  );
}
