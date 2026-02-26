import Link from 'next/link';
import { Sparkles, Target, TriangleAlert } from 'lucide-react';

import { ConfDots } from '@/components/ui/confdots';
import { MiniBar } from '@/components/ui/minibar';
import type { DashboardData } from '@/lib/dashboard';

type DashboardViewProps = {
  data: DashboardData;
};

export function DashboardView({ data }: DashboardViewProps) {
  const maxDaily = Math.max(...data.dailyMinutes.map((d) => d.minutes), 1);
  const weeklyProgress = Math.min((Number(data.weeklyHoursText) / data.targetHours) * 100, 100);
  const totalSubjectMinutes = Object.values(data.subjectBreakdown).reduce((acc, cur) => acc + cur, 0);

  return (
    <section className='flex flex-col gap-4'>
      {data.yesterdayMemos.length > 0 && (
        <Link
          href='/review'
          className='flex cursor-pointer items-center justify-between rounded-[14px] bg-[linear-gradient(135deg,var(--accent),var(--accentDark))] px-5 py-4'
        >
          <div>
            <p className='mb-1 text-[11px] font-bold tracking-[0.08em] text-white/65'>AI レビュー</p>
            <p className='text-sm font-semibold text-white'>昨日の詰まりから今日の復習を提案</p>
          </div>
          <span className='rounded-[10px] bg-white/20 px-3 py-2'>
            <Sparkles size={18} color='white' />
          </span>
        </Link>
      )}

      <div className='grid grid-cols-3 gap-[10px] max-md:grid-cols-1'>
        {[
          {
            value: data.weeklyHoursText,
            unit: '時間/週',
            barValue: Number(data.weeklyHoursText),
            barMax: data.targetHours,
            color: 'var(--accent)',
          },
          {
            value: `${data.exerciseRatio}%`,
            unit: '演習比率',
            barValue: data.exerciseRatio,
            barMax: 100,
            color: data.exerciseRatio >= data.planRatios.exerciseRatio ? 'var(--success)' : 'var(--warn)',
          },
          {
            value: String(data.todaySessions.length),
            unit: '今日のログ',
            barValue: data.todaySessions.reduce((acc, cur) => acc + cur.duration_min, 0),
            barMax: 180,
            color: 'var(--success)',
          },
        ].map((card, idx) => (
          <div key={card.unit} className='card p-4 text-center' style={{ animation: `countUp ${0.3 + idx * 0.1}s ease` }}>
            <p className='font-mono text-[26px] font-black tracking-[-0.03em]'>{card.value}</p>
            <p className='mt-0.5 text-[11px] font-medium text-sub'>{card.unit}</p>
            <MiniBar className='mt-2' value={card.barValue} max={card.barMax} color={card.color} />
          </div>
        ))}
      </div>

      <div className='card'>
        <div className='mb-4 flex items-center justify-between'>
          <p className='text-sm font-bold'>今週の学習時間</p>
          <p className='text-[11px] text-sub'>
            目標 {data.targetHours}h / 達成 {weeklyProgress.toFixed(0)}%
          </p>
        </div>
        <div className='flex h-[120px] items-end gap-2'>
          {data.dailyMinutes.map((day, idx) => {
            const height = maxDaily > 0 ? (day.minutes / maxDaily) * 100 : 0;
            const isToday = day.date === new Date().toISOString().split('T')[0];

            return (
              <div key={day.date} className='flex flex-1 flex-col items-center gap-1.5'>
                <span className='font-mono text-[10px] font-medium text-sub'>
                  {day.minutes > 0 ? `${(day.minutes / 60).toFixed(1)}h` : ''}
                </span>
                <div
                  className='w-full max-w-[42px] rounded-md transition-[height] duration-500'
                  style={{
                    minHeight: 4,
                    height: `${Math.max(height, 4)}%`,
                    background: isToday ? 'var(--accent)' : day.minutes > 0 ? 'var(--text)' : 'var(--border)',
                    opacity: isToday ? 1 : day.minutes > 0 ? 0.65 : 0.25,
                  }}
                />
                <span className={isToday ? 'text-[11px] font-bold text-accent' : 'text-[11px] font-medium text-sub'}>
                  {data.weekLabels[idx]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className='grid grid-cols-[minmax(280px,1fr)_minmax(280px,1fr)] gap-4 max-lg:grid-cols-1'>
        <div className='card'>
          <p className='mb-3.5 text-sm font-bold'>科目配分</p>
          {Object.entries(data.subjectBreakdown).map(([subject, min]) => {
            const percentage = totalSubjectMinutes > 0 ? Math.round((min / totalSubjectMinutes) * 100) : 0;
            const target = data.planRatios.subjectRatios[subject] ?? 0;
            return (
              <div key={subject} className='mb-[7px] flex items-center gap-2'>
                <span className='w-12 shrink-0 text-xs font-semibold'>{subject}</span>
                <MiniBar
                  className='flex-1'
                  value={percentage}
                  max={Math.max(...Object.values(data.planRatios.subjectRatios), 1)}
                  color={Math.abs(percentage - target) > 10 ? 'var(--warn)' : 'var(--text)'}
                  h={7}
                />
                <span className='w-8 text-right font-mono text-[11px] text-sub'>{percentage}%</span>
                <span className='w-8 text-right text-[10px] text-muted'>/{target}%</span>
              </div>
            );
          })}
        </div>

        <div className='flex flex-col gap-4'>
          {data.weakPoints.length > 0 && (
            <div className='card border-l-[3px] border-l-danger'>
              <div className='mb-2.5 flex items-center gap-2'>
                <Target size={15} color='var(--danger)' />
                <p className='text-sm font-bold'>弱点トップ3</p>
              </div>
              {data.weakPoints.map(([subject, count], idx) => (
                <div key={subject} className='flex items-center justify-between border-b border-borderLight py-[7px] last:border-none'>
                  <div className='flex items-center gap-2'>
                    <span
                      className='flex size-5 items-center justify-center rounded-md text-[10px] font-bold'
                      style={{
                        background: idx === 0 ? 'var(--danger)' : idx === 1 ? 'var(--warn)' : 'var(--border)',
                        color: idx < 2 ? 'white' : 'var(--sub)',
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span className='text-[13px] font-semibold'>{subject}</span>
                  </div>
                  <span className='text-xs text-sub'>低×{count}</span>
                </div>
              ))}
            </div>
          )}

          {data.reviewPattern.length > 0 && data.reviewPattern[0][1] >= 2 && (
            <div className='card border-[#FFE0B2] bg-warnLight'>
              <div className='mb-1.5 flex items-center gap-2'>
                <TriangleAlert size={15} color='var(--warn)' />
                <span className='text-[13px] font-bold text-[#E65100]'>繰り返しパターン</span>
              </div>
              <p className='text-[13px] text-text'>
                「{data.reviewPattern[0][0]}」が{data.reviewPattern[0][1]}回発生
              </p>
            </div>
          )}
        </div>
      </div>

      {data.recentSessions.length > 0 && (
        <div>
          <p className='mb-2.5 pl-0.5 text-sm font-bold'>Recent sessions</p>
          <div className='grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-2'>
            {data.recentSessions.slice(0, 8).map((session) => (
              <div key={session.id} className='card p-[14px]'>
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-2'>
                    <span className='inline-flex rounded-full border-[1.5px] border-text bg-text px-[10px] py-[3px] text-[11px] font-semibold text-white'>
                      {session.subject}
                    </span>
                    <span className='text-xs text-sub'>{session.material ?? '未設定'}</span>
                    <span className='text-[11px] text-muted'>· {session.track}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <ConfDots value={session.confidence ?? 3} size={6} />
                    <span className='font-mono text-xs text-sub'>{session.duration_min}分</span>
                  </div>
                </div>
                {session.memo && <p className='mt-1.5 pl-1 text-xs text-sub'>💭 {session.memo}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
