'use server';

import { revalidatePath } from 'next/cache';

import { createPomodoroRun, createStudySession } from '@/lib/supabase/queries';
import { timerSessionSchema, formatZodError, uuidSchema } from '@/lib/validation';
import { z } from 'zod';

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

type SavePomodoroRunInput = {
  sessionId: string;
  workMin: number;
  breakMin: number;
  cycles: number;
  startedAt: string;
  endedAt: string;
};

export async function savePomodoroRunAction(input: SavePomodoroRunInput) {
  // UUID バリデーション
  const sessionIdValidation = uuidSchema.safeParse(input.sessionId);
  if (!sessionIdValidation.success) {
    return { ok: false as const, message: 'Invalid session ID format' };
  }

  // ポモドーロパラメータのバリデーション
  const pomodoroSchema = z.object({
    workMin: z
      .number()
      .int()
      .min(1, 'ワーク時間は1分以上にしてください。')
      .max(120, 'ワーク時間は120分以内にしてください。'),
    breakMin: z
      .number()
      .int()
      .min(1, '休憩時間は1分以上にしてください。')
      .max(60, '休憩時間は60分以内にしてください。'),
    cycles: z
      .number()
      .int()
      .min(1, 'サイクル数は1以上にしてください。')
      .max(100, 'サイクル数は100以内にしてください。'),
    startedAt: z.string().datetime({ message: '開始時刻の形式が正しくありません。' }),
    endedAt: z.string().datetime({ message: '終了時刻の形式が正しくありません。' }),
  });

  const pomodoroValidation = pomodoroSchema.safeParse({
    workMin: input.workMin,
    breakMin: input.breakMin,
    cycles: input.cycles,
    startedAt: input.startedAt,
    endedAt: input.endedAt,
  });

  if (!pomodoroValidation.success) {
    return formatZodError(pomodoroValidation.error);
  }

  const data = pomodoroValidation.data;

  await createPomodoroRun({
    study_session_id: input.sessionId,
    work_min: data.workMin,
    break_min: data.breakMin,
    cycles: data.cycles,
    started_at: data.startedAt,
    ended_at: data.endedAt,
  });

  revalidatePath('/timer');

  return { ok: true as const, message: 'ポモドーロ記録を保存しました。' };
}
