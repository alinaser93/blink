import { supabase, isLive } from "./supabase.js";
import { ICON_MAP, MOCK_PRODUCTS, MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_RIDERS } from "./mockData.js";

export { isLive };

// v2 stores image_url (not an icon name) -> derive a lucide icon + accent from the category
const CAT_ICON   = { "خضار وفواكه": "Carrot", "ألبان": "Milk", "مشروبات": "CupSoda", "بقالة": "Wheat", "سناكس": "Popcorn" };
const CAT_ACCENT = { "خضار وفواكه": "#D33A3A", "ألبان": "#2B7A9B", "مشروبات": "#23306E", "بقالة": "#9A6B2E", "سناكس": "#E0A21F" };

// dashboard kanban column  <->  v2 order_status
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

export async function getProducts() {
  if (!isLive) return MOCK_PRODUCTS;
  const { data, error } = await supabase
    .from("products")
    .select("id,name,price,stock_quantity,category_id,categories(name)")
    .order("name");
  if (error) throw error;
  return data.map((r) => {
    const cat = (r.categories && r.categories.name) || "أخرى";
    return { id: r.id, name: r.name, cat, price: r.price, stock: r.stock_quantity, Icon: ICON_MAP[CAT_ICON[cat]] || ICON_MAP.Package, accent: CAT_ACCENT[cat] || "#0C831F" };
  });
}

export async function getOrders() {
  if (!isLive) return MOCK_ORDERS.map((o) => ({ ...o, num: "#" + o.id }));
  const { data, error } = await supabase
    .from("orders")
    .select("id,total_amount,status,created_at,rider_id,order_items(quantity),rider:users!orders_rider_id_fkey(full_name)")
    .neq("status", "delivered")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((r) => ({
    id: r.id,
    num: shortNum(r.id),
    col: STATUS2COL[r.status] || "new",
    items: (r.order_items || []).reduce((s, it) => s + (it.quantity || 0), 0),
    total: r.total_amount,
    rider: r.rider ? r.rider.full_name : null,
    status: r.status === "dispatched" ? "في الطريق" : null,
    time: relAr(r.created_at),
  }));
}

export async function getCustomers() {
  if (!isLive) return MOCK_CUSTOMERS;
  const { data, error } = await supabase
    .from("users")
    .select("full_name,phone,orders:orders!orders_customer_id_fkey(total_amount,created_at)")
    .eq("role", "customer");
  if (error) throw error;
  return data
    .map((r) => {
      const os = r.orders || [];
      const spent = os.reduce((s, o) => s + (o.total_amount || 0), 0);
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
  if (!isLive) return;
  const { error } = await supabase.from("products").update({ stock_quantity: stock }).eq("id", id);
  if (error) throw error;
}
