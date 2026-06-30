import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "./cart.jsx";
import { emojiFor, prodEmoji } from "./emoji.js";
import { ShoppingCart, ChevronLeft, Bike, Package, Check } from "lucide-react";

/* ================================================================== */
/*  Sticky cart bar (Blinkit-style) — مثبّتة عالمياً لكل شاشات الزبون   */
/*  - تظهر فور إضافة أول منتج                                          */
/*  - شريط تقدّم التوصيل المجاني (تعبئة فعلية)                          */
/*  - «N منتج · الإجمالي · عرض السلة»                                  */
/*  واعية بالمسار: ترتفع فوق شريط التنقّل/زر الإضافة، وتختفي بصفحة السلة  */
/* ================================================================== */

export const FREE_AT = 15000;
const iqd = (n) => Number(n).toLocaleString("en-US") + " د.ع";
const HIDE_ON = ["/cart", "/address", "/track"];

const STYLE = `
@keyframes cartbar-up { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
.cartbar-fixed { position:fixed; inset-inline:0; z-index:56; animation:cartbar-up .22s cubic-bezier(.2,.7,.3,1); }
.cartbar-go { transition:transform .12s ease, background .15s ease; }
.cartbar-go:active { transform:scale(.985); }
.cartbar-fill { transition:width .35s cubic-bezier(.4,.1,.2,1); }
`;

export default function CartBar() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { count, subtotal, list } = useCart();
  if (!count || HIDE_ON.includes(pathname)) return null;

  // ارفع الشريط فوق العنصر الثابت السفلي لكل صفحة
  const bottom = pathname === "/" ? 58 : pathname === "/product" ? 74 : 8;
  const maxWidth = pathname === "/" ? "72rem" : "48rem";

  const remaining = Math.max(0, FREE_AT - subtotal);
  const free = remaining === 0;
  const pct = Math.max(7, Math.min(100, (subtotal / FREE_AT) * 100));
  const thumbs = list.slice(0, 3);
  const accent = free ? "#0C831F" : "#2563EB";
  const unit = count === 1 ? "منتج" : count === 2 ? "منتجان" : "منتجات";

  return (
    <div className="cartbar-fixed px-3" style={{ bottom }} dir="rtl">
      <style>{STYLE}</style>
      <div className="mx-auto" style={{ maxWidth }}>
        <div className="overflow-hidden" style={{ borderRadius: 18, boxShadow: "0 10px 30px rgba(16,24,40,.18)", background: "#fff", border: "1px solid #EEF0F3" }}>
          {/* ===== free-delivery progress ===== */}
          <div style={{ background: free ? "#EAF6EC" : "#EFF4FF", padding: "8px 12px 9px" }}>
            <div className="flex items-center gap-2">
              <span className="rounded-lg flex items-center justify-center shrink-0" style={{ width: 26, height: 26, background: free ? "#D7EEDB" : "#DCE8FF" }}>
                {free ? <Check size={15} strokeWidth={3} style={{ color: "#0C831F" }} /> : <Bike size={15} style={{ color: accent }} />}
              </span>
              <p className="text-xs font-bold flex-1 leading-tight" style={{ color: free ? "#0C831F" : "#2B59C3" }}>
                {free ? "🎉 حصلت على توصيل مجاني!" : <>أضف بـ <b>{iqd(remaining)}</b> وتوصيلك يصير مجاني</>}
              </p>
            </div>
            <div className="mt-1.5 rounded-full overflow-hidden" style={{ height: 6, background: free ? "#CBE7D0" : "#D5E2FB" }}>
              <div className="cartbar-fill h-full rounded-full" style={{ width: pct + "%", background: accent }} />
            </div>
          </div>

          {/* ===== green cart row ===== */}
          <button onClick={() => nav("/cart")} className="cartbar-go w-full flex items-center justify-between gap-2" style={{ background: "#0C831F", color: "#fff", padding: "10px 14px" }}>
            <span className="flex items-center gap-2.5 min-w-0">
              <span className="flex items-center" style={{ paddingInlineStart: thumbs.length > 1 ? 8 : 0 }}>
                {thumbs.map((it, i) => (
                  <span key={it.id} className="rounded-lg flex items-center justify-center" style={{ width: 32, height: 32, background: "#fff", border: "2px solid #0C831F", marginInlineStart: i ? -10 : 0, zIndex: thumbs.length - i, fontSize: 17 }}>
                    {prodEmoji(it)}
                  </span>
                ))}
              </span>
              <span className="flex flex-col items-start leading-none min-w-0">
                <span className="text-sm font-extrabold">{count} {unit}</span>
                <span className="text-xs font-bold mt-1" style={{ opacity: 0.92 }}>{iqd(subtotal)}</span>
              </span>
            </span>
            <span className="flex items-center gap-1.5 shrink-0">
              <ShoppingCart size={18} strokeWidth={2.4} />
              <span className="text-sm font-extrabold">عرض السلة</span>
              <ChevronLeft size={18} strokeWidth={2.6} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
