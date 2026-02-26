import { Sparkles, XCircle } from 'lucide-react';

import { ConfDots } from '@/components/ui/confdots';
import { Chip } from '@/components/ui/chip';
import type { DashboardData } from '@/lib/dashboard';

type ReviewViewProps = {
  data: DashboardData;
};

const buildSuggestion = (memo: string | null): string => {
  if (!memo) return '関連論点テンプレを見直し、規範の正確性を確認しましょう。';
  if (memo.includes('処分性')) return '処分性の定義を自分の言葉で書き直し、判例3つの要点を整理しましょう。';
  if (memo.includes('原告適格')) return '原告適格の判断枠組みを答案構成形式で再整理してみましょう。';
  if (memo.includes('あてはめ')) return '過去問1問のあてはめ部分だけを書き直して密度を上げましょう。';
  if (memo.includes('時間')) return '答案構成の時間配分パターンを固定し、タイムトライアルで再現しましょう。';
  return '関連する弱点論点を30分復習し、次の演習で確認しましょう。';
};

export function ReviewView({ data }: ReviewViewProps) {
  return (
    <div className='flex flex-col gap-4'>
      <div className='rounded-[14px] bg-[linear-gradient(135deg,var(--accent),var(--accentDark))] p-5'>
        <p className='mb-1 text-[11px] font-bold tracking-[0.08em] text-white/65'>AI REVIEW</p>
        <p className='text-lg font-bold text-white'>今日の復習提案</p>
      </div>

      {data.yesterdayMemos.length === 0 && (
        <div className='card border border-borderLight bg-white'>
          <div className='mb-2 flex items-center gap-2'>
            <XCircle size={16} color='var(--sub)' />
            <p className='text-sm font-semibold text-sub'>昨日の詰まりメモはありません</p>
          </div>
          <p className='text-sm text-sub'>今日は通常の演習計画を優先してください。</p>
        </div>
      )}

      {data.yesterdayMemos.map((session) => (
        <div key={session.id} className='card'>
          <div className='mb-2 flex items-center gap-2'>
            <Chip label={session.subject} active small />
            <ConfDots value={session.confidence ?? 3} size={6} />
          </div>
          <p className='mb-2 text-[13px] text-sub'>詰まり: {session.memo}</p>
          <div className='rounded-[10px] border-l-[3px] border-l-accent bg-accentLight px-3.5 py-3'>
            <p className='mb-1 text-[11px] font-bold text-accent'>提案</p>
            <p className='text-[13px] leading-[1.6] text-text'>{buildSuggestion(session.memo)}</p>
          </div>
        </div>
      ))}

      <div className='card bg-[linear-gradient(135deg,var(--dark),var(--darkSoft))] text-white'>
        <div className='mb-2 flex items-center gap-2'>
          <Sparkles size={16} color='var(--accent)' />
          <span className='text-xs font-bold tracking-[0.08em] text-white/55'>WEEKLY SNAPSHOT</span>
        </div>
        <p className='text-sm leading-[1.7] text-white/85'>
          今週の演習比率は {data.exerciseRatio}% です。目標 {data.planRatios.exerciseRatio}% に近づけるため、明日は答案作成を
          1コマ追加してください。
        </p>
      </div>
    </div>
  );
}
