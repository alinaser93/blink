import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Phone, MessageSquare, Clock, ChevronLeft, Home, Star, Headphones } from "lucide-react";

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
.qc-app, .qc-app * { font-family:'Cairo', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif; -webkit-font-smoothing:antialiased; }
.qc-app { background:#F4F6F9; color:#1A1A1A; }
.icon-btn { transition:all .15s ease; }
.icon-btn:hover { background:#F3F4F6; }
.icon-btn:active { transform:scale(.92); }
.card { background:#fff; }
.call-btn { background:#0C831F; color:#fff; transition:all .15s ease; box-shadow:0 4px 12px rgba(12,131,31,.3); }
.call-btn:active { transform:scale(.93); }
.msg-btn { background:#F1F2F4; color:#3A424E; transition:all .15s ease; }
.msg-btn:hover { background:#E7E9ED; }
.msg-btn:active { transform:scale(.93); }
.support-row { background:#fff; transition:background .12s ease; cursor:pointer; }
.support-row:hover { background:#FAFBFC; }
.rider-pulse { animation:rp 1.5s ease-in-out infinite; transform-origin:center; }
@keyframes rp { 0%,100%{ filter:drop-shadow(0 0 0 rgba(12,131,31,.45)); } 50%{ filter:drop-shadow(0 0 7px rgba(12,131,31,.55)); } }
.bar-fill { animation:bf 2.2s ease-in-out infinite; }
@keyframes bf { 0%{ opacity:.55;} 50%{ opacity:1;} 100%{ opacity:.55;} }
`;

function TrackMap() {
  return (
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }}>
      <rect width="400" height="320" fill="#E9EDF1" />
      <rect x="20" y="20" width="80" height="56" rx="10" fill="#D6E8CC" />
      <rect x="300" y="240" width="84" height="64" rx="10" fill="#D6E8CC" />
      <path d="M0,140 C120,124 190,170 400,150 L400,180 C190,200 120,156 0,168 Z" fill="#CFE3EC" />
      <g fill="#E1E5EA">
        <rect x="150" y="30" width="64" height="46" rx="6" /><rect x="244" y="40" width="54" height="40" rx="6" />
        <rect x="40" y="210" width="70" height="48" rx="6" /><rect x="170" y="230" width="62" height="56" rx="6" />
      </g>
      <g stroke="#FBFCFD" strokeWidth="14" strokeLinecap="round">
        <line x1="0" y1="90" x2="400" y2="104" /><line x1="0" y1="208" x2="400" y2="222" />
        <line x1="120" y1="0" x2="138" y2="320" /><line x1="296" y1="0" x2="312" y2="320" />
      </g>
      {/* route */}
      <path d="M66,64 C150,82 120,150 210,168 C290,184 300,236 338,256" fill="none" stroke="#0C831F" strokeWidth="6" strokeLinecap="round" />
      <path d="M66,64 C150,82 120,150 210,168" fill="none" stroke="#0C831F" strokeWidth="6" strokeLinecap="round" strokeDasharray="1 11" stroke-opacity="0" />
      {/* store marker */}
      <circle cx="66" cy="64" r="17" fill="#fff" stroke="#0C831F" strokeWidth="3" />
      <text x="66" y="72" fontSize="20" textAnchor="middle">🏪</text>
      {/* home marker */}
      <circle cx="338" cy="256" r="17" fill="#fff" stroke="#E0A800" strokeWidth="3" />
      <text x="338" y="263" fontSize="19" textAnchor="middle">🏠</text>
      {/* rider marker */}
      <g className="rider-pulse">
        <circle cx="210" cy="168" r="19" fill="#0C831F" />
        <text x="210" y="176" fontSize="20" textAnchor="middle">🛵</text>
      </g>
    </svg>
  );
}

const STEPS = ["تم التأكيد", "قيد التجهيز", "خرج للتوصيل", "تم التوصيل"];
const ACTIVE = 2; // 0-indexed: "خرج للتوصيل"
const ITEMS = [
  { n: "جزر برتقالي", e: "🥕" }, { n: "فاصوليا خضراء", e: "🫛" }, { n: "طماطم هجينة", e: "🍅" },
];
const iqd = (n) => Number(n).toLocaleString("en-US") + " د.ع";
const pad = (n) => String(n).padStart(2, "0");

export default function OrderTrackingScreen() {
  const nav = useNavigate();
  const [secs, setSecs] = useState(8 * 60);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const mins = Math.floor(secs / 60);

  return (
    <div className="qc-app min-h-screen" dir="rtl" lang="ar">
      <style>{STYLE}</style>

      {/* map */}
      <div className="relative" style={{ height: "38vh", minHeight: 260, background: "#E9EDF1" }}>
        <TrackMap />
        <button onClick={() => nav("/")} className="icon-btn absolute w-10 h-10 rounded-full flex items-center justify-center" style={{ top: 14, insetInlineStart: 14, background: "#fff", boxShadow: "0 2px 8px rgba(16,24,40,.18)" }}><ArrowRight size={20} /></button>
        <div className="absolute" style={{ top: 16, insetInlineStart: "50%", transform: "translateX(50%)" }}>
          <span className="text-xs font-extrabold rounded-full inline-flex items-center gap-1" style={{ background: "#1A1A1A", color: "#fff", padding: "6px 12px" }}><Clock size={13} /> الوصول خلال {mins} دقيقة</span>
        </div>
      </div>

      {/* sheet */}
      <div style={{ background: "#F4F6F9", borderTopLeftRadius: 22, borderTopRightRadius: 22, marginTop: -18, position: "relative", zIndex: 5 }}>
        {/* ETA + progress */}
        <div className="card mx-3 mt-3 rounded-2xl p-4" style={{ marginTop: 14 }}>
          <p className="text-sm font-bold" style={{ color: "#7A8493" }}>يوصل طلبك خلال</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl font-extrabold" style={{ color: "#0C831F" }}>{secs > 0 ? mins + " دقائق" : "وصل الكابتن!"}</span>
            {secs > 0 && <span className="text-sm font-bold" style={{ color: "#9AA3AF" }}>({pad(mins)}:{pad(secs % 60)})</span>}
          </div>
          <div className="flex gap-1.5 mt-3">
            {STEPS.map((_, i) => (
              <div key={i} className={i <= ACTIVE ? "bar-fill" : ""} style={{ flex: 1, height: 6, borderRadius: 4, background: i <= ACTIVE ? "#0C831F" : "#E3E6EB" }} />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((s, i) => (
              <span key={s} className="text-xs font-bold" style={{ color: i <= ACTIVE ? "#0C831F" : "#B0B7C0", flex: 1, textAlign: i === 0 ? "right" : i === STEPS.length - 1 ? "left" : "center" }}>{s}</span>
            ))}
          </div>
        </div>

        {/* rider card */}
        <div className="card mx-3 mt-3 rounded-2xl p-4 flex items-center gap-3">
          <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: 52, height: 52, background: "#EAF6EC", color: "#0C831F", fontWeight: 800, fontSize: 20 }}>ع</div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-extrabold leading-tight">علي حسن</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-bold" style={{ color: "#7A8493" }}>كابتن التوصيل</span>
              <span className="flex items-center gap-0.5"><Star size={11} fill="#F5B301" style={{ color: "#F5B301" }} /><span className="text-xs font-bold" style={{ color: "#3A424E" }}>4.9</span></span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "#9AA3AF" }}>دراجة • ١٢٣٤ بغداد</p>
          </div>
          <button className="msg-btn w-11 h-11 rounded-full flex items-center justify-center shrink-0"><MessageSquare size={19} /></button>
          <button className="call-btn w-11 h-11 rounded-full flex items-center justify-center shrink-0"><Phone size={19} /></button>
        </div>

        {/* order summary */}
        <div className="card mx-3 mt-3 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-extrabold">طلبك · {ITEMS.length} منتجات</h2>
            <span className="text-sm font-extrabold">{iqd(4000)}</span>
          </div>
          <div className="flex gap-2">
            {ITEMS.map((it) => (
              <div key={it.n} className="flex flex-col items-center gap-1" style={{ width: 64 }}>
                <div className="rounded-xl flex items-center justify-center" style={{ width: 56, height: 56, background: "#F3F5F8", fontSize: 26 }}>{it.e}</div>
                <span className="text-xs font-semibold text-center leading-tight" style={{ color: "#5A6473" }}>{it.n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* address */}
        <div className="card mx-3 mt-3 rounded-2xl p-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FFF6E0" }}><Home size={20} style={{ color: "#E0A800" }} /></span>
          <div className="flex-1 min-w-0"><p className="text-sm font-extrabold">التوصيل إلى البيت</p><p className="text-xs truncate" style={{ color: "#7A8493" }}>علي، السماوة، شارع الكورنيش، المثنى</p></div>
        </div>

        {/* support */}
        <div className="support-row card mx-3 mt-3 rounded-2xl p-4 flex items-center gap-3" style={{ marginBottom: 16 }}>
          <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#EFF1F4" }}><Headphones size={20} style={{ color: "#5A6473" }} /></span>
          <p className="flex-1 text-sm font-bold">تحتاج مساعدة بطلبك؟</p>
          <ChevronLeft size={20} style={{ color: "#9AA3AF" }} />
        </div>
      </div>
    </div>
  );
}
