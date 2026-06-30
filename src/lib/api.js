import { supabase, isLive } from "./supabase.js";
import { ICON_MAP, MOCK_PRODUCTS, MOCK_CATEGORIES as SEED_CATEGORIES, MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_RIDERS } from "./mockData.js";

export { isLive, ICON_MAP };

// سكيمة بلينكِت تخزّن image_url (لا اسم أيقونة) -> نشتقّ أيقونة + لون من القسم الرئيسي (tier1)
export const CAT_ICON = {
  "خضار وفواكه": "Carrot", "ألبان وبيض وخبز": "Milk", "مشروبات وعصائر": "CupSoda",
  "سناكس وحلويات": "Popcorn", "بقالة وأساسيات": "Wheat", "وجبات سريعة ومعلّبات": "Coffee",
  "العناية والجمال": "Droplet", "أساسيات المنزل": "Package",
};
export const CAT_ACCENT = {
  "خضار وفواكه": "#D33A3A", "ألبان وبيض وخبز": "#2B7A9B", "مشروبات وعصائر": "#23306E",
  "سناكس وحلويات": "#E0A21F", "بقالة وأساسيات": "#9A6B2E", "وجبات سريعة ومعلّبات": "#C9692E",
  "العناية والجمال": "#C2477F", "أساسيات المنزل": "#5A6473",
};

// الأيقونات المتاحة لاختيار أيقونة القسم (مفاتيح ICON_MAP)
export const CATEGORY_ICONS = Object.keys(ICON_MAP);

// icon_url يُعاد استخدامه: 'icon:<اسم>' = أيقونة lucide مختارة؛ غير ذلك (رابط/NULL) = لا أيقونة مختارة
const parseIconName = (s) => (typeof s === "string" && s.startsWith("icon:")) ? s.slice(5) : null;

// أقسام تجريبية (عند عدم الاتصال بـ Supabase) — نسخة قابلة للتعديل ضمن الجلسة من شجرة الكتالوج المشتركة
let MOCK_CATEGORIES = SEED_CATEGORIES.map((c) => ({ ...c }));

// image_url يُعاد استخدامه لإيموجي المنتج بصيغة 'emoji:<e>'
const parseEmoji = (s) => (typeof s === "string" && s.startsWith("emoji:")) ? s.slice(6) : null;

// منتجات تجريبية قابلة للتعديل ضمن الجلسة، مربوطة بمعرّف قسم/تفرّع (categoryId) مباشرةً
let MOCK_PRODUCTS_STORE = MOCK_PRODUCTS.map((p) => ({
  id: p.id, name: p.name, price: p.price, stock: p.stock, categoryId: p.categoryId || null,
  weight: p.weight || "", mrp: p.mrp || 0, emoji: null, rating: p.rating || null, reviews: p.reviews || null,
}));

// يحوّل صفّ منتج تجريبي إلى الشكل الموحّد: cat=اسم القسم الرئيسي، sub=اسم التفرّع (إن وُجد)
const resolveMockProduct = (p) => {
  const c = MOCK_CATEGORIES.find((x) => x.id === p.categoryId);
  const t1 = c ? (c.parentId == null ? c : MOCK_CATEGORIES.find((x) => x.id === c.parentId)) : null;
  const cat = t1 ? t1.name : "أخرى";
  const sub = c && c.parentId != null ? c.name : null;
  return { ...p, cat, sub, subId: sub ? c.id : null, Icon: ICON_MAP[CAT_ICON[cat]] || ICON_MAP.Package, accent: CAT_ACCENT[cat] || "#9AA8B5" };
};

// عمود الكانبان  <->  حالة الطلب في قاعدة البيانات
const STATUS2COL = { pending: "new", preparing: "packing", dispatched: "dispatched", delivered: "delivered" };
const COL2STATUS = { new: "pending", packing: "preparing", dispatched: "dispatched", delivered: "delivered" };

const relAr = (iso) => {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 45) return "الآن";
  const m = Math.floor(s / 60);
  if (m <= 1) return "منذ دقيقة";
  if (m === 2) return "منذ دقيقتين";
  if (m < 60) return "منذ " + m + " دقيقة";
  const h = Math.floor(m / 60);
  return h === 1 ? "منذ ساعة" : "منذ " + h + " ساعات";
};
const shortNum = (uuid) => "#" + String(uuid).replace(/-/g, "").slice(0, 4).toUpperCase();

