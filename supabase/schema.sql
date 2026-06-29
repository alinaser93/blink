-- =====================================================================
--  سلّـة — منصّة كويك كومرس بنموذج "بلينكِت" (مخزون مركزي / Dark Store)
--  كتالوج واحد موحّد — لا يوجد بائعون متعددون ظاهرون للزبون.
--  شغّل هذا مباشرةً في: Supabase → SQL Editor → New query → Run
--  آمن لإعادة التشغيل (idempotent: IF NOT EXISTS / DROP IF EXISTS).
-- =====================================================================

-- gen_random_uuid() موجودة ضمن pgcrypto (مثبّتة مسبقاً على Supabase)
create extension if not exists pgcrypto;

-- =====================================================================
--  أنواع ENUM — قوائم محصورة للأدوار وحالة الطلب (أأمن من النص الحر)
-- =====================================================================
do $$ begin
  create type user_role as enum ('customer', 'admin', 'rider');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('pending', 'preparing', 'dispatched', 'delivered');
exception when duplicate_object then null; end $$;


-- =====================================================================
--  1) USERS — المستخدمون
--  ملف واحد لكل مستخدم (زبون/أدمن/مندوب). الحقل id يُقصد به أن يطابق
--  معرّف مستخدم Supabase Auth (auth.users.id).
-- =====================================================================
create table if not exists public.users (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  phone       text unique,                       -- رقم تسجيل الدخول / التواصل
  role        user_role not null default 'customer',
  created_at  timestamptz not null default now()
);
comment on table  public.users is 'المستخدمون: زبائن، أدمن (إدارة الـ Dark Store)، ومناديب توصيل';
comment on column public.users.role is 'الدور: customer | admin | rider';


-- =====================================================================
--  2) CATEGORIES — الأقسام (شجرية)
--  parent_category_id يشير إلى نفس الجدول لدعم الأقسام الفرعية:
--    NULL = قسم رئيسي،  وغير NULL = قسم فرعي تابع لقسم أب.
--  عند حذف القسم الأب تُحذف أقسامه الفرعية (CASCADE).
-- =====================================================================
create table if not exists public.categories (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  icon_url            text,                       -- أيقونة/صورة القسم
  parent_category_id  uuid references public.categories(id) on delete cascade,
  created_at          timestamptz not null default now()
);
comment on table  public.categories is 'أقسام الكتالوج الموحّد، تدعم التشجير عبر parent_category_id';
comment on column public.categories.parent_category_id is 'NULL = قسم رئيسي، غير NULL = قسم فرعي';
create index if not exists idx_categories_parent on public.categories(parent_category_id);

-- ترتيب الأقسام داخل كل مجموعة (رئيسي/فرعي). آمن لإعادة التشغيل.
-- ملاحظة: icon_url يُعاد استخدامه لتخزين أيقونة القسم بصيغة 'icon:<LucideName>'
-- (مثل 'icon:Carrot')؛ أي قيمة أخرى (رابط/NULL) تعني "لا أيقونة مختارة" فتُشتقّ من الاسم.
alter table public.categories add column if not exists sort_order integer not null default 0;
comment on column public.categories.sort_order is 'ترتيب العرض داخل نفس المجموعة (أصغر = أعلى)';
create index if not exists idx_categories_parent_sort on public.categories(parent_category_id, sort_order);

-- تعبئة أولية لترتيب ثابت — تُنفَّذ مرّة واحدة فقط (لا تلمس ترتيباً عدّله المستخدم لاحقاً).
-- الشرط: لا يوجد أي صفّ بترتيب غير افتراضي بعد؛ والفرز (created_at, id) يضمن نتيجة ثابتة.
do $$
begin
  if not exists (select 1 from public.categories where sort_order <> 0) then
    update public.categories c set sort_order = sub.rn
    from (
      select id, (row_number() over (partition by parent_category_id order by created_at, id) - 1) as rn
      from public.categories
    ) sub
    where c.id = sub.id;
  end if;
end $$;


