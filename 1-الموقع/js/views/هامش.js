/**
 * الهامش: العمود الفقري للجواب، ثم مصادره.
 *
 * العمود الفقري فهرس وشريط تقدّم في آن: ارتفاع كل شريحة يتناسب مع طول قسمها،
 * فترى موضعك وطول ما تبقّى معًا. شريحة Red Flags حمراء دائمًا.
 */
AIMED.عرض = AIMED.عرض || {};

AIMED.عرض.الهامش = {
  عنصر: null,
  مراقب: null,

  فرّغ(عنصر) {
    this.عنصر = عنصر;
    this.افصل();
    عنصر.innerHTML = '';
  },

  افصل() {
    if (this.مراقب) { this.مراقب.disconnect(); this.مراقب = null; }
  },

  ارسم(عنصر, بطاقة, جواب) {
    this.عنصر = عنصر;
    this.افصل();
    const هـ = AIMED.نص.هرّب;

    const أطوال = بطاقة.أقسام.map((ق) => ق.طول || 1);
    const أقصى = Math.max(...أطوال, 1);

    const فقرات = بطاقة.أقسام.map((ق) => {
      // 16px لأقصر قسم، 78px لأطوله — نسبة مقروءة لا نسبة حرفية.
      const ارتفاع = Math.round(16 + 62 * ((ق.طول || 1) / أقصى));
      return `<button class="فقرة" type="button" data-هدف="${هـ(ق.معرّف)}"${ق.إنذار ? ' data-إنذار' : ''}>`
        + `<span class="فقرة-شريط" style="height:${ارتفاع}px"></span>`
        + `<span class="فقرة-اسم">${هـ(ق.عنوان)}</span>`
        + `</button>`;
    }).join('');

    const مصادر = جواب.مصادر.length
      ? `<div class="هامش-كتلة">
           <p class="هامش-عنوان">المصادر</p>
           ${جواب.مصادر.map((م) => `<div class="مصدر" id="مصدر-${م.رقم}" data-رقم="${م.رقم}">`
             + `<span class="مصدر-رقم">[${م.رقم}]</span><span>${م.نص}</span></div>`).join('')}
         </div>`
      : '';

    عنصر.innerHTML = `
      <div class="هامش-كتلة">
        <p class="هامش-عنوان">هيكل الجواب</p>
        <div class="عمود-فقري">${فقرات}</div>
      </div>
      <div class="هامش-كتلة" id="كتلة-التظليل"></div>
      ${مصادر}`;

    عنصر.addEventListener('click', (ح) => {
      const ف = ح.target.closest('.فقرة');
      if (!ف) return;
      const هدف = document.getElementById(ف.dataset['هدف']);
      if (هدف) هدف.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    this.راقب();
  },

  /** يتابع القسم الظاهر ويعلّم شريحته. */
  راقب() {
    const أقسام = [...document.querySelectorAll('.ورقة .قسم')];
    if (!أقسام.length) return;
    const ظاهرة = new Set();

    this.مراقب = new IntersectionObserver((مدخلات) => {
      for (const م of مدخلات) {
        if (م.isIntersecting) ظاهرة.add(م.target.id); else ظاهرة.delete(م.target.id);
      }
      // الأعلى بين الظاهرة هو «أنت هنا».
      const حالي = أقسام.map((ق) => ق.id).find((id) => ظاهرة.has(id));
      for (const ف of this.عنصر.querySelectorAll('.فقرة')) {
        ف.setAttribute('aria-current', ف.dataset['هدف'] === حالي ? 'true' : 'false');
      }
    }, { rootMargin: '-72px 0px -55% 0px', threshold: 0 });

    أقسام.forEach((ق) => this.مراقب.observe(ق));
  },

  أبرزمصدرًا(رقم) {
    if (!this.عنصر) return;
    const هدف = this.عنصر.querySelector(`.مصدر[data-رقم="${CSS.escape(String(رقم))}"]`);
    for (const م of this.عنصر.querySelectorAll('.مصدر')) م.removeAttribute('data-مُبرز');
    if (!هدف) return;
    هدف.setAttribute('data-مُبرز', '');
    هدف.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },
};
