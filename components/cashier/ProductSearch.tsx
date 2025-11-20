'use client';

import { useEffect, useState, useTransition } from 'react';
import { searchProducts } from '../../app/(cashier)/pos/actions';
import { useCartStore } from '../../lib/stores/cart';
import type { CartState } from '../../lib/stores/cart';

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
  const [isPending, startTransition] = useTransition();
  const add = useCartStore((s: CartState) => s.add);

  useEffect(() => {
    startTransition(async () => {
      const data = await searchProducts('');
      setResults(data as any);
    });
  }, []);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const data = await searchProducts(query);
      setResults(data as any);
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSearch} className="flex gap-2">
        <input
          className="flex-1 rounded-md border px-3 py-2"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50" disabled={isPending}>
          Search
        </button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {results.map((p) => (
          <div key={p.id} className="rounded-lg border p-3">
            <div className="font-medium">{p.name}</div>
            <div className="text-sm text-gray-500">Base: {Number(p.base_price)} </div>
            <div className="mt-2 space-y-2">
              {p.product_variants?.map((v) => (
                <div key={v.id} className="flex items-center justify-between gap-2 text-sm">
                  <div>
                    <div>{v.size} / {v.color}</div>
                    <div className="text-gray-500">Stock: {v.stock_quantity}</div>
                  </div>
                  <button
                    className="rounded-md bg-blue-600 text-white px-3 py-1 disabled:opacity-50"
                    disabled={v.stock_quantity <= 0}
                    onClick={() => add(p.id, v.id)}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
