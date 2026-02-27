'use server';

import { revalidatePath } from 'next/cache';

import { createPomodoroRun, createStudySession } from '@/lib/supabase/queries';
import { timerSessionSchema, formatZodError } from '@/lib/validation';

type SaveTimerSessionInput = {
  subject: string;
  minutes: number;
  mode: 'normal' | 'pomodoro';
  workMin: number;
  breakMin: number;
  cycles: number;
  startedAt: string;
  endedAt: string;
};

export async function saveTimerSessionAction(input: SaveTimerSessionInput) {
  // Zod によるランタイムバリデーション
  const result = timerSessionSchema.safeParse(input);
  if (!result.success) {
    return formatZodError(result.error);
  }
  const data = result.data;

  const session = await createStudySession({
    started_at: data.startedAt,
    ended_at: data.endedAt,
    duration_min: data.minutes,
    exam: 'both',
    track: 'review',
    subject: data.subject,
    material: 'タイマー',
    activity: 'drill',
    confidence: 3,
    memo: null,
    cause_category: null,
  });

  if (data.mode === 'pomodoro') {
    await createPomodoroRun({
      study_session_id: session.id,
      work_min: data.workMin,
      break_min: data.breakMin,
      cycles: data.cycles,
      started_at: data.startedAt,
      ended_at: data.endedAt,
    });
  }

  revalidatePath('/');
  revalidatePath('/log');
  revalidatePath('/timer');
  revalidatePath('/review');

  return { ok: true as const, message: 'タイマー記録を保存しました。' };
}
