'use client';

import { CalendarCheck, Sparkles, Target } from 'lucide-react';
import { useState, useTransition } from 'react';

import { updateWeeklyPlanAction } from '@/app/plan/actions';
import { Button } from '@/components/ui/button';
import { MiniBar } from '@/components/ui/minibar';
import { SUBJECTS } from '@/lib/constants';
import type { DashboardData } from '@/lib/dashboard';

type PlanViewProps = {
  data: DashboardData;
};

export function PlanView({ data }: PlanViewProps) {
  const [targetHours, setTargetHours] = useState(data.targetHours);
  const [weekdayHours, setWeekdayHours] = useState(data.planRatios.weekdayHours);
  const [weekendHours, setWeekendHours] = useState(data.planRatios.weekendHours);
  const [exerciseRatio, setExerciseRatio] = useState(data.planRatios.exerciseRatio);
  const [focusedSubjectNames, setFocusedSubjectNames] = useState<string[]>(
    data.planRatios.focusedSubjectNames || []
  );
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const actualHours = data.weeklyMinutes / 60;
  const progress = targetHours > 0 ? Math.min((actualHours / targetHours) * 100, 100) : 0;
  const schedules = data.weekDates.map((date, idx) => ({
    date,
    day: data.weekLabels[idx],
    target: idx >= 5 ? weekendHours : weekdayHours,
    actual: data.dailyMinutes[idx]?.minutes ?? 0,
    isWeekend: idx >= 5,
  }));

  const focusSubject = data.focusSubjects[0];

  const submit = () => {
    startTransition(async () => {
      try {
        const result = await updateWeeklyPlanAction({
          targetHours,
          weekdayHours,
          weekendHours,
          exerciseRatio,
          focusedSubjectNames,
        });
        setMessage(result.message);
        // ページ再読み込みで確実に最新データを取得
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Failed to update weekly plan:', errorMessage);
        setMessage(`更新に失敗しました: ${errorMessage}`);
      }
    });
  };

  const toggleSubject = (subject: string) => {
    setFocusedSubjectNames((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  return (
    <div className='flex flex-col gap-4'>
      <section className='relative overflow-hidden rounded-[22px] border border-white/20 bg-[linear-gradient(135deg,rgba(126,87,255,0.9),rgba(255,95,109,0.88)_55%,rgba(17,26,56,0.92))] p-6 text-white shadow-[0_22px_50px_rgba(24,14,62,0.35)]'>
        <div className='pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/15 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-14 right-0 h-48 w-48 rounded-full bg-cyan-300/25 blur-3xl' />

        <div className='relative grid grid-cols-[1.2fr_1fr] gap-4 max-lg:grid-cols-1'>
          <div>
            <p className='mb-2 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/20 px-3 py-1 font-mono text-[10px] tracking-[0.12em]'>
              <CalendarCheck size={12} />
              WEEKLY PLAN
            </p>
            <h1 className='text-[30px] font-black leading-[1.12] tracking-[-0.03em]'>週間計画ダッシュボード</h1>
            <p className='mt-1.5 text-[13px] text-white/85'>
              今週の実績と目標を並べて、次の一手をすぐ決める。
            </p>
            <div className='mt-3 flex flex-wrap gap-2'>
              <span className='rounded-full border border-white/30 bg-black/20 px-3 py-1 text-[11px] font-semibold'>
                実績 {actualHours.toFixed(1)}h
              </span>
              <span className='rounded-full border border-white/30 bg-black/20 px-3 py-1 text-[11px] font-semibold'>
                進捗 {progress.toFixed(0)}%
              </span>
              <span className='rounded-full border border-white/30 bg-black/20 px-3 py-1 text-[11px] font-semibold'>
                演習比率 {exerciseRatio}%
              </span>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-2.5'>
            <div className='rounded-[14px] border border-white/25 bg-black/20 p-3'>
              <p className='font-mono text-[10px] tracking-[0.12em] text-white/70'>TARGET</p>
              <p className='mt-1 text-[28px] font-black leading-none'>{targetHours}h</p>
              <p className='mt-1 text-[11px] text-white/75'>週目標</p>
            </div>
            <div className='rounded-[14px] border border-white/25 bg-black/20 p-3'>
              <p className='font-mono text-[10px] tracking-[0.12em] text-white/70'>WEEKDAY</p>
              <p className='mt-1 text-[28px] font-black leading-none'>{weekdayHours}h</p>
              <p className='mt-1 text-[11px] text-white/75'>平日配分</p>
            </div>
            <div className='rounded-[14px] border border-white/25 bg-black/20 p-3'>
              <p className='font-mono text-[10px] tracking-[0.12em] text-white/70'>WEEKEND</p>
              <p className='mt-1 text-[28px] font-black leading-none'>{weekendHours}h</p>
              <p className='mt-1 text-[11px] text-white/75'>休日配分</p>
            </div>
            <div className='rounded-[14px] border border-white/25 bg-black/20 p-3'>
              <p className='font-mono text-[10px] tracking-[0.12em] text-white/70'>FOCUS</p>
              <p className='mt-1 text-[28px] font-black leading-none'>{focusSubject?.subject ?? '—'}</p>
              <p className='mt-1 text-[11px] text-white/75'>不足科目</p>
            </div>
          </div>
        </div>
      </section>

      {message && <div className='card border border-success/30 bg-successLight p-3 text-sm text-success'>{message}</div>}

      <div className='grid grid-cols-[minmax(280px,1fr)_minmax(280px,1fr)] gap-4 max-lg:grid-cols-1'>
        <div className='card card-soft'>
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <p className='text-sm font-bold'>週間目標</p>
              <p className='text-[11px] text-sub'>今週の到達ラインと配分を調整</p>
            </div>
            <p className='text-xs font-bold' style={{ color: actualHours >= targetHours ? 'var(--success)' : 'var(--warn)' }}>
              {actualHours.toFixed(1)}h / {targetHours}h
            </p>
          </div>
          <MiniBar
            value={actualHours}
            max={targetHours}
            h={10}
            color={actualHours >= targetHours * 0.8 ? 'var(--success)' : actualHours >= targetHours * 0.5 ? 'var(--warn)' : 'var(--danger)'}
          />

          <div className='mt-4 grid grid-cols-2 gap-3'>
            <div>
              <p className='mb-1 text-xs text-sub'>週目標(時間)</p>
              <input
                type='number'
                min={1}
                className='input h-10'
                value={targetHours}
                onChange={(event) => setTargetHours(Number(event.target.value || 0))}
              />
            </div>
            <div>
              <p className='mb-1 text-xs text-sub'>演習比率(%)</p>
              <input
                type='number'
                min={0}
                max={100}
                className='input h-10'
                value={exerciseRatio}
                onChange={(event) => setExerciseRatio(Number(event.target.value || 0))}
              />
            </div>
            <div>
              <p className='mb-1 text-xs text-sub'>平日(時間)</p>
              <input
                type='number'
                min={1}
                className='input h-10'
                value={weekdayHours}
                onChange={(event) => setWeekdayHours(Number(event.target.value || 0))}
              />
            </div>
            <div>
              <p className='mb-1 text-xs text-sub'>休日(時間)</p>
              <input
                type='number'
                min={1}
                className='input h-10'
                value={weekendHours}
                onChange={(event) => setWeekendHours(Number(event.target.value || 0))}
              />
            </div>
          </div>
          <Button variant='accent' className='mt-4 w-full' onClick={submit} disabled={isPending}>
            {isPending ? '更新中...' : '週間計画を保存'}
          </Button>
        </div>

        <div className='card card-soft'>
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <p className='text-sm font-bold'>今週のフォーカス科目</p>
              <p className='text-[11px] text-sub'>優先したい科目を選択（複数可）</p>
            </div>
            {focusedSubjectNames.length > 0 && (
              <p className='text-xs font-bold text-accent'>{focusedSubjectNames.length}個選択</p>
            )}
          </div>
          <div className='grid grid-cols-2 gap-2'>
            {SUBJECTS.map((subject) => (
              <button
                key={subject}
                onClick={() => toggleSubject(subject)}
                className='rounded-lg border-2 px-3 py-2.5 text-sm font-semibold transition-colors'
                style={{
                  borderColor: focusedSubjectNames.includes(subject) ? 'var(--accent)' : 'var(--border)',
                  backgroundColor: focusedSubjectNames.includes(subject) ? 'var(--accentLight)' : 'transparent',
                  color: focusedSubjectNames.includes(subject) ? 'var(--accent)' : 'var(--text)',
                }}
              >
                {subject}
              </button>
            ))}
          </div>
          {focusedSubjectNames.length > 0 && (
            <div className='mt-3 flex flex-wrap gap-2'>
              {focusedSubjectNames.map((subject) => (
                <span
                  key={subject}
                  className='rounded-full bg-accentLight px-3 py-1 text-xs font-bold text-accent'
                >
                  {subject}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className='card card-soft'>
          <p className='mb-4 text-sm font-bold'>日別の配分</p>
          {schedules.map((day) => {
            const targetMin = day.target * 60;
            const percentage = targetMin > 0 ? Math.min((day.actual / targetMin) * 100, 100) : 0;

            return (
              <div key={day.date} className='mb-[9px] flex items-center gap-2.5'>
                <div
                  className='flex size-[26px] items-center justify-center rounded-lg text-[11px] font-bold'
                  style={{
                    background: day.isWeekend ? 'var(--accentLight)' : 'var(--bg)',
                    color: day.isWeekend ? 'var(--accent)' : 'var(--text)',
                  }}
                >
                  {day.day}
                </div>
                <div className='flex-1'>
                  <div className='relative h-[22px] overflow-hidden rounded-md bg-borderLight'>
                    <div
                      className='h-full rounded-md transition-[width] duration-500'
                      style={{
                        width: `${Math.max(percentage, 2)}%`,
                        background: day.actual > targetMin ? 'var(--success)' : percentage >= 80 ? 'var(--accent2)' : '#1c1b1888',
                      }}
                    />
                    <div
                      className='absolute left-2 top-0 flex h-full items-center font-mono text-[11px] font-medium'
                      style={{ color: percentage > 40 ? 'white' : 'var(--sub)' }}
                    >
                      {day.actual > 0 ? `${(day.actual / 60).toFixed(1)}h` : '—'}
                    </div>
                  </div>
                </div>
                <div className='w-7 text-right text-[11px] text-muted'>{day.target}h</div>
              </div>
            );
          })}
        </div>

        <div className='card card-soft'>
          <p className='mb-4 text-sm font-bold'>科目別の配分ガイド</p>
          <div className='space-y-3'>
            {Object.entries(data.planRatios.subjectRatios)
              .sort((a, b) => b[1] - a[1])
              .map(([subject, targetPct]) => {
                const currentMinutes = data.subjectBreakdown[subject] ?? 0;
                const currentPct = data.weeklyMinutes > 0 ? Math.round((currentMinutes / data.weeklyMinutes) * 100) : 0;
                const gapPct = targetPct - currentPct;

                return (
                  <div key={subject} className='text-[12px]'>
                    <div className='mb-1.5 flex items-center justify-between'>
                      <span className='font-semibold text-text'>{subject}</span>
                      <div className='flex gap-2'>
                        <span className='text-sub'>現{currentPct}%</span>
                        <span className='text-muted'>目{targetPct}%</span>
                      </div>
                    </div>
                    <div className='flex gap-1.5'>
                      <div className='flex-1 h-2 rounded-sm overflow-hidden bg-borderLight'>
                        <div
                          className='h-full transition-[width] duration-300'
                          style={{
                            width: `${Math.min(currentPct, 100)}%`,
                            background: currentPct >= targetPct ? 'var(--success)' : 'var(--accent)',
                          }}
                        />
                      </div>
                      <div
                        className='px-1.5 py-0.5 rounded-md text-[10px] font-bold'
                        style={{
                          background: gapPct > 0 ? 'var(--dangerLight)' : 'var(--successLight)',
                          color: gapPct > 0 ? 'var(--danger)' : 'var(--success)',
                        }}
                      >
                        {gapPct > 0 ? `+${gapPct}%` : `${gapPct}%`}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div className='grid grid-cols-[minmax(280px,1fr)_minmax(280px,1fr)] gap-4 max-lg:grid-cols-1'>
        <div className='card card-soft'>
          <div className='mb-2.5 flex items-center gap-2'>
            <Target size={16} color='var(--accent)' />
            <span className='text-xs font-bold tracking-[0.08em] text-sub'>FOCUS PLAN</span>
          </div>
          <p className='text-sm font-semibold text-text'>
            {focusSubject
              ? `${focusSubject.subject} は目標比で ${focusSubject.gapPct}%不足。今週は +${Math.max(1, focusSubject.gapPct)}% を優先。`
              : '今週データが不足しています。まずは1件記録して傾向を作りましょう。'}
          </p>
          <div className='mt-3 flex flex-wrap gap-2'>
            <span className='rounded-md bg-accentLight px-2.5 py-1 text-[11px] font-bold text-accent'>
              {focusSubject?.subject ?? '優先科目'}
            </span>
            <span className='rounded-md bg-borderLight px-2.5 py-1 text-[11px] font-semibold text-sub'>
              現在 {focusSubject?.currentPct ?? 0}%
            </span>
            <span className='rounded-md bg-borderLight px-2.5 py-1 text-[11px] font-semibold text-sub'>
              目標 {focusSubject?.targetPct ?? 0}%
            </span>
          </div>
          <MiniBar className='mt-3' value={focusSubject?.currentPct ?? 0} max={Math.max(focusSubject?.targetPct ?? 0, 1)} color='var(--accent)' h={8} />
        </div>

        <div className='card bg-[linear-gradient(135deg,var(--dark),var(--darkSoft))] text-white'>
          <div className='mb-2.5 flex items-center gap-2'>
            <Sparkles size={16} color='var(--accent)' />
            <span className='text-xs font-bold tracking-[0.08em] text-white/50'>AI 週次提案</span>
          </div>
          <p className='text-sm leading-[1.7] text-white/85'>
            今週は「{focusSubject?.subject ?? '行政法'}」が目標比で不足しています。来週は演習比率を +10% にして、重要論点を短答→論文の順で復習しましょう。
          </p>
          <div className='mt-3 flex gap-2'>
            <span className='rounded-md bg-accent/20 px-2.5 py-1 text-[11px] font-bold text-accent'>
              {focusSubject?.subject ?? '行政法'} +10%
            </span>
            <span className='rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/55'>演習重視</span>
          </div>
        </div>
      </div>
    </div>
  );
}
