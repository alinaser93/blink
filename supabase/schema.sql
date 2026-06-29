-- ===========================================================
--  سلّـة — Supabase Schema (الصق هذا في SQL Editor)
-- ===========================================================

-- المنتجات
create table if not exists products (
  id          text primary key,            -- مثل 'p1'
  name        text not null,
  category    text not null,
  price       integer not null default 0,  -- بالدينار العراقي
  stock       integer not null default 0,
  icon        text default 'Package',      -- اسم أيقونة lucide
  accent      text default '#0C831F',
  created_at  timestamptz default now()
);

-- العملاء
create table if not exists customers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  phone         text,
  orders_count  integer default 0,
  total_spent   integer default 0,
  last_order    text,
  status        text default 'جديد',        -- نشط / جديد / غير نشط
  created_at    timestamptz default now()
);

-- المناديب
create table if not exists riders (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text,
  available   boolean default true,
  created_at  timestamptz default now()
);

-- الطلبات
create table if not exists orders (
  id               bigint primary key,                 -- رقم الطلب
  status_col       text not null default 'new',        -- new / packing / dispatched / delivered
  items_count      integer default 0,
  total            integer default 0,
  rider            text,
  delivery_status  text,                               -- في الطريق / قرب الوصول
  customer_id      uuid references customers(id) on delete set null,
  created_at       timestamptz default now()
);

-- عناصر الطلب
create table if not exists order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    bigint references orders(id) on delete cascade,
  product_id  text references products(id) on delete set null,
  qty         integer default 1,
  price       integer default 0
);

create index if not exists idx_orders_status   on orders(status_col);
create index if not exists idx_products_category on products(category);

-- ===========================================================
--  RLS — مفعّلة. السياسات أدناه مفتوحة للتجربة (anon).
--  للإنتاج: قيّدها على auth.uid() / المستخدمين المصرّح لهم.
-- ===========================================================
alter table products    enable row level security;
alter table customers   enable row level security;
alter table riders      enable row level security;
alter table orders      enable row level security;
alter table order_items enable row level security;

create policy "read products"    on products    for select using (true);
create policy "read customers"   on customers   for select using (true);
create policy "read riders"      on riders      for select using (true);
create policy "read orders"      on orders      for select using (true);
create policy "read order_items" on order_items for select using (true);

create policy "update products"  on products  for update using (true) with check (true);
create policy "insert orders"    on orders    for insert with check (true);
create policy "update orders"    on orders    for update using (true) with check (true);
create policy "insert customers" on customers for insert with check (true);
create policy "insert items"     on order_items for insert with check (true);
