'use client';

type Variant = { id: string; size: string; color: string; stock_quantity: number };

export default function VariantSelector({ variants, value, onChange }: {
  variants: Variant[];
  value?: string;
  onChange: (variantId: string) => void;
}) {
  return (
    <select
      className="w-full rounded-md border px-3 py-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select variant</option>
      {variants.map((v) => (
        <option key={v.id} value={v.id} disabled={v.stock_quantity <= 0}>
          {v.size} / {v.color} {v.stock_quantity <= 0 ? '(Out of stock)' : ''}
        </option>
      ))}
    </select>
  );
}