const PROD_COLS = "id,name,price_iqd,stock_quantity,mrp_iqd,category_id,weight_label,image_url,internal_supplier_name,categories(id,name,parent_category_id,parent:parent_category_id(name))";
const mapProduct = (r) => {
  const c = r.categories || null;
  const isSub = !!(c && c.parent_category_id != null);
  const cat = isSub ? ((c.parent && c.parent.name) || "أخرى") : ((c && c.name) || "أخرى");
  const sub = isSub ? c.name : null;
  return {
    id: r.id, name: r.name, price: r.price_iqd, stock: r.stock_quantity,
    mrp: r.mrp_iqd || 0, weight: r.weight_label || "", categoryId: r.category_id,
    emoji: parseEmoji(r.image_url), cat, sub, subId: isSub ? c.id : null,
    supplier: r.internal_supplier_name || "",
    Icon: ICON_MAP[CAT_ICON[cat]] || ICON_MAP.Package, accent: CAT_ACCENT[cat] || "#0C831F",
  };
};

export async function getProducts() {
  if (!isLive) return MOCK_PRODUCTS_STORE.map(resolveMockProduct);
  const { data, error } = await supabase.from("products").select(PROD_COLS).order("name");
  if (error) throw error;
  return data.map(mapProduct);
}

export async function getOrders() {
  if (!isLive) return MOCK_ORDERS.map((o) => ({ ...o, num: "#" + o.id }));
  const { data, error } = await supabase
    .from("orders")
    .select("id,total_amount_iqd,status,created_at,rider_id,order_items(quantity),rider:users!orders_rider_id_fkey(full_name)")
    .neq("status", "delivered")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((r) => ({
    id: r.id,
    num: shortNum(r.id),
    col: STATUS2COL[r.status] || "new",
    items: (r.order_items || []).reduce((s, it) => s + (it.quantity || 0), 0),
    total: r.total_amount_iqd,
    rider: r.rider ? r.rider.full_name : null,
    status: r.status === "dispatched" ? "في الطريق" : null,
    time: relAr(r.created_at),
  }));
}

export async function getCustomers() {
  if (!isLive) return MOCK_CUSTOMERS;
  const { data, error } = await supabase
    .from("users")
    .select("full_name,phone,orders:orders!orders_customer_id_fkey(total_amount_iqd,created_at)")
    .eq("role", "customer");
  if (error) throw error;
  return data
    .map((r) => {
      const os = r.orders || [];
      const spent = os.reduce((s, o) => s + (o.total_amount_iqd || 0), 0);
      const last = os.length ? relAr(os.reduce((m, o) => (o.created_at > m ? o.created_at : m), os[0].created_at)) : "—";
      return { name: r.full_name, phone: r.phone, orders: os.length, spent, last, status: os.length ? "نشط" : "جديد" };
    })
    .sort((a, b) => b.spent - a.spent);
}

export async function getRiders() {
  if (!isLive) return MOCK_RIDERS;
  const { data, error } = await supabase.from("users").select("full_name").eq("role", "rider");
  if (error) throw error;
  return data.map((r) => r.full_name);
}

