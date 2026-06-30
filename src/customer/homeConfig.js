import { useState, useEffect } from "react";
import { getHomeConfig, DEFAULT_HOME_CONFIG } from "../lib/api.js";

/* =====================================================================
 *  إعدادات الصفحة الرئيسية للزبون — تُقرأ من نفس مصدر لوحة الأدمن
 *  (getHomeConfig من src/lib/api.js). تعمل في الوضعين: «متصل بـ Supabase»
 *  و«تجريبي». نجلب طازجاً عند كل دخول للصفحة كي تنعكس تعديلات الأدمن فوراً،
 *  مع عرض آخر إعداد معروف مباشرةً تفادياً لأي وميض.
 * ===================================================================== */
let _last = DEFAULT_HOME_CONFIG;

export function useHomeConfig() {
  const [cfg, setCfg] = useState(_last);
  useEffect(() => {
    let alive = true;
    getHomeConfig()
      .then((c) => { if (alive) { _last = c; setCfg(c); } })
      .catch((e) => console.error("فشل تحميل إعدادات الصفحة الرئيسية:", e));
    return () => { alive = false; };
  }, []);
  return cfg;
}
