'use client';

import { Coffee, Pause, Play, Settings, SkipForward, Target, Undo2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';

import { saveTimerSessionAction } from '@/app/timer/actions';
import { Chip } from '@/components/ui/chip';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SUBJECTS } from '@/lib/constants';
import { TimerRing } from '@/components/timer/timer-ring';

export function TimerView() {
  const [mode, setMode] = useState<'normal' | 'pomodoro'>('normal');
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [remaining, setRemaining] = useState(25 * 60);
  const [pomodoroPhase, setPomodoroPhase] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [totalWorked, setTotalWorked] = useState(0);

  const [workMin, setWorkMin] = useState(25);
  const [shortBreakMin, setShortBreakMin] = useState(5);
  const [longBreakMin, setLongBreakMin] = useState(15);
  const [longBreakEvery] = useState(4);

  const [subject, setSubject] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      if (!audioCtxRef.current) {
        const ContextCtor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!ContextCtor) return;
        audioCtxRef.current = new ContextCtor();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // noop
    }
  }, []);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      if (mode === 'normal') {
        setElapsed((prev) => prev + 1);
        setTotalWorked((prev) => prev + 1);
        return;
      }

      setRemaining((prev) => {
        if (prev <= 1) {
          playBeep();
          if (pomodoroPhase === 'work') {
            const newCount = pomodoroCount + 1;
            setPomodoroCount(newCount);
            if (newCount % longBreakEvery === 0) {
              setPomodoroPhase('longBreak');
              return longBreakMin * 60;
            }
            setPomodoroPhase('shortBreak');
            return shortBreakMin * 60;
          }

          setPomodoroPhase('work');
          return workMin * 60;
        }

        if (pomodoroPhase === 'work') {
          setTotalWorked((prevTotal) => prevTotal + 1);
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, pomodoroPhase, pomodoroCount, workMin, shortBreakMin, longBreakMin, longBreakEvery, playBeep]);

  const resetAll = () => {
    setIsRunning(false);
    setElapsed(0);
    setRemaining(workMin * 60);
    setPomodoroCount(0);
    setPomodoroPhase('work');
    setTotalWorked(0);
    setSubject('');
  };

  const handleReset = () => {
    setIsRunning(false);
    if (totalWorked > 60) {
      setShowComplete(true);
      return;
    }
    resetAll();
  };

  const handleSkipPhase = () => {
    if (mode !== 'pomodoro') return;
    playBeep();

    if (pomodoroPhase === 'work') {
      const nextCount = pomodoroCount + 1;
      setPomodoroCount(nextCount);
      if (nextCount % longBreakEvery === 0) {
        setPomodoroPhase('longBreak');
        setRemaining(longBreakMin * 60);
      } else {
        setPomodoroPhase('shortBreak');
        setRemaining(shortBreakMin * 60);
      }
      return;
    }

    setPomodoroPhase('work');
    setRemaining(workMin * 60);
  };

  const handleSaveSession = () => {
    const minutes = Math.round(totalWorked / 60);
    if (!subject || minutes <= 0) return;

    const endedAt = new Date();
    const startedAt = new Date(endedAt.getTime() - totalWorked * 1000);

    startTransition(async () => {
      const result = await saveTimerSessionAction({
        subject,
        minutes,
        mode,
        workMin,
        breakMin: shortBreakMin,
        cycles: pomodoroCount,
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
      });

      setResultMessage(result.message);
      setShowComplete(false);
      resetAll();
    });
  };

  const displayTime = mode === 'normal' ? elapsed : remaining;
  const totalDuration =
    mode === 'pomodoro'
      ? (pomodoroPhase === 'work' ? workMin : pomodoroPhase === 'shortBreak' ? shortBreakMin : longBreakMin) * 60
      : 1;
  const progress = mode === 'pomodoro' ? 1 - remaining / totalDuration : 0;

  const phaseColors = {
    work: 'var(--accent)',
    shortBreak: 'var(--success)',
    longBreak: '#6B7FD7',
  } as const;

  const phaseLabels = {
    work: '集中',
    shortBreak: '小休憩',
    longBreak: '長休憩',
  } as const;

  const currentColor = mode === 'pomodoro' ? phaseColors[pomodoroPhase] : 'var(--accent)';

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center justify-between'>
        <h1 className='text-[20px] font-black tracking-[-0.02em]'>タイマー</h1>
        <Button variant='secondary' size='sm' onClick={() => setShowSettings(true)}>
          <Settings size={15} />
          設定
        </Button>
      </div>

      {resultMessage && <div className='card border border-success/30 bg-successLight p-3 text-sm text-success'>{resultMessage}</div>}

      <div className='flex gap-1 rounded-xl border border-border bg-bg p-1'>
        {[
          { id: 'normal', label: '通常タイマー' },
          { id: 'pomodoro', label: 'ポモドーロ' },
        ].map((item) => (
          <button
            type='button'
            key={item.id}
            onClick={() => {
              if (isRunning) return;
              const nextMode = item.id as 'normal' | 'pomodoro';
              setMode(nextMode);
              if (nextMode === 'pomodoro') {
                setRemaining(workMin * 60);
                setPomodoroPhase('work');
              }
            }}
            className='flex-1 rounded-[10px] px-2 py-2.5 text-[13px] transition-all'
            style={{
              background: mode === item.id ? 'var(--card)' : 'transparent',
              color: mode === item.id ? 'var(--text)' : 'var(--sub)',
              fontWeight: mode === item.id ? 700 : 500,
              boxShadow: mode === item.id ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div>
        <p className='mb-2 text-xs font-semibold text-sub'>科目を選択</p>
        <div className='flex flex-wrap gap-1.5'>
          {SUBJECTS.map((name) => (
            <Chip key={name} label={name} active={subject === name} onClick={() => setSubject(name)} small />
          ))}
        </div>
      </div>

      <div className='flex flex-col items-center py-5'>
        {mode === 'pomodoro' && (
          <div
            className='mb-4 inline-flex items-center gap-1.5 rounded-full border px-[14px] py-[5px]'
            style={{
              background: `${phaseColors[pomodoroPhase]}18`,
              borderColor: `${phaseColors[pomodoroPhase]}40`,
            }}
          >
            {pomodoroPhase === 'work' ? <Target size={14} color={currentColor} /> : <Coffee size={14} color={currentColor} />}
            <span className='text-xs font-bold' style={{ color: currentColor }}>
              {phaseLabels[pomodoroPhase]}
            </span>
            <span className='text-[11px] text-sub'>#{pomodoroCount + 1}</span>
          </div>
        )}

        <TimerRing
          displayTime={displayTime}
          progress={progress}
          mode={mode}
          isRunning={isRunning}
          ringColor={currentColor}
          totalWorked={totalWorked}
        />

        <div className='mt-6 flex items-center gap-4'>
          <button
            type='button'
            onClick={handleReset}
            className='flex size-11 items-center justify-center rounded-full border-[1.5px] border-border bg-transparent transition-all'
          >
            <Undo2 size={18} color='var(--sub)' />
          </button>

          <button
            type='button'
            onClick={() => setIsRunning((v) => !v)}
            className='flex size-16 items-center justify-center rounded-full border-none transition-all'
            style={{
              background: isRunning ? 'var(--text)' : currentColor,
              boxShadow: isRunning ? '0 4px 20px rgba(0,0,0,0.15)' : `0 4px 20px ${currentColor}44`,
            }}
          >
            {isRunning ? <Pause size={24} color='white' /> : <Play size={24} color='white' />}
          </button>

          {mode === 'pomodoro' ? (
            <button
              type='button'
              onClick={handleSkipPhase}
              className='flex size-11 items-center justify-center rounded-full border-[1.5px] border-border bg-transparent transition-all'
            >
              <SkipForward size={18} color='var(--sub)' />
            </button>
          ) : (
            <div className='size-11' />
          )}
        </div>

        {mode === 'pomodoro' && (
          <div className='mt-5 flex gap-2'>
            {Array.from({ length: longBreakEvery }).map((_, idx) => (
              <div
                key={`dot-${idx}`}
                className='size-2.5 rounded-full transition-all duration-300'
                style={{
                  background:
                    idx < pomodoroCount % longBreakEvery
                      ? currentColor
                      : idx === pomodoroCount % longBreakEvery && pomodoroPhase === 'work'
                        ? `${currentColor}44`
                        : 'var(--border)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {totalWorked > 0 && (
        <Card className='animate-[fadeIn_0.3s_ease]'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-xs font-semibold text-sub'>今回のセッション</p>
              <div className='mt-1 text-[22px] font-black'>
                <span className='font-mono'>{Math.floor(totalWorked / 60)}</span>
                <span className='ml-0.5 text-[13px] text-sub'>分</span>
                {mode === 'pomodoro' && <span className='ml-2 text-[13px] text-sub'>🍅×{pomodoroCount}</span>}
              </div>
            </div>
            <Button variant='accent' onClick={handleReset}>
              記録して終了
            </Button>
          </div>
        </Card>
      )}

      {showComplete && (
        <div className='overlay' onClick={() => setShowComplete(false)}>
          <div className='modal text-center' onClick={(event) => event.stopPropagation()}>
            <div className='mb-5 animate-[ringBounce_0.5s_ease]'>
              <div className='mx-auto flex size-[72px] items-center justify-center rounded-full bg-success'>
                <Target size={32} color='white' />
              </div>
            </div>
            <p className='mb-2 text-xl font-black'>お疲れさまでした</p>
            <p className='font-mono text-4xl font-black text-accent'>
              {Math.round(totalWorked / 60)}
              <span className='ml-1 font-sans text-base text-sub'>分</span>
              {mode === 'pomodoro' && <span className='ml-2 font-sans text-base text-sub'>🍅×{pomodoroCount}</span>}
            </p>

            <div className='mt-5 text-left'>
              <p className='mb-2 text-xs font-semibold text-sub'>科目を選択して記録</p>
              <div className='flex flex-wrap justify-center gap-1.5'>
                {SUBJECTS.map((name) => (
                  <Chip key={`finish-${name}`} label={name} active={subject === name} onClick={() => setSubject(name)} />
                ))}
              </div>
            </div>

            <div className='mt-6 flex gap-2.5'>
              <Button
                variant='secondary'
                className='flex-1'
                onClick={() => {
                  setShowComplete(false);
                  resetAll();
                }}
              >
                記録しない
              </Button>
              <Button
                variant='accent'
                className='flex-1'
                disabled={!subject || isPending}
                onClick={handleSaveSession}
              >
                {isPending ? '保存中...' : '記録する'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className='overlay' onClick={() => setShowSettings(false)}>
          <div className='modal' onClick={(event) => event.stopPropagation()}>
            <div className='mb-6 flex items-center justify-between'>
              <h2 className='text-lg font-bold'>ポモドーロ設定</h2>
              <button type='button' className='p-1' onClick={() => setShowSettings(false)}>
                <X size={20} color='var(--sub)' />
              </button>
            </div>

            {[
              {
                label: '集中時間',
                value: workMin,
                setter: (value: number) => {
                  setWorkMin(value);
                  if (!isRunning && pomodoroPhase === 'work') setRemaining(value * 60);
                },
              },
              {
                label: '小休憩',
                value: shortBreakMin,
                setter: (value: number) => {
                  setShortBreakMin(value);
                  if (!isRunning && pomodoroPhase === 'shortBreak') setRemaining(value * 60);
                },
              },
              {
                label: '長休憩',
                value: longBreakMin,
                setter: (value: number) => {
                  setLongBreakMin(value);
                  if (!isRunning && pomodoroPhase === 'longBreak') setRemaining(value * 60);
                },
              },
            ].map((item) => (
              <div key={item.label} className='mb-4 flex items-center justify-between'>
                <span className='text-sm font-semibold'>{item.label}</span>
                <div className='flex items-center gap-2.5'>
                  <Button variant='secondary' size='sm' onClick={() => item.setter(Math.max(1, item.value - 5))}>
                    -
                  </Button>
                  <span className='w-10 text-center font-mono text-lg font-bold'>{item.value}</span>
                  <Button variant='secondary' size='sm' onClick={() => item.setter(item.value + 5)}>
                    +
                  </Button>
                  <span className='text-xs text-sub'>分</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
