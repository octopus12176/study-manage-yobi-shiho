'use server';

import { revalidatePath } from 'next/cache';

import { createPomodoroRun, createStudySession } from '@/lib/supabase/queries';

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
  if (!input.subject || input.minutes <= 0) {
    return { ok: false as const, message: '科目と学習時間を入力してください。' };
  }

  const session = await createStudySession({
    started_at: input.startedAt,
    ended_at: input.endedAt,
    duration_min: input.minutes,
    exam: 'both',
    track: 'review',
    subject: input.subject,
    material: 'タイマー',
    activity: 'drill',
    confidence: 3,
    memo: null,
    cause_category: null,
  });

  if (input.mode === 'pomodoro') {
    await createPomodoroRun({
      study_session_id: session.id,
      work_min: input.workMin,
      break_min: input.breakMin,
      cycles: Math.max(input.cycles, 1),
      started_at: input.startedAt,
      ended_at: input.endedAt,
    });
  }

  revalidatePath('/');
  revalidatePath('/log');
  revalidatePath('/timer');
  revalidatePath('/review');

  return { ok: true as const, message: 'タイマー記録を保存しました。' };
}
