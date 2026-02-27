'use server';

import { isEmailWhitelisted } from '@/lib/auth/whitelist';
import { createClient } from '@/lib/supabase/server';

export async function signInAction(
  email: string,
  password: string
): Promise<{ error: string } | { ok: true }> {
  if (!isEmailWhitelisted(email)) {
    return { error: 'このメールアドレスはログインが許可されていません。' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}

export async function signUpAction(
  email: string,
  password: string
): Promise<{ error: string } | { ok: true }> {
  if (!isEmailWhitelisted(email)) {
    return { error: 'このメールアドレスはログインが許可されていません。' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}
