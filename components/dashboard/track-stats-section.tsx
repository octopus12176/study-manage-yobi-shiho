'use client';

import { useState } from 'react';
import { SUBJECTS } from '@/lib/constants';
import { MiniBar } from '@/components/ui/minibar';
import type { DashboardData } from '@/lib/dashboard';

type TrackStatsSectionProps = {
  data: DashboardData;
};

export function TrackStatsSection({ data }: TrackStatsSectionProps) {
  const [activeTrack, setActiveTrack] = useState<'tantou' | 'ronbun'>('tantou');

  const trackStats = data.trackStats[activeTrack];
  const totalMinutes = Object.values(trackStats.subjectBreakdown).reduce((acc, cur) => acc + cur, 0);
  const trackLabel = activeTrack === 'tantou' ? '短答' : '論文';

  return (
    <div className='card card-soft'>
      <div className='mb-4 flex items-center justify-between'>
        <p className='text-sm font-bold'>短答・論文 (過去90日)</p>
        <div className='flex gap-2'>
          <button
            onClick={() => setActiveTrack('tantou')}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
              activeTrack === 'tantou'
                ? 'bg-accent text-white'
                : 'border border-border bg-transparent text-sub hover:text-text'
            }`}
          >
            短答
          </button>
          <button
            onClick={() => setActiveTrack('ronbun')}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
              activeTrack === 'ronbun'
                ? 'bg-accent text-white'
                : 'border border-border bg-transparent text-sub hover:text-text'
            }`}
          >
            論文
          </button>
        </div>
      </div>

      <div className='mb-4 grid grid-cols-3 gap-3 max-sm:grid-cols-2'>
        <div className='rounded-md border border-border bg-cardLight p-3'>
          <p className='text-[11px] text-muted'>学習時間</p>
          <p className='font-mono text-[13px] font-semibold'>{(trackStats.totalMinutes / 60).toFixed(1)}h</p>
        </div>
        <div className='rounded-md border border-border bg-cardLight p-3'>
          <p className='text-[11px] text-muted'>セッション数</p>
          <p className='font-mono text-[13px] font-semibold'>{trackStats.sessionCount}</p>
        </div>
        <div className='rounded-md border border-border bg-cardLight p-3'>
          <p className='text-[11px] text-muted'>学習科目数</p>
          <p className='font-mono text-[13px] font-semibold'>
            {Object.values(trackStats.subjectBreakdown).filter((min) => min > 0).length}/8
          </p>
        </div>
      </div>

      <div className='mb-4'>
        <p className='mb-2.5 text-xs font-bold text-muted'>科目別学習時間</p>
        {SUBJECTS.map((subject) => {
          const minutes = trackStats.subjectBreakdown[subject] ?? 0;
          const percentage = totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0;
          return (
            <div key={subject} className='mb-[7px] flex items-center gap-2'>
              <span className='w-12 shrink-0 text-xs font-semibold'>{subject}</span>
              <MiniBar
                className='flex-1'
                value={percentage}
                max={100}
                color='var(--text)'
                h={6}
              />
              <span className='w-12 text-right font-mono text-[11px] text-sub'>{percentage}%</span>
            </div>
          );
        })}
      </div>

      {trackStats.weakPoints.length > 0 && (
        <div className='mb-4'>
          <p className='mb-2.5 text-xs font-bold text-muted'>弱点科目 (信頼度≤2)</p>
          {trackStats.weakPoints.map(([subject, count], idx) => (
            <div
              key={subject}
              className='mb-2 flex items-center justify-between rounded-md border border-borderLight bg-cardLight px-3 py-2'
            >
              <div className='flex items-center gap-2'>
                <span
                  className='flex size-5 items-center justify-center rounded-sm text-[10px] font-bold'
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

      {activeTrack === 'ronbun' && trackStats.causeCounts && trackStats.causeCounts.length > 0 && (
        <div>
          <p className='mb-2.5 text-xs font-bold text-muted'>原因カテゴリ分析</p>
          {trackStats.causeCounts.map((item, idx) => {
            const maxPct = trackStats.causeCounts?.[0]?.pct ?? 1;
            return (
              <div key={item.category} className='mb-[7px] flex items-center gap-2'>
                <span className='w-24 shrink-0 text-xs font-semibold'>{item.category}</span>
                <MiniBar
                  className='flex-1'
                  value={item.pct}
                  max={Math.max(maxPct, 1)}
                  color='var(--text)'
                  h={6}
                />
                <span className='w-16 text-right font-mono text-[11px] text-sub'>{item.pct}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