-- =====================================================================
--  3) PRODUCTS — المنتجات (كتالوج واحد موحّد)
--  كل منتج يتبع المخزون المركزي. category_id يربطه بقسم؛ عند حذف القسم
--  يُحوَّل إلى NULL (لا يُحذف المنتج). internal_supplier_name حقل داخلي
--  للإدارة فقط (المورّد) ولا يُعرض للزبون أبداً.
-- =====================================================================
create table if not exists public.products (
  id                      uuid primary key default gen_random_uuid(),
  category_id             uuid references public.categories(id) on delete set null,
  name                    text not null,
  weight_label            text,                   -- وصف الكمية: "500 غرام" / "1 لتر"
  price_iqd               integer not null default 0 check (price_iqd >= 0),       -- السعر بالدينار العراقي
  stock_quantity          integer not null default 0 check (stock_quantity >= 0),  -- المخزون المتوفّر
  image_url               text,
  internal_supplier_name  text,                   -- داخلي فقط (المورّد) — لا يظهر للزبون
  created_at              timestamptz not null default now()
);
comment on table  public.products is 'المنتجات ضمن كتالوج موحّد لمخزن مركزي (نموذج بلينكِت)';
comment on column public.products.price_iqd is 'السعر بالدينار العراقي (عدد صحيح، بدون كسور)';
comment on column public.products.internal_supplier_name is 'اسم المورّد — للاستخدام الداخلي/الإداري فقط، لا يُعرض للزبائن';
create index if not exists idx_products_category on public.products(category_id);


-- =====================================================================
--  4) ORDERS — الطلبات
--  customer_id و rider_id كلاهما يشير إلى users. يبقى rider_id فارغاً
--  (NULL) حتى يُعيَّن مندوب عند الانطلاق.
-- =====================================================================
create table if not exists public.orders (
  id                 uuid primary key default gen_random_uuid(),
  customer_id        uuid not null references public.users(id) on delete cascade,
  rider_id           uuid references public.users(id) on delete set null,
  total_amount_iqd   integer not null default 0 check (total_amount_iqd >= 0),     -- الإجمالي بالدينار
  status             order_status not null default 'pending',
  delivery_address   text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
comment on table  public.orders is 'الطلبات. تتغيّر الحالة: pending ← preparing ← dispatched ← delivered';
comment on column public.orders.rider_id is 'المندوب المعيّن — يبقى NULL لحين تعيينه عند الإرسال';
create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_orders_rider    on public.orders(rider_id);
create index if not exists idx_orders_status   on public.orders(status);


-- =====================================================================
--  5) ORDER_ITEMS — عناصر الطلب
--  price_at_time يجمّد سعر الوحدة لحظة الطلب (لقطة تاريخية لا تتأثّر
--  بتغيّر الأسعار لاحقاً). order_id يُحذف تتابعياً مع الطلب (CASCADE).
-- =====================================================================
create table if not exists public.order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.orders(id) on delete cascade,
  product_id     uuid references public.products(id) on delete set null,
  quantity       integer not null default 1 check (quantity > 0),
  price_at_time  integer not null default 0 check (price_at_time >= 0)             -- سعر الوحدة وقت الطلب (دينار)
);
comment on table  public.order_items is 'عناصر كل طلب (سطور المنتجات)';
comment on column public.order_items.price_at_time is 'سعر الوحدة لحظة الطلب — لقطة ثابتة لا تتغيّر';
create index if not exists idx_order_items_order   on public.order_items(order_id);
create index if not exists idx_order_items_product on public.order_items(product_id);


-- =====================================================================
--  تحديث updated_at تلقائياً عند أي تعديل على الطلب
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
--  الزمن الحقيقي (Realtime)  ⚡  — حرج
--  إضافة جدول orders إلى منشور supabase_realtime حتى تستقبل لوحتا
--  الأدمن والمندوب أي تغيير (إدراج/تحديث/حذف) فوراً.
--  REPLICA IDENTITY FULL يضمّن إرسال الصف القديم أيضاً (لرصد تبدّل الحالة).
-- =====================================================================
alter table public.orders replica identity full;

do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null; end $$;

-- (اختياري) بثّ تغيّر المخزون مباشرةً للمتجر أيضاً:
-- alter table public.products replica identity full;
-- do $$ begin
--   alter publication supabase_realtime add table public.products;
-- exception when duplicate_object then null; end $$;


-- =====================================================================
--  أمان مستوى الصف (RLS)
--  مُفعّل على كل الجداول. السياسات أدناه مفتوحة (للمفتاح anon) لتسريع
--  بناء النموذج الأوّلي.
--  🔒 قبل الإنتاج: استبدل سياسات الكتابة بقواعد مرتبطة بالمصادقة، مثل:
--     الزبون يقرأ طلباته فقط:        using ( auth.uid() = customer_id )
--     المندوب يرى الطلبات المعيّنة له: using ( auth.uid() = rider_id )
-- =====================================================================
alter table public.users       enable row level security;
alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- USERS
drop policy if exists "users read"  on public.users;
drop policy if exists "users write" on public.users;
create policy "users read"  on public.users for select using (true);
create policy "users write" on public.users for all    using (true) with check (true);

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
--  تمّ ✅  الجداول + المفاتيح + الفهارس + الزمن الحقيقي (orders) + RLS.
--  التالي: شغّل ملف الـ seed لتعبئة بيانات تجريبية، أو أدخِل من التطبيقات.
-- =====================================================================
