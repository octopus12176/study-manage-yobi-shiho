import type { LucideIcon } from 'lucide-react';
import { CalendarDays, ClipboardList, Gauge, Sparkles, Timer } from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'ダッシュボード', icon: Gauge },
  { href: '/timer', label: 'タイマー', icon: Timer },
  { href: '/plan', label: '週間計画', icon: CalendarDays },
  { href: '/log', label: '記録', icon: ClipboardList },
  { href: '/review', label: 'レビュー', icon: Sparkles },
];
