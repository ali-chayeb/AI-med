/**
 * الرفّ: الأجهزة، وتحت كل جهاز أجوبته.
 *
 * يُبنى مرّتين: في العمود الجانبي على الحاسوب، وداخل اللوح السفلي على
 * الجوّال. لذلك كل دالة تأخذ جذرها بدل أن تفترض عنصرًا واحدًا في الصفحة.
 */
AIMED.عرض = AIMED.عرض || {};

AIMED.عرض.الرف = {
  أساسي: null,

  ابنِ(عنصر, خيارات = {}) {
    if (!خيارات.ثانوي) this.أساسي = عنصر;
    const هـ = AIMED.نص.هرّب;
    const أجهزة = AIMED.مخزن.الأجهزة();

    if (!أجهزة.length) {
      عنصر.innerHTML = '<p class="لا-شيء">لا أجوبة بعد.</p>';
      return;
    }

    const مفتوحة = new Set(JSON.parse(AIMED.تخزين.اقرأ('رف', '[]') || '[]'));

    عنصر.innerHTML = (خيارات.ثانوي ? '' : '<p class="رف-عنوان">الأجهزة</p>')
      + أجهزة.map((د) => {
        const صفوف = د.أجوبة.map((ج) =>
          `<a class="صف-جواب" href="#/جواب/${encodeURIComponent(ج.slug)}" data-slug="${هـ(ج.slug)}">`
          + `<span class="رمز">${هـ(AIMED.رمزنوع(ج.نوع))}</span>`
          + `<span class="نص">${هـ(ج.اختصار || ج.عنوان)}</span>`
          + `</a>`).join('');

        return `<div class="جهاز" data-جهاز="${هـ(د.اسم)}" data-مفتوح="${مفتوحة.has(د.اسم) ? 'نعم' : 'لا'}">`
          + `<button class="جهاز-رأس" type="button">`
          + `<span class="جهاز-اسم">${هـ(د.اسم)}</span>`
          + `<span class="جهاز-عدد">${د.أجوبة.length}</span>`
          + `<svg class="جهاز-سهم" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 4L6 8l4 4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`
          + `</button>`
          + `<div class="جهاز-قائمة">${صفوف}</div>`
          + `</div>`;
      }).join('');

    عنصر.addEventListener('click', (ح) => {
      const رأس = ح.target.closest('.جهاز-رأس');
      if (!رأس) return;
      const جهاز = رأس.closest('.جهاز');
      جهاز.dataset['مفتوح'] = جهاز.dataset['مفتوح'] === 'نعم' ? 'لا' : 'نعم';
      this.احفظالمفتوح(عنصر);
    });
  },

  احفظالمفتوح(عنصر) {
    const أسماء = [...عنصر.querySelectorAll('.جهاز[data-مفتوح="نعم"]')].map((ع) => ع.dataset['جهاز']);
    AIMED.تخزين.اكتب('رف', JSON.stringify(أسماء));
  },

  /** يبرز الجواب المفتوح ويفتح جهازه. */
  علّم(slug, جذر) {
    const ع = جذر || this.أساسي;
    if (!ع) return;
    for (const ص of ع.querySelectorAll('.صف-جواب')) {
      const هو = ص.dataset['slug'] === slug;
      if (هو) {
        ص.setAttribute('aria-current', 'page');
        ص.closest('.جهاز').dataset['مفتوح'] = 'نعم';
        ص.scrollIntoView({ block: 'nearest' });
      } else ص.removeAttribute('aria-current');
    }
  },
};
