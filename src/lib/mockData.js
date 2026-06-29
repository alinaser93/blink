import {
  Apple, Milk, CupSoda, Popcorn, Egg, Wheat, Droplet, GlassWater, Carrot, Coffee, Package,
} from "lucide-react";

// خريطة اسم الأيقونة -> مكوّن lucide (لتحويل قيمة 'icon' القادمة من قاعدة البيانات)
export const ICON_MAP = { Apple, Milk, CupSoda, Popcorn, Egg, Wheat, Droplet, GlassWater, Carrot, Coffee, Package };

/* =====================================================================
 *  الكتالوج الموحّد (مصدر الحقيقة الوحيد) — تُديره لوحة الأدمن، وتقرأه صفحات الزبون.
 *  شجرة من مستويين: قسم رئيسي (parentId=null) -> تفرّعات.
 *  المنتجات تُربط بـ categoryId (غالباً تفرّع tier2، وقد يكون قسماً رئيسياً).
 * ===================================================================== */
export const MOCK_CATEGORIES = [
  // ---- أقسام رئيسية (tier1) ----
  { id: "c1", name: "خضار وفواكه",            parentId: null, iconName: "Carrot",  sort: 0 },
  { id: "c2", name: "ألبان وبيض وخبز",        parentId: null, iconName: "Milk",    sort: 1 },
  { id: "c3", name: "مشروبات وعصائر",         parentId: null, iconName: "CupSoda", sort: 2 },
  { id: "c4", name: "سناكس وحلويات",          parentId: null, iconName: "Popcorn", sort: 3 },
  { id: "c5", name: "بقالة وأساسيات",         parentId: null, iconName: "Wheat",   sort: 4 },
  { id: "c6", name: "وجبات سريعة ومعلّبات",   parentId: null, iconName: "Coffee",  sort: 5 },
  { id: "c7", name: "العناية والجمال",        parentId: null, iconName: "Droplet", sort: 6 },
  { id: "c8", name: "أساسيات المنزل",         parentId: null, iconName: "Package", sort: 7 },

  // ---- تفرّعات c1: خضار وفواكه ----
  { id: "c1a", name: "خضار طازجة",   parentId: "c1", iconName: null, sort: 0 },
  { id: "c1b", name: "فواكه طازجة",  parentId: "c1", iconName: null, sort: 1 },
  { id: "c1c", name: "فواكه مستوردة", parentId: "c1", iconName: null, sort: 2 },
  { id: "c1d", name: "أعشاب وورقيات", parentId: "c1", iconName: null, sort: 3 },
  { id: "c1e", name: "خضار مجمّدة",  parentId: "c1", iconName: null, sort: 4 },

  // ---- تفرّعات c2: ألبان وبيض وخبز ----
  { id: "c2a", name: "حليب",          parentId: "c2", iconName: null, sort: 0 },
  { id: "c2b", name: "أجبان وألبان",  parentId: "c2", iconName: null, sort: 1 },
  { id: "c2c", name: "بيض",           parentId: "c2", iconName: null, sort: 2 },
  { id: "c2d", name: "خبز ومخبوزات",  parentId: "c2", iconName: null, sort: 3 },

  // ---- تفرّعات c3: مشروبات وعصائر ----
  { id: "c3a", name: "مشروبات غازية", parentId: "c3", iconName: null, sort: 0 },
  { id: "c3b", name: "عصائر",         parentId: "c3", iconName: null, sort: 1 },
  { id: "c3c", name: "ماء",           parentId: "c3", iconName: null, sort: 2 },
  { id: "c3d", name: "شاي وقهوة",     parentId: "c3", iconName: null, sort: 3 },

  // ---- تفرّعات c4: سناكس وحلويات ----
  { id: "c4a", name: "شيبس وتسالي",     parentId: "c4", iconName: null, sort: 0 },
  { id: "c4b", name: "شوكولاتة وحلويات", parentId: "c4", iconName: null, sort: 1 },
  { id: "c4c", name: "بسكويت وكيك",     parentId: "c4", iconName: null, sort: 2 },
  { id: "c4d", name: "آيس كريم",        parentId: "c4", iconName: null, sort: 3 },
  { id: "c4e", name: "مكسرات وبزر",     parentId: "c4", iconName: null, sort: 4 },

  // ---- تفرّعات c5: بقالة وأساسيات ----
  { id: "c5a", name: "رز وحبوب",          parentId: "c5", iconName: null, sort: 0 },
  { id: "c5b", name: "زيوت وسمن",         parentId: "c5", iconName: null, sort: 1 },
  { id: "c5c", name: "سكر وملح وبهارات",  parentId: "c5", iconName: null, sort: 2 },
  { id: "c5d", name: "معلّبات وصلصات",    parentId: "c5", iconName: null, sort: 3 },

  // ---- تفرّعات c6: وجبات سريعة ومعلّبات ----
  { id: "c6a", name: "مكرونة ووجبات سريعة", parentId: "c6", iconName: null, sort: 0 },
  { id: "c6b", name: "شوربات جاهزة",        parentId: "c6", iconName: null, sort: 1 },
  { id: "c6c", name: "أطعمة مجمّدة",        parentId: "c6", iconName: null, sort: 2 },

  // ---- تفرّعات c7: العناية والجمال ----
  { id: "c7a", name: "العناية بالبشرة", parentId: "c7", iconName: null, sort: 0 },
  { id: "c7b", name: "العناية بالشعر",  parentId: "c7", iconName: null, sort: 1 },
  { id: "c7c", name: "مكياج وعطور",     parentId: "c7", iconName: null, sort: 2 },

  // ---- تفرّعات c8: أساسيات المنزل ----
  { id: "c8a", name: "منظفات وتنظيف",        parentId: "c8", iconName: null, sort: 0 },
  { id: "c8b", name: "أدوات المطبخ والمائدة", parentId: "c8", iconName: null, sort: 1 },
  { id: "c8c", name: "إضاءة وبطاريات",       parentId: "c8", iconName: null, sort: 2 },
];

