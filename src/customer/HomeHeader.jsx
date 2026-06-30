import React, { useState, useEffect, useRef } from "react";
import { MapPin, ChevronDown, Wallet, User, Search, Mic, ShoppingBag, Headphones, Sparkles, Lamp, Baby, Gift, Globe } from "lucide-react";

/* ====================================================================
 *  HomeHeader — ترويسة لاصقة ديناميكية بنمط Blinkit (مكوّن مستقل)
 *  ٣ صفوف: (١) وقت التوصيل/العنوان + الحساب  (٢) شريط بحث بكتابة حيّة
 *  (٣) تبويبات أفقية بأيقونات + حبّة للتبويب النشط. خلفية الترويسة كاملةً
 *  تتبدّل بسلاسة بين تدرّجات الأقسام (cross-fade حقيقي بين التدرّجات).
 * ==================================================================== */

// الأقسام السبعة الثابتة بأسماء عربية + تدرّج لون لكل قسم (حسب المواصفات)
export const HEADER_CATS = [
  { id: "all",         label: "الكل",       Icon: ShoppingBag, g1: "#FCE4C4", g2: "#F59E0B", text: "#3A2A0A" },
  { id: "electronics", label: "إلكترونيات", Icon: Headphones,  g1: "#1E3A8A", g2: "#3B82F6", text: "#FFFFFF" },
  { id: "beauty",      label: "الجمال",     Icon: Sparkles,    g1: "#FBCFE8", g2: "#EC4899", text: "#7A1F45" },
  { id: "decor",       label: "ديكور",      Icon: Lamp,        g1: "#FDBA74", g2: "#EA580C", text: "#5A2406" },
  { id: "kids",        label: "أطفال",      Icon: Baby,        g1: "#BAE6FD", g2: "#0284C7", text: "#0B3B5C" },
  { id: "gifting",     label: "هدايا",      Icon: Gift,        g1: "#E9D5FF", g2: "#A855F7", text: "#4B1D7A" },
  { id: "imported",    label: "مستورد",     Icon: Globe,       g1: "#FEF3C7", g2: "#D97706", text: "#5A3206" },
];
export const headerGrad = (c) => `linear-gradient(180deg, ${c.g1} 0%, ${c.g2} 135%)`;
export const headerCat = (id) => HEADER_CATS.find((c) => c.id === id) || HEADER_CATS[0];

// اقتراحات البحث (تأثير كتابة حيّ — typewriter)
const HINTS = ["تمارين منزلية", "أجهزة المطبخ", "أحمر شفاه", "آيس كريم", "حفّاظات أطفال", "شموع معطّرة", "عطر فاخر", "سماعات بلوتوث"];

const STYLE = `
.qc-header * { -webkit-font-smoothing:antialiased; }
.no-scrollbar::-webkit-scrollbar { display:none; }
.no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
.hdr-band { position:relative; isolation:isolate; }
.hdr-layers { position:absolute; inset:0; z-index:0; overflow:hidden; pointer-events:none; }
.hdr-layer { position:absolute; inset:0; transition:opacity .5s ease-in-out; will-change:opacity; }
.hdr-pop { position:absolute; top:100%; inset-inline-start:16px; inset-inline-end:16px; margin-top:8px; animation:hdrFade .15s ease; box-shadow:0 18px 40px rgba(0,0,0,.18); }
@media (min-width:640px){ .hdr-pop{ inset-inline-end:auto; width:20rem; } }
.hdr-loc-item { transition:background .12s ease; }
.hdr-loc-item:hover { background:#F3F4F6; }
@keyframes hdrFade { from{opacity:0} to{opacity:1} }
.hdr-search:focus-within { box-shadow:0 0 0 3px rgba(255,255,255,.45); }
.hdr-search { transition:box-shadow .15s ease; }
.hdr-tab { transition:background .3s ease, color .3s ease, transform .15s ease, opacity .2s ease; }
.hdr-tab:active { transform:scale(.94); }
.hdr-icnbtn { transition:transform .15s ease; }
.hdr-icnbtn:active { transform:scale(.92); }
.tw-cursor { display:inline-block; width:2px; margin-inline-start:1px; animation:twBlink 1s step-end infinite; }
@keyframes twBlink { 50%{ opacity:0; } }
`;

/* تأثير الكتابة الحيّة: يكتب الكلمة حرفاً حرفاً ثم يمسحها وينتقل للتالية */
function useTypewriter(words, { typeMs = 95, deleteMs = 45, holdMs = 1200, gapMs = 350 } = {}) {
  const [i, setI] = useState(0);
  const [sub, setSub] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const word = words[i % words.length];
    let t;
    if (!del && sub < word.length) t = setTimeout(() => setSub(sub + 1), typeMs);
    else if (!del && sub === word.length) t = setTimeout(() => setDel(true), holdMs);
    else if (del && sub > 0) t = setTimeout(() => setSub(sub - 1), deleteMs);
    else t = setTimeout(() => { setDel(false); setI((v) => v + 1); }, gapMs);
    return () => clearTimeout(t);
  }, [sub, del, i, words, typeMs, deleteMs, holdMs, gapMs]);
  return words[i % words.length].slice(0, sub);
}

function GradientLayers({ value }) {
  return (
    <div className="hdr-layers" aria-hidden="true">
      {HEADER_CATS.map((c) => (
        <div key={c.id} className="hdr-layer" style={{ background: headerGrad(c), opacity: c.id === value ? 1 : 0 }} />
      ))}
    </div>
  );
}

