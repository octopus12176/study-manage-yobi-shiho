'use client';

import { Sparkles } from 'lucide-react';
import { useState, useTransition } from 'react';

import { updateWeeklyPlanAction } from '@/app/plan/actions';
import { Button } from '@/components/ui/button';
import { MiniBar } from '@/components/ui/minibar';
import type { DashboardData } from '@/lib/dashboard';

type PlanViewProps = {
  data: DashboardData;
};

export function PlanView({ data }: PlanViewProps) {
  const [targetHours, setTargetHours] = useState(data.targetHours);
  const [weekdayHours, setWeekdayHours] = useState(data.planRatios.weekdayHours);
  const [weekendHours, setWeekendHours] = useState(data.planRatios.weekendHours);
  const [exerciseRatio, setExerciseRatio] = useState(data.planRatios.exerciseRatio);
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const actualHours = data.weeklyMinutes / 60;
  const schedules = data.weekDates.map((date, idx) => ({
    date,
    day: data.weekLabels[idx],
    target: idx >= 5 ? weekendHours : weekdayHours,
    actual: data.dailyMinutes[idx]?.minutes ?? 0,
    isWeekend: idx >= 5,
  }));

  const submit = () => {
    startTransition(async () => {
      const result = await updateWeeklyPlanAction({
        targetHours,
        weekdayHours,
        weekendHours,
        exerciseRatio,
      });
      setMessage(result.message);
    });
  };

  return (
    <div className='flex flex-col gap-4'>
      <h1 className='text-[20px] font-black tracking-[-0.02em]'>週間計画</h1>

      {message && <div className='card border border-success/30 bg-successLight p-3 text-sm text-success'>{message}</div>}

      <div className='grid grid-cols-[minmax(280px,1fr)_minmax(280px,1fr)] gap-4 max-lg:grid-cols-1'>
        <div className='card'>
          <div className='mb-4 flex items-center justify-between'>
            <p className='text-sm font-bold'>週間目標</p>
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
          <Button variant='default' className='mt-4 w-full' onClick={submit} disabled={isPending}>
            {isPending ? '更新中...' : '週間計画を保存'}
          </Button>
        </div>

        <div className='card'>
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
                        background: day.actual > targetMin ? 'var(--success)' : percentage >= 80 ? 'var(--text)' : '#1c1b1888',
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
      </div>

      <div className='card bg-[linear-gradient(135deg,var(--dark),var(--darkSoft))] text-white'>
        <div className='mb-2.5 flex items-center gap-2'>
          <Sparkles size={16} color='var(--accent)' />
          <span className='text-xs font-bold tracking-[0.08em] text-white/50'>AI 週次提案</span>
        </div>
        <p className='text-sm leading-[1.7] text-white/85'>
          今週は行政法の手応えが低めです。来週は行政法の演習比率を+10%にし、特に処分性・原告適格の過去問を重点的に回すことをおすすめします。
        </p>
        <div className='mt-3 flex gap-2'>
          <span className='rounded-md bg-accent/20 px-2.5 py-1 text-[11px] font-bold text-accent'>行政法 +10%</span>
          <span className='rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/55'>演習重視</span>
        </div>
      </div>
    </div>
  );
}
