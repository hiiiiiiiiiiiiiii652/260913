/**

- Original Warm Wedding Invitation
- Korean Mobile 청첩장 - Script
  */

(function () {
‘use strict’;

/* ═══════════════════════════════════════════
Utility Helpers
═══════════════════════════════════════════ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function formatDateShort(dateStr, timeStr) {
const [year, month, day] = dateStr.split(’-’).map(Number);
const [hour, minute] = timeStr.split(’:’).map(Number);
const d = new Date(year, month - 1, day, hour, minute);
const days = [‘SUN’, ‘MON’, ‘TUE’, ‘WED’, ‘THU’, ‘FRI’, ‘SAT’];
const dayName = days[d.getDay()];
const period = hour < 12 ? ‘AM’ : ‘PM’;
const h12 = hour % 12 || 12;
const minuteStr = String(minute).padStart(2, ‘0’);
return `${year}. ${String(month).padStart(2,'0')}. ${String(day).padStart(2,'0')} ${dayName} ${period} ${h12}:${minuteStr}`;
}

function getWeddingDateTime() {
const [year, month, day] = CONFIG.wedding.date.split(’-’).map(Number);
const [hour, minute] = CONFIG.wedding.time.split(’:’).map(Number);
return new Date(Date.UTC(year, month - 1, day, hour - 9, minute));
}

/* ═══════════════════════════════════════════
Image Auto-Detection
═══════════════════════════════════════════ */

function checkImageExists(path) {
return new Promise(resolve => {
const img = new Image();
const timer = setTimeout(() => { img.src = ‘’; resolve(false); }, 5000);
img.onload = function () { clearTimeout(timer); resolve(this.naturalWidth > 0); };
img.onerror = function () { clearTimeout(timer); resolve(false); };
img.src = path;
});
}

async function loadImagesFromFolder(folder, maxAttempts = 50) {
const images = [];
let consecutiveFails = 0;

```
for (let i = 1; i <= maxAttempts; i++) {
  if (consecutiveFails >= 3) break;

  const path = `images/${folder}/${i}.jpg`;
  const exists = await checkImageExists(path);

  if (exists) {
    images.push(path);
    consecutiveFails = 0;
  } else {
    const pathJpeg = `images/${folder}/${i}.jpeg`;
    const existsJpeg = await checkImageExists(pathJpeg);
    if (existsJpeg) {
      images.push(pathJpeg);
      consecutiveFails = 0;
    } else {
      consecutiveFails++;
    }
  }
}
return images;
```

}

/* ═══════════════════════════════════════════
Toast
═══════════════════════════════════════════ */

let toastTimer = null;

function showToast(message) {
const el = $(’#toast’);
el.textContent = message;
el.classList.add(‘is-visible’);
clearTimeout(toastTimer);
toastTimer = setTimeout(() => el.classList.remove(‘is-visible’), 2500);
}

/* ═══════════════════════════════════════════
Clipboard
═══════════════════════════════════════════ */

async function copyToClipboard(text, successMsg) {
try {
if (navigator.clipboard && window.isSecureContext) {
await navigator.clipboard.writeText(text);
} else {
const ta = document.createElement(‘textarea’);
ta.value = text;
ta.style.cssText = ‘position:fixed;opacity:0;left:-9999px’;
document.body.appendChild(ta);
ta.focus();
ta.select();
document.execCommand(‘copy’);
ta.remove();
}
showToast(successMsg || ‘복사되었습니다’);
} catch {
showToast(‘복사에 실패했습니다’);
}
}

/* ═══════════════════════════════════════════
OG Meta Tags
═══════════════════════════════════════════ */

function setMetaTags() {
const m = CONFIG.meta;
document.title = m.title;
const setMeta = (attr, val, content) => {
const el = document.querySelector(`meta[${attr}="${val}"]`);
if (el) el.setAttribute(‘content’, content);
};
setMeta(‘property’, ‘og:title’, m.title);
setMeta(‘property’, ‘og:description’, m.description);
setMeta(‘property’, ‘og:image’, ‘images/og/1.jpg’);
setMeta(‘name’, ‘twitter:title’, m.title);
setMeta(‘name’, ‘twitter:description’, m.description);
setMeta(‘name’, ‘twitter:image’, ‘images/og/1.jpg’);
setMeta(‘name’, ‘description’, m.description);
}

/* ═══════════════════════════════════════════
Curtain
═══════════════════════════════════════════ */

function initCurtain() {
const curtain = $(’#curtainOverlay’);
if (!curtain) return;

```
if (CONFIG.useCurtain === false) {
  curtain.style.display = 'none';
  return;
}

curtain.classList.add('curtain-active');
setTimeout(() => {
  curtain.classList.add('hidden');
  curtain.classList.remove('curtain-active');
}, 2800);
```

}

/* ═══════════════════════════════════════════
Petal Animation
═══════════════════════════════════════════ */

function initPetals() {
const container = document.createElement(‘div’);
container.className = ‘petals-container’;
document.body.appendChild(container);

```
function createPetal() {
  const petal = document.createElement('div');
  petal.className = 'petal';
  const startX = Math.random() * 100;
  const size = Math.random() * 8 + 8;
  const duration = Math.random() * 4 + 6;
  const delay = Math.random() * 0.5;
  petal.style.left = startX + 'vw';
  petal.style.width = size + 'px';
  petal.style.height = size + 'px';
  petal.style.animationDuration = duration + 's';
  petal.style.animationDelay = delay + 's';
  container.appendChild(petal);
  setTimeout(() => { petal.remove(); }, (duration + delay) * 1000 + 100);
}

let petalCount = 0;
const maxPetals = 40;
const interval = setInterval(() => {
  if (petalCount >= maxPetals) {
    clearInterval(interval);
    setTimeout(() => { container.remove(); }, 12000);
    return;
  }
  createPetal();
  if (Math.random() > 0.5) createPetal();
  petalCount++;
}, 400);
```

}

/* ═══════════════════════════════════════════
Hero Section
═══════════════════════════════════════════ */

function initHero() {
const heroImg = $(’#heroImage’);
if (heroImg) {
heroImg.src = ‘images/hero/1.jpg’;
heroImg.onerror = function() {
this.closest(’.hero-image-container’).style.minHeight = ‘0’;
this.style.display = ‘none’;
};
}

```
$('#heroDate').textContent = formatDateShort(CONFIG.wedding.date, CONFIG.wedding.time);
$('#heroNames').textContent = `${CONFIG.groom.name} & ${CONFIG.bride.name}`;
$('#heroVenue').textContent = CONFIG.wedding.venue;

const g = CONFIG.groom;
const b = CONFIG.bride;

function parentSpan(name, deceased) {
  return deceased
    ? `<span class="parent-names deceased">${name}</span>`
    : `<span class="parent-names">${name}</span>`;
}

$('#heroParents').innerHTML = `
  <p class="parent-line">${parentSpan(g.father, g.fatherDeceased)} · ${parentSpan(g.mother, g.motherDeceased)}의 아들 <span class="child-name">${g.name}</span></p>
  <p class="parent-line">${parentSpan(b.father, b.fatherDeceased)} · ${parentSpan(b.mother, b.motherDeceased)}의 딸 <span class="child-name">${b.name}</span></p>
`;
```

}

/* ═══════════════════════════════════════════
Countdown
═══════════════════════════════════════════ */

function initCountdown() {
const target = getWeddingDateTime();

```
function update() {
  const diff = target - new Date();
  if (diff <= 0) {
    ['days','hours','minutes','seconds'].forEach(k => {
      $(`#countdown-${k}`).textContent = '0';
    });
    return;
  }
  $('#countdown-days').textContent = Math.floor(diff / (1000 * 60 * 60 * 24));
  $('#countdown-hours').textContent = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  $('#countdown-minutes').textContent = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  $('#countdown-seconds').textContent = Math.floor((diff % (1000 * 60)) / 1000);
}

update();
setInterval(update, 1000);
```

}

/* ═══════════════════════════════════════════
Calendar (Google Cal & ICS)
═══════════════════════════════════════════ */

function initCalendar() {
const dt = getWeddingDateTime();
const pad = n => String(n).padStart(2, ‘0’);
const fmt = d => `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

```
const startDate = fmt(dt);
const endDate = fmt(new Date(dt.getTime() + 2 * 60 * 60 * 1000));

const googleBtn = $('#googleCalBtn');
if (googleBtn) {
  googleBtn.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(CONFIG.groom.name + ' ♥ ' + CONFIG.bride.name + ' 결혼식')}&dates=${startDate}/${endDate}&location=${encodeURIComponent(CONFIG.wedding.venue + ' ' + CONFIG.wedding.address)}&details=${encodeURIComponent('결혼식에 초대합니다.')}`;
}

const icsBtn = $('#icsDownloadBtn');
if (icsBtn) {
  icsBtn.addEventListener('click', () => {
    const icsContent = [
      'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Wedding//Invitation//KO',
      'BEGIN:VEVENT',
      `DTSTART:${startDate}`,`DTEND:${endDate}`,
      `SUMMARY:${CONFIG.groom.name} ♥ ${CONFIG.bride.name} 결혼식`,
      `LOCATION:${CONFIG.wedding.venue} ${CONFIG.wedding.address}`,
      'DESCRIPTION:결혼식에 초대합니다.','END:VEVENT','END:VCALENDAR'
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([icsContent], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'wedding.ics'; a.click();
    URL.revokeObjectURL(url);
    showToast('캘린더 파일이 다운로드됩니다');
  });
}
```

}

/* ═══════════════════════════════════════════
Wedding Calendar (달력 UI)
═══════════════════════════════════════════ */

function initWeddingCalendar() {
const container = $(’#weddingCalendar’);
if (!container) return;

```
const [year, month, weddingDay] = CONFIG.wedding.date.split('-').map(Number);
const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const dayNames = ['일','월','화','수','목','금','토'];
const firstDay = new Date(year, month - 1, 1).getDay();
const lastDate = new Date(year, month, 0).getDate();

let html = `<div class="cal-header">${year}년 ${monthNames[month - 1]}</div><div class="cal-grid">`;
dayNames.forEach(d => { html += `<div class="cal-day-name">${d}</div>`; });
for (let i = 0; i < firstDay; i++) html += '<div class="cal-cell empty"></div>';
for (let d = 1; d <= lastDate; d++) {
  const isWedding = d === weddingDay;
  html += `<div class="cal-cell${isWedding ? ' wedding-day' : ''}">${d}${isWedding ? '<span class="cal-heart">♥</span>' : ''}</div>`;
}
html += '</div>';
container.innerHTML = html;
```

}

/* ═══════════════════════════════════════════
Transport Tabs
═══════════════════════════════════════════ */

function initTransport() {
const t = CONFIG.wedding.transport;
if (!t) return;

```
if ($('#transport-subway')) $('#transport-subway').innerHTML = t.subway.replace(/\n/g, '<br>');
if ($('#transport-bus')) $('#transport-bus').innerHTML = t.bus.replace(/\n/g, '<br>');
if ($('#transport-car')) $('#transport-car').innerHTML = t.car.replace(/\n/g, '<br>');

$$('.transport-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    $$('.transport-tab').forEach(t => t.classList.remove('active'));
    $$('.transport-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    $(`#tab-${tab.dataset.tab}`).classList.add('active');
  });
});
```

}

/* ═══════════════════════════════════════════
Story Section
═══════════════════════════════════════════ */

function initStory(storyImages) {
$(’#storyTitle’).textContent = CONFIG.story.title;
$(’#storyContent’).textContent = CONFIG.story.content;

```
const topContainer = $('#storyPhotos');
const bottomContainer = $('#storyPhotosBottom');

topContainer.querySelector('.loading-placeholder')?.remove();
bottomContainer.querySelector('.loading-placeholder')?.remove();

if (storyImages.length === 0) return;

storyImages.forEach((src, i) => {
  const div = document.createElement('div');
  div.className = 'story-image-container ' + (i % 2 === 0 ? 'fade-in-left' : 'fade-in-right');
  div.innerHTML = `<img src="${src}" alt="스토리 사진 ${i + 1}" loading="lazy">`;
  div.addEventListener('click', () => openViewer(storyImages, i));
  (i === 0 ? topContainer : bottomContainer).appendChild(div);
});

observeNewElements();
```

}

/* ═══════════════════════════════════════════
Gallery Section
═══════════════════════════════════════════ */

function initGallery(galleryImages) {
const grid = $(’#galleryGrid’);
grid.querySelector(’.loading-placeholder’)?.remove();

```
if (galleryImages.length === 0) {
  const section = $('#gallerySection');
  if (section) section.style.display = 'none';
  return;
}

galleryImages.forEach((src, i) => {
  const div = document.createElement('div');
  div.className = 'gallery-item scale-in';
  div.style.setProperty('--delay', i);
  div.innerHTML = `<img src="${src}" alt="갤러리 사진 ${i + 1}" loading="lazy">`;
  div.addEventListener('click', () => openViewer(galleryImages, i));
  grid.appendChild(div);
});

$('#totalCount').textContent = galleryImages.length;
observeNewElements();
```

}

/* ═══════════════════════════════════════════
★ 수정 2: Slider - 모든 사진 슬라이드 가능하도록 수정
═══════════════════════════════════════════ */

function initSlider(trackId, prevId, nextId, images) {
const track = $(`#${trackId}`);
if (!track || images.length === 0) {
const section = track ? track.closest(’.section-slider’) : null;
if (section) section.style.display = ‘none’;
return;
}

```
images.forEach((src, i) => {
  const item = document.createElement('div');
  item.className = 'slider-item';
  item.innerHTML = `<img src="${src}" alt="사진 ${i + 1}" loading="lazy">`;
  item.addEventListener('click', () => openViewer(images, i));
  track.appendChild(item);
});

let current = 0;
const total = images.length;

/* ★ getBoundingClientRect()로 실제 렌더된 너비 + gap 계산 */
const getItemWidth = () => {
  const first = track.querySelector('.slider-item');
  if (!first) return 0;
  return first.getBoundingClientRect().width + 12; // 12 = gap
};

const move = () => {
  track.style.transform = `translateX(${-current * getItemWidth()}px)`;
};

const updateBtns = () => {
  const prevBtn = $(`#${prevId}`);
  const nextBtn = $(`#${nextId}`);
  if (prevBtn) prevBtn.style.opacity = current === 0 ? '0.3' : '1';
  if (nextBtn) nextBtn.style.opacity = current >= total - 1 ? '0.3' : '1';
};

