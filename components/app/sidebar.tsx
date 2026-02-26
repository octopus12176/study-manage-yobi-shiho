'use client';

import Link from 'next/link';
import { Scale } from 'lucide-react';

import { NAV_ITEMS } from '@/components/app/navigation';
import { cn } from '@/lib/utils';

type SidebarProps = {
  pathname: string;
  streakSlot: React.ReactNode;
  open: boolean;
  onNavigate?: () => void;
};

const isActivePath = (pathname: string, href: string) => {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
};

export function Sidebar({ pathname, streakSlot, open, onNavigate }: SidebarProps) {
  return (
    <aside className={cn('sidebar', open && 'open')}>
      <div className='border-b border-border px-5 pb-5 pt-6'>
        <div className='flex items-center gap-2.5'>
          <div className='flex size-9 items-center justify-center rounded-[10px] bg-text'>
            <Scale size={18} color='white' />
          </div>
          <div>
            <p className='text-base font-black leading-tight tracking-[-0.02em]'>司法の道</p>
            <p className='text-[10px] font-medium tracking-[0.06em] text-sub'>SHIHO NO MICHI</p>
          </div>
        </div>
      </div>

      <nav className='flex-1 overflow-y-auto py-3'>
        {NAV_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('sidebar-item', active && 'active')}
              onClick={onNavigate}
            >
              <Icon size={18} color={active ? 'var(--text)' : 'var(--sub)'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className='border-t border-border px-5 py-4'>{streakSlot}</div>
    </aside>
  );
}
