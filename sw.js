/**
 * العمل بلا إنترنت.
 *
 * الحالة الفعلية التي بُني لها هذا الموقع: مناوبة ليلية، هاتف، لا شبكة.
 * فكل ما يُفتح مرّة يبقى متاحًا بعدها.
 *
 * رقم النسخة تكتبه أداة البناء — لا تعدّله بيدك.
 */
const نسخة = 'mtxw1pdv';
const مخزن = 'مرجع-' + نسخة;

// هيكل التطبيق: يُخزَّن عند التركيب. أما الأجوبة فتُخزَّن عند فتحها.
const الهيكل = [
  './',
  './index.html',
  './manifest.webmanifest',
  './أيقونة.svg',
  './css/fonts.css',
  './css/tokens.css',
  './css/app.css',
  './بيانات/الفهرس.js',
  './js/core/نطاق.js',
  './js/core/تخزين.js',
  './js/core/نص.js',
  './js/data/مخزن.js',
  './js/views/مشترك.js',
  './js/views/رف.js',
  './js/views/بيت.js',
  './js/views/جواب.js',
  './js/views/هامش.js',
  './js/views/تظليل.js',
  './js/views/تفاعل.js',
  './js/views/بحث.js',
  './js/views/جوال.js',
  './js/app.js',
  './خطوط/IBMPlexSansArabic-400-arabic.woff2',
  './خطوط/IBMPlexSansArabic-400-latin.woff2',
  './خطوط/IBMPlexSansArabic-500-arabic.woff2',
  './خطوط/IBMPlexSansArabic-500-latin.woff2',
  './خطوط/IBMPlexSansArabic-600-arabic.woff2',
  './خطوط/IBMPlexSansArabic-600-latin.woff2',
  './خطوط/IBMPlexSansArabic-700-arabic.woff2',
  './خطوط/IBMPlexSansArabic-700-latin.woff2',
];

self.addEventListener('install', (ح) => {
  ح.waitUntil(
    caches.open(مخزن)
      // addAll يسقط كلّه إن سقط ملف واحد، فيُخزَّن كلٌّ على حدة.
      .then((خ) => Promise.all(الهيكل.map((م) => خ.add(م).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (ح) => {
  ح.waitUntil(
    caches.keys()
      .then((أسماء) => Promise.all(أسماء.filter((ا) => ا !== مخزن).map((ا) => caches.delete(ا))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (ح) => {
  const طلب = ح.request;
  if (طلب.method !== 'GET') return;
  const عنوان = new URL(طلب.url);
  if (عنوان.origin !== location.origin) return;

  // الشبكة أولًا للصفحة نفسها كي يصل التحديث، والمخزن احتياطًا حين لا شبكة.
  if (طلب.mode === 'navigate') {
    ح.respondWith(
      fetch(طلب)
        .then((رد) => { خزّن(طلب, رد.clone()); return رد; })
        .catch(() => caches.match('./index.html').then((ر) => ر || Response.error()))
    );
    return;
  }

  // كل ما عداها: المخزن أولًا (سريع وبلا شبكة)، ثم الشبكة وتُخزَّن.
  ح.respondWith(
    caches.match(طلب).then((مخبأ) => مخبأ || fetch(طلب).then((رد) => {
      if (رد.ok) خزّن(طلب, رد.clone());
      return رد;
    }))
  );
});

function خزّن(طلب, رد) {
  caches.open(مخزن).then((خ) => خ.put(طلب, رد)).catch(() => null);
}
