import { endOfWeek, format, startOfWeek } from 'date-fns';

export const getWeekStartDate = (date: Date = new Date()): Date =>
  startOfWeek(date, { weekStartsOn: 1 });

export const getWeekStartString = (date: Date = new Date()): string =>
  format(getWeekStartDate(date), 'yyyy-MM-dd');

export const getWeekRange = (date: Date = new Date()): { start: string; end: string } => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return {
    start: format(start, "yyyy-MM-dd'T'00:00:00XXX"),
    end: format(end, "yyyy-MM-dd'T'23:59:59XXX"),
  };
};

export const getTodayDateString = (date: Date = new Date()): string => format(date, 'yyyy-MM-dd');

export const getYesterdayDateString = (date: Date = new Date()): string => {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return format(d, 'yyyy-MM-dd');
};

export const formatTimer = (totalSec: number): string => {
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};
