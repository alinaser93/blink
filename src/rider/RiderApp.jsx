import React, { useState, useEffect } from "react";
import {
  Power, Wallet, Store, MapPin, Navigation2, Clock, Phone, MessageSquare,
  CheckCircle2, Package, X, Star, Bike,
} from "lucide-react";

/* ================================================================== */
/*  Styles — high contrast, large, outdoor-readable                   */
/* ================================================================== */
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
.rider, .rider * { font-family:'Cairo', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif; -webkit-font-smoothing:antialiased; }
.rider { background:#0E1116; color:#F8FAFC; }
.no-scrollbar::-webkit-scrollbar { display:none; }
.no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
.press:active { transform:scale(.97); }
.toggle-track { transition:background .2s ease; display:inline-flex; align-items:center; }
.toggle-knob { transition:transform .2s ease; box-shadow:0 2px 6px rgba(0,0,0,.35); }
.radar-wrap { position:relative; width:230px; height:230px; }
.radar-ring { position:absolute; inset:0; border-radius:50%; border:2px solid rgba(12,131,31,.5); animation:radar 2.4s ease-out infinite; }
.radar-ring.d2 { animation-delay:.8s; }
.radar-ring.d3 { animation-delay:1.6s; }
@keyframes radar { 0%{ transform:scale(.35); opacity:.9; } 100%{ transform:scale(1); opacity:0; } }
.radar-sweep { position:absolute; inset:0; border-radius:50%; background:conic-gradient(from 0deg, rgba(12,131,31,0) 0deg, rgba(12,131,31,.45) 60deg, rgba(12,131,31,0) 70deg); animation:spin 2.2s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.sheet-in { animation:sheetIn .32s cubic-bezier(.22,1,.36,1); }
@keyframes sheetIn { from { transform:translateY(100%); } to { transform:translateY(0); } }
.fade-in { animation:fadeIn .25s ease; }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
.pulse-ring { animation:pr 1.4s ease-in-out infinite; }
@keyframes pr { 0%,100%{ box-shadow:0 0 0 0 rgba(12,131,31,.5); } 50%{ box-shadow:0 0 0 12px rgba(12,131,31,0); } }
.bar-grow { animation:bg 1s ease forwards; }
@keyframes bg { from { transform:scaleX(0); } to { transform:scaleX(1); } }
`;

const iqd = (n) => Number(n).toLocaleString("en-US") + " د.ع";

/* a faux map (dark theme, for active view) */
function MapBox() {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }}>
      <rect width="400" height="300" fill="#1A2230" />
      <rect x="20" y="22" width="92" height="64" rx="10" fill="#223047" />
      <rect x="300" y="210" width="90" height="70" rx="10" fill="#223047" />
      <path d="M0,150 C120,134 190,180 400,158 L400,188 C190,210 120,164 0,176 Z" fill="#1E3A4D" />
      <g stroke="#2C3A4F" strokeWidth="16" strokeLinecap="round">
        <line x1="0" y1="95" x2="400" y2="110" /><line x1="0" y1="215" x2="400" y2="230" />
        <line x1="120" y1="0" x2="138" y2="300" /><line x1="300" y1="0" x2="315" y2="300" />
      </g>
      {/* route */}
      <path d="M70,66 C150,86 120,150 215,168 C300,184 320,236 345,250" fill="none" stroke="#0C831F" strokeWidth="7" strokeLinecap="round" />
      <circle cx="70" cy="66" r="16" fill="#fff" stroke="#0C831F" strokeWidth="4" />
      <text x="70" y="74" fontSize="18" textAnchor="middle">🏪</text>
      <circle cx="345" cy="250" r="16" fill="#fff" stroke="#E0A800" strokeWidth="4" />
      <text x="345" y="258" fontSize="17" textAnchor="middle">🏠</text>
      <g><circle cx="215" cy="168" r="20" fill="#0C831F" /><text x="215" y="177" fontSize="20" textAnchor="middle">🛵</text></g>
    </svg>
  );
}

export default function RiderApp() {
  // stage: 'offline' | 'searching' | 'incoming' | 'active'
  const [online, setOnline] = useState(false);
  const [stage, setStage] = useState("offline");
  const [earnings, setEarnings] = useState(25000);
  const [picked, setPicked] = useState(false);
  const [accepts, setAccepts] = useState(0);
  const [secs, setSecs] = useState(15); // accept countdown

  // going online -> searching, then an order arrives after a few seconds
  useEffect(() => {
    if (stage === "searching") {
      const t = setTimeout(() => { setStage("incoming"); setSecs(15); }, 3500);
      return () => clearTimeout(t);
    }
  }, [stage]);

  // accept countdown on incoming
  useEffect(() => {
    if (stage === "incoming") {
      if (secs <= 0) { setStage("searching"); return; }
      const t = setTimeout(() => setSecs((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [stage, secs]);

  const toggleOnline = () => {
    const next = !online;
    setOnline(next);
    setStage(next ? "searching" : "offline");
    setPicked(false);
  };
  const accept = () => { setStage("active"); setPicked(false); };
  const reject = () => { setStage("searching"); };
  const pickup = () => setPicked(true);
  const deliver = () => {
    setEarnings((e) => e + 2000);
    setAccepts((a) => a + 1);
    setPicked(false);
    setStage("searching");
  };

  const ORDER = { store: "فرع الكورنيش", storeArea: "السماوة - شارع الكورنيش", cust: "حي المعلمين", custName: "زينب كريم", dist: "2.5 كم", eta: "8 دقائق", fee: 2000, items: 5 };

  return (
    <div className="rider min-h-screen flex flex-col" dir="rtl" lang="ar" style={{ maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <style>{STYLE}</style>

      {/* ===================== TOP BAR ===================== */}
      <div className="shrink-0" style={{ background: "#151A21", borderBottom: "1px solid #232A33" }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: 48, height: 48, background: "linear-gradient(135deg,#0C831F,#0A6A19)", fontWeight: 800, fontSize: 20, color: "#fff" }}>ع</div>
            <div>
              <p className="font-extrabold" style={{ fontSize: 17 }}>الكابتن: علي</p>
              <div className="flex items-center gap-1"><Star size={13} fill="#F5B301" style={{ color: "#F5B301" }} /><span className="text-sm font-bold" style={{ color: "#C7D0DB" }}>4.9</span><span className="text-sm" style={{ color: "#6B7685" }}>· {accepts} توصيلة اليوم</span></div>
            </div>
          </div>
          <div className="rounded-2xl px-3 py-2 text-end" style={{ background: "#0E2A14", border: "1px solid #16451F" }}>
            <p className="text-xs font-bold" style={{ color: "#5FD37C" }}>أرباح اليوم</p>
            <p className="font-extrabold tabular-nums" style={{ fontSize: 18, color: "#3BE06A" }}>{iqd(earnings)}</p>
          </div>
        </div>

        {/* massive status toggle */}
        <button onClick={toggleOnline} className="press w-full flex items-center justify-between px-4 py-3" style={{ background: online ? "#0C831F" : "#232A33", transition: "background .2s ease" }}>
          <div className="flex items-center gap-3">
            <span className="rounded-full flex items-center justify-center" style={{ width: 40, height: 40, background: online ? "rgba(255,255,255,.2)" : "#323B47" }}><Power size={22} color="#fff" /></span>
            <span className="font-extrabold" style={{ fontSize: 20, color: "#fff" }}>{online ? "متاح للطلبات" : "غير متاح"}</span>
          </div>
          <span className="toggle-track rounded-full" style={{ width: 64, height: 36, background: online ? "rgba(255,255,255,.28)" : "#3A434F", padding: 4, justifyContent: online ? "flex-start" : "flex-end" }}>
            <span className="toggle-knob block rounded-full" style={{ width: 28, height: 28, background: "#fff" }} />
          </span>
        </button>
      </div>

      {/* ===================== MAIN AREA ===================== */}
      <div className="flex-1 relative overflow-hidden">

        {/* ---- OFFLINE ---- */}
        {stage === "offline" && (
          <div className="fade-in absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <span className="rounded-full flex items-center justify-center mb-6" style={{ width: 110, height: 110, background: "#1A212B" }}><Power size={50} style={{ color: "#5A6675" }} /></span>
            <p className="font-extrabold mb-2" style={{ fontSize: 26 }}>إنت غير متاح حالياً</p>
            <p style={{ fontSize: 16, color: "#8A95A3", lineHeight: 1.7 }}>فعّل «متاح للطلبات» فوق حتى تبدأ تستقبل طلبات التوصيل في منطقتك.</p>
          </div>
        )}

        {/* ---- SEARCHING ---- */}
        {stage === "searching" && (
          <div className="fade-in absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <div className="radar-wrap mb-8">
              <div className="radar-sweep" />
              <div className="radar-ring" /><div className="radar-ring d2" /><div className="radar-ring d3" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="pulse-ring rounded-full flex items-center justify-center" style={{ width: 78, height: 78, background: "#0C831F" }}><Bike size={38} color="#fff" /></span>
              </div>
            </div>
            <p className="font-extrabold mb-2" style={{ fontSize: 23 }}>جاري البحث عن طلبات قريبة</p>
            <p style={{ fontSize: 16, color: "#8A95A3" }}>في السماوة... خلّيك جاهز 🛵</p>
            <div className="flex items-center gap-2 mt-6 rounded-full px-4 py-2" style={{ background: "#16201A", border: "1px solid #1E3A26" }}>
              <span className="rounded-full" style={{ width: 9, height: 9, background: "#3BE06A" }} />
              <span className="text-sm font-bold" style={{ color: "#5FD37C" }}>متصل · أنت ضمن منطقة نشطة</span>
            </div>
          </div>
        )}

        {/* ---- ACTIVE ORDER ---- */}
        {stage === "active" && (
          <div className="fade-in absolute inset-0 flex flex-col">
            {/* map */}
            <div className="relative shrink-0" style={{ height: "34%", minHeight: 200 }}>
              <MapBox />
              <div className="absolute" style={{ top: 14, insetInlineStart: 14 }}>
                <span className="rounded-full inline-flex items-center gap-1.5 px-3 py-2" style={{ background: "rgba(14,17,22,.85)", border: "1px solid #2C3A4F" }}><Clock size={15} style={{ color: "#3BE06A" }} /><span className="text-sm font-extrabold">{ORDER.eta}</span><span className="text-sm" style={{ color: "#8A95A3" }}>· {ORDER.dist}</span></span>
              </div>
            </div>

            {/* details + actions */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4" style={{ background: "#0E1116" }}>
              {/* progress hint */}
              <div className="flex items-center gap-2 mb-4">
                <span className="rounded-full flex items-center justify-center" style={{ width: 30, height: 30, background: picked ? "#0C831F" : "#232A33" }}>{picked ? <CheckCircle2 size={18} color="#fff" /> : <Store size={16} color="#9AA7B5" />}</span>
                <div className="flex-1" style={{ height: 4, borderRadius: 4, background: "#232A33", overflow: "hidden" }}><div className="bar-grow" style={{ height: "100%", width: picked ? "100%" : "50%", background: "#0C831F", transformOrigin: "right" }} /></div>
                <span className="rounded-full flex items-center justify-center" style={{ width: 30, height: 30, background: "#232A33" }}><MapPin size={16} color="#9AA7B5" /></span>
              </div>

              {/* pickup / dropoff card */}
              <div className="rounded-2xl overflow-hidden mb-3" style={{ background: "#151A21", border: "1px solid #232A33" }}>
                <div className="flex items-center gap-3 p-4">
                  <span className="rounded-xl flex items-center justify-center shrink-0" style={{ width: 44, height: 44, background: "#0E2A14" }}><Store size={22} style={{ color: "#3BE06A" }} /></span>
                  <div className="flex-1 min-w-0"><p className="text-xs font-bold" style={{ color: "#6B7685" }}>الاستلام من</p><p className="font-extrabold" style={{ fontSize: 17 }}>{ORDER.store}</p><p className="text-sm" style={{ color: "#8A95A3" }}>{ORDER.storeArea}</p></div>
                </div>
                <div style={{ height: 1, background: "#232A33" }} />
                <div className="flex items-center gap-3 p-4">
                  <span className="rounded-xl flex items-center justify-center shrink-0" style={{ width: 44, height: 44, background: "#2A2410" }}><MapPin size={22} style={{ color: "#F5B301" }} /></span>
                  <div className="flex-1 min-w-0"><p className="text-xs font-bold" style={{ color: "#6B7685" }}>التوصيل إلى</p><p className="font-extrabold" style={{ fontSize: 17 }}>{ORDER.custName}</p><p className="text-sm" style={{ color: "#8A95A3" }}>{ORDER.cust}</p></div>
                </div>
              </div>

              {/* contact row */}
              <div className="flex gap-3 mb-3">
                <button className="press flex-1 rounded-2xl flex items-center justify-center gap-2 py-3.5" style={{ background: "#0C831F" }}><Phone size={20} color="#fff" /><span className="font-extrabold" style={{ fontSize: 16, color: "#fff" }}>اتصال</span></button>
                <button className="press flex-1 rounded-2xl flex items-center justify-center gap-2 py-3.5" style={{ background: "#1C2530", border: "1px solid #2C3A4F" }}><MessageSquare size={20} style={{ color: "#C7D0DB" }} /><span className="font-extrabold" style={{ fontSize: 16, color: "#C7D0DB" }}>رسالة</span></button>
                <button className="press rounded-2xl flex items-center justify-center px-4" style={{ background: "#1C2530", border: "1px solid #2C3A4F" }}><Navigation2 size={20} style={{ color: "#5FA8FF" }} /></button>
              </div>

              {/* trip earning */}
              <div className="flex items-center justify-between rounded-2xl px-4 py-3 mb-4" style={{ background: "#0E2A14", border: "1px solid #16451F" }}>
                <span className="flex items-center gap-2 font-bold" style={{ color: "#5FD37C", fontSize: 15 }}><Wallet size={18} /> ربح هذه التوصيلة</span>
                <span className="font-extrabold tabular-nums" style={{ fontSize: 20, color: "#3BE06A" }}>{iqd(ORDER.fee)}</span>
              </div>
            </div>

            {/* sticky action buttons */}
            <div className="shrink-0 px-4 pt-3 pb-4" style={{ background: "#0E1116", borderTop: "1px solid #232A33" }}>
              {!picked ? (
                <button onClick={pickup} className="press w-full rounded-2xl flex items-center justify-center gap-3" style={{ background: "#0C831F", padding: "20px", boxShadow: "0 8px 24px rgba(12,131,31,.45)" }}>
                  <Package size={26} color="#fff" /><span className="font-extrabold" style={{ fontSize: 21, color: "#fff" }}>تم استلام الطلب من المتجر</span>
                </button>
              ) : (
                <button onClick={deliver} className="press w-full rounded-2xl flex items-center justify-center gap-3" style={{ background: "#0C831F", padding: "20px", boxShadow: "0 8px 24px rgba(12,131,31,.45)" }}>
                  <CheckCircle2 size={26} color="#fff" /><span className="font-extrabold" style={{ fontSize: 21, color: "#fff" }}>تأكيد توصيل الطلب للزبون</span>
                </button>
              )}
              <button onClick={() => setStage("active")} className="w-full text-center mt-3" style={{ color: "#6B7685", fontSize: 14, fontWeight: 700 }}>
                {picked ? "تم الاستلام — بانتظار التوصيل" : "اضغط الزر بعد استلام الطلب من المتجر"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===================== INCOMING ORDER POPUP ===================== */}
      {stage === "incoming" && (
        <div className="fade-in" style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,.55)", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div className="sheet-in" style={{ background: "#FFFFFF", borderTopLeftRadius: 26, borderTopRightRadius: 26, color: "#15171A", overflow: "hidden" }}>
            {/* header strip with countdown */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3" style={{ background: "#0C831F" }}>
              <div className="flex items-center gap-2"><span className="pulse-ring rounded-full flex items-center justify-center" style={{ width: 34, height: 34, background: "rgba(255,255,255,.22)" }}><Bike size={19} color="#fff" /></span><span className="font-extrabold" style={{ fontSize: 19, color: "#fff" }}>طلب جديد!</span></div>
              <span className="rounded-full flex items-center justify-center font-extrabold tabular-nums" style={{ width: 40, height: 40, background: "#fff", color: "#0C831F", fontSize: 18 }}>{secs}</span>
            </div>

            <div className="px-5 pt-4 pb-5">
              {/* earning headline */}
              <div className="flex items-center justify-between mb-4">
                <div><p className="text-sm font-bold" style={{ color: "#7A8493" }}>ربح التوصيلة</p><p className="font-extrabold tabular-nums" style={{ fontSize: 32, color: "#0C831F" }}>{iqd(ORDER.fee)}</p></div>
                <div className="text-end">
                  <div className="flex items-center gap-1.5 justify-end"><Navigation2 size={17} style={{ color: "#2563EB" }} /><span className="font-extrabold" style={{ fontSize: 18 }}>{ORDER.dist}</span></div>
                  <div className="flex items-center gap-1.5 justify-end mt-1"><Clock size={15} style={{ color: "#7A8493" }} /><span className="font-bold" style={{ fontSize: 15, color: "#5A6473" }}>{ORDER.eta}</span></div>
                </div>
              </div>

              {/* route */}
              <div className="rounded-2xl p-4 mb-5" style={{ background: "#F6F7F9", border: "1px solid #ECEEF2" }}>
                <div className="flex items-center gap-3">
                  <span className="rounded-xl flex items-center justify-center shrink-0" style={{ width: 42, height: 42, background: "#EAF6EC" }}><Store size={21} style={{ color: "#0C831F" }} /></span>
                  <div className="flex-1 min-w-0"><p className="text-xs font-bold" style={{ color: "#9AA3AF" }}>المتجر</p><p className="font-extrabold" style={{ fontSize: 16 }}>{ORDER.store}</p></div>
                </div>
                <div style={{ height: 18, width: 2, background: "#D5DAE0", marginInlineStart: 20, marginBlock: 2 }} />
                <div className="flex items-center gap-3">
                  <span className="rounded-xl flex items-center justify-center shrink-0" style={{ width: 42, height: 42, background: "#FFF6E0" }}><MapPin size={21} style={{ color: "#D98A1F" }} /></span>
                  <div className="flex-1 min-w-0"><p className="text-xs font-bold" style={{ color: "#9AA3AF" }}>الزبون</p><p className="font-extrabold" style={{ fontSize: 16 }}>{ORDER.cust}</p></div>
                </div>
              </div>

              {/* MASSIVE accept */}
              <button onClick={accept} className="press w-full rounded-2xl flex items-center justify-center gap-3" style={{ background: "#0C831F", padding: "22px", boxShadow: "0 10px 26px rgba(12,131,31,.4)" }}>
                <CheckCircle2 size={28} color="#fff" /><span className="font-extrabold" style={{ fontSize: 23, color: "#fff" }}>قبول الطلب</span>
              </button>
              <button onClick={reject} className="press w-full rounded-2xl flex items-center justify-center gap-2 mt-3" style={{ background: "#fff", border: "2px solid #EAECEF", padding: "13px" }}>
                <X size={20} style={{ color: "#9AA3AF" }} /><span className="font-extrabold" style={{ fontSize: 16, color: "#7A8493" }}>رفض</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
