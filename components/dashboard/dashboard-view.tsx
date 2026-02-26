import Link from 'next/link';
import { ArrowUpRight, Flame, Radar, Sparkles, TriangleAlert } from 'lucide-react';

import { ConfDots } from '@/components/ui/confdots';
import { MiniBar } from '@/components/ui/minibar';
import type { DashboardData } from '@/lib/dashboard';

type DashboardViewProps = {
  data: DashboardData;
};

const trackLabelMap: Record<string, string> = {
  tantou: '短答',
  ronbun: '論文',
  review: '復習',
  mock: '模試/答練',
  other: 'その他',
};

export function DashboardView({ data }: DashboardViewProps) {
  const maxDaily = Math.max(...data.dailyMinutes.map((d) => d.minutes), 1);
  const totalSubjectMinutes = Object.values(data.subjectBreakdown).reduce((acc, cur) => acc + cur, 0);
  const weeklyHours = Number(data.weeklyHoursText);
  const weeklyProgress = Math.min((weeklyHours / data.targetHours) * 100, 100);
  const momentumText = `${data.momentumPercent > 0 ? '+' : ''}${data.momentumPercent}%`;
  const heroFocus = data.focusSubjects[0];
  const weeklyPracticeHours = ((weeklyHours * data.exerciseRatio) / 100).toFixed(1);

  return (
    <section className='flex flex-col gap-4'>
      {data.yesterdayMemos.length > 0 && (
        <Link
          href='/review'
          className='flex cursor-pointer items-center justify-between rounded-[16px] border border-white/15 bg-[linear-gradient(135deg,#ff5f6d,#845ef7)] px-5 py-4 shadow-[0_14px_34px_rgba(60,22,130,0.26)]'
        >
          <div>
            <p className='mb-1 text-[11px] font-bold tracking-[0.09em] text-white/70'>AI レビュー</p>
            <p className='text-sm font-semibold text-white'>昨日の詰まりから今日の復習を提案</p>
          </div>
          <span className='rounded-[10px] bg-white/20 px-3 py-2'>
            <Sparkles size={18} color='white' />
          </span>
        </Link>
      )}

      <div className='relative overflow-hidden rounded-[22px] border border-white/20 bg-[linear-gradient(135deg,rgba(126,87,255,0.82),rgba(255,105,140,0.8)_48%,rgba(13,20,43,0.9))] p-6 text-white shadow-[0_22px_50px_rgba(24,14,62,0.35)]'>
        <div className='pointer-events-none absolute -left-14 -top-14 h-56 w-56 rounded-full bg-white/15 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-16 right-0 h-52 w-52 rounded-full bg-cyan-300/25 blur-3xl' />

        <div className='relative grid grid-cols-[1.25fr_1fr] gap-5 max-lg:grid-cols-1'>
          <div>
            <p className='mb-2 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-3 py-1 font-mono text-[10px] tracking-[0.14em]'>
              <Radar size={12} />
              STUDY PULSE
            </p>
            <h2 className='text-[31px] font-black leading-[1.1] tracking-[-0.03em]'>
              今日のフォーカス:
              <br />
              <span className='text-[#FFE082]'>{heroFocus?.subject ?? '民法'}</span>
            </h2>
            <p className='mt-2 text-[13px] text-white/85'>
              {heroFocus
                ? `${heroFocus.subject} は目標比で ${heroFocus.gapPct > 0 ? `${heroFocus.gapPct}%不足` : `${Math.abs(heroFocus.gapPct)}%先行`}。今日はこの科目を中心に進めるとバランスが整います。`
                : '今週データを集計中です。最初の学習記録を追加してください。'}
            </p>
            <div className='mt-3.5 flex flex-wrap gap-2'>
              <span className='rounded-full border border-white/25 bg-black/20 px-3 py-1 text-[11px] font-semibold'>
                今週 {weeklyHours.toFixed(1)}h
              </span>
              <span className='rounded-full border border-white/25 bg-black/20 px-3 py-1 text-[11px] font-semibold'>
                演習 {weeklyPracticeHours}h
              </span>
              <span className='rounded-full border border-white/25 bg-black/20 px-3 py-1 text-[11px] font-semibold'>
                科目カバー {data.coverageCount}/8
              </span>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-2.5'>
            <div className='rounded-[14px] border border-white/20 bg-black/20 p-3'>
              <p className='font-mono text-[10px] tracking-[0.13em] text-white/70'>Momentum</p>
              <p className='mt-1 text-[28px] font-black leading-none'>{momentumText}</p>
              <p className='mt-1 text-[11px] text-white/75'>前週比</p>
            </div>
            <div className='rounded-[14px] border border-white/20 bg-black/20 p-3'>
              <p className='font-mono text-[10px] tracking-[0.13em] text-white/70'>Progress</p>
              <p className='mt-1 text-[28px] font-black leading-none'>{weeklyProgress.toFixed(0)}%</p>
              <p className='mt-1 text-[11px] text-white/75'>週目標に対して</p>
            </div>
            <div className='rounded-[14px] border border-white/20 bg-black/20 p-3'>
              <p className='font-mono text-[10px] tracking-[0.13em] text-white/70'>Today</p>
              <p className='mt-1 text-[28px] font-black leading-none'>{data.todaySessions.length}</p>
              <p className='mt-1 text-[11px] text-white/75'>本日のセッション数</p>
            </div>
            <div className='rounded-[14px] border border-white/20 bg-black/20 p-3'>
              <p className='font-mono text-[10px] tracking-[0.13em] text-white/70'>Exam Fit</p>
              <p className='mt-1 text-[28px] font-black leading-none'>{data.exerciseRatio}%</p>
              <p className='mt-1 text-[11px] text-white/75'>演習比率</p>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-4 gap-[10px] max-lg:grid-cols-2 max-md:grid-cols-1'>
        {[
          {
            value: data.weeklyHoursText,
            unit: '時間/週',
            barValue: weeklyHours,
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
            value: String(data.coverageCount),
            unit: '今週の科目数',
            barValue: data.coverageCount,
            barMax: 8,
            color: 'var(--accent3)',
          },
          {
            value: `${(data.previousWeeklyMinutes / 60).toFixed(1)}h`,
            unit: '前週実績',
            barValue: data.previousWeeklyMinutes,
            barMax: Math.max(data.weeklyMinutes, data.previousWeeklyMinutes, 60),
            color: 'var(--accent2)',
          },
        ].map((card, idx) => (
          <div key={card.unit} className='card p-4 text-center' style={{ animation: `countUp ${0.3 + idx * 0.1}s ease` }}>
            <p className='font-mono text-[26px] font-black tracking-[-0.03em]'>{card.value}</p>
            <p className='mt-0.5 text-[11px] font-medium text-sub'>{card.unit}</p>
            <MiniBar className='mt-2' value={card.barValue} max={card.barMax} color={card.color} />
          </div>
        ))}
      </div>

      <div className='grid grid-cols-[minmax(260px,1fr)_minmax(260px,1fr)_minmax(260px,1fr)] gap-4 max-xl:grid-cols-1'>
        <div className='card'>
          <div className='mb-3 flex items-center justify-between'>
            <p className='text-sm font-bold'>今日の重点科目</p>
            <span className='font-mono text-[10px] tracking-[0.08em] text-sub'>AUTO PICK</span>
          </div>
          <div className='flex flex-col gap-2'>
            {data.focusSubjects.map((focus, idx) => (
              <div key={focus.subject} className='rounded-xl border border-borderLight bg-bg px-3 py-2.5'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span className='inline-flex h-5 w-5 items-center justify-center rounded-md bg-text text-[10px] font-bold text-white'>
                      {idx + 1}
                    </span>
                    <p className='text-[13px] font-semibold'>{focus.subject}</p>
                  </div>
                  <span className='font-mono text-[11px] text-sub'>{(focus.weeklyMinutes / 60).toFixed(1)}h</span>
                </div>
                <p className='mt-1 text-[11px] text-sub'>実績 {focus.currentPct}% / 目標 {focus.targetPct}%</p>
                <MiniBar className='mt-1.5' value={focus.currentPct} max={Math.max(focus.targetPct, 1)} color='var(--accent)' h={6} />
              </div>
            ))}
          </div>
        </div>

        <div className='card'>
          <div className='mb-3 flex items-center justify-between'>
            <p className='text-sm font-bold'>直近セッション</p>
            <span className='font-mono text-[10px] tracking-[0.08em] text-sub'>LATEST</span>
          </div>
          <div className='flex flex-col gap-2'>
            {data.recentSessions.slice(0, 5).map((session) => (
              <div key={session.id} className='rounded-xl border border-borderLight bg-bg px-3 py-2.5'>
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-2'>
                    <span className='inline-flex rounded-full border border-text bg-text px-2 py-0.5 text-[10px] font-semibold text-white'>
                      {session.subject}
                    </span>
                    <span className='text-[11px] text-sub'>{trackLabelMap[session.track] ?? session.track}</span>
                  </div>
                  <span className='font-mono text-[11px] text-sub'>{session.duration_min}分</span>
                </div>
                <div className='mt-1.5 flex items-center justify-between'>
                  <span className='text-[11px] text-sub'>{session.material ?? '未設定'}</span>
                  <ConfDots value={session.confidence ?? 3} size={5} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='card'>
          <div className='mb-3 flex items-center justify-between'>
            <p className='text-sm font-bold'>学習タイプミックス</p>
            <span className='font-mono text-[10px] tracking-[0.08em] text-sub'>THIS WEEK</span>
          </div>
          <div className='flex flex-col gap-2.5'>
            {(data.activityMix.length > 0
              ? data.activityMix
              : [{ activity: 'none', label: 'データなし', minutes: 0, pct: 0 }]
            ).map((mix, idx) => (
              <div key={mix.activity} className='rounded-xl border border-borderLight bg-bg px-3 py-2.5'>
                <div className='mb-1.5 flex items-center justify-between text-[12px]'>
                  <span className='font-semibold'>{mix.label}</span>
                  <span className='font-mono text-[11px] text-sub'>
                    {mix.pct}% · {(mix.minutes / 60).toFixed(1)}h
                  </span>
                </div>
                <MiniBar
                  value={mix.pct}
                  max={100}
                  color={idx % 4 === 0 ? 'var(--accent)' : idx % 4 === 1 ? 'var(--accent2)' : idx % 4 === 2 ? 'var(--accent3)' : 'var(--success)'}
                  h={7}
                />
              </div>
            ))}
          </div>
        </div>
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
                    background: isToday
                      ? 'linear-gradient(180deg,var(--accent),var(--accent2))'
                      : day.minutes > 0
                        ? 'var(--text)'
                        : 'var(--border)',
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
                <Flame size={15} color='var(--danger)' />
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
                「{data.reviewPattern[0][0]}」が{data.reviewPattern[0][1]}回発生。次回ログではこの観点を先にチェック。
              </p>
            </div>
          )}
        </div>
      </div>

      {data.recentSessions.length > 0 && (
        <div className='flex justify-end'>
          <Link href='/log' className='inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-semibold text-sub hover:text-text'>
            記録一覧を見る
            <ArrowUpRight size={13} />
          </Link>
        </div>
      )}
    </section>
  );
}
