import { cn } from '@/lib/utils';

type ChipProps = {
  label: string;
  active?: boolean;
  small?: boolean;
  onClick?: () => void;
  className?: string;
};

export function Chip({ label, active = false, small = false, onClick, className }: ChipProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full border-[1.5px] transition-all',
        small ? 'px-[10px] py-[3px] text-[11px]' : 'px-[14px] py-[5px] text-xs',
        active ? 'border-text bg-text font-semibold text-white' : 'border-border bg-transparent text-text',
        className
      )}
    >
      {label}
    </button>
  );
}
