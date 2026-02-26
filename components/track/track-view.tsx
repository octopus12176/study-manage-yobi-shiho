import { ArrowRight } from 'lucide-react';

import type { TrackPageData } from '@/lib/track-stats';

type TrackViewProps = {
  data: TrackPageData;
};

const trackLabels: Record<'tantou' | 'ronbun', string> = {
  tantou: '短答',
  ronbun: '論文',
};

const causeColors: Record<string, string> = {
  '知識不足': 'bg-red-500/20',
  '読み間違い': 'bg-orange-500/20',
  '時間配分': 'bg-yellow-500/20',
  '論点ずれ': 'bg-purple-500/20',
  'あてはめ': 'bg-blue-500/20',
  '判例知識': 'bg-green-500/20',
  '原告適格': 'bg-indigo-500/20',
  '処分性': 'bg-pink-500/20',
  'その他': 'bg-gray-500/20',
};

export function TrackView({ data }: TrackViewProps) {
  const trackLabel = trackLabels[data.track];
  const totalSubjectMinutes = Object.values(data.subjectBreakdown).reduce((a, b) => a + b, 0);
  const totalHours = (data.totalMinutes / 60).toFixed(1);
  const maxSubjectMinutes = Math.max(...Object.values(data.subjectBreakdown), 1);

  return (
    <section className='flex flex-col gap-4'>
      {/* ヘッダーカード */}
      <div className='card card-soft'>
        <div className='mb-3 flex items-center justify-between'>
          <p className='text-sm font-bold'>{trackLabel}管理</p>
          <span className='font-mono text-[10px] tracking-[0.08em] text-sub'>{data.periodLabel}</span>
        </div>
        <div className='grid grid-cols-3 gap-3 max-md:grid-cols-1'>
          <div>
            <p className='text-[11px] text-sub'>合計時間</p>
            <p className='mt-1 text-xl font-black'>{totalHours}h</p>
          </div>
          <div>
            <p className='text-[11px] text-sub'>セッション数</p>
            <p className='mt-1 text-xl font-black'>{data.sessionCount}</p>
          </div>
          <div>
            <p className='text-[11px] text-sub'>学習科目数</p>
            <p className='mt-1 text-xl font-black'>
              {Object.values(data.subjectBreakdown).filter((m) => m > 0).length}/8
            </p>
          </div>
        </div>
      </div>

      {/* 科目別学習時間 */}
      <div className='card card-soft'>
        <div className='mb-3 flex items-center justify-between'>
          <p className='text-sm font-bold'>科目別学習時間</p>
          <span className='font-mono text-[10px] tracking-[0.08em] text-sub'>
            {totalSubjectMinutes > 0 ? ((totalSubjectMinutes / 60).toFixed(1) + 'h') : '0h'}
          </span>
        </div>
        <div className='space-y-2'>
          {Object.entries(data.subjectBreakdown).map(([subject, minutes]) => {
            const pct = totalSubjectMinutes > 0 ? (minutes / totalSubjectMinutes) * 100 : 0;
            const hours = (minutes / 60).toFixed(1);
            return (
              <div key={subject} className='flex items-center gap-3'>
                <div className='w-20 text-[12px] font-semibold text-sub'>{subject}</div>
                <div className='flex-1'>
                  <div className='flex h-6 items-center overflow-hidden rounded-full bg-white/5'>
                    {minutes > 0 && (
                      <div
                        className='bg-accent h-full transition-all'
                        style={{ width: `${pct}%` }}
                      />
                    )}
                  </div>
                </div>
                <div className='w-14 text-right text-[12px] font-mono font-semibold'>
                  {hours}h ({Math.round(pct)}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 信頼度ランキング */}
      {data.weakPoints.length > 0 && (
        <div className='card card-soft'>
          <div className='mb-3 flex items-center justify-between'>
            <p className='text-sm font-bold'>信頼度ランキング</p>
            <span className='font-mono text-[10px] tracking-[0.08em] text-sub'>信頼度2以下</span>
          </div>
          <div className='space-y-2'>
            {data.weakPoints.map(([subject, count], idx) => (
              <div key={subject} className='flex items-center gap-2'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-warn/20 text-[11px] font-bold text-warn'>
                  {idx + 1}
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-semibold'>{subject}</p>
                  <p className='text-[11px] text-sub'>{count}回の失点経験</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 原因カテゴリ分析（論文のみ） */}
      {data.track === 'ronbun' && data.causeCounts && data.causeCounts.length > 0 && (
        <div className='card card-soft'>
          <div className='mb-3 flex items-center justify-between'>
            <p className='text-sm font-bold'>原因カテゴリ分析</p>
            <span className='font-mono text-[10px] tracking-[0.08em] text-sub'>
              {data.causeCounts.reduce((acc, c) => acc + c.count, 0)}件
            </span>
          </div>
          <div className='space-y-2'>
            {data.causeCounts.map((item) => (
              <div key={item.category} className='flex items-center gap-3'>
                <div className='w-20 text-[12px] font-semibold text-sub'>{item.category}</div>
                <div className='flex-1'>
                  <div className='flex h-6 items-center overflow-hidden rounded-full bg-white/5'>
                    <div
                      className={`${causeColors[item.category] ?? 'bg-gray-500/20'} h-full transition-all`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
                <div className='w-14 text-right text-[12px] font-mono font-semibold'>
                  {item.count}件 ({item.pct}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* データ無い場合 */}
      {data.sessions.length === 0 && (
        <div className='card card-soft text-center py-8'>
          <p className='text-sub'>過去90日間のセッション記録がありません</p>
        </div>
      )}
    </section>
  );
}
