'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabaseClient } from '../../lib/supabase/client';

const AUTH_PREFIX = '/auth';

export default function AuthGate() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let active = true;
    async function check() {
      // Allow auth pages
      if (pathname?.startsWith(AUTH_PREFIX)) return;
      // If ENV is missing, fail-closed to login
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        if (active) router.replace('/auth/login');
        return;
      }
      try {
        const { data } = await supabaseClient.auth.getUser();
        if (!active) return;
        if (!data?.user) {
          router.replace('/auth/login');
        }
      } catch {
        if (!active) return;
        router.replace('/auth/login');
      }
    }
    check();
    const { data: sub } = supabaseClient.auth.onAuthStateChange((_event) => {
      if (!pathname?.startsWith(AUTH_PREFIX)) {
        check();
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [pathname, router]);

  return null;
}
