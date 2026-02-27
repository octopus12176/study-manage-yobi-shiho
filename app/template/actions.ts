'use server';

import { revalidatePath } from 'next/cache';
import {
  createEssayTemplate,
  deleteEssayTemplate,
  updateEssayTemplate,
  createLegalConcept,
  deleteLegalConcept,
  updateLegalConcept,
} from '@/lib/supabase/queries';

export type EssayTemplateInput = {
  subject: string;
  title: string;
  template: string;
  norm: string;
  pitfall: string;
  rank: string;
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
    rank: payload.rank,
  });

  revalidatePath('/template');

  return { ok: true as const, message: 'テンプレを保存しました。' };
}

export async function updateEssayTemplateAction(id: string, payload: EssayTemplateInput) {
  if (!payload.subject || !payload.title) {
    return { ok: false as const, message: '科目と論点名は必須です。' };
  }

  await updateEssayTemplate(id, {
    subject: payload.subject,
    title: payload.title,
    template: payload.template || null,
    norm: payload.norm || null,
    pitfall: payload.pitfall || null,
    rank: payload.rank,
  });

  revalidatePath('/template');

  return { ok: true as const, message: 'テンプレを更新しました。' };
}

export async function deleteEssayTemplateAction(id: string) {
  await deleteEssayTemplate(id);
  revalidatePath('/template');
  return { ok: true as const };
}

export type LegalConceptInput = {
  subject: string;
  category: string;
  title: string;
  summary: string;
  framework: string;
  notes: string;
};

export async function createLegalConceptAction(payload: LegalConceptInput) {
  if (!payload.subject || !payload.title) {
    return { ok: false as const, message: '科目と概念名は必須です。' };
  }

  await createLegalConcept({
    subject: payload.subject,
    category: payload.category || 'その他',
    title: payload.title,
    summary: payload.summary || null,
    framework: payload.framework || null,
    notes: payload.notes || null,
  });

  revalidatePath('/template');

  return { ok: true as const, message: '基礎知識を保存しました。' };
}

export async function updateLegalConceptAction(id: string, payload: LegalConceptInput) {
  if (!payload.subject || !payload.title) {
    return { ok: false as const, message: '科目と概念名は必須です。' };
  }

  await updateLegalConcept(id, {
    subject: payload.subject,
    category: payload.category || 'その他',
    title: payload.title,
    summary: payload.summary || null,
    framework: payload.framework || null,
    notes: payload.notes || null,
  });

  revalidatePath('/template');

  return { ok: true as const, message: '基礎知識を更新しました。' };
}

export async function deleteLegalConceptAction(id: string) {
  await deleteLegalConcept(id);
  revalidatePath('/template');
  return { ok: true as const };
}
