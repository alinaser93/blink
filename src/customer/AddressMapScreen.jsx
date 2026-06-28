import React, { useState } from "react";
import { ArrowRight, Search, MapPin, LocateFixed, Home, Briefcase, ChevronLeft } from "lucide-react";

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
.qc-app, .qc-app * { font-family:'Cairo', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif; -webkit-font-smoothing:antialiased; }
.qc-app { background:#FFFFFF; color:#1A1A1A; }
.icon-btn { transition:all .15s ease; }
.icon-btn:hover { background:#F3F4F6; }
.icon-btn:active { transform:scale(.92); }
.search-wrap { border:1px solid #E3E6EB; transition:box-shadow .15s ease, border-color .15s ease; }
.search-wrap:focus-within { border-color:#0C831F; box-shadow:0 0 0 3px rgba(12,131,31,.12); }
.loc-btn { background:#fff; box-shadow:0 4px 16px rgba(16,24,40,.16); transition:all .15s ease; }
.loc-btn:hover { background:#F7FBF8; }
.loc-btn:active { transform:scale(.97); }
.type-chip { background:#fff; border:1.5px solid #E3E6EB; transition:all .15s ease; cursor:pointer; }
.type-chip.on { border-color:#0C831F; background:#EAF6EC; color:#0C831F; }
.cta { background:#0C831F; color:#fff; transition:all .15s ease; box-shadow:0 6px 18px rgba(12,131,31,.3); }
.cta:hover { background:#0A7019; }
.cta:active { transform:scale(.99); }
.pin-bounce { animation:pinB 1.6s ease-in-out infinite; }
@keyframes pinB { 0%,100%{ transform:translate(-50%,-100%) translateY(0);} 50%{ transform:translate(-50%,-100%) translateY(-7px);} }
.pin-shadow { animation:pinS 1.6s ease-in-out infinite; }
@keyframes pinS { 0%,100%{ transform:translate(-50%,-50%) scale(1); opacity:.32;} 50%{ transform:translate(-50%,-50%) scale(.7); opacity:.18;} }
`;

function FauxMap() {
  return (
    <svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }}>
      <rect width="400" height="600" fill="#E9EDF1" />
      <rect x="18" y="36" width="96" height="76" rx="12" fill="#D6E8CC" />
      <rect x="276" y="436" width="104" height="96" rx="12" fill="#D6E8CC" />
      <path d="M0,250 C120,228 190,300 400,268 L400,312 C190,344 120,272 0,292 Z" fill="#CFE3EC" />
      <g fill="#E1E5EA">
        <rect x="150" y="58" width="72" height="60" rx="7" /><rect x="250" y="66" width="62" height="52" rx="7" />
        <rect x="40" y="384" width="82" height="60" rx="7" /><rect x="176" y="430" width="74" height="74" rx="7" />
        <rect x="60" y="150" width="60" height="48" rx="7" /><rect x="300" y="170" width="70" height="58" rx="7" />
      </g>
      <g stroke="#FBFCFD" strokeWidth="15" strokeLinecap="round">
        <line x1="0" y1="150" x2="400" y2="172" /><line x1="0" y1="360" x2="400" y2="382" />
        <line x1="128" y1="0" x2="150" y2="600" /><line x1="298" y1="0" x2="320" y2="600" />
      </g>
      <g stroke="#F0F3F6" strokeWidth="7" strokeLinecap="round">
        <line x1="0" y1="500" x2="400" y2="512" /><line x1="226" y1="0" x2="240" y2="600" /><line x1="0" y1="60" x2="400" y2="74" />
      </g>
    </svg>
  );
}

const TYPES = [
  { id: "home", label: "البيت", Icon: Home }, { id: "work", label: "الدوام", Icon: Briefcase }, { id: "other", label: "آخر", Icon: MapPin },
];

export default function AddressMapScreen() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("home");
  const [addr, setAddr] = useState("شارع الكورنيش، السماوة، المثنى");

  return (
    <div className="qc-app min-h-screen flex flex-col" dir="rtl" lang="ar">
      <style>{STYLE}</style>

      {/* header */}
      <div className="shrink-0" style={{ background: "#fff", borderBottom: "1px solid #F1F2F4" }}>
        <div className="flex items-center gap-3 px-4 py-3">
          <button className="icon-btn w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ border: "1px solid #ECECEC" }}><ArrowRight size={20} /></button>
          <h1 className="text-lg font-extrabold">أضف عنوان التوصيل</h1>
        </div>
        <div className="px-4 pb-3">
          <div className="search-wrap flex items-center gap-2 rounded-xl px-3" style={{ background: "#fff", height: 46 }}>
            <Search size={19} style={{ color: "#9AA3AF" }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابدأ الكتابة للبحث عن موقعك..." className="flex-1 bg-transparent outline-none text-sm font-medium" style={{ color: "#1A1A1A" }} />
          </div>
        </div>
      </div>

      {/* map */}
      <div className="relative flex-1" style={{ minHeight: "46vh", background: "#E9EDF1" }}>
        <FauxMap />
        {/* center pin + shadow */}
        <div className="absolute" style={{ top: "50%", left: "50%", width: 14, height: 6, borderRadius: "50%", background: "#1A1A1A" }} >
          <span className="pin-shadow" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#1A1A1A" }} />
        </div>
        <div className="pin-bounce absolute" style={{ top: "50%", left: "50%" }}>
          <MapPin size={46} fill="#0C831F" style={{ color: "#fff" }} strokeWidth={1.5} />
        </div>
        <div className="absolute" style={{ top: "50%", left: "50%", transform: "translate(-50%, -260%)" }}>
          <span className="text-xs font-extrabold rounded-lg whitespace-nowrap" style={{ background: "#1A1A1A", color: "#fff", padding: "5px 10px", display: "inline-block" }}>حرّك الخريطة لتحديد الموقع</span>
        </div>
        {/* use current location */}
        <button onClick={() => setAddr("موقعي الحالي - السماوة، المثنى")} className="loc-btn absolute rounded-xl flex items-center gap-2" style={{ bottom: 16, insetInlineStart: "50%", transform: "translateX(50%)", padding: "10px 16px" }}>
          <LocateFixed size={18} style={{ color: "#0C831F" }} />
          <span className="text-sm font-extrabold" style={{ color: "#0C831F" }}>استخدم موقعي الحالي</span>
        </button>
      </div>

      {/* bottom sheet */}
      <div className="shrink-0" style={{ background: "#fff", borderTopLeftRadius: 22, borderTopRightRadius: 22, boxShadow: "0 -8px 24px rgba(16,24,40,.10)", marginTop: -14, position: "relative", zIndex: 5 }}>
        <div className="px-4 pt-4 pb-5">
          <div className="flex items-start gap-3 mb-4">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#EAF6EC" }}><MapPin size={20} style={{ color: "#0C831F" }} /></span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold leading-tight">التوصيل إلى هذا الموقع</p>
              <p className="text-xs mt-0.5" style={{ color: "#7A8493" }}>{addr}</p>
            </div>
            <button className="text-xs font-extrabold shrink-0" style={{ color: "#0C831F" }}>تغيير</button>
          </div>

          <p className="text-xs font-bold mb-2" style={{ color: "#7A8493" }}>احفظ العنوان كـ</p>
          <div className="flex gap-2 mb-4">
            {TYPES.map((t) => (
              <button key={t.id} onClick={() => setType(t.id)} className={"type-chip rounded-xl flex items-center gap-2 text-sm font-bold " + (type === t.id ? "on" : "")} style={{ padding: "9px 16px" }}>
                <t.Icon size={16} />{t.label}
              </button>
            ))}
          </div>

          <button className="cta w-full rounded-xl text-base font-extrabold flex items-center justify-center gap-2" style={{ padding: "14px" }}>أكّد الموقع وتابع <ChevronLeft size={18} /></button>
        </div>
      </div>
    </div>
  );
}
