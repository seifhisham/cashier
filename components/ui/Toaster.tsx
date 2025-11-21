'use client';

import { useEffect, useState } from 'react';

type ToastItem = {
  id: string;
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
};

function cls(type: ToastItem['type']) {
  const base = 'rounded-md border p-3 shadow-sm backdrop-blur bg-white/95 dark:bg-slate-900/90';
  if (type === 'success') return `${base} border-green-200 dark:border-green-900/40`;
  if (type === 'error') return `${base} border-rose-200 dark:border-rose-900/40`;
  return `${base} border-slate-200 dark:border-slate-800`;
}

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    function onToast(e: Event) {
      const detail = (e as CustomEvent).detail || {};
      const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const item: ToastItem = {
        id,
        title: detail.title,
        description: detail.description,
        type: detail.type ?? 'info',
        duration: detail.duration ?? 3000,
      };
      setToasts((prev) => [...prev, item]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, item.duration);
    }
    window.addEventListener('app:toast', onToast as any);
    return () => window.removeEventListener('app:toast', onToast as any);
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[20000] flex max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className={`${cls(t.type)} pointer-events-auto`}> 
          {t.title && (
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.title}</div>
          )}
          {t.description && (
            <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{t.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}
