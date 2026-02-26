import { format } from 'date-fns';

import { LogForm } from '@/components/log/log-form';
import { ConfDots } from '@/components/ui/confdots';
import { listRecentStudySessions } from '@/lib/supabase/queries';
import type { StudySessionRow } from '@/lib/supabase/queries';

export default async function LogPage() {
  let sessions: StudySessionRow[] = [];
  try {
    sessions = await listRecentStudySessions(20);
  } catch {
    sessions = [];
  }

  return (
    <div className='flex flex-col gap-4'>
      <LogForm />

      <section className='card'>
        <h2 className='mb-4 text-sm font-bold'>記録履歴</h2>
        <div className='grid gap-2'>
          {sessions.map((session) => (
            <div key={session.id} className='rounded-xl border border-border p-3'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <div className='flex flex-wrap items-center gap-2 text-xs'>
                  <span className='inline-flex rounded-full border-[1.5px] border-text bg-text px-[10px] py-[3px] text-[11px] font-semibold text-white'>
                    {session.subject}
                  </span>
                  <span className='text-sub'>{session.material ?? '教材未設定'}</span>
                  <span className='text-muted'>· {session.track}</span>
                  <span className='text-muted'>· {session.activity}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <ConfDots value={session.confidence ?? 3} size={6} />
                  <span className='font-mono text-xs text-sub'>{session.duration_min}分</span>
                </div>
              </div>
              {session.memo && <p className='mt-1 text-xs text-sub'>💭 {session.memo}</p>}
              <p className='mt-1 text-[11px] text-muted'>
                {format(new Date(session.started_at), 'yyyy/MM/dd HH:mm')} -{' '}
                {format(new Date(session.ended_at), 'HH:mm')}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
