'use client';

import Link from 'next/link';
import { Menu, Plus, Scale } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { BottomNav } from '@/components/app/bottom-nav';
import { Sidebar } from '@/components/app/sidebar';
import { Button } from '@/components/ui/button';

type AppShellProps = {
  children: React.ReactNode;
  streak: number;
};

export function AppShell({ children, streak }: AppShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className='relative min-h-screen bg-bg text-text'>
      <Sidebar pathname={pathname} open={sidebarOpen} streak={streak} onNavigate={() => setSidebarOpen(false)} />

      <header className='mobile-header sticky top-0 z-50 hidden items-center justify-between border-b border-border bg-[rgba(255,255,255,0.84)] px-4 py-3 backdrop-blur-xl'>
        <div className='flex items-center gap-2.5'>
          <button type='button' onClick={() => setSidebarOpen((v) => !v)} className='p-1'>
            <Menu size={22} />
          </button>
          <div className='flex items-center gap-2'>
            <Scale size={18} />
            <span className='text-sm font-black tracking-[-0.02em]'>予備・司法試験勉強管理アプリ</span>
          </div>
        </div>
        <Button size='sm' variant='accent' asChild>
          <Link href='/log'>
            <Plus size={14} />
          </Link>
        </Button>
      </header>

      {sidebarOpen && <div className='fixed inset-0 z-[55] bg-black/25 md:hidden' onClick={() => setSidebarOpen(false)} />}

      <div className='main-area'>
        <div className='mx-auto max-w-[1120px] px-5 pb-10 pt-6 md:px-8'>
          <div className='mb-6 hidden items-center justify-end md:flex'>
            <Button variant='accent' asChild className='rounded-xl px-5'>
              <Link href='/log'>
                <Plus size={16} />
                学習を記録
              </Link>
            </Button>
          </div>
          {children}
        </div>
      </div>

      <BottomNav pathname={pathname} onNavigate={() => setSidebarOpen(false)} />
    </div>
  );
}
