import { createClient } from "@supabase/supabase-js";

// تُقرأ من ملف .env (انسخ .env.example). إذا غير موجودة، يبقى التطبيق على البيانات التجريبية.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : null;
export const isLive = !!supabase;
