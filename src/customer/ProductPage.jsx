import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown, ChevronLeft, Heart, Search, Share2, Plus, Minus, Clock, Bike, X, RefreshCcw,
  Citrus, Carrot, Leaf, Apple, Cherry, Salad, Sprout,
} from "lucide-react";

/* ================================================================== */
/*  Styles                                                            */
/* ================================================================== */
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
.qc-app, .qc-app * { font-family:'Cairo', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif; -webkit-font-smoothing:antialiased; }
.qc-app { background:#FFFFFF; color:#1A1A1A; }
.no-scrollbar::-webkit-scrollbar { display:none; }
.no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
.icon-btn { transition:all .15s ease; }
.icon-btn:hover { background:#F3F4F6; }
.icon-btn:active { transform:scale(.92); }
.card-soft { background:#F6F7F9; }
.vdetails { background:#E8F5EA; color:#0C831F; transition:background .15s ease; }
.vdetails:hover { background:#D7EEDB; }
.linkrow { background:#fff; border:1px solid #EFF0F2; transition:background .15s ease; cursor:pointer; }
.linkrow:hover { background:#FAFBFC; }
.wish { box-shadow:0 1px 3px rgba(16,24,40,.18); transition:all .15s ease; }
.wish:active { transform:scale(.9); }
.add-btn { background:#fff; border:1px solid #0C831F; color:#0C831F; transition:all .15s ease; box-shadow:0 1px 3px rgba(16,24,40,.14); }
.add-btn:hover { background:#0C831F; color:#fff; }
.add-btn:active { transform:scale(.95); }
.stepper { background:#0C831F; color:#fff; box-shadow:0 1px 3px rgba(16,24,40,.14); }
.stepper-btn:hover { background:rgba(255,255,255,.18); }
.stepper-btn:active { transform:scale(.9); }
.recipe-pill { background:#EAF6EC; color:#0C831F; transition:background .15s ease; }
.recipe-pill:hover { background:#D7EEDB; }
.dish-card, .brand-card { transition:transform .15s ease; cursor:pointer; }
.dish-card:hover, .brand-card:hover { transform:translateY(-2px); }
.brand-card { background:#fff; border:1px solid #ECEEF3; }
.cta { background:#0C831F; color:#fff; transition:all .15s ease; box-shadow:0 6px 18px rgba(12,131,31,.3); }
.cta:hover { background:#0A7019; }
.cta:active { transform:scale(.98); }
.fb-card { background:#fff; border:1px solid #EEF0F3; box-shadow:0 6px 20px rgba(16,24,40,.10); }
.fb-x { transition:background .15s ease; }
.fb-x:hover { background:#F1F2F4; }
.bottombar { background:#fff; border-top:1px solid #ECECEC; box-shadow:0 -6px 20px rgba(16,24,40,.07); }
.galdot { transition:all .2s ease; }
`;

/* ================================================================== */
/*  Data                                                              */
/* ================================================================== */
const MAIN = {
  id: 100, name: "ليمون", weight: "200 غرام", price: 1000, mrp: 1250, delivery: "17 دقيقة", brand: "فريشبري",
  desc: "يُعرف الليمون أساساً بعصيره ورائحته القوية، بلون أصفر زاهٍ وقشرة عطرة تضيف نكهة منعشة لكل الأطباق والمشروبات.",
  Icon: Citrus, accent: "#D9A521",
};
const TOP = [
  { id: 1, name: "بصل أحمر", weight: "1 كغم", price: 1900, mrp: 2250, options: 2, recipes: 30, Icon: Cherry, accent: "#B23B6B" },
  { id: 2, name: "فلفل أخضر حار", weight: "100 غرام", price: 650, mrp: 750, recipes: 9, Icon: Leaf, accent: "#2E9B4F" },
  { id: 3, name: "خيار إنجليزي", weight: "500 غرام", price: 1800, mrp: 2100, recipes: 20, Icon: Salad, accent: "#2E9B4F" },
];
const PEOPLE = [
  { id: 4, name: "زنجبيل طازج", weight: "200 غرام", price: 3250, mrp: 4000, Icon: Sprout, accent: "#C9923E" },
  { id: 5, name: "جزر برتقالي", weight: "200 غرام", price: 750, mrp: 900, Icon: Carrot, accent: "#E08A2E" },
  { id: 6, name: "طماطم هجينة", weight: "500 غرام", price: 1900, mrp: 2350, options: 2, Icon: Apple, accent: "#D33A3A" },
  { id: 7, name: "فلفل أحمر حلو", weight: "125 غرام", price: 1200, mrp: 1500, Icon: Apple, accent: "#D33A3A" },
  { id: 8, name: "فاصوليا خضراء", weight: "250 غرام", price: 1500, mrp: 1800, Icon: Leaf, accent: "#2E9B4F" },
  { id: 9, name: "بطاطا", weight: "1 كغم", price: 1250, mrp: 1500, options: 2, Icon: Sprout, accent: "#C9923E" },
];
const RECIPES = [
  { name: "شوربة الليمون", emoji: "🍲" }, { name: "دجاج بالليمون", emoji: "🍗" },
  { name: "سلطة منعشة", emoji: "🥗" }, { name: "عصير ليمون", emoji: "🍋" }, { name: "كيك الليمون", emoji: "🍰" },
];
const BRANDS = [
  { name: "يو بي عضوي", c: "#E08A2E" }, { name: "الأرض الخضراء", c: "#2E9B4F" },
  { name: "مزارع شاتايوشي", c: "#5A6473" }, { name: "سول سوسايتي", c: "#D9A521" }, { name: "فريش", c: "#2B7A9B" },
];
const FREE_AT = 15000;
const iqd = (n) => Number(n).toLocaleString("en-US") + " د.ع";
const clamp2 = { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" };
const FEED = [...TOP, ...PEOPLE];

/* ================================================================== */
/*  Rich product card (3-col feeds)                                   */
/* ================================================================== */
function ProductCard({ p, qty, onAdd, onInc, onDec }) {
  const off = p.mrp && p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
  return (
    <div className="flex flex-col">
      <div className="relative rounded-xl mb-2" style={{ aspectRatio: "1 / 1", background: "#F3F5F8", overflow: "hidden" }}>
        <div className="absolute inset-0 flex items-center justify-center"><p.Icon size={46} style={{ color: p.accent || "#9AA8B5", opacity: 0.28 }} /></div>
        <button className="wish absolute rounded-full flex items-center justify-center" style={{ top: 6, insetInlineEnd: 6, width: 24, height: 24, background: "#fff" }}><Heart size={13} style={{ color: "#C7CDD6" }} /></button>
        <span className="absolute flex items-center justify-center" style={{ bottom: 42, insetInlineEnd: 8, width: 16, height: 16, borderRadius: 3, border: "1.5px solid #1A7A33", background: "#fff" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#1A7A33" }} /></span>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between" style={{ padding: 6 }}>
          <span className="rounded-md text-xs font-bold" style={{ background: "rgba(255,255,255,.94)", color: "#3A424E", padding: "2px 6px" }}>{p.weight}</span>
          {qty === 0 ? (
            <button onClick={onAdd} className="add-btn rounded-lg flex flex-col items-center leading-none" style={{ padding: p.options ? "5px 14px 4px" : "8px 16px" }}>
              <span className="text-sm" style={{ fontWeight: 800 }}>أضف</span>
              {p.options ? <span style={{ fontSize: 9, marginTop: 2, fontWeight: 700 }}>{p.options} خيارات</span> : null}
            </button>
          ) : (
            <div className="stepper rounded-lg overflow-hidden flex items-center">
              <button onClick={onDec} className="stepper-btn" style={{ padding: "8px 8px" }}><Minus size={14} strokeWidth={2.8} /></button>
              <span className="text-sm font-extrabold" style={{ width: 18, textAlign: "center" }}>{qty}</span>
              <button onClick={onInc} className="stepper-btn" style={{ padding: "8px 8px" }}><Plus size={14} strokeWidth={2.8} /></button>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-extrabold" style={{ color: "#1A1A1A" }}>{iqd(p.price)}</span>
        {off > 0 && <span className="text-xs line-through" style={{ color: "#9AA3AF" }}>{iqd(p.mrp)}</span>}
      </div>
      <p className="text-xs leading-snug mt-1 font-medium" style={{ ...clamp2, color: "#2A2F36", minHeight: "2.4em" }}>{p.name}</p>
      <div className="flex items-center gap-1 mt-1"><Clock size={11} style={{ color: "#9AA3AF" }} /><span className="text-xs" style={{ color: "#9AA3AF" }}>17 دقيقة</span></div>
      {p.recipes > 0 && (
        <button className="recipe-pill inline-flex items-center gap-1 rounded-lg mt-2 text-xs font-bold" style={{ padding: "5px 10px", width: "fit-content" }}>{p.recipes} وصفة <ChevronLeft size={13} /></button>
      )}
    </div>
  );
}

const Feed3 = ({ title, items, c }) => (
  <section className="px-3 pt-6">
    <h2 className="text-lg font-extrabold mb-3 px-0.5" style={{ color: "#1A1A1A" }}>{title}</h2>
    <div className="grid grid-cols-3 lg:grid-cols-6 gap-x-2.5 gap-y-5">
      {items.map((p) => <ProductCard key={p.id} p={p} qty={c.cart[p.id] || 0} onAdd={() => c.add(p.id)} onInc={() => c.inc(p.id)} onDec={() => c.dec(p.id)} />)}
    </div>
  </section>
);

/* ================================================================== */
/*  Product page                                                      */
/* ================================================================== */
export default function ProductPage() {
  const [bannerOpen, setBannerOpen] = useState(true);
  const [cart, setCart] = useState({});
  const [gal, setGal] = useState(0);

  const bottomRef = useRef(null);
  const [bottomH, setBottomH] = useState(120);
  useEffect(() => {
    const measure = () => bottomRef.current && setBottomH(bottomRef.current.offsetHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [bannerOpen]);

  const subtotal = Object.entries(cart).reduce((s, [id, q]) => { const p = [MAIN, ...FEED].find((x) => x.id === +id); return s + (p ? p.price * q : 0); }, 0);
  const remaining = Math.max(0, FREE_AT - subtotal);
  const add = (id) => setCart((m) => ({ ...m, [id]: (m[id] || 0) + 1 }));
  const inc = (id) => setCart((m) => ({ ...m, [id]: (m[id] || 0) + 1 }));
  const dec = (id) => setCart((m) => { const q = (m[id] || 0) - 1; const n = { ...m }; if (q <= 0) delete n[id]; else n[id] = q; return n; });
  const c = { cart, add, inc, dec };
  const mainQty = cart[MAIN.id] || 0;
  const off = Math.round((1 - MAIN.price / MAIN.mrp) * 100);

  return (
    <div className="qc-app min-h-screen" dir="rtl" lang="ar">
      <style>{STYLE}</style>

      {/* ===== sticky header ===== */}
      <div className="sticky top-0 z-30" style={{ background: "#fff", borderBottom: "1px solid #F1F2F4" }}>
        <div className="flex items-center gap-3 px-4 py-3">
          <button className="icon-btn w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ border: "1px solid #ECECEC" }}><ChevronDown size={20} style={{ color: "#1A1A1A" }} /></button>
          <h1 className="flex-1 min-w-0 text-lg font-extrabold truncate" style={{ color: "#1A1A1A" }}>{MAIN.name}</h1>
          <button className="icon-btn w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ border: "1px solid #ECECEC" }}><Heart size={18} style={{ color: "#1A1A1A" }} /></button>
          <button className="icon-btn w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ border: "1px solid #ECECEC" }}><Search size={18} style={{ color: "#1A1A1A" }} /></button>
          <button className="icon-btn w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ border: "1px solid #ECECEC" }}><Share2 size={17} style={{ color: "#1A1A1A" }} /></button>
        </div>
      </div>

      {/* ===== image gallery ===== */}
      <div className="relative" style={{ background: "#F3F5F8" }}>
        <div className="max-w-3xl mx-auto flex items-center justify-center" style={{ height: 300 }}>
          <MAIN.Icon size={120} style={{ color: MAIN.accent, opacity: 0.32 }} />
        </div>
        <div className="absolute inset-x-0 flex items-center justify-center gap-1.5" style={{ bottom: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <button key={i} onClick={() => setGal(i)} className="galdot rounded-full" style={{ width: i === gal ? 18 : 7, height: 7, background: i === gal ? "#3A424E" : "#C7CDD6" }} />
          ))}
        </div>
      </div>

      {/* ===== description + info cards ===== */}
      <div className="px-3 pt-3 space-y-3">
        <div className="card-soft rounded-2xl p-3 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold mb-1" style={{ color: "#7A8493" }}>الوصف</p>
            <p className="text-sm leading-snug" style={{ ...clamp2, color: "#2A2F36" }}>{MAIN.desc}</p>
          </div>
          <button className="vdetails rounded-xl text-xs font-extrabold shrink-0 leading-tight" style={{ padding: "10px 12px" }}>عرض<br />التفاصيل</button>
        </div>

        <div className="card-soft rounded-2xl p-4">
          <div className="inline-flex items-center gap-1 rounded-md mb-2" style={{ background: "#fff", padding: "3px 8px" }}><Clock size={13} style={{ color: "#5A6473" }} /><span className="text-xs font-bold" style={{ color: "#5A6473" }}>{MAIN.delivery}</span></div>
          <h2 className="text-xl font-extrabold" style={{ color: "#1A1A1A" }}>{MAIN.name}</h2>
          <p className="text-sm font-semibold mt-0.5" style={{ color: "#5A6473" }}>{MAIN.weight}</p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-xl font-extrabold" style={{ color: "#1A1A1A" }}>{iqd(MAIN.price)}</span>
            <span className="text-sm" style={{ color: "#9AA3AF" }}>MRP <span className="line-through">{iqd(MAIN.mrp)}</span></span>
          </div>
        </div>

        <div className="linkrow rounded-2xl px-3 py-3 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#2E9B4F" }}><span className="text-white font-extrabold">ف</span></div>
          <div className="flex-1 min-w-0"><p className="text-base font-extrabold" style={{ color: "#1A1A1A" }}>{MAIN.brand}</p><p className="text-xs" style={{ color: "#7A8493" }}>تصفّح كل المنتجات</p></div>
          <ChevronLeft size={20} style={{ color: "#9AA3AF" }} />
        </div>

        <div className="linkrow rounded-2xl px-3 py-3 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#F1F2F4" }}><RefreshCcw size={20} style={{ color: "#5A6473" }} /></div>
          <p className="flex-1 text-sm font-bold" style={{ color: "#2A2F36" }}>استبدال خلال 48 ساعة فقط</p>
          <ChevronLeft size={20} style={{ color: "#9AA3AF" }} />
        </div>
      </div>

      {/* ===== top products ===== */}
      <Feed3 title="أفضل المنتجات في هذا القسم" items={TOP} c={c} />

      {/* ===== recipes ===== */}
      <section className="px-3 pt-6">
        <h2 className="text-lg font-extrabold mb-3 px-0.5" style={{ color: "#1A1A1A" }}>وصفات تناسبك</h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {RECIPES.map((r) => (
            <div key={r.name} className="dish-card shrink-0 flex flex-col items-center gap-1.5" style={{ width: 104 }}>
              <div className="rounded-2xl flex items-center justify-center" style={{ width: 104, height: 104, background: "#F3F5F8" }}><span style={{ fontSize: 44 }}>{r.emoji}</span></div>
              <span className="text-xs font-bold text-center leading-tight" style={{ color: "#2A2F36" }}>{r.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== brands in category ===== */}
      <section className="px-3 pt-6">
        <h2 className="text-lg font-extrabold mb-3 px-0.5" style={{ color: "#1A1A1A" }}>ماركات في هذا القسم</h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {BRANDS.map((b) => (
            <div key={b.name} className="shrink-0 flex flex-col items-center gap-1.5" style={{ width: 84 }}>
              <div className="brand-card rounded-2xl flex items-center justify-center" style={{ width: 80, height: 80 }}><span className="font-extrabold text-lg" style={{ color: b.c }}>{b.name.slice(0, 2)}</span></div>
              <span className="text-xs font-bold text-center leading-tight" style={{ color: "#3A424E" }}>{b.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== people also bought ===== */}
      <Feed3 title="اشتروا أيضاً" items={PEOPLE} c={c} />

      {/* spacer */}
      <div style={{ height: bottomH + 8 }} />

      {/* ===== fixed bottom: banner + add-to-cart bar ===== */}
      <div ref={bottomRef} className="fixed left-0 right-0 bottom-0 z-50">
        {bannerOpen && (
          <div className="px-3 pb-2">
            <div className="max-w-3xl mx-auto">
              <div className="fb-card rounded-2xl px-3 py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#E8F0FE" }}><Bike size={18} style={{ color: "#2563EB" }} /></span>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold" style={{ color: "#2563EB" }}>توصيل مجاني خصيصاً لك ✨</p>
                    <p className="text-xs flex items-center gap-1" style={{ color: "#7A8493" }}>{remaining > 0 ? <>أضف منتجات بقيمة {iqd(remaining)} <ChevronLeft size={13} /></> : <>توصيلك صار مجاني 🎉</>}</p>
                  </div>
                </div>
                <button onClick={() => setBannerOpen(false)} className="fb-x rounded-full p-1.5 shrink-0"><X size={18} style={{ color: "#9AA3AF" }} /></button>
              </div>
            </div>
          </div>
        )}

        <div className="bottombar">
          <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold" style={{ color: "#1A1A1A" }}>{MAIN.weight}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-extrabold" style={{ color: "#1A1A1A" }}>{iqd(MAIN.price)}</span>
                <span className="text-xs" style={{ color: "#9AA3AF" }}>MRP <span className="line-through">{iqd(MAIN.mrp)}</span></span>
              </div>
              <p className="text-xs" style={{ color: "#9AA3AF" }}>شامل كل الضرائب</p>
            </div>
            {mainQty === 0 ? (
              <button onClick={() => add(MAIN.id)} className="cta rounded-xl text-base font-extrabold shrink-0" style={{ padding: "13px 30px" }}>أضف إلى السلة</button>
            ) : (
              <div className="stepper rounded-xl overflow-hidden flex items-center shrink-0">
                <button onClick={() => dec(MAIN.id)} className="stepper-btn" style={{ padding: "13px 16px" }}><Minus size={18} strokeWidth={2.8} /></button>
                <span className="text-base font-extrabold" style={{ width: 32, textAlign: "center" }}>{mainQty}</span>
                <button onClick={() => inc(MAIN.id)} className="stepper-btn" style={{ padding: "13px 16px" }}><Plus size={18} strokeWidth={2.8} /></button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
