import { useState, useEffect, useMemo } from "react";
import { getProducts, getCategories } from "../lib/api.js";

/* =====================================================================
 *  مصدر الكتالوج الموحّد لصفحات الزبون — يقرأ نفس بيانات لوحة الأدمن
 *  (getProducts/getCategories من src/lib/api.js). يعمل في الوضعين:
 *  «متصل بـ Supabase» و«تجريبي». يُخزَّن مؤقتاً ضمن الجلسة كي لا يُعاد
 *  جلبه عند التنقّل بين الصفحات.
 * ===================================================================== */
let _cache = null;     // { products, cats }
let _promise = null;

export function loadCatalog() {
  if (_cache) return Promise.resolve(_cache);
  if (!_promise) {
    _promise = Promise.all([getProducts(), getCategories()])
      .then(([products, cats]) => { _cache = { products, cats }; return _cache; })
      .catch((e) => { _promise = null; throw e; });
  }
  return _promise;
}

function buildHelpers(products, cats) {
  const byId = {};
  cats.forEach((c) => { byId[c.id] = c; });
  const tier1 = cats.filter((c) => c.parentId == null).sort((a, b) => a.sort - b.sort);
  const subsOf = (id) => cats.filter((c) => c.parentId === id).sort((a, b) => a.sort - b.sort);
  // معرّف القسم الرئيسي لأي تصنيف (سواء كان رئيسياً أو تفرّعاً)
  const tier1IdOf = (catId) => { const c = byId[catId]; if (!c) return null; return c.parentId == null ? c.id : c.parentId; };
  const byCat = (t1Id) => products.filter((p) => tier1IdOf(p.categoryId) === t1Id);   // كل منتجات قسم رئيسي (يشمل تفرّعاته)
  const bySub = (subId) => products.filter((p) => p.categoryId === subId);            // منتجات تفرّع محدّد
  const find = (id) => products.find((p) => String(p.id) === String(id)) || null;
  const catById = (id) => byId[id] || null;
  return { byId, tier1, subsOf, byCat, bySub, find, catById, tier1IdOf };
}

export function useCatalog() {
  const [state, setState] = useState(() => _cache || { products: [], cats: [] });
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    let alive = true;
    if (_cache) { setState(_cache); setLoading(false); return; }
    loadCatalog()
      .then((c) => { if (alive) { setState(c); setLoading(false); } })
      .catch((e) => { console.error("فشل تحميل الكتالوج:", e); if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const { products, cats } = state;
  const helpers = useMemo(() => buildHelpers(products, cats), [products, cats]);
  return { loading, products, cats, ...helpers };
}
