/**
 * الجوّال: الشريط السفلي والألواح التي تنزلق من الأسفل.
 *
 * الشاشة التي يُقرأ عليها هذا الموقع فعلًا هاتفٌ بيدٍ واحدة في مناوبة. لذلك
 * كل ما يُنقر كثيرًا في الأسفل حيث يصل الإبهام، لا في الأعلى حيث لا يصل.
 *
 * الألواح نفسها تُستعمل على الحاسوب أيضًا حين تُطلب، لكنها تظهر افتراضيًا
 * على الجوّال وحده لأن الحاسوب يملك الرفّ والهامش دائمين.
 */
AIMED.عرض = AIMED.عرض || {};

AIMED.عرض.الجوال = {
  مفتوح: null,

  ابدأ() {
    const ستارة = document.getElementById('الستارة');

    for (const زر of document.querySelectorAll('.زر-شريط')) {
      زر.addEventListener('click', () => this.بدّل(زر.dataset['لوح']));
    }
    for (const زر of document.querySelectorAll('[data-إغلاق]')) {
      زر.addEventListener('click', () => this.أغلقالألواح());
    }
    ستارة.addEventListener('click', () => this.أغلقالألواح());
    addEventListener('keydown', (ح) => { if (ح.key === 'Escape') this.أغلقالألواح(); });

    // اختيار جواب من لوح الفهرس يغلقه
    document.getElementById('جسم-الفهرس').addEventListener('click', (ح) => {
      if (ح.target.closest('.صف-جواب, .صف-رف')) this.أغلقالألواح();
    });

    // القفز إلى قسم من لوح الأقسام
    document.getElementById('جسم-الأقسام').addEventListener('click', (ح) => {
      const زر = ح.target.closest('.فقرة');
      if (!زر) return;
      this.أغلقالألواح();
      document.getElementById(زر.dataset['هدف'])?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // الإعدادات
    document.getElementById('خيارات-الخط').addEventListener('click', (ح) => {
      const خ = ح.target.closest('[data-خط]');
      if (خ) AIMED.تفضيلات.اضبطالخط(خ.dataset['خط']);
    });
    document.getElementById('خيارات-الوضع').addEventListener('click', (ح) => {
      const خ = ح.target.closest('[data-وضع]');
      if (خ) AIMED.تفضيلات.اضبطالوضع(خ.dataset['وضع']);
    });
    document.getElementById('زر-طباعة').addEventListener('click', () => {
      this.أغلقالألواح();
      setTimeout(() => print(), 260);
    });
  },

  بدّل(معرّف) {
    if (this.مفتوح === معرّف) { this.أغلقالألواح(); return; }
    this.أغلقالألواح();

    if (معرّف === 'لوح-الفهرس') this.املأالفهرس();
    if (معرّف === 'لوح-الأقسام') this.املأالأقسام();

    const لوح = document.getElementById(معرّف);
    لوح.setAttribute('data-ظاهر', '');
    لوح.setAttribute('aria-hidden', 'false');
    document.getElementById('الستارة').setAttribute('data-ظاهر', '');
    document.querySelector(`.زر-شريط[data-لوح="${معرّف}"]`)?.setAttribute('aria-expanded', 'true');
    this.مفتوح = معرّف;
  },

  أغلقالألواح() {
    for (const ل of document.querySelectorAll('.لوح-سفلي')) {
      ل.removeAttribute('data-ظاهر');
      ل.setAttribute('aria-hidden', 'true');
    }
    document.getElementById('الستارة').removeAttribute('data-ظاهر');
    for (const ز of document.querySelectorAll('.زر-شريط')) ز.setAttribute('aria-expanded', 'false');
    this.مفتوح = null;
  },

  /** الفهرس في اللوح = الرفّ نفسه، مبنيًّا مرة أخرى داخله. */
  املأالفهرس() {
    const جسم = document.getElementById('جسم-الفهرس');
    AIMED.عرض.الرف.ابنِ(جسم, { ثانوي: true });
    const حالي = location.hash.match(/#\/جواب\/(.+)$/);
    if (حالي) AIMED.عرض.الرف.علّم(decodeURIComponent(حالي[1]), جسم);
  },

  /** أقسام الجواب المفتوح — العمود الفقري نفسه في لوحٍ يصله الإبهام. */
  املأالأقسام() {
    const جسم = document.getElementById('جسم-الأقسام');
    const هامش = document.querySelector('.هامش .عمود-فقري');
    جسم.innerHTML = هامش
      ? `<div class="عمود-فقري">${هامش.innerHTML}</div>`
      : '<p class="لا-شيء">افتح جوابًا لترى أقسامه.</p>';
  },

  /** يعطّل ما لا معنى له خارج صفحة الجواب. */
  حدّث(نوعالصفحة) {
    const جواب = نوعالصفحة === 'جواب';
    document.querySelector('.زر-شريط[data-لوح="لوح-الأقسام"]').disabled = !جواب;
    document.querySelector('.زر-شريط[data-لوح="لوح-التظليل"]').disabled = !جواب;
  },
};
