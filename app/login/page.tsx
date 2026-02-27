'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { signInAction, signUpAction } from './actions';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const result = await signInAction(email, password);

    if ('error' in result) {
      setErrorMessage(result.error);
      setLoading(false);
      return;
    }

    router.replace('/');
    router.refresh();
  };

  const handleSignUp = async () => {
    setLoading(true);
    setErrorMessage('');

    const result = await signUpAction(email, password);

    if ('error' in result) {
      setErrorMessage(result.error);
      setLoading(false);
      return;
    }

    router.replace('/');
    router.refresh();
  };

  return (
    <main className='mx-auto flex min-h-screen max-w-xl items-center justify-center px-4'>
      <Card className='w-full max-w-md'>
        <h1 className='mb-1 text-2xl font-black tracking-[-0.02em]'>ログイン</h1>
        <p className='mb-8 text-sm text-sub'>Supabase Authでログインして学習時間を管理</p>

        <form onSubmit={handleSignIn} className='space-y-4'>
          <div>
            <label className='mb-2 block text-xs font-semibold text-sub'>メールアドレス</label>
            <Input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete='email'
            />
          </div>
          <div>
            <label className='mb-2 block text-xs font-semibold text-sub'>パスワード</label>
            <Input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete='current-password'
            />
          </div>

          {errorMessage && <p className='rounded-md bg-dangerLight p-3 text-sm text-danger'>{errorMessage}</p>}

          <div className='grid grid-cols-2 gap-3 pt-2'>
            <Button type='submit' variant='default' disabled={loading}>
              {loading ? '送信中...' : 'ログイン'}
            </Button>
            <Button type='button' variant='secondary' disabled={loading} onClick={handleSignUp}>
              新規登録
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
}
