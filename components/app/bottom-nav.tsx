'use client';

import Link from 'next/link';

import { NAV_ITEMS } from '@/components/app/navigation';
import { cn } from '@/lib/utils';

type BottomNavProps = {
  pathname: string;
  onNavigate?: () => void;
};

const isActivePath = (pathname: string, href: string) => {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
};

export function BottomNav({ pathname, onNavigate }: BottomNavProps) {
  return (
    <nav className='bottom-nav'>
      {NAV_ITEMS.map((item) => {
        const active = isActivePath(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn('bottom-nav-item', active && 'active')}
          >
            <Icon size={20} color={active ? 'var(--text)' : 'var(--muted)'} />
            <span className={cn(active ? 'font-bold text-text' : 'font-medium text-muted')}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
