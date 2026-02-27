'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { QuickLogModal } from '@/components/log/quick-log-modal';

export function DashboardFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* FAB ボタン */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-50 md:hidden flex size-14 items-center justify-center rounded-full bg-accent text-white shadow-[0_8px_24px_rgba(255,91,120,0.45)] hover:shadow-[0_12px_32px_rgba(255,91,120,0.6)] transition-shadow active:scale-95"
        aria-label="クイック記録"
      >
        <Plus size={24} />
      </button>

      {/* QuickLogModal */}
      <QuickLogModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => setOpen(false)}
      />
    </>
  );
}
