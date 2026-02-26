'use server';

import type { DashboardData } from '@/lib/dashboard';
import { generateReviewInsights } from '@/lib/review/insights';
import type { ReviewInsights } from '@/lib/review/types';

export async function generateReviewInsightsAction(data: DashboardData): Promise<ReviewInsights> {
  try {
    const insights = await generateReviewInsights(data);
    return insights;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Failed to generate review insights:', errorMessage);
    throw new Error(`AI提案の生成に失敗しました: ${errorMessage}`);
  }
}
