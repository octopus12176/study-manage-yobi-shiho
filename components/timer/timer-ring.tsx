import { formatTimer } from '@/lib/date';

type TimerRingProps = {
  displayTime: number;
  progress: number;
  mode: 'normal' | 'pomodoro';
  isRunning: boolean;
  ringColor: string;
  totalWorked: number;
};

const CIRCUMFERENCE = 2 * Math.PI * 96;

export function TimerRing({ displayTime, progress, mode, isRunning, ringColor, totalWorked }: TimerRingProps) {
  return (
    <div className='timer-ring' style={{ animation: isRunning ? 'timerPulse 2s ease-in-out infinite' : 'none' }}>
      <svg width='220' height='220'>
        <circle cx='110' cy='110' r='96' fill='none' stroke='var(--borderLight)' strokeWidth='6' />
        {mode === 'pomodoro' && (
          <circle
            cx='110'
            cy='110'
            r='96'
            fill='none'
            stroke={ringColor}
            strokeWidth='6'
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            strokeLinecap='round'
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        )}
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-center'>
        <div className='font-mono text-[52px] font-black leading-none tracking-[-0.03em] text-text'>
          {formatTimer(displayTime)}
        </div>
        {mode === 'normal' && totalWorked > 0 && (
          <div className='mt-2 text-xs text-sub'>合計 {Math.floor(totalWorked / 60)}分</div>
        )}
      </div>
    </div>
  );
}
