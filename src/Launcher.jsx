import React from "react";
import { Link } from "react-router-dom";
import {
  Home, LayoutGrid, Package, Search, ShoppingCart, MapPin, Bike,
  LayoutDashboard, Store, ArrowLeft,
} from "lucide-react";

const CUSTOMER = [
  { to: "/app", label: "الرئيسية", desc: "الواجهة والتبويبات", Icon: Home, c: "#0C831F" },
  { to: "/app/category", label: "صفحة القسم", desc: "قائمة المنتجات", Icon: LayoutGrid, c: "#2B7A9B" },
  { to: "/app/product", label: "تفاصيل المنتج", desc: "صفحة المنتج", Icon: Package, c: "#C9692E" },
  { to: "/app/search", label: "البحث", desc: "بحث ونتائج", Icon: Search, c: "#7A5AB8" },
  { to: "/app/cart", label: "السلة والدفع", desc: "الفاتورة والدفع", Icon: ShoppingCart, c: "#0C831F" },
  { to: "/app/address", label: "العنوان والخريطة", desc: "تحديد الموقع", Icon: MapPin, c: "#D98A1F" },
  { to: "/app/track", label: "تتبّع الطلب", desc: "خريطة حيّة", Icon: Bike, c: "#C2477F" },
];

function Card({ to, label, desc, Icon, c }) {
  return (
    <Link to={to} className="group" style={{ textDecoration: "none" }}>
      <div className="rounded-2xl p-5 h-full" style={{ background: "#fff", border: "1px solid #F0F1F3", boxShadow: "0 1px 2px rgba(16,24,40,.04), 0 10px 26px rgba(16,24,40,.05)", transition: "all .18s ease" }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 18px 36px rgba(16,24,40,.12)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(16,24,40,.04), 0 10px 26px rgba(16,24,40,.05)"; }}>
        <div className="flex items-center justify-between">
          <div className="rounded-xl flex items-center justify-center" style={{ width: 50, height: 50, background: c + "18" }}><Icon size={26} style={{ color: c }} /></div>
          <ArrowLeft size={18} style={{ color: "#C7CDD6" }} />
        </div>
        <p className="text-lg font-extrabold mt-4" style={{ color: "#15171A" }}>{label}</p>
        <p className="text-sm mt-0.5" style={{ color: "#9AA3AF" }}>{desc}</p>
      </div>
    </Link>
  );
}

export default function Launcher() {
  return (
    <div dir="rtl" lang="ar" style={{ minHeight: "100vh", background: "#FAFAFA" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 20px 64px" }}>
        {/* header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-2xl flex items-center justify-center" style={{ width: 54, height: 54, background: "linear-gradient(135deg,#0C831F,#0A6A19)", boxShadow: "0 8px 20px rgba(12,131,31,.3)" }}><Store size={28} color="#fff" /></div>
          <div>
            <h1 className="text-3xl font-extrabold" style={{ color: "#15171A" }}>سلّـة</h1>
            <p className="text-sm" style={{ color: "#9AA3AF" }}>منصة كويك كومرس — مصمّمة للعراق 🇮🇶</p>
          </div>
        </div>
        <p className="text-base mb-8" style={{ color: "#5A6473" }}>اختر أي شاشة لمعاينتها. RTL بالكامل، بالدينار العراقي، وبخطّ Cairo.</p>

        {/* customer app */}
        <div className="flex items-center gap-2 mb-4">
          <span className="rounded-lg flex items-center justify-center" style={{ width: 30, height: 30, background: "#EAF6EC" }}><Home size={17} style={{ color: "#0C831F" }} /></span>
          <h2 className="text-xl font-extrabold" style={{ color: "#15171A" }}>تطبيق الزبون</h2>
          <span className="text-xs font-bold rounded-full px-2.5 py-1" style={{ background: "#F1F3F6", color: "#7A8493" }}>٧ شاشات</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {CUSTOMER.map((s) => <Card key={s.to} {...s} />)}
        </div>

        {/* admin */}
        <div className="flex items-center gap-2 mb-4">
          <span className="rounded-lg flex items-center justify-center" style={{ width: 30, height: 30, background: "#FBF3DA" }}><LayoutDashboard size={17} style={{ color: "#B8932E" }} /></span>
          <h2 className="text-xl font-extrabold" style={{ color: "#15171A" }}>لوحة التاجر</h2>
        </div>
        <Link to="/admin" style={{ textDecoration: "none" }}>
          <div className="rounded-2xl p-6 flex items-center gap-4" style={{ background: "linear-gradient(120deg,#0C831F 0%, #0A6A19 100%)", boxShadow: "0 16px 36px rgba(12,131,31,.28)", transition: "transform .18s ease" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}>
            <div className="rounded-2xl flex items-center justify-center shrink-0" style={{ width: 60, height: 60, background: "rgba(255,255,255,.18)" }}><LayoutDashboard size={30} color="#fff" /></div>
            <div className="flex-1">
              <p className="text-xl font-extrabold" style={{ color: "#fff" }}>لوحة الإدارة الكاملة</p>
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,.9)" }}>الرئيسية · الطلبات الحية (كانبان) · المخزون · العملاء · التقارير</p>
            </div>
            <ArrowLeft size={24} color="#fff" />
          </div>
        </Link>

        <p className="text-center text-xs mt-12" style={{ color: "#C7CDD6" }}>منصة سلّـة · بُنيت بـ React + Vite + Tailwind</p>
      </div>
    </div>
  );
}
