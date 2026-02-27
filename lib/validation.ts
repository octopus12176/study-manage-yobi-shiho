import { z } from 'zod';
import {
  SUBJECTS,
  MATERIALS,
  EXAM_OPTIONS,
  TRACK_OPTIONS,
  ACTIVITY_OPTIONS,
  CAUSE_CATEGORIES,
} from '@/lib/constants';

// ── 定数から enum 値を抽出 ──

// SUBJECTS, MATERIALS, CAUSE_CATEGORIES は string[] as const
const subjectValues = SUBJECTS as readonly [string, ...string[]];
const materialValues = MATERIALS as readonly [string, ...string[]];
const causeValues = CAUSE_CATEGORIES as readonly [string, ...string[]];

// EXAM_OPTIONS, TRACK_OPTIONS, ACTIVITY_OPTIONS は { value: string, label: string }[] as const
const examValues = EXAM_OPTIONS.map((o) => o.value) as unknown as readonly [string, ...string[]];
const trackValues = TRACK_OPTIONS.map((o) => o.value) as unknown as readonly [string, ...string[]];
const activityValues = ACTIVITY_OPTIONS.map((o) => o.value) as unknown as readonly [string, ...string[]];

// ── 共通フィールドスキーマ ──

export const subjectSchema = z.enum(subjectValues);

export const examSchema = z.enum(examValues);

export const trackSchema = z.enum(trackValues);

export const activitySchema = z.enum(activityValues);

export const uuidSchema = z.string().uuid('Invalid UUID format');

// ── 学習ログ スキーマ ──

export const logFormSchema = z.object({
  subject: subjectSchema,
  material: z.enum(materialValues),
  exam: examSchema,
  track: trackSchema,
  activity: activitySchema,
  minutes: z
    .number()
    .int()
    .min(1, '学習時間は1分以上にしてください。')
    .max(720, '学習時間は720分（12時間）以内にしてください。'),
  confidence: z
    .number()
    .int()
    .min(1, '手応えは1以上を選択してください。')
    .max(5, '手応えは5以下を選択してください。'),
  memo: z
    .string()
    .max(500, '詰まりメモは500文字以内にしてください。')
    .optional()
    .default(''),
  notes: z
    .string()
    .max(2000, '勉強内容は2000文字以内にしてください。')
    .optional()
    .default(''),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '日付の形式が正しくありません（yyyy-MM-dd）。')
    .optional(),
  causeCategory: z
    .union([z.enum(causeValues), z.literal('')])
    .optional()
    .default(''),
});

export type LogFormValidated = z.infer<typeof logFormSchema>;

// ── 週間計画 スキーマ ──

export const weeklyPlanSchema = z.object({
  targetHours: z
    .number()
    .min(1, '週目標は1時間以上にしてください。')
    .max(168, '週目標は168時間以内にしてください。'),
  weekdayHours: z
    .number()
    .min(0, '平日時間は0以上にしてください。')
    .max(24, '平日時間は24時間以内にしてください。'),
  weekendHours: z
    .number()
    .min(0, '休日時間は0以上にしてください。')
    .max(24, '休日時間は24時間以内にしてください。'),
  exerciseRatio: z
    .number()
    .int()
    .min(0, '演習比率は0%以上にしてください。')
    .max(100, '演習比率は100%以下にしてください。'),
  focusedSubjectNames: z
    .array(subjectSchema)
    .max(8, 'フォーカス科目は8つ以内にしてください。'),
});

export type WeeklyPlanValidated = z.infer<typeof weeklyPlanSchema>;

// ── タイマーセッション スキーマ ──

export const timerSessionSchema = z.object({
  subject: subjectSchema,
  minutes: z
    .number()
    .int()
    .min(1, '学習時間は1分以上にしてください。')
    .max(720, '学習時間は720分以内にしてください。'),
  mode: z.enum(['normal', 'pomodoro'] as const),
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

export type TimerSessionValidated = z.infer<typeof timerSessionSchema>;

// ── 論文テンプレ スキーマ ──

const HTML_MAX_LENGTH = 50000;

export const essayTemplateSchema = z.object({
  subject: subjectSchema,
  title: z
    .string()
    .min(1, '論点名は必須です。')
    .max(200, '論点名は200文字以内にしてください。'),
  template: z
    .string()
    .max(HTML_MAX_LENGTH, 'テンプレートが長すぎます。')
    .optional()
    .default(''),
  norm: z
    .string()
    .max(HTML_MAX_LENGTH, '規範が長すぎます。')
    .optional()
    .default(''),
  pitfall: z
    .string()
    .max(HTML_MAX_LENGTH, '注意点が長すぎます。')
    .optional()
    .default(''),
  rank: z
    .enum(['S', 'A', 'B', 'C'] as const)
    .optional()
    .default('C'),
});

export type EssayTemplateValidated = z.infer<typeof essayTemplateSchema>;

// ── 基礎知識 スキーマ ──

export const legalConceptSchema = z.object({
  subject: subjectSchema,
  category: z.string().max(100).optional().default('その他'),
  title: z
    .string()
    .min(1, '概念名は必須です。')
    .max(200, '概念名は200文字以内にしてください。'),
  summary: z
    .string()
    .max(HTML_MAX_LENGTH, 'サマリーが長すぎます。')
    .optional()
    .default(''),
  framework: z
    .string()
    .max(HTML_MAX_LENGTH, 'フレームワークが長すぎます。')
    .optional()
    .default(''),
  notes: z
    .string()
    .max(HTML_MAX_LENGTH, 'ノートが長すぎます。')
    .optional()
    .default(''),
});

export type LegalConceptValidated = z.infer<typeof legalConceptSchema>;

// ── エラーハンドリング ──

export type ValidationError = { ok: false; message: string };

/**
 * ZodErrorから最初のエラーメッセージを取り出す
 */
export function formatZodError(error: z.ZodError): ValidationError {
  const firstIssue = error.issues[0];
  const field = firstIssue.path.join('.');
  const fieldLabel = field ? `[${field}] ` : '';
  return { ok: false, message: `${fieldLabel}${firstIssue.message}` };
}
