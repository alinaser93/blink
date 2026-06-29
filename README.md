# سلّـة — منصة كويك كومرس (العراق) 🇮🇶

تطبيق **كويك كومرس** متكامل (نمط Blinkit/Zepto) معرّب بالكامل (RTL + دينار عراقي + خطّ Cairo)، مربوط بـ **Supabase**.

- **تطبيق الزبون** — يفتح مباشرة على الواجهة الرئيسية، ومترابط بالكامل: الرئيسية ↔ الأقسام ↔ تفاصيل المنتج ↔ البحث ↔ السلة ↔ الدفع ↔ العنوان ↔ تتبّع الطلب. **سلة مشتركة**: اللي تضيفه من أي شاشة يظهر بالسلة.
- **لوحة التاجر** — **منفصلة تماماً** على الرابط `/admin`: نظرة عامة · الطلبات الحية (كانبان) · المخزون · العملاء · التقارير (رسوم بيانية). مربوطة ببيانات Supabase الحيّة.

مبني بـ **React + Vite + Tailwind + React Router**.

---

## 🖥️ التشغيل محلياً

```bash
npm install
npm run dev
```

- التطبيق (الزبون): `http://localhost:5173/`
- لوحة التاجر: `http://localhost:5173/admin`

> شاشات الزبون مصمّمة للموبايل — للمعاينة المثالية استخدم وضع الجوال بأدوات المطوّر، أو افتحها من تلفونك.

البناء: `npm run build` (يولّد `dist/`) · المعاينة: `npm run preview`.

---

## 1️⃣ الرفع على GitHub

```bash
git init
git add .
git commit -m "منصة سلّة"
git branch -M main
git remote add origin https://github.com/USERNAME/salla-quick-commerce.git
git push -u origin main
```

---

## 2️⃣ النشر على Netlify

1. [netlify.com](https://netlify.com) → سجّل بحساب GitHub.
2. **Add new site → Import an existing project → GitHub** واختر المستودع.
3. الإعدادات تنقرأ تلقائياً من `netlify.toml` (Build: `npm run build` · Publish: `dist`).
4. **مهم:** أضف متغيّرات Supabase في **Site settings → Environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. **Deploy** (وبعد أي تغيير لمتغيّرات البيئة: Deploys → **Clear cache and deploy site**).

ملف `netlify.toml` فيه توجيه SPA حتى تشتغل الروابط (`/cart`, `/admin`...) عند التحديث.

---

## 3️⃣ Supabase (الباك-إند) — مربوط ✅

البيانات تجي من Supabase، مع ارتداد تلقائي لبيانات تجريبية إذا ما ضبطت المفاتيح.

1. أنشئ مشروع على [supabase.com](https://supabase.com).
2. **SQL Editor**: الصق `supabase/schema.sql` ونفّذه، ثم `supabase/seed.sql`.
3. **Settings → API**: انسخ الـ URL والـ publishable (anon) key.
4. انسخ `.env.example` إلى `.env` وحطّهم:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
5. افتح `/admin` — شارة **«متصل بقاعدة البيانات»** 🟢 ، وكل تعديل (طلب/مخزون) ينحفظ بقاعدة البيانات.

---

## 📁 البنية

```
├── netlify.toml
├── .env.example
├── supabase/
│   ├── schema.sql           # الجداول + RLS
│   └── seed.sql             # بيانات أولية
└── src/
    ├── main.jsx
    ├── App.jsx              # المسارات: / = تطبيق الزبون ، /admin = لوحة التاجر
    ├── index.css            # Tailwind + خطّ Cairo
    ├── lib/                 # supabase.js · api.js · mockData.js
    ├── customer/
    │   ├── cart.jsx         # السلة المشتركة + الشريط السفلي
    │   ├── HomePage.jsx · CategoryPage.jsx · ProductPage.jsx
    │   ├── SearchPage.jsx · CartPage.jsx
    │   └── AddressMapScreen.jsx · OrderTrackingScreen.jsx
    └── admin/
        └── AdminDashboard.jsx
```

صُنع بـ ❤️ — منصة سلّـة.
