import { Flame } from 'lucide-react';

import { cn } from '@/lib/utils';
import { listStudySessionsInRange } from '@/lib/supabase/queries';

const buildStreak = (sessionDates: string[]): number => {
  const set = new Set(sessionDates);
  let streak = 0;
  const cursor = new Date();

  for (let i = 0; i < 90; i += 1) {
    const ymd = cursor.toISOString().split('T')[0];
    if (!set.has(ymd)) {
      break;
    }
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

export async function StreakBadge() {
  let streak = 0;
  try {
    const from = new Date();
    from.setDate(from.getDate() - 90);
    const sessions = await listStudySessionsInRange({
      from: from.toISOString(),
      to: new Date().toISOString(),
      limit: 500,
    });
    const sessionDates = sessions.map((session) => session.started_at.split('T')[0]);
    streak = buildStreak(sessionDates);
  } catch {
    streak = 0;
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-2xl border px-[10px] py-[5px]',
        streak >= 7 ? 'border-[#FFB74D] bg-[#FFF3E0]' : 'border-border bg-bg'
      )}
    >
      <Flame size={13} color={streak >= 7 ? '#FF8F00' : 'var(--sub)'} />
      <span className={cn('text-[13px] font-bold', streak >= 7 ? 'text-[#E65100]' : 'text-text')}>
        {streak}
      </span>
      <span className='text-[10px] text-sub'>日連続</span>
    </div>
  );
}
