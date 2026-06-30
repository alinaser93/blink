import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "./cart.jsx";
import { useCatalog } from "./catalog.js";
import { emojiFor } from "./emoji.js";
import {
  ArrowRight, X, Mic, Search, Clock, TrendingUp, ChevronDown, ChevronLeft,
  SlidersHorizontal, ArrowUpDown, Heart, Plus, Minus, Star, Bike, Wheat,
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
.icon-btn:active { transform:scale(.92); }
.search-wrap { border:1px solid #E3E6EB; transition:box-shadow .15s ease, border-color .15s ease; }
.search-wrap:focus-within { border-color:#0C831F; box-shadow:0 0 0 3px rgba(12,131,31,.12); }
.chip { background:#fff; border:1px solid #E3E6EB; color:#2A2F36; transition:all .15s ease; }
.chip:hover { border-color:#0C831F; }
.trend-pill { background:#F4F6F9; border:1px solid #EAEEF3; color:#2A2F36; transition:all .15s ease; cursor:pointer; }
.trend-pill:hover { background:#E8F5EA; border-color:#0C831F; color:#0C831F; }
.sug-row { transition:background .12s ease; cursor:pointer; }
.sug-row:hover { background:#F7F8FA; }
.wish { box-shadow:0 1px 3px rgba(16,24,40,.18); transition:all .15s ease; }
.wish:active { transform:scale(.9); }
.add-btn { background:#fff; border:1px solid #0C831F; color:#0C831F; transition:all .15s ease; box-shadow:0 1px 3px rgba(16,24,40,.14); }
.add-btn:hover { background:#0C831F; color:#fff; }
.add-btn:active { transform:scale(.95); }
.stepper { background:#0C831F; color:#fff; box-shadow:0 1px 3px rgba(16,24,40,.14); }
.stepper-btn:hover { background:rgba(255,255,255,.18); }
.stepper-btn:active { transform:scale(.9); }
.brand-card { background:#fff; border:1px solid #ECEEF3; transition:transform .15s ease; cursor:pointer; }
.brand-card:hover { transform:translateY(-2px); }
.fb-card { background:#fff; border:1px solid #EEF0F3; box-shadow:0 8px 26px rgba(16,24,40,.12); }
.fb-x { transition:background .15s ease; }
.fb-x:hover { background:#F1F2F4; }
`;

/* ================================================================== */
/*  Data                                                              */
/* ================================================================== */
const TRENDING = ["سكر", "حليب", "خبز", "بيبسي", "شيبس", "موز", "بيض", "شاي", "قهوة", "ماء"];
const RECENT = ["حليب طازج", "ماء معدني", "موز"];
const FILTERS = [
  { label: "فلاتر", Icon: SlidersHorizontal }, { label: "ترتيب", Icon: ArrowUpDown },
  { label: "الكمية" }, { label: "السعر" },
];

const FREE_AT = 15000;
const iqd = (n) => Number(n).toLocaleString("en-US") + " د.ع";
const clamp2 = { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" };

/* ================================================================== */
/*  Rich product card (2-col results)                                 */
/* ================================================================== */
function ProductCard({ p, qty, onAdd, onInc, onDec }) {
  const off = p.mrp && p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
  return (
    <div className="flex flex-col">
      <div className="relative rounded-xl mb-2" style={{ aspectRatio: "1 / 1", background: (p.accent || "#9AA8B5") + "16", overflow: "hidden" }}>
        <div className="absolute inset-0 flex items-center justify-center" style={{ fontSize: 54 }}>{emojiFor(p.name)}</div>
        <button className="wish absolute rounded-full flex items-center justify-center" style={{ top: 8, insetInlineEnd: 8, width: 26, height: 26, background: "#fff" }}><Heart size={14} style={{ color: "#C7CDD6" }} /></button>
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
      {p.unit && <p className="text-xs font-semibold" style={{ color: "#9AA3AF" }}>{p.unit}</p>}
      <div className="flex items-baseline gap-1.5">
        <span className="text-base font-extrabold" style={{ color: "#1A1A1A" }}>{iqd(p.price)}</span>
        {off > 0 && <span className="text-xs line-through" style={{ color: "#9AA3AF" }}>{iqd(p.mrp)}</span>}
      </div>
      {off > 0 && <p className="text-xs font-bold mt-0.5" style={{ color: "#2563EB" }}>خصم {off}%</p>}
      <p className="text-sm leading-snug mt-1 font-medium" style={{ ...clamp2, color: "#2A2F36", minHeight: "2.5em" }}>{p.name}</p>
      <div className="flex items-center gap-1.5 mt-1.5">
        <Star size={12} fill="#F5B301" style={{ color: "#F5B301" }} />
        <span className="text-xs font-bold" style={{ color: "#3A424E" }}>{p.rating}</span>
        <span className="text-xs font-medium" style={{ color: "#9AA3AF" }}>({p.reviews})</span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="flex items-center gap-1"><Clock size={12} style={{ color: "#9AA3AF" }} /><span className="text-xs" style={{ color: "#9AA3AF" }}>17 دقيقة</span></span>
        {p.stock && <span className="text-xs font-bold" style={{ color: "#C9692E" }}>متبقّي {p.stock}</span>}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Search page                                                       */
/* ================================================================== */
export default function SearchPage() {
  const [sp] = useSearchParams();
  const initialQ = sp.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [submitted, setSubmitted] = useState(!!initialQ);
  const [bannerOpen, setBannerOpen] = useState(true);
  const inputRef = useRef(null);
  const nav = useNavigate();
  const { qty, add, inc, dec, subtotal } = useCart();
  const { products, tier1 } = useCatalog();

  useEffect(() => { inputRef.current && inputRef.current.focus(); }, []);

  const remaining = Math.max(0, FREE_AT - subtotal);

  const go = (term) => { setQuery(term); setSubmitted(true); };
  const onType = (e) => { setQuery(e.target.value); setSubmitted(false); };
  const clearQ = () => { setQuery(""); setSubmitted(false); inputRef.current && inputRef.current.focus(); };
  const openProduct = (p) => nav(`/product?id=${p.id}`);

  // نتائج فعلية من الكتالوج المشترك (بحث بالاسم/القسم/التفرّع)
  const q = query.trim();
  const results = useMemo(() => {
    if (!q) return [];
    return products.filter((p) => p.name.includes(q) || (p.cat && p.cat.includes(q)) || (p.sub && p.sub.includes(q)));
  }, [q, products]);
  const suggestions = useMemo(() => {
    const names = products.map((p) => p.name);
    const base = q ? names.filter((n) => n.includes(q)) : [];
    const out = base.length ? base : [q, ...TRENDING].filter(Boolean);
    return Array.from(new Set(out)).slice(0, 8);
  }, [q, products]);

  return (
    <div className="qc-app min-h-screen" dir="rtl" lang="ar">
      <style>{STYLE}</style>

      {/* ===== search bar ===== */}
      <div className="sticky top-0 z-30" style={{ background: "#fff", borderBottom: "1px solid #F1F2F4" }}>
        <div className="px-3 py-3">
          <div className="search-wrap flex items-center gap-2 rounded-xl px-3" style={{ background: "#fff", height: 48 }}>
            <button onClick={() => (submitted ? setSubmitted(false) : nav(-1))} className="icon-btn shrink-0"><ArrowRight size={20} style={{ color: "#1A1A1A" }} /></button>
            <input ref={inputRef} value={query} onChange={onType} onKeyDown={(e) => e.key === "Enter" && query && setSubmitted(true)} placeholder="دور على مسواگ، لحم، خضار..." className="flex-1 bg-transparent outline-none text-sm font-medium" style={{ color: "#1A1A1A" }} />
            {query && <button onClick={clearQ} className="icon-btn rounded-full p-0.5 shrink-0" style={{ background: "#E5E8EC" }}><X size={15} style={{ color: "#5A6473" }} /></button>}
            <span style={{ width: 1, height: 22, background: "#E3E6EB" }} />
            <Mic size={19} style={{ color: "#0C831F" }} className="shrink-0" />
          </div>
        </div>
      </div>

      {submitted && query ? (
        /* ============ RESULTS ============ */
        <>
          <div className="sticky z-20" style={{ top: 72, background: "#fff", borderBottom: "1px solid #F2F3F5" }}>
            <div className="flex gap-2 overflow-x-auto no-scrollbar px-3 py-2.5">
              {FILTERS.map((f) => (
                <button key={f.label} className="chip rounded-lg flex items-center gap-1.5 shrink-0 text-sm font-bold" style={{ padding: "7px 12px" }}>{f.Icon && <f.Icon size={15} />}{f.label}<ChevronDown size={15} /></button>
              ))}
            </div>
          </div>

          <section className="px-3 pt-4">
            <div className="flex items-baseline justify-between mb-3 px-0.5">
              <h2 className="text-base font-extrabold" style={{ color: "#1A1A1A" }}>نتائج «{query}»</h2>
              <span className="text-sm font-semibold" style={{ color: "#9AA3AF" }}>{results.length} منتج</span>
            </div>
            {results.length === 0 ? (
              <p className="text-center text-sm py-12" style={{ color: "#AEB6BF" }}>لا توجد نتائج مطابقة — جرّب كلمة أخرى</p>
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-5">{results.slice(0, 4).map((p) => (
                <div key={p.id} onClick={() => openProduct(p)} style={{ cursor: "pointer" }}><ProductCard p={p} qty={qty(p.id)} onAdd={(e) => { e.stopPropagation(); add(p); }} onInc={(e) => { e.stopPropagation(); inc(p.id); }} onDec={(e) => { e.stopPropagation(); dec(p.id); }} /></div>
              ))}</div>
            )}
          </section>

          {tier1.length > 0 && (
            <section className="px-3 pt-6">
              <div className="rounded-2xl p-4" style={{ background: "#FBF4E7" }}>
                <h2 className="text-lg font-extrabold mb-3" style={{ color: "#1A1A1A" }}>تصفّح الأقسام</h2>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                  {tier1.map((c) => (
                    <button key={c.id} onClick={() => nav(`/category?cat=${c.id}`)} className="shrink-0 flex flex-col items-center gap-1.5" style={{ width: 80 }}>
                      <div className="brand-card rounded-2xl flex items-center justify-center" style={{ width: 76, height: 76, fontSize: 34 }}>{emojiFor(c.name)}</div>
                      <span className="text-xs font-bold text-center leading-tight" style={{ color: "#3A424E" }}>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {results.length > 4 && (
            <section className="px-3 pt-6">
              <div className="grid grid-cols-2 gap-x-3 gap-y-5">{results.slice(4).map((p) => (
                <div key={p.id} onClick={() => openProduct(p)} style={{ cursor: "pointer" }}><ProductCard p={p} qty={qty(p.id)} onAdd={(e) => { e.stopPropagation(); add(p); }} onInc={(e) => { e.stopPropagation(); inc(p.id); }} onDec={(e) => { e.stopPropagation(); dec(p.id); }} /></div>
              ))}</div>
            </section>
          )}

          <div style={{ height: 90 }} />
        </>
      ) : query ? (
        /* ============ SUGGESTIONS ============ */
        <div className="pt-1 pb-24">
          {suggestions.map((s, i) => (
            <button key={s + i} onClick={() => go(s)} className="sug-row w-full flex items-center gap-3 px-4 py-3">
              <div className="rounded-lg flex items-center justify-center shrink-0" style={{ width: 40, height: 40, background: "#F3F5F8" }}><Wheat size={20} style={{ color: "#B0986A" }} /></div>
              <span className="text-base text-right flex-1" style={{ color: "#2A2F36" }}>{s}</span>
              <Search size={16} style={{ color: "#C7CDD6" }} />
            </button>
          ))}
        </div>
      ) : (
        /* ============ EMPTY: trending + recent ============ */
        <div className="px-4 pt-5 pb-24">
          <div className="flex items-center gap-2 mb-3"><TrendingUp size={18} style={{ color: "#0C831F" }} /><h2 className="text-base font-extrabold" style={{ color: "#1A1A1A" }}>عمليات بحث شائعة</h2></div>
          <div className="flex flex-wrap gap-2 mb-7">
            {TRENDING.map((t) => <button key={t} onClick={() => go(t)} className="trend-pill rounded-full text-sm font-bold" style={{ padding: "8px 16px" }}>{t}</button>)}
          </div>

          <h2 className="text-base font-extrabold mb-1" style={{ color: "#1A1A1A" }}>عمليات بحث سابقة</h2>
          <div>
            {RECENT.map((r) => (
              <button key={r} onClick={() => go(r)} className="sug-row w-full flex items-center gap-3 py-3">
                <Clock size={18} style={{ color: "#9AA3AF" }} className="shrink-0" />
                <span className="text-base text-right flex-1" style={{ color: "#2A2F36" }}>{r}</span>
                <X size={16} style={{ color: "#C7CDD6" }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===== bottom free-delivery banner (results only) ===== */}
      {submitted && query && (
        <div className="fixed left-0 right-0 bottom-0 z-50">
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
      )}
    </div>
  );
}
