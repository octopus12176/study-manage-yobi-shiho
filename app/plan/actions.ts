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
  focusedSubjectNames: string[];
};

export async function updateWeeklyPlanAction(input: UpdateWeeklyPlanInput) {
  try {
    const normalized = startOfWeek(new Date(), { weekStartsOn: 1 });

    console.log('Updating weekly plan with:', {
      date: normalized.toISOString(),
      targetMin: Math.max(Math.round(input.targetHours * 60), 0),
      ratios: {
        weekdayHours: input.weekdayHours,
        weekendHours: input.weekendHours,
        exerciseRatio: input.exerciseRatio,
      },
    });

    await upsertWeeklyPlan({
      date: normalized,
      targetMin: Math.max(Math.round(input.targetHours * 60), 0),
      ratios: {
        weekdayHours: input.weekdayHours,
        weekendHours: input.weekendHours,
        exerciseRatio: input.exerciseRatio,
        subjectRatios: DEFAULT_WEEKLY_PLAN.subjectRatios,
        focusedSubjectNames: input.focusedSubjectNames,
      },
    });

    console.log('Weekly plan updated successfully');
    revalidatePath('/');
    revalidatePath('/plan');

    return { ok: true as const, message: '週間計画を更新しました。' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Weekly plan update error:', errorMessage);
    throw new Error(`週計画の更新に失敗しました: ${errorMessage}`);
  }
}
