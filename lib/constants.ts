import { addDays, format, startOfWeek } from 'date-fns';

export const SUBJECTS = [
  '憲法',
  '行政法',
  '民法',
  '商法',
  '民訴法',
  '刑法',
  '刑訴法',
  '実務基礎',
] as const;

export const MATERIALS = ['過去問', '重要問題集', '講義', '答練', '基本書', '判例集'] as const;

export const STUDY_TYPES = ['インプット', '演習', '復習'] as const;

export const EXAM_OPTIONS = [
  { value: 'yobi', label: '予備試験' },
  { value: 'shiho', label: '司法試験' },
  { value: 'both', label: '両方' },
] as const;

export const TRACK_OPTIONS = [
  { value: 'tantou', label: '短答' },
  { value: 'ronbun', label: '論文' },
  { value: 'review', label: '復習' },
  { value: 'mock', label: '模試/答練' },
  { value: 'other', label: 'その他' },
] as const;

export const ACTIVITY_OPTIONS = [
  { value: 'input', label: 'インプット' },
  { value: 'drill', label: '演習' },
  { value: 'review', label: '復習' },
  { value: 'write', label: '答案作成' },
] as const;

export const WEEKDAY_LABELS = ['月', '火', '水', '木', '金', '土', '日'] as const;

export const DEFAULT_WEEKLY_PLAN = {
  weekdayHours: 3,
  weekendHours: 7,
  exerciseRatio: 60,
  subjectRatios: {
    憲法: 10,
    行政法: 20,
    民法: 20,
    商法: 10,
    民訴法: 10,
    刑法: 15,
    刑訴法: 10,
    実務基礎: 5,
  },
} as const;

export const DEFAULT_WEEKLY_TARGET_MIN =
  (DEFAULT_WEEKLY_PLAN.weekdayHours * 5 + DEFAULT_WEEKLY_PLAN.weekendHours * 2) * 60;

export const DEFAULT_LOG_MINUTES = [30, 45, 60, 90, 120] as const;

export const getCurrentWeekDates = (baseDate: Date = new Date()): string[] => {
  const monday = startOfWeek(baseDate, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, idx) => format(addDays(monday, idx), 'yyyy-MM-dd'));
};
