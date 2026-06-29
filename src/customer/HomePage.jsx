import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./cart.jsx";
import { emojiFor } from "./emoji.js";
import {
  MapPin, ChevronDown, ChevronLeft, Wallet, User, Search, Mic, X, Clock,
  Bike, Home, Printer, LayoutGrid, ShoppingBag, ShoppingCart, Umbrella, Headphones, Sparkles, Lamp,
  Carrot, Wheat, Droplet, Milk, Croissant, Bean, Drumstick, CookingPot,
  Popcorn, Candy, CupSoda, Coffee, Soup, Sandwich, IceCreamCone,
  Scissors, Brush, Flower2, Baby, Pill, Wind,
  SprayCan, Shirt, Utensils, Trash2, PawPrint, Pencil, Plug,
  Plus, Minus, Heart, Star, Snowflake,
  Waves, Luggage, Dumbbell, Palette, BookOpen, Mouse, BatteryCharging, Boxes, Sofa,
} from "lucide-react";

/* ================================================================== */
/*  Styles                                                            */
/* ================================================================== */
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
.qc-app, .qc-app * { font-family:'Cairo', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif; -webkit-font-smoothing:antialiased; }
.qc-app { background:#FFFFFF; color:#1A1A1A; }
.no-scrollbar::-webkit-scrollbar { display:none; }
.no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
.icon-btn { transition:all .15s ease; }
.icon-btn:active { transform:scale(.93); }
.search-wrap { transition:box-shadow .15s ease; }
.search-wrap:focus-within { box-shadow:0 0 0 3px rgba(255,255,255,.4); }
.tab { transition:all .15s ease; opacity:.9; }
.tab:hover { opacity:1; transform:translateY(-1px); }
.tab-active { opacity:1; }
.welcome { background:linear-gradient(180deg,#6F4F29 0%, #5A3E1E 100%); color:#F5E3C0; }
.welcome-title { color:#FBEFCF; }
.best-card { background:#F3F4F8; border:1px solid #ECEEF3; transition:all .18s ease; cursor:pointer; }
.best-card:hover { box-shadow:0 10px 24px rgba(16,24,40,.10); transform:translateY(-2px); }
.best-pill { background:#E7EAF0; color:#5A6473; }
.img-box { background:#FFFFFF; }
.cat-tile { background:#F0F8FA; border:1px solid #E4EFF2; transition:all .18s ease; cursor:pointer; }
.cat-tile:hover { box-shadow:0 8px 20px rgba(16,24,40,.10); transform:translateY(-2px); }
.mosaic-card { background:#fff; border:1px solid #EEF0F3; transition:all .18s ease; cursor:pointer; }
.mosaic-card:hover { box-shadow:0 10px 24px rgba(16,24,40,.10); transform:translateY(-2px); }
.wish { box-shadow:0 1px 3px rgba(16,24,40,.18); transition:all .15s ease; }
.wish:active { transform:scale(.9); }
.add-btn { background:#fff; border:1px solid #0C831F; color:#0C831F; transition:all .15s ease; box-shadow:0 1px 3px rgba(16,24,40,.12); }
.add-btn:hover { background:#0C831F; color:#fff; }
.add-btn:active { transform:scale(.95); }
.stepper { background:#0C831F; color:#fff; box-shadow:0 1px 3px rgba(16,24,40,.12); }
.stepper-btn:hover { background:rgba(255,255,255,.18); }
.stepper-btn:active { transform:scale(.9); }
.all-pill { background:#EAF6EC; color:#0C831F; transition:background .15s ease; }
.all-pill:hover { background:#D7EEDB; }
.see-all { background:#F4F6F9; transition:background .15s ease; }
.see-all:hover { background:#EAEEF4; }
.feat-card { transition:transform .18s ease; cursor:pointer; }
.feat-card:hover { transform:translateY(-2px); }
.promo { box-shadow:0 12px 30px rgba(16,24,40,.16); }
.promo-cta { transition:transform .12s ease; }
.promo-cta:active { transform:scale(.96); }
.fb-card { background:#fff; border:1px solid #EEF0F3; box-shadow:0 8px 26px rgba(16,24,40,.12); }
.fb-x { transition:background .15s ease; }
.fb-x:hover { background:#F1F2F4; }
.bottom-nav { background:#fff; border-top:1px solid #ECECEC; box-shadow:0 -6px 20px rgba(16,24,40,.06); }
.nav-btn:active { transform:scale(.94); }
.nav-txt { font-size:11px; line-height:1.1; }
.loc-pop { position:absolute; top:100%; inset-inline-start:16px; inset-inline-end:16px; margin-top:8px; animation:fadeIn .15s ease; box-shadow:0 18px 40px rgba(0,0,0,.18); }
@media (min-width:640px){ .loc-pop{ inset-inline-end:auto; width:20rem; } }
.loc-item { transition:background .12s ease; }
.loc-item:hover { background:#F3F4F6; }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
`;

const linGrad = (g, a) => "linear-gradient(" + (a || 120) + "deg, " + g.join(", ") + ")";

/* ================================================================== */
/*  Themes per tab                                                    */
/* ================================================================== */
const THEMES = {
  all:    { grad: "radial-gradient(130% 95% at 50% -25%, #F9D262 0%, #E7AB22 52%, #DDA01C 100%)", solid: "#DDA01C", topText: "#FFFFFF", topSub: "rgba(255,255,255,.9)", tabText: "#FFFFFF", pill: "rgba(0,0,0,.18)", profileBg: "rgba(60,42,15,.55)" },
  vac:    { grad: "linear-gradient(180deg, #BFE3F5 0%, #D9F0FA 60%, #EAF7FC 100%)", solid: "#CDE9F6", topText: "#13405E", topSub: "#3D6E8C", tabText: "#13405E", pill: "rgba(19,64,94,.14)", profileBg: "rgba(19,64,94,.22)" },
  elec:   { grad: "linear-gradient(180deg, #2A2E5A 0%, #3A3F76 60%, #4A4F8C 100%)", solid: "#343A6E", topText: "#FFFFFF", topSub: "rgba(255,255,255,.85)", tabText: "#FFFFFF", pill: "rgba(255,255,255,.2)", profileBg: "rgba(255,255,255,.2)" },
  beauty: { grad: "linear-gradient(180deg, #F6BBD6 0%, #FBD7E7 60%, #FDEDF4 100%)", solid: "#F7C9DE", topText: "#7A2348", topSub: "#A8557A", tabText: "#7A2348", pill: "rgba(122,35,72,.14)", profileBg: "rgba(122,35,72,.2)" },
  decor:  { grad: "linear-gradient(180deg, #E5C49A 0%, #F0DBC0 60%, #F7ECDD 100%)", solid: "#E8CFAA", topText: "#5A3A1E", topSub: "#8A6440", tabText: "#5A3A1E", pill: "rgba(90,58,30,.14)", profileBg: "rgba(90,58,30,.2)" },
};

const TABS = [
  { id: "all", label: "الكل", Icon: ShoppingBag },
  { id: "vac", label: "عطلات", Icon: Umbrella },
  { id: "elec", label: "الكترونيات", Icon: Headphones },
  { id: "beauty", label: "تجميل", Icon: Sparkles },
  { id: "decor", label: "ديكور", Icon: Lamp },
];

/* ================================================================== */
/*  ALL tab data                                                      */
/* ================================================================== */
const BESTSELLERS = [
  { name: "شيبس وتسالي", count: "+313", e: ["🍟", "🍿", "🥨", "🧀"] },
  { name: "مشروبات وعصائر", count: "+208", e: ["🥤", "🧃", "💧", "🧉"] },
  { name: "آيس كريم والمزيد", count: "+88", e: ["🍦", "🍨", "🍧", "🍡"] },
  { name: "خضار وفواكه", count: "+137", e: ["🍅", "🥬", "🍌", "🥕"] },
  { name: "ألبان وخبز وبيض", count: "+28", e: ["🥛", "🧀", "🥚", "🥖"] },
  { name: "حلويات وشوكولاتة", count: "+240", e: ["🍫", "🍬", "🍪", "🍩"] },
];
const ICON_COLORS = ["#2B7A9B", "#B8860B", "#C2477F", "#0C831F", "#7A5AB8", "#C9692E", "#1F9B8A", "#C24747"];
const SECTIONS = [
  { title: "البقالة والمطبخ", items: [
    { name: "خضار وفواكه", Icon: Carrot }, { name: "طحين ورز وبقوليات", Icon: Wheat },
    { name: "زيوت وسمن وبهارات", Icon: Droplet }, { name: "ألبان وخبز وبيض", Icon: Milk },
    { name: "مخبوزات وبسكويت", Icon: Croissant }, { name: "مكسرات وحبوب الفطور", Icon: Bean },
    { name: "دجاج ولحوم وأسماك", Icon: Drumstick }, { name: "أدوات وأجهزة المطبخ", Icon: CookingPot },
  ]},
  { title: "السناكس والمشروبات", items: [
    { name: "شيبس وتسالي", Icon: Popcorn }, { name: "حلويات وشوكولاتة", Icon: Candy },
    { name: "مشروبات وعصائر", Icon: CupSoda }, { name: "شاي وقهوة وحليب", Icon: Coffee },
    { name: "وجبات سريعة", Icon: Soup }, { name: "صلصات ومربّيات", Icon: Sandwich },
    { name: "مكسرات وبزر", Icon: Bean }, { name: "آيس كريم والمزيد", Icon: IceCreamCone },
  ]},
  { title: "الجمال والعناية الشخصية", items: [
    { name: "الحمام والجسم", Icon: Droplet }, { name: "العناية بالشعر", Icon: Scissors },
    { name: "البشرة والوجه", Icon: Sparkles }, { name: "التجميل والمكياج", Icon: Brush },
    { name: "العناية النسائية", Icon: Flower2 }, { name: "العناية بالطفل", Icon: Baby },
    { name: "الصحة والدواء", Icon: Pill }, { name: "عطور ومزيلات", Icon: Wind },
  ]},
  { title: "أساسيات المنزل", items: [
    { name: "تنظيف المنزل", Icon: SprayCan }, { name: "منظفات الغسيل", Icon: Shirt },
    { name: "أدوات المائدة", Icon: Utensils }, { name: "نفايات وأكياس", Icon: Trash2 },
    { name: "العناية بالحيوانات", Icon: PawPrint }, { name: "أدوات مكتبية", Icon: Pencil },
    { name: "بطاريات وكهربائيات", Icon: Plug }, { name: "إضاءة وشموع", Icon: Lamp },
  ]},
];
const SWEETS = [
  { id: 101, name: "كيت كات أصابع شوكولاتة", weight: "38.5 غرام", price: 1500, rating: "4.3", reviews: "390 ألف", options: 3 },
  { id: 102, name: "آيس كريم فانيلا - علبة عائلية", weight: "1 لتر", price: 6500, rating: "4.5", reviews: "110 ألف", allLabel: "كل العلب" },
  { id: 103, name: "لوح شوكولاتة داكنة فاخرة", weight: "35 غرام", price: 1750, rating: "4.6", reviews: "85 ألف", allLabel: "كل الألواح" },
  { id: 104, name: "آيس كريم كورنيتو دبل شوكولاتة", weight: "105 مل", price: 2000, rating: "4.2", reviews: "230 ألف", options: 3 },
  { id: 105, name: "آيس كريم ستيك بالمانجو", weight: "60 مل", price: 1000, rating: "4.1", reviews: "140 ألف", options: 3 },
  { id: 106, name: "شوكولاتة بالحليب", weight: "26 غرام", price: 1250, rating: "4.5", reviews: "110 ألف", options: 3 },
];
const DRINKS = [
  { id: 201, name: "كوكا كولا دايت", weight: "330 مل", price: 2000, chilled: true, rating: "4.4", reviews: "280 ألف", options: 4 },
  { id: 202, name: "كوكا كولا", weight: "330 مل", price: 1900, mrp: 2000, chilled: true, rating: "4.5", reviews: "210 ألف", options: 3 },
  { id: 203, name: "سبرايت بنكهة الليمون", weight: "330 مل", price: 1900, mrp: 2000, chilled: true, rating: "4.3", reviews: "170 ألف" },
  { id: 204, name: "ثامز أب", weight: "750 مل", price: 1900, mrp: 2000, chilled: true, rating: "4.2", reviews: "330 ألف", options: 3 },
  { id: 205, name: "كوكا كولا - عبوة عائلية", weight: "2 لتر", price: 4250, rating: "4.6", reviews: "72 ألف", options: 2 },
  { id: 206, name: "سفن أب بالليمون", weight: "350 مل", price: 1250, chilled: true, rating: "4.5", reviews: "110 ألف" },
];
const GROCERY = [
  { id: 301, name: "ملح طعام نقي", weight: "1 كغم", price: 1500, mrp: 1650, rating: "4.5", reviews: "350 ألف", allLabel: "كل الملح" },
  { id: 302, name: "زيت خردل ممتاز", weight: "910 غرام", price: 9000, mrp: 10500, rating: "4.6", reviews: "170 ألف", allLabel: "كل الزيوت" },
  { id: 303, name: "سكر أبيض ناعم", weight: "1 كغم", price: 2750, mrp: 3750, rating: "4.4", reviews: "270 ألف", allLabel: "كل السكر" },
  { id: 304, name: "سكر خالٍ من الكبريت", weight: "1 كغم", price: 2750, mrp: 3250, rating: "4.5", reviews: "350 ألف", options: 2, allLabel: "كل السكر" },
  { id: 305, name: "سكر فاخر مكرر", weight: "1 كغم", price: 2900, mrp: 3750, rating: "4.6", reviews: "89 ألف", allLabel: "كل السكر" },
  { id: 306, name: "زيت كاتشي غاني", weight: "1 لتر", price: 9000, mrp: 12000, rating: "4.5", reviews: "44 ألف", allLabel: "كل الزيوت" },
];
const INSTANT = [
  { id: 401, name: "مكرونة ماجي بالبهارات - دقيقتين", weight: "300 غرام", price: 2900, rating: "4.6", reviews: "380 ألف", options: 2 },
  { id: 402, name: "مكرونة ماجي دبل ماسالا", weight: "95 غرام", price: 1000, rating: "4.3", reviews: "170 ألف", options: 3 },
  { id: 403, name: "مكرونة ماجي - عبوة كبيرة", weight: "420 غرام", price: 3950, mrp: 4500, rating: "4.5", reviews: "280 ألف", options: 2 },
  { id: 404, name: "مكرونة ماجي ميجا باك", weight: "900 غرام", price: 5500, rating: "4.6", reviews: "48 ألف" },
  { id: 405, name: "نودلز واي واي جاهزة", weight: "420 غرام", price: 2000, nonveg: true, rating: "4.4", reviews: "46 ألف", options: 3 },
  { id: 406, name: "مكرونة ماجي أتا نوتري", weight: "290 غرام", price: 3500, rating: "4.6", reviews: "72 ألف" },
];
const SPONSORED = [
  { id: 501, name: "بسكويت كوكيز محشي شوكولاتة", weight: "241.5 غرام", price: 4000, mrp: 8000, rating: "4.5", reviews: "30 ألف", options: 2 },
  { id: 502, name: "كوكيز برقائق الشوكولاتة", weight: "167 غرام", price: 3000, mrp: 3500, rating: "4.4", reviews: "55 ألف", options: 2 },
  { id: 503, name: "كيك شوكولاتة بطبقات", weight: "228 غرام", price: 6000, mrp: 7750, rating: "4.6", reviews: "40 ألف", options: 2 },
  { id: 504, name: "شوكولاتة بالحليب فاخرة", weight: "110 غرام", price: 3000, rating: "4.5", reviews: "110 ألف" },
  { id: 505, name: "بسكويت محشي بالكريمة", weight: "120 غرام", price: 1500, rating: "4.3", reviews: "90 ألف" },
  { id: 506, name: "براوني جاهز", weight: "150 غرام", price: 3500, rating: "4.4", reviews: "22 ألف" },
];
const FEATURED = [
  { title: "أساسيات الشتاء", grad: ["#2B5876", "#4E4376"], emoji: "🧥" },
  { title: "باقات الورد", grad: ["#B66A77", "#E8C5C1"], emoji: "💐" },
  { title: "آيس كريم لايت", grad: ["#C56AA8", "#F3D9E8"], emoji: "🍦" },
  { title: "عروض المنزل", grad: ["#3CA55C", "#90C978"], emoji: "🏠" },
];
const BANNER = { title: "شجّع فريقك المفضّل!", sub: "بروجكترات، سناكس، مشروبات والمزيد", cta: "تسوّق الآن", emoji: "🏏", grad: ["#3B2A6B", "#7A4FA0", "#E08A3C"], light: false };

/* ================================================================== */
/*  Other tabs content                                                */
/* ================================================================== */
const VAC_TOYS = [
  { id: 601, name: "أحجية حيوانات خشبية", weight: "4 قطع", price: 3000, mrp: 6000, rating: "4.5", reviews: "60", tags: ["4 قطع", "3+ سنوات"], stock: 1, allLabel: "كل الأحاجي" },
  { id: 602, name: "بلوكات ذكاء ملوّنة", weight: "طقم", price: 3000, rating: "4.2", reviews: "143", tags: ["3+ سنوات"], stock: 2, allLabel: "كل الأحاجي" },
  { id: 603, name: "أشكال هندسية تعليمية", weight: "طقم", price: 3500, rating: "4.1", reviews: "154", tags: ["3+ سنوات"], stock: 1, seeMore: true },
  { id: 604, name: "لوح أشكال خشبي ملوّن", weight: "طقم", price: 4000, rating: "4.6", reviews: "320", tags: ["3+ سنوات"], seeMore: true },
  { id: 605, name: "مجسم تركيب إبداعي", weight: "طقم", price: 5000, mrp: 6500, rating: "4.4", reviews: "210", tags: ["5+ سنوات"], stock: 3 },
  { id: 606, name: "ألعاب تركيب مغناطيسية", weight: "طقم", price: 6000, rating: "4.7", reviews: "88", tags: ["3+ سنوات"], seeMore: true },
];
const VAC_POOL = [
  { id: 611, name: "نظارة سباحة سيليكون للأطفال", weight: "1 قطعة", price: 3000, mrp: 6000, rating: "4.3", reviews: "527", tags: ["أطفال"], stock: 3 },
  { id: 612, name: "أذرع عوّامة للأطفال", weight: "زوج", price: 1500, mrp: 6000, rating: "4.0", reviews: "890", stock: 4 },
  { id: 613, name: "عوّامة باص مدرسي", weight: "1 قطعة", price: 5000, mrp: 15000, rating: "4.0", reviews: "156" },
  { id: 614, name: "طوق سباحة قابل للنفخ", weight: "1 قطعة", price: 2500, rating: "4.2", reviews: "340", stock: 5 },
  { id: 615, name: "كرة شاطئ ملوّنة", weight: "1 قطعة", price: 1500, rating: "4.4", reviews: "210", seeMore: true },
  { id: 616, name: "قبعة سباحة مطاطية", weight: "1 قطعة", price: 1750, rating: "4.1", reviews: "60", stock: 2 },
];
const ELEC_ITEMS = [
  { id: 701, name: "سماعات لاسلكية بلوتوث", weight: "1 قطعة", price: 25000, mrp: 40000, rating: "4.4", reviews: "12 ألف", options: 2 },
  { id: 702, name: "شاحن سريع 25 واط", weight: "1 قطعة", price: 12000, mrp: 18000, rating: "4.5", reviews: "8 ألف" },
  { id: 703, name: "كيبل شحن USB-C", weight: "1 متر", price: 4000, mrp: 6000, rating: "4.3", reviews: "15 ألف", allLabel: "كل الكوابل" },
  { id: 704, name: "ماوس لاسلكي", weight: "1 قطعة", price: 9000, rating: "4.2", reviews: "6 ألف" },
  { id: 705, name: "باور بانك 10000", weight: "1 قطعة", price: 18000, mrp: 25000, rating: "4.6", reviews: "9 ألف", options: 2 },
  { id: 706, name: "لمبة LED ذكية", weight: "1 قطعة", price: 7000, rating: "4.1", reviews: "4 ألف", seeMore: true },
];
const BEAUTY_ITEMS = [
  { id: 801, name: "كريم ترطيب للوجه", weight: "50 مل", price: 8000, mrp: 12000, rating: "4.5", reviews: "20 ألف" },
  { id: 802, name: "أحمر شفاه مات", weight: "1 قطعة", price: 6000, mrp: 9000, rating: "4.4", reviews: "15 ألف", options: 3 },
  { id: 803, name: "شامبو للشعر التالف", weight: "400 مل", price: 7000, rating: "4.3", reviews: "18 ألف", allLabel: "كل الشامبو" },
  { id: 804, name: "عطر نسائي فاخر", weight: "50 مل", price: 25000, mrp: 35000, rating: "4.6", reviews: "7 ألف" },
  { id: 805, name: "ماسكارا مكثّفة", weight: "1 قطعة", price: 5500, rating: "4.2", reviews: "12 ألف", options: 2 },
  { id: 806, name: "غسول وجه لطيف", weight: "150 مل", price: 4500, rating: "4.5", reviews: "22 ألف", seeMore: true },
];
const DECOR_ITEMS = [
  { id: 901, name: "مصباح طاولة حديث", weight: "1 قطعة", price: 15000, mrp: 22000, rating: "4.5", reviews: "3 ألف" },
  { id: 902, name: "نبتة صناعية بأصيص", weight: "1 قطعة", price: 9000, rating: "4.4", reviews: "5 ألف", allLabel: "كل النباتات" },
  { id: 903, name: "شمعة معطّرة", weight: "2 قطعة", price: 6000, mrp: 8000, rating: "4.6", reviews: "7 ألف", options: 2 },
  { id: 904, name: "صندوق تنظيم متعدد", weight: "1 قطعة", price: 7000, rating: "4.2", reviews: "4 ألف" },
  { id: 905, name: "طقم أكواب سيراميك", weight: "6 قطع", price: 12000, mrp: 16000, rating: "4.5", reviews: "6 ألف", options: 2 },
  { id: 906, name: "وسادة ديكور مطرّزة", weight: "1 قطعة", price: 8500, rating: "4.3", reviews: "3 ألف", seeMore: true },
];

const TAB_CONTENT = {
  vac: {
    hero: { title: "عطلة الصيف ☀️", sub: "كل مستلزمات الإجازة والسفر بمكان واحد", emoji: "🏖️", grad: ["#7EC8E8", "#C8E9F7"] },
    mosaicTint: "#EAF6FC", mosaicIcon: "#2B7A9B",
    mosaic: [
      { name: "ألعاب مائية للأطفال", Icon: Waves, price: 8000 },
      { name: "إجازة العائلة", Icon: Luggage },
      { name: "رياضة وأنشطة", Icon: Dumbbell },
      { name: "هوايات ومهارات", Icon: Palette },
      { name: "كتب الأطفال", Icon: BookOpen },
    ],
    feeds: [
      { title: "مرح لا ينتهي للعقول النشطة", sub: "اختيارات ذكية تخلّي الأطفال نشيطين", accent: "#C9692E", Icon: Palette, items: VAC_TOYS },
      { title: "البيت صار نادي السباحة!", accent: "#2B7A9B", Icon: Waves, items: VAC_POOL },
    ],
    miniPanel: { title: "نادي القرّاء الصغار", bg: "#FBEFC9", cards: [{ name: "كتب تلوين", Icon: Palette }, { name: "كتب أنشطة", Icon: BookOpen }, { name: "كتب كتابة", Icon: Pencil }] },
    promo: { title: "التقط الرحلات لا حروق الشمس", sub: "واقيات شمس خفيفة لكل العائلة", cta: "تسوّق الآن", emoji: "✈️", grad: ["#E9A23B", "#F4D58A", "#FBE9C2"], light: true },
  },
  elec: {
    hero: { title: "عالم الإلكترونيات", sub: "سماعات، شواحن، إكسسوارات والمزيد", emoji: "🎧", grad: ["#3A3F76", "#5A5FA0"] },
    mosaicTint: "#ECEDF8", mosaicIcon: "#4A4F8C",
    mosaic: [
      { name: "سماعات وإيربودز", Icon: Headphones },
      { name: "شواحن وكوابل", Icon: Plug },
      { name: "ماوس ولوحات", Icon: Mouse },
      { name: "إضاءة ذكية", Icon: Lamp },
      { name: "بطاريات وطاقة", Icon: BatteryCharging },
    ],
    feeds: [{ title: "الأكثر طلباً بالإلكترونيات", accent: "#4A4F8C", Icon: Headphones, items: ELEC_ITEMS }],
    promo: { title: "رقمنة حياتك", sub: "خصومات على الإكسسوارات", cta: "تسوّق الآن", emoji: "🔌", grad: ["#2A2E5A", "#5A5FA0", "#8A7FC0"], light: false },
  },
  beauty: {
    hero: { title: "الجمال والعناية", sub: "بشرة، شعر، مكياج وعطور", emoji: "💄", grad: ["#EE92BC", "#FBD0E2"] },
    mosaicTint: "#FCEAF2", mosaicIcon: "#C2477F",
    mosaic: [
      { name: "العناية بالبشرة", Icon: Sparkles },
      { name: "المكياج", Icon: Brush },
      { name: "العناية بالشعر", Icon: Scissors },
      { name: "العطور", Icon: Wind },
      { name: "العناية النسائية", Icon: Flower2 },
    ],
    feeds: [{ title: "مفضّلات الجمال", accent: "#C2477F", Icon: Sparkles, items: BEAUTY_ITEMS }],
    promo: { title: "تألّقي كل يوم", sub: "عروض على منتجات التجميل", cta: "تسوّقي الآن", emoji: "💖", grad: ["#C2477F", "#EE92BC", "#FBD0E2"], light: false },
  },
  decor: {
    hero: { title: "ديكور المنزل", sub: "إضاءة، نباتات، تنظيم وأكثر", emoji: "🛋️", grad: ["#D9B488", "#EBD3B5"] },
    mosaicTint: "#F6ECDD", mosaicIcon: "#C9692E",
    mosaic: [
      { name: "إضاءة وشموع", Icon: Lamp },
      { name: "نباتات الزينة", Icon: Flower2 },
      { name: "تنظيم وترتيب", Icon: Boxes },
      { name: "أدوات المائدة", Icon: Utensils },
      { name: "مفروشات", Icon: Sofa },
    ],
    feeds: [{ title: "لمسات تجمّل بيتك", accent: "#C9692E", Icon: Lamp, items: DECOR_ITEMS }],
    promo: { title: "بيت أجمل بلمسة", sub: "عروض على ديكور المنزل", cta: "تسوّق الآن", emoji: "🪴", grad: ["#A9713A", "#D9B488", "#EBD3B5"], light: true },
  },
};

const ALL_PRODUCTS = [...SWEETS, ...DRINKS, ...GROCERY, ...INSTANT, ...SPONSORED, ...VAC_TOYS, ...VAC_POOL, ...ELEC_ITEMS, ...BEAUTY_ITEMS, ...DECOR_ITEMS];
const ADDRESSES = [
  { id: "samawah", label: "البيت", line: "السماوة، شارع الكورنيش" },
  { id: "baghdad", label: "الدوام", line: "بغداد، المنصور" },
  { id: "najaf", label: "بيت الأهل", line: "النجف، حي السعد" },
];
const NAV = [
  { id: "home", label: "الرئيسية", Icon: Home, to: "/" },
  { id: "cats", label: "الأقسام", Icon: LayoutGrid, to: "/category" },
  { id: "search", label: "البحث", Icon: Search, to: "/search" },
  { id: "cart", label: "السلة", Icon: ShoppingCart, to: "/cart" },
];

const FREE_AT = 15000;
const BEST_IMG = "https://placehold.co/100x100/F4F6F8/F4F6F8/png";
const onImgErr = (e) => { e.currentTarget.style.visibility = "hidden"; };
const iqd = (n) => Number(n).toLocaleString("en-US") + " د.ع";
const clamp2 = { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" };

/* ================================================================== */
/*  Presentational components (module-level => no remount on type)    */
/* ================================================================== */
function ProductCard({ p, accent, Icon, qty, onAdd, onInc, onDec }) {
  const off = p.mrp && p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
  return (
    <div className="flex flex-col">
      <div className="relative rounded-xl mb-2" style={{ aspectRatio: "1 / 1", background: (accent || "#9AA8B5") + "16", overflow: "hidden" }}>
        <div className="absolute inset-0 flex items-center justify-center" style={{ fontSize: 52 }}>{emojiFor(p.name)}</div>
        <button className="wish absolute rounded-full flex items-center justify-center" style={{ top: 6, insetInlineStart: 6, width: 24, height: 24, background: "#fff" }}><Heart size={13} style={{ color: "#C7CDD6" }} /></button>
        <span className="absolute flex items-center justify-center" style={{ top: 6, insetInlineEnd: 6, width: 16, height: 16, borderRadius: 3, border: "1.5px solid " + (p.nonveg ? "#B23B3B" : "#1A7A33"), background: "#fff" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.nonveg ? "#B23B3B" : "#1A7A33" }} />
        </span>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between" style={{ padding: 6 }}>
          <span className="rounded-md text-xs font-bold" style={{ background: "rgba(255,255,255,.92)", color: "#3A424E", padding: "2px 6px" }}>{p.weight}</span>
          {qty === 0 ? (
            <button onClick={onAdd} className="add-btn rounded-lg flex flex-col items-center leading-none" style={{ padding: p.options ? "5px 14px 4px" : "8px 16px" }}>
              <span className="text-sm" style={{ fontWeight: 800 }}>أضف</span>
              {p.options ? <span style={{ fontSize: 9, marginTop: 2, fontWeight: 700 }}>{p.options} خيارات</span> : null}
            </button>
          ) : (
            <div className="stepper rounded-lg overflow-hidden flex items-center">
              <button onClick={onDec} className="stepper-btn" style={{ padding: "8px 8px" }}><Minus size={14} strokeWidth={2.8} /></button>
              <span className="text-sm font-extrabold" style={{ width: 18, textAlign: "center" }}>{qty}</span>
              <button onClick={onInc} className="stepper-btn" style={{ padding: "8px 8px" }}><Plus size={14} strokeWidth={2.8} /></button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-extrabold" style={{ color: "#1A1A1A" }}>{iqd(p.price)}</span>
        {off > 0 && <span className="text-xs line-through" style={{ color: "#9AA3AF" }}>{iqd(p.mrp)}</span>}
      </div>
      {off > 0 && <p className="text-xs font-bold mt-0.5" style={{ color: "#2563EB" }}>خصم {off}%</p>}

      <p className="text-xs leading-snug mt-1 font-medium" style={{ ...clamp2, color: "#2A2F36", minHeight: "2.4em" }}>{p.name}</p>

      {p.tags && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {p.tags.map((t) => <span key={t} style={{ background: "#F3F4F8", color: "#5A6473", padding: "1px 6px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{t}</span>)}
        </div>
      )}
      {p.chilled && (
        <span className="inline-flex items-center gap-1 rounded-md mt-1.5 text-xs font-bold" style={{ background: "#E8F1FB", color: "#2A77C9", padding: "2px 6px", width: "fit-content" }}><Snowflake size={11} /> مبرّد</span>
      )}

      {p.rating && (
        <div className="flex items-center gap-1 mt-1.5">
          <Star size={11} fill="#F5B301" style={{ color: "#F5B301" }} />
          <span className="text-xs font-bold" style={{ color: "#3A424E" }}>{p.rating}</span>
          {p.reviews && <span className="text-xs font-medium" style={{ color: "#9AA3AF" }}>({p.reviews})</span>}
        </div>
      )}
      <div className="flex items-center gap-2 mt-1">
        <span className="flex items-center gap-1"><Clock size={11} style={{ color: "#9AA3AF" }} /><span className="text-xs" style={{ color: "#9AA3AF" }}>25 دقيقة</span></span>
        {p.stock && <span className="text-xs font-bold" style={{ color: "#C9692E" }}>متبقّي {p.stock}</span>}
      </div>

      {(p.allLabel || p.seeMore) && (
        <button className="all-pill inline-flex items-center gap-1 rounded-lg mt-2 text-xs font-bold" style={{ padding: "5px 10px", width: "fit-content" }}>
          {p.allLabel ? p.allLabel : "شوف المزيد مثل هذا"} <ChevronLeft size={13} />
        </button>
      )}
    </div>
  );
}

function Feed({ title, sub, items, accent, Icon, c }) {
  return (
    <section className="max-w-6xl mx-auto px-3 pt-7">
      <h2 className="text-lg font-extrabold px-0.5" style={{ color: "#1A1A1A" }}>{title}</h2>
      {sub && <p className="text-xs font-bold px-0.5 mt-0.5" style={{ color: "#9AA3AF" }}>{sub}</p>}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-x-2.5 gap-y-5 mt-3">
        {items.map((p) => (
          <ProductCard key={p.id} p={p} accent={accent} Icon={Icon} qty={c.qty(p.id)} onAdd={() => c.add({ ...p, Icon, accent })} onInc={() => c.inc(p.id)} onDec={() => c.dec(p.id)} />
        ))}
      </div>
      <button className="see-all w-full rounded-2xl mt-4 flex items-center justify-center gap-2 py-3 text-sm font-extrabold" style={{ color: "#2A3FB8" }}>عرض كل المنتجات <ChevronLeft size={16} /></button>
    </section>
  );
}

function PromoBanner({ banner }) {
  const txt = banner.light ? "#1A1A1A" : "#FFFFFF";
  const sub = banner.light ? "rgba(0,0,0,.65)" : "rgba(255,255,255,.92)";
  return (
    <section className="max-w-6xl mx-auto px-3 pt-7">
      <div className="promo relative rounded-2xl overflow-hidden" style={{ background: linGrad(banner.grad, 110), minHeight: 160 }}>
        <div className="p-5" style={{ maxWidth: "72%" }}>
          <p className="text-xl font-extrabold leading-tight" style={{ color: txt }}>{banner.title}</p>
          <p className="text-sm font-semibold mt-1.5" style={{ color: sub }}>{banner.sub}</p>
          <button className="promo-cta rounded-lg mt-4 text-sm font-extrabold" style={{ background: banner.light ? "#1A1A1A" : "#fff", color: banner.light ? "#fff" : "#1A1A1A", padding: "9px 20px" }}>{banner.cta}</button>
        </div>
        <span className="absolute" style={{ bottom: 8, insetInlineStart: 18, fontSize: 54 }}>{banner.emoji}</span>
      </div>
    </section>
  );
}

function MiniPanel({ panel, accent }) {
  return (
    <section className="max-w-6xl mx-auto px-3 pt-7">
      <div className="rounded-2xl p-4" style={{ background: panel.bg }}>
        <h3 className="text-lg font-extrabold text-center mb-3" style={{ color: "#5A3A1E" }}>{panel.title}</h3>
        <div className="grid grid-cols-3 gap-2.5">
          {panel.cards.map((cd) => (
            <div key={cd.name} className="rounded-xl bg-white p-2 flex flex-col items-center">
              <div className="w-full aspect-square rounded-lg flex items-center justify-center mb-1" style={{ background: "#FFF6E0" }}><cd.Icon size={28} style={{ color: accent }} /></div>
              <span className="text-xs font-bold text-center leading-tight">{cd.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TabBody({ cfg, theme, c }) {
  return (
    <>
      <section className="max-w-6xl mx-auto px-3 pt-4">
        <div className="rounded-2xl overflow-hidden relative" style={{ background: linGrad(cfg.hero.grad, 150), minHeight: 150 }}>
          <div className="p-5" style={{ maxWidth: "74%" }}>
            <p className="text-2xl font-extrabold leading-tight" style={{ color: theme.topText }}>{cfg.hero.title}</p>
            <p className="text-sm font-semibold mt-1.5" style={{ color: theme.topSub }}>{cfg.hero.sub}</p>
          </div>
          <span className="absolute" style={{ bottom: 10, insetInlineStart: 18, fontSize: 58 }}>{cfg.hero.emoji}</span>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-3 pt-5">
        <div className="grid grid-cols-3 grid-rows-2 gap-2.5">
          {cfg.mosaic.map((m, i) => (
            <button key={m.name} className={"mosaic-card rounded-2xl p-2 flex flex-col" + (i === 0 ? " col-span-1 row-span-2" : "")}>
              <div className="flex-1 rounded-xl flex items-center justify-center mb-1.5" style={{ background: cfg.mosaicTint, minHeight: 60 }}>
                <m.Icon size={i === 0 ? 46 : 30} strokeWidth={1.7} style={{ color: cfg.mosaicIcon }} />
              </div>
              <span className="text-xs font-bold text-center leading-tight" style={{ color: "#2A2F36" }}>{m.name}</span>
              {m.price && <span className="text-xs font-extrabold text-center mt-0.5" style={{ color: "#0C831F" }}>{iqd(m.price)}</span>}
            </button>
          ))}
        </div>
      </section>

      {cfg.feeds.map((f) => <Feed key={f.title} title={f.title} sub={f.sub} items={f.items} accent={f.accent} Icon={f.Icon} c={c} />)}
      {cfg.miniPanel && <MiniPanel panel={cfg.miniPanel} accent={cfg.mosaicIcon} />}
      <PromoBanner banner={cfg.promo} />
    </>
  );
}

/* ================================================================== */
/*  Home page                                                         */
/* ================================================================== */
export default function HomePage() {
  const [search, setSearch] = useState("");
  const [addrId, setAddrId] = useState("samawah");
  const [locOpen, setLocOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [bannerOpen, setBannerOpen] = useState(true);
  const nav = useNavigate();
  const { qty, add, inc, dec, subtotal, count } = useCart();

  const bottomRef = useRef(null);
  const [bottomH, setBottomH] = useState(150);
  useEffect(() => {
    const measure = () => bottomRef.current && setBottomH(bottomRef.current.offsetHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [bannerOpen]);

  const theme = THEMES[activeTab] || THEMES.all;
  const address = ADDRESSES.find((a) => a.id === addrId);
  const remaining = Math.max(0, FREE_AT - subtotal);
  const c = { qty, add, inc, dec };

  return (
    <div className="qc-app min-h-screen" dir="rtl" lang="ar">
      <style>{STYLE}</style>

      {/* ===== HEADER (themed) ===== */}
      <div style={{ background: theme.grad }}>
        <div className="max-w-6xl mx-auto px-4 pt-3 pb-3 relative">
          <div className="flex items-start justify-between gap-3">
            <button onClick={() => setLocOpen((v) => !v)} className="min-w-0">
              <p className="text-xs font-bold" style={{ color: theme.topSub }}>التوصيل خلال</p>
              <div className="flex items-center gap-2 mt-0.5">
                <h1 className="font-extrabold leading-none" style={{ color: theme.topText, fontSize: "30px" }}>16 دقيقة</h1>
                <span className="inline-flex items-center gap-1 text-xs font-bold rounded-full px-2 py-0.5" style={{ background: theme.pill, color: theme.topText }}><Clock size={11} /> 24/7</span>
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-sm font-bold truncate" style={{ color: theme.topText, maxWidth: "58vw" }}>{address.label} - {address.line}</span>
                <ChevronDown size={16} style={{ color: theme.topText, transform: locOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
              </div>
            </button>
            <div className="flex items-center gap-2 shrink-0 mt-0.5">
              <button className="icon-btn w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#FFFFFF" }}><Wallet size={20} style={{ color: "#0C831F" }} /></button>
              <button className="icon-btn w-10 h-10 rounded-full flex items-center justify-center" style={{ background: theme.profileBg }}><User size={20} style={{ color: theme.topText }} /></button>
            </div>
          </div>

          {locOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setLocOpen(false)} />
              <div className="loc-pop rounded-2xl z-50 overflow-hidden" style={{ background: "#fff", border: "1px solid #EFEFEF" }}>
                <p className="px-4 pt-3 pb-1 text-xs font-bold" style={{ color: "#9AA3AF" }}>اختر عنوان التوصيل</p>
                {ADDRESSES.map((a) => (
                  <button key={a.id} onClick={() => { setAddrId(a.id); setLocOpen(false); }} className="loc-item w-full flex items-start gap-3 px-4 py-3">
                    <MapPin size={18} style={{ color: a.id === addrId ? "#0C831F" : "#9AA3AF", marginTop: 2 }} />
                    <div className="min-w-0 flex-1"><p className="text-sm font-bold">{a.label}</p><p className="text-xs truncate" style={{ color: "#6B7280" }}>{a.line}</p></div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ===== STICKY: search + tabs (themed) ===== */}
      <div className="sticky top-0 z-30" style={{ background: theme.solid, boxShadow: "0 6px 14px rgba(20,20,20,.10)" }}>
        <div className="max-w-6xl mx-auto px-4 pt-2.5 pb-2">
          <div className="search-wrap flex items-center gap-2.5 rounded-xl px-3" style={{ background: "#FFFFFF", height: 46 }}>
            <Search size={20} style={{ color: "#9AA3AF" }} />
            <input value={search} readOnly onClick={() => nav("/search")} placeholder="دور على مسواگ، لحم، خضار..." className="flex-1 bg-transparent outline-none text-sm font-medium" style={{ color: "#1A1A1A", cursor: "pointer" }} />
            <Mic size={18} style={{ color: "#0C831F" }} />
          </div>
          <div className="flex gap-1 overflow-x-auto no-scrollbar mt-2.5">
            {TABS.map((t) => {
              const on = activeTab === t.id;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)} className={"tab flex flex-col items-center gap-1 px-2 shrink-0" + (on ? " tab-active" : "")} style={{ minWidth: "4.2rem" }}>
                  <t.Icon size={22} strokeWidth={2} style={{ color: theme.tabText }} />
                  <span className="text-xs font-bold whitespace-nowrap" style={{ color: theme.tabText }}>{t.label}</span>
                  <div style={{ height: 3, width: "75%", borderRadius: 3, background: on ? theme.tabText : "transparent" }} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== BODY ===== */}
      {activeTab === "all" ? (
        <>
          <div className="welcome" style={{ borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }}>
            <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-center gap-4">
              <span style={{ fontSize: "30px" }}>🛍️</span>
              <div className="text-center">
                <p className="welcome-title text-2xl font-extrabold">✦ أهلاً وسهلاً ✦</p>
                <p className="text-sm font-semibold mt-1" style={{ opacity: 0.95 }}>اطلب الآن واستمتع بتوصيل مجاني</p>
              </div>
              <span style={{ fontSize: "30px" }}>🛍️</span>
            </div>
          </div>

          <section className="max-w-6xl mx-auto px-3 pt-5">
            <h2 className="text-lg font-extrabold mb-3 px-0.5" style={{ color: "#1A1A1A" }}>الأكثر مبيعاً</h2>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-2.5">
              {BESTSELLERS.map((cd) => (
                <button key={cd.name} className="best-card rounded-2xl p-2">
                  <div className="grid grid-cols-2 gap-1">
                    {[0, 1, 2, 3].map((i) => (<div key={i} className="img-box aspect-square rounded-md flex items-center justify-center" style={{ fontSize: 24 }}>{cd.e[i]}</div>))}
                  </div>
                  <span className="best-pill inline-block mt-2 text-xs font-bold rounded-full px-2 py-0.5">{cd.count} منتج</span>
                  <p className="text-xs font-extrabold mt-1 leading-tight" style={{ color: "#1A1A1A" }}>{cd.name}</p>
                </button>
              ))}
            </div>
          </section>

          {SECTIONS.map((sec) => (
            <section key={sec.title} className="max-w-6xl mx-auto px-3 pt-6">
              <h2 className="text-lg font-extrabold mb-3 px-0.5" style={{ color: "#1A1A1A" }}>{sec.title}</h2>
              <div className="grid grid-cols-4 lg:grid-cols-8 gap-2.5">
                {sec.items.map((item, i) => (
                  <button key={item.name} className="cat-tile rounded-2xl p-1.5 flex flex-col items-center" style={{ background: "#F0F8FA" }}>
                    <div className="w-full aspect-square flex items-center justify-center" style={{ fontSize: 30 }}>{emojiFor(item.name)}</div>
                    <span className="text-xs font-semibold text-center leading-tight mt-0.5 mb-1" style={{ color: "#2A2F36", minHeight: "2.4em" }}>{item.name}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}

          <Feed title="حلويات ومقرمشات" items={SWEETS} accent="#C2477F" Icon={Candy} c={c} />
          <Feed title="مشروبات باردة ومنعشة" items={DRINKS} accent="#2B7A9B" Icon={CupSoda} c={c} />

          <section className="max-w-6xl mx-auto px-3 pt-7">
            <h2 className="text-lg font-extrabold mb-3 px-0.5" style={{ color: "#1A1A1A" }}>مميّز هذا الأسبوع</h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {FEATURED.map((f) => (
                <div key={f.title} className="feat-card shrink-0 relative rounded-2xl overflow-hidden" style={{ width: 168, height: 168, background: linGrad(f.grad, 160), border: "2px solid #2F6BE0" }}>
                  <span className="absolute text-xs font-extrabold" style={{ top: 0, insetInlineStart: 14, background: "#FBDDEC", color: "#C2407A", padding: "3px 10px", borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>مميّز</span>
                  <p className="absolute text-base font-extrabold leading-tight" style={{ top: 40, insetInlineStart: 14, insetInlineEnd: 14, color: "#fff" }}>{f.title}</p>
                  <span className="absolute" style={{ bottom: 10, insetInlineEnd: 14, fontSize: 42 }}>{f.emoji}</span>
                </div>
              ))}
            </div>
          </section>

          <Feed title="مكسرات وبهارات وزيوت" items={GROCERY} accent="#C9692E" Icon={Droplet} c={c} />
          <Feed title="وجبات سريعة ومجمّدة" items={INSTANT} accent="#B8860B" Icon={Soup} c={c} />
          <PromoBanner banner={BANNER} />
          <Feed title="مخبوزات وحلويات بالكاكاو" sub="إعلان مُموّل" items={SPONSORED} accent="#7A5AB8" Icon={Candy} c={c} />
        </>
      ) : (
        <TabBody cfg={TAB_CONTENT[activeTab]} theme={theme} c={c} />
      )}

      {/* spacer */}
      <div style={{ height: bottomH + 8 }} />

      {/* ===== FIXED BOTTOM ===== */}
      <div ref={bottomRef} className="fixed left-0 right-0 bottom-0 z-50">
        {bannerOpen && (
          <div className="px-3 pb-2">
            <div className="max-w-6xl mx-auto">
              <div className="fb-card rounded-2xl px-3 py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#E8F0FE" }}><Bike size={18} style={{ color: "#2563EB" }} /></span>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold" style={{ color: "#2563EB" }}>توصيل مجاني خصيصاً لك ✨</p>
                    <p className="text-xs flex items-center gap-1" style={{ color: "#7A8493" }}>{remaining > 0 ? <>أضف منتجات بقيمة {iqd(remaining)} <ChevronLeft size={13} /></> : <>توصيلك صار مجاني 🎉</>}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-bold" style={{ color: "#9AA3AF" }}>1/2</span>
                    <div className="flex gap-1"><span style={{ width: 5, height: 5, borderRadius: "50%", background: "#2563EB" }} /><span style={{ width: 5, height: 5, borderRadius: "50%", background: "#CBD2DB" }} /></div>
                  </div>
                  <button onClick={() => setBannerOpen(false)} className="fb-x rounded-full p-1.5"><X size={18} style={{ color: "#9AA3AF" }} /></button>
                </div>
              </div>
            </div>
          </div>
        )}
        <nav className="bottom-nav">
          <div className="max-w-6xl mx-auto grid grid-cols-4">
            {NAV.map((n) => {
              const on = n.to === "/";
              return (
                <button key={n.id} onClick={() => nav(n.to)} className="nav-btn flex flex-col items-center gap-0.5 py-2.5">
                  <span style={{ position: "relative", display: "inline-flex" }}>
                    <n.Icon size={22} strokeWidth={on ? 2.4 : 2} style={{ color: on ? "#E0A800" : "#2E3640" }} fill={on && n.id === "home" ? "#E0A800" : "none"} />
                    {n.id === "cart" && count > 0 && <span style={{ position: "absolute", top: -6, insetInlineEnd: -9, background: "#0C831F", color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 999, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{count}</span>}
                  </span>
                  <span className="nav-txt font-bold" style={{ color: on ? "#1A1A1A" : "#2E3640" }}>{n.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
