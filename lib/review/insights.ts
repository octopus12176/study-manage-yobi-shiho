import type { DashboardData } from '@/lib/dashboard';
import { createOpenAIResponse, getOpenAIKey, getOpenAIModel } from '@/lib/openai';
import { buildFallbackInsights } from '@/lib/review/fallback';
import type { ReviewInsights } from '@/lib/review/types';

const extractOutputText = (response: Record<string, unknown>): string | null => {
  const direct = response.output_text;
  if (typeof direct === 'string') return direct;

  const output = response.output;
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

export const generateReviewInsights = async (data: DashboardData): Promise<ReviewInsights> => {
  if (!getOpenAIKey()) {
    return buildFallbackInsights(data);
  }

  const memoInputs = data.yesterdayMemos.map((session) => ({
    id: session.id,
    subject: session.subject,
    memo: session.memo ?? '',
    confidence: session.confidence ?? 3,
  }));

  const payload = {
    model: getOpenAIModel(),
    instructions:
      'You are a study review assistant for Japanese law exam prep. Respond in Japanese. Keep feedback concise and actionable.',
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: JSON.stringify({
              request: {
                memoFeedback: '各メモに短い一言フィードバックと翌日の復習タスク',
                weeklyReview: '今週実績→計画差→来週配分の提案',
                ronbunDiagnosis: '原因カテゴリの偏りから次週の打ち手',
              },
              constraints: {
                memoFeedbackMaxLength: 40,
                weeklySummaryMaxLength: 120,
                gapNoteMaxLength: 80,
                nextWeekAllocationMaxLength: 140,
                actionTagsMax: 3,
                ronbunActionsMax: 3,
              },
              data: {
                weeklyMinutes: data.weeklyMinutes,
                weeklyHoursText: data.weeklyHoursText,
                targetHours: data.targetHours,
                exerciseRatio: data.exerciseRatio,
                targetExerciseRatio: data.planRatios.exerciseRatio,
                momentumPercent: data.momentumPercent,
                focusSubjects: data.focusSubjects,
                weakPoints: data.weakPoints,
                activityMix: data.activityMix,
                memos: memoInputs,
                ronbunCauseCounts: data.ronbunCauseCounts,
              },
            }),
          },
        ],
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'review_insights',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            memoFeedbacks: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  id: { type: 'string' },
                  feedback: { type: 'string' },
                  nextTask: { type: 'string' },
                },
                required: ['id', 'feedback', 'nextTask'],
              },
            },
            weeklyReview: {
              type: 'object',
              additionalProperties: false,
              properties: {
                summary: { type: 'string' },
                gapNote: { type: 'string' },
                nextWeekAllocation: { type: 'string' },
                actionTags: {
                  type: 'array',
                  items: { type: 'string' },
                  minItems: 1,
                },
              },
              required: ['summary', 'gapNote', 'nextWeekAllocation', 'actionTags'],
            },
            ronbunDiagnosis: {
              type: 'object',
              additionalProperties: false,
              properties: {
                biasSummary: { type: 'string' },
                actions: {
                  type: 'array',
                  items: { type: 'string' },
                  minItems: 1,
                },
                templateHint: { type: 'string' },
              },
              required: ['biasSummary', 'actions', 'templateHint'],
            },
          },
          required: ['memoFeedbacks', 'weeklyReview', 'ronbunDiagnosis'],
        },
      },
    },
  };

  try {
    const response = await createOpenAIResponse(payload);
    const text = extractOutputText(response);
    if (!text) {
      return buildFallbackInsights(data);
    }
    const parsed = JSON.parse(text) as ReviewInsights;
    if (
      !parsed ||
      !Array.isArray(parsed.memoFeedbacks) ||
      !parsed.weeklyReview ||
      !parsed.ronbunDiagnosis
    ) {
      return buildFallbackInsights(data);
    }
    return parsed;
  } catch {
    return buildFallbackInsights(data);
  }
};
