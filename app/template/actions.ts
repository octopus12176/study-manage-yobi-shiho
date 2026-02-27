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
import { essayTemplateSchema, legalConceptSchema, formatZodError, uuidSchema } from '@/lib/validation';
import { sanitizeHtmlServer } from '@/lib/sanitize-server';

export type EssayTemplateInput = {
  subject: string;
  title: string;
  template: string;
  norm: string;
  pitfall: string;
  rank: string;
};

export async function createEssayTemplateAction(payload: EssayTemplateInput) {
  // Zod によるランタイムバリデーション
  const result = essayTemplateSchema.safeParse(payload);
  if (!result.success) {
    return formatZodError(result.error);
  }
  const data = result.data;

  try {
    await createEssayTemplate({
      subject: data.subject,
      title: data.title,
      template: sanitizeHtmlServer(data.template) || null,
      norm: sanitizeHtmlServer(data.norm) || null,
      pitfall: sanitizeHtmlServer(data.pitfall) || null,
      rank: data.rank,
    });
  } catch (error) {
    return {
      ok: false as const,
      message: '保存に失敗しました。もう一度お試しください。',
    };
  }

  revalidatePath('/template');

  return { ok: true as const, message: 'テンプレを保存しました。' };
}

export async function updateEssayTemplateAction(id: string, payload: EssayTemplateInput) {
  // UUID 形式のバリデーション
  const idValidation = uuidSchema.safeParse(id);
  if (!idValidation.success) {
    return { ok: false, message: 'Invalid ID format' };
  }

  // Zod によるランタイムバリデーション
  const result = essayTemplateSchema.safeParse(payload);
  if (!result.success) {
    return formatZodError(result.error);
  }
  const data = result.data;

  try {
    await updateEssayTemplate(id, {
      subject: data.subject,
      title: data.title,
      template: sanitizeHtmlServer(data.template) || null,
      norm: sanitizeHtmlServer(data.norm) || null,
      pitfall: sanitizeHtmlServer(data.pitfall) || null,
      rank: data.rank,
    });
  } catch (error) {
    return {
      ok: false as const,
      message: '更新に失敗しました。もう一度お試しください。',
    };
  }

  revalidatePath('/template');

  return { ok: true as const, message: 'テンプレを更新しました。' };
}

export async function deleteEssayTemplateAction(id: string) {
  // UUID 形式のバリデーション
  const idValidation = uuidSchema.safeParse(id);
  if (!idValidation.success) {
    return { ok: false, message: 'Invalid ID format' };
  }

  try {
    await deleteEssayTemplate(id);
  } catch (error) {
    return {
      ok: false as const,
      message: '削除に失敗しました。もう一度お試しください。',
    };
  }

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
  // Zod によるランタイムバリデーション
  const result = legalConceptSchema.safeParse(payload);
  if (!result.success) {
    return formatZodError(result.error);
  }
  const data = result.data;

  try {
    await createLegalConcept({
      subject: data.subject,
      category: data.category,
      title: data.title,
      summary: sanitizeHtmlServer(data.summary) || null,
      framework: sanitizeHtmlServer(data.framework) || null,
      notes: sanitizeHtmlServer(data.notes) || null,
    });
  } catch (error) {
    return {
      ok: false as const,
      message: '保存に失敗しました。もう一度お試しください。',
    };
  }

  revalidatePath('/template');

  return { ok: true as const, message: '基礎知識を保存しました。' };
}

export async function updateLegalConceptAction(id: string, payload: LegalConceptInput) {
  // UUID 形式のバリデーション
  const idValidation = uuidSchema.safeParse(id);
  if (!idValidation.success) {
    return { ok: false, message: 'Invalid ID format' };
  }

  // Zod によるランタイムバリデーション
  const result = legalConceptSchema.safeParse(payload);
  if (!result.success) {
    return formatZodError(result.error);
  }
  const data = result.data;

  try {
    await updateLegalConcept(id, {
      subject: data.subject,
      category: data.category,
      title: data.title,
      summary: sanitizeHtmlServer(data.summary) || null,
      framework: sanitizeHtmlServer(data.framework) || null,
      notes: sanitizeHtmlServer(data.notes) || null,
    });
  } catch (error) {
    return {
      ok: false as const,
      message: '更新に失敗しました。もう一度お試しください。',
    };
  }

  revalidatePath('/template');

  return { ok: true as const, message: '基礎知識を更新しました。' };
}

export async function deleteLegalConceptAction(id: string) {
  // UUID 形式のバリデーション
  const idValidation = uuidSchema.safeParse(id);
  if (!idValidation.success) {
    return { ok: false, message: 'Invalid ID format' };
  }

  try {
    await deleteLegalConcept(id);
  } catch (error) {
    return {
      ok: false as const,
      message: '削除に失敗しました。もう一度お試しください。',
    };
  }

  revalidatePath('/template');
  return { ok: true as const };
}
