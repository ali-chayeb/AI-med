/**
 * الموجّه والتفضيلات.
 *
 * المسارات:  #/                 البيت
 *            #/جهاز/<الاسم>     كل أجوبة جهاز
 *            #/جواب/<slug>      جواب واحد
 */

/* ── التفضيلات: مصدر واحد تستعمله القمّة والشريط السفلي معًا ── */

AIMED.تفضيلات = {
  جذر: document.documentElement,
  مقاسات: ['عادي', 'كبير', 'أكبر'],

  طبّق() {
    const وضع = AIMED.تخزين.اقرأ('وضع');
    this.اضبطالوضع(وضع || (matchMedia('(prefers-color-scheme: dark)').matches ? 'ليل' : 'نهار'), !وضع);
    this.اضبطالخط(AIMED.تخزين.اقرأ('خط', 'عادي'));
    this.اضبطالقراءة(AIMED.تخزين.اقرأ('قراءة') === 'نعم');
  },

  اضبطالوضع(وضع, بلاحفظ) {
    const ليل = وضع === 'ليل';
    this.جذر.dataset['وضع'] = ليل ? 'ليل' : 'نهار';
    if (!بلاحفظ) AIMED.تخزين.اكتب('وضع', ليل ? 'ليل' : 'نهار');
    document.getElementById('زر-الليل')?.setAttribute('aria-pressed', String(ليل));
    for (const خ of document.querySelectorAll('#خيارات-الوضع [data-وضع]')) {
      خ.setAttribute('aria-pressed', String(خ.dataset['وضع'] === this.جذر.dataset['وضع']));
    }
    // شريط النظام في الهاتف يتبع لون الصفحة، وإلا بدا الموقع مقصوصًا.
    const لون = getComputedStyle(this.جذر).getPropertyValue('--ورق').trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', لون || '#FBFAF6');
  },

  اضبطالخط(حجم) {
    if (!this.مقاسات.includes(حجم)) حجم = 'عادي';
    this.جذر.dataset['خط'] = حجم;
    AIMED.تخزين.اكتب('خط', حجم);
    for (const خ of document.querySelectorAll('#خيارات-الخط [data-خط]')) {
      خ.setAttribute('aria-pressed', String(خ.dataset['خط'] === حجم));
    }
  },

  دوّرالخط() {
    const ت = this.مقاسات[(this.مقاسات.indexOf(this.جذر.dataset['خط'] || 'عادي') + 1) % 3];
    this.اضبطالخط(ت);
  },

  اضبطالقراءة(نعم) {
    this.جذر.dataset['قراءة'] = نعم ? 'نعم' : 'لا';
    AIMED.تخزين.اكتب('قراءة', نعم ? 'نعم' : 'لا');
    document.getElementById('زر-القراءة')?.setAttribute('aria-pressed', String(نعم));
  },
};

