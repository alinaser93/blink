import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, Activity, Boxes, Users, BarChart3, Wallet, Clock, AlertTriangle,
  Bike, Bell, Search, Plus, Pencil, Package, CheckCircle2, Settings, Store,
  TrendingUp, ShoppingCart, UserPlus, ArrowUpRight, Minus, Loader2, Menu,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import {
  getProducts, getOrders, getCustomers, getRiders, setOrderStatus, setStock, isLive,
} from "../lib/api.js";

/* ================================================================== */
/*  Styles                                                            */
/* ================================================================== */
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
.admin, .admin * { font-family:'Cairo', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif; -webkit-font-smoothing:antialiased; }
.admin { background:#FAFAFA; color:#15171A; }
.no-scrollbar::-webkit-scrollbar { display:none; }
.no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
.side { background:#FFFFFF; border-inline-end:1px solid #EEF0F2; position:fixed; top:0; bottom:0; right:0; width:266px; z-index:95; transform:translateX(100%); transition:transform .25s ease; overflow-y:auto; }
.side.open { transform:translateX(0); box-shadow:-12px 0 32px rgba(16,24,40,.18); }
.side-backdrop { position:fixed; inset:0; background:rgba(16,24,40,.45); z-index:90; }
@media (min-width:1024px){ .side{ position:sticky; top:0; right:auto; height:100vh; transform:none; box-shadow:none; z-index:1; align-self:flex-start; } .side-backdrop{ display:none; } }
.side-item { transition:all .15s ease; color:#5A6473; position:relative; }
.side-item:hover { background:#F5F7F9; color:#15171A; }
.side-item.on { background:#EAF6EC; color:#0C831F; }
.panel { background:#FFFFFF; border:1px solid #F0F1F3; box-shadow:0 1px 2px rgba(16,24,40,.04), 0 10px 26px rgba(16,24,40,.04); }
.metric { background:#FFFFFF; border:1px solid #F0F1F3; box-shadow:0 1px 2px rgba(16,24,40,.04), 0 10px 26px rgba(16,24,40,.04); transition:box-shadow .18s ease, transform .18s ease; }
.metric:hover { box-shadow:0 16px 34px rgba(16,24,40,.10); transform:translateY(-2px); }
.kan-col { background:#F6F7F9; border:1px solid #EFF0F2; }
.kan-card { background:#FFFFFF; border:1px solid #EEF0F2; box-shadow:0 1px 2px rgba(16,24,40,.05); transition:all .18s ease; }
.kan-card:hover { box-shadow:0 12px 28px rgba(16,24,40,.10); transform:translateY(-2px); }
.btn-green { background:#0C831F; color:#fff; transition:all .15s ease; box-shadow:0 4px 12px rgba(12,131,31,.25); }
.btn-green:hover { background:#0A7019; }
.btn-green:active { transform:scale(.98); }
.btn-ghost { background:#fff; border:1px solid #E1E5EA; color:#3A424E; transition:all .15s ease; }
.btn-ghost:hover { border-color:#0C831F; color:#0C831F; background:#F7FBF8; }
.chip-f { background:#fff; border:1px solid #E3E6EB; color:#5A6473; transition:all .15s ease; cursor:pointer; }
.chip-f:hover { border-color:#0C831F; color:#0C831F; }
.chip-f.on { background:#0C831F; border-color:#0C831F; color:#fff; }
.icon-btn { transition:all .15s ease; }
.icon-btn:hover { background:#F3F4F6; }
.icon-btn:active { transform:scale(.93); }
.tbl-row { transition:background .12s ease; }
.tbl-row:hover { background:#FAFBFC; }
.stepmini { background:#F1F3F6; transition:all .12s ease; }
.stepmini:hover { background:#E5E8EC; }
.stepmini:active { transform:scale(.9); }
.toggle-track { transition:background .2s ease; display:inline-flex; align-items:center; }
.toggle-knob { box-shadow:0 1px 3px rgba(16,24,40,.3); }
.pulse-dot { animation:pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%,100%{ box-shadow:0 0 0 0 rgba(225,29,42,.5);} 50%{ box-shadow:0 0 0 7px rgba(225,29,42,0);} }
.spin { animation:spin .8s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.brand-grad { background:linear-gradient(135deg,#0C831F 0%, #0A6A19 100%); }
.gold-grad { background:linear-gradient(135deg,#E7C66B 0%, #D4AF37 100%); }
`;

/* ================================================================== */
/*  Static config + chart data                                        */
/* ================================================================== */
const NAV = [
  { id: "dash", label: "الرئيسية", Icon: LayoutDashboard },
  { id: "orders", label: "الطلبات الحية", Icon: Activity },
  { id: "inv", label: "المنتجات والمخزون", Icon: Boxes },
  { id: "cust", label: "العملاء", Icon: Users },
  { id: "analytics", label: "التقارير", Icon: BarChart3 },
];
const HEAD = {
  dash: { t: "نظرة عامة", s: "ملخّص أداء فرع السماوة اليوم" },
  orders: { t: "الطلبات الحية", s: "تشغيل الطلبات لحظة بلحظة" },
  inv: { t: "المنتجات والمخزون", s: "إدارة المنتجات وحالة التوفّر" },
  cust: { t: "العملاء", s: "قاعدة عملاء الفرع" },
  analytics: { t: "التقارير والتحليلات", s: "أداء المبيعات والطلبات" },
};
const COLS = {
  new: { title: "طلبات جديدة", accent: "#2563EB", tint: "#E8F0FE" },
  packing: { title: "قيد التجهيز", accent: "#D4AF37", tint: "#FBF3DA" },
  dispatched: { title: "مع المندوب", accent: "#0C831F", tint: "#EAF6EC" },
};
const INV_CATS = ["الكل", "بقالة", "خضار وفواكه", "مشروبات", "ألبان", "سناكس"];
const REV_7D = [
  { d: "السبت", v: 620000 }, { d: "الأحد", v: 540000 }, { d: "الإثنين", v: 710000 },
  { d: "الثلاثاء", v: 680000 }, { d: "الأربعاء", v: 790000 }, { d: "الخميس", v: 850000 }, { d: "الجمعة", v: 920000 },
];
const ORDERS_HOUR = [
  { h: "٩ص", v: 12 }, { h: "١١ص", v: 22 }, { h: "١ظ", v: 38 }, { h: "٣ع", v: 28 }, { h: "٥ع", v: 45 }, { h: "٧م", v: 62 }, { h: "٩م", v: 40 },
];
const CAT_SPLIT = [
  { name: "بقالة", v: 35 }, { name: "خضار وفواكه", v: 22 }, { name: "مشروبات", v: 18 }, { name: "ألبان", v: 14 }, { name: "سناكس", v: 11 },
];
const PIE_COLORS = ["#0C831F", "#D4AF37", "#2B7A9B", "#C9692E", "#7A5AB8"];
const TOP_PRODUCTS = [
  { name: "موز عضوي", sales: 312, pct: 100 }, { name: "حليب طازج", sales: 268, pct: 86 },
  { name: "بيبسي ٣٣٠ مل", sales: 240, pct: 77 }, { name: "خبز صمون", sales: 205, pct: 66 }, { name: "بيض طازج", sales: 180, pct: 58 },
];

const iqd = (n) => Number(n).toLocaleString("en-US") + " د.ع";
const kFmt = (n) => Math.round(n / 1000) + "k";
const pad = (n) => String(n).padStart(2, "0");
const stockBadge = (n) => n === 0 ? { t: "نفد", c: "#E11D2A", bg: "#FDECEC" } : n < 10 ? { t: "منخفض", c: "#D98A1F", bg: "#FEF3E2" } : { t: "متوفّر", c: "#0C831F", bg: "#EAF6EC" };
const custBadge = (s) => s === "نشط" ? { c: "#0C831F", bg: "#EAF6EC" } : s === "جديد" ? { c: "#2563EB", bg: "#E8F0FE" } : { c: "#7A8493", bg: "#F1F3F6" };

/* ================================================================== */
/*  Small shared components                                           */
/* ================================================================== */
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <div className="panel rounded-xl flex items-center gap-2 px-3 py-2.5">
      <Clock size={17} style={{ color: "#0C831F" }} />
      <span className="text-sm font-extrabold tabular-nums" style={{ letterSpacing: ".5px" }}>{pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}</span>
    </div>
  );
}
function Metric({ label, num, unit, Icon, tint, color, sub, subColor, pulse }) {
  return (
    <div className="metric rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className="rounded-xl flex items-center justify-center" style={{ width: 48, height: 48, background: tint }}><Icon size={24} style={{ color }} /></div>
        {pulse && <span className="pulse-dot rounded-full" style={{ width: 11, height: 11, background: "#E11D2A" }} />}
      </div>
      <p className="text-sm font-bold mt-4" style={{ color: "#7A8493" }}>{label}</p>
      <div className="flex items-baseline gap-1.5 mt-1">
        <span className="text-3xl font-extrabold tabular-nums">{num}</span>
        {unit && <span className="text-base font-extrabold" style={{ color: "#7A8493" }}>{unit}</span>}
      </div>
      <p className="text-xs font-bold mt-2" style={{ color: subColor }}>{sub}</p>
    </div>
  );
}
function ChartCard({ title, sub, children }) {
  return (
    <div className="panel rounded-2xl p-5">
      <div className="mb-4"><h3 className="text-base font-extrabold">{title}</h3>{sub && <p className="text-xs mt-0.5" style={{ color: "#9AA3AF" }}>{sub}</p>}</div>
      {children}
    </div>
  );
}
const tipStyle = { background: "#fff", border: "1px solid #EEF0F2", borderRadius: 12, fontFamily: "Cairo", fontSize: 12, boxShadow: "0 8px 24px rgba(16,24,40,.12)" };

function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={REV_7D} margin={{ top: 6, right: 8, left: 8, bottom: 0 }}>
        <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0C831F" stopOpacity={0.22} /><stop offset="100%" stopColor="#0C831F" stopOpacity={0} /></linearGradient></defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F3" vertical={false} />
        <XAxis dataKey="d" reversed tick={{ fontSize: 12, fill: "#9AA3AF", fontFamily: "Cairo" }} axisLine={false} tickLine={false} />
        <YAxis orientation="right" width={42} tick={{ fontSize: 11, fill: "#9AA3AF", fontFamily: "Cairo" }} axisLine={false} tickLine={false} tickFormatter={kFmt} />
        <Tooltip contentStyle={tipStyle} formatter={(v) => [iqd(v), "المبيعات"]} labelStyle={{ fontFamily: "Cairo", fontWeight: 700 }} />
        <Area type="monotone" dataKey="v" stroke="#0C831F" strokeWidth={3} fill="url(#rev)" dot={{ r: 3, fill: "#0C831F" }} activeDot={{ r: 5 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ================================================================== */
/*  Views                                                             */
/* ================================================================== */
function OverviewView({ orders }) {
  const recent = orders.slice(0, 5);
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Metric label="مبيعات اليوم" num="850,000" unit="د.ع" Icon={Wallet} tint="#FBF3DA" color="#B8932E" sub="▲ 12% عن أمس" subColor="#0C831F" />
        <Metric label="طلبات اليوم" num="143" Icon={ShoppingCart} tint="#E8F0FE" color="#2563EB" sub="▲ 8% عن أمس" subColor="#0C831F" />
        <Metric label="متوسط قيمة الطلب" num="14,200" unit="د.ع" Icon={TrendingUp} tint="#EAF6EC" color="#0C831F" sub="▲ 3% عن أمس" subColor="#0C831F" />
        <Metric label="عملاء جدد" num="18" Icon={UserPlus} tint="#F3EEF9" color="#7A5AB8" sub="هذا الأسبوع" subColor="#7A5AB8" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><ChartCard title="المبيعات خلال آخر ٧ أيام" sub="بالدينار العراقي"><RevenueChart /></ChartCard></div>
        <div className="panel rounded-2xl p-5">
          <h3 className="text-base font-extrabold mb-3">أحدث الطلبات</h3>
          <div className="flex flex-col gap-3">
            {recent.length === 0 && <p className="text-sm" style={{ color: "#AEB6BF" }}>لا توجد طلبات حالياً</p>}
            {recent.map((o) => (
              <div key={o.id} className="flex items-center gap-3">
                <span className="rounded-lg flex items-center justify-center shrink-0" style={{ width: 38, height: 38, background: COLS[o.col].tint }}><Package size={17} style={{ color: COLS[o.col].accent }} /></span>
                <div className="flex-1 min-w-0"><p className="text-sm font-bold">#{o.num}</p><p className="text-xs" style={{ color: "#9AA3AF" }}>{o.items} مواد · {COLS[o.col].title}</p></div>
                <span className="text-sm font-extrabold tabular-nums">{iqd(o.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function OrdersView({ orders, inv, riders, accept, ready, deliver }) {
  const byCol = (c) => orders.filter((o) => o.col === c);
  const pending = byCol("new").length + byCol("packing").length;
  const oos = inv.filter((p) => p.stock === 0).length;
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        <Metric label="مبيعات اليوم" num="850,000" unit="د.ع" Icon={Wallet} tint="#FBF3DA" color="#B8932E" sub="▲ 12% عن أمس" subColor="#0C831F" />
        <Metric label="طلبات قيد الانتظار" num={String(pending)} Icon={Clock} tint="#FDECEC" color="#E11D2A" sub="تحتاج إجراء فوري" subColor="#E11D2A" pulse />
        <Metric label="مواد نفدت" num={String(oos)} Icon={AlertTriangle} tint="#FEF3E2" color="#D98A1F" sub="راجع المخزون" subColor="#D98A1F" />
        <Metric label="مناديب متاحين" num={String(riders.length)} Icon={Bike} tint="#EAF6EC" color="#0C831F" sub="جاهزين للتوصيل" subColor="#0C831F" />
      </div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-extrabold flex items-center gap-2"><Activity size={20} style={{ color: "#0C831F" }} /> لوحة الطلبات الحية</h2>
        <span className="text-sm font-bold flex items-center gap-1.5" style={{ color: "#0C831F" }}><span className="pulse-dot rounded-full" style={{ width: 8, height: 8, background: "#0C831F" }} /> تحديث مباشر</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Object.keys(COLS).map((cid) => {
          const col = COLS[cid]; const list = byCol(cid);
          return (
            <div key={cid} className="kan-col rounded-2xl p-3">
              <div className="flex items-center justify-between px-1.5 mb-3">
                <div className="flex items-center gap-2"><span className="rounded-full" style={{ width: 10, height: 10, background: col.accent }} /><h3 className="font-extrabold">{col.title}</h3></div>
                <span className="text-xs font-extrabold rounded-full px-2.5 py-1" style={{ background: col.tint, color: col.accent }}>{list.length}</span>
              </div>
              <div className="flex flex-col gap-3" style={{ minHeight: 80 }}>
                {list.length === 0 && <p className="text-center text-xs py-6" style={{ color: "#AEB6BF" }}>لا توجد طلبات</p>}
                {list.map((o) => (
                  <div key={o.id} className="kan-card rounded-xl p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold tabular-nums" style={{ fontSize: 15 }}>#{o.num}</span>
                      {cid === "new" && <span className="text-xs font-bold rounded-md px-2 py-0.5 flex items-center gap-1" style={{ background: "#F1F3F6", color: "#5A6473" }}><Clock size={11} /> {o.time}</span>}
                      {cid === "packing" && <span className="text-xs font-bold rounded-md px-2 py-0.5" style={{ background: "#FBF3DA", color: "#B8932E" }}>قيد التجهيز</span>}
                      {cid === "dispatched" && <span className="text-xs font-bold rounded-md px-2 py-0.5" style={{ background: o.status === "قرب الوصول" ? "#EAF6EC" : "#E8F0FE", color: o.status === "قرب الوصول" ? "#0C831F" : "#2563EB" }}>{o.status}</span>}
                    </div>
                    {cid === "dispatched" ? (
                      <div className="flex items-center gap-2 mt-3">
                        <span className="rounded-full flex items-center justify-center shrink-0" style={{ width: 30, height: 30, background: "#EAF6EC", color: "#0C831F", fontWeight: 800, fontSize: 13 }}>{(o.rider || "?").slice(0, 1)}</span>
                        <div className="flex-1 min-w-0"><p className="text-sm font-bold leading-none">{o.rider}</p><p className="text-xs mt-1" style={{ color: "#9AA3AF" }}>{o.items} مواد · {iqd(o.total)}</p></div>
                        <Bike size={18} style={{ color: "#0C831F" }} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: "#5A6473" }}><Package size={15} /> {o.items} مواد</span>
                        <span className="font-extrabold tabular-nums">{iqd(o.total)}</span>
                      </div>
                    )}
                    {cid === "new" && <button onClick={() => accept(o.id)} className="btn-green w-full rounded-lg mt-3.5 flex items-center justify-center gap-2 text-sm font-extrabold" style={{ padding: "10px" }}><CheckCircle2 size={16} /> قبول والبدء بالتجهيز</button>}
                    {cid === "packing" && <button onClick={() => ready(o.id)} className="btn-green w-full rounded-lg mt-3.5 flex items-center justify-center gap-2 text-sm font-extrabold" style={{ padding: "10px" }}><Bike size={16} /> جاهز للتسليم</button>}
                    {cid === "dispatched" && <button onClick={() => deliver(o.id)} className="btn-ghost w-full rounded-lg mt-3.5 flex items-center justify-center gap-2 text-sm font-extrabold" style={{ padding: "10px" }}><CheckCircle2 size={16} /> تم التوصيل</button>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function InventoryView({ inv, onAdjust }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("الكل");
  const rows = inv.filter((p) => (cat === "الكل" || p.cat === cat) && p.name.includes(q));
  const oos = inv.filter((p) => p.stock === 0).length;
  const low = inv.filter((p) => p.stock > 0 && p.stock < 10).length;
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Metric label="إجمالي المنتجات" num={String(inv.length)} Icon={Boxes} tint="#EAF6EC" color="#0C831F" sub="منتج في الفرع" subColor="#9AA3AF" />
        <Metric label="مواد منخفضة" num={String(low)} Icon={AlertTriangle} tint="#FEF3E2" color="#D98A1F" sub="أقل من ١٠ وحدات" subColor="#D98A1F" />
        <Metric label="مواد نفدت" num={String(oos)} Icon={Package} tint="#FDECEC" color="#E11D2A" sub="تحتاج تزويد" subColor="#E11D2A" pulse={oos > 0} />
      </div>
      <div className="panel rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-5 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {INV_CATS.map((c) => <button key={c} onClick={() => setCat(c)} className={"chip-f rounded-full text-xs font-bold " + (cat === c ? "on" : "")} style={{ padding: "7px 14px" }}>{c}</button>)}
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg flex items-center gap-2 px-3" style={{ border: "1px solid #E6E9EE", height: 40 }}>
              <Search size={16} style={{ color: "#9AA3AF" }} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث عن منتج..." className="bg-transparent outline-none text-sm" style={{ width: 130 }} />
            </div>
            <button className="btn-green rounded-lg flex items-center gap-2 text-sm font-extrabold" style={{ padding: "9px 16px" }}><Plus size={17} /> إضافة منتج</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ background: "#F7F8FA" }}>
                {["المنتج", "القسم", "السعر", "الكمية المتوفرة", "تعديل المخزون", "الإجراء"].map((h) => <th key={h} className="text-xs font-extrabold px-5 py-3" style={{ color: "#7A8493", textAlign: "right", whiteSpace: "nowrap" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-sm" style={{ color: "#AEB6BF" }}>لا توجد نتائج</td></tr>}
              {rows.map((p) => {
                const b = stockBadge(p.stock);
                return (
                  <tr key={p.id} className="tbl-row" style={{ borderTop: "1px solid #F2F3F5" }}>
                    <td className="px-5 py-3"><div className="flex items-center gap-3"><div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: 44, height: 44, background: "#F3F5F8" }}><p.Icon size={22} style={{ color: p.accent, opacity: 0.55 }} /></div><span className="text-sm font-bold" style={{ whiteSpace: "nowrap" }}>{p.name}</span></div></td>
                    <td className="px-5 py-3"><span className="text-xs font-bold rounded-md px-2.5 py-1" style={{ background: "#F1F3F6", color: "#5A6473", whiteSpace: "nowrap" }}>{p.cat}</span></td>
                    <td className="px-5 py-3"><span className="text-sm font-extrabold tabular-nums" style={{ whiteSpace: "nowrap" }}>{iqd(p.price)}</span></td>
                    <td className="px-5 py-3"><div className="flex items-center gap-2"><span className="rounded-full" style={{ width: 8, height: 8, background: b.c }} /><span className="text-sm font-bold tabular-nums">{p.stock}</span><span className="text-xs font-extrabold rounded-full px-2 py-0.5" style={{ background: b.bg, color: b.c }}>{b.t}</span></div></td>
                    <td className="px-5 py-3">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => onAdjust(p.id, -1)} className="stepmini rounded-lg flex items-center justify-center" style={{ width: 30, height: 30, color: "#5A6473" }}><Minus size={15} strokeWidth={2.6} /></button>
                        <button onClick={() => onAdjust(p.id, 1)} className="stepmini rounded-lg flex items-center justify-center" style={{ width: 30, height: 30, color: "#0C831F" }}><Plus size={15} strokeWidth={2.6} /></button>
                      </div>
                    </td>
                    <td className="px-5 py-3"><button className="btn-ghost rounded-lg flex items-center gap-1.5 text-sm font-bold" style={{ padding: "7px 14px" }}><Pencil size={14} /> تعديل</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function CustomersView({ customers }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Metric label="إجمالي العملاء" num="1,284" Icon={Users} tint="#EAF6EC" color="#0C831F" sub="عميل مسجّل" subColor="#9AA3AF" />
        <Metric label="عملاء جدد" num="18" Icon={UserPlus} tint="#E8F0FE" color="#2563EB" sub="هذا الأسبوع" subColor="#2563EB" />
        <Metric label="نسبة العودة" num="64%" Icon={ArrowUpRight} tint="#FBF3DA" color="#B8932E" sub="عملاء متكرّرون" subColor="#0C831F" />
      </div>
      <div className="panel rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-5">
          <div><h2 className="text-lg font-extrabold">قائمة العملاء</h2><p className="text-sm mt-0.5" style={{ color: "#7A8493" }}>عرض {customers.length} من أبرز العملاء</p></div>
          <div className="rounded-lg flex items-center gap-2 px-3" style={{ border: "1px solid #E6E9EE", height: 40 }}><Search size={16} style={{ color: "#9AA3AF" }} /><input placeholder="بحث..." className="bg-transparent outline-none text-sm" style={{ width: 120 }} /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 720 }}>
            <thead><tr style={{ background: "#F7F8FA" }}>{["العميل", "الهاتف", "الطلبات", "إجمالي الإنفاق", "آخر طلب", "الحالة"].map((h) => <th key={h} className="text-xs font-extrabold px-5 py-3" style={{ color: "#7A8493", textAlign: "right", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
            <tbody>
              {customers.map((c) => {
                const b = custBadge(c.status);
                return (
                  <tr key={c.phone} className="tbl-row" style={{ borderTop: "1px solid #F2F3F5" }}>
                    <td className="px-5 py-3"><div className="flex items-center gap-3"><span className="rounded-full flex items-center justify-center shrink-0" style={{ width: 40, height: 40, background: "#EAF6EC", color: "#0C831F", fontWeight: 800 }}>{c.name.slice(0, 1)}</span><span className="text-sm font-bold" style={{ whiteSpace: "nowrap" }}>{c.name}</span></div></td>
                    <td className="px-5 py-3"><span className="text-sm tabular-nums" style={{ color: "#5A6473", whiteSpace: "nowrap" }}>{c.phone}</span></td>
                    <td className="px-5 py-3"><span className="text-sm font-bold tabular-nums">{c.orders}</span></td>
                    <td className="px-5 py-3"><span className="text-sm font-extrabold tabular-nums" style={{ whiteSpace: "nowrap" }}>{iqd(c.spent)}</span></td>
                    <td className="px-5 py-3"><span className="text-sm" style={{ color: "#5A6473", whiteSpace: "nowrap" }}>{c.last}</span></td>
                    <td className="px-5 py-3"><span className="text-xs font-extrabold rounded-full px-2.5 py-1" style={{ background: b.bg, color: b.c }}>{c.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function AnalyticsView() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Metric label="إيرادات الأسبوع" num="5.1M" unit="د.ع" Icon={Wallet} tint="#FBF3DA" color="#B8932E" sub="▲ 14% عن الأسبوع الماضي" subColor="#0C831F" />
        <Metric label="إجمالي الطلبات" num="982" Icon={ShoppingCart} tint="#E8F0FE" color="#2563EB" sub="هذا الأسبوع" subColor="#2563EB" />
        <Metric label="متوسط قيمة الطلب" num="14,200" unit="د.ع" Icon={TrendingUp} tint="#EAF6EC" color="#0C831F" sub="▲ 3%" subColor="#0C831F" />
        <Metric label="معدّل النمو" num="14%" Icon={ArrowUpRight} tint="#F3EEF9" color="#7A5AB8" sub="مقارنة شهرية" subColor="#7A5AB8" />
      </div>
      <div className="mb-4"><ChartCard title="اتجاه المبيعات — آخر ٧ أيام" sub="بالدينار العراقي"><RevenueChart /></ChartCard></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="الطلبات حسب الساعة" sub="توزيع الطلبات خلال اليوم">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ORDERS_HOUR} margin={{ top: 6, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F3" vertical={false} />
              <XAxis dataKey="h" reversed tick={{ fontSize: 12, fill: "#9AA3AF", fontFamily: "Cairo" }} axisLine={false} tickLine={false} />
              <YAxis orientation="right" width={32} tick={{ fontSize: 11, fill: "#9AA3AF", fontFamily: "Cairo" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tipStyle} formatter={(v) => [v + " طلب", "الطلبات"]} cursor={{ fill: "rgba(212,175,55,.08)" }} />
              <Bar dataKey="v" fill="#D4AF37" radius={[6, 6, 0, 0]} maxBarSize={34} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="المبيعات حسب القسم" sub="نسبة كل قسم من المبيعات">
          <div className="flex items-center gap-4 flex-wrap">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={CAT_SPLIT} dataKey="v" nameKey="name" innerRadius={52} outerRadius={88} paddingAngle={3} stroke="none">
                  {CAT_SPLIT.map((e, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={tipStyle} formatter={(v) => [v + "%", ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              {CAT_SPLIT.map((c, i) => (
                <div key={c.name} className="flex items-center gap-2">
                  <span className="rounded-full shrink-0" style={{ width: 11, height: 11, background: PIE_COLORS[i] }} />
                  <span className="text-sm font-semibold flex-1" style={{ color: "#3A424E" }}>{c.name}</span>
                  <span className="text-sm font-extrabold tabular-nums">{c.v}%</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>
      <ChartCard title="أكثر المنتجات مبيعاً" sub="حسب عدد الطلبات هذا الأسبوع">
        <div className="flex flex-col gap-4">
          {TOP_PRODUCTS.map((p, i) => (
            <div key={p.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold flex items-center gap-2"><span className="rounded-md flex items-center justify-center" style={{ width: 22, height: 22, background: "#EAF6EC", color: "#0C831F", fontSize: 12, fontWeight: 800 }}>{i + 1}</span>{p.name}</span>
                <span className="text-sm font-extrabold tabular-nums" style={{ color: "#5A6473" }}>{p.sales} طلب</span>
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: 8, background: "#F1F3F6" }}><div style={{ width: p.pct + "%", height: "100%", background: "linear-gradient(90deg,#0C831F,#3BA94F)", borderRadius: 999 }} /></div>
            </div>
          ))}
        </div>
      </ChartCard>
    </>
  );
}

function Loading() {
  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: "60vh" }}>
      <Loader2 size={40} className="spin" style={{ color: "#0C831F" }} />
      <p className="text-sm font-bold mt-3" style={{ color: "#9AA3AF" }}>جاري تحميل البيانات...</p>
    </div>
  );
}

/* ================================================================== */
/*  Root                                                              */
/* ================================================================== */
export default function AdminDashboard() {
  const [active, setActive] = useState("orders");
  const [open, setOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [inv, setInv] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [p, o, c, r] = await Promise.all([getProducts(), getOrders(), getCustomers(), getRiders()]);
        if (!alive) return;
        setInv(p); setOrders(o); setCustomers(c); setRiders(r);
      } catch (e) {
        console.error("فشل تحميل البيانات من Supabase:", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const accept = (id) => { setOrders((a) => a.map((o) => o.id === id ? { ...o, col: "packing" } : o)); setOrderStatus(id, "packing").catch(console.error); };
  const ready = (id) => {
    const rider = riders.length ? riders[Math.floor(Math.random() * riders.length)] : "مندوب";
    setOrders((a) => a.map((o) => o.id === id ? { ...o, col: "dispatched", rider, status: "في الطريق" } : o));
    setOrderStatus(id, "dispatched", rider, "في الطريق").catch(console.error);
  };
  const deliver = (id) => { setOrders((a) => a.filter((o) => o.id !== id)); setOrderStatus(id, "delivered").catch(console.error); };
  const onAdjust = (id, d) => {
    const prod = inv.find((p) => p.id === id);
    if (!prod) return;
    const ns = Math.max(0, prod.stock + d);
    setInv((a) => a.map((p) => p.id === id ? { ...p, stock: ns } : p));
    setStock(id, ns).catch(console.error);
  };

  const head = HEAD[active];

  return (
    <div className="admin min-h-screen flex" dir="rtl" lang="ar">
      <style>{STYLE}</style>

      {sidebarOpen && <div className="side-backdrop" onClick={() => setSidebarOpen(false)} />}
      <aside className={"side shrink-0 flex flex-col no-scrollbar " + (sidebarOpen ? "open" : "")}>
        <div className="flex items-center gap-3 px-5" style={{ height: 76 }}>
          <div className="brand-grad rounded-xl flex items-center justify-center shrink-0" style={{ width: 42, height: 42, boxShadow: "0 6px 16px rgba(12,131,31,.3)" }}><Store size={22} color="#fff" /></div>
          <div><p className="font-extrabold text-lg leading-none">سلّـة</p><p className="text-xs mt-1" style={{ color: "#9AA3AF" }}>لوحة التاجر</p></div>
        </div>
        <div style={{ height: 1, background: "#F1F2F4", margin: "0 20px 12px" }} />
        <p className="text-xs font-bold px-5 mb-2" style={{ color: "#AEB6BF" }}>القائمة الرئيسية</p>
        <nav className="flex flex-col gap-1 px-3">
          {NAV.map((n) => {
            const on = active === n.id;
            return (
              <button key={n.id} onClick={() => { setActive(n.id); setSidebarOpen(false); }} className={"side-item flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold " + (on ? "on" : "")}>
                {on && <span style={{ position: "absolute", insetInlineStart: -12, top: 8, bottom: 8, width: 4, borderStartEndRadius: 4, borderEndEndRadius: 4, background: "#0C831F" }} />}
                <n.Icon size={20} strokeWidth={on ? 2.4 : 2} /><span>{n.label}</span>
                {n.id === "orders" && <span className="pulse-dot ms-auto rounded-full" style={{ width: 8, height: 8, background: "#E11D2A" }} />}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto p-3">
          <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: "#F6F7F9" }}>
            <div className="gold-grad rounded-full flex items-center justify-center shrink-0" style={{ width: 38, height: 38, color: "#fff", fontWeight: 800 }}>م</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-extrabold truncate">مدير الفرع</p><p className="text-xs truncate" style={{ color: "#9AA3AF" }}>فرع السماوة</p></div>
            <button className="icon-btn rounded-lg p-1.5"><Settings size={17} style={{ color: "#9AA3AF" }} /></button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-20" style={{ background: "rgba(250,250,250,.85)", backdropFilter: "blur(8px)", borderBottom: "1px solid #EEF0F2" }}>
          <div className="flex items-center justify-between gap-4 px-6 py-4 flex-wrap">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden icon-btn panel rounded-xl flex items-center justify-center shrink-0" style={{ width: 42, height: 42 }}><Menu size={20} /></button>
              <div>
                <div className="flex items-center gap-2.5"><h1 className="text-xl md:text-2xl font-extrabold">{head.t}</h1><span className="text-xs font-extrabold rounded-full px-2.5 py-1" style={{ background: "#EAF6EC", color: "#0C831F" }}>فرع السماوة</span></div>
                <p className="text-sm mt-1" style={{ color: "#7A8493" }}>{head.s}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="panel rounded-xl flex items-center gap-2 px-3 py-2.5">
                <span className="rounded-full" style={{ width: 8, height: 8, background: isLive ? "#0C831F" : "#D4AF37" }} />
                <span className="text-xs font-extrabold" style={{ color: isLive ? "#0C831F" : "#B8932E" }}>{isLive ? "متصل بقاعدة البيانات" : "بيانات تجريبية"}</span>
              </div>
              <div className="hidden md:block"><LiveClock /></div>
              <button onClick={() => setOpen((o) => !o)} className="panel rounded-xl flex items-center gap-2.5 px-3 py-2.5">
                <span className="toggle-track rounded-full" style={{ width: 44, height: 25, background: open ? "#0C831F" : "#C7CDD6", padding: 3, justifyContent: open ? "flex-start" : "flex-end" }}><span className="toggle-knob block rounded-full" style={{ width: 19, height: 19, background: "#fff" }} /></span>
                <span className="text-sm font-extrabold" style={{ color: open ? "#0C831F" : "#7A8493" }}>{open ? "مفتوح للطلبات" : "مغلق"}</span>
              </button>
              <button className="icon-btn panel rounded-xl flex items-center justify-center relative" style={{ width: 44, height: 44 }}><Bell size={19} style={{ color: "#5A6473" }} /><span className="absolute rounded-full" style={{ top: 11, insetInlineEnd: 11, width: 8, height: 8, background: "#E11D2A", border: "2px solid #fff" }} /></button>
              <div className="gold-grad rounded-full flex items-center justify-center shrink-0" style={{ width: 44, height: 44, color: "#fff", fontWeight: 800 }}>م</div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6" style={{ maxWidth: 1480, margin: "0 auto" }}>
          {loading ? <Loading /> : (
            <>
              {active === "dash" && <OverviewView orders={orders} />}
              {active === "orders" && <OrdersView orders={orders} inv={inv} riders={riders} accept={accept} ready={ready} deliver={deliver} />}
              {active === "inv" && <InventoryView inv={inv} onAdjust={onAdjust} />}
              {active === "cust" && <CustomersView customers={customers} />}
              {active === "analytics" && <AnalyticsView />}
            </>
          )}
          <p className="text-center text-xs mt-8" style={{ color: "#C7CDD6" }}>منصة سلّـة · لوحة التاجر · فرع السماوة</p>
        </div>
      </main>
    </div>
  );
}