const prevBtn = $(`#${prevId}`);
const nextBtn = $(`#${nextId}`);

if (prevBtn) {
  prevBtn.addEventListener('click', () => {
    if (current > 0) { current--; move(); updateBtns(); }
  });
}
if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    if (current < total - 1) { current++; move(); updateBtns(); }
  });
}

updateBtns();

// 터치 스와이프
let startX = 0;
track.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
}, { passive: true });

track.addEventListener('touchend', e => {
  const diff = startX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 40) {
    if (diff > 0 && current < total - 1) { current++; move(); updateBtns(); }
    else if (diff < 0 && current > 0) { current--; move(); updateBtns(); }
  }
});

window.addEventListener('resize', () => { move(); });
```

}

/* ═══════════════════════════════════════════
★ 수정 1, 3: Photo Viewer - 닫을 때 원래 스크롤 위치 복원
═══════════════════════════════════════════ */

let viewerImages = [];
let viewerIndex = 0;
let savedScrollY = 0;
let touchStartX = 0;
let touchEndX = 0;

function openViewer(images, index) {
/* ★ 열기 전 스크롤 위치 저장 */
savedScrollY = window.scrollY || window.pageYOffset;

```
viewerImages = images;
viewerIndex = index;
showViewerImage();

/* ★ body 고정 시 현재 위치 유지 (top 설정으로 점프 방지) */
document.body.style.top = `-${savedScrollY}px`;
document.body.classList.add('no-scroll');
$('#photoViewer').classList.add('active');
```

}

function closeViewer() {
$(’#photoViewer’).classList.remove(‘active’);

```
/* ★ 고정 해제 후 저장된 위치로 즉시 복원 */
document.body.classList.remove('no-scroll');
document.body.style.top = '';
window.scrollTo({ top: savedScrollY, behavior: 'instant' });

