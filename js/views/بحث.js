/**
 * البحث: يفتح فوق الصفحة، ويُغلق بـ Esc أو باختيار نتيجة.
 * الأسهم تتنقّل، Enter يفتح — كي لا تلزم الفأرة أثناء الدراسة.
 */
AIMED.عرض = AIMED.عرض || {};

AIMED.عرض.البحث = {
  حقل: null, لوح: null, نتائج: [], محدّد: -1,

  ابدأ(حقل, لوح) {
    this.حقل = حقل; this.لوح = لوح;

    حقل.addEventListener('input', () => this.حدّث());
    حقل.addEventListener('keydown', (ح) => this.مفتاح(ح));
    حقل.form.addEventListener('submit', (ح) => {
      ح.preventDefault();
      if (this.نتائج.length) this.افتح(Math.max(this.محدّد, 0));
    });

    // «/» يركّز البحث، وEsc يغلقه — من أي مكان في الصفحة.
    document.addEventListener('keydown', (ح) => {
      if (ح.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
        ح.preventDefault(); حقل.focus(); حقل.select();
      } else if (ح.key === 'Escape') this.أغلق();
    });

    لوح.addEventListener('click', (ح) => { if (ح.target === لوح) this.أغلق(); });
  },

  حدّث() {
    const س = this.حقل.value.trim();
    if (س.length < 2) { this.أغلق(); return; }

    this.نتائج = AIMED.مخزن.ابحث(س);
    this.محدّد = -1;
    const هـ = AIMED.نص.هرّب;

    this.لوح.innerHTML = '<div class="نتائج-داخل">' + (this.نتائج.length
      ? this.نتائج.map((ج) =>
          `<a class="نتيجة" href="#/جواب/${encodeURIComponent(ج.slug)}">`
          + `<span class="رمز">${هـ(AIMED.رمزنوع(ج.نوع))}</span>`
          + `<span class="عنوان">${AIMED.نص.أبرز(ج.عنوان, س)}`
          + `${ج.اختصار ? ` <span class="فرع">${AIMED.نص.أبرز(ج.اختصار, س)}</span>` : ''}</span>`
          + `<span class="فرع">${هـ(ج.جهاز)}</span>`
          + `</a>`).join('')
      : `<p class="بحث-فارغ">لا نتيجة لـ «${هـ(س)}».</p>`) + '</div>';

    this.لوح.hidden = false;
    this.لوح.addEventListener('click', (ح) => { if (ح.target.closest('.نتيجة')) this.أغلق(); }, { once: true });
  },

  مفتاح(ح) {
    if (!this.نتائج.length || this.لوح.hidden) return;
    if (ح.key === 'ArrowDown' || ح.key === 'ArrowUp') {
      ح.preventDefault();
      this.محدّد = (this.محدّد + (ح.key === 'ArrowDown' ? 1 : -1) + this.نتائج.length) % this.نتائج.length;
      const عناصر = this.لوح.querySelectorAll('.نتيجة');
      عناصر.forEach((ع, i) => ع.toggleAttribute('data-مُحدّد', i === this.محدّد));
      عناصر[this.محدّد]?.scrollIntoView({ block: 'nearest' });
    }
  },

  افتح(i) {
    const ج = this.نتائج[i];
    if (!ج) return;
    location.hash = '#/جواب/' + encodeURIComponent(ج.slug);
    this.أغلق();
  },

  أغلق() {
    this.لوح.hidden = true;
    this.نتائج = []; this.محدّد = -1;
    if (document.activeElement === this.حقل) this.حقل.blur();
  },
};
