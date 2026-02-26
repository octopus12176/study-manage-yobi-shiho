'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Filter, RotateCcw, Search } from 'lucide-react';

import { Chip } from '@/components/ui/chip';
import { ConfDots } from '@/components/ui/confdots';
import { MiniBar } from '@/components/ui/minibar';
import { SUBJECTS, TRACK_OPTIONS, ACTIVITY_OPTIONS } from '@/lib/constants';
import type { StudySessionRow } from '@/lib/supabase/queries';

type LogHistoryPanelProps = {
  sessions: StudySessionRow[];
};

const trackLabelMap: Record<string, string> = {
  tantou: '短答',
  ronbun: '論文',
  review: '復習',
  mock: '模試/答練',
  other: 'その他',
};

const activityLabelMap: Record<string, string> = {
  input: 'インプット',
  drill: '演習',
  review: '復習',
  write: '答案作成',
};

const confidenceStyle = (value: number | null) => {
  const current = value ?? 3;
  if (current <= 2) return { color: 'var(--danger)', bg: 'var(--dangerLight)' };
  if (current <= 3) return { color: 'var(--warn)', bg: 'var(--warnLight)' };
  return { color: 'var(--success)', bg: 'var(--successLight)' };
};

export function LogHistoryPanel({ sessions }: LogHistoryPanelProps) {
  const [subject, setSubject] = useState('all');
  const [track, setTrack] = useState('all');
  const [activity, setActivity] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sessions.filter((session) => {
      if (subject !== 'all' && session.subject !== subject) return false;
      if (track !== 'all' && session.track !== track) return false;
      if (activity !== 'all' && session.activity !== activity) return false;
      if (!q) return true;
      return (
        session.subject.toLowerCase().includes(q) ||
        (session.material ?? '').toLowerCase().includes(q) ||
        (session.memo ?? '').toLowerCase().includes(q) ||
        (session.cause_category ?? '').toLowerCase().includes(q)
      );
    });
  }, [activity, query, sessions, subject, track]);

  const totalMinutes = filtered.reduce((acc, session) => acc + session.duration_min, 0);
  const avgConfidence = filtered.length
    ? (filtered.reduce((acc, s) => acc + (s.confidence ?? 3), 0) / filtered.length).toFixed(1)
    : '0.0';

  const resetFilters = () => {
    setSubject('all');
    setTrack('all');
    setActivity('all');
    setQuery('');
  };

  return (
    <section className='card card-soft'>
      <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
        <h2 className='text-sm font-bold'>記録履歴</h2>
        <span className='font-mono text-[10px] tracking-[0.1em] text-sub'>LATEST {filtered.length}/{sessions.length}</span>
      </div>

      <div className='mb-3 rounded-2xl border border-borderLight bg-[rgba(255,255,255,0.72)] p-3'>
        <div className='mb-2.5 flex items-center justify-between'>
          <div className='inline-flex items-center gap-1.5 text-[12px] font-semibold text-sub'>
            <Filter size={13} />
            フィルター
          </div>
          <button
            type='button'
            onClick={resetFilters}
            className='inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-sub hover:text-text'
          >
            <RotateCcw size={11} />
            リセット
          </button>
        </div>

        <div className='mb-2.5 flex flex-wrap gap-1.5'>
          <Chip label='全科目' small active={subject === 'all'} onClick={() => setSubject('all')} />
          {SUBJECTS.map((item) => (
            <Chip key={item} label={item} small active={subject === item} onClick={() => setSubject(item)} />
          ))}
        </div>

        <div className='mb-2.5 flex flex-wrap gap-1.5'>
          <Chip label='全トラック' small active={track === 'all'} onClick={() => setTrack('all')} />
          {TRACK_OPTIONS.map((item) => (
            <Chip
              key={item.value}
              label={item.label}
              small
              active={track === item.value}
              onClick={() => setTrack(item.value)}
            />
          ))}
        </div>

        <div className='mb-2.5 flex flex-wrap gap-1.5'>
          <Chip label='全形態' small active={activity === 'all'} onClick={() => setActivity('all')} />
          {ACTIVITY_OPTIONS.map((item) => (
            <Chip
              key={item.value}
              label={item.label}
              small
              active={activity === item.value}
              onClick={() => setActivity(item.value)}
            />
          ))}
        </div>

        <label className='relative block'>
          <Search className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sub' size={14} />
          <input
            type='text'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder='科目・教材・メモで検索'
            className='input !rounded-xl !bg-white pl-9'
          />
        </label>
      </div>

      <div className='mb-3 grid gap-2 md:grid-cols-3'>
        <div className='rounded-xl border border-borderLight bg-bg px-3 py-2'>
          <p className='text-[11px] text-sub'>ヒット件数</p>
          <p className='font-mono text-[18px] font-bold'>{filtered.length}</p>
          <MiniBar className='mt-1.5' value={filtered.length} max={Math.max(sessions.length, 1)} color='var(--accent2)' h={6} />
        </div>
        <div className='rounded-xl border border-borderLight bg-bg px-3 py-2'>
          <p className='text-[11px] text-sub'>合計時間</p>
          <p className='font-mono text-[18px] font-bold'>{(totalMinutes / 60).toFixed(1)}h</p>
          <MiniBar className='mt-1.5' value={totalMinutes} max={Math.max(sessions.reduce((acc, s) => acc + s.duration_min, 0), 1)} color='var(--accent)' h={6} />
        </div>
        <div className='rounded-xl border border-borderLight bg-bg px-3 py-2'>
          <p className='text-[11px] text-sub'>平均手応え</p>
          <p className='font-mono text-[18px] font-bold'>{avgConfidence}</p>
          <MiniBar className='mt-1.5' value={Number(avgConfidence)} max={5} color='var(--success)' h={6} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-border p-8 text-center text-sm text-sub'>
          条件に一致する記録がありません。フィルターを緩めてください。
        </div>
      ) : (
        <div className='grid gap-2'>
          {filtered.map((session) => {
            const tone = confidenceStyle(session.confidence);
            return (
              <article key={session.id} className='rounded-2xl border border-border bg-[rgba(255,255,255,0.72)] p-3'>
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <div className='flex flex-wrap items-center gap-2 text-xs'>
                    <span className='inline-flex rounded-full border border-text bg-text px-[10px] py-[3px] text-[11px] font-semibold text-white'>
                      {session.subject}
                    </span>
                    <span className='text-sub'>{session.material ?? '教材未設定'}</span>
                    <span className='rounded-md bg-bg px-1.5 py-0.5 text-[10px] text-sub'>
                      {trackLabelMap[session.track] ?? session.track}
                    </span>
                    <span className='rounded-md bg-bg px-1.5 py-0.5 text-[10px] text-sub'>
                      {activityLabelMap[session.activity] ?? session.activity}
                    </span>
                    {session.cause_category && (
                      <span className='rounded-md bg-accentLight px-1.5 py-0.5 text-[10px] text-accent'>
                        {session.cause_category}
                      </span>
                    )}
                  </div>
                  <div className='flex items-center gap-2'>
                    <span
                      className='inline-flex rounded-md px-2 py-1 text-[10px] font-semibold'
                      style={{ color: tone.color, background: tone.bg }}
                    >
                      体感 {session.confidence ?? 3}
                    </span>
                    <ConfDots value={session.confidence ?? 3} size={6} />
                    <span className='font-mono text-xs text-sub'>{session.duration_min}分</span>
                  </div>
                </div>

                {session.memo && <p className='mt-1.5 rounded-lg bg-bg px-2.5 py-2 text-xs text-sub'>💭 {session.memo}</p>}

                <p className='mt-1.5 text-[11px] text-muted'>
                  {format(new Date(session.started_at), 'yyyy/MM/dd HH:mm')} - {format(new Date(session.ended_at), 'HH:mm')}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
