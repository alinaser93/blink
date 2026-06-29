import { supabase, isLive } from "./supabase.js";
import { ICON_MAP, MOCK_PRODUCTS, MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_RIDERS } from "./mockData.js";

export { isLive };

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

export async function getProducts() {
  if (!isLive) return MOCK_PRODUCTS;
  const { data, error } = await supabase.from("products").select("*").order("name");
  if (error) throw error;
  return data.map((r) => ({ id: r.id, name: r.name, cat: r.category, price: r.price, stock: r.stock, Icon: ICON_MAP[r.icon] || ICON_MAP.Package, accent: r.accent }));
}
export async function getOrders() {
  if (!isLive) return MOCK_ORDERS;
  const { data, error } = await supabase.from("orders").select("*").neq("status_col", "delivered").order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((r) => ({ id: r.id, col: r.status_col, items: r.items_count, total: r.total, rider: r.rider, status: r.delivery_status, time: relAr(r.created_at) }));
}
export async function getCustomers() {
  if (!isLive) return MOCK_CUSTOMERS;
  const { data, error } = await supabase.from("customers").select("*").order("total_spent", { ascending: false });
  if (error) throw error;
  return data.map((r) => ({ name: r.name, phone: r.phone, orders: r.orders_count, spent: r.total_spent, last: r.last_order, status: r.status }));
}
export async function getRiders() {
  if (!isLive) return MOCK_RIDERS;
  const { data, error } = await supabase.from("riders").select("name").eq("available", true);
  if (error) throw error;
  return data.map((r) => r.name);
}
export async function setOrderStatus(id, col, rider, delivery_status) {
  if (!isLive) return;
  const patch = { status_col: col };
  if (rider !== undefined) patch.rider = rider;
  if (delivery_status !== undefined) patch.delivery_status = delivery_status;
  const { error } = await supabase.from("orders").update(patch).eq("id", id);
  if (error) throw error;
}
export async function setStock(id, stock) {
  if (!isLive) return;
  const { error } = await supabase.from("products").update({ stock }).eq("id", id);
  if (error) throw error;
}