const img = $('#viewerImage');
if (img) img.style.transform = '';
```

}

function showViewerImage() {
const img = $(’#viewerImage’);
const loading = $(’#viewerLoading’);
loading.classList.remove(‘hidden’);
img.style.opacity = ‘0’;
img.src = viewerImages[viewerIndex];
$(’#currentIndex’).textContent = viewerIndex + 1;
$(’#totalCount’).textContent = viewerImages.length;
}

function navigateViewer(direction) {
const img = $(’#viewerImage’);
const slideOut = direction === ‘next’ ? ‘-100%’ : ‘100%’;
const slideIn  = direction === ‘next’ ?  ‘100%’ : ‘-100%’;

```
img.style.transition = 'transform 0.28s ease, opacity 0.28s ease';
img.style.transform  = `translateX(${slideOut})`;
img.style.opacity    = '0';

setTimeout(() => {
  viewerIndex = direction === 'prev'
    ? (viewerIndex - 1 + viewerImages.length) % viewerImages.length
    : (viewerIndex + 1) % viewerImages.length;

  img.style.transition = 'none';
  img.style.transform  = `translateX(${slideIn})`;
  img.style.opacity    = '0';
  showViewerImage();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      img.style.transition = 'transform 0.28s ease, opacity 0.28s ease';
      img.style.transform  = 'translateX(0)';
      img.style.opacity    = '1';
    });
  });
}, 280);
```

}

function initPhotoViewer() {
const viewer = $(’#photoViewer’);
const viewerImage = $(’#viewerImage’);
const viewerLoading = $(’#viewerLoading’);

```
$('#viewerClose').addEventListener('click', closeViewer);
$('#viewerPrev').addEventListener('click', () => navigateViewer('prev'));
$('#viewerNext').addEventListener('click', () => navigateViewer('next'));

