'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseClient } from '../../../lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // Check role from user_roles
    const { data: userRes } = await supabaseClient.auth.getUser();
    const userId = userRes.user?.id;
    if (!userId) {
      setError('Could not determine user.');
      await supabaseClient.auth.signOut();
      return;
    }
    const { data: roleRow, error: roleErr } = await (supabaseClient as any)
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    if (roleErr || !roleRow || roleRow.role !== 'admin') {
      setError('Admin access required. Please contact your administrator.');
      await supabaseClient.auth.signOut();
      return;
    }
    try {
      // Session cookies (no Max-Age) so they clear when the browser is closed
      document.cookie = 'auth=1; path=/; SameSite=Lax';
      document.cookie = 'role=admin; path=/; SameSite=Lax';
    } catch {}
    const redirectTo = searchParams.get('redirect') || '/pos';
    router.replace(redirectTo);
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-semibold">Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            placeholder="Your password"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        No account?{' '}
        <Link href="/auth/signup" className="text-blue-600 hover:underline">
          Create one
        </Link>
      </p>
    </main>
  );
}
