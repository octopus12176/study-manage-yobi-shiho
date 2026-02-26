'use server';

import { startOfWeek } from 'date-fns';
import { revalidatePath } from 'next/cache';

import { DEFAULT_WEEKLY_PLAN } from '@/lib/constants';
import { upsertWeeklyPlan } from '@/lib/supabase/queries';

type UpdateWeeklyPlanInput = {
  targetHours: number;
  weekdayHours: number;
  weekendHours: number;
  exerciseRatio: number;
};

export async function updateWeeklyPlanAction(input: UpdateWeeklyPlanInput) {
  try {
    const normalized = startOfWeek(new Date(), { weekStartsOn: 1 });

    await upsertWeeklyPlan({
      date: normalized,
      targetMin: Math.max(Math.round(input.targetHours * 60), 0),
      ratios: {
        weekdayHours: input.weekdayHours,
        weekendHours: input.weekendHours,
        exerciseRatio: input.exerciseRatio,
        subjectRatios: DEFAULT_WEEKLY_PLAN.subjectRatios,
      },
    });

    revalidatePath('/');
    revalidatePath('/plan');

    return { ok: true as const, message: '週間計画を更新しました。' };
  } catch (error) {
    console.error('Weekly plan update error:', error);
    throw error;
  }
}
