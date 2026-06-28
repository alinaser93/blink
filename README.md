# سلّـة — منصة كويك كومرس (العراق) 🇮🇶

تطبيق **كويك كومرس** متكامل (نمط Blinkit/Zepto) معرّب بالكامل (RTL + دينار عراقي + خطّ Cairo):

- **تطبيق الزبون (٧ شاشات):** الرئيسية والتبويبات · صفحة القسم · تفاصيل المنتج · البحث · السلة والدفع · العنوان/الخريطة · تتبّع الطلب.
- **لوحة التاجر:** نظرة عامة · الطلبات الحية (كانبان تفاعلي) · المنتجات والمخزون · العملاء · التقارير (رسوم بيانية).

مبني بـ **React + Vite + Tailwind CSS + React Router**.

---

## 🖥️ التشغيل محلياً

```bash
npm install
npm run dev
```

ثم افتح الرابط اللي يظهر (عادة `http://localhost:5173`).
الصفحة الرئيسية `/` هي **فهرس كل الشاشات** — اضغط أي شاشة لمعاينتها.

> ملاحظة: شاشات الزبون مصمّمة للموبايل — للمعاينة المثالية استخدم وضع الجوال في أدوات المطوّر (Responsive / Device mode) أو نافذة ضيّقة.

لبناء نسخة الإنتاج:

```bash
npm run build      # يولّد مجلّد dist/
npm run preview    # معاينة نسخة الإنتاج محلياً
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

(استبدل `USERNAME` باسمك على GitHub، وأنشئ المستودع أول من github.com).

---

## 2️⃣ النشر على Netlify

**الطريقة الأسهل (عبر GitHub):**
1. ادخل [netlify.com](https://netlify.com) وسجّل دخول بحساب GitHub.
2. **Add new site → Import an existing project → GitHub** واختر المستودع.
3. الإعدادات تنقرأ تلقائياً من `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. اضغط **Deploy** — وبعد دقيقة يطلع رابط مباشر للموقع.

ملف `netlify.toml` موجود ويتضمّن إعادة توجيه SPA حتى تشتغل الروابط الداخلية عند التحديث.

---

## 3️⃣ Supabase (الباك-إند — المرحلة الجاية)

حالياً البيانات وهمية (Mock) داخل الملفّات. لتحويلها لبيانات حيّة:

1. أنشئ مشروع على [supabase.com](https://supabase.com).
2. ثبّت الحزمة:
   ```bash
   npm install @supabase/supabase-js
   ```
3. انسخ `.env.example` إلى `.env` وحطّ بياناتك:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
4. فعّل الكود في `src/lib/supabase.js`.
5. الجداول المقترحة: `products` · `orders` · `order_items` · `customers` · `riders` · `users` (مع Auth وRLS).

> على Netlify: أضف نفس متغيّرات البيئة في **Site settings → Environment variables**.

---

## 📁 البنية

```
src/
├── main.jsx            # نقطة الدخول
├── App.jsx             # المسارات (Router)
├── Launcher.jsx        # فهرس الشاشات (/)
├── Frame.jsx           # زر "كل الشاشات" العائم
├── index.css           # Tailwind + خطّ Cairo
├── customer/           # شاشات تطبيق الزبون
├── admin/              # لوحة التاجر
└── lib/supabase.js     # عميل Supabase (لاحقاً)
```

صُنع بـ ❤️ — منصة سلّـة.
