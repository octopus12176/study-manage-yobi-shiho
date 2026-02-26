type HeatmapDay = {
  date: string;
  minutes: number;
  sessions: number;
};

type StudyHeatmapProps = {
  days: HeatmapDay[];
  maxMinutes: number;
};

const LEVEL_COLORS = [
  'var(--borderLight)',
  'var(--accentLight)',
  'rgba(255, 91, 120, 0.45)',
  'rgba(255, 91, 120, 0.7)',
  'var(--accent)',
];

const getLevel = (minutes: number, maxMinutes: number): number => {
  if (minutes <= 0 || maxMinutes <= 0) return 0;
  const ratio = Math.min(minutes / maxMinutes, 1);
  return Math.max(1, Math.ceil(ratio * 4));
};

const getMonthLabel = (date: string): string => `${Number(date.slice(5, 7))}月`;

export function StudyHeatmap({ days, maxMinutes }: StudyHeatmapProps) {
  if (!days.length) {
    return (
      <div className='flex h-[140px] items-center justify-center rounded-xl border border-dashed border-border text-xs text-sub'>
        データがありません
      </div>
    );
  }

  const weeks = Math.max(1, Math.floor(days.length / 7));

  return (
    <div className='flex flex-col gap-2'>
      <div className='overflow-x-auto pb-1'>
        <div className='flex min-w-[760px] flex-col gap-1'>
          <div className='grid grid-flow-col grid-rows-1 gap-1'>
            {Array.from({ length: weeks }).map((_, weekIdx) => {
              const day = days[weekIdx * 7];
              const prevDay = weekIdx > 0 ? days[(weekIdx - 1) * 7] : null;
              const currentMonth = day ? day.date.slice(5, 7) : null;
              const prevMonth = prevDay ? prevDay.date.slice(5, 7) : null;
              const isMonthChange = weekIdx === 0 || currentMonth !== prevMonth;
              return (
                <span key={day?.date ?? `month-${weekIdx}`} className='h-4 text-[10px] font-medium text-sub'>
                  {day && isMonthChange ? getMonthLabel(day.date) : ''}
                </span>
              );
            })}
          </div>
          <div className='grid grid-flow-col grid-rows-7 gap-1'>
            {days.map((day) => {
              const level = getLevel(day.minutes, maxMinutes);
              const color = LEVEL_COLORS[level];
              const tooltip = `${day.date} ・ ${day.minutes}分 ・ ${day.sessions}セッション`;

              return (
                <div
                  key={day.date}
                  className='h-3.5 w-3.5 rounded-[4px] border border-white/40 transition-transform duration-150 hover:scale-110'
                  style={{ background: color }}
                  title={tooltip}
                />
              );
            })}
          </div>
        </div>
      </div>
      <div className='flex items-center gap-2 text-[10px] text-sub'>
        <span>低</span>
        <div className='flex items-center gap-1'>
          {LEVEL_COLORS.map((color, idx) => (
            <span key={`${color}-${idx}`} className='h-2.5 w-2.5 rounded-[3px] border border-white/40' style={{ background: color }} />
          ))}
        </div>
        <span>高</span>
      </div>
    </div>
  );
}
