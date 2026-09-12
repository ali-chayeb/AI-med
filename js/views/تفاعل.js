/**
 * تفاعلات داخل متن الجواب — كلّها من عقد التأليف (TEMPLATE-SPEC v1).
 *
 * · الاختبار الذاتي: صناديق تُعلَّم ويُحفظ تقدّمها لكل جواب. الأجوبة محجوبة
 *   عمدًا (القاعدة A7): استرجاعُها من الذاكرة هو التمرين نفسه.
 * · المجموعات القابلة للطيّ: تتذكّر حالتها.
 * · وسوم الدليل [E] [G] [L] [?] و[T1]–[T3]: تُعرّف نفسها عند اللمس.
 * · موضع القراءة: يُحفظ لكل جواب، فتعود إلى حيث توقّفت.
 */
AIMED.عرض = AIMED.عرض || {};

AIMED.عرض.التفاعل = {
  slug: null,

  ابدأ() {
    const محتوى = document.getElementById('المحتوى');

    محتوى.addEventListener('change', (ح) => {
      if (ح.target.matches('.سؤال input')) this.احفظالاختبار();
    });

    محتوى.addEventListener('toggle', (ح) => {
      if (ح.target.matches('details.مجموعة')) this.احفظالمجموعات();
    }, true);

    محتوى.addEventListener('click', (ح) => {
      const وسم = ح.target.closest('.وسم-دليل');
      if (وسم) { this.اشرحوسمًا(وسم); return; }
    });

    // موضع القراءة — يُحفظ بهدوء أثناء التمرير
    let مؤجَّل;
    addEventListener('scroll', () => {
      clearTimeout(مؤجَّل);
      مؤجَّل = setTimeout(() => this.احفظالموضع(), 400);
    }, { passive: true });
  },

  /** يُستدعى بعد رسم كل جواب. */
  استأنف(slug) {
    this.slug = slug;
    this.استعدالاختبار();
    this.استعدالمجموعات();
    this.حدّثالعدّاد();
  },

  /* ── الاختبار ── */

  احفظالاختبار() {
    const مُعلَّم = [...document.querySelectorAll('.سؤال input')]
      .map((ص, i) => (ص.checked ? i : -1)).filter((i) => i >= 0);
    AIMED.تخزين.اكتب('اختبار_' + this.slug, JSON.stringify(مُعلَّم));
    this.حدّثالعدّاد();
  },

  استعدالاختبار() {
    let مُعلَّم = [];
    try { مُعلَّم = JSON.parse(AIMED.تخزين.اقرأ('اختبار_' + this.slug, '[]')) || []; } catch { /* لا شيء */ }
    const صناديق = [...document.querySelectorAll('.سؤال input')];
    for (const i of مُعلَّم) if (صناديق[i]) صناديق[i].checked = true;
  },

  حدّثالعدّاد() {
    for (const كتلة of document.querySelectorAll('[data-اختبار]')) {
      const صناديق = kصناديق(كتلة);
      const مُعلَّم = صناديق.filter((ص) => ص.checked).length;
      const عدّاد = كتلة.querySelector('[data-عدّاد]');
      if (عدّاد) عدّاد.textContent = صناديق.length ? `${مُعلَّم} / ${صناديق.length}` : '';
    }
    function kصناديق(ك) { return [...ك.querySelectorAll('.سؤال input')]; }
  },

  /* ── المجموعات ── */

  احفظالمجموعات() {
    const مطوية = [...document.querySelectorAll('details.مجموعة')]
      .map((د, i) => (د.open ? -1 : i)).filter((i) => i >= 0);
    AIMED.تخزين.اكتب('مجموعات_' + this.slug, JSON.stringify(مطوية));
  },

  استعدالمجموعات() {
    let مطوية = [];
    try { مطوية = JSON.parse(AIMED.تخزين.اقرأ('مجموعات_' + this.slug, '[]')) || []; } catch { /* لا شيء */ }
    const كل = [...document.querySelectorAll('details.مجموعة')];
    for (const i of مطوية) if (كل[i]) كل[i].open = false;
  },

  /* ── وسوم الدليل ── */

  اشرحوسمًا(وسم) {
    const شرح = وسم.getAttribute('title');
    if (شرح) AIMED.عرض.التفاعل.أظهرهمسة(شرح, وسم);
  },

  أظهرهمسة(نص, قرب) {
    let ه = document.getElementById('همسة');
    if (!ه) {
      ه = document.createElement('div');
      ه.id = 'همسة';
      ه.className = 'همسة';
      document.body.appendChild(ه);
    }
    ه.textContent = نص;
    ه.setAttribute('data-ظاهر', '');
    const م = قرب.getBoundingClientRect();
    const ع = ه.offsetWidth;
    ه.style.left = Math.max(8, Math.min(م.left + م.width / 2 - ع / 2, innerWidth - ع - 8)) + 'px';
    ه.style.top = (م.top > 70 ? م.top - ه.offsetHeight - 8 : م.bottom + 8) + 'px';
    clearTimeout(this._همسة);
    this._همسة = setTimeout(() => ه.removeAttribute('data-ظاهر'), 2600);
  },

  /* ── موضع القراءة ── */

  احفظالموضع() {
    if (!this.slug || document.documentElement.dataset['صفحة'] !== 'جواب') return;
    AIMED.تخزين.اكتب('موضع_' + this.slug, String(Math.round(scrollY)));
  },

  /** يعيدك إلى حيث توقّفت — بلا قفزة إن كنت في الأعلى أصلًا. */
  أعدالموضع(slug) {
    const م = +AIMED.تخزين.اقرأ('موضع_' + slug, '0');
    if (م > 120) scrollTo({ top: م, behavior: 'auto' });
    return م > 120;
  },
};