export async function setOrderStatus(id, col) {
  if (!isLive) return;
  const status = COL2STATUS[col] || col;
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function setStock(id, stock) {
  if (!isLive) { const p = MOCK_PRODUCTS_STORE.find((x) => x.id === id); if (p) p.stock = stock; return; }
  const { error } = await supabase.from("products").update({ stock_quantity: stock }).eq("id", id);
  if (error) throw error;
}

/* ============================ المنتجات (مربوطة بالقسم/التفرّع) ============================ */
/*  categoryId = معرّف القسم الرئيسي أو التفرّع (tier2). الشكل الموحّد عبر mapProduct/resolveMockProduct */

export async function createProduct({ name, categoryId = null, price = 0, stock = 0, weight = "", mrp = 0, emoji = null }) {
  if (!isLive) {
    const row = { id: "p" + Date.now(), name, categoryId: categoryId ?? null, price: +price || 0, stock: +stock || 0, weight: weight || "", mrp: +mrp || 0, emoji: emoji || null, accent: "#0C831F" };
    MOCK_PRODUCTS_STORE.push(row);
    return resolveMockProduct(row);
  }
  const { data, error } = await supabase.from("products").insert({
    name, category_id: categoryId ?? null, price_iqd: +price || 0, stock_quantity: +stock || 0,
    weight_label: weight || null, mrp_iqd: +mrp || 0, image_url: emoji ? "emoji:" + emoji : null,
  }).select(PROD_COLS).single();
  if (error) throw error;
  return mapProduct(data);
}

export async function updateProduct(id, { name, categoryId, price, stock, weight, mrp, emoji }) {
  if (!isLive) {
    const p = MOCK_PRODUCTS_STORE.find((x) => x.id === id);
    if (p) {
      if (name !== undefined) p.name = name;
      if (categoryId !== undefined) p.categoryId = categoryId ?? null;
      if (price !== undefined) p.price = +price || 0;
      if (stock !== undefined) p.stock = +stock || 0;
      if (weight !== undefined) p.weight = weight;
      if (mrp !== undefined) p.mrp = +mrp || 0;
      if (emoji !== undefined) p.emoji = emoji || null;
    }
    return;
  }
  const patch = {};
  if (name !== undefined) patch.name = name;
  if (categoryId !== undefined) patch.category_id = categoryId ?? null;
  if (price !== undefined) patch.price_iqd = +price || 0;
  if (stock !== undefined) patch.stock_quantity = +stock || 0;
  if (weight !== undefined) patch.weight_label = weight || null;
  if (mrp !== undefined) patch.mrp_iqd = +mrp || 0;
  if (emoji !== undefined) patch.image_url = emoji ? "emoji:" + emoji : null;
  const { error } = await supabase.from("products").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id) {
  if (!isLive) { MOCK_PRODUCTS_STORE = MOCK_PRODUCTS_STORE.filter((x) => x.id !== id); return; }
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

/* ============================ استيراد/تصدير الكتالوج ============================ */
/*  importCatalog(rows): يضمن وجود الأقسام/التفرّعات (بالاسم)، ثم Upsert للمنتجات
 *  بمطابقة (الاسم + القسم/التفرّع). يعمل في الوضعين، ويعيد كتالوجاً محدّثاً + إحصاء.
 *  rows: [{ cat, sub, name, weight, price, mrp, stock, emoji }]                       */

// تحويل الأرقام العربية إلى لاتينية ثم إلى عدد صحيح غير سالب (السعر/المخزون أعداد صحيحة)
const toNum = (v) => {
  if (v == null || v === "") return 0;
  const s = String(v).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[^\d.-]/g, "");
  const n = parseFloat(s);                 // parseFloat ثم تقريب كي لا نفقد الكسور كما يفعل parseInt
  return isNaN(n) ? 0 : Math.max(0, Math.round(n));
};
// تنظيف نصّ: إزالة محارف التحكّم، قصّ، وحدّ أقصى للطول (حماية من مدخلات مفسِدة)
const clampText = (s, max = 120) => String(s == null ? "" : s).replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, max);

export async function importCatalog(rows) {
  const stats = { categoriesCreated: 0, subCreated: 0, productsCreated: 0, productsUpdated: 0, skipped: 0, failed: 0 };
  let cats = await getCategories();
  const findT1 = (n) => cats.find((c) => c.parentId == null && c.name === n);
  const findSub = (pid, n) => cats.find((c) => c.parentId === pid && c.name === n);

  // 1) ضمان الأقسام والتفرّعات الناقصة (بالاسم) — تسلسلياً كي لا تتكرّر، مع عزل أخطاء كل صفّ
  for (const r of rows) {
    const catName = clampText(r.cat);
    if (!catName) continue;
    try {
      let t1 = findT1(catName);
      if (!t1) { t1 = await createCategory({ name: catName }); cats.push(t1); stats.categoriesCreated++; }
      const subName = clampText(r.sub);
      if (subName && !findSub(t1.id, subName)) {
        const s = await createCategory({ name: subName, parentId: t1.id });
        cats.push(s); stats.subCreated++;
      }
    } catch (e) { console.error("فشل إنشاء قسم/تفرّع:", catName, e); }
  }

  // 2) Upsert للمنتجات (المطابقة بالاسم + معرّف القسم/التفرّع)
  const resolveCatId = (r) => {
    const catName = clampText(r.cat);
    if (!catName) return null;
    const t1 = findT1(catName); if (!t1) return null;
    const subName = clampText(r.sub);
    if (subName) { const s = findSub(t1.id, subName); return s ? s.id : t1.id; }
    return t1.id;
  };
  let prods = await getProducts();
  for (const r of rows) {
    const name = clampText(r.name);
    if (!name) { stats.skipped++; continue; }
    try {
      const categoryId = resolveCatId(r);
      const fields = {
        name, categoryId,
        price: toNum(r.price), stock: toNum(r.stock), mrp: toNum(r.mrp),
        weight: clampText(r.weight, 40),
        emoji: (r.emoji || "").trim() || null,
      };
      const existing = prods.find((p) => p.name === name && p.categoryId === categoryId);
      if (existing) { await updateProduct(existing.id, fields); stats.productsUpdated++; }
      else { const created = await createProduct(fields); if (created) prods.push(created); stats.productsCreated++; }
    } catch (e) { console.error("فشل استيراد منتج:", name, e); stats.failed++; }
  }

  return { categories: await getCategories(), products: await getProducts(), stats };
}

