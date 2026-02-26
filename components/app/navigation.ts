import type { LucideIcon } from 'lucide-react';
import { BookOpen, CalendarDays, ClipboardList, Gauge, PenLine, Sparkles, Timer } from 'lucide-react';

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
  { href: '/tantou', label: '短答', icon: BookOpen },
  { href: '/ronbun', label: '論文', icon: PenLine },
  { href: '/review', label: 'レビュー', icon: Sparkles },
];
