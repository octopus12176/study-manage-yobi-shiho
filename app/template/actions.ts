'use server';

import { revalidatePath } from 'next/cache';
import { createEssayTemplate, deleteEssayTemplate } from '@/lib/supabase/queries';

export type EssayTemplateInput = {
  subject: string;
  title: string;
  template: string;
  norm: string;
  pitfall: string;
};

export async function createEssayTemplateAction(payload: EssayTemplateInput) {
  if (!payload.subject || !payload.title) {
    return { ok: false as const, message: '科目と論点名は必須です。' };
  }

  await createEssayTemplate({
    subject: payload.subject,
    title: payload.title,
    template: payload.template || null,
    norm: payload.norm || null,
    pitfall: payload.pitfall || null,
  });

  revalidatePath('/template');

  return { ok: true as const, message: 'テンプレを保存しました。' };
}

export async function deleteEssayTemplateAction(id: string) {
  await deleteEssayTemplate(id);
  revalidatePath('/template');
  return { ok: true as const };
}
