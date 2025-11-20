# Cashier POS (Next.js + Supabase)

End-to-end POS/Cashier system built with Next.js App Router, Supabase, and Zustand. Supports product search with variants, cart operations, and checkout that creates orders, moves items to order_items, reduces stock, and clears the cart.

## Features
- **Product search** with variants (size, color) and stock
- **Cart operations**: add, update quantity, remove
- **Automatic pricing**: `unit_price = base_price + price_adjustment`
- **Totals**: per-line totals and subtotal with discount
- **Payment methods**: cash or card
- **Checkout**:
  - Creates `orders`
  - Inserts `order_items` with `price_at_purchase`
  - Decreases `product_variants.stock_quantity`
  - Clears `cart_items` for the current session

## Tech Stack
- Next.js App Router (React)
- Supabase (Database + JS client)
- Zustand (client state)
- Tailwind CSS

## Project Structure
- `app/(cashier)/pos/page.tsx` — POS UI page
- `app/(cashier)/pos/actions.ts` — Server actions (Supabase)
- `components/cashier/*` — Reusable POS UI components
- `lib/stores/cart.ts` — Zustand store (in-memory cart, discount, payment method)
- `lib/supabase/*` — Supabase clients (server/client)
- `types/database.ts` — Supabase `Database` types (handwritten; replace with generated for stricter safety)

## Setup
### 1) Install
```bash
npm install
```

### 2) Environment variables
Create a `.env.local` (or `.env`) in the project root with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3) Run
```bash
npm run dev
```
Open http://localhost:3000 and use the navbar POS link or go to http://localhost:3000/pos.

## Database Schema (summary)
Tables used: `products`, `product_variants`, `cart_items`, `orders`, `order_items` (plus `product_images`).

Key fields used:
- `products.base_price` (numeric)
- `product_variants.price_adjustment` (numeric), `stock_quantity`
- `cart_items`: `session_id`, `product_id`, `variant_id`, `quantity`
- `orders`: `total_amount`, `status`, `guest_email`, `user_id`, `shipping_address`
- `order_items`: `order_id`, `product_id`, `variant_id`, `quantity`, `price_at_purchase`

Pricing: `unit_price = products.base_price + product_variants.price_adjustment`.

## RLS and Access Notes
This POS uses a cookie `cashier_session_id` to scope the cart to the browser session without requiring auth.

Ensure your RLS policies allow:
- `cart_items` select/insert/update/delete for rows where `session_id` equals the cookie value.
- `orders`, `order_items`, and `product_variants` inserts/updates from the anon key (or protected via edge function, depending on your security model).

For production, consider moving checkout logic to an authenticated context or Supabase function with stricter policies.

## Type Safety
The project includes a minimal `types/database.ts`. For full safety, replace it with generated types:
```bash
# Example (requires supabase CLI configured)
supabase gen types typescript --project-id <your-project-ref> --schema public > types/database.ts
```

## Deploy
- Vercel: set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Project Settings → Environment Variables.
- Re-run build.

## Scripts
- `dev` — start dev server
- `build` — production build
- `start` — run prod server
- `lint` — run eslint

## Roadmap (optional)
- Barcode scanning, quick cash amounts, returns/exchanges, receipts/print, cash drawer, reports.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
