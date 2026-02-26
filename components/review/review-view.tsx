import { Brain, Sparkles, Target, TriangleAlert } from 'lucide-react';

import { ConfDots } from '@/components/ui/confdots';
import { Chip } from '@/components/ui/chip';
import { MiniBar } from '@/components/ui/minibar';
import type { DashboardData } from '@/lib/dashboard';
import { buildSuggestion } from '@/lib/review/fallback';
import type { ReviewInsights } from '@/lib/review/types';

type ReviewViewProps = {
  data: DashboardData;
  insights: ReviewInsights;
};

export function ReviewView({ data, insights }: ReviewViewProps) {
  const weeklyExerciseTarget = data.planRatios.exerciseRatio;
  const exerciseGap = data.exerciseRatio - weeklyExerciseTarget;
  const topMemo = data.yesterdayMemos[0];
  const memoFeedbackMap = new Map(insights.memoFeedbacks.map((item) => [item.id, item]));
  const hasMemos = data.yesterdayMemos.length > 0;

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

      <div
        className={
          hasMemos
            ? 'grid grid-cols-[minmax(280px,1fr)_minmax(260px,0.9fr)] gap-4 max-lg:grid-cols-1'
            : 'grid grid-cols-1 gap-4'
        }
      >
        {hasMemos && (
          <div className='flex flex-col gap-3'>
            {data.yesterdayMemos.map((session) => (
              <div key={session.id} className='card'>
                <div className='mb-2 flex items-center gap-2'>
                  <Chip label={session.subject} active small />
                  <ConfDots value={session.confidence ?? 3} size={6} />
                  <span className='text-[11px] text-sub'>体感 {session.confidence ?? 3}</span>
                </div>
                <p className='mb-2 text-[13px] text-sub'>詰まり: {session.memo}</p>
                {memoFeedbackMap.get(session.id)?.feedback && (
                  <p className='mb-2 text-[12px] font-semibold text-text'>
                    AI一言: {memoFeedbackMap.get(session.id)?.feedback}
                  </p>
                )}
                <div className='rounded-[10px] border-l-[3px] border-l-accent bg-accentLight px-3.5 py-3'>
                  <p className='mb-1 text-[11px] font-bold text-accent'>提案</p>
                  <p className='text-[13px] leading-[1.6] text-text'>
                    {memoFeedbackMap.get(session.id)?.nextTask ?? buildSuggestion(session.memo)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <aside className='flex flex-col gap-3'>
          <div className='card card-soft'>
            <div className='mb-2 flex items-center gap-2'>
              <Target size={16} color='var(--accent)' />
              <p className='text-sm font-bold'>今週の演習比率</p>
            </div>
            <MiniBar value={data.exerciseRatio} max={100} color='var(--accent)' h={9} />
            <p className='mt-2 text-[12px] text-sub'>
              現在 {data.exerciseRatio}% / 目標 {weeklyExerciseTarget}%
            </p>
          </div>

          <div className='card card-soft'>
            <div className='mb-2 flex items-center gap-2'>
              <TriangleAlert size={16} color='var(--warn)' />
              <p className='text-sm font-bold'>弱点トップ</p>
            </div>
            {data.weakPoints.length === 0 ? (
              <p className='text-[12px] text-sub'>低評価の科目はありません。</p>
            ) : (
              <div className='space-y-2'>
                {data.weakPoints.map(([subject, count], idx) => (
                  <div key={subject} className='flex items-center justify-between text-[12px]'>
                    <span className='font-semibold'>{idx + 1}. {subject}</span>
                    <span className='text-sub'>低×{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='card card-soft'>
            <div className='mb-2 flex items-center gap-2'>
              <Brain size={16} color='var(--accent2)' />
              <p className='text-sm font-bold'>論文の弱点診断</p>
            </div>
            <p className='text-[12px] text-sub'>{insights.ronbunDiagnosis.biasSummary}</p>
            <ul className='mt-2 space-y-1 text-[12px] text-text'>
              {insights.ronbunDiagnosis.actions.map((action) => (
                <li key={action}>・{action}</li>
              ))}
            </ul>
            <div className='mt-2 rounded-lg bg-bg px-2.5 py-2 text-[11px] text-sub'>
              {insights.ronbunDiagnosis.templateHint}
            </div>
          </div>
        </aside>
      </div>

      <div className='card bg-[linear-gradient(135deg,var(--dark),var(--darkSoft))] text-white'>
        <div className='mb-2 flex items-center gap-2'>
          <Sparkles size={16} color='var(--accent)' />
          <span className='text-xs font-bold tracking-[0.08em] text-white/55'>WEEKLY SNAPSHOT</span>
        </div>
        <p className='text-sm leading-[1.7] text-white/85'>{insights.weeklyReview.summary}</p>
        <p className='mt-2 text-[12px] text-white/70'>{insights.weeklyReview.gapNote}</p>
        <p className='mt-2 text-[12px] text-white/85'>{insights.weeklyReview.nextWeekAllocation}</p>
        <div className='mt-3 flex flex-wrap gap-2'>
          {insights.weeklyReview.actionTags.map((tag) => (
            <span key={tag} className='rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/70'>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
