'use client';

import { X } from 'lucide-react';

import type { StudySessionRow } from '@/lib/supabase/queries';
import { LogForm } from './log-form';

type Props = {
  session: StudySessionRow;
  onClose: () => void;
};

export function EditSessionModal({ session, onClose }: Props) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={onClose} />
      <div className='relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl shadow-2xl'>
        <button
          type='button'
          onClick={onClose}
          className='absolute right-4 top-4 z-20 rounded-full bg-black/20 p-1.5 text-white hover:bg-black/40'
        >
          <X size={16} />
        </button>
        <LogForm editSession={session} onSuccess={onClose} />
      </div>
    </div>
  );
}