/* ============================ الأقسام (شجرة من مستويين) ============================ */
/*  parentId=null قسم رئيسي، وغيره تفرّع. الشكل الموحّد: {id,name,parentId,iconName,sort} */

export async function getCategories() {
  if (!isLive) return MOCK_CATEGORIES.map((c) => ({ ...c })); // نسخة عميقة كي لا تُفسد المصفوفة الأصلية
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,icon_url,parent_category_id,sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data.map((r) => ({
    id: r.id,
    name: r.name,
    parentId: r.parent_category_id,
    iconName: parseIconName(r.icon_url),
    sort: r.sort_order ?? 0,
  }));
}

export async function createCategory({ name, iconName = null, parentId = null }) {
  if (!isLive) {
    const sibs = MOCK_CATEGORIES.filter((c) => c.parentId === (parentId ?? null));
    const next = sibs.length ? Math.max(...sibs.map((s) => s.sort)) + 1 : 0;
    const row = { id: "c" + Date.now(), name, parentId: parentId ?? null, iconName: iconName ?? null, sort: next };
    MOCK_CATEGORIES.push(row);
    return { ...row };
  }
  // ترتيب التالي ضمن نفس المجموعة (.is للقيمة null و.eq لغيرها)
  const base = supabase.from("categories").select("sort_order");
  const { data: sibs, error: sErr } = parentId == null ? await base.is("parent_category_id", null) : await base.eq("parent_category_id", parentId);
  if (sErr) throw sErr;
  const next = sibs && sibs.length ? Math.max(...sibs.map((s) => s.sort_order ?? 0)) + 1 : 0;
  const { data, error } = await supabase
    .from("categories")
    .insert({ name, icon_url: iconName ? "icon:" + iconName : null, parent_category_id: parentId ?? null, sort_order: next })
    .select("id,name,icon_url,parent_category_id,sort_order")
    .single();
  if (error) throw error;
  return { id: data.id, name: data.name, parentId: data.parent_category_id, iconName: parseIconName(data.icon_url), sort: data.sort_order ?? 0 };
}

export async function updateCategory(id, { name, iconName }) {
  if (!isLive) {
    const c = MOCK_CATEGORIES.find((x) => x.id === id);
    if (c) { if (name !== undefined) c.name = name; if (iconName !== undefined) c.iconName = iconName; }
    return;
  }
  const patch = {};
  if (name !== undefined) patch.name = name;
  if (iconName !== undefined) patch.icon_url = iconName ? "icon:" + iconName : null;
  const { error } = await supabase.from("categories").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteCategory(id) {
  if (!isLive) {
    MOCK_CATEGORIES = MOCK_CATEGORIES.filter((c) => c.id !== id && c.parentId !== id); // محاكاة الحذف التتابعي
    return;
  }
  // قاعدة البيانات تحذف التفرّعات تتابعياً (CASCADE) وتجعل category_id للمنتجات NULL تلقائياً
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

// تبديل ترتيب صفّين متجاورين بنفس الأب. swap = { aId, aSort, bId, bSort } محسوبة من المستدعي
export async function reorderCategory(id, dir, swap) {
  if (!isLive) {
    const a = MOCK_CATEGORIES.find((x) => x.id === swap.aId);
    const b = MOCK_CATEGORIES.find((x) => x.id === swap.bId);
    if (a) a.sort = swap.aSort;
    if (b) b.sort = swap.bSort;
    return;
  }
  const rs = await Promise.all([
    supabase.from("categories").update({ sort_order: swap.aSort }).eq("id", swap.aId),
    supabase.from("categories").update({ sort_order: swap.bSort }).eq("id", swap.bId),
  ]);
  const err = rs.find((r) => r.error);
  if (err) throw err.error;
}
