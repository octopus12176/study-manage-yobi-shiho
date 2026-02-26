'use client';

import Link from 'next/link';
import { Flame, Scale } from 'lucide-react';

import { NAV_ITEMS } from '@/components/app/navigation';
import { cn } from '@/lib/utils';

type SidebarProps = {
  pathname: string;
  streak: number;
  open: boolean;
  onNavigate?: () => void;
};

const isActivePath = (pathname: string, href: string) => {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
};

export function Sidebar({ pathname, streak, open, onNavigate }: SidebarProps) {
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

      <div className='border-t border-border px-5 py-4'>
        <div
          className={cn(
            'inline-flex items-center gap-1 rounded-2xl border px-[10px] py-[5px]',
            streak >= 7 ? 'border-[#FFB74D] bg-[#FFF3E0]' : 'border-border bg-bg'
          )}
        >
          <Flame size={13} color={streak >= 7 ? '#FF8F00' : 'var(--sub)'} />
          <span className={cn('text-[13px] font-bold', streak >= 7 ? 'text-[#E65100]' : 'text-text')}>
            {streak}
          </span>
          <span className='text-[10px] text-sub'>日連続</span>
        </div>
      </div>
    </aside>
  );
}
