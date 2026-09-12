/**
 * تخزين محلي لا يرمي استثناءً أبدًا.
 * في وضع التصفح الخاص يرمي localStorage عند الكتابة، وقد أوقف ذلك تطبيقًا سابقًا
 * في منتصف الإقلاع. لا يُلمس localStorage مباشرةً في أي ملف آخر.
 */
AIMED.تخزين = {
  اقرأ(مفتاح, بديل = null) {
    try { const q = localStorage.getItem('aimed_' + مفتاح); return q === null ? بديل : q; }
    catch { return بديل; }
  },
  اكتب(مفتاح, قيمة) {
    try { localStorage.setItem('aimed_' + مفتاح, String(قيمة)); return true; }
    catch { return false; }
  },
};
