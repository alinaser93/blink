-- =====================================================================
--  سلّـة — RESET + CREATE (v2 schema)
--  ⚠️  WARNING: this DROPS the listed tables and ALL their data, then
--      recreates the clean v2 schema. Use on a prototype/dev database.
--  Why: an earlier schema created tables with different columns; this
--  guarantees a clean, matching structure (fixes "column ... does not exist").
-- =====================================================================

-- ---- drop in dependency order (children first); CASCADE clears FKs/policies ----
drop table if exists public.order_items cascade;
drop table if exists public.orders      cascade;
drop table if exists public.products    cascade;
drop table if exists public.categories  cascade;
drop table if exists public.customers   cascade;   -- from the earlier prototype schema
drop table if exists public.riders      cascade;   -- from the earlier prototype schema
drop table if exists public.users       cascade;

-- enums are recreated below; drop so the new definitions always apply
drop type if exists order_status cascade;
drop type if exists user_role    cascade;

-- =====================================================================
--  سلّـة — Quick Commerce Platform · Core PostgreSQL Schema (Supabase)
--  Run this directly in: Supabase Dashboard → SQL Editor → New query → Run
--  Safe to re-run (idempotent: IF NOT EXISTS / DROP POLICY IF EXISTS).
-- =====================================================================

-- gen_random_uuid() lives in pgcrypto (preinstalled on Supabase, but be explicit)
create extension if not exists pgcrypto;

-- =====================================================================
--  ENUM TYPES — controlled vocabularies for role & order status
--  (cleaner & safer than free-text; rejects invalid values at the DB)
-- =====================================================================
do $$ begin
  create type user_role as enum ('customer', 'admin', 'rider');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('pending', 'preparing', 'dispatched', 'delivered');
exception when duplicate_object then null; end $$;


-- =====================================================================
--  1) USERS
--  App profiles. `id` is intended to match Supabase Auth user id
--  (auth.users.id) so each authenticated user has one profile row.
-- =====================================================================
create table if not exists public.users (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  phone       text unique,                       -- login / contact number
  role        user_role not null default 'customer',
  created_at  timestamptz not null default now()
);
comment on table  public.users is 'ملفات المستخدمين: زبائن، تجّار/أدمن، ومناديب. id يطابق auth.users.id';
comment on column public.users.role is 'دور المستخدم: customer | admin | rider';


-- =====================================================================
--  2) CATEGORIES
--  Product groupings shown on the storefront (خضار، ألبان، مشروبات...).
-- =====================================================================
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  icon_url    text,                              -- أيقونة/صورة القسم
  created_at  timestamptz not null default now()
);
comment on table public.categories is 'أقسام المنتجات في المتجر';


-- =====================================================================
--  3) PRODUCTS
--  Catalog items. category_id → categories (set null if category removed,
--  so products are never silently deleted).
-- =====================================================================
create table if not exists public.products (
  id              uuid primary key default gen_random_uuid(),
  category_id     uuid references public.categories(id) on delete set null,
  name            text not null,
  weight_label    text,                          -- وصف الكمية: "500 غرام" / "1 لتر"
  price           integer not null default 0 check (price >= 0),         -- بالدينار العراقي (IQD)
  stock_quantity  integer not null default 0 check (stock_quantity >= 0),
  image_url       text,
  created_at      timestamptz not null default now()
);
comment on table  public.products is 'منتجات المتجر';
comment on column public.products.price is 'السعر بالدينار العراقي (عدد صحيح، بدون كسور)';
create index if not exists idx_products_category on public.products(category_id);


-- =====================================================================
--  4) ORDERS
--  One row per customer order. customer_id & rider_id both → users.
--  rider_id is NULL until a rider is assigned (on dispatch).
-- =====================================================================
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  customer_id       uuid not null references public.users(id) on delete cascade,
  rider_id          uuid references public.users(id) on delete set null,
  total_amount      integer not null default 0 check (total_amount >= 0),  -- IQD
  status            order_status not null default 'pending',
  delivery_address  text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
