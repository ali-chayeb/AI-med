/**
 * التظليل.
 *
 * يُخزَّن لكل جواب مصفوفةٌ من {قسم, بداية, نهاية, قلم, نص}، والمواضع محسوبة
 * على **نصّ القسم المجرَّد من الوسوم**. هذا ما يجعل التظليل يعيش عبر الجلسات
 * وعبر إعادة بناء الموقع: الوسوم تتغيّر والنصّ لا.
 *
 * وإن تغيّر النصّ فعلًا (أُعيد استيراد الجواب مثلًا) يُبحث عن المقطع المخزَّن
 * في القسم نفسه ويُعاد ربطه بموضعه الجديد. وما لم يُعثر عليه لا يُعرض ولا
 * يُحذف — يبقى محفوظًا كي لا تضيع علامةٌ وضعتَها.
 *
 * التخزين محلّي في المتصفح: تظليلاتُ الحاسوب لا تظهر على الهاتف. هذا حدّ
 * معروف لموقع ثابت بلا خادم، لا عطل.
 */
AIMED.عرض = AIMED.عرض || {};

AIMED.عرض.التظليل = {
  slug: null,
  قائمة: [],
  لوح: null,
  محدَّد: null,     // { قسم, بداية, نهاية } آخر تحديد صالح

  /* ── التخزين ── */

  مفتاح(slug) { return 'تظليل_' + slug; },

  حمّل(slug) {
    try { this.قائمة = JSON.parse(AIMED.تخزين.اقرأ(this.مفتاح(slug), '[]')) || []; }
    catch { this.قائمة = []; }
    this.slug = slug;
  },

  احفظ() {
    if (this.slug) AIMED.تخزين.اكتب(this.مفتاح(this.slug), JSON.stringify(this.قائمة));
  },

  /* ── المواضع: حساب على النصّ المجرَّد ── */

  /** موضع (عقدة، إزاحة) داخل قسمٍ ما، بالحروف. */
  موضع(قسم, عقدة, إزاحة) {
    const ماشٍ = document.createTreeWalker(قسم, NodeFilter.SHOW_TEXT);
    let ع, مجموع = 0;
    while ((ع = ماشٍ.nextNode())) {
      if (ع === عقدة) return مجموع + إزاحة;
      مجموع += ع.nodeValue.length;
    }
    return null;
  },

  /** يلفّ المدى [بداية، نهاية) داخل القسم بوسم mark. */
  لُفّ(قسم, بداية, نهاية, قلم, رقم) {
    const ماشٍ = document.createTreeWalker(قسم, NodeFilter.SHOW_TEXT);
    const قطع = [];
    let ع, موضع = 0;
    while ((ع = ماشٍ.nextNode())) {
      const طول = ع.nodeValue.length;
      const من = Math.max(بداية, موضع), إلى = Math.min(نهاية, موضع + طول);
      if (من < إلى) قطع.push({ عقدة: ع, من: من - موضع, إلى: إلى - موضع });
      موضع += طول;
    }
    // عكسًا: لفُّ قطعةٍ يشقّ عقدتها، والعكس يحمي مواضع ما قبلها.
    for (const ق of قطع.reverse()) {
      const مدى = document.createRange();
      مدى.setStart(ق.عقدة, ق.من);
      مدى.setEnd(ق.عقدة, ق.إلى);
      const وسم = document.createElement('mark');
      وسم.className = 'تظليل';
      وسم.dataset['قلم'] = قلم;
      وسم.dataset['رقم'] = String(رقم);
      try { مدى.surroundContents(وسم); } catch { /* يعبر حدّ عنصر — يُتخطّى */ }
    }
  },

  /* ── العرض ── */

  انزع(جذر) {
    for (const و of جذر.querySelectorAll('mark.تظليل')) و.replaceWith(...و.childNodes);
    جذر.normalize();
  },

  /** يرسم كل التظليلات المحفوظة على الصفحة الحالية. */
  ارسم() {
    const محتوى = document.getElementById('المحتوى');
    if (!محتوى) return;
    this.انزع(محتوى);

    let تغيّر = false;
    this.قائمة.forEach((ت, i) => {
      const قسم = document.getElementById(ت.قسم);
      if (!قسم) { ت.معلَّق = true; return; }
      const نصالقسم = قسم.textContent;

      // تحقّق: هل المقطع المخزَّن ما يزال في موضعه؟
      let بداية = ت.بداية;
      if (نصالقسم.slice(ت.بداية, ت.نهاية) !== ت.نص) {
        const جديد = نصالقسم.indexOf(ت.نص);
        if (جديد < 0) { ت.معلَّق = true; تغيّر = true; return; }
        بداية = جديد;
        ت.بداية = جديد; ت.نهاية = جديد + ت.نص.length;
        تغيّر = true;
      }
      if (ت.معلَّق) { delete ت.معلَّق; تغيّر = true; }
      this.لُفّ(قسم, بداية, بداية + ت.نص.length, ت.قلم, i);
    });

    if (تغيّر) this.احفظ();
    this.ارسمالقائمة();
  },

  /** قائمة التظليلات — في الهامش على الحاسوب، وفي اللوح السفلي على الجوّال. */
  ارسمالقائمة() {
    const هـ = AIMED.نص.هرّب;
    const ظاهرة = this.قائمة.filter((ت) => !ت.معلَّق);
    const html = ظاهرة.length
      ? ظاهرة.map((ت) => {
          const i = this.قائمة.indexOf(ت);
          return `<button class="تظليل-سطر" data-إلى="${i}">`
            + `<span class="تظليل-لون" data-قلم="${هـ(ت.قلم)}"></span>`
            + `<span class="تظليل-نص">${هـ(ت.نص)}</span></button>`;
        }).join('')
      : '<p class="لا-شيء">حدّد نصًّا في الجواب ليظهر لك لوح الألوان.</p>';

    for (const م of ['كتلة-التظليل', 'جسم-التظليل']) {
      const ع = document.getElementById(م);
      if (!ع) continue;
      ع.innerHTML = (م === 'كتلة-التظليل' && ظاهرة.length)
        ? `<p class="هامش-عنوان">تظليلاتي (${ظاهرة.length})</p>${html}`
        : html;
      if (م === 'كتلة-التظليل' && !ظاهرة.length) ع.innerHTML = '';
    }

    const زر = document.querySelector('.زر-شريط[data-لوح="لوح-التظليل"]');
    if (زر) زر.disabled = !ظاهرة.length && !document.querySelector('.ورقة .قسم');
  },

  /* ── التفاعل ── */

  ابدأ() {
    this.لوح = document.getElementById('لوح-الأقلام');
    if (!this.لوح) return;

    // اختيار قلم
    this.لوح.addEventListener('pointerdown', (ح) => {
      const زر = ح.target.closest('.قلم');
      if (!زر) return;
      ح.preventDefault();               // قبل أن يفقد التحديد
      const قلم = زر.dataset['قلم'];
      if (قلم === 'محو') this.امحُ(); else this.أضف(قلم);
      this.أخفِاللوح();
    });

    // انتهاء التحديد: الفأرة أو الإصبع
    for (const حدث of ['pointerup', 'touchend']) {
      document.addEventListener(حدث, () => setTimeout(() => this.افحصالتحديد(), 10));
    }
    document.addEventListener('selectionchange', () => {
      const س = getSelection();
      if (!س || س.isCollapsed) this.أخفِاللوح();
    });

    // النقر على تظليل موجود يفتح اللوح فوقه للمحو أو تغيير اللون
    document.getElementById('المحتوى').addEventListener('click', (ح) => {
      const وسم = ح.target.closest('mark.تظليل');
      if (!وسم) return;
      const i = +وسم.dataset['رقم'];
      const ت = this.قائمة[i];
      if (!ت) return;
      this.محدَّد = { قسم: ت.قسم, بداية: ت.بداية, نهاية: ت.نهاية, نص: ت.نص };
      this.أظهراللوح(وسم.getBoundingClientRect());
    });

    // القفز من قائمة التظليلات إلى موضعه في النصّ
    for (const م of ['كتلة-التظليل', 'جسم-التظليل']) {
      const ع = document.getElementById(م);
      if (ع) ع.addEventListener('click', (ح) => {
        const زر = ح.target.closest('.تظليل-سطر');
        if (!زر) return;
        const وسم = document.querySelector(`mark.تظليل[data-رقم="${CSS.escape(زر.dataset['إلى'])}"]`);
        if (وسم) {
          AIMED.عرض.الجوال?.أغلقالألواح();
          وسم.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }

    addEventListener('scroll', () => this.أخفِاللوح(), { passive: true });
  },

  افحصالتحديد() {
    const س = getSelection();
    if (!س || س.isCollapsed || !س.rangeCount) return;
    const مدى = س.getRangeAt(0);
    const نص = مدى.toString().trim();
    if (نص.length < 2) return;

    const قسم = (مدى.commonAncestorContainer.nodeType === 1
      ? مدى.commonAncestorContainer
      : مدى.commonAncestorContainer.parentElement)?.closest('.ورقة .قسم');
    if (!قسم) return;                    // التحديد خارج متن الجواب

    const بداية = this.موضع(قسم, مدى.startContainer, مدى.startOffset);
    const نهاية = this.موضع(قسم, مدى.endContainer, مدى.endOffset);
    if (بداية == null || نهاية == null || نهاية <= بداية) return;

    this.محدَّد = { قسم: قسم.id, بداية, نهاية, نص: قسم.textContent.slice(بداية, نهاية) };
    this.أظهراللوح(مدى.getBoundingClientRect());
  },

  أظهراللوح(مستطيل) {
    const ل = this.لوح;
    ل.setAttribute('data-ظاهر', '');
    const ع = ل.offsetWidth, ف = ل.offsetHeight;
    let س = مستطيل.left + مستطيل.width / 2 - ع / 2;
    س = Math.max(8, Math.min(س, innerWidth - ع - 8));
    let ص = مستطيل.top - ف - 10;
    if (ص < 8) ص = Math.min(مستطيل.bottom + 10, innerHeight - ف - 8);
    ل.style.insetInlineStart = '';
    ل.style.left = س + 'px';
    ل.style.top = ص + 'px';
  },

  أخفِاللوح() { this.لوح?.removeAttribute('data-ظاهر'); },

  أضف(قلم) {
    const م = this.محدَّد;
    if (!م) return;
    // تظليلٌ جديد يبتلع ما يتقاطع معه في القسم نفسه، فلا تتراكم طبقات.
    this.قائمة = this.قائمة.filter((ت) =>
      ت.قسم !== م.قسم || ت.نهاية <= م.بداية || ت.بداية >= م.نهاية);
    this.قائمة.push({ قسم: م.قسم, بداية: م.بداية, نهاية: م.نهاية, نص: م.نص, قلم });
    this.قائمة.sort((a, b) => a.قسم.localeCompare(b.قسم) || a.بداية - b.بداية);
    this.احفظ();
    getSelection()?.removeAllRanges();
    this.ارسم();
  },

  امحُ() {
    const م = this.محدَّد;
    if (!م) return;
    this.قائمة = this.قائمة.filter((ت) =>
      ت.قسم !== م.قسم || ت.نهاية <= م.بداية || ت.بداية >= م.نهاية);
    this.احفظ();
    getSelection()?.removeAllRanges();
    this.ارسم();
  },
};
