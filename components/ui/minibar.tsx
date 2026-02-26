import { cn } from '@/lib/utils';

type MiniBarProps = {
  value: number;
  max: number;
  color?: string;
  h?: number;
  className?: string;
};

export function MiniBar({ value, max, color = 'var(--text)', h = 8, className }: MiniBarProps) {
  const width = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div
      className={cn('relative overflow-hidden rounded-full bg-borderLight', className)}
      style={{ height: h }}
    >
      <div
        className='h-full rounded-full transition-all duration-500'
        style={{ width: `${Math.max(width, 3)}%`, backgroundColor: color }}
      />
    </div>
  );
}
