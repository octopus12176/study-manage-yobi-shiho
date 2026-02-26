import type { Metadata } from 'next';

import '@/app/globals.css';
import { AppShell } from '@/components/app/app-shell';
import { listStudySessionsInRange } from '@/lib/supabase/queries';

export const metadata: Metadata = {
  title: '司法の道 | 学習時間管理',
  description: '予備試験・司法試験向けの時間ベース学習管理アプリ',
};

export const dynamic = 'force-dynamic';

const buildStreak = (sessionDates: string[]): number => {
  const set = new Set(sessionDates);
  let streak = 0;
  const cursor = new Date();

  for (let i = 0; i < 90; i += 1) {
    const ymd = cursor.toISOString().split('T')[0];
    if (!set.has(ymd)) {
      break;
    }
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let streak = 0;

  try {
    const from = new Date();
    from.setDate(from.getDate() - 90);
    const sessions = await listStudySessionsInRange({
      from: from.toISOString(),
      to: new Date().toISOString(),
      limit: 500,
    });
    const sessionDates = sessions.map((session) => session.started_at.split('T')[0]);
    streak = buildStreak(sessionDates);
  } catch {
    streak = 0;
  }

  return (
    <html lang='ja'>
      <body>
        <AppShell streak={streak}>{children}</AppShell>
      </body>
    </html>
  );
}
