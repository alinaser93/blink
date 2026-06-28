import React, { useState } from "react";
import {
  ArrowRight, Search, Share2, ChevronLeft, Heart, Plus, Minus,
  Mic, PhoneOff, BellOff, Gift, CreditCard, Wallet, Banknote, Star, Clock,
  Check, Home, Drumstick, Carrot, Leaf, Apple, Sprout, Milk, Tag,
} from "lucide-react";

/* ================================================================== */
/*  Styles                                                            */
/* ================================================================== */
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
.qc-app, .qc-app * { font-family:'Cairo', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif; -webkit-font-smoothing:antialiased; }
.qc-app { background:#F4F6F9; color:#1A1A1A; }
.no-scrollbar::-webkit-scrollbar { display:none; }
.no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
.icon-btn { transition:all .15s ease; }
.icon-btn:hover { background:#F3F4F6; }
.icon-btn:active { transform:scale(.92); }
.card { background:#fff; }
.wish { box-shadow:0 1px 3px rgba(16,24,40,.18); transition:all .15s ease; }
.wish:active { transform:scale(.9); }
.add-btn { background:#fff; border:1px solid #0C831F; color:#0C831F; transition:all .15s ease; box-shadow:0 1px 3px rgba(16,24,40,.14); }
.add-btn:hover { background:#0C831F; color:#fff; }
.add-btn:active { transform:scale(.95); }
.stepper { background:#0C831F; color:#fff; box-shadow:0 1px 3px rgba(16,24,40,.14); }
.stepper-btn:hover { background:rgba(255,255,255,.18); }
.stepper-btn:active { transform:scale(.9); }
.opt-card { background:#F6F7F9; border:1.5px solid #ECEEF2; transition:all .15s ease; cursor:pointer; }
.opt-card.on { border-color:#0C831F; background:#EAF6EC; }
.tip-card { background:#fff; border:1.5px solid #E6E9EE; transition:all .15s ease; cursor:pointer; }
.tip-card.on { border-color:#0C831F; background:#EAF6EC; color:#0C831F; }
.pill-link { background:#EAF6EC; color:#0C831F; transition:background .15s ease; }
.pill-link:hover { background:#D7EEDB; }
.pay-row { background:#fff; transition:background .12s ease; cursor:pointer; }
.pay-row:hover { background:#FAFBFC; }
.cta { background:#0C831F; color:#fff; transition:all .15s ease; box-shadow:0 6px 18px rgba(12,131,31,.3); }
.cta:hover { background:#0A7019; }
.cta:active { transform:scale(.99); }
.linkrow { transition:background .12s ease; cursor:pointer; }
.linkrow:hover { background:#FAFBFC; }
`;

/* ================================================================== */
/*  Data                                                              */
/* ================================================================== */
const CART_INIT = [
  { id: 1, name: "جزر برتقالي", weight: "200 غرام", price: 750, mrp: 900, qty: 1, Icon: Carrot, accent: "#E08A2E" },
  { id: 2, name: "فاصوليا خضراء", weight: "250 غرام", price: 1350, mrp: 1750, qty: 1, Icon: Leaf, accent: "#2E9B4F" },
  { id: 3, name: "طماطم هجينة", weight: "500 غرام", price: 1900, mrp: 2350, qty: 1, Icon: Apple, accent: "#D33A3A" },
];
const SUGGEST = [
  { id: 11, name: "باقة كزبرة طازجة", weight: "100 غرام", price: 950, mrp: 1100, stock: 4, seeMore: true, Icon: Leaf, accent: "#2E9B4F" },
  { id: 12, name: "دجاج مقطّع للطبخ", weight: "450 غرام", price: 9950, rating: "4.4", reviews: "48 ألف", tags: ["11 قطعة"], allLabel: "كل الدجاج الطازج", Icon: Drumstick, accent: "#C9692E" },
  { id: 13, name: "بروكلي طازج", weight: "300 غرام", price: 5450, mrp: 6400, allLabel: "كل المستورد", Icon: Sprout, accent: "#2E9B4F" },
  { id: 14, name: "جبنة شيدر مبشورة", weight: "200 غرام", price: 6000, mrp: 7000, Icon: Milk, accent: "#D9A521" },
  { id: 15, name: "حليب طازج كامل الدسم", weight: "500 مل", price: 1500, mrp: 1750, Icon: Milk, accent: "#2B7A9B" },
  { id: 16, name: "زنجبيل طازج", weight: "200 غرام", price: 3250, mrp: 4000, Icon: Sprout, accent: "#C9923E" },
];
const TIPS = [
  { amt: 1000, e: "😄" }, { amt: 1500, e: "🤩" }, { amt: 2500, e: "😍" },
];
const HANDLING = 500;
const FREE_AT = 15000;
const iqd = (n) => Number(n).toLocaleString("en-US") + " د.ع";
const clamp2 = { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" };

/* ================================================================== */
/*  Rich product card (suggestions)                                   */
/* ================================================================== */
function ProductCard({ p, qty, onAdd, onInc, onDec }) {
  const off = p.mrp && p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
  return (
    <div className="flex flex-col">
      <div className="relative rounded-xl mb-2" style={{ aspectRatio: "1 / 1", background: "#F3F5F8", overflow: "hidden" }}>
        <div className="absolute inset-0 flex items-center justify-center"><p.Icon size={44} style={{ color: p.accent || "#9AA8B5", opacity: 0.28 }} /></div>
        <button className="wish absolute rounded-full flex items-center justify-center" style={{ top: 6, insetInlineEnd: 6, width: 24, height: 24, background: "#fff" }}><Heart size={13} style={{ color: "#C7CDD6" }} /></button>
        <span className="absolute flex items-center justify-center" style={{ bottom: 42, insetInlineEnd: 8, width: 16, height: 16, borderRadius: 3, border: "1.5px solid #1A7A33", background: "#fff" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#1A7A33" }} /></span>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between" style={{ padding: 6 }}>
          <span className="rounded-md text-xs font-bold" style={{ background: "rgba(255,255,255,.94)", color: "#3A424E", padding: "2px 6px" }}>{p.weight}</span>
          {qty === 0 ? (
            <button onClick={onAdd} className="add-btn rounded-lg" style={{ padding: "8px 16px" }}><span className="text-sm" style={{ fontWeight: 800 }}>أضف</span></button>
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
      {off > 0 && <p className="text-xs font-bold mt-0.5" style={{ color: "#2563EB" }}>خصم {off}%</p>}
      <p className="text-xs leading-snug mt-1 font-medium" style={{ ...clamp2, color: "#2A2F36", minHeight: "2.4em" }}>{p.name}</p>
      {p.tags && <div className="flex flex-wrap gap-1 mt-1.5">{p.tags.map((t) => <span key={t} style={{ background: "#F3F4F8", color: "#5A6473", padding: "1px 6px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{t}</span>)}</div>}
      {p.rating && <div className="flex items-center gap-1 mt-1.5"><Star size={11} fill="#F5B301" style={{ color: "#F5B301" }} /><span className="text-xs font-bold" style={{ color: "#3A424E" }}>{p.rating}</span><span className="text-xs font-medium" style={{ color: "#9AA3AF" }}>({p.reviews})</span></div>}
      <div className="flex items-center gap-2 mt-1"><span className="flex items-center gap-1"><Clock size={11} style={{ color: "#9AA3AF" }} /><span className="text-xs" style={{ color: "#9AA3AF" }}>17 دقيقة</span></span>{p.stock && <span className="text-xs font-bold" style={{ color: "#C9692E" }}>متبقّي {p.stock}</span>}</div>
      {(p.allLabel || p.seeMore) && <button className="pill-link inline-flex items-center gap-1 rounded-lg mt-2 text-xs font-bold" style={{ padding: "5px 10px", width: "fit-content" }}>{p.allLabel ? p.allLabel : "شوف المزيد"} <ChevronLeft size={13} /></button>}
    </div>
  );
}

/* ================================================================== */
/*  Cart / Checkout                                                   */
/* ================================================================== */
export default function CartPage() {
  const [view, setView] = useState("cart");
  const [items, setItems] = useState(CART_INIT);
  const [extra, setExtra] = useState({});
  const [tip, setTip] = useState(0);
  const [instr, setInstr] = useState({ call: false, bell: false });
  const [pay, setPay] = useState("cod");

  const setQty = (id, d) => setItems((arr) => arr.map((it) => it.id === id ? { ...it, qty: it.qty + d } : it).filter((it) => it.qty > 0));
  const addExtra = (id) => setExtra((m) => ({ ...m, [id]: (m[id] || 0) + 1 }));
  const incExtra = (id) => setExtra((m) => ({ ...m, [id]: (m[id] || 0) + 1 }));
  const decExtra = (id) => setExtra((m) => { const q = (m[id] || 0) - 1; const n = { ...m }; if (q <= 0) delete n[id]; else n[id] = q; return n; });

  const extraItems = SUGGEST.filter((p) => extra[p.id]).map((p) => ({ ...p, qty: extra[p.id] }));
  const allItems = [...items, ...extraItems];
  const itemsTotal = allItems.reduce((s, it) => s + it.price * it.qty, 0);
  const savings = allItems.reduce((s, it) => s + ((it.mrp || it.price) - it.price) * it.qty, 0);
  const delivery = itemsTotal >= FREE_AT || itemsTotal === 0 ? 0 : 2000;
  const toPay = itemsTotal + delivery + HANDLING + tip;

  /* ---------------- PAYMENT VIEW ---------------- */
  if (view === "pay") {
    const WALLETS = [{ n: "زين كاش", c: "#7A4FA0" }, { n: "آسيا حوالة", c: "#2E9B4F" }, { n: "فاست باي", c: "#E0552E" }, { n: "قي كارد", c: "#23306E" }];
    return (
      <div className="qc-app min-h-screen" dir="rtl" lang="ar">
        <style>{STYLE}</style>
        <div className="sticky top-0 z-30" style={{ background: "#F4F6F9" }}>
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => setView("cart")} className="icon-btn w-10 h-10 rounded-full flex items-center justify-center shrink-0"><ArrowRight size={20} /></button>
            <h1 className="text-lg font-extrabold">إجمالي الفاتورة: {iqd(toPay)}</h1>
          </div>
        </div>

        <div className="px-3 pt-2 space-y-3 pb-28">
          <div className="card rounded-2xl overflow-hidden">
            <p className="text-base font-extrabold px-4 pt-4 pb-2">الدفع عند الاستلام</p>
            <button onClick={() => setPay("cod")} className={"opt-card m-3 mt-0 rounded-xl w-auto flex items-center gap-3 p-3 " + (pay === "cod" ? "on" : "")} style={{ width: "calc(100% - 24px)" }}>
              <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#fff" }}><Banknote size={22} style={{ color: "#1A7A33" }} /></span>
              <div className="flex-1 text-right"><p className="text-sm font-extrabold">نقداً عند الاستلام</p><p className="text-xs" style={{ color: "#7A8493" }}>ادفع الكاش وقت توصيل الطلب</p></div>
              <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ border: "2px solid " + (pay === "cod" ? "#0C831F" : "#C7CDD6"), background: pay === "cod" ? "#0C831F" : "#fff" }}>{pay === "cod" && <Check size={14} color="#fff" strokeWidth={3} />}</span>
            </button>
          </div>

          <div className="card rounded-2xl overflow-hidden">
            <p className="text-base font-extrabold px-4 pt-4 pb-1">البطاقات</p>
            <div className="pay-row flex items-center gap-3 px-4 py-3">
              <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#F1F2F4" }}><CreditCard size={20} style={{ color: "#5A6473" }} /></span>
              <p className="flex-1 text-sm font-bold">أضف بطاقة ائتمان أو خصم</p>
              <span className="text-sm font-extrabold" style={{ color: "#0C831F" }}>أضف</span>
            </div>
          </div>

          <div className="card rounded-2xl overflow-hidden">
            <p className="text-base font-extrabold px-4 pt-4 pb-1">المحافظ الإلكترونية</p>
            {WALLETS.map((w, i) => (
              <div key={w.n} className="pay-row flex items-center gap-3 px-4 py-3" style={{ borderTop: i ? "1px solid #F1F2F4" : "none" }}>
                <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: w.c + "1A" }}><Wallet size={20} style={{ color: w.c }} /></span>
                <p className="flex-1 text-sm font-bold">{w.n}</p>
                <span className="text-sm font-extrabold" style={{ color: "#0C831F" }}>ربط</span>
              </div>
            ))}
          </div>
        </div>

        <div className="fixed left-0 right-0 bottom-0 z-50" style={{ background: "#fff", borderTop: "1px solid #ECECEC", boxShadow: "0 -6px 20px rgba(16,24,40,.07)" }}>
          <div className="px-4 py-3">
            <button className="cta w-full rounded-xl text-base font-extrabold flex items-center justify-center gap-2" style={{ padding: "15px" }}>تأكيد الطلب · {iqd(toPay)}</button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- CART VIEW ---------------- */
  return (
    <div className="qc-app min-h-screen" dir="rtl" lang="ar">
      <style>{STYLE}</style>

      {/* header */}
      <div className="sticky top-0 z-30" style={{ background: "#fff", borderBottom: "1px solid #F1F2F4" }}>
        <div className="flex items-center gap-3 px-4 py-3">
          <button className="icon-btn w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ border: "1px solid #ECECEC" }}><ArrowRight size={20} /></button>
          <h1 className="flex-1 text-xl font-extrabold">السلة</h1>
          <button className="icon-btn w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ border: "1px solid #ECECEC" }}><Search size={19} /></button>
          <button className="icon-btn rounded-full flex items-center gap-1.5 shrink-0" style={{ border: "1px solid #ECECEC", padding: "8px 14px" }}><Share2 size={16} /><span className="text-sm font-bold">مشاركة</span></button>
        </div>
      </div>

      <div className="pb-40">
        {/* cart items */}
        <div className="card mt-2 mx-3 rounded-2xl px-3">
          {items.length === 0 && <p className="text-center py-8 text-sm" style={{ color: "#7A8493" }}>سلّتك فارغة</p>}
          {items.map((it, i) => (
            <div key={it.id} className="flex items-start gap-3 py-3" style={{ borderTop: i ? "1px solid #F2F3F5" : "none" }}>
              <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: 64, height: 64, background: "#F3F5F8" }}><it.Icon size={30} style={{ color: it.accent, opacity: 0.5 }} /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-tight" style={{ color: "#1A1A1A" }}>{it.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "#7A8493" }}>{it.weight}</p>
                <button className="text-xs mt-1 font-semibold" style={{ color: "#9AA3AF", textDecoration: "underline" }}>نقل إلى المفضّلة</button>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="stepper rounded-lg overflow-hidden flex items-center">
                  <button onClick={() => setQty(it.id, -1)} className="stepper-btn" style={{ padding: "6px 10px" }}><Minus size={14} strokeWidth={2.8} /></button>
                  <span className="text-sm font-extrabold" style={{ width: 20, textAlign: "center" }}>{it.qty}</span>
                  <button onClick={() => setQty(it.id, 1)} className="stepper-btn" style={{ padding: "6px 10px" }}><Plus size={14} strokeWidth={2.8} /></button>
                </div>
                <div className="flex items-baseline gap-1.5">
                  {it.mrp > it.price && <span className="text-xs line-through" style={{ color: "#9AA3AF" }}>{iqd(it.mrp * it.qty)}</span>}
                  <span className="text-sm font-extrabold">{iqd(it.price * it.qty)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* bill details */}
        <div className="card mt-3 mx-3 rounded-2xl p-4">
          <h2 className="text-base font-extrabold mb-3">تفاصيل الفاتورة</h2>
          <Row label="إجمالي المنتجات" value={iqd(itemsTotal)} />
          <Row label="رسوم التوصيل" value={delivery === 0 ? "مجاني" : iqd(delivery)} green={delivery === 0} />
          <Row label="رسوم المناولة" value={iqd(HANDLING)} />
          {tip > 0 && <Row label="إكرامية الكابتن" value={iqd(tip)} />}
          <div className="flex items-center justify-between pt-3 mt-1" style={{ borderTop: "1px dashed #E3E6EB" }}>
            <span className="text-base font-extrabold">المجموع للدفع</span>
            <span className="text-base font-extrabold">{iqd(toPay)}</span>
          </div>
          {savings > 0 && (
            <div className="flex items-center gap-2 mt-3 rounded-xl px-3 py-2" style={{ background: "#EAF6EC" }}>
              <Tag size={15} style={{ color: "#0C831F" }} />
              <span className="text-xs font-extrabold" style={{ color: "#0C831F" }}>وفّرت {iqd(savings)} على هذا الطلب</span>
            </div>
          )}
        </div>

        {/* you might also like */}
        <section className="mt-4 px-3">
          <h2 className="text-lg font-extrabold mb-3 px-0.5">قد يعجبك أيضاً</h2>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-x-2.5 gap-y-5">
            {SUGGEST.map((p) => <ProductCard key={p.id} p={p} qty={extra[p.id] || 0} onAdd={() => addExtra(p.id)} onInc={() => incExtra(p.id)} onDec={() => decExtra(p.id)} />)}
          </div>
        </section>

        {/* delivery instructions */}
        <section className="card mt-4 mx-3 rounded-2xl p-4">
          <h2 className="text-base font-extrabold mb-3">تعليمات التوصيل</h2>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
            <div className="shrink-0 rounded-xl p-3 flex flex-col gap-2" style={{ width: 130, background: "#F6F7F9" }}>
              <Mic size={20} style={{ color: "#0C831F" }} /><span className="text-sm font-bold leading-tight">سجّل تعليمات صوتية</span>
            </div>
            <button onClick={() => setInstr((s) => ({ ...s, call: !s.call }))} className={"opt-card shrink-0 rounded-xl p-3 flex flex-col gap-2 " + (instr.call ? "on" : "")} style={{ width: 130 }}>
              <div className="flex items-center justify-between"><PhoneOff size={20} style={{ color: "#5A6473" }} /><span className="w-5 h-5 rounded flex items-center justify-center" style={{ border: "2px solid " + (instr.call ? "#0C831F" : "#C7CDD6"), background: instr.call ? "#0C831F" : "#fff" }}>{instr.call && <Check size={12} color="#fff" strokeWidth={3} />}</span></div>
              <span className="text-sm font-bold text-right">تجنّب الاتصال</span>
            </button>
            <button onClick={() => setInstr((s) => ({ ...s, bell: !s.bell }))} className={"opt-card shrink-0 rounded-xl p-3 flex flex-col gap-2 " + (instr.bell ? "on" : "")} style={{ width: 130 }}>
              <div className="flex items-center justify-between"><BellOff size={20} style={{ color: "#5A6473" }} /><span className="w-5 h-5 rounded flex items-center justify-center" style={{ border: "2px solid " + (instr.bell ? "#0C831F" : "#C7CDD6"), background: instr.bell ? "#0C831F" : "#fff" }}>{instr.bell && <Check size={12} color="#fff" strokeWidth={3} />}</span></div>
              <span className="text-sm font-bold text-right">لا تقرع الجرس</span>
            </button>
          </div>
        </section>

        {/* tip */}
        <section className="card mt-4 mx-3 rounded-2xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h2 className="text-base font-extrabold">إكرامية للكابتن</h2>
              <p className="text-xs mt-1 leading-snug" style={{ color: "#7A8493" }}>لطفك يعني الكثير! ١٠٠٪ من الإكرامية تروح مباشرة للكابتن.</p>
            </div>
            <span style={{ fontSize: 40 }}>🛵</span>
          </div>
          <div className="flex gap-2 mt-3">
            {TIPS.map((t) => (
              <button key={t.amt} onClick={() => setTip(tip === t.amt ? 0 : t.amt)} className={"tip-card rounded-xl flex items-center gap-1 text-sm font-extrabold " + (tip === t.amt ? "on" : "")} style={{ padding: "8px 12px" }}>
                <span>{t.e}</span> {iqd(t.amt)}
              </button>
            ))}
            <button className="tip-card rounded-xl flex items-center gap-1 text-sm font-extrabold" style={{ padding: "8px 12px" }}>👏 مخصّص</button>
          </div>
        </section>

        {/* gift packaging */}
        <div className="card mt-4 mx-3 rounded-2xl p-4 flex items-center gap-3">
          <Gift size={22} style={{ color: "#9AA3AF" }} />
          <div><p className="text-sm font-extrabold">تغليف هدية</p><p className="text-xs" style={{ color: "#9AA3AF" }}>غير متوفّر حالياً في موقعك</p></div>
        </div>

        {/* cancellation policy */}
        <div className="card mt-4 mx-3 rounded-2xl p-4">
          <h2 className="text-base font-extrabold mb-1">سياسة الإلغاء</h2>
          <p className="text-xs leading-relaxed" style={{ color: "#7A8493" }}>بعد تأكيد الطلب، أي إلغاء قد يترتّب عليه رسوم. وفي حال التأخير غير المتوقّع المؤدّي لإلغاء الطلب، راح يتم استرجاع كامل المبلغ.</p>
        </div>
      </div>

      {/* bottom: address + pay button */}
      <div className="fixed left-0 right-0 bottom-0 z-50" style={{ background: "#fff", borderTop: "1px solid #ECECEC", boxShadow: "0 -6px 20px rgba(16,24,40,.07)" }}>
        <div className="linkrow flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: "1px solid #F2F3F5" }}>
          <Home size={26} style={{ color: "#E0A800" }} />
          <div className="flex-1 min-w-0"><p className="text-sm font-extrabold">التوصيل إلى البيت</p><p className="text-xs truncate" style={{ color: "#7A8493" }}>علي، السماوة، شارع الكورنيش...</p></div>
          <span className="text-sm font-extrabold shrink-0" style={{ color: "#0C831F" }}>تغيير</span>
        </div>
        <div className="px-4 py-3">
          <button onClick={() => setView("pay")} className="cta w-full rounded-xl text-base font-extrabold flex items-center justify-between" style={{ padding: "14px 18px" }}>
            <span>{iqd(toPay)}</span>
            <span className="flex items-center gap-1">اختر طريقة الدفع <ChevronLeft size={18} /></span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, green }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm" style={{ color: "#5A6473" }}>{label}</span>
      <span className="text-sm font-bold" style={{ color: green ? "#0C831F" : "#1A1A1A" }}>{value}</span>
    </div>
  );
}