export default function HomeHeader({ value, onChange, top = {}, addresses = [], addrId, onAddr, onSearch }) {
  const active = headerCat(value);
  const txt = active.text;
  const onDark = txt === "#FFFFFF";
  const [locOpen, setLocOpen] = useState(false);
  const typed = useTypewriter(HINTS);
  const address = addresses.find((a) => a.id === addrId) || addresses[0] || { label: "", line: "" };
  // تمرير التبويب النشط ليظهر بالكامل عند التبديل
  const activeRef = useRef(null);
  useEffect(() => { activeRef.current && activeRef.current.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); }, [value]);

  return (
    <div className="qc-header" dir="rtl">
      <style>{STYLE}</style>

      {/* ===== الصف ١: وقت التوصيل/العنوان + الحساب (يمرّ مع التمرير) ===== */}
      <div className="hdr-band">
        <GradientLayers value={value} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-3 pb-2.5">
          <div className="flex items-start justify-between gap-3">
            <button onClick={() => setLocOpen((v) => !v)} className="min-w-0 text-start" style={{ maxWidth: "72%" }}>
              <p className="text-xs font-bold" style={{ color: txt, opacity: 0.85 }}>{top.label || "التوصيل خلال"}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <h1 className="font-black leading-none truncate" style={{ color: txt, fontSize: 28 }}>{top.value || "16 دقيقة"}</h1>
                {top.badge ? <span className="text-xs font-bold rounded-full px-2 py-0.5 shrink-0" style={{ background: onDark ? "rgba(255,255,255,.2)" : "rgba(0,0,0,.1)", color: txt }}>{top.badge}</span> : null}
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <MapPin size={14} className="shrink-0" style={{ color: txt, opacity: 0.9 }} />
                <span className="text-sm truncate" style={{ color: txt }}><span style={{ fontWeight: 800 }}>{address.label}</span><span style={{ opacity: 0.85 }}> - {address.line}</span></span>
                <ChevronDown size={16} className="shrink-0" style={{ color: txt, transform: locOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
              </div>
            </button>
            <div className="flex items-center gap-2 shrink-0 mt-1">
              <button className="hdr-icnbtn w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#FFFFFF" }}><Wallet size={20} style={{ color: "#0C831F" }} /></button>
              <button className="hdr-icnbtn w-10 h-10 rounded-full flex items-center justify-center" style={{ background: onDark ? "rgba(255,255,255,.22)" : "rgba(0,0,0,.16)" }}><User size={20} style={{ color: txt }} /></button>
            </div>
          </div>

          {locOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setLocOpen(false)} />
              <div className="hdr-pop rounded-2xl z-50 overflow-hidden" style={{ background: "#fff", border: "1px solid #EFEFEF" }}>
                <p className="px-4 pt-3 pb-1 text-xs font-bold" style={{ color: "#9AA3AF" }}>اختر عنوان التوصيل</p>
                {addresses.map((a) => (
                  <button key={a.id} onClick={() => { onAddr && onAddr(a.id); setLocOpen(false); }} className="hdr-loc-item w-full flex items-start gap-3 px-4 py-3">
                    <MapPin size={18} style={{ color: a.id === addrId ? "#0C831F" : "#9AA3AF", marginTop: 2 }} />
                    <div className="min-w-0 flex-1"><p className="text-sm font-bold" style={{ color: "#1A1A1A" }}>{a.label}</p><p className="text-xs truncate" style={{ color: "#6B7280" }}>{a.line}</p></div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ===== الصفّان ٢+٣: البحث + التبويبات (لاصقة) ===== */}
      <div className="hdr-band sticky top-0 z-30" style={{ boxShadow: "0 6px 16px rgba(20,20,20,.12)" }}>
        <GradientLayers value={value} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-2 pb-2">
          {/* الصف ٢: شريط البحث */}
          <button onClick={onSearch} className="hdr-search w-full flex items-center gap-2.5 rounded-xl px-3 text-start" style={{ background: "#FFFFFF", height: 46 }}>
            <Search size={20} style={{ color: "#9AA3AF" }} />
            <span className="flex-1 text-sm font-medium truncate" style={{ color: "#3A424E" }}>
              <span style={{ color: "#9AA3AF" }}>ابحث عن </span>«{typed}<span className="tw-cursor" style={{ borderInlineEnd: "2px solid #0C831F" }} />»
            </span>
            <Mic size={18} style={{ color: "#0C831F" }} />
          </button>

          {/* الصف ٣: التبويبات (حبّة للنشط) */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar mt-2.5 pb-0.5">
            {HEADER_CATS.map((c) => {
              const on = c.id === value;
              return (
                <button key={c.id} ref={on ? activeRef : null} onClick={() => onChange(c.id)} className="hdr-tab flex flex-col items-center gap-1 shrink-0" style={{ minWidth: "4.5rem", padding: "6px 8px", borderRadius: 16, background: on ? "rgba(255,255,255,.94)" : "transparent", boxShadow: on ? "0 6px 16px rgba(0,0,0,.14)" : "none", opacity: on ? 1 : 0.82 }}>
                  <c.Icon size={22} strokeWidth={on ? 2.6 : 2} style={{ color: on ? c.g2 : txt }} />
                  <span className="text-xs whitespace-nowrap" style={{ color: on ? c.g2 : txt, fontWeight: on ? 800 : 600 }}>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