/* المنتجات: categoryId يشير لتفرّع (tier2) غالباً. rating/reviews عرضية (لا تُخزّن في القاعدة). */
export const MOCK_PRODUCTS = [
  // خضار طازجة (c1a)
  { id: "p1",  name: "طماطم طازجة",         categoryId: "c1a", weight: "500 غرام", price: 1250, mrp: 1600, stock: 64, rating: "4.4", reviews: "12 ألف" },
  { id: "p2",  name: "خيار إنجليزي",        categoryId: "c1a", weight: "500 غرام", price: 1800, mrp: 2100, stock: 40, rating: "4.3", reviews: "9 ألف" },
  { id: "p3",  name: "بصل أحمر",            categoryId: "c1a", weight: "1 كغم",    price: 1900, mrp: 2250, stock: 55, rating: "4.5", reviews: "30 ألف" },
  { id: "p4",  name: "بطاطا",               categoryId: "c1a", weight: "1 كغم",    price: 1250, mrp: 1500, stock: 70, rating: "4.4", reviews: "18 ألف" },
  { id: "p5",  name: "جزر برتقالي",          categoryId: "c1a", weight: "500 غرام", price: 1000, mrp: 1200, stock: 48, rating: "4.2", reviews: "6 ألف" },
  // فواكه طازجة (c1b)
  { id: "p6",  name: "موز عضوي",            categoryId: "c1b", weight: "1 كغم",    price: 2000, mrp: 2400, stock: 48, rating: "4.6", reviews: "40 ألف" },
  { id: "p7",  name: "تفاح أحمر",           categoryId: "c1b", weight: "1 كغم",    price: 3500, mrp: 4200, stock: 36, rating: "4.5", reviews: "15 ألف" },
  { id: "p8",  name: "برتقال أبو صرة",       categoryId: "c1b", weight: "1 كغم",    price: 2750, mrp: 3200, stock: 42, rating: "4.4", reviews: "8 ألف" },
  // فواكه مستوردة (c1c)
  { id: "p9",  name: "مانجو صفدا فاخر",      categoryId: "c1c", weight: "600 غرام", price: 6000, mrp: 7400, stock: 20, rating: "4.5", reviews: "3 ألف" },
  { id: "p10", name: "كرز أحمر مستورد",      categoryId: "c1c", weight: "200 غرام", price: 7450, mrp: 9350, stock: 12, rating: "4.5", reviews: "900" },
  // خضار مجمّدة (c1e)
  { id: "p11", name: "بازلاء خضراء مجمّدة",  categoryId: "c1e", weight: "500 غرام", price: 5750, mrp: 6750, stock: 30, rating: "4.5", reviews: "63 ألف" },
  { id: "p12", name: "خضار مشكّلة مجمّدة",   categoryId: "c1e", weight: "500 غرام", price: 3650, mrp: 4250, stock: 26, rating: "4.3", reviews: "9 ألف" },

  // حليب (c2a)
  { id: "p13", name: "حليب طازج كامل الدسم", categoryId: "c2a", weight: "1 لتر",   price: 1500, mrp: 1750, stock: 6,  rating: "4.5", reviews: "22 ألف" },
  { id: "p14", name: "حليب قليل الدسم",      categoryId: "c2a", weight: "1 لتر",   price: 1500, mrp: 0,    stock: 18, rating: "4.4", reviews: "11 ألف" },
  // أجبان وألبان (c2b)
  { id: "p15", name: "جبنة شيدر مبشورة",     categoryId: "c2b", weight: "200 غرام", price: 6000, mrp: 7000, stock: 9,  rating: "4.5", reviews: "7 ألف" },
  { id: "p16", name: "لبن زبادي طبيعي",      categoryId: "c2b", weight: "1 كغم",   price: 2500, mrp: 0,    stock: 22, rating: "4.6", reviews: "14 ألف" },
  // بيض (c2c)
  { id: "p17", name: "بيض طازج (٣٠ حبة)",    categoryId: "c2c", weight: "30 حبة",  price: 4500, mrp: 5000, stock: 3,  rating: "4.5", reviews: "20 ألف" },
  // خبز ومخبوزات (c2d)
  { id: "p18", name: "خبز صمون طازج",        categoryId: "c2d", weight: "6 حبات",  price: 1000, mrp: 0,    stock: 50, rating: "4.4", reviews: "9 ألف" },

  // مشروبات غازية (c3a)
  { id: "p19", name: "بيبسي ٣٣٠ مل",         categoryId: "c3a", weight: "330 مل",  price: 750,  mrp: 1000, stock: 0,  rating: "4.4", reviews: "28 ألف" },
  { id: "p20", name: "كوكا كولا",            categoryId: "c3a", weight: "330 مل",  price: 1900, mrp: 2000, stock: 80, rating: "4.5", reviews: "21 ألف" },
  { id: "p21", name: "سبرايت بنكهة الليمون", categoryId: "c3a", weight: "330 مل",  price: 1900, mrp: 2000, stock: 60, rating: "4.3", reviews: "17 ألف" },
  // عصائر (c3b)
  { id: "p22", name: "عصير برتقال طازج",     categoryId: "c3b", weight: "1 لتر",   price: 2000, mrp: 2500, stock: 18, rating: "4.4", reviews: "5 ألف" },
  { id: "p23", name: "عصير مانجو",           categoryId: "c3b", weight: "1 لتر",   price: 2250, mrp: 0,    stock: 24, rating: "4.5", reviews: "4 ألف" },
  // ماء (c3c)
  { id: "p24", name: "ماء معدني ١.٥ لتر",    categoryId: "c3c", weight: "1.5 لتر", price: 500,  mrp: 0,    stock: 0,  rating: "4.6", reviews: "33 ألف" },
  // شاي وقهوة (c3d)
  { id: "p25", name: "شاي أسود فاخر",        categoryId: "c3d", weight: "450 غرام", price: 4000, mrp: 5000, stock: 30, rating: "4.5", reviews: "12 ألف" },
  { id: "p26", name: "قهوة عربية مطحونة",    categoryId: "c3d", weight: "250 غرام", price: 5500, mrp: 6500, stock: 16, rating: "4.6", reviews: "8 ألف" },

  // شيبس وتسالي (c4a)
  { id: "p27", name: "شيبس بنكهة الملح",     categoryId: "c4a", weight: "150 غرام", price: 1000, mrp: 0,    stock: 120, rating: "4.3", reviews: "38 ألف" },
  { id: "p28", name: "بوشار بالجبن",         categoryId: "c4a", weight: "90 غرام",  price: 1250, mrp: 1500, stock: 60,  rating: "4.2", reviews: "9 ألف" },
  // شوكولاتة وحلويات (c4b)
  { id: "p29", name: "كيت كات أصابع شوكولاتة", categoryId: "c4b", weight: "38.5 غرام", price: 1500, mrp: 0, stock: 90, rating: "4.3", reviews: "390 ألف" },
  { id: "p30", name: "لوح شوكولاتة داكنة",   categoryId: "c4b", weight: "35 غرام",  price: 1750, mrp: 2000, stock: 70, rating: "4.6", reviews: "85 ألف" },
  // بسكويت وكيك (c4c)
  { id: "p31", name: "بسكويت كوكيز شوكولاتة", categoryId: "c4c", weight: "241 غرام", price: 4000, mrp: 8000, stock: 40, rating: "4.5", reviews: "30 ألف" },
  // آيس كريم (c4d)
  { id: "p32", name: "آيس كريم فانيلا عائلي", categoryId: "c4d", weight: "1 لتر",   price: 6500, mrp: 0,    stock: 25, rating: "4.5", reviews: "110 ألف" },
  // مكسرات وبزر (c4e)
  { id: "p33", name: "تمر مجدول فاخر",       categoryId: "c4e", weight: "500 غرام", price: 8000, mrp: 9500, stock: 30, rating: "4.6", reviews: "6 ألف" },

  // رز وحبوب (c5a)
  { id: "p34", name: "رز بسمتي ٥ كغم",       categoryId: "c5a", weight: "5 كغم",   price: 12000, mrp: 14000, stock: 25, rating: "4.5", reviews: "44 ألف" },
  // زيوت وسمن (c5b)
  { id: "p35", name: "زيت دوّار الشمس ١ لتر", categoryId: "c5b", weight: "1 لتر",   price: 3500, mrp: 4200, stock: 40, rating: "4.4", reviews: "17 ألف" },
  // سكر وملح وبهارات (c5c)
  { id: "p36", name: "سكر أبيض ناعم",        categoryId: "c5c", weight: "1 كغم",   price: 2750, mrp: 3750, stock: 50, rating: "4.4", reviews: "270 ألف" },
  { id: "p37", name: "ملح طعام نقي",         categoryId: "c5c", weight: "1 كغم",   price: 1500, mrp: 1650, stock: 64, rating: "4.5", reviews: "350 ألف" },
  // معلّبات وصلصات (c5d)
  { id: "p38", name: "معجون طماطم",          categoryId: "c5d", weight: "400 غرام", price: 1750, mrp: 0,    stock: 45, rating: "4.3", reviews: "8 ألف" },

  // مكرونة ووجبات سريعة (c6a)
  { id: "p39", name: "مكرونة ماجي سريعة",    categoryId: "c6a", weight: "300 غرام", price: 2900, mrp: 0,    stock: 70, rating: "4.6", reviews: "380 ألف" },
  { id: "p40", name: "نودلز واي واي",        categoryId: "c6a", weight: "420 غرام", price: 2000, mrp: 2400, stock: 46, rating: "4.4", reviews: "46 ألف" },
  // أطعمة مجمّدة (c6c)
  { id: "p41", name: "بطاطا مقلية مجمّدة",    categoryId: "c6c", weight: "1 كغم",   price: 4500, mrp: 5500, stock: 28, rating: "4.4", reviews: "11 ألف" },

  // العناية بالبشرة (c7a)
  { id: "p42", name: "كريم ترطيب للوجه",     categoryId: "c7a", weight: "50 مل",   price: 8000, mrp: 12000, stock: 20, rating: "4.5", reviews: "20 ألف" },
  // العناية بالشعر (c7b)
  { id: "p43", name: "شامبو للشعر التالف",   categoryId: "c7b", weight: "400 مل",  price: 7000, mrp: 0,     stock: 26, rating: "4.3", reviews: "18 ألف" },

  // منظفات وتنظيف (c8a)
  { id: "p44", name: "سائل غسيل الأطباق",    categoryId: "c8a", weight: "1 لتر",   price: 3000, mrp: 3800, stock: 35, rating: "4.4", reviews: "9 ألف" },
  // إضاءة وبطاريات (c8c)
  { id: "p45", name: "لمبة LED ذكية",        categoryId: "c8c", weight: "1 قطعة",  price: 7000, mrp: 9000, stock: 18, rating: "4.1", reviews: "4 ألف" },
];

