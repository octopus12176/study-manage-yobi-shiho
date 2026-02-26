'use server';

import { revalidatePath } from 'next/cache';

import { createStudySession } from '@/lib/supabase/queries';

export type LogFormInput = {
  subject: string;
  material: string;
  exam: 'yobi' | 'shiho' | 'both';
  track: 'tantou' | 'ronbun' | 'review' | 'mock' | 'other';
  activity: 'input' | 'drill' | 'review' | 'write';
  minutes: number;
  confidence: number;
  memo: string;
  causeCategory?: string;
};

export async function createStudySessionAction(payload: LogFormInput) {
  if (!payload.subject || !payload.material || payload.minutes <= 0) {
    return { ok: false as const, message: '必須項目を入力してください。' };
  }

  const endedAt = new Date();
  const startedAt = new Date(endedAt.getTime() - payload.minutes * 60_000);

  await createStudySession({
    started_at: startedAt.toISOString(),
    ended_at: endedAt.toISOString(),
    duration_min: payload.minutes,
    exam: payload.exam,
    track: payload.track,
    subject: payload.subject,
    material: payload.material,
    activity: payload.activity,
    confidence: payload.confidence,
    memo: payload.memo || null,
    cause_category: payload.causeCategory || null,
  });

  revalidatePath('/');
  revalidatePath('/log');
  revalidatePath('/review');

  return { ok: true as const, message: '学習記録を保存しました。' };
}
