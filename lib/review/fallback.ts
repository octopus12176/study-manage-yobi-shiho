import type { DashboardData } from '@/lib/dashboard';
import type { ReviewInsights } from '@/lib/review/types';

export const buildSuggestion = (memo: string | null): string => {
  if (!memo) return '関連論点テンプレを見直し、規範の正確性を確認しましょう。';
  if (memo.includes('処分性')) return '処分性の定義を自分の言葉で書き直し、判例3つの要点を整理しましょう。';
  if (memo.includes('原告適格')) return '原告適格の判断枠組みを答案構成形式で再整理してみましょう。';
  if (memo.includes('あてはめ')) return '過去問1問のあてはめ部分だけを書き直して密度を上げましょう。';
  if (memo.includes('時間')) return '答案構成の時間配分パターンを固定し、タイムトライアルで再現しましょう。';
  return '関連する弱点論点を30分復習し、次の演習で確認しましょう。';
};

const buildShortFeedback = (memo: string | null) => {
  if (!memo) return '要点を1行で整理しましょう。';
  if (memo.includes('処分性')) return '定義を自分語で固めましょう。';
  if (memo.includes('原告適格')) return '判断枠組みを再確認。';
  if (memo.includes('あてはめ')) return '事実評価の厚みを増やす。';
  if (memo.includes('時間')) return '配分の型を固定しよう。';
  return '論点の芯を一言で言えるか確認。';
};

export const buildFallbackInsights = (data: DashboardData): ReviewInsights => {
  const focusSubject = data.focusSubjects[0];
  const exerciseGap = data.exerciseRatio - data.planRatios.exerciseRatio;
  const topCause = data.ronbunCauseCounts[0];

  return {
    memoFeedbacks: data.yesterdayMemos.map((session) => ({
      id: session.id,
      feedback: buildShortFeedback(session.memo),
      nextTask: buildSuggestion(session.memo),
    })),
    weeklyReview: {
      summary: `今週の実績は${(data.weeklyMinutes / 60).toFixed(1)}h、演習比率は${data.exerciseRatio}%です。`,
      gapNote: `目標${data.planRatios.exerciseRatio}%に対して${exerciseGap >= 0 ? `+${exerciseGap}` : exerciseGap}%の差です。`,
      nextWeekAllocation: focusSubject
        ? `${focusSubject.subject}が目標比で${focusSubject.gapPct}%不足。来週は演習比率を+10%し、重点科目を先に回しましょう。`
        : 'データが少ないため、来週は演習と復習を1:1で回して傾向を作りましょう。',
      actionTags: [focusSubject?.subject ?? '重点科目', '演習強化', '配分見直し'],
    },
    ronbunDiagnosis: topCause
      ? {
          biasSummary: `原因カテゴリは「${topCause.category}」が最多（${topCause.pct}%）です。`,
          actions: [
            '該当カテゴリのチェックリストを作り、答案末尾でセルフチェックする。',
            '過去問1問で同カテゴリだけ改善する再答案を作る。',
            '週1回、同カテゴリの失点パターンをまとめ直す。',
          ],
          templateHint:
            topCause.category === '規範の言語化不足'
              ? 'テンプレの規範欄を最新の言語化に更新しましょう。'
              : 'テンプレの見出し順とチェック項目を更新しましょう。',
        }
      : {
          biasSummary: '原因カテゴリの記録がありません。',
          actions: ['論文ログ時に原因カテゴリを1つ選んで蓄積しましょう。'],
          templateHint: 'テンプレ更新は原因カテゴリの蓄積後に行いましょう。',
        },
  };
};
