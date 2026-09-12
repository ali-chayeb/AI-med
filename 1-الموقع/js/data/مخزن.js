/**
 * المخزن: الفهرس محمّل مسبقًا، والأجوبة تُحمّل عند الطلب.
 *
 * كل جواب ملف .js يُحقن بوسم <script> ويستدعي AIMED.سجّل().
 * السبب: هذا يعمل عبر http وعبر file:// معًا. لو استُعمل fetch لانكسر
 * الموقع فور فتح index.html من القرص مباشرةً (منع CORS).
 */
AIMED.الفهرس = AIMED.الفهرس || [];

AIMED.مخزن = {
  _محمّل: Object.create(null),
  _منتظر: Object.create(null),

  /** كل الأجوبة، مرتّبة حسب الجهاز ثم العنوان. */
  الكل() {
    return AIMED.الفهرس.slice().sort((a, b) =>
      AIMED.ترتيبجهاز(a.جهاز) - AIMED.ترتيبجهاز(b.جهاز)
      || a.جهاز.localeCompare(b.جهاز, 'ar')
      || a.عنوان.localeCompare(b.عنوان, 'en'));
  },

  /** بطاقة جواب من الفهرس (بلا متنه). */
  بطاقة(slug) { return AIMED.الفهرس.find((ج) => ج.slug === slug) || null; },

  /** الأجهزة الموجودة فعلًا، مع عدد أجوبة كل جهاز وتوزيعها على الأنواع. */
  الأجهزة() {
    const خريطة = new Map();
    for (const ج of this.الكل()) {
      if (!خريطة.has(ج.جهاز)) خريطة.set(ج.جهاز, { اسم: ج.جهاز, أجوبة: [], أنواع: {} });
      const د = خريطة.get(ج.جهاز);
      د.أجوبة.push(ج);
      د.أنواع[ج.نوع] = (د.أنواع[ج.نوع] || 0) + 1;
    }
    return [...خريطة.values()].sort((a, b) => AIMED.ترتيبجهاز(a.اسم) - AIMED.ترتيبجهاز(b.اسم));
  },

  /** الأجوبة التي تجاوز دليلها المهلة — القاعدة 8a. */
  تحتاجمراجعة() {
    const السنة = new Date().getFullYear();
    return this.الكل().filter((ج) => ج.سنةالدليل && السنة - ج.سنةالدليل > AIMED.إعداد.عمرالدليل);
  },

  /** آخر ما أُضيف. */
  الأحدث(عدد = 8) {
    return AIMED.الفهرس.slice()
      .sort((a, b) => String(b.تاريخ).localeCompare(String(a.تاريخ)))
      .slice(0, عدد);
  },

  /** بحث فوري على العناوين والوسوم وعناوين الأقسام. */
  ابحث(استعلام) {
    const ك = AIMED.نص.مفتاح(استعلام);
    if (ك.length < 2) return [];
    const كلمات = ك.split(/\s+/).filter(Boolean);
    const نتائج = [];
    for (const ج of AIMED.الفهرس) {
      const هدف = AIMED.نص.مفتاح(ج.بحث);
      if (!كلمات.every((w) => هدف.includes(w))) continue;
      // ترتيب الأهمية: تطابق بداية العنوان، ثم الاختصار، ثم أي موضع آخر.
      const عنوان = AIMED.نص.مفتاح(ج.عنوان);
      const وزن = عنوان.startsWith(ك) ? 0
        : AIMED.نص.مفتاح(ج.اختصار) === ك ? 1
        : عنوان.includes(ك) ? 2 : 3;
      نتائج.push({ ج, وزن });
    }
    return نتائج.sort((a, b) => a.وزن - b.وزن || a.ج.عنوان.localeCompare(b.ج.عنوان, 'en'))
                .map((n) => n.ج).slice(0, 40);
  },

  /** يستدعيه ملف الجواب المحقون. */
  استقبل(جواب) {
    this._محمّل[جواب.slug] = جواب;
    const و = this._منتظر[جواب.slug];
    if (و) { delete this._منتظر[جواب.slug]; و.forEach((f) => f(جواب)); }
  },

  /** يجلب متن الجواب. يعيد Promise يُحلّ بالجواب أو بـ null إن تعذّر. */
  اجلب(slug) {
    if (this._محمّل[slug]) return Promise.resolve(this._محمّل[slug]);
    return new Promise((حُلّ) => {
      if (this._منتظر[slug]) { this._منتظر[slug].push(حُلّ); return; }
      this._منتظر[slug] = [حُلّ];

      const وسم = document.createElement('script');
      وسم.src = 'بيانات/أجوبة/' + encodeURIComponent(slug) + '.js'
                + (AIMED.نسخة ? '?v=' + AIMED.نسخة : '');
      وسم.onerror = () => {
        const و = this._منتظر[slug];
        delete this._منتظر[slug];
        if (و) و.forEach((f) => f(null));
      };
      document.head.appendChild(وسم);
    });
  },
};

/** الاسم القصير الذي تستدعيه ملفات الأجوبة المولّدة. */
AIMED.سجّل = (جواب) => AIMED.مخزن.استقبل(جواب);
