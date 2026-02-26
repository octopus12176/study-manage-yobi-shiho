import { Brain, TriangleAlert } from 'lucide-react';

import type { DashboardData } from '@/lib/dashboard';

type ReviewSummaryProps = {
  data: DashboardData;
};

export function ReviewSummary({ data }: ReviewSummaryProps) {
  const weeklyExerciseTarget = data.planRatios.exerciseRatio;
  const exerciseGap = data.exerciseRatio - weeklyExerciseTarget;
  const topMemo = data.yesterdayMemos[0];

  return (
    <div className='flex flex-col gap-4'>
      <section className='relative overflow-hidden rounded-[22px] border border-white/20 bg-[linear-gradient(135deg,rgba(126,87,255,0.9),rgba(255,95,109,0.88)_55%,rgba(14,22,50,0.92))] p-6 text-white shadow-[0_22px_50px_rgba(24,14,62,0.35)]'>
        <div className='pointer-events-none absolute -left-12 -top-12 h-52 w-52 rounded-full bg-white/15 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-14 right-0 h-48 w-48 rounded-full bg-cyan-300/25 blur-3xl' />

        <div className='relative grid grid-cols-[1.15fr_1fr] gap-4 max-lg:grid-cols-1'>
          <div>
            <p className='mb-2 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/20 px-3 py-1 font-mono text-[10px] tracking-[0.12em]'>
              <Brain size={12} />
              REVIEW CORE
            </p>
            <h1 className='text-[30px] font-black leading-[1.12] tracking-[-0.03em]'>今日の復習提案</h1>
            <p className='mt-1.5 text-[13px] text-white/85'>
              {topMemo
                ? `${topMemo.subject}の詰まりメモから復習プランを組みました。今日の最重要はここ。`
                : '昨日の詰まりメモはありません。通常の演習計画を優先しましょう。'}
            </p>
            <div className='mt-3 flex flex-wrap gap-2'>
              <span className='rounded-full border border-white/30 bg-black/20 px-3 py-1 text-[11px] font-semibold'>
                演習比率 {data.exerciseRatio}%
              </span>
              <span className='rounded-full border border-white/30 bg-black/20 px-3 py-1 text-[11px] font-semibold'>
                目標 {weeklyExerciseTarget}%
              </span>
              <span className='rounded-full border border-white/30 bg-black/20 px-3 py-1 text-[11px] font-semibold'>
                差分 {exerciseGap >= 0 ? `+${exerciseGap}` : exerciseGap}%
              </span>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-2.5'>
            <div className='rounded-[14px] border border-white/25 bg-black/20 p-3'>
              <p className='font-mono text-[10px] tracking-[0.12em] text-white/70'>MEMO</p>
              <p className='mt-1 text-[22px] font-black leading-none'>{data.yesterdayMemos.length}</p>
              <p className='mt-1 text-[11px] text-white/75'>昨日の詰まり</p>
            </div>
            <div className='rounded-[14px] border border-white/25 bg-black/20 p-3'>
              <p className='font-mono text-[10px] tracking-[0.12em] text-white/70'>WEAK</p>
              <p className='mt-1 text-[22px] font-black leading-none'>{data.weakPoints.length}</p>
              <p className='mt-1 text-[11px] text-white/75'>要注意科目</p>
            </div>
            <div className='rounded-[14px] border border-white/25 bg-black/20 p-3'>
              <p className='font-mono text-[10px] tracking-[0.12em] text-white/70'>FOCUS</p>
              <p className='mt-1 text-[22px] font-black leading-none'>{data.focusSubjects[0]?.subject ?? '—'}</p>
              <p className='mt-1 text-[11px] text-white/75'>不足科目</p>
            </div>
            <div className='rounded-[14px] border border-white/25 bg-black/20 p-3'>
              <p className='font-mono text-[10px] tracking-[0.12em] text-white/70'>PLAN</p>
              <p className='mt-1 text-[22px] font-black leading-none'>{data.targetHours}h</p>
              <p className='mt-1 text-[11px] text-white/75'>週目標</p>
            </div>
          </div>
        </div>
      </section>

      {data.yesterdayMemos.length === 0 && (
        <div className='card border border-borderLight bg-white'>
          <div className='mb-2 flex items-center gap-2'>
            <TriangleAlert size={16} color='var(--sub)' />
            <p className='text-sm font-semibold text-sub'>昨日の詰まりメモはありません</p>
          </div>
          <p className='text-sm text-sub'>今日は通常の演習計画を優先してください。</p>
        </div>
      )}
    </div>
  );
}
