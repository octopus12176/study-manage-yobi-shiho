'use server';

import { startOfWeek } from 'date-fns';
import { revalidatePath } from 'next/cache';

import { DEFAULT_WEEKLY_PLAN } from '@/lib/constants';
import { upsertWeeklyPlan } from '@/lib/supabase/queries';
import type { DashboardData } from '@/lib/dashboard';
import { createOpenAIResponse, getOpenAIKey, getOpenAIModel } from '@/lib/openai';
import { weeklyPlanSchema, formatZodError } from '@/lib/validation';

type WeeklyAISuggestion = {
  suggestion: string;
  actionTags: string[];
};

type UpdateWeeklyPlanInput = {
  targetHours: number;
  weekdayHours: number;
  weekendHours: number;
  exerciseRatio: number;
  focusedSubjectNames: string[];
};

export async function updateWeeklyPlanAction(input: UpdateWeeklyPlanInput) {
  try {
    // Zod によるランタイムバリデーション
    const result = weeklyPlanSchema.safeParse(input);
    if (!result.success) {
      return formatZodError(result.error);
    }
    const data = result.data;

    const normalized = startOfWeek(new Date(), { weekStartsOn: 1 });

    console.log('Updating weekly plan with:', {
      date: normalized.toISOString(),
      targetMin: Math.round(data.targetHours * 60),
      ratios: {
        weekdayHours: data.weekdayHours,
        weekendHours: data.weekendHours,
        exerciseRatio: data.exerciseRatio,
      },
    });

    await upsertWeeklyPlan({
      date: normalized,
      targetMin: Math.round(data.targetHours * 60),
      ratios: {
        weekdayHours: data.weekdayHours,
        weekendHours: data.weekendHours,
        exerciseRatio: data.exerciseRatio,
        subjectRatios: DEFAULT_WEEKLY_PLAN.subjectRatios,
        focusedSubjectNames: data.focusedSubjectNames,
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

export async function generateWeeklyAISuggestionAction(
  data: DashboardData
): Promise<WeeklyAISuggestion> {
  try {
    if (!getOpenAIKey()) {
      // フォールバック
      return {
        suggestion: `今週は「${data.focusSubjects[0]?.subject ?? '行政法'}」が目標比で不足しています。来週は演習比率を +10% にして、重要論点を短答→論文の順で復習しましょう。`,
        actionTags: ['重点科目強化', '演習重視'],
      };
    }

    const payload = {
      model: getOpenAIModel(),
      instructions:
        'You are a study planning assistant for Japanese law exam prep. Respond in Japanese. Provide actionable, specific advice for the coming week based on performance data.',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: JSON.stringify({
                request: {
                  weeklyPlanSuggestion: '来週の計画改善提案（短答→論文の優先順、演習比率の調整、科目配分の変更など）',
                },
                constraints: {
                  suggestionMaxLength: 200,
                  actionTagsMax: 3,
                },
                data: {
                  weeklyMinutes: data.weeklyMinutes,
                  weeklyHoursText: data.weeklyHoursText,
                  targetHours: data.targetHours,
                  exerciseRatio: data.exerciseRatio,
                  targetExerciseRatio: data.planRatios.exerciseRatio,
                  focusSubjects: data.focusSubjects,
                  activityMix: data.activityMix,
                },
              }),
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'weekly_plan_suggestion',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              suggestion: { type: 'string' },
              actionTags: {
                type: 'array',
                items: { type: 'string' },
                maxItems: 3,
              },
            },
            required: ['suggestion', 'actionTags'],
          },
        },
      },
    };

    const response = await createOpenAIResponse(payload);

    // レスポンスからテキストを抽出
    const extractOutputText = (resp: Record<string, unknown>): string | null => {
      const direct = resp.output_text;
      if (typeof direct === 'string') return direct;

      const output = resp.output;
      if (!Array.isArray(output)) return null;

      for (const item of output) {
        if (!item || typeof item !== 'object') continue;
        const content = (item as { content?: unknown }).content;
        if (!Array.isArray(content)) continue;
        for (const chunk of content) {
          if (!chunk || typeof chunk !== 'object') continue;
          if ((chunk as { type?: string }).type === 'output_text') {
            const text = (chunk as { text?: unknown }).text;
            if (typeof text === 'string') return text;
          }
        }
      }
      return null;
    };

    const text = extractOutputText(response);
    if (!text) {
      return {
        suggestion: `今週は「${data.focusSubjects[0]?.subject ?? '行政法'}」が目標比で不足しています。来週は演習比率を +10% にして、重要論点を短答→論文の順で復習しましょう。`,
        actionTags: ['重点科目強化', '演習重視'],
      };
    }

    const parsed = JSON.parse(text) as WeeklyAISuggestion;
    if (!parsed || typeof parsed.suggestion !== 'string' || !Array.isArray(parsed.actionTags)) {
      return {
        suggestion: `今週は「${data.focusSubjects[0]?.subject ?? '行政法'}」が目標比で不足しています。来週は演習比率を +10% にして、重要論点を短答→論文の順で復習しましょう。`,
        actionTags: ['重点科目強化', '演習重視'],
      };
    }

    return parsed;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Failed to generate weekly AI suggestion:', errorMessage);
    // エラー時もフォールバックを返す
    return {
      suggestion: `今週は「${data.focusSubjects[0]?.subject ?? '行政法'}」が目標比で不足しています。来週は演習比率を +10% にして、重要論点を短答→論文の順で復習しましょう。`,
      actionTags: ['重点科目強化', '演習重視'],
    };
  }
}