(function () {
  const جذر = document.documentElement;
  const المحتوى = document.getElementById('المحتوى');
  const الهامش = document.getElementById('الهامش');

  /* ── شريط تقدّم القراءة ── */

  const شريط = document.getElementById('شريط-التقدّم');
  let مُجدول = false;
  function حدّثالتقدّم() {
    if (مُجدول) return;
    مُجدول = true;
    requestAnimationFrame(() => {
      مُجدول = false;
      const مدى = document.documentElement.scrollHeight - innerHeight;
      شريط.style.width = (مدى > 40 ? Math.min(100, (scrollY / مدى) * 100) : 0) + '%';
    });
  }

  /* ── الموجّه ── */

  const اقرأالمسار = () => {
    const خام = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    if (!خام) return { نوع: 'بيت' };
    const [رأس, ...بقية] = خام.split('/');
    const قيمة = بقية.join('/');
    if (رأس === 'جواب' && قيمة) return { نوع: 'جواب', قيمة };
    if (رأس === 'جهاز' && قيمة) return { نوع: 'جهاز', قيمة };
    return { نوع: 'بيت' };
  };

  let طلبجارٍ = 0;

  const وجّه = async () => {
    const مسار = اقرأالمسار();
    const رقمالطلب = ++طلبجارٍ;

    AIMED.عرض.الهامش.فرّغ(الهامش);
    AIMED.عرض.الجوال.أغلقالألواح();
    AIMED.عرض.التظليل.أخفِاللوح();   // وإلا بقي لوح الأقلام من الصفحة السابقة
    document.getElementById('نتائج-البحث').hidden = true;
    جذر.dataset['صفحة'] = مسار.نوع;
    AIMED.عرض.الجوال.حدّث(مسار.نوع);

    if (مسار.نوع === 'بيت') {
      AIMED.عرض.البيت.ارسم(المحتوى);
      AIMED.عرض.الرف.علّم(null);
      document.title = 'مرجع — أجوبة طبية مرتّبة';
    } else if (مسار.نوع === 'جهاز') {
      AIMED.عرض.البيت.ارسمجهازًا(المحتوى, مسار.قيمة);
      AIMED.عرض.الرف.علّم(null);
      document.title = مسار.قيمة + ' — مرجع';
    } else {
      const بطاقة = AIMED.مخزن.بطاقة(مسار.قيمة);
      if (!بطاقة) { AIMED.عرض.الجواب.تعذّر(المحتوى, مسار.قيمة); return; }

      AIMED.عرض.الرف.علّم(بطاقة.slug);
      document.title = بطاقة.عنوان + ' — مرجع';

      const جواب = await AIMED.مخزن.اجلب(بطاقة.slug);
      if (رقمالطلب !== طلبجارٍ) return;          // سُبق بمسار أحدث
      if (!جواب) { AIMED.عرض.الجواب.تعذّر(المحتوى, بطاقة.slug); return; }

      AIMED.عرض.الجواب.ارسم(المحتوى, بطاقة, جواب);
      AIMED.عرض.الهامش.ارسم(الهامش, بطاقة, جواب);
      AIMED.عرض.التظليل.حمّل(بطاقة.slug);
      AIMED.عرض.التظليل.ارسم();
      AIMED.عرض.التفاعل.استأنف(بطاقة.slug);

      // العودة إلى حيث توقّفت — أهمّ ما في قراءة أربعين ألف حرف على دفعات.
      if (AIMED.عرض.التفاعل.أعدالموضع(بطاقة.slug)) { حدّثالتقدّم(); return; }
    }

    scrollTo({ top: 0, behavior: 'auto' });
    حدّثالتقدّم();
  };

  /* ── الإقلاع ── */

  AIMED.تفضيلات.طبّق();

  document.addEventListener('DOMContentLoaded', () => {
    AIMED.تفضيلات.طبّق();   // مرّة ثانية: الأزرار لم تكن موجودة في الأولى

    document.getElementById('زر-الليل').addEventListener('click', () =>
      AIMED.تفضيلات.اضبطالوضع(جذر.dataset['وضع'] === 'ليل' ? 'نهار' : 'ليل'));
    document.getElementById('زر-الخط').addEventListener('click', () =>
      AIMED.تفضيلات.دوّرالخط());
    document.getElementById('زر-القراءة').addEventListener('click', () =>
      AIMED.تفضيلات.اضبطالقراءة(جذر.dataset['قراءة'] !== 'نعم'));

    const عدد = AIMED.الفهرس.length;
    document.getElementById('عدّاد-الشعار').textContent = عدد ? AIMED.نص.أجوبة(عدد) : '';

    AIMED.عرض.الرف.ابنِ(document.getElementById('محتوى-الرف'));
    AIMED.عرض.البحث.ابدأ(document.getElementById('حقل-البحث'), document.getElementById('نتائج-البحث'));
    AIMED.عرض.الجوال.ابدأ();
    AIMED.عرض.التظليل.ابدأ();
    AIMED.عرض.التفاعل.ابدأ();

    addEventListener('scroll', حدّثالتقدّم, { passive: true });
    addEventListener('hashchange', وجّه);
    وجّه();

    // العمل بلا إنترنت — الحالة الفعلية داخل المشفى.
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(() => { /* لا يمنع شيئًا */ });
    }
  });
})();
