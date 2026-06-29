import {
  Apple, Milk, CupSoda, Popcorn, Egg, Wheat, Droplet, GlassWater, Carrot, Coffee, Package,
} from "lucide-react";

// خريطة اسم الأيقونة -> مكوّن lucide (لتحويل قيمة 'icon' القادمة من قاعدة البيانات)
export const ICON_MAP = { Apple, Milk, CupSoda, Popcorn, Egg, Wheat, Droplet, GlassWater, Carrot, Coffee, Package };

export const MOCK_PRODUCTS = [
  { id: "p1", name: "موز عضوي", cat: "خضار وفواكه", price: 2000, stock: 48, Icon: Apple, accent: "#D9A521" },
  { id: "p2", name: "حليب طازج كامل الدسم", cat: "ألبان", price: 1500, stock: 6, Icon: Milk, accent: "#2B7A9B" },
  { id: "p3", name: "بيبسي ٣٣٠ مل", cat: "مشروبات", price: 750, stock: 0, Icon: CupSoda, accent: "#23306E" },
  { id: "p4", name: "شيبس بنكهة الملح", cat: "سناكس", price: 1000, stock: 120, Icon: Popcorn, accent: "#E0A21F" },
  { id: "p5", name: "بيض طازج (٣٠ حبة)", cat: "ألبان", price: 4500, stock: 3, Icon: Egg, accent: "#C9923E" },
  { id: "p6", name: "رز بسمتي ٥ كغم", cat: "بقالة", price: 12000, stock: 25, Icon: Wheat, accent: "#9A6B2E" },
  { id: "p7", name: "زيت دوّار الشمس ١ لتر", cat: "بقالة", price: 3500, stock: 40, Icon: Droplet, accent: "#D9A521" },
  { id: "p8", name: "ماء معدني ١.٥ لتر", cat: "مشروبات", price: 500, stock: 0, Icon: GlassWater, accent: "#2B7A9B" },
  { id: "p9", name: "طماطم طازجة", cat: "خضار وفواكه", price: 1250, stock: 64, Icon: Carrot, accent: "#D33A3A" },
  { id: "p10", name: "جبنة شيدر مبشورة", cat: "ألبان", price: 6000, stock: 9, Icon: Milk, accent: "#D9A521" },
  { id: "p11", name: "تمر مجدول فاخر", cat: "بقالة", price: 8000, stock: 30, Icon: Wheat, accent: "#9A6B2E" },
  { id: "p12", name: "عصير برتقال طازج", cat: "مشروبات", price: 2000, stock: 18, Icon: Coffee, accent: "#E0852E" },
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
