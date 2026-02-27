'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createStudySessionAction } from '@/app/log/actions';
import { savePomodoroRunAction } from '@/app/timer/actions';
import { SUBJECTS, MATERIALS, EXAM_OPTIONS, TRACK_OPTIONS, ACTIVITY_OPTIONS, CAUSE_CATEGORIES, DEFAULT_LOG_MINUTES } from '@/lib/constants';
import type { LogFormInput } from '@/app/log/actions';

export type QuickLogModalProps = {
  open: boolean;
  onClose: () => void;
  initialSubject?: string;
  initialMinutes?: number;
  pomodoroContext?: {
    mode: 'normal' | 'pomodoro';
    workMin: number;
    breakMin: number;
    cycles: number;
    startedAt: string;
    endedAt: string;
  };
  onSuccess?: () => void;
};

export function QuickLogModal({
  open,
  onClose,
  initialSubject = '',
  initialMinutes = 60,
  pomodoroContext,
  onSuccess,
}: QuickLogModalProps) {
  // 必須フィールド
  const [subject, setSubject] = useState('');
  const [minutes, setMinutes] = useState(60);
  const [exam, setExam] = useState<'yobi' | 'shiho' | 'both'>('both');
  const [track, setTrack] = useState<'tantou' | 'ronbun' | 'review' | 'mock' | 'other'>('ronbun');
  const [activity, setActivity] = useState<'input' | 'drill' | 'review' | 'write'>('drill');
  const [confidence, setConfidence] = useState(3);

  // 任意フィールド
  const [showDetails, setShowDetails] = useState(false);
  const [material, setMaterial] = useState('');
  const [causeCategory, setCauseCategory] = useState('');
  const [memo, setMemo] = useState('');

  // カスタム分数入力
  const [customMinutes, setCustomMinutes] = useState('');

  // UI 状態
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);

  // open が true になるたびに state をリセット
  useEffect(() => {
    if (open) {
      setSubject(initialSubject || '');
      setMinutes(initialMinutes || 60);
      setCustomMinutes(initialMinutes ? String(initialMinutes) : '');
      setExam('both');
      setTrack('ronbun');
      setActivity('drill');
      setConfidence(3);
      setMaterial('');
      setCauseCategory('');
      setMemo('');
      setShowDetails(false);
      setMessage('');
    }
  }, [open, initialSubject, initialMinutes]);

  const handleMinutesChange = (val: number) => {
    setMinutes(val);
    setCustomMinutes('');
  };

  const handleCustomMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomMinutes(val);
    if (val && !isNaN(Number(val))) {
      setMinutes(Number(val));
    }
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const payload: LogFormInput = {
        subject,
        material,
        exam,
        track,
        activity,
        minutes,
        confidence,
        memo,
        notes: '',
        date: new Date().toISOString().slice(0, 10),
        causeCategory: track === 'ronbun' ? causeCategory : '',
      };

      const result = await createStudySessionAction(payload);
      setMessage(result.message);

      if (result.ok && 'sessionId' in result) {
        // ポモドーロ記録がある場合は保存
        if (
          pomodoroContext?.mode === 'pomodoro' &&
          pomodoroContext.cycles >= 1
        ) {
          await savePomodoroRunAction({
            sessionId: result.sessionId,
            workMin: pomodoroContext.workMin,
            breakMin: pomodoroContext.breakMin,
            cycles: pomodoroContext.cycles,
            startedAt: pomodoroContext.startedAt,
            endedAt: pomodoroContext.endedAt,
          });
        }
        onSuccess?.();
        onClose();
      }
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-50 bg-gradient-to-r from-accent to-accent/80 px-5 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block bg-white/20 px-2.5 py-1 rounded-full text-xs font-semibold">
                QUICK LOG
              </span>
              <h2 className="text-lg font-bold">クイック記録</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* 科目 */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">
              科目
            </label>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    subject === s
                      ? 'bg-accent text-white'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 時間 */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">
              学習時間（分）
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {DEFAULT_LOG_MINUTES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleMinutesChange(m)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      minutes === m && customMinutes === ''
                        ? 'bg-accent text-white'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={customMinutes}
                onChange={handleCustomMinutesChange}
                placeholder="カスタム入力"
                min="1"
                max="720"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* 試験区分・トラック・活動 */}
          <div className="grid grid-cols-3 gap-3">
            {/* 試験区分 */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-200">
                試験
              </label>
              <div className="flex flex-col gap-1">
                {EXAM_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setExam(opt.value as 'yobi' | 'shiho' | 'both')}
                    className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                      exam === opt.value
                        ? 'bg-accent text-white'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* トラック */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-200">
                トラック
              </label>
              <div className="flex flex-col gap-1">
                {TRACK_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTrack(opt.value as any)}
                    className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                      track === opt.value
                        ? 'bg-accent text-white'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 活動 */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-200">
                活動
              </label>
              <div className="flex flex-col gap-1">
                {ACTIVITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setActivity(opt.value as any)}
                    className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                      activity === opt.value
                        ? 'bg-accent text-white'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 手応え */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">
              手応え
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setConfidence(num)}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    confidence === num
                      ? 'bg-accent text-white'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* 詳細展開ボタン */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showDetails ? '詳細を閉じる' : '▶ 詳細を追加'}
          </button>

          {/* 任意フィールド */}
          {showDetails && (
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              {/* 教材 */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">
                  教材（任意）
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setMaterial('')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      material === ''
                        ? 'bg-slate-300 text-slate-900 dark:bg-slate-600 dark:text-white'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    なし
                  </button>
                  {MATERIALS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMaterial(m)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        material === m
                          ? 'bg-accent text-white'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* 原因カテゴリ（論文のみ） */}
              {track === 'ronbun' && (
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">
                    失敗原因（任意）
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setCauseCategory('')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        causeCategory === ''
                          ? 'bg-slate-300 text-slate-900 dark:bg-slate-600 dark:text-white'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      選択なし
                    </button>
                    {CAUSE_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCauseCategory(cat)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          causeCategory === cat
                            ? 'bg-accent text-white'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* メモ */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">
                  詰まりメモ（任意）
                </label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="つまずいた内容や気づきを記入..."
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {memo.length}/500 文字
                </p>
              </div>
            </div>
          )}

          {/* メッセージ */}
          {message && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                message.includes('保存しました')
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
              }`}
            >
              {message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-40 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-4 flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isPending}
            className="flex-1"
          >
            キャンセル
          </Button>
          <Button
            type="button"
            variant="accent"
            onClick={handleSubmit}
            disabled={!subject || isPending}
            className="flex-1"
          >
            {isPending ? '保存中...' : '記録する'}
          </Button>
        </div>
      </div>
    </div>
  );
}
