'use server';

import { revalidatePath } from 'next/cache';

import { createStudySession, updateStudySession, deleteStudySession } from '@/lib/supabase/queries';
import { logFormSchema, formatZodError, uuidSchema } from '@/lib/validation';

export type LogFormInput = {
  subject: string;
  material: string;
  exam: 'yobi' | 'shiho' | 'both';
  track: 'tantou' | 'ronbun' | 'review' | 'mock' | 'other';
  activity: 'input' | 'drill' | 'review' | 'write';
  minutes: number;
  confidence: number;
  memo: string;
  notes?: string;
  date?: string; // 'yyyy-MM-dd' 形式
  causeCategory?: string;
};

export async function createStudySessionAction(payload: LogFormInput) {
  // Zod によるランタイムバリデーション
  const result = logFormSchema.safeParse(payload);
  if (!result.success) {
    return formatZodError(result.error);
  }
  const data = result.data;

  let endedAt: Date;
  if (data.date) {
    // 指定された日付の 23:59:59 を終了時刻とする
    endedAt = new Date(`${data.date}T23:59:59`);
  } else {
    // 日付が指定されていなければ現在時刻
    endedAt = new Date();
  }
  const startedAt = new Date(endedAt.getTime() - data.minutes * 60_000);

  await createStudySession({
    started_at: startedAt.toISOString(),
    ended_at: endedAt.toISOString(),
    duration_min: data.minutes,
    exam: data.exam as 'yobi' | 'shiho' | 'both',
    track: data.track as 'tantou' | 'ronbun' | 'review' | 'mock' | 'other',
    subject: data.subject,
    material: data.material,
    activity: data.activity as 'input' | 'drill' | 'review' | 'write',
    confidence: data.confidence,
    memo: data.memo || null,
    notes: data.notes || null,
    cause_category: data.causeCategory || null,
  });

  revalidatePath('/');
  revalidatePath('/log');
  revalidatePath('/review');

  return { ok: true as const, message: '学習記録を保存しました。' };
}

export async function updateStudySessionAction(id: string, payload: LogFormInput) {
  // UUID 形式のバリデーション
  const idValidation = uuidSchema.safeParse(id);
  if (!idValidation.success) {
    return { ok: false, message: 'Invalid ID format' };
  }

  // Zod によるランタイムバリデーション
  const result = logFormSchema.safeParse(payload);
  if (!result.success) {
    return formatZodError(result.error);
  }
  const data = result.data;

  let endedAt: Date;
  if (data.date) {
    endedAt = new Date(`${data.date}T23:59:59`);
  } else {
    endedAt = new Date();
  }
  const startedAt = new Date(endedAt.getTime() - data.minutes * 60_000);

  await updateStudySession(id, {
    started_at: startedAt.toISOString(),
    ended_at: endedAt.toISOString(),
    duration_min: data.minutes,
    exam: data.exam as 'yobi' | 'shiho' | 'both',
    track: data.track as 'tantou' | 'ronbun' | 'review' | 'mock' | 'other',
    subject: data.subject,
    material: data.material,
    activity: data.activity as 'input' | 'drill' | 'review' | 'write',
    confidence: data.confidence,
    memo: data.memo || null,
    notes: data.notes || null,
    cause_category: data.causeCategory || null,
  });

  revalidatePath('/');
  revalidatePath('/log');
  revalidatePath('/review');

  return { ok: true as const, message: '学習記録を更新しました。' };
}

export async function deleteStudySessionAction(id: string) {
  // UUID 形式のバリデーション
  const idValidation = uuidSchema.safeParse(id);
  if (!idValidation.success) {
    return { ok: false, message: 'Invalid ID format' };
  }

  await deleteStudySession(id);
  revalidatePath('/');
  revalidatePath('/log');
  revalidatePath('/review');
  return { ok: true as const };
}
