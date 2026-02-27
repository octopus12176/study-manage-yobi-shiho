'use client';

import { Coffee, Pause, Play, Settings, SkipForward, Target, Timer, Undo2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Chip } from '@/components/ui/chip';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SUBJECTS } from '@/lib/constants';
import { formatTimer } from '@/lib/date';
import { TimerRing } from '@/components/timer/timer-ring';
import { QuickLogModal } from '@/components/log/quick-log-modal';

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
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [timerSessionContext, setTimerSessionContext] = useState<{ startedAt: string; endedAt: string } | null>(null);

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
      const endedAt = new Date();
      const startedAt = new Date(endedAt.getTime() - totalWorked * 1000);
      setTimerSessionContext({
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
      });
      setShowQuickLog(true);
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
  const sessionMinutes = Math.floor(totalWorked / 60);
  const modeLabel = mode === 'pomodoro' ? 'ポモドーロ' : '通常タイマー';
  const heroMessage =
    mode === 'pomodoro'
      ? `${phaseLabels[pomodoroPhase]}フェーズ。${isRunning ? '集中ラインを維持しましょう。' : '準備ができたら開始してください。'}`
      : isRunning
        ? '計測中。区切りの良いタイミングでリセットしましょう。'
        : 'スタートで計測開始。集中したい科目を選んでください。';

  const heroStats =
    mode === 'pomodoro'
      ? [
          { label: 'WORK', value: `${workMin}m`, sub: '集中' },
          { label: 'SHORT', value: `${shortBreakMin}m`, sub: '小休憩' },
          { label: 'LONG', value: `${longBreakMin}m`, sub: '長休憩' },
          { label: 'CYCLE', value: `${pomodoroCount}`, sub: `${longBreakEvery}回で長休憩` },
        ]
      : [
          { label: 'ELAPSED', value: formatTimer(elapsed), sub: '経過' },
          { label: 'TOTAL', value: `${sessionMinutes}m`, sub: '累計' },
          { label: 'STATE', value: isRunning ? 'RUN' : 'IDLE', sub: '稼働状況' },
          { label: 'SUBJECT', value: subject || '—', sub: '選択科目' },
        ];

  return (
    <div className='flex flex-col gap-4'>
      <section className='relative overflow-hidden rounded-[22px] border border-white/20 bg-[linear-gradient(135deg,rgba(126,87,255,0.9),rgba(255,95,109,0.86)_55%,rgba(18,27,54,0.92))] p-6 text-white shadow-[0_22px_50px_rgba(24,14,62,0.35)]'>
        <div className='pointer-events-none absolute -left-12 -top-12 h-52 w-52 rounded-full bg-white/15 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-14 right-0 h-48 w-48 rounded-full bg-cyan-300/25 blur-3xl' />

        <div className='relative grid grid-cols-[1.15fr_1fr] gap-4 max-lg:grid-cols-1'>
          <div>
            <p className='mb-2 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/20 px-3 py-1 font-mono text-[10px] tracking-[0.12em]'>
              <Timer size={12} />
              FOCUS TIMER
            </p>
            <h1 className='text-[30px] font-black leading-[1.12] tracking-[-0.03em]'>集中タイマー</h1>
            <p className='mt-1.5 text-[13px] text-white/85'>{heroMessage}</p>
            <div className='mt-3 flex flex-wrap gap-2'>
              <span className='rounded-full border border-white/30 bg-black/20 px-3 py-1 text-[11px] font-semibold'>
                モード {modeLabel}
              </span>
              <span className='rounded-full border border-white/30 bg-black/20 px-3 py-1 text-[11px] font-semibold'>
                科目 {subject || '未選択'}
              </span>
              <span className='rounded-full border border-white/30 bg-black/20 px-3 py-1 text-[11px] font-semibold'>
                累計 {sessionMinutes}分
              </span>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-2.5'>
            {heroStats.map((stat) => (
              <div key={stat.label} className='rounded-[14px] border border-white/25 bg-black/20 p-3'>
                <p className='font-mono text-[10px] tracking-[0.12em] text-white/70'>{stat.label}</p>
                <p className='mt-1 text-[22px] font-black leading-none'>{stat.value}</p>
                <p className='mt-1 text-[11px] text-white/75'>{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <div className='grid grid-cols-[minmax(320px,1fr)_minmax(260px,0.9fr)] gap-4 max-lg:grid-cols-1'>
        <Card className='p-5'>
          <div className='mb-3 flex items-center justify-between'>
            <p className='text-sm font-bold'>タイマー</p>
            <Button variant='secondary' size='sm' onClick={() => setShowSettings(true)}>
              <Settings size={15} />
              設定
            </Button>
          </div>

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
        </Card>

        <div className='flex flex-col gap-3'>
          <Card className='p-5'>
            <p className='mb-2 text-xs font-semibold text-sub'>科目を選択</p>
            <div className='flex flex-wrap gap-1.5'>
              {SUBJECTS.map((name) => (
                <Chip key={name} label={name} active={subject === name} onClick={() => setSubject(name)} small />
              ))}
            </div>
          </Card>

          {totalWorked > 0 ? (
            <Card className='animate-[fadeIn_0.3s_ease] p-5'>
              <div className='flex items-center justify-between gap-4'>
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
          ) : (
            <Card className='p-5'>
              <p className='text-sm font-bold'>セッション記録</p>
              <p className='mt-1 text-[12px] text-sub'>タイマー開始後に学習時間を記録できます。</p>
            </Card>
          )}

          <Card className='p-5'>
            <div className='mb-3 flex items-center justify-between'>
              <p className='text-sm font-bold'>ポモドーロ設定</p>
              <Button variant='secondary' size='sm' onClick={() => setShowSettings(true)}>
                <Settings size={15} />
                設定
              </Button>
            </div>
            <div className='space-y-2 text-[12px] text-sub'>
              <div className='flex items-center justify-between'>
                <span>集中</span>
                <span className='font-mono text-[12px] text-text'>{workMin}分</span>
              </div>
              <div className='flex items-center justify-between'>
                <span>小休憩</span>
                <span className='font-mono text-[12px] text-text'>{shortBreakMin}分</span>
              </div>
              <div className='flex items-center justify-between'>
                <span>長休憩</span>
                <span className='font-mono text-[12px] text-text'>{longBreakMin}分</span>
              </div>
              <div className='flex items-center justify-between'>
                <span>長休憩サイクル</span>
                <span className='font-mono text-[12px] text-text'>{longBreakEvery}回</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <QuickLogModal
        open={showQuickLog}
        onClose={() => {
          setShowQuickLog(false);
          resetAll();
        }}
        initialSubject={subject}
        initialMinutes={Math.round(totalWorked / 60)}
        pomodoroContext={mode === 'pomodoro' && timerSessionContext ? {
          mode,
          workMin,
          breakMin: shortBreakMin,
          cycles: pomodoroCount,
          startedAt: timerSessionContext.startedAt,
          endedAt: timerSessionContext.endedAt,
        } : undefined}
        onSuccess={() => {
          setShowQuickLog(false);
          resetAll();
        }}
      />

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
