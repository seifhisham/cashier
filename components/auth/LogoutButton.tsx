'use client';

import { useRouter } from 'next/navigation';
import { supabaseClient } from '../../lib/supabase/client';

export default function LogoutButton() {
  const router = useRouter();
  async function onLogout() {
    await supabaseClient.auth.signOut();
    // Clear POS cart session cookie to avoid cross-employee carryover
    try {
      document.cookie = 'cashier_session_id=; Max-Age=0; path=/';
      document.cookie = 'auth=; Max-Age=0; path=/';
      document.cookie = 'role=; Max-Age=0; path=/';
    } catch {}
    router.replace('/auth/login');
  }
  return (
    <button
      onClick={onLogout}
      className="inline-flex items-center rounded-md border border-gray-900 px-3 py-1.5 text-sm text-white bg-gray-900 hover:bg-gray-100 hover:text-gray-900"
    >
      Logout
    </button>
  );
}
