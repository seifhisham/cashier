'use client';

import { useEffect, useState, useTransition } from 'react';
import { searchProductsPaged } from '../../app/(cashier)/pos/actions';
import { useCartStore } from '../../lib/stores/cart';
import { Search as SearchIcon, Loader2, X as XIcon } from 'lucide-react';

type Variant = {
  id: string;
  size: string;
  color: string;
  stock_quantity: number;
  price_adjustment: string | null;
};

type Product = {
  id: string;
  name: string;
  base_price: string;
  product_variants: Variant[];
};

export default function ProductSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [total, setTotal] = useState(0);
  const [isPending, startTransition] = useTransition();
  const add = useCartStore((s: any) => s.add);
  const cartItems = useCartStore((s: any) => s.items);

  function load(q: string, p: number) {
    startTransition(async () => {
      const { items, count } = await searchProductsPaged(q, p, pageSize);
      setResults(items as any);
      setTotal(count);
      setPage(p);
    });
  }

  useEffect(() => {
    load('', 1);
  }, []);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    load(query, 1);
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Sticky search bar */}
      <div className="sticky top-0 z-20 -mx-1 md:mx-0 bg-transparent backdrop-blur-0 shadow-none border-0">
        <form onSubmit={onSearch} className="mx-1 md:mx-0 py-2">
          <div className="relative h-11 md:h-12">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="h-full w-full rounded-lg border border-slate-300 bg-white pl-10 pr-36 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
              placeholder="Search products..."
              aria-label="Search products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery('');
                  load('', 1);
                }}
                className="absolute right-28 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-9 w-24 items-center justify-center rounded-md bg-indigo-600 px-3.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              disabled={isPending}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
        {results.map((p) => (
          <div
            key={p.id}
            className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-1 line-clamp-2 text-sm font-medium text-slate-900 dark:text-slate-100">{p.name}</div>
            <div className="mb-2 text-xs text-slate-500 dark:text-slate-400">Base: {Number(p.base_price)}</div>
            <div className="space-y-1.5">
              {p.product_variants?.map((v) => (
                <div key={v.id} className="flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <div className="truncate text-slate-700 dark:text-slate-300">{v.size} / {v.color}</div>
                    <div className="text-[11px] text-slate-500">Stock: {v.stock_quantity}</div>
                  </div>
                  {(() => {
                    const inCart = cartItems.find((ci: any) => ci.variant_id === v.id)?.quantity || 0;
                    const remaining = Math.max(0, (v.stock_quantity ?? 0) - inCart);
                    const outOfStock = remaining <= 0;
                    return (
                      <button
                        className="h-8 rounded-md bg-indigo-600 px-3.5 md:px-4 whitespace-nowrap text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        disabled={outOfStock}
                        onClick={() => add(p.id, v.id)}
                      >
                        {`Add (${remaining} left)`}
                      </button>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-slate-500">
          {total > 0 ? (
            <span>
              Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}
            </span>
          ) : (
            <span>No results</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => load(query, Math.max(1, page - 1))}
            disabled={page <= 1 || isPending}
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => load(query, page + 1)}
            disabled={page * pageSize >= total || isPending}
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
