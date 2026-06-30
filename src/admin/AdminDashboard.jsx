import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  LayoutDashboard, Activity, Boxes, Users, BarChart3, Wallet, Clock, AlertTriangle,
  Bike, Bell, Search, Plus, Pencil, Package, CheckCircle2, Settings, Store,
  TrendingUp, ShoppingCart, UserPlus, ArrowUpRight, Minus, Loader2, Menu,
  FolderTree, Folder, ChevronUp, ChevronDown, Trash2, Check, X,
  Download, Upload, FileSpreadsheet, FileJson, AlertCircle,
  Home, RotateCcw, Eye, Palette,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import {
  getProducts, getOrders, getCustomers, getRiders, setOrderStatus, setStock, isLive,
  getCategories, createCategory, updateCategory, deleteCategory, reorderCategory,
  createProduct, updateProduct, deleteProduct, importCatalog,
  getHomeConfig, saveHomeConfig, DEFAULT_HOME_CONFIG,
  ICON_MAP, CAT_ICON, CAT_ACCENT, CATEGORY_ICONS,
} from "../lib/api.js";
import { emojiFor } from "../customer/emoji.js";

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
.ovfade { animation:ovfade .18s ease; }
@keyframes ovfade { from{ opacity:0; } to{ opacity:1; } }
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
  { id: "cats", label: "الأقسام", Icon: FolderTree },
  { id: "home", label: "واجهة الصفحة الرئيسية", Icon: Home },
  { id: "cust", label: "العملاء", Icon: Users },
  { id: "analytics", label: "التقارير", Icon: BarChart3 },
];
const HEAD = {
  dash: { t: "نظرة عامة", s: "ملخّص أداء فرع السماوة اليوم" },
  orders: { t: "الطلبات الحية", s: "تشغيل الطلبات لحظة بلحظة" },
  inv: { t: "المنتجات والمخزون", s: "إدارة المنتجات وحالة التوفّر" },
  cats: { t: "الأقسام", s: "إدارة شجرة الأقسام الرئيسية والفرعية" },
  home: { t: "واجهة الصفحة الرئيسية", s: "تحكّم برأس صفحة الزبون: الترويسة وبانر الترحيب وبطاقات الأكثر مبيعاً" },
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

/* ================================================================== */
/*  استيراد/تصدير الكتالوج (CSV + JSON) — بمعايير المتاجر الكبرى       */
/* ================================================================== */
// أعمدة الكتالوج: العنوان المعروض + مرادفات للاستيراد. مطابقة العناوين مرنة
// (تتجاهل حالة الأحرف والتطويل والحركات والمسافات) كي تقبل ملفات إكسل المعدّلة يدوياً.
const normKey = (s) => String(s == null ? "" : s).trim().toLowerCase()
  .replace(/ـ/g, "")                  // تطويل ـ
  .replace(/[ً-ْٰ]/g, "")   // حركات/شدّة
  .replace(/\s+/g, " ");
const IE_COLS = [
  { key: "cat",    header: "القسم",           aliases: ["قسم", "category", "cat"] },
  { key: "sub",    header: "التفرّع",         aliases: ["تفرّع", "subcategory", "sub"] },
  { key: "name",   header: "اسم المنتج",      aliases: ["الاسم", "المنتج", "name", "product", "title"] },
  { key: "weight", header: "الوحدة",          aliases: ["unit", "weight", "size"] },
  { key: "price",  header: "السعر",           aliases: ["price"] },
  { key: "mrp",    header: "السعر قبل الخصم", aliases: ["قبل الخصم", "mrp"] },
  { key: "stock",  header: "المخزون",         aliases: ["الكمية المتوفرة", "stock", "quantity", "qty"] },
  { key: "emoji",  header: "إيموجي",          aliases: ["ايموجي", "emoji", "icon"] },
];
const EXPORT_HEADERS = IE_COLS.map((c) => c.header);
const HMAP = {};
IE_COLS.forEach((c) => [c.header, ...c.aliases].forEach((a) => { HMAP[normKey(a)] = c.key; }));
const csvCell = (v) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;   // منع حقن الصيغ في إكسل (CSV injection)
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
function toCSV(headers, rows) {
  return [headers.map(csvCell).join(",")].concat(rows.map((r) => r.map(csvCell).join(","))).join("\n");
}
function parseCSV(text) {
  const rows = []; let row = []; let field = ""; let inQ = false;
  text = text.replace(/^﻿/, "");
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\r") { /* skip */ }
    else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += ch;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}
const normalizeRow = (obj) => {
  const out = {};
  if (!obj || typeof obj !== "object") return out;
  Object.keys(obj).forEach((k) => { const key = HMAP[normKey(k)]; if (key) out[key] = obj[k]; });
  return out;
};
// يحوّل نصّ ملف (CSV أو JSON) إلى صفوف موحّدة + أخطاء (لا يرمي استثناءً أبداً)
function parseImport(text) {
  const t = text.trim();
  if (t.startsWith("{") || t.startsWith("[")) {
    let data;
    try { data = JSON.parse(t); } catch (e) { return { rows: [], errors: ["JSON غير صالح: " + (e.message || "")] }; }
    const raw = Array.isArray(data) ? data : (data.products || data.rows || data.items || []);
    return { rows: (Array.isArray(raw) ? raw : []).map(normalizeRow), errors: [] };
  }
  const grid = parseCSV(t);
  if (!grid.length) return { rows: [], errors: ["الملف فارغ"] };
  const headers = grid[0].map((h) => h.trim());
  const rows = grid.slice(1).map((cells) => {
    const obj = {}; headers.forEach((h, i) => { obj[h] = cells[i] != null ? cells[i] : ""; });
    return normalizeRow(obj);
  });
  return { rows, errors: [] };
}
const productsToRows = (inv) => inv.map((p) => [p.cat || "", p.sub || "", p.name, p.weight || "", p.price, p.mrp || "", p.stock, p.emoji || ""]);
function buildCatalogJSON(inv, cats) {
  const nameOf = (id) => { const c = cats.find((x) => x.id === id); return c ? c.name : null; };
  return JSON.stringify({
    app: "salla", version: 1, exportedAt: new Date().toISOString(),
    categories: cats.map((c) => ({ name: c.name, parent: c.parentId ? nameOf(c.parentId) : null, sort: c.sort, icon: c.iconName || null })),
    products: inv.map((p) => ({ category: p.cat || "", subcategory: p.sub || null, name: p.name, unit: p.weight || "", price: p.price, mrp: p.mrp || 0, stock: p.stock, emoji: p.emoji || null })),
  }, null, 2);
}
function downloadFile(name, content, mime) {
  const blob = new Blob([content], { type: mime + ";charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
// معاينة قبل التأكيد — تطابق منطق importCatalog تماماً (المطابقة بـ معرّف القسم + الاسم)
function importPreview(rows, inv, cats) {
  const nameOf = (id) => { const c = cats.find((x) => x.id === id); return c ? c.name : ""; };
  const findT1 = (n) => cats.find((c) => c.parentId == null && c.name === n);
  const findSub = (pid, n) => cats.find((c) => c.parentId === pid && c.name === n);
  const t1Names = new Set(cats.filter((c) => c.parentId == null).map((c) => c.name));
  const subKeys = new Set(cats.filter((c) => c.parentId != null).map((c) => nameOf(c.parentId) + "|" + c.name));
  // معرّف القسم للصف: قائم → معرّفه الحقيقي؛ جديد → سِمة وهمية لا تطابق أي منتج قائم؛ بلا قسم → null
  const resolveId = (cat, sub) => {
    if (!cat) return null;
    const t1 = findT1(cat);
    if (!t1) return "NEW|" + cat + "|" + sub;
    if (!sub) return t1.id;
    const s = findSub(t1.id, sub);
    return s ? s.id : "NEW|" + cat + "|" + sub;
  };
  const prodSet = new Set(inv.map((p) => String(p.categoryId) + "|" + p.name));
  const newCats = new Set(), newSubs = new Set();
  let toCreate = 0, toUpdate = 0, invalid = 0;
  for (const r of rows) {
    const name = (r.name || "").trim(); if (!name) { invalid++; continue; }
    const cat = (r.cat || "").trim(), sub = (r.sub || "").trim();
    if (cat && !t1Names.has(cat)) newCats.add(cat);
    if (cat && sub && !subKeys.has(cat + "|" + sub)) newSubs.add(cat + "|" + sub);
    if (prodSet.has(String(resolveId(cat, sub)) + "|" + name)) toUpdate++; else toCreate++;
  }
  return { total: rows.length, newCats: newCats.size, newSubs: newSubs.size, toCreate, toUpdate, invalid };
}

/* ---- نافذة الاستيراد: معاينة ثم تأكيد ---- */
function ImportModal({ data, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const p = data.preview;
  const Stat = ({ n, label, color }) => (
    <div className="rounded-xl p-3 text-center" style={{ background: "#F7F8FA" }}>
      <p className="text-2xl font-extrabold tabular-nums" style={{ color }}>{n}</p>
      <p className="text-xs font-bold mt-0.5" style={{ color: "#7A8493" }}>{label}</p>
    </div>
  );
  const confirm = async () => {
    setBusy(true);
    try { const r = await onConfirm(data.rows); setResult(r); }
    catch (e) { setResult({ error: e.message || "فشل الاستيراد" }); }
    finally { setBusy(false); }
  };
  return (
    <div className="ovfade fixed inset-0 flex items-end sm:items-center justify-center" style={{ background: "rgba(16,24,40,.5)", zIndex: 90 }} onClick={busy ? undefined : onClose}>
      <div className="panel rounded-2xl w-full" style={{ maxWidth: 520, maxHeight: "92vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid #F1F2F4" }}>
          <h2 className="text-lg font-extrabold flex items-center gap-2"><Upload size={19} style={{ color: "#0C831F" }} /> استيراد الكتالوج</h2>
          <button onClick={onClose} disabled={busy} className="icon-btn rounded-lg flex items-center justify-center" style={{ width: 34, height: 34, background: "#F1F3F6", opacity: busy ? 0.5 : 1 }}><X size={18} /></button>
        </div>
        <div className="p-5">
          {result ? (
            result.error ? (
              <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: "#FDECEC" }}>
                <AlertCircle size={20} style={{ color: "#E11D2A" }} />
                <p className="text-sm font-bold" style={{ color: "#B3261E" }}>{result.error}</p>
              </div>
            ) : (
              <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: "#EAF6EC" }}>
                <CheckCircle2 size={22} style={{ color: "#0C831F" }} />
                <div className="text-sm font-bold" style={{ color: "#0A6A19" }}>
                  تمّ الاستيراد بنجاح ✅
                  <p className="text-xs font-semibold mt-1" style={{ color: "#3A7A48" }}>
                    {result.productsCreated} منتج جديد · {result.productsUpdated} محدّث · {result.categoriesCreated} قسم · {result.subCreated} تفرّع{result.failed > 0 ? " · " + result.failed + " فشل" : ""}
                  </p>
                </div>
              </div>
            )
          ) : (
            <>
              <p className="text-sm mb-4" style={{ color: "#5A6473" }}>راجع ما سيحدث قبل التأكيد. لن يُكرَّر أي منتج موجود — سيُحدَّث بدلاً من ذلك.</p>
              {data.errors && data.errors.length > 0 && (
                <div className="rounded-xl p-3 mb-3 flex items-start gap-2" style={{ background: "#FDECEC" }}>
                  <AlertCircle size={17} style={{ color: "#E11D2A" }} />
                  <p className="text-xs font-bold" style={{ color: "#B3261E" }}>{data.errors.join(" · ")}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Stat n={p.toCreate} label="منتج جديد" color="#0C831F" />
                <Stat n={p.toUpdate} label="منتج سيُحدَّث" color="#2563EB" />
                <Stat n={p.newCats} label="قسم جديد" color="#B8932E" />
                <Stat n={p.newSubs} label="تفرّع جديد" color="#7A5AB8" />
              </div>
              {p.invalid > 0 && (
                <div className="rounded-xl p-3 mt-3 flex items-center gap-2" style={{ background: "#FEF3E2" }}>
                  <AlertTriangle size={17} style={{ color: "#D98A1F" }} />
                  <p className="text-xs font-bold" style={{ color: "#9A6B1E" }}>{p.invalid} صفّ بلا اسم منتج سيُتجاهَل.</p>
                </div>
              )}
              {p.total === 0 && <p className="text-sm text-center py-4" style={{ color: "#AEB6BF" }}>لا توجد صفوف صالحة في الملف.</p>}
            </>
          )}
        </div>
        <div className="flex items-center gap-3 p-5" style={{ borderTop: "1px solid #F1F2F4" }}>
          {result ? (
            <button onClick={onClose} className="btn-green rounded-xl flex-1 text-sm font-extrabold" style={{ padding: "12px" }}>تمّ</button>
          ) : (
            <>
              <button onClick={confirm} disabled={busy || p.total === 0} className="btn-green rounded-xl flex-1 flex items-center justify-center gap-2 text-sm font-extrabold" style={{ padding: "12px", opacity: busy || p.total === 0 ? 0.6 : 1 }}>
                {busy ? <><Loader2 size={17} className="spin" /> جاري الاستيراد…</> : <><Check size={17} /> تأكيد الاستيراد</>}
              </button>
              <button onClick={onClose} disabled={busy} className="btn-ghost rounded-xl text-sm font-extrabold" style={{ padding: "12px 22px" }}>إلغاء</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- نموذج إضافة/تعديل منتج (مربوط بالقسم/التفرّع) ---- */
function ProductForm({ product, cats, onSave, onClose }) {
  const tier1 = cats.filter((c) => c.parentId == null).sort((a, b) => a.sort - b.sort);
  const initCat = product ? cats.find((c) => c.id === product.categoryId) : null;
  const initT1 = initCat ? (initCat.parentId == null ? initCat.id : initCat.parentId) : (tier1[0]?.id ?? "");
  const initT2 = initCat && initCat.parentId != null ? initCat.id : "";
  const [name, setName] = useState(product?.name || "");
  const [t1, setT1] = useState(initT1);
  const [t2, setT2] = useState(initT2);
  const [price, setPrice] = useState(product != null ? String(product.price ?? "") : "");
  const [weight, setWeight] = useState(product?.weight || "");
  const [stk, setStk] = useState(product != null ? String(product.stock ?? 0) : "0");
  const [emoji, setEmoji] = useState(product?.emoji || "");
  const [mrp, setMrp] = useState(product?.mrp ? String(product.mrp) : "");

  const subs = cats.filter((c) => c.parentId === t1).sort((a, b) => a.sort - b.sort);
  const preview = emoji || emojiFor(name);
  const fld = { border: "1px solid #E6E9EE", height: 42, borderRadius: 10, padding: "0 12px", outline: "none", background: "#fff", width: "100%" };
  const ok = name.trim().length > 0;

  const save = () => {
    if (!ok) return;
    onSave({ name: name.trim(), categoryId: t2 || t1 || null, price: +price || 0, stock: +stk || 0, weight: weight.trim(), mrp: +mrp || 0, emoji: emoji.trim() || null });
  };

  const Field = ({ label, children }) => (
    <div><label className="text-xs font-bold mb-1 block" style={{ color: "#5A6473" }}>{label}</label>{children}</div>
  );

  return (
    <div className="ovfade fixed inset-0 flex items-end sm:items-center justify-center" style={{ background: "rgba(16,24,40,.5)", zIndex: 80 }} onClick={onClose}>
      <div className="panel rounded-2xl w-full" style={{ maxWidth: 520, maxHeight: "92vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid #F1F2F4", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <h2 className="text-lg font-extrabold">{product ? "تعديل منتج" : "منتج جديد"}</h2>
          <button onClick={onClose} className="icon-btn rounded-lg flex items-center justify-center" style={{ width: 34, height: 34, background: "#F1F3F6" }}><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: 60, height: 60, background: "#F3F5F8", fontSize: 34 }}>{preview}</div>
            <p className="text-xs" style={{ color: "#9AA3AF" }}>صورة المنتج تُعرض كإيموجي (يُشتق من الاسم تلقائياً، أو حدّده بالأسفل).</p>
          </div>
          <Field label="اسم المنتج"><input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="مثال: حليب طازج" className="text-sm font-bold" style={fld} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="القسم">
              <select value={t1} onChange={(e) => { setT1(e.target.value); setT2(""); }} className="text-sm font-bold" style={fld}>
                {tier1.length === 0 && <option value="">— لا أقسام —</option>}
                {tier1.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="التفرّع (اختياري)">
              <select value={t2} onChange={(e) => setT2(e.target.value)} className="text-sm font-bold" style={fld}>
                <option value="">— بدون تفرّع —</option>
                {subs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="السعر (د.ع)"><input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="numeric" placeholder="0" className="text-sm font-bold tabular-nums" style={fld} /></Field>
            <Field label="الوحدة"><input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="مثال: 1 لتر / كيلو" className="text-sm font-bold" style={fld} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="الكمية المتوفّرة"><input value={stk} onChange={(e) => setStk(e.target.value)} inputMode="numeric" placeholder="0" className="text-sm font-bold tabular-nums" style={fld} /></Field>
            <Field label="إيموجي (اختياري)"><input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="🥛" className="text-sm font-bold" style={{ ...fld, textAlign: "center" }} /></Field>
          </div>
          <Field label="السعر قبل الخصم (اختياري — يفعّل الخصم)"><input value={mrp} onChange={(e) => setMrp(e.target.value)} inputMode="numeric" placeholder="اتركه فارغاً لو ما في خصم" className="text-sm font-bold tabular-nums" style={fld} /></Field>
        </div>
        <div className="flex items-center gap-3 p-5" style={{ borderTop: "1px solid #F1F2F4", position: "sticky", bottom: 0, background: "#fff" }}>
          <button onClick={save} disabled={!ok} className="btn-green rounded-xl flex-1 flex items-center justify-center gap-2 text-sm font-extrabold" style={{ padding: "12px", opacity: ok ? 1 : 0.6 }}><Check size={17} /> حفظ</button>
          <button onClick={onClose} className="btn-ghost rounded-xl text-sm font-extrabold" style={{ padding: "12px 22px" }}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}

function InventoryView({ inv, cats, onAdjust, onAdd, onEdit, onDelete, onImport }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("الكل");
  const [editing, setEditing] = useState(null); // product | "new" | null
  const [expOpen, setExpOpen] = useState(false);
  const [imp, setImp] = useState(null); // { rows, errors, preview } | null
  const fileRef = useRef(null);

  const exportCSV = () => { setExpOpen(false); downloadFile("salla-products.csv", "﻿" + toCSV(EXPORT_HEADERS, productsToRows(inv)), "text/csv"); };
  const exportJSON = () => { setExpOpen(false); downloadFile("salla-catalog.json", buildCatalogJSON(inv, cats), "application/json"); };
  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = ""; // يسمح بإعادة اختيار نفس الملف
    if (!f) return;
    const emptyPrev = { total: 0, newCats: 0, newSubs: 0, toCreate: 0, toUpdate: 0, invalid: 0 };
    if (f.size > 5 * 1024 * 1024) { setImp({ rows: [], errors: ["الملف كبير جداً (الحدّ الأقصى 5 ميغابايت)"], preview: emptyPrev }); return; }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const { rows, errors } = parseImport(String(reader.result || ""));
        setImp({ rows, errors, preview: importPreview(rows, inv, cats) });
      } catch (err) {
        setImp({ rows: [], errors: ["تعذّر قراءة الملف: " + (err.message || "صيغة غير صالحة")], preview: { total: 0, newCats: 0, newSubs: 0, toCreate: 0, toUpdate: 0, invalid: 0 } });
      }
    };
    reader.readAsText(f);
  };

  const catIndex = useMemo(() => { const m = {}; cats.forEach((c) => { m[c.id] = c; }); return m; }, [cats]);
  const resolveCat = (p) => {
    const c = catIndex[p.categoryId];
    if (!c) return { t1: p.cat || "أخرى", t2: null };
    if (c.parentId == null) return { t1: c.name, t2: null };
    return { t1: catIndex[c.parentId]?.name || "أخرى", t2: c.name };
  };
  const chips = ["الكل", ...cats.filter((c) => c.parentId == null).sort((a, b) => a.sort - b.sort).map((c) => c.name)];

  const rows = inv.filter((p) => (cat === "الكل" || resolveCat(p).t1 === cat) && p.name.includes(q));
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
            {chips.map((c) => <button key={c} onClick={() => setCat(c)} className={"chip-f rounded-full text-xs font-bold " + (cat === c ? "on" : "")} style={{ padding: "7px 14px" }}>{c}</button>)}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="rounded-lg flex items-center gap-2 px-3" style={{ border: "1px solid #E6E9EE", height: 40 }}>
              <Search size={16} style={{ color: "#9AA3AF" }} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث عن منتج..." className="bg-transparent outline-none text-sm" style={{ width: 120 }} />
            </div>
            <div className="relative">
              <button onClick={() => setExpOpen((v) => !v)} className="btn-ghost rounded-lg flex items-center gap-1.5 text-sm font-bold" style={{ padding: "9px 13px" }}><Download size={16} /> تصدير<ChevronDown size={14} /></button>
              {expOpen && (
                <>
                  <div className="fixed inset-0" style={{ zIndex: 70 }} onClick={() => setExpOpen(false)} />
                  <div className="panel rounded-xl absolute" style={{ insetInlineEnd: 0, top: 46, zIndex: 71, minWidth: 200, overflow: "hidden" }}>
                    <button onClick={exportCSV} className="tbl-row w-full flex items-center gap-2 px-4 py-3 text-sm font-bold" style={{ color: "#3A424E" }}><FileSpreadsheet size={16} style={{ color: "#0C831F" }} /> ملف CSV (إكسل)</button>
                    <button onClick={exportJSON} className="tbl-row w-full flex items-center gap-2 px-4 py-3 text-sm font-bold" style={{ color: "#3A424E", borderTop: "1px solid #F1F2F4" }}><FileJson size={16} style={{ color: "#2563EB" }} /> نسخة JSON كاملة</button>
                  </div>
                </>
              )}
            </div>
            <button onClick={() => fileRef.current && fileRef.current.click()} className="btn-ghost rounded-lg flex items-center gap-1.5 text-sm font-bold" style={{ padding: "9px 13px" }}><Upload size={16} /> استيراد</button>
            <input ref={fileRef} type="file" accept=".csv,.json,text/csv,application/json" onChange={onFile} style={{ display: "none" }} />
            <button onClick={() => setEditing("new")} className="btn-green rounded-lg flex items-center gap-2 text-sm font-extrabold" style={{ padding: "9px 16px" }}><Plus size={17} /> إضافة منتج</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 760 }}>
            <thead>
              <tr style={{ background: "#F7F8FA" }}>
                {["المنتج", "القسم / التفرّع", "السعر", "الكمية المتوفرة", "تعديل المخزون", "الإجراء"].map((h) => <th key={h} className="text-xs font-extrabold px-5 py-3" style={{ color: "#7A8493", textAlign: "right", whiteSpace: "nowrap" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-sm" style={{ color: "#AEB6BF" }}>لا توجد منتجات — اضغط «إضافة منتج»</td></tr>}
              {rows.map((p) => {
                const b = stockBadge(p.stock);
                const rc = resolveCat(p);
                const off = p.mrp && p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
                return (
                  <tr key={p.id} className="tbl-row" style={{ borderTop: "1px solid #F2F3F5", opacity: p._pending ? 0.55 : 1 }}>
                    <td className="px-5 py-3"><div className="flex items-center gap-3"><div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: 44, height: 44, background: (p.accent || "#9AA8B5") + "18", fontSize: 24 }}>{p.emoji || emojiFor(p.name)}</div><div className="min-w-0"><p className="text-sm font-bold" style={{ whiteSpace: "nowrap" }}>{p.name}</p>{p.weight && <p className="text-xs" style={{ color: "#9AA3AF" }}>{p.weight}</p>}</div></div></td>
                    <td className="px-5 py-3"><div className="flex items-center gap-1.5" style={{ whiteSpace: "nowrap" }}><span className="text-xs font-bold rounded-md px-2.5 py-1" style={{ background: "#F1F3F6", color: "#5A6473" }}>{rc.t1}</span>{rc.t2 && <span className="text-xs font-bold rounded-md px-2 py-1" style={{ background: "#E8F0FE", color: "#2563EB" }}>{rc.t2}</span>}</div></td>
                    <td className="px-5 py-3"><div className="flex items-baseline gap-1.5" style={{ whiteSpace: "nowrap" }}><span className="text-sm font-extrabold tabular-nums">{iqd(p.price)}</span>{off > 0 && <span className="text-xs line-through tabular-nums" style={{ color: "#9AA3AF" }}>{iqd(p.mrp)}</span>}</div>{off > 0 && <span className="text-xs font-bold" style={{ color: "#2563EB" }}>خصم {off}%</span>}</td>
                    <td className="px-5 py-3"><div className="flex items-center gap-2"><span className="rounded-full" style={{ width: 8, height: 8, background: b.c }} /><span className="text-sm font-bold tabular-nums">{p.stock}</span><span className="text-xs font-extrabold rounded-full px-2 py-0.5" style={{ background: b.bg, color: b.c }}>{b.t}</span></div></td>
                    <td className="px-5 py-3">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => onAdjust(p.id, -1)} className="stepmini rounded-lg flex items-center justify-center" style={{ width: 30, height: 30, color: "#5A6473" }}><Minus size={15} strokeWidth={2.6} /></button>
                        <button onClick={() => onAdjust(p.id, 1)} className="stepmini rounded-lg flex items-center justify-center" style={{ width: 30, height: 30, color: "#0C831F" }}><Plus size={15} strokeWidth={2.6} /></button>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => setEditing(p)} className="btn-ghost rounded-lg flex items-center gap-1.5 text-sm font-bold" style={{ padding: "7px 12px" }}><Pencil size={14} /> تعديل</button>
                        <button onClick={() => { if (window.confirm("حذف «" + p.name + "»؟")) onDelete(p.id); }} className="icon-btn rounded-lg flex items-center justify-center" style={{ width: 34, height: 34, color: "#E11D2A", background: "#FDECEC" }}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <ProductForm
          product={editing === "new" ? null : editing}
          cats={cats}
          onClose={() => setEditing(null)}
          onSave={(data) => { if (editing === "new") onAdd(data); else onEdit(editing.id, data); setEditing(null); }}
        />
      )}

      {imp && <ImportModal data={imp} onConfirm={onImport} onClose={() => setImp(null)} />}
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

/* ---- categories: inline add/edit form (name + icon picker) ---- */
function CatForm({ name, setName, icon, setIcon, onSave, onCancel, placeholder }) {
  const Prev = ICON_MAP[icon] || ICON_MAP.Package;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="rounded-lg flex items-center justify-center shrink-0" style={{ width: 36, height: 36, background: "#F3F5F8" }}>
        <Prev size={18} style={{ color: icon ? "#0C831F" : "#AEB6BF" }} />
      </span>
      <input
        autoFocus value={name} onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onSave(); if (e.key === "Escape") onCancel(); }}
        placeholder={placeholder} className="rounded-lg outline-none text-sm font-bold"
        style={{ border: "1px solid #E6E9EE", height: 36, padding: "0 12px", minWidth: 0, flex: 1 }}
      />
      <select value={icon} onChange={(e) => setIcon(e.target.value)} className="rounded-lg outline-none text-sm" style={{ border: "1px solid #E6E9EE", height: 36, padding: "0 8px", background: "#fff" }}>
        <option value="">أيقونة تلقائية</option>
        {CATEGORY_ICONS.map((k) => <option key={k} value={k}>{k}</option>)}
      </select>
      <button onClick={onSave} className="icon-btn rounded-lg flex items-center justify-center" style={{ width: 34, height: 34, background: "#EAF6EC", color: "#0C831F" }}><Check size={17} strokeWidth={2.6} /></button>
      <button onClick={onCancel} className="icon-btn rounded-lg flex items-center justify-center" style={{ width: 34, height: 34, background: "#F1F3F6", color: "#7A8493" }}><X size={17} strokeWidth={2.6} /></button>
    </div>
  );
}

/* ---- categories: up/down/edit/delete action cluster ---- */
function RowActions({ canUp, canDown, onUp, onDown, onEdit, onDelete }) {
  const mini = (enabled, onClick, child, color) => (
    <button onClick={enabled ? onClick : undefined} className="stepmini rounded-lg flex items-center justify-center" style={{ width: 28, height: 28, color, opacity: enabled ? 1 : 0.35, pointerEvents: enabled ? "auto" : "none" }}>{child}</button>
  );
  return (
    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
      {mini(canUp, onUp, <ChevronUp size={15} strokeWidth={2.6} />, "#5A6473")}
      {mini(canDown, onDown, <ChevronDown size={15} strokeWidth={2.6} />, "#5A6473")}
      {mini(true, onEdit, <Pencil size={14} />, "#5A6473")}
      {mini(true, onDelete, <Trash2 size={14} />, "#E11D2A")}
    </div>
  );
}

function CategoriesView({ cats, inv, selT1, setSelT1, onAdd, onEdit, onDelete, onMove }) {
  const [editId, setEditId] = useState(null);
  const [eName, setEName] = useState(""); const [eIcon, setEIcon] = useState("");
  const [adding, setAdding] = useState(null); // "t1" | "t2" | null
  const [nName, setNName] = useState(""); const [nIcon, setNIcon] = useState("");

  // إغلاق أي نموذج إضافة/تعديل مفتوح عند تبديل القسم الرئيسي المحدّد (يمنع إعادة توجيه الأب)
  useEffect(() => { setAdding(null); setEditId(null); }, [selT1]);

  const bySort = (a, b) => a.sort - b.sort;
  const tier1 = cats.filter((c) => c.parentId == null).sort(bySort);
  const tier2 = cats.filter((c) => c.parentId === selT1).sort(bySort);
  const childCount = (id) => cats.filter((c) => c.parentId === id).length;
  const prodCountByName = useMemo(() => inv.reduce((m, p) => { m[p.cat] = (m[p.cat] || 0) + 1; return m; }, {}), [inv]);
  const uncategorized = inv.filter((p) => p.cat === "أخرى").length;
  const subCount = cats.filter((c) => c.parentId != null).length;

  const resolveIcon = (c) => ICON_MAP[c.iconName || CAT_ICON[c.name] || "Package"] || ICON_MAP.Package;
  const accentOf = (c) => CAT_ACCENT[c.name] || "#0C831F";
  const selRow = tier1.find((t) => t.id === selT1);
  const selName = selRow?.name;
  const canAddSub = !!selT1 && !selRow?._pending; // لا تُضِف تفرّعاً لقسم لم يُحفظ بعد

  const startEdit = (c) => { setAdding(null); setEditId(c.id); setEName(c.name); setEIcon(c.iconName || ""); };
  const cancelEdit = () => { setEditId(null); setEName(""); setEIcon(""); };
  const saveEdit = () => { const n = eName.trim(); if (!n) return; onEdit(editId, n, eIcon || null); cancelEdit(); };

  const openAdd = (which) => { cancelEdit(); setAdding(which); setNName(""); setNIcon(""); };
  const cancelAdd = () => { setAdding(null); setNName(""); setNIcon(""); };
  const submitAdd = () => {
    const n = nName.trim(); if (!n) return;
    if (adding === "t2" && !selT1) return;
    onAdd(n, nIcon || null, adding === "t2" ? selT1 : null);
    cancelAdd();
  };

  const confirmDel = (c) => {
    const msg = c.parentId == null
      ? "سيتم حذف القسم وكل تفرّعاته، وتصبح منتجاته غير مصنّفة. متابعة؟"
      : "سيتم حذف هذا التفرّع. متابعة؟";
    if (window.confirm(msg)) onDelete(c.id);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Metric label="أقسام رئيسية" num={String(tier1.length)} Icon={FolderTree} tint="#EAF6EC" color="#0C831F" sub="قسم رئيسي" subColor="#9AA3AF" />
        <Metric label="أقسام فرعية" num={String(subCount)} Icon={Folder} tint="#E8F0FE" color="#2563EB" sub="تفرّع" subColor="#2563EB" />
        <Metric label="منتجات غير مصنّفة" num={String(uncategorized)} Icon={AlertTriangle} tint="#FEF3E2" color="#D98A1F" sub="بحاجة تصنيف" subColor="#D98A1F" pulse={uncategorized > 0} />
      </div>

      <div className="panel rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-[320px_1fr]">
        {/* ===== MASTER: tier1 ===== */}
        <div style={{ borderInlineEnd: "1px solid #F0F1F3" }}>
          <div className="flex items-center justify-between gap-2 p-4">
            <h3 className="text-base font-extrabold">الأقسام الرئيسية</h3>
            <button onClick={() => openAdd("t1")} className="btn-green rounded-lg flex items-center gap-1.5 text-xs font-extrabold" style={{ padding: "7px 12px" }}><Plus size={15} /> قسم</button>
          </div>
          <div className="px-3 pb-3 flex flex-col gap-1 no-scrollbar" style={{ maxHeight: 560, overflowY: "auto" }}>
            {tier1.length === 0 && adding !== "t1" && <p className="text-center text-sm py-8" style={{ color: "#AEB6BF" }}>لا توجد أقسام بعد</p>}
            {tier1.map((c, i) => {
              const Ic = resolveIcon(c); const on = c.id === selT1;
              if (editId === c.id) return <div key={c.id} className="rounded-xl p-2" style={{ background: "#F7FBF8" }}><CatForm name={eName} setName={setEName} icon={eIcon} setIcon={setEIcon} onSave={saveEdit} onCancel={cancelEdit} placeholder="اسم القسم..." /></div>;
              return (
                <div key={c.id} onClick={() => setSelT1(c.id)} className={"side-item flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer " + (on ? "on" : "")} style={c._pending ? { opacity: 0.55 } : undefined}>
                  <span className="rounded-lg flex items-center justify-center shrink-0" style={{ width: 40, height: 40, background: "#F3F5F8" }}><Ic size={20} style={{ color: accentOf(c) }} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{c.name}</p>
                    <p className="text-xs" style={{ color: "#9AA3AF" }}>{childCount(c.id)} تفرّع · {prodCountByName[c.name] || 0} منتج</p>
                  </div>
                  {!c._pending && <RowActions canUp={i > 0 && !tier1[i - 1]._pending} canDown={i < tier1.length - 1 && !tier1[i + 1]._pending} onUp={() => onMove(c.id, -1)} onDown={() => onMove(c.id, 1)} onEdit={() => startEdit(c)} onDelete={() => confirmDel(c)} />}
                </div>
              );
            })}
            {adding === "t1" && <div className="rounded-xl p-2" style={{ background: "#F7FBF8" }}><CatForm name={nName} setName={setNName} icon={nIcon} setIcon={setNIcon} onSave={submitAdd} onCancel={cancelAdd} placeholder="اسم القسم الجديد..." /></div>}
          </div>
        </div>

        {/* ===== DETAIL: tier2 ===== */}
        <div>
          <div className="flex items-center justify-between gap-2 p-4">
            <h3 className="text-base font-extrabold truncate">تفرّعات: {selName || "—"}</h3>
            <button onClick={() => canAddSub && openAdd("t2")} className={"rounded-lg flex items-center gap-1.5 text-xs font-extrabold " + (canAddSub ? "btn-green" : "btn-ghost")} style={{ padding: "7px 12px", opacity: canAddSub ? 1 : 0.5, pointerEvents: canAddSub ? "auto" : "none" }}><Plus size={15} /> تفرّع</button>
          </div>
          {!selT1 ? (
            <div className="flex flex-col items-center justify-center" style={{ padding: "64px 16px", color: "#AEB6BF" }}><Folder size={34} /><p className="text-sm font-bold mt-2">اختر قسماً رئيسياً لعرض تفرّعاته</p></div>
          ) : (
            <div className="px-3 pb-3">
              {tier2.length === 0 && adding !== "t2" && <p className="text-center text-sm py-12" style={{ color: "#AEB6BF" }}>لا توجد تفرّعات بعد</p>}
              {tier2.map((c, i) => {
                const Ic = resolveIcon(c);
                if (editId === c.id) return <div key={c.id} className="rounded-xl p-2 my-1" style={{ background: "#F7FBF8" }}><CatForm name={eName} setName={setEName} icon={eIcon} setIcon={setEIcon} onSave={saveEdit} onCancel={cancelEdit} placeholder="اسم التفرّع..." /></div>;
                return (
                  <div key={c.id} className="tbl-row flex items-center gap-3 rounded-xl px-3 py-2.5" style={c._pending ? { opacity: 0.55 } : undefined}>
                    <span className="rounded-lg flex items-center justify-center shrink-0" style={{ width: 32, height: 32, background: "#F3F5F8" }}><Ic size={17} style={{ color: accentOf(c) }} /></span>
                    <p className="text-sm font-bold flex-1 truncate">{c.name}</p>
                    {(prodCountByName[c.name] || 0) > 0 && <span className="text-xs font-bold rounded-full px-2 py-0.5" style={{ background: "#F1F3F6", color: "#5A6473" }}>{prodCountByName[c.name]} منتج</span>}
                    {!c._pending && <RowActions canUp={i > 0 && !tier2[i - 1]._pending} canDown={i < tier2.length - 1 && !tier2[i + 1]._pending} onUp={() => onMove(c.id, -1)} onDown={() => onMove(c.id, 1)} onEdit={() => startEdit(c)} onDelete={() => confirmDel(c)} />}
                  </div>
                );
              })}
              {adding === "t2" && <div className="rounded-xl p-2 my-1" style={{ background: "#F7FBF8" }}><CatForm name={nName} setName={setNName} icon={nIcon} setIcon={setNIcon} onSave={submitAdd} onCancel={cancelAdd} placeholder="اسم التفرّع الجديد..." /></div>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/*  واجهة الصفحة الرئيسية — تحكّم برأس صفحة الزبون (نص/ألوان/إيموجي)     */
/* ================================================================== */
const hf = { border: "1px solid #E6E9EE", height: 42, borderRadius: 10, padding: "0 12px", outline: "none", background: "#fff", width: "100%" };
function HField({ label, hint, children }) {
  return <div><label className="text-xs font-bold mb-1 block" style={{ color: "#5A6473" }}>{label}{hint && <span className="font-medium" style={{ color: "#AEB6BF" }}> — {hint}</span>}</label>{children}</div>;
}
function ColorField({ label, value, onChange }) {
  return (
    <HField label={label}>
      <div className="flex items-center gap-2">
        <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)} style={{ width: 44, height: 42, border: "1px solid #E6E9EE", borderRadius: 10, padding: 3, background: "#fff", cursor: "pointer" }} />
        <input value={value || ""} onChange={(e) => onChange(e.target.value)} className="text-sm font-bold" style={{ ...hf, flex: 1, direction: "ltr", textAlign: "left" }} />
      </div>
    </HField>
  );
}
function SettingCard({ icon: Ic, title, sub, right, children }) {
  return (
    <div className="panel rounded-2xl p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="rounded-xl flex items-center justify-center shrink-0" style={{ width: 38, height: 38, background: "#EAF6EC" }}><Ic size={19} style={{ color: "#0C831F" }} /></span>
          <div><h3 className="text-base font-extrabold leading-none">{title}</h3>{sub && <p className="text-xs mt-1" style={{ color: "#9AA3AF" }}>{sub}</p>}</div>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}
function MiniToggle({ on, onClick }) {
  return (
    <button onClick={onClick} className="toggle-track rounded-full shrink-0" style={{ width: 44, height: 25, background: on ? "#0C831F" : "#C7CDD6", padding: 3, justifyContent: on ? "flex-start" : "flex-end" }}>
      <span className="toggle-knob block rounded-full" style={{ width: 19, height: 19, background: "#fff" }} />
    </button>
  );
}

function HomeSettingsView({ config, cats, inv, onSave }) {
  const tier1 = cats.filter((c) => c.parentId == null).sort((a, b) => a.sort - b.sort);
  const [draft, setDraft] = useState(config);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  // مزامنة المسودّة عند وصول الإعداد من الـ API بعد التحميل
  useEffect(() => { setDraft(config); }, [config]);

  const setTop = (k, v) => setDraft((d) => ({ ...d, top: { ...d.top, [k]: v } }));
  const setWel = (k, v) => setDraft((d) => ({ ...d, welcome: { ...d.welcome, [k]: v } }));
  const setBest = (k, v) => setDraft((d) => ({ ...d, best: { ...d.best, [k]: v } }));
  const cards = draft.best.cards || [];
  const setCards = (fn) => setDraft((d) => ({ ...d, best: { ...d.best, cards: fn(d.best.cards || []) } }));

  const usedIds = new Set(cards.map((c) => c.catId));
  const available = tier1.filter((c) => !usedIds.has(c.id));
  const addCard = () => { const c = available[0]; if (!c) return; setCards((cs) => [...cs, { catId: c.id, name: "", color: CAT_ACCENT[c.name] || "#0C831F", emoji: "" }]); };
  const updCard = (i, k, v) => setCards((cs) => cs.map((c, j) => (j === i ? { ...c, [k]: v } : c)));
  const delCard = (i) => setCards((cs) => cs.filter((_, j) => j !== i));
  const moveCard = (i, dir) => setCards((cs) => { const j = i + dir; if (j < 0 || j >= cs.length) return cs; const n = [...cs]; [n[i], n[j]] = [n[j], n[i]]; return n; });

  const nameOf = (id) => { const c = tier1.find((x) => x.id === id); return c ? c.name : "—"; };
  const deptEmojis = (id) => {
    const nm = nameOf(id);
    const e = inv.filter((p) => p.cat === nm).slice(0, 4).map((p) => p.emoji || emojiFor(p.name));
    while (e.length < 4) e.push("🛒");
    return e;
  };
  const deptCount = (id) => inv.filter((p) => p.cat === nameOf(id)).length;
  // بطاقات المعاينة: المضبوطة يدوياً، وإلا أول ٦ أقسام تلقائياً (مثل الصفحة الرئيسية)
  const previewCards = cards.length ? cards : tier1.slice(0, 6).map((c) => ({ catId: c.id, name: "", color: CAT_ACCENT[c.name] || "#0C831F", emoji: "" }));

  const save = async () => { setBusy(true); try { await onSave(draft); setSaved(true); setTimeout(() => setSaved(false), 2600); } catch (e) { console.error(e); alert("تعذّر الحفظ: " + (e.message || "")); } finally { setBusy(false); } };
  const resetAll = () => { if (window.confirm("استرجاع الإعدادات الافتراضية للصفحة الرئيسية؟")) setDraft(DEFAULT_HOME_CONFIG); };

  const w = draft.welcome;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5 items-start">
      {/* ===== المحرّر ===== */}
      <div className="flex flex-col gap-5">
        {/* الترويسة العلوية */}
        <SettingCard icon={Clock} title="الترويسة العلوية" sub="السطر الأعلى فوق شريط البحث (وقت التوصيل / الحالة)">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <HField label="السطر الصغير"><input value={draft.top.label} onChange={(e) => setTop("label", e.target.value)} className="text-sm font-bold" style={hf} placeholder="التوصيل خلال" /></HField>
            <HField label="النص الكبير"><input value={draft.top.value} onChange={(e) => setTop("value", e.target.value)} className="text-sm font-bold" style={hf} placeholder="16 دقيقة" /></HField>
            <HField label="الشارة" hint="اتركها فارغة لإخفائها"><input value={draft.top.badge} onChange={(e) => setTop("badge", e.target.value)} className="text-sm font-bold" style={hf} placeholder="24/7" /></HField>
          </div>
        </SettingCard>

        {/* بانر الترحيب */}
        <SettingCard icon={Palette} title="بانر الترحيب" sub="يظهر أعلى تبويب «الكل»" right={<MiniToggle on={w.on} onClick={() => setWel("on", !w.on)} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ opacity: w.on ? 1 : 0.5, pointerEvents: w.on ? "auto" : "none" }}>
            <HField label="العنوان"><input value={w.title} onChange={(e) => setWel("title", e.target.value)} className="text-sm font-bold" style={hf} placeholder="أهلاً وسهلاً" /></HField>
            <HField label="السطر الفرعي"><input value={w.subtitle} onChange={(e) => setWel("subtitle", e.target.value)} className="text-sm font-bold" style={hf} placeholder="اطلب الآن واستمتع بتوصيل مجاني" /></HField>
            <HField label="إيموجي وسط العنوان"><input value={w.emoji} onChange={(e) => setWel("emoji", e.target.value)} className="text-sm font-bold" style={{ ...hf, textAlign: "center" }} placeholder="🎈" /></HField>
            <HField label="إيموجي الجانبين"><input value={w.side} onChange={(e) => setWel("side", e.target.value)} className="text-sm font-bold" style={{ ...hf, textAlign: "center" }} placeholder="🛍️" /></HField>
            <ColorField label="لون التدرّج (بداية)" value={w.c1} onChange={(v) => setWel("c1", v)} />
            <ColorField label="لون التدرّج (نهاية)" value={w.c2} onChange={(v) => setWel("c2", v)} />
            <ColorField label="لون النص" value={w.text} onChange={(v) => setWel("text", v)} />
          </div>
        </SettingCard>

        {/* بطاقات الأكثر مبيعاً */}
        <SettingCard icon={Boxes} title="بطاقات الأكثر مبيعاً" sub="بطاقات الأقسام تحت بانر الترحيب" right={<MiniToggle on={draft.best.on} onClick={() => setBest("on", !draft.best.on)} />}>
          <div style={{ opacity: draft.best.on ? 1 : 0.5, pointerEvents: draft.best.on ? "auto" : "none" }}>
            <HField label="عنوان القسم"><input value={draft.best.title} onChange={(e) => setBest("title", e.target.value)} className="text-sm font-bold" style={{ ...hf, maxWidth: 320 }} placeholder="الأكثر مبيعاً" /></HField>
            <div className="mt-4 flex flex-col gap-2.5">
              {cards.length === 0 && <p className="text-sm rounded-xl px-4 py-3" style={{ background: "#F7F8FA", color: "#7A8493" }}>لا بطاقات مخصّصة — ستظهر أول ٦ أقسام تلقائياً. أضِف بطاقات للتحكّم بالاختيار والألوان والترتيب.</p>}
              {cards.map((cd, i) => (
                <div key={i} className="rounded-xl p-3 flex items-center gap-2 flex-wrap" style={{ background: "#F7F8FA", border: "1px solid #EFF1F4" }}>
                  <span className="rounded-lg flex items-center justify-center shrink-0" style={{ width: 38, height: 38, background: (cd.color || "#0C831F") + "1F", fontSize: 20 }}>{cd.emoji || emojiFor(nameOf(cd.catId))}</span>
                  <select value={cd.catId} onChange={(e) => updCard(i, "catId", e.target.value)} className="text-sm font-bold" style={{ ...hf, width: "auto", flex: "1 1 150px" }}>
                    {tier1.filter((c) => c.id === cd.catId || !usedIds.has(c.id)).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input value={cd.name} onChange={(e) => updCard(i, "name", e.target.value)} className="text-sm font-bold" style={{ ...hf, width: "auto", flex: "1 1 120px" }} placeholder={nameOf(cd.catId)} />
                  <input type="color" value={cd.color || "#0C831F"} onChange={(e) => updCard(i, "color", e.target.value)} title="لون البطاقة" style={{ width: 42, height: 40, border: "1px solid #E6E9EE", borderRadius: 9, padding: 3, background: "#fff", cursor: "pointer" }} />
                  <input value={cd.emoji} onChange={(e) => updCard(i, "emoji", e.target.value)} className="text-sm font-bold" style={{ ...hf, width: 60, textAlign: "center" }} placeholder="🛒" />
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => moveCard(i, -1)} disabled={i === 0} className="stepmini rounded-lg flex items-center justify-center" style={{ width: 30, height: 30, color: "#5A6473", opacity: i === 0 ? 0.35 : 1 }}><ChevronUp size={15} /></button>
                    <button onClick={() => moveCard(i, 1)} disabled={i === cards.length - 1} className="stepmini rounded-lg flex items-center justify-center" style={{ width: 30, height: 30, color: "#5A6473", opacity: i === cards.length - 1 ? 0.35 : 1 }}><ChevronDown size={15} /></button>
                    <button onClick={() => delCard(i)} className="icon-btn rounded-lg flex items-center justify-center" style={{ width: 30, height: 30, color: "#E11D2A", background: "#FDECEC" }}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              <button onClick={addCard} disabled={available.length === 0} className="btn-ghost rounded-xl flex items-center justify-center gap-2 text-sm font-extrabold mt-1" style={{ padding: "11px", opacity: available.length === 0 ? 0.5 : 1 }}><Plus size={16} /> {available.length === 0 ? "كل الأقسام مُضافة" : "إضافة بطاقة قسم"}</button>
            </div>
          </div>
        </SettingCard>

        <div className="flex items-center gap-3">
          <button onClick={save} disabled={busy} className="btn-green rounded-xl flex items-center justify-center gap-2 text-sm font-extrabold" style={{ padding: "13px 26px", opacity: busy ? 0.6 : 1 }}>
            {busy ? <><Loader2 size={17} className="spin" /> جاري الحفظ…</> : saved ? <><CheckCircle2 size={17} /> تم الحفظ ✓</> : <><Check size={17} /> حفظ ونشر التغييرات</>}
          </button>
          <button onClick={resetAll} className="btn-ghost rounded-xl flex items-center gap-2 text-sm font-bold" style={{ padding: "13px 18px" }}><RotateCcw size={15} /> استرجاع الافتراضي</button>
          {saved && <span className="text-sm font-bold" style={{ color: "#0C831F" }}>ستظهر التغييرات للزبون فوراً</span>}
        </div>
      </div>

      {/* ===== معاينة حيّة ===== */}
      <div className="panel rounded-2xl overflow-hidden xl:sticky" style={{ top: 92 }}>
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid #F1F2F4" }}>
          <Eye size={16} style={{ color: "#0C831F" }} /><span className="text-sm font-extrabold">معاينة مباشرة</span>
        </div>
        <div dir="rtl" style={{ background: "#fff", maxHeight: "70vh", overflowY: "auto" }}>
          {/* ترويسة */}
          <div style={{ background: "radial-gradient(135% 100% at 50% -20%, #FCE08A 0%, #F4C53D 48%, #E7AB22 100%)", padding: "12px 16px" }}>
            <p className="text-xs font-bold" style={{ color: "rgba(58,42,10,.84)" }}>{draft.top.label || "—"}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-black" style={{ color: "#3A2A0A", fontSize: 24 }}>{draft.top.value || "—"}</span>
              {draft.top.badge ? <span className="text-xs font-bold rounded-full px-2 py-0.5" style={{ background: "rgba(58,42,10,.12)", color: "#3A2A0A" }}>{draft.top.badge}</span> : null}
            </div>
            <div className="mt-2 rounded-xl flex items-center gap-2 px-3" style={{ background: "#fff", height: 38 }}>
              <Search size={16} style={{ color: "#9AA3AF" }} /><span className="text-xs font-bold" style={{ color: "#9AA3AF" }}>دور على «مشروبات غازية»</span>
            </div>
          </div>
          {/* بانر الترحيب */}
          {w.on && (
            <div style={{ background: `linear-gradient(180deg, ${w.c1}, ${w.c2})`, color: w.text, borderEndStartRadius: 28, borderEndEndRadius: 28 }}>
              <div className="flex items-center justify-center gap-2 px-4 py-4">
                {w.side ? <span style={{ fontSize: 30 }}>{w.side}</span> : null}
                <div className="text-center min-w-0">
                  <p className="font-black leading-tight" style={{ color: w.text, fontSize: 17 }}>✦ {w.title} {w.emoji} ✦</p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: w.text, opacity: 0.95 }}>{w.subtitle}</p>
                </div>
                {w.side ? <span style={{ fontSize: 30 }}>{w.side}</span> : null}
              </div>
            </div>
          )}
          {/* الأكثر مبيعاً */}
          {draft.best.on && (
            <div className="px-3 pt-4 pb-5">
              <h4 className="text-sm font-extrabold mb-2 px-0.5">{draft.best.title || "الأكثر مبيعاً"}</h4>
              <div className="grid grid-cols-3 gap-2">
                {previewCards.slice(0, 6).map((cd, i) => {
                  const e = deptEmojis(cd.catId);
                  return (
                    <div key={i} className="rounded-xl p-1.5" style={{ background: (cd.color || "#9AA8B5") + "14", border: "1px solid " + (cd.color || "#ECEEF3") + "33" }}>
                      <div className="grid grid-cols-2 gap-0.5">
                        {[0, 1, 2, 3].map((k) => <div key={k} className="rounded flex items-center justify-center" style={{ aspectRatio: "1/1", background: "#fff", fontSize: 15 }}>{cd.emoji || e[k]}</div>)}
                      </div>
                      <span className="inline-block mt-1.5 text-[10px] font-bold rounded-full px-1.5 py-0.5" style={{ background: (cd.color || "#5A6473") + "22", color: cd.color || "#5A6473" }}>{deptCount(cd.catId)} منتج</span>
                      <p className="text-[11px] font-extrabold mt-0.5 leading-tight">{cd.name || nameOf(cd.catId)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
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
  const [cats, setCats] = useState([]);
  const [selT1, setSelT1] = useState(null);
  const [homeCfg, setHomeCfg] = useState(DEFAULT_HOME_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [p, o, c, r, cat, hc] = await Promise.all([getProducts(), getOrders(), getCustomers(), getRiders(), getCategories(), getHomeConfig()]);
        if (!alive) return;
        setInv(p); setOrders(o); setCustomers(c); setRiders(r);
        setCats(cat); setSelT1(cat.find((x) => x.parentId == null)?.id ?? null);
        setHomeCfg(hc);
      } catch (e) {
        console.error("فشل تحميل البيانات من Supabase:", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // حفظ إعدادات الصفحة الرئيسية: تحديث متفائل + استدعاء API (يعمل في الوضعين)
  const saveHome = async (cfg) => {
    setHomeCfg(cfg);
    const merged = await saveHomeConfig(cfg);
    setHomeCfg(merged);
    return merged;
  };

  // ---- إدارة الأقسام: تحديث متفائل + استدعاء API بلا انتظار (مثل accept/onAdjust) ----
  const addCat = (name, iconName, parentId) => {
    const sibs = cats.filter((x) => x.parentId === (parentId ?? null));
    const nextSort = sibs.length ? Math.max(...sibs.map((s) => s.sort)) + 1 : 0;
    const tmpId = "tmp" + Date.now();
    setCats((a) => [...a, { id: tmpId, name, iconName: iconName ?? null, parentId: parentId ?? null, sort: nextSort, _pending: true }]);
    if (parentId == null) setSelT1((s) => s ?? tmpId);
    createCategory({ name, iconName: iconName ?? null, parentId: parentId ?? null })
      .then((real) => {
        setCats((a) => a.map((x) => (x.id === tmpId ? { ...real, _pending: false } : x)));
        setSelT1((s) => (s === tmpId ? real.id : s)); // أبقِ التحديد على الصف الحقيقي بعد المزامنة
      })
      .catch((e) => { console.error(e); setCats((a) => a.filter((x) => x.id !== tmpId)); });
  };
  const editCat = (id, name, iconName) => {
    setCats((a) => a.map((x) => (x.id === id ? { ...x, name, iconName } : x)));
    updateCategory(id, { name, iconName }).catch(console.error);
  };
  const removeCat = (id) => {
    const prev = cats;
    setCats((a) => a.filter((x) => x.id !== id && x.parentId !== id));
    if (selT1 === id) setSelT1(prev.find((x) => x.parentId == null && x.id !== id)?.id ?? null);
    deleteCategory(id).catch((e) => { console.error(e); setCats(prev); });
  };
  const moveCat = (id, dir) => {
    const row = cats.find((x) => x.id === id);
    if (!row || row._pending) return;
    const sibs = cats.filter((x) => x.parentId === row.parentId && !x._pending).sort((a, b) => a.sort - b.sort);
    const i = sibs.findIndex((s) => s.id === id);
    const j = i + dir;
    if (j < 0 || j >= sibs.length) return;
    const a = sibs[i], b = sibs[j];
    const prev = cats;
    setCats((c) => c.map((x) => (x.id === a.id ? { ...x, sort: b.sort } : x.id === b.id ? { ...x, sort: a.sort } : x)));
    reorderCategory(id, dir, { aId: a.id, aSort: b.sort, bId: b.id, bSort: a.sort })
      .catch((e) => { console.error(e); setCats(prev); }); // تراجع عند فشل التبديل (غير ذرّي)
  };

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

  // ---- إدارة المنتجات: تحديث متفائل + استدعاء API (مثل الأقسام) ----
  // يبني حقول العرض المشتقّة (اسم القسم + اللون) من شجرة الأقسام المحمّلة.
  const enrich = (data) => {
    const c = cats.find((x) => x.id === data.categoryId);
    const t1 = c ? (c.parentId == null ? c : cats.find((x) => x.id === c.parentId)) : null;
    return { cat: t1?.name || "أخرى", accent: t1 ? (CAT_ACCENT[t1.name] || "#0C831F") : "#9AA8B5" };
  };
  const addProduct = (data) => {
    const tmpId = "tmp" + Date.now();
    setInv((a) => [{ id: tmpId, ...data, ...enrich(data), _pending: true }, ...a]);
    createProduct(data)
      .then((real) => setInv((a) => a.map((p) => (p.id === tmpId ? { ...real, _pending: false } : p))))
      .catch((e) => { console.error(e); setInv((a) => a.filter((p) => p.id !== tmpId)); });
  };
  const editProduct = (id, data) => {
    const prev = inv;
    setInv((a) => a.map((p) => (p.id === id ? { ...p, ...data, ...enrich(data) } : p)));
    updateProduct(id, data)
      .then((real) => { if (real) setInv((a) => a.map((p) => (p.id === id ? { ...p, ...real } : p))); })
      .catch((e) => { console.error(e); setInv(prev); });
  };
  const removeProduct = (id) => {
    const prev = inv;
    setInv((a) => a.filter((p) => p.id !== id));
    deleteProduct(id).catch((e) => { console.error(e); setInv(prev); });
  };
  // استيراد جماعي: ينشئ الأقسام/التفرّعات الناقصة ويعمل Upsert للمنتجات، ثم يحدّث الحالة
  const importProducts = async (rows) => {
    const { categories, products, stats } = await importCatalog(rows);
    setCats(categories);
    setInv(products);
    setSelT1((s) => s || categories.find((x) => x.parentId == null)?.id || null);
    return stats;
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
              {active === "inv" && <InventoryView inv={inv} cats={cats} onAdjust={onAdjust} onAdd={addProduct} onEdit={editProduct} onDelete={removeProduct} onImport={importProducts} />}
              {active === "cats" && <CategoriesView cats={cats} inv={inv} selT1={selT1} setSelT1={setSelT1} onAdd={addCat} onEdit={editCat} onDelete={removeCat} onMove={moveCat} />}
              {active === "home" && <HomeSettingsView config={homeCfg} cats={cats} inv={inv} onSave={saveHome} />}
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
