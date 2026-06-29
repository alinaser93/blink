import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./cart.jsx";
import {
  ArrowRight, Search, Share2, ChevronDown, ChevronLeft, SlidersHorizontal, ArrowUpDown,
  ShoppingBasket, Carrot, Apple, Grape, Leaf, Salad, Sprout, Flower2, Cherry, Snowflake,
  Heart, Plus, Minus, Star, Clock, Bike, X,
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
.chip { background:#fff; border:1px solid #E3E6EB; color:#2A2F36; transition:all .15s ease; }
.chip:hover { border-color:#0C831F; }
.rail-item { transition:all .15s ease; cursor:pointer; }
.rail-item:hover { background:#FAFBFC; }
.wish { box-shadow:0 1px 3px rgba(16,24,40,.18); transition:all .15s ease; }
.wish:active { transform:scale(.9); }
.add-btn { background:#fff; border:1px solid #0C831F; color:#0C831F; transition:all .15s ease; box-shadow:0 1px 3px rgba(16,24,40,.14); }
.add-btn:hover { background:#0C831F; color:#fff; }
.add-btn:active { transform:scale(.95); }
.stepper { background:#0C831F; color:#fff; box-shadow:0 1px 3px rgba(16,24,40,.14); }
.stepper-btn:hover { background:rgba(255,255,255,.18); }
.stepper-btn:active { transform:scale(.9); }
.all-pill { background:#EAF6EC; color:#0C831F; transition:background .15s ease; }
.all-pill:hover { background:#D7EEDB; }
.brand-card { background:#fff; border:1px solid #ECEEF3; transition:transform .15s ease; cursor:pointer; }
.brand-card:hover { transform:translateY(-2px); }
.fb-card { background:#fff; border:1px solid #EEF0F3; box-shadow:0 8px 26px rgba(16,24,40,.12); }
.fb-x { transition:background .15s ease; }
.fb-x:hover { background:#F1F2F4; }
`;

/* ================================================================== */
/*  Data                                                              */
/* ================================================================== */
const CATEGORY = "خضار وفواكه";
const SUBCATS = [
  { name: "الكل", Icon: ShoppingBasket },
  { name: "خضار طازجة", Icon: Carrot },
  { name: "فواكه طازجة", Icon: Apple },
  { name: "مستورد", Icon: Grape },
  { name: "كزبرة وأعشاب", Icon: Leaf },
  { name: "مقطّعة وبراعم", Icon: Salad },
  { name: "عضوية موثوقة", Icon: Sprout },
  { name: "زهور وأوراق", Icon: Flower2 },
  { name: "موسمية", Icon: Cherry },
  { name: "خضار مجمّدة", Icon: Snowflake },
];
const FILTERS = [
  { label: "فلاتر", Icon: SlidersHorizontal },
  { label: "ترتيب", Icon: ArrowUpDown },
  { label: "النوع" },
  { label: "السعر" },
];

const SEASONAL = [
  { id: 11, name: "مانجو صفدا / بنغنابالي", weight: "600 غرام", price: 6000, mrp: 7400, rating: "4.5", reviews: "3 ألف", tags: ["خالٍ من الكربيد", "حلو غني باللب"], badge: { t: "الأفضل بالموسم", c: "#7A5A2E" }, Icon: Apple, accent: "#D9A521" },
  { id: 12, name: "ليتشي طازجة", weight: "500 غرام", price: 10300, mrp: 12450, rating: "4.4", reviews: "2 ألف", badge: { t: "الأفضل بالموسم", c: "#7A5A2E" }, Icon: Cherry, accent: "#C2477F" },
  { id: 13, name: "جامون أسود طازج", weight: "250 غرام", price: 4200, mrp: 4850, rating: "4.3", reviews: "1 ألف", badge: { t: "الأفضل بالموسم", c: "#7A5A2E" }, Icon: Grape, accent: "#6B3FA0" },
  { id: 14, name: "كرز أحمر مستورد", weight: "200 غرام", price: 7450, mrp: 9350, rating: "4.5", reviews: "900", badge: { t: "مستورد", c: "#6B3FA0" }, Icon: Cherry, accent: "#C24747" },
];

const PRODUCTS = [
  { id: 1, name: "بازلاء خضراء مجمّدة", weight: "500 غرام", price: 5750, mrp: 6750, rating: "4.5", reviews: "63 ألف", pill: "مجمّد", options: 2, badge: { t: "باكيت جديد", c: "#1A7A33" }, Icon: Snowflake, accent: "#2E9B4F" },
  { id: 2, name: "ذرة حلوة مجمّدة", weight: "500 غرام", price: 4250, mrp: 5000, rating: "4.5", reviews: "38 ألف", pill: "مجمّد", badge: { t: "باكيت جديد", c: "#1A7A33" }, Icon: Snowflake, accent: "#D9A521" },
  { id: 3, name: "بازلاء خضراء فاخرة مجمّدة", weight: "500 غرام", price: 4100, mrp: 8450, rating: "4.4", reviews: "12 ألف", pill: "مجمّد", Icon: Snowflake, accent: "#2E9B4F" },
  { id: 4, name: "خضار مشكّلة مجمّدة", weight: "500 غرام", price: 3650, mrp: 4250, rating: "4.3", reviews: "9 ألف", pill: "مجمّد", badge: { t: "باكيت جديد", c: "#1A7A33" }, Icon: Snowflake, accent: "#C9692E" },
  { id: 5, name: "فاصوليا خضراء مجمّدة", weight: "400 غرام", price: 3000, rating: "4.2", reviews: "5 ألف", pill: "مجمّد", options: 2, Icon: Snowflake, accent: "#2E9B4F" },
  { id: 6, name: "بروكلي مجمّد", weight: "400 غرام", price: 4500, mrp: 5500, rating: "4.5", reviews: "7 ألف", pill: "مجمّد", Icon: Snowflake, accent: "#1F9B6B" },
];

const BRANDS = [
  { name: "أمول", c: "#D33A3A" }, { name: "عضوي", c: "#2E9B4F" }, { name: "كابيفا", c: "#1A1A1A" },
  { name: "بيور", c: "#B8860B" }, { name: "نقاء", c: "#2B7A9B" },
];

const ADDR = "السماوة، شارع الكورنيش";
const FREE_AT = 15000;
const iqd = (n) => Number(n).toLocaleString("en-US") + " د.ع";
const clamp2 = { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" };
const ALL = [...SEASONAL, ...PRODUCTS];

/* ================================================================== */
/*  Rich product card                                                 */
/* ================================================================== */
function ProductCard({ p, qty, onAdd, onInc, onDec, fav, onFav }) {
  const off = p.mrp && p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
  return (
    <div className="flex flex-col">
      <div className="relative rounded-xl mb-2" style={{ aspectRatio: "1 / 1", background: "#F3F5F8", overflow: "hidden" }}>
        <div className="absolute inset-0 flex items-center justify-center"><p.Icon size={52} style={{ color: p.accent || "#9AA8B5", opacity: 0.28 }} /></div>
        {p.badge && <span className="absolute text-xs font-extrabold" style={{ top: 8, insetInlineStart: 0, background: p.badge.c, color: "#fff", padding: "3px 9px", borderStartEndRadius: 8, borderEndEndRadius: 8 }}>{p.badge.t}</span>}
        <button onClick={onFav} className="wish absolute rounded-full flex items-center justify-center" style={{ top: 8, insetInlineEnd: 8, width: 26, height: 26, background: "#fff" }}><Heart size={14} fill={fav ? "#E11D2A" : "none"} style={{ color: fav ? "#E11D2A" : "#C7CDD6" }} /></button>
        <span className="absolute flex items-center justify-center" style={{ bottom: 44, insetInlineEnd: 8, width: 17, height: 17, borderRadius: 3, border: "1.5px solid #1A7A33", background: "#fff" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#1A7A33" }} /></span>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between" style={{ padding: 7 }}>
          <span className="rounded-md text-xs font-bold" style={{ background: "rgba(255,255,255,.94)", color: "#3A424E", padding: "3px 7px" }}>{p.weight}</span>
          {qty === 0 ? (
            <button onClick={onAdd} className="add-btn rounded-lg flex flex-col items-center leading-none" style={{ padding: p.options ? "6px 18px 4px" : "9px 22px" }}>
              <span className="text-sm" style={{ fontWeight: 800 }}>أضف</span>
              {p.options ? <span style={{ fontSize: 9, marginTop: 2, fontWeight: 700 }}>{p.options} خيارات</span> : null}
            </button>
          ) : (
            <div className="stepper rounded-lg overflow-hidden flex items-center">
              <button onClick={onDec} className="stepper-btn" style={{ padding: "9px 10px" }}><Minus size={15} strokeWidth={2.8} /></button>
              <span className="text-sm font-extrabold" style={{ width: 20, textAlign: "center" }}>{qty}</span>
              <button onClick={onInc} className="stepper-btn" style={{ padding: "9px 10px" }}><Plus size={15} strokeWidth={2.8} /></button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-base font-extrabold" style={{ color: "#1A1A1A" }}>{iqd(p.price)}</span>
        {off > 0 && <span className="text-xs line-through" style={{ color: "#9AA3AF" }}>{iqd(p.mrp)}</span>}
      </div>
      {off > 0 && <p className="text-xs font-bold mt-0.5" style={{ color: "#2563EB" }}>خصم {off}%</p>}

      <p className="text-sm leading-snug mt-1 font-medium" style={{ ...clamp2, color: "#2A2F36", minHeight: "2.5em" }}>{p.name}</p>

      {p.pill && <span className="inline-flex items-center gap-1 rounded-md mt-1.5 text-xs font-bold" style={{ background: "#E8F1FB", color: "#2A77C9", padding: "2px 7px", width: "fit-content" }}><Snowflake size={11} /> {p.pill}</span>}
      {p.tags && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {p.tags.map((t) => <span key={t} style={{ background: "#F3F4F8", color: "#5A6473", padding: "1px 7px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{t}</span>)}
        </div>
      )}

      <div className="flex items-center gap-1 mt-1.5">
        <Star size={12} fill="#F5B301" style={{ color: "#F5B301" }} />
        <span className="text-xs font-bold" style={{ color: "#3A424E" }}>{p.rating}</span>
        <span className="text-xs font-medium" style={{ color: "#9AA3AF" }}>({p.reviews})</span>
      </div>
      <div className="flex items-center gap-1 mt-1">
        <Clock size={12} style={{ color: "#9AA3AF" }} /><span className="text-xs" style={{ color: "#9AA3AF" }}>27 دقيقة</span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Category page                                                     */
/* ================================================================== */
export default function CategoryPage() {
  const [activeSub, setActiveSub] = useState("الكل");
  const [bannerOpen, setBannerOpen] = useState(true);
  const nav = useNavigate();
  const { qty, add, inc, dec, subtotal, isFav, toggleFav } = useCart();

  const bottomRef = useRef(null);
  const [bottomH, setBottomH] = useState(70);
  useEffect(() => {
    const measure = () => bottomRef.current && setBottomH(bottomRef.current.offsetHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [bannerOpen]);

  const remaining = Math.max(0, FREE_AT - subtotal);
  const card = (p) => (
    <div key={p.id} onClick={() => nav("/product")} style={{ cursor: "pointer" }}>
      <ProductCard p={p} qty={qty(p.id)} onAdd={(e) => { e.stopPropagation(); add(p); }} onInc={(e) => { e.stopPropagation(); inc(p.id); }} onDec={(e) => { e.stopPropagation(); dec(p.id); }} fav={isFav(p.id)} onFav={(e) => { e.stopPropagation(); toggleFav(p); }} />
    </div>
  );

  return (
    <div className="qc-app min-h-screen" dir="rtl" lang="ar">
      <style>{STYLE}</style>

      {/* ===== HEADER ===== */}
      <div style={{ background: "#fff", borderBottom: "1px solid #F0F0F0" }}>
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => nav(-1)} className="icon-btn w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ border: "1px solid #ECECEC" }}><ArrowRight size={20} style={{ color: "#1A1A1A" }} /></button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold leading-tight truncate" style={{ color: "#1A1A1A" }}>{CATEGORY}</h1>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-sm font-bold" style={{ color: "#0C831F" }}>التوصيل إلى البيت:</span>
              <span className="text-sm truncate" style={{ color: "#5A6473", maxWidth: "42vw" }}>{ADDR}</span>
              <ChevronDown size={15} style={{ color: "#5A6473" }} />
            </div>
          </div>
          <button className="icon-btn w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ border: "1px solid #ECECEC" }}><Search size={19} style={{ color: "#1A1A1A" }} /></button>
          <button className="icon-btn w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ border: "1px solid #ECECEC" }}><Share2 size={18} style={{ color: "#1A1A1A" }} /></button>
        </div>
      </div>

      {/* ===== BODY: rail + grid ===== */}
      <div className="flex">
        {/* sub-category rail (right in RTL) */}
        <div className="no-scrollbar shrink-0" style={{ position: "sticky", top: 0, alignSelf: "flex-start", width: 86, maxHeight: "100dvh", overflowY: "auto", background: "#fff", borderInlineEnd: "1px solid #F1F2F4", paddingBottom: 90 }}>
          {SUBCATS.map((s) => {
            const on = activeSub === s.name;
            return (
              <button key={s.name} onClick={() => setActiveSub(s.name)} className="rail-item relative w-full flex flex-col items-center gap-1 py-3 px-1">
                {on && <span style={{ position: "absolute", insetInlineEnd: 0, top: 10, bottom: 10, width: 4, borderRadius: 4, background: "#0C831F" }} />}
                <div className="rounded-full flex items-center justify-center" style={{ width: 54, height: 54, background: on ? "#E8F5EA" : "#F4F6F9" }}><s.Icon size={26} strokeWidth={1.8} style={{ color: on ? "#0C831F" : "#6B7480" }} /></div>
                <span className="text-xs text-center leading-tight" style={{ fontWeight: on ? 800 : 600, color: on ? "#1A1A1A" : "#5A6473" }}>{s.name}</span>
              </button>
            );
          })}
        </div>

        {/* product column (left in RTL) */}
        <div className="flex-1 min-w-0">
          {/* sticky filter bar */}
          <div className="sticky top-0 z-20" style={{ background: "#fff", borderBottom: "1px solid #F2F3F5" }}>
            <div className="flex gap-2 overflow-x-auto no-scrollbar px-3 py-2.5">
              {FILTERS.map((f) => (
                <button key={f.label} className="chip rounded-lg flex items-center gap-1.5 shrink-0 text-sm font-bold" style={{ padding: "7px 12px" }}>
                  {f.Icon && <f.Icon size={15} />}{f.label}<ChevronDown size={15} />
                </button>
              ))}
            </div>
          </div>

          {/* seasonal collection block */}
          <div className="px-3 pt-4">
            <div className="rounded-2xl overflow-hidden" style={{ background: "#EAF6EA" }}>
              <div className="flex items-center justify-between gap-2 px-4 pt-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-extrabold leading-tight" style={{ color: "#1A1A1A" }}>فواكه الموسم الطازجة</h2>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: "#5A6473" }}>قيمة غذائية بكل قضمة</p>
                </div>
                <span style={{ fontSize: 40 }}>🧺</span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-5 p-3 pt-3">{SEASONAL.map(card)}</div>
            </div>
          </div>

          {/* main grid */}
          <section className="px-3 pt-6">
            <h2 className="text-lg font-extrabold mb-3 px-0.5" style={{ color: "#1A1A1A" }}>خضار مجمّدة</h2>
            <div className="grid grid-cols-2 gap-x-3 gap-y-5">{PRODUCTS.slice(0, 4).map(card)}</div>
          </section>

          {/* shop by brands */}
          <section className="px-3 pt-6">
            <div className="rounded-2xl p-4" style={{ background: "#FBF4E7" }}>
              <h2 className="text-lg font-extrabold mb-3" style={{ color: "#1A1A1A" }}>تسوّق حسب الماركة</h2>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {BRANDS.map((b) => (
                  <div key={b.name} className="shrink-0 flex flex-col items-center gap-1.5" style={{ width: 76 }}>
                    <div className="brand-card rounded-2xl flex items-center justify-center" style={{ width: 72, height: 72 }}>
                      <span className="font-extrabold text-lg" style={{ color: b.c }}>{b.name.slice(0, 2)}</span>
                    </div>
                    <span className="text-xs font-bold text-center" style={{ color: "#3A424E" }}>{b.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* more */}
          <section className="px-3 pt-6">
            <h2 className="text-lg font-extrabold mb-3 px-0.5" style={{ color: "#1A1A1A" }}>وصل حديثاً</h2>
            <div className="grid grid-cols-2 gap-x-3 gap-y-5">{PRODUCTS.slice(4).concat(PRODUCTS.slice(0, 2)).map((p, i) => <ProductCard key={"m" + p.id + i} p={p} qty={qty(p.id)} onAdd={() => add(p)} onInc={() => inc(p.id)} onDec={() => dec(p.id)} fav={isFav(p.id)} onFav={() => toggleFav(p)} />)}</div>
          </section>
        </div>
      </div>

      {/* spacer */}
      <div style={{ height: bottomH + 8 }} />

      {/* ===== bottom free-delivery banner (fixed) ===== */}
      <div ref={bottomRef} className="fixed left-0 right-0 bottom-0 z-50">
        {bannerOpen && (
          <div className="px-3 pb-3">
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
      </div>
    </div>
  );
}