comment on table  public.orders is 'الطلبات. الحالة تتغيّر: pending → preparing → dispatched → delivered';
comment on column public.orders.rider_id is 'المندوب المعيّن — يبقى NULL لحد ما ينطلق الطلب';
create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_orders_rider    on public.orders(rider_id);
create index if not exists idx_orders_status   on public.orders(status);


-- =====================================================================
--  5) ORDER_ITEMS
--  Line items for each order. price_at_time freezes the unit price the
--  moment the order was placed (so later price changes don't rewrite history).
--  order_id cascade-deletes items when an order is removed.
-- =====================================================================
create table if not exists public.order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.orders(id) on delete cascade,
  product_id     uuid references public.products(id) on delete set null,
  quantity       integer not null default 1 check (quantity > 0),
  price_at_time  integer not null default 0 check (price_at_time >= 0)     -- IQD, snapshot
);
comment on table  public.order_items is 'عناصر كل طلب';
comment on column public.order_items.price_at_time is 'سعر الوحدة وقت الطلب (لقطة تاريخية، لا يتغيّر)';
create index if not exists idx_order_items_order   on public.order_items(order_id);
create index if not exists idx_order_items_product on public.order_items(product_id);


-- =====================================================================
--  AUTO-UPDATE orders.updated_at on every row change
--  (so "last status change" timestamp is always accurate)
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();


-- =====================================================================
--  REALTIME  ⚡  (CRITICAL)
--  Add `orders` to the supabase_realtime publication so the Admin &
--  Rider apps receive INSERT/UPDATE/DELETE events instantly.
--  REPLICA IDENTITY FULL ensures the OLD row is included in payloads
--  (needed to reliably detect status transitions on UPDATE).
-- =====================================================================
alter table public.orders replica identity full;

do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null; end $$;

-- (optional) also stream live stock changes to the storefront:
-- alter table public.products replica identity full;
-- do $$ begin
--   alter publication supabase_realtime add table public.products;
-- exception when duplicate_object then null; end $$;


-- =====================================================================
--  ROW LEVEL SECURITY (RLS)
--  Enabled on every table. The policies below are PERMISSIVE (open to the
--  anon/public key) to get the prototype working fast.
--  🔒 BEFORE PRODUCTION: replace the write policies with auth-scoped rules,
--     e.g. customers can only read their own orders:
--        using ( auth.uid() = customer_id )
--     and riders only their assigned ones:
--        using ( auth.uid() = rider_id ) , etc.
-- =====================================================================
alter table public.users       enable row level security;
alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- USERS
drop policy if exists "users read"  on public.users;
drop policy if exists "users write" on public.users;
create policy "users read"  on public.users  for select using (true);
create policy "users write" on public.users  for all    using (true) with check (true);

-- CATEGORIES
drop policy if exists "categories read"  on public.categories;
drop policy if exists "categories write" on public.categories;
create policy "categories read"  on public.categories for select using (true);
create policy "categories write" on public.categories for all    using (true) with check (true);

-- PRODUCTS
drop policy if exists "products read"  on public.products;
drop policy if exists "products write" on public.products;
create policy "products read"  on public.products for select using (true);
create policy "products write" on public.products for all    using (true) with check (true);

-- ORDERS
drop policy if exists "orders read"  on public.orders;
drop policy if exists "orders write" on public.orders;
create policy "orders read"  on public.orders for select using (true);
create policy "orders write" on public.orders for all    using (true) with check (true);

-- ORDER_ITEMS
drop policy if exists "order_items read"  on public.order_items;
drop policy if exists "order_items write" on public.order_items;
create policy "order_items read"  on public.order_items for select using (true);
create policy "order_items write" on public.order_items for all    using (true) with check (true);

-- =====================================================================
--  DONE ✅  Tables, keys, indexes, realtime (orders), triggers, RLS.
--  Next: SQL Editor → run your seed inserts, or insert from the apps.
-- =====================================================================
