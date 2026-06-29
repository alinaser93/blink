import React, { createContext, useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Search, ShoppingCart, Package } from "lucide-react";

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState({}); // id -> { id, name, price, weight, Icon, accent, qty }
  const add = (p) => setItems((m) => { const c = m[p.id]; return { ...m, [p.id]: c ? { ...c, qty: c.qty + 1 } : { ...p, Icon: p.Icon || Package, accent: p.accent || "#0C831F", qty: 1 } }; });
  const inc = (id) => setItems((m) => (m[id] ? { ...m, [id]: { ...m[id], qty: m[id].qty + 1 } } : m));
  const dec = (id) => setItems((m) => { const c = m[id]; if (!c) return m; const q = c.qty - 1; const n = { ...m }; if (q <= 0) delete n[id]; else n[id] = { ...c, qty: q }; return n; });
  const remove = (id) => setItems((m) => { const n = { ...m }; delete n[id]; return n; });
  const clear = () => setItems({});
  const qty = (id) => (items[id] ? items[id].qty : 0);
  const list = Object.values(items);
  const count = list.reduce((s, x) => s + x.qty, 0);
  const subtotal = list.reduce((s, x) => s + x.price * x.qty, 0);
  return <CartCtx.Provider value={{ items, list, add, inc, dec, remove, clear, qty, count, subtotal }}>{children}</CartCtx.Provider>;
}

const FALLBACK = { items: {}, list: [], add() {}, inc() {}, dec() {}, remove() {}, clear() {}, qty: () => 0, count: 0, subtotal: 0 };
export const useCart = () => useContext(CartCtx) || FALLBACK;

export function BottomNav() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { count } = useCart();
  const tabs = [
    { to: "/", label: "الرئيسية", Icon: Home },
    { to: "/category", label: "الأقسام", Icon: LayoutGrid },
    { to: "/search", label: "البحث", Icon: Search },
    { to: "/cart", label: "السلة", Icon: ShoppingCart, badge: count },
  ];
  return (
    <div style={{ position: "fixed", insetInline: 0, bottom: 0, zIndex: 60, background: "#fff", borderTop: "1px solid #EEF0F2", boxShadow: "0 -4px 16px rgba(16,24,40,.06)" }}>
      <div style={{ display: "flex", maxWidth: 640, margin: "0 auto" }}>
        {tabs.map((t) => {
          const on = pathname === t.to;
          const col = on ? "#E0A800" : "#9AA3AF";
          return (
            <button key={t.to} onClick={() => nav(t.to)} style={{ flex: 1, padding: "9px 0 11px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", fontFamily: "Cairo" }}>
              <span style={{ position: "relative", display: "inline-flex" }}>
                <t.Icon size={22} color={col} strokeWidth={on ? 2.6 : 2} fill={on ? col : "none"} />
                {t.badge > 0 && <span style={{ position: "absolute", top: -6, insetInlineEnd: -9, background: "#0C831F", color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 999, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{t.badge}</span>}
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, color: col }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
