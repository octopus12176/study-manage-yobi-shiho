'use client';

import { Brain, Sparkles, Target, TriangleAlert } from 'lucide-react';
import { useTransition } from 'react';

import { generateReviewInsightsAction } from '@/app/review/actions';
import { Button } from '@/components/ui/button';
import { ConfDots } from '@/components/ui/confdots';
import { Chip } from '@/components/ui/chip';
import { MiniBar } from '@/components/ui/minibar';
import type { DashboardData } from '@/lib/dashboard';
import { buildSuggestion } from '@/lib/review/fallback';
import { buildFallbackInsights } from '@/lib/review/fallback';
import type { ReviewInsights } from '@/lib/review/types';
import { useState } from 'react';

type ReviewInsightsSectionProps = {
  data: DashboardData;
};

export function ReviewInsightsSection({ data }: ReviewInsightsSectionProps) {
  const [insights, setInsights] = useState<ReviewInsights | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleGenerateInsights = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await generateReviewInsightsAction(data);
        setInsights(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'AI提案の生成に失敗しました';
        setError(errorMessage);
        // フォールバック提案を表示
        setInsights(buildFallbackInsights(data));
      }
    });
  };

  // 最初は提案を生成していない状態
  if (!insights) {
    return (
      <div className='flex flex-col gap-4'>
        <div className='card flex flex-col items-center justify-center gap-4 py-8'>
          <div className='text-center'>
            <Sparkles size={32} className='mx-auto mb-3 text-accent' />
            <h3 className='font-semibold text-text'>AI提案を生成する</h3>
            <p className='mt-1 text-sm text-sub'>ボタンをクリックして、あなたの学習パターンに基づいた復習提案を受け取りましょう。</p>
          </div>
          <Button
            variant='accent'
            onClick={handleGenerateInsights}
            disabled={isPending}
            className='w-full max-w-xs'
          >
            {isPending ? 'AI分析中...' : 'AI提案を生成'}
          </Button>
          {error && <p className='text-sm text-danger'>{error}</p>}
        </div>
      </div>
    );
  }

  // ここからは提案が生成された後の表示

  const weeklyExerciseTarget = data.planRatios.exerciseRatio;
  const exerciseGap = data.exerciseRatio - weeklyExerciseTarget;
  const memoFeedbackMap = new Map(insights.memoFeedbacks.map((item) => [item.id, item]));
  const hasMemos = data.yesterdayMemos.length > 0;

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between rounded-lg bg-accentLight px-4 py-3'>
        <span className='text-sm font-semibold text-accent'>AI提案が生成されました</span>
        <Button
          variant='ghost'
          size='sm'
          onClick={handleGenerateInsights}
          disabled={isPending}
        >
          {isPending ? '更新中...' : '更新'}
        </Button>
      </div>

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

        <div className='card col-span-full bg-[linear-gradient(135deg,var(--dark),var(--darkSoft))] text-white'>
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
    </div>
  );
}