viewerImage.addEventListener('load', () => {
  viewerLoading.classList.add('hidden');
  viewerImage.style.opacity = '1';
});
viewerImage.addEventListener('error', () => {
  viewerLoading.classList.add('hidden');
  viewerImage.style.opacity = '1';
});

document.addEventListener('keydown', (e) => {
  if (!viewer.classList.contains('active')) return;
  if (e.key === 'Escape') closeViewer();
  if (e.key === 'ArrowLeft') navigateViewer('prev');
  if (e.key === 'ArrowRight') navigateViewer('next');
});

let isSingleTouch = false;
const content = $('#viewerContent');

content.addEventListener('touchstart', (e) => {
  isSingleTouch = e.touches.length === 1;
  if (isSingleTouch) touchStartX = e.touches[0].clientX;
}, { passive: true });

content.addEventListener('touchend', (e) => {
  if (!isSingleTouch) return;
  touchEndX = e.changedTouches[0].clientX;
  const diffX = touchStartX - touchEndX;
  if (Math.abs(diffX) > 50) {
    if (diffX > 0) navigateViewer('next');
    else navigateViewer('prev');
  }
});
```

}

/* ═══════════════════════════════════════════
★ 수정 4: Location - 카카오맵 iframe 표출
═══════════════════════════════════════════ */

function initLocation() {
const w = CONFIG.wedding;
$(’#locationVenue’).textContent = w.venue;
$(’#locationAddress’).textContent = w.address;
$(’#kakaoMapBtn’).href = w.mapLinks.kakao || ‘#’;
$(’#naverMapBtn’).href = w.mapLinks.naver || ‘#’;

```
// 카카오맵 place ID 추출 → iframe 임베드
const kakaoUrl = w.mapLinks.kakao || '';
const placeIdMatch = kakaoUrl.match(/\/(\d+)(?:[?#].*)?$/);
const mapContainer = document.querySelector('.location-map-container');

if (mapContainer && placeIdMatch) {
  const placeId = placeIdMatch[1];
  // 카카오맵 place 임베드 URL
  const iframeSrc = `https://map.kakao.com/link/embed/place,${placeId}`;
  mapContainer.innerHTML = `
    <iframe
      src="${iframeSrc}"
      width="100%"
      height="300"
      style="border:0; border-radius:8px; display:block;"
      allowfullscreen
      loading="lazy"
      title="오시는 길"
    ></iframe>
  `;
  mapContainer.style.maxWidth = '100%';
  mapContainer.style.borderRadius = '8px';
  mapContainer.style.overflow = 'hidden';
} else if (mapContainer) {
  // fallback: 정적 이미지
  const mapImg = mapContainer.querySelector('#locationMapImg') || mapContainer.querySelector('img');
  if (mapImg) {
    mapImg.src = 'images/location/1.jpg';
    mapImg.onerror = function() {
      mapContainer.style.display = 'none';
    };
  }
}

$('#copyAddressBtn').addEventListener('click', () => {
  copyToClipboard(w.address, '주소가 복사되었습니다');
});
```

}

/* ═══════════════════════════════════════════
Account Section
═══════════════════════════════════════════ */

function renderAccounts(accounts, containerId) {
const container = $(`#${containerId}`);
accounts.forEach((acc) => {
const item = document.createElement(‘div’);
item.className = ‘account-item’;
const accountStr = `${acc.bank} ${acc.number}`;
item.innerHTML = `<p class="account-role">${acc.role}</p> <p class="account-info">${accountStr}</p> <button class="copy-btn" data-account="${accountStr}">복사</button>`;
container.appendChild(item);
});
}

function initAccounts() {
renderAccounts(CONFIG.accounts.groom, ‘groomAccountList’);
renderAccounts(CONFIG.accounts.bride, ‘brideAccountList’);

```
$$('.accordion-header').forEach((header) => {
  header.addEventListener('click', () => {
    header.parentElement.classList.toggle('active');
  });
});

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.account-item .copy-btn');
  if (!btn) return;
  copyToClipboard(btn.dataset.account, '계좌번호가 복사되었습니다');
});
```

}

/* ═══════════════════════════════════════════
Footer
═══════════════════════════════════════════ */

function initFooter() {
const [year, month, day] = CONFIG.wedding.date.split(’-’);
$(’#footerText’).textContent = `${CONFIG.groom.name} & ${CONFIG.bride.name} — ${year}.${month}.${day}`;
}

/* ═══════════════════════════════════════════
Loading Placeholders
═══════════════════════════════════════════ */

function showLoadingPlaceholders() {
const placeholderHTML = ‘<div class="loading-placeholder"><span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span></div>’;
const storyPhotos = $(’#storyPhotos’);
const galleryGrid = $(’#galleryGrid’);
if (storyPhotos) storyPhotos.innerHTML = placeholderHTML;
if (galleryGrid) galleryGrid.innerHTML = placeholderHTML;
}

/* ═══════════════════════════════════════════
Scroll Animations
═══════════════════════════════════════════ */

let scrollObserver = null;

function initScrollAnimations() {
scrollObserver = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.classList.add(‘visible’);
scrollObserver.unobserve(entry.target);
}
});
}, { root: null, rootMargin: ‘0px’, threshold: 0.1 });

```
[
  ['.story-text', 'fade-in-right'],
  ['.gallery-title', 'fade-in'],
  ['.gallery-subtitle', 'fade-in'],
  ['.location-title', 'fade-in'],
  ['.location-info', 'fade-in'],
  ['.location-map-container', 'scale-in'],
  ['.account-title', 'fade-in'],
  ['.account-subtitle', 'fade-in'],
].forEach(([sel, cls]) => {
  const el = $(sel);
  if (el) el.classList.add(cls);
});

$$('.fade-in, .fade-in-left, .fade-in-right, .scale-in').forEach(el => {
  scrollObserver.observe(el);
});
```

}

function observeNewElements() {
if (!scrollObserver) return;
$$(’.fade-in, .fade-in-left, .fade-in-right, .scale-in’).forEach(el => {
if (!el.classList.contains(‘visible’)) scrollObserver.observe(el);
});
}

/* ═══════════════════════════════════════════
Init
═══════════════════════════════════════════ */

async function init() {
setMetaTags();
initCurtain();
initHero();
initCountdown();
initCalendar();
initWeddingCalendar();
initTransport();
showLoadingPlaceholders();
initPhotoViewer();
initLocation();
initAccounts();
initFooter();
initScrollAnimations();
initPetals();

```
const [storyImages, galleryImages, schoolImages, jejuImages] = await Promise.all([
  loadImagesFromFolder('story'),
  loadImagesFromFolder('gallery'),
  loadImagesFromFolder('school'),
  loadImagesFromFolder('jeju')
]);

initStory(storyImages);
initGallery(galleryImages);
initSlider('schoolTrack', 'schoolPrev', 'schoolNext', schoolImages);
initSlider('jejuTrack', 'jejuPrev', 'jejuNext', jejuImages);
```

}

if (document.readyState === ‘loading’) {
document.addEventListener(‘DOMContentLoaded’, init);
} else {
init();
}

})();
