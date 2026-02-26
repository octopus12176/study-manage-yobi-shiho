'use client';

import { useState, useTransition } from 'react';

import { createStudySessionAction, type LogFormInput } from '@/app/log/actions';
import { Chip } from '@/components/ui/chip';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ACTIVITY_OPTIONS,
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
      const result = await createStudySessionAction(payload);
      setMessage(result.message);
      if (result.ok) {
        setPayload((prev) => ({ ...defaultPayload, subject: prev.subject }));
      }
    });
  };

  return (
    <Card className='p-8'>
      <h1 className='mb-1 text-[20px] font-black tracking-[-0.02em]'>学習を記録</h1>
      <p className='mb-6 text-sm text-sub'>Log Modal相当の入力をページ上フォームとして実装</p>

      {message && <div className='mb-4 rounded-[10px] bg-accentLight px-4 py-3 text-sm text-text'>{message}</div>}

      <div className='mb-4'>
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

      <div className='mb-4'>
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

      <div className='mb-4 grid gap-4 md:grid-cols-3'>
        <div>
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
        <div>
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
        <div>
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

      <div className='mb-4'>
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

      <div className='mb-4'>
        <Label>手応え</Label>
        <div className='flex gap-2'>
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              type='button'
              onClick={() => setPayload((prev) => ({ ...prev, confidence: level }))}
              className='flex size-9 items-center justify-center rounded-[10px] border-[1.5px] text-sm font-bold transition-all'
              style={{
                background:
                  payload.confidence === level
                    ? level <= 2
                      ? 'var(--danger)'
                      : level <= 3
                        ? 'var(--warn)'
                        : 'var(--success)'
                    : 'var(--bg)',
                color: payload.confidence === level ? 'white' : 'var(--text)',
                borderColor: payload.confidence === level ? 'transparent' : 'var(--border)',
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className='mb-6'>
        <Label>詰まりメモ</Label>
        <Textarea
          placeholder='何に詰まった？（1行でOK）'
          value={payload.memo}
          onChange={(event) => setPayload((prev) => ({ ...prev, memo: event.target.value }))}
        />
      </div>

      <Button
        variant='default'
        className='w-full rounded-[14px] py-3 text-[15px]'
        disabled={isPending}
        onClick={submit}
      >
        {isPending ? '保存中...' : '記録する'}
      </Button>
    </Card>
  );
}
