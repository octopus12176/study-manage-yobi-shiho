'use client';

import { useState, useTransition } from 'react';
import { ClipboardPen, Sparkles } from 'lucide-react';

import { createStudySessionAction, type LogFormInput } from '@/app/log/actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ACTIVITY_OPTIONS,
  CAUSE_CATEGORIES,
  DEFAULT_LOG_MINUTES,
  EXAM_OPTIONS,
  MATERIALS,
  SUBJECTS,
  TRACK_OPTIONS,
} from '@/lib/constants';

type LogFormProps = {
  defaultSubject?: string;
};

const defaultPayload: LogFormInput = {
  subject: '',
  material: '',
  exam: 'both',
  track: 'ronbun',
  activity: 'drill',
  minutes: 60,
  confidence: 3,
  memo: '',
  causeCategory: '',
};

export function LogForm({ defaultSubject }: LogFormProps) {
  const [payload, setPayload] = useState<LogFormInput>({
    ...defaultPayload,
    subject: defaultSubject ?? defaultPayload.subject,
  });
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    startTransition(async () => {
      const normalized =
        payload.track === 'ronbun' ? payload : { ...payload, causeCategory: '' };
      const result = await createStudySessionAction(normalized);
      setMessage(result.message);
      if (result.ok) {
        setPayload((prev) => ({ ...defaultPayload, subject: prev.subject }));
      }
    });
  };

  return (
    <Card className='overflow-hidden p-0'>
      <div className='relative border-b border-white/20 bg-[linear-gradient(135deg,rgba(126,87,255,0.9),rgba(255,95,109,0.88))] px-6 py-5 text-white'>
        <div className='pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/15 blur-2xl' />
        <div className='relative flex items-start justify-between gap-4'>
          <div>
            <p className='mb-1 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/20 px-2.5 py-1 font-mono text-[10px] tracking-[0.11em]'>
              <ClipboardPen size={12} />
              LOG INPUT
            </p>
            <h1 className='text-[23px] font-black tracking-[-0.03em]'>学習を記録</h1>
            <p className='mt-1 text-[12px] text-white/80'>今の1セッションを最短で残して、次の学習に繋げる</p>
          </div>
          <span className='rounded-[10px] border border-white/30 bg-white/20 p-2'>
            <Sparkles size={16} />
          </span>
        </div>
      </div>

      <div className='space-y-4 p-6'>
        {message && <div className='rounded-[10px] border border-border bg-accentLight px-4 py-3 text-sm text-text'>{message}</div>}

        <div className='rounded-2xl border border-borderLight bg-[rgba(255,255,255,0.76)] p-4'>
          <Label>科目</Label>
          <div className='flex flex-wrap gap-1.5'>
            {SUBJECTS.map((item) => (
              <Chip
                key={item}
                label={item}
                small
                active={payload.subject === item}
                onClick={() => setPayload((prev) => ({ ...prev, subject: item }))}
              />
            ))}
          </div>
        </div>

        <div className='rounded-2xl border border-borderLight bg-[rgba(255,255,255,0.76)] p-4'>
          <Label>教材</Label>
          <div className='flex flex-wrap gap-1.5'>
            {MATERIALS.map((item) => (
              <Chip
                key={item}
                label={item}
                small
                active={payload.material === item}
                onClick={() => setPayload((prev) => ({ ...prev, material: item }))}
              />
            ))}
          </div>
        </div>

        <div className='grid gap-4 md:grid-cols-3'>
          <div className='rounded-2xl border border-borderLight bg-[rgba(255,255,255,0.76)] p-4'>
            <Label>試験区分</Label>
            <div className='flex flex-wrap gap-1.5'>
              {EXAM_OPTIONS.map((item) => (
                <Chip
                  key={item.value}
                  label={item.label}
                  small
                  active={payload.exam === item.value}
                  onClick={() => setPayload((prev) => ({ ...prev, exam: item.value }))}
                />
              ))}
            </div>
          </div>
          <div className='rounded-2xl border border-borderLight bg-[rgba(255,255,255,0.76)] p-4'>
            <Label>トラック</Label>
            <div className='flex flex-wrap gap-1.5'>
              {TRACK_OPTIONS.map((item) => (
                <Chip
                  key={item.value}
                  label={item.label}
                  small
                  active={payload.track === item.value}
                  onClick={() => setPayload((prev) => ({ ...prev, track: item.value }))}
                />
              ))}
            </div>
          </div>
          <div className='rounded-2xl border border-borderLight bg-[rgba(255,255,255,0.76)] p-4'>
            <Label>学習形態</Label>
            <div className='flex flex-wrap gap-1.5'>
              {ACTIVITY_OPTIONS.map((item) => (
                <Chip
                  key={item.value}
                  label={item.label}
                  small
                  active={payload.activity === item.value}
                  onClick={() => setPayload((prev) => ({ ...prev, activity: item.value }))}
                />
              ))}
            </div>
          </div>
        </div>

        <div className='grid gap-4 md:grid-cols-[1fr_auto]'>
          <div className='rounded-2xl border border-borderLight bg-[rgba(255,255,255,0.76)] p-4'>
            <Label>時間（分）</Label>
            <div className='flex flex-wrap gap-1.5'>
              {DEFAULT_LOG_MINUTES.map((minutes) => (
                <Chip
                  key={minutes}
                  label={`${minutes}分`}
                  small
                  active={payload.minutes === minutes}
                  onClick={() => setPayload((prev) => ({ ...prev, minutes }))}
                />
              ))}
            </div>
          </div>

          <div className='rounded-2xl border border-borderLight bg-[rgba(255,255,255,0.76)] p-4'>
            <Label>手応え</Label>
            <div className='flex gap-2'>
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type='button'
                  onClick={() => setPayload((prev) => ({ ...prev, confidence: level }))}
                  className='flex size-10 items-center justify-center rounded-[11px] border-[1.5px] text-sm font-bold transition-all'
                  style={{
                    background:
                      payload.confidence === level
                        ? level <= 2
                          ? 'var(--danger)'
                          : level <= 3
                            ? 'var(--warn)'
                            : 'var(--success)'
                        : 'white',
                    color: payload.confidence === level ? 'white' : 'var(--text)',
                    borderColor: payload.confidence === level ? 'transparent' : 'var(--border)',
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className='rounded-2xl border border-borderLight bg-[rgba(255,255,255,0.76)] p-4'>
          <Label>詰まりメモ</Label>
          <Textarea
            placeholder='何に詰まった？（1行でOK）'
            value={payload.memo}
            onChange={(event) => setPayload((prev) => ({ ...prev, memo: event.target.value }))}
          />
        </div>

        <div className='rounded-2xl border border-borderLight bg-[rgba(255,255,255,0.76)] p-4'>
          <Label>原因カテゴリ（論文の弱点）</Label>
          <p className='mb-2 text-[11px] text-sub'>論文トラックのみ任意で選択してください。</p>
          <div className='flex flex-wrap gap-1.5'>
            {CAUSE_CATEGORIES.map((item) => (
              <Chip
                key={item}
                label={item}
                small
                active={payload.causeCategory === item}
                onClick={() =>
                  setPayload((prev) => ({
                    ...prev,
                    causeCategory: prev.causeCategory === item ? '' : item,
                  }))
                }
              />
            ))}
          </div>
        </div>

        <Button
          variant='accent'
          className='w-full rounded-[14px] py-3 text-[15px]'
          disabled={isPending}
          onClick={submit}
        >
          {isPending ? '保存中...' : '記録する'}
        </Button>
      </div>
    </Card>
  );
}
