import { Suspense } from 'react';
import type { Metadata } from 'next';

import '@/app/globals.css';
import { AppShell } from '@/components/app/app-shell';
import { StreakBadge } from '@/components/app/streak-badge';

export const metadata: Metadata = {
  title: '司法の道 | 学習時間管理',
  description: '予備試験・司法試験向けの時間ベース学習管理アプリ',
};

export const dynamic = 'force-dynamic';

function StreakBadgeFallback() {
  return (
    <div className='inline-flex items-center gap-1 rounded-2xl border border-border bg-bg px-[10px] py-[5px]'>
      <div className='h-[13px] w-[13px] rounded-full bg-border' />
      <span className='h-4 w-4 rounded bg-border text-[13px] font-bold text-text' />
      <span className='text-[10px] text-sub'>日連続</span>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ja'>
      <body>
        <AppShell
          streakSlot={
            <Suspense fallback={<StreakBadgeFallback />}>
              <StreakBadge />
            </Suspense>
          }
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
