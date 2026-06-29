# سلّـة — منصة كويك كومرس (العراق) 🇮🇶

تطبيق **كويك كومرس** متكامل (نمط Blinkit/Zepto) معرّب بالكامل (RTL + دينار عراقي + خطّ Cairo):

- **تطبيق الزبون (٧ شاشات):** الرئيسية والتبويبات · صفحة القسم · تفاصيل المنتج · البحث · السلة والدفع · العنوان/الخريطة · تتبّع الطلب.
- **لوحة التاجر:** نظرة عامة · الطلبات الحية (كانبان تفاعلي) · المنتجات والمخزون · العملاء · التقارير (رسوم بيانية).

مبني بـ **React + Vite + Tailwind CSS + React Router**، ومربوط بـ **Supabase** (مع ارتداد تلقائي لبيانات تجريبية).

---

## 🖥️ التشغيل محلياً

```bash
npm install
npm run dev
```

ثم افتح الرابط (عادة `http://localhost:5173`).
الصفحة الرئيسية `/` هي **فهرس كل الشاشات** — اضغط أي شاشة لمعاينتها.

> شاشات الزبون مصمّمة للموبايل — للمعاينة المثالية استخدم وضع الجوال بأدوات المطوّر (Device mode) أو نافذة ضيّقة.

للبناء:

```bash
npm run build      # يولّد مجلّد dist/
npm run preview    # معاينة نسخة الإنتاج
```

---

## 1️⃣ الرفع على GitHub

```bash
git init
git add .
git commit -m "أول نسخة - منصة سلّة"
git branch -M main
git remote add origin https://github.com/USERNAME/salla-quick-commerce.git
git push -u origin main
```

(استبدل `USERNAME` باسمك، وأنشئ المستودع أول من github.com).

---

## 2️⃣ النشر على Netlify

1. ادخل [netlify.com](https://netlify.com) وسجّل بحساب GitHub.
2. **Add new site → Import an existing project → GitHub** واختر المستودع.
3. الإعدادات تنقرأ تلقائياً من `netlify.toml` (Build: `npm run build` · Publish: `dist`).
4. **Deploy** — وبعد دقيقة يطلع رابط مباشر.

ملف `netlify.toml` يتضمّن إعادة توجيه SPA حتى تشتغل الروابط عند التحديث.

---

## 3️⃣ Supabase (الباك-إند) — جاهز ومربوط ✅

اللوحة **مربوطة فعلاً** بـ Supabase عبر طبقة `src/lib/api.js`، مع **ارتداد تلقائي للبيانات التجريبية** إذا ما ضبطت المفاتيح (فالموقع يشتغل بالحالتين). للتشغيل الحيّ:

1. أنشئ مشروع على [supabase.com](https://supabase.com).
2. من **SQL Editor**: الصق محتوى `supabase/schema.sql` ونفّذه (ينشئ الجداول + RLS)، ثم الصق `supabase/seed.sql` ونفّذه (يعبّي البيانات).
3. من **Project Settings → API**: انسخ الـ Project URL والـ anon key.
4. انسخ `.env.example` إلى `.env` وحطّهم:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
5. شغّل `npm run dev` — راح تشوف شارة **«متصل بقاعدة البيانات»** بأعلى اللوحة، والبيانات تجي حيّة. أي تعديل (قبول طلب، تجهيز، تسليم، أو تعديل مخزون) ينحفظ بقاعدة البيانات.

> على Netlify: أضف نفس المتغيّرين في **Site settings → Environment variables** ثم أعد النشر (Redeploy).

**الجداول:** `products` · `customers` · `riders` · `orders` · `order_items` (مع فهارس وRLS).
> ملاحظة: سياسات RLS الحالية مفتوحة للتجربة — قيّدها على المستخدمين المصرّح لهم في الإنتاج.

---

## 📁 البنية

```
├── netlify.toml            # إعداد النشر + توجيه SPA
├── .env.example            # متغيّرات Supabase
├── supabase/
│   ├── schema.sql          # إنشاء الجداول + RLS
│   └── seed.sql            # بيانات أولية
└── src/
    ├── main.jsx            # نقطة الدخول
    ├── App.jsx             # المسارات (Router)
    ├── Launcher.jsx        # فهرس الشاشات (/)
    ├── Frame.jsx           # زر "كل الشاشات" العائم
    ├── index.css           # Tailwind + خطّ Cairo
    ├── lib/
    │   ├── supabase.js     # عميل Supabase (من .env)
    │   ├── api.js          # طبقة البيانات (Supabase + ارتداد تجريبي)
    │   └── mockData.js     # البيانات التجريبية
    ├── customer/           # شاشات تطبيق الزبون
    └── admin/              # لوحة التاجر
```

صُنع بـ ❤️ — منصة سلّـة.
