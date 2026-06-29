import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./cart.jsx";
import {
  ArrowRight, Search, Share2, ChevronLeft, Heart, Plus, Minus,
  Mic, PhoneOff, BellOff, Gift, CreditCard, Wallet, Banknote, Star, Clock,
  Check, Home, Drumstick, Carrot, Leaf, Apple, Sprout, Milk, Tag,
  Bike, X, Info, ShoppingBag, Briefcase, Users,
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
.cta:disabled { opacity:.7; cursor:default; }
.linkrow { transition:background .12s ease; cursor:pointer; }
.linkrow:hover { background:#FAFBFC; }
@keyframes pop { 0%{transform:scale(.4);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1)} }
.pop { animation:pop .42s cubic-bezier(.2,.7,.3,1); }
.fill { transition:width .35s cubic-bezier(.4,.1,.2,1); }
@keyframes ovfade { from{opacity:0} to{opacity:1} }
.ovfade { animation:ovfade .2s ease; }
`;

/* ================================================================== */
/*  Data                                                              */
/* ================================================================== */
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
const MIN_CART = 6000;
const SMALL_CART_FEE = 1000;

// أكواد خصم تجريبية شغّالة
const COUPONS = {
  WASEL:   { type: "freedel", label: "توصيل مجاني" },
  AHLAN15: { type: "pct", pct: 15, cap: 5000, label: "خصم ١٥٪" },
  KASH3:   { type: "flat", amt: 3000, min: 6000, label: "−3000 د.ع" },
};
// عناوين محفوظة (نفس نمط الرئيسية)
const ADDRESSES = [
  { id: "samawah", label: "البيت", line: "السماوة، شارع الكورنيش", Icon: Home },
  { id: "baghdad", label: "الدوام", line: "بغداد، المنصور", Icon: Briefcase },
  { id: "najaf", label: "بيت الأهل", line: "النجف، حي السعد", Icon: Users },
];

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
  const cart = useCart();
  const nav = useNavigate();
  const [view, setView] = useState("cart");
  const [tip, setTip] = useState(0);
  const [instr, setInstr] = useState({ call: false, bell: false });
  const [pay, setPay] = useState("cod");
  const [coupon, setCoupon] = useState(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponErr, setCouponErr] = useState("");
  const [feesInfo, setFeesInfo] = useState(false);
  const [addrId, setAddrId] = useState("samawah");
  const [addrOpen, setAddrOpen] = useState(false);
  const [placed, setPlaced] = useState(false);
  const timerRef = useRef(null);

  const items = cart.list;
  const itemsTotal = cart.subtotal;

  /* ---- bill math (single source for both views) ---- */
  const productSavings = items.reduce((s, it) => s + ((it.mrp || it.price) - it.price) * it.qty, 0);
  const cc = coupon ? COUPONS[coupon] : null;
  let couponSaving = 0;
  if (cc && itemsTotal > 0) {
    if (cc.type === "pct") couponSaving = Math.min(Math.round(itemsTotal * cc.pct / 100), cc.cap);
    else if (cc.type === "flat") couponSaving = itemsTotal >= cc.min ? cc.amt : 0;
  }
  const discountedItems = Math.max(0, itemsTotal - (coupon === "WASEL" ? 0 : couponSaving));
  const baseDelivery = itemsTotal === 0 ? 0 : itemsTotal >= FREE_AT ? 0 : 2000;
  const delivery = coupon === "WASEL" && itemsTotal > 0 ? 0 : baseDelivery;
  const deliverySaving = coupon === "WASEL" && itemsTotal > 0 ? baseDelivery : 0;
  const smallFee = itemsTotal > 0 && itemsTotal < MIN_CART ? SMALL_CART_FEE : 0;
  const handling = items.length ? HANDLING : 0;
  const toPay = discountedItems + delivery + handling + smallFee + tip;
  const totalSavings = productSavings + (coupon === "WASEL" ? 0 : couponSaving) + deliverySaving;
  const remaining = Math.max(0, FREE_AT - itemsTotal);
  const selectedAddr = ADDRESSES.find((a) => a.id === addrId) || ADDRESSES[0];

  /* ---- effects ---- */
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);
  useEffect(() => {
    if (coupon && (itemsTotal === 0 || (coupon === "KASH3" && itemsTotal < MIN_CART))) {
      setCoupon(null); setCouponInput(""); setCouponErr("");
    }
  }, [itemsTotal, coupon]);

  /* ---- handlers ---- */
  const applyCoupon = (raw) => {
    const code = String(raw).trim().toUpperCase();
    const c = COUPONS[code];
    if (!c || itemsTotal === 0) { setCoupon(null); setCouponErr("الكود مو صحيح أو ما ينطبق على طلبك"); return; }
    if (c.type === "flat" && itemsTotal < c.min) { setCoupon(null); setCouponErr("هذا الكود يحتاج طلب بـ " + iqd(c.min) + " أو أكثر"); return; }
    setCoupon(code); setCouponErr(""); setCouponOpen(false); setCouponInput("");
  };
  const removeCoupon = () => { setCoupon(null); setCouponInput(""); setCouponErr(""); };
  const placeOrder = () => {
    if (placed) return;
    setPlaced(true);
    timerRef.current = setTimeout(() => { cart.clear(); nav("/track"); }, 1600);
  };

  /* ================================================================ */
  /*  PAYMENT VIEW                                                     */
  /* ================================================================ */
  if (view === "pay") {
    if (!items.length && !placed) {
      // حماية: لا يمكن تأكيد طلب فارغ
      return (
        <div className="qc-app min-h-screen flex flex-col items-center justify-center px-6" dir="rtl" lang="ar">
          <style>{STYLE}</style>
          <div className="rounded-full flex items-center justify-center mb-4" style={{ width: 88, height: 88, background: "#F3F5F8" }}><ShoppingBag size={40} style={{ color: "#C7CDD6" }} /></div>
          <p className="text-base font-extrabold">سلّتك فارغة</p>
          <button onClick={() => { setView("cart"); nav("/"); }} className="cta rounded-xl text-sm font-extrabold mt-4" style={{ padding: "12px 26px" }}>تسوّق الآن</button>
        </div>
      );
    }
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
          {/* delivery destination */}
          <div className="card rounded-2xl flex items-center gap-3 px-4 py-3">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FFF6E0" }}><selectedAddr.Icon size={20} style={{ color: "#E0A800" }} /></span>
            <div className="flex-1 min-w-0"><p className="text-sm font-extrabold">التوصيل إلى {selectedAddr.label}</p><p className="text-xs truncate" style={{ color: "#7A8493" }}>{selectedAddr.line}</p></div>
            <span className="inline-flex items-center gap-1 text-xs font-bold rounded-full px-2.5 py-1" style={{ background: "#EAF6EC", color: "#0C831F" }}><Clock size={12} /> ~12 دقيقة</span>
          </div>

          <div className="card rounded-2xl overflow-hidden">
            <p className="text-base font-extrabold px-4 pt-4 pb-2">الدفع عند الاستلام</p>
            <button onClick={() => setPay("cod")} className={"opt-card m-3 mt-0 rounded-xl w-auto flex items-center gap-3 p-3 " + (pay === "cod" ? "on" : "")} style={{ width: "calc(100% - 24px)" }}>
              <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#fff" }}><Banknote size={22} style={{ color: "#1A7A33" }} /></span>
              <div className="flex-1 text-start"><p className="text-sm font-extrabold">نقداً عند الاستلام</p><p className="text-xs" style={{ color: "#7A8493" }}>ادفع الكاش وقت توصيل الطلب</p></div>
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
            <button onClick={placeOrder} disabled={placed} className="cta w-full rounded-xl text-base font-extrabold flex items-center justify-center gap-2" style={{ padding: "15px" }}>تأكيد الطلب · {iqd(toPay)}</button>
          </div>
        </div>

        {/* order-placed celebration */}
        {placed && (
          <div className="ovfade fixed inset-0 flex items-center justify-center px-8" style={{ background: "rgba(16,24,40,.55)", zIndex: 60 }}>
            <div className="card rounded-3xl text-center px-7 py-8" style={{ maxWidth: 340, boxShadow: "0 24px 60px rgba(16,24,40,.3)" }}>
              <div className="pop rounded-full flex items-center justify-center mx-auto" style={{ width: 76, height: 76, background: "#EAF6EC", border: "3px solid #0C831F" }}><Check size={40} strokeWidth={3} style={{ color: "#0C831F" }} /></div>
              <h2 className="text-xl font-extrabold mt-4">تم تأكيد طلبك! 🎉</h2>
              <p className="text-sm mt-1" style={{ color: "#5A6473" }}>يوصلك خلال ~12 دقيقة · الدفع عند الاستلام</p>
              <p className="text-xs mt-2 truncate" style={{ color: "#9AA3AF" }}>{selectedAddr.label} · {selectedAddr.line}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ================================================================ */
  /*  CART VIEW — empty state                                         */
  /* ================================================================ */
  if (items.length === 0) {
    return (
      <div className="qc-app min-h-screen" dir="rtl" lang="ar">
        <style>{STYLE}</style>
        <div className="sticky top-0 z-30" style={{ background: "#fff", borderBottom: "1px solid #F1F2F4" }}>
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => nav(-1)} className="icon-btn w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ border: "1px solid #ECECEC" }}><ArrowRight size={20} /></button>
            <h1 className="flex-1 text-xl font-extrabold">السلة</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center px-8 text-center" style={{ minHeight: "70vh" }}>
          <div className="rounded-full flex items-center justify-center" style={{ width: 110, height: 110, background: "#F3F5F8" }}><ShoppingBag size={48} style={{ color: "#C7CDD6" }} /></div>
          <p className="text-lg font-extrabold mt-5">سلّتك فارغة</p>
          <p className="text-sm mt-1" style={{ color: "#7A8493" }}>ابدأ التسوّق وخلّي نوصّلك بأقل من ١٥ دقيقة</p>
          <button onClick={() => nav("/")} className="cta rounded-xl text-base font-extrabold mt-5" style={{ padding: "14px 32px" }}>تسوّق الآن</button>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  CART VIEW                                                        */
  /* ================================================================ */
  const couponChipText = coupon === "WASEL" && baseDelivery === 0
    ? "التوصيل أصلاً مجاني"
    : "وفّرت " + iqd(couponSaving > 0 ? couponSaving : deliverySaving);

  return (
    <div className="qc-app min-h-screen" dir="rtl" lang="ar">
      <style>{STYLE}</style>

      {/* header */}
      <div className="sticky top-0 z-30" style={{ background: "#fff", borderBottom: "1px solid #F1F2F4" }}>
        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          <button onClick={() => nav(-1)} className="icon-btn w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ border: "1px solid #ECECEC" }}><ArrowRight size={20} /></button>
          <h1 className="flex-1 text-xl font-extrabold">السلة</h1>
          <button className="icon-btn w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ border: "1px solid #ECECEC" }}><Search size={19} /></button>
          <button className="icon-btn rounded-full flex items-center gap-1.5 shrink-0" style={{ border: "1px solid #ECECEC", padding: "8px 14px" }}><Share2 size={16} /><span className="text-sm font-bold">مشاركة</span></button>
        </div>
        <div className="px-4 pb-2.5">
          <span className="pill-link inline-flex items-center gap-1.5 rounded-full text-xs font-bold" style={{ padding: "5px 12px" }}><Clock size={14} /> التوصيل خلال ~12 دقيقة</span>
        </div>
      </div>

      <div className="pb-44">
        {/* cart items */}
        <div className="card mt-2 mx-3 rounded-2xl px-3">
          {items.map((it, i) => (
            <div key={it.id} className="flex items-start gap-3 py-3" style={{ borderTop: i ? "1px solid #F2F3F5" : "none" }}>
              <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: 64, height: 64, background: "#F3F5F8" }}><it.Icon size={30} style={{ color: it.accent, opacity: 0.5 }} /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-tight" style={{ color: "#1A1A1A" }}>{it.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "#7A8493" }}>{it.weight}</p>
                <button onClick={() => cart.remove(it.id)} className="text-xs mt-1 font-semibold" style={{ color: "#9AA3AF", textDecoration: "underline" }}>إزالة من السلة</button>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="stepper rounded-lg overflow-hidden flex items-center">
                  <button onClick={() => cart.dec(it.id)} className="stepper-btn" style={{ padding: "6px 10px" }}><Minus size={14} strokeWidth={2.8} /></button>
                  <span className="text-sm font-extrabold" style={{ width: 20, textAlign: "center" }}>{it.qty}</span>
                  <button onClick={() => cart.inc(it.id)} className="stepper-btn" style={{ padding: "6px 10px" }}><Plus size={14} strokeWidth={2.8} /></button>
                </div>
                <div className="flex items-baseline gap-1.5">
                  {it.mrp > it.price && <span className="text-xs line-through" style={{ color: "#9AA3AF" }}>{iqd(it.mrp * it.qty)}</span>}
                  <span className="text-sm font-extrabold">{iqd(it.price * it.qty)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* coupon */}
        <div className="card mt-3 mx-3 rounded-2xl p-4">
          {coupon ? (
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "#EAF6EC" }}>
              <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#D7EEDB" }}><Check size={17} strokeWidth={3} style={{ color: "#0C831F" }} /></span>
              <div className="flex-1 min-w-0"><p className="text-sm font-extrabold" style={{ color: "#0C831F" }}>تم تطبيق {coupon}</p><p className="text-xs" style={{ color: "#3A8A4A" }}>{couponChipText}</p></div>
              <button onClick={removeCoupon} className="icon-btn rounded-full flex items-center justify-center shrink-0" style={{ width: 28, height: 28, background: "#fff" }}><X size={16} style={{ color: "#5A6473" }} /></button>
            </div>
          ) : !couponOpen ? (
            <button onClick={() => { setCouponOpen(true); setCouponErr(""); }} className="linkrow w-full flex items-center gap-3 rounded-xl">
              <Tag size={20} style={{ color: "#0C831F" }} />
              <span className="flex-1 text-sm font-extrabold text-start">أضف كود خصم</span>
              <ChevronLeft size={18} style={{ color: "#9AA3AF" }} />
            </button>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <input
                  autoFocus value={couponInput}
                  onChange={(e) => { setCouponInput(e.target.value); if (couponErr) setCouponErr(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") applyCoupon(couponInput); }}
                  placeholder="اكتب كود الخصم..." className="flex-1 rounded-xl outline-none text-sm font-bold text-start"
                  style={{ border: "1.5px solid #ECEEF2", height: 42, padding: "0 12px", textTransform: "uppercase", minWidth: 0 }}
                />
                <button onClick={() => applyCoupon(couponInput)} className="add-btn rounded-xl text-sm font-extrabold shrink-0" style={{ padding: "11px 18px" }}>تطبيق</button>
              </div>
              {couponErr && <p className="text-xs font-bold mt-2" style={{ color: "#D33A3A" }}>{couponErr}</p>}
              <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3">
                {Object.keys(COUPONS).map((k) => (
                  <button key={k} onClick={() => applyCoupon(k)} className="pill-link shrink-0 inline-flex items-center gap-1.5 rounded-lg text-xs font-extrabold" style={{ padding: "7px 12px" }}>
                    <Tag size={12} /> {COUPONS[k].label} · {k}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* free-delivery nudge + bill details */}
        <div className="card mt-3 mx-3 rounded-2xl overflow-hidden">
          {/* nudge */}
          <div style={{ background: delivery === 0 ? "#EAF6EC" : "#EFF4FF", padding: "10px 14px" }}>
            <div className="flex items-center gap-2">
              <span className="rounded-lg flex items-center justify-center shrink-0" style={{ width: 26, height: 26, background: delivery === 0 ? "#D7EEDB" : "#DCE8FF" }}>
                {delivery === 0 ? <Check size={15} strokeWidth={3} style={{ color: "#0C831F" }} /> : <Bike size={15} style={{ color: "#2563EB" }} />}
              </span>
              <p className="text-xs font-bold flex-1 leading-tight" style={{ color: delivery === 0 ? "#0C831F" : "#2B59C3" }}>
                {delivery === 0 ? "🎉 توصيلك صار مجاني!" : <>أضف بـ <b>{iqd(remaining)}</b> وتوصيلك يصير مجاني</>}
              </p>
            </div>
            <div className="mt-1.5 rounded-full overflow-hidden" style={{ height: 6, background: delivery === 0 ? "#CBE7D0" : "#D5E2FB" }}>
              <div className="fill h-full rounded-full" style={{ width: Math.max(7, Math.min(100, (itemsTotal / FREE_AT) * 100)) + "%", background: delivery === 0 ? "#0C831F" : "#2563EB" }} />
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-extrabold">تفاصيل الفاتورة</h2>
              <button onClick={() => setFeesInfo((v) => !v)} className="pill-link inline-flex items-center gap-1 rounded-full text-xs font-bold" style={{ padding: "4px 10px" }}><Info size={12} /> ليش هذي الرسوم؟</button>
            </div>
            {feesInfo && (
              <p className="text-xs leading-relaxed mb-3 rounded-xl p-3" style={{ color: "#5A6473", background: "#F6F7F9" }}>
                <b>المناولة</b>: تجهيز وتعبئة طلبك. <b>التوصيل</b>: مجاني فوق {iqd(FREE_AT)}، وإلا 2,000 د.ع. <b>رسوم السلة الصغيرة</b>: تنطبق على الطلبات تحت {iqd(MIN_CART)} وتُلغى بزيادة الطلب.
              </p>
            )}
            <Row label="إجمالي المنتجات" value={iqd(itemsTotal)} />
            {smallFee > 0 && <Row label="رسوم سلة صغيرة" value={iqd(smallFee)} />}
            {smallFee > 0 && <p className="text-xs mb-1" style={{ color: "#7A8493" }}>أضف بـ {iqd(MIN_CART - itemsTotal)} لتلغي رسوم السلة الصغيرة</p>}
            <Row label="رسوم التوصيل" value={delivery === 0 ? "مجاني" : iqd(delivery)} green={delivery === 0} />
            <Row label="رسوم المناولة" value={iqd(handling)} />
            {couponSaving > 0 && <Row label={"خصم · " + coupon} value={"− " + iqd(couponSaving)} green />}
            {tip > 0 && <Row label="إكرامية الكابتن" value={iqd(tip)} />}
            <div className="flex items-center justify-between pt-3 mt-1" style={{ borderTop: "1px dashed #E3E6EB" }}>
              <span className="text-base font-extrabold">المجموع للدفع</span>
              <span className="text-base font-extrabold">{iqd(toPay)}</span>
            </div>
            {totalSavings > 0 && (
              <div className="flex items-center gap-2 mt-3 rounded-xl px-3 py-2" style={{ background: "#EAF6EC" }}>
                <Tag size={15} style={{ color: "#0C831F" }} />
                <span className="text-xs font-extrabold" style={{ color: "#0C831F" }}>وفّرت {iqd(totalSavings)} الكلّي على هذا الطلب</span>
              </div>
            )}
          </div>
        </div>

        {/* you might also like */}
        <section className="mt-4 px-3">
          <h2 className="text-lg font-extrabold mb-3 px-0.5">قد يعجبك أيضاً</h2>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-x-2.5 gap-y-5">
            {SUGGEST.map((p) => <ProductCard key={p.id} p={p} qty={cart.qty(p.id)} onAdd={() => cart.add(p)} onInc={() => cart.inc(p.id)} onDec={() => cart.dec(p.id)} />)}
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
              <span className="text-sm font-bold text-start">تجنّب الاتصال</span>
            </button>
            <button onClick={() => setInstr((s) => ({ ...s, bell: !s.bell }))} className={"opt-card shrink-0 rounded-xl p-3 flex flex-col gap-2 " + (instr.bell ? "on" : "")} style={{ width: 130 }}>
              <div className="flex items-center justify-between"><BellOff size={20} style={{ color: "#5A6473" }} /><span className="w-5 h-5 rounded flex items-center justify-center" style={{ border: "2px solid " + (instr.bell ? "#0C831F" : "#C7CDD6"), background: instr.bell ? "#0C831F" : "#fff" }}>{instr.bell && <Check size={12} color="#fff" strokeWidth={3} />}</span></div>
              <span className="text-sm font-bold text-start">لا تقرع الجرس</span>
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

        {/* cancellation policy */}
        <div className="card mt-4 mx-3 rounded-2xl p-4">
          <h2 className="text-base font-extrabold mb-1">سياسة الإلغاء</h2>
          <p className="text-xs leading-relaxed" style={{ color: "#7A8493" }}>بعد تأكيد الطلب، أي إلغاء قد يترتّب عليه رسوم. وفي حال التأخير غير المتوقّع المؤدّي لإلغاء الطلب، راح يتم استرجاع كامل المبلغ.</p>
        </div>
      </div>

      {/* bottom: address picker + pay button */}
      {addrOpen && <div className="fixed inset-0" style={{ zIndex: 40 }} onClick={() => setAddrOpen(false)} />}
      <div className="fixed left-0 right-0 bottom-0 z-50" style={{ background: "#fff", borderTop: "1px solid #ECECEC", boxShadow: "0 -6px 20px rgba(16,24,40,.07)" }}>
        {addrOpen && (
          <div className="no-scrollbar" style={{ borderBottom: "1px solid #F2F3F5", maxHeight: 280, overflowY: "auto" }}>
            <p className="px-4 pt-3 pb-1 text-xs font-bold" style={{ color: "#9AA3AF" }}>اختر عنوان التوصيل</p>
            {ADDRESSES.map((a) => {
              const on = a.id === addrId;
              return (
                <button key={a.id} onClick={() => { setAddrId(a.id); setAddrOpen(false); }} className="linkrow w-full flex items-center gap-3 px-4 py-3 text-start">
                  <a.Icon size={20} style={{ color: on ? "#1A7A33" : "#9AA3AF" }} />
                  <div className="flex-1 min-w-0"><p className="text-sm font-bold">{a.label}</p><p className="text-xs truncate" style={{ color: "#7A8493" }}>{a.line}</p></div>
                  {on && <Check size={18} style={{ color: "#0C831F" }} />}
                </button>
              );
            })}
          </div>
        )}
        <div onClick={() => setAddrOpen((o) => !o)} className="linkrow flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: "1px solid #F2F3F5" }}>
          <selectedAddr.Icon size={26} style={{ color: "#E0A800" }} />
          <div className="flex-1 min-w-0"><p className="text-sm font-extrabold">التوصيل إلى {selectedAddr.label}</p><p className="text-xs truncate" style={{ color: "#7A8493" }}>{selectedAddr.line}</p></div>
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