export const MOCK_ORDERS = [
  { id: 1046, col: "new", time: "الآن", items: 8, total: 21000 },
  { id: 1045, col: "new", time: "منذ دقيقة", items: 3, total: 7000 },
  { id: 1042, col: "new", time: "منذ دقيقتين", items: 5, total: 12500 },
  { id: 1041, col: "packing", items: 4, total: 9500 },
  { id: 1040, col: "packing", items: 8, total: 18000 },
  { id: 1038, col: "dispatched", items: 6, total: 14000, rider: "أحمد", status: "في الطريق" },
  { id: 1037, col: "dispatched", items: 2, total: 5000, rider: "سجاد", status: "قرب الوصول" },
];
export const MOCK_CUSTOMERS = [
  { name: "علي حسن", phone: "0770 123 4567", orders: 24, spent: 312000, last: "اليوم", status: "نشط" },
  { name: "زينب كريم", phone: "0771 234 5678", orders: 8, spent: 96000, last: "أمس", status: "نشط" },
  { name: "مصطفى علاء", phone: "0780 345 6789", orders: 1, spent: 12500, last: "اليوم", status: "جديد" },
  { name: "حيدر قاسم", phone: "0750 456 7890", orders: 15, spent: 188000, last: "قبل ٣ أيام", status: "نشط" },
  { name: "فاطمة جواد", phone: "0772 567 8901", orders: 3, spent: 41000, last: "قبل أسبوع", status: "غير نشط" },
  { name: "كرار عبد", phone: "0781 678 9012", orders: 32, spent: 540000, last: "اليوم", status: "نشط" },
  { name: "سجى نور", phone: "0773 789 0123", orders: 2, spent: 23000, last: "قبل يومين", status: "جديد" },
];
export const MOCK_RIDERS = ["مصطفى", "حيدر", "علي", "كرار", "حسن"];
