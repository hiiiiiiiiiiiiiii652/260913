/**
 * Wedding Invitation — script.js
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────
     CONFIG 안전 체크
     config.js 가 없거나 로드 실패 시 콘솔에 명확한 에러를 출력하고
     기본값으로 페이지가 최소한 보이도록 함
  ───────────────────────────────────────── */
  if (typeof CONFIG === 'undefined') {
    console.error(
      '[Wedding] config.js 가 로드되지 않았습니다.\n' +
      'GitHub 레포에 config.js 파일이 있는지, 파일명 대소문자가 정확한지 확인하세요.'
    );
    window.CONFIG = {
      useCurtain: false,
      groom:  { name:'신랑', father:'', mother:'', fatherDeceased:false, motherDeceased:false },
      bride:  { name:'신부', father:'', mother:'', fatherDeceased:false, motherDeceased:false },
      wedding:{
        date:'2026-09-13', time:'16:00',
        venue:'', address:'',
        mapLinks:{ kakao:'', naver:'' },
        transport:{ subway:'', bus:'', car:'' }
      },
      story:   { title:'', content:'' },
      accounts:{ groom:[], bride:[] },
      meta:    { title:'Wedding Invitation', description:'' }
    };
  }

  /* ─────────────────────────────────────────
     유틸
  ───────────────────────────────────────── */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function formatDateShort(dateStr, timeStr) {
    const [y, mo, d] = dateStr.split('-').map(Number);
    const [h, mi]    = timeStr.split(':').map(Number);
    const date       = new Date(y, mo - 1, d, h, mi);
    const dayName    = ['SUN','MON','TUE','WED','THU','FRI','SAT'][date.getDay()];
    const period     = h < 12 ? 'AM' : 'PM';
    const h12        = h % 12 || 12;
    return `${y}. ${String(mo).padStart(2,'0')}. ${String(d).padStart(2,'0')} ${dayName} ${period} ${h12}:${String(mi).padStart(2,'0')}`;
  }

  /* 한국시간(UTC+9) 기준으로 결혼식 시각을 UTC Date 로 변환 */
  function getWeddingDateTime() {
    const [y, mo, d] = CONFIG.wedding.date.split('-').map(Number);
    const [h, mi]    = CONFIG.wedding.time.split(':').map(Number);
    return new Date(Date.UTC(y, mo - 1, d, h - 9, mi));
  }

  /* ─────────────────────────────────────────
     이미지 자동 탐지
  ───────────────────────────────────────── */
  function checkImg(path) {
    return new Promise(resolve => {
      const img   = new Image();
      const timer = setTimeout(() => { img.src = ''; resolve(false); }, 5000);
      img.onload  = function () { clearTimeout(timer); resolve(this.naturalWidth > 0); };
      img.onerror = function () { clearTimeout(timer); resolve(false); };
      img.src = path;
    });
  }

  async function loadFolder(folder, max = 50) {
    const result = [];
    let fails = 0;
    for (let i = 1; i <= max; i++) {
      if (fails >= 3) break;
      if      (await checkImg(`images/${folder}/${i}.jpg`))  { result.push(`images/${folder}/${i}.jpg`);  fails = 0; }
      else if (await checkImg(`images/${folder}/${i}.jpeg`)) { result.push(`images/${folder}/${i}.jpeg`); fails = 0; }
      else fails++;
    }
    return result;
  }

  /* ─────────────────────────────────────────
     토스트
  ───────────────────────────────────────── */
  let toastTimer;
  function showToast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2500);
  }

  /* ─────────────────────────────────────────
     클립보드
  ───────────────────────────────────────── */
  async function copyText(text, msg) {
    try {
      if (navigator.clipboard && location.protocol === 'https:') {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = Object.assign(document.createElement('textarea'), {
          value: text, style: 'position:fixed;opacity:0;left:-9999px'
        });
        document.body.appendChild(ta);
        ta.focus(); ta.select(); document.execCommand('copy'); ta.remove();
      }
      showToast(msg || '복사되었습니다');
    } catch { showToast('복사에 실패했습니다'); }
  }

  /* ─────────────────────────────────────────
     OG 메타
  ───────────────────────────────────────── */
  function setMetaTags() {
    const m   = CONFIG.meta;
    const set = (attr, val, content) => {
      const el = document.querySelector(`meta[${attr}="${val}"]`);
      if (el) el.setAttribute('content', content);
    };
    document.title = m.title;
    set('property','og:title',       m.title);
    set('property','og:description', m.description);
    set('property','og:image',       'images/og/1.jpg');
    set('name','twitter:title',       m.title);
    set('name','twitter:description', m.description);
    set('name','twitter:image',       'images/og/1.jpg');
    set('name','description',         m.description);
  }

  /* ─────────────────────────────────────────
     커튼
  ───────────────────────────────────────── */
  function initCurtain() {
    const el = $('#curtainOverlay');
    if (!el) return;
    if (CONFIG.useCurtain === false) { el.style.display = 'none'; return; }
    el.classList.add('curtain-active');
    setTimeout(() => { el.classList.add('hidden'); el.classList.remove('curtain-active'); }, 2800);
  }

  /* ─────────────────────────────────────────
     꽃잎
  ───────────────────────────────────────── */
  function initPetals() {
    const wrap = document.createElement('div');
    wrap.className = 'petals-container';
    document.body.appendChild(wrap);

    function drop() {
      const p = document.createElement('div');
      p.className = 'petal';
      const dur = Math.random() * 4 + 6, delay = Math.random() * .5;
      Object.assign(p.style, {
        left: Math.random() * 100 + 'vw',
        width: (Math.random() * 8 + 8) + 'px',
        height: (Math.random() * 8 + 8) + 'px',
        animationName: 'petalFall',
        animationDuration: dur + 's',
        animationDelay: delay + 's',
      });
      wrap.appendChild(p);
      setTimeout(() => p.remove(), (dur + delay) * 1000 + 100);
    }

    let n = 0;
    const iv = setInterval(() => {
      if (n++ >= 40) { clearInterval(iv); setTimeout(() => wrap.remove(), 12000); return; }
      drop(); if (Math.random() > .5) drop();
    }, 400);
  }

  /* ─────────────────────────────────────────
     히어로
  ───────────────────────────────────────── */
  function initHero() {
    const img = $('#heroImage');
    if (img) {
      img.src = 'images/hero/1.jpg';
      img.onerror = function () {
        const c = this.closest('.hero-image-container');
        if (c) c.style.display = 'none';
      };
    }

    const setText = (id, val) => { const el = $(`#${id}`); if (el) el.textContent = val; };
    setText('heroDate',  formatDateShort(CONFIG.wedding.date, CONFIG.wedding.time));
    setText('heroNames', `${CONFIG.groom.name} & ${CONFIG.bride.name}`);
    setText('heroVenue', CONFIG.wedding.venue);

    const g = CONFIG.groom, b = CONFIG.bride;
    const sp = (name, dead) => dead
      ? `<span class="parent-names deceased">${name}</span>`
      : `<span class="parent-names">${name}</span>`;

    const hp = $('#heroParents');
    if (hp) hp.innerHTML = `
      <p class="parent-line">${sp(g.father,g.fatherDeceased)} · ${sp(g.mother,g.motherDeceased)}의 아들 <span class="child-name">${g.name}</span></p>
      <p class="parent-line">${sp(b.father,b.fatherDeceased)} · ${sp(b.mother,b.motherDeceased)}의 딸 <span class="child-name">${b.name}</span></p>`;
  }

  /* ─────────────────────────────────────────
     카운트다운
  ───────────────────────────────────────── */
  function initCountdown() {
    const target = getWeddingDateTime();
    const ids    = ['days','hours','minutes','seconds'];
    const divs   = [86400000, 3600000, 60000, 1000];

    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) { ids.forEach(k => $(`#countdown-${k}`).textContent = '0'); return; }
      ids.forEach((k, i) => {
        const el = $(`#countdown-${k}`);
        if (el) el.textContent = Math.floor((diff % (divs[i] * (i === 0 ? 1e9 : 1))) / divs[i]);
      });
      /* 더 명확한 계산 */
      $(`#countdown-days`).textContent    = Math.floor(diff / 86400000);
      $(`#countdown-hours`).textContent   = Math.floor((diff % 86400000) / 3600000);
      $(`#countdown-minutes`).textContent = Math.floor((diff % 3600000)  / 60000);
      $(`#countdown-seconds`).textContent = Math.floor((diff % 60000)    / 1000);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ─────────────────────────────────────────
     캘린더 버튼 (구글 / ICS)
  ───────────────────────────────────────── */
  function initCalendar() {
    const dt  = getWeddingDateTime();
    const pad = n => String(n).padStart(2,'0');
    const fmt = d => `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
    const s   = fmt(dt);
    const e   = fmt(new Date(dt.getTime() + 7200000));

    const gBtn = $('#googleCalBtn');
    if (gBtn) gBtn.href =
      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent(CONFIG.groom.name + ' ♥ ' + CONFIG.bride.name + ' 결혼식')}` +
      `&dates=${s}/${e}` +
      `&location=${encodeURIComponent(CONFIG.wedding.venue + ' ' + CONFIG.wedding.address)}` +
      `&details=${encodeURIComponent('결혼식에 초대합니다.')}`;

    const iBtn = $('#icsDownloadBtn');
    if (iBtn) iBtn.addEventListener('click', () => {
      const ics = [
        'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Wedding//Invitation//KO',
        'BEGIN:VEVENT',
        `DTSTART:${s}`, `DTEND:${e}`,
        `SUMMARY:${CONFIG.groom.name} ♥ ${CONFIG.bride.name} 결혼식`,
        `LOCATION:${CONFIG.wedding.venue} ${CONFIG.wedding.address}`,
        'DESCRIPTION:결혼식에 초대합니다.',
        'END:VEVENT','END:VCALENDAR'
      ].join('\r\n');
      const url = URL.createObjectURL(new Blob([ics], { type:'text/calendar;charset=utf-8' }));
      Object.assign(document.createElement('a'), { href:url, download:'wedding.ics' }).click();
      URL.revokeObjectURL(url);
      showToast('캘린더 파일이 다운로드됩니다');
    });
  }

  /* ─────────────────────────────────────────
     달력 UI
  ───────────────────────────────────────── */
  function initWeddingCalendar() {
    const box = $('#weddingCalendar');
    if (!box) return;
    const [y, mo, wd] = CONFIG.wedding.date.split('-').map(Number);
    const mNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
    const dNames = ['일','월','화','수','목','금','토'];
    const first  = new Date(y, mo - 1, 1).getDay();
    const last   = new Date(y, mo, 0).getDate();

    let html = `<div class="cal-header">${y}년 ${mNames[mo-1]}</div><div class="cal-grid">`;
    dNames.forEach(d => { html += `<div class="cal-day-name">${d}</div>`; });
    for (let i = 0; i < first; i++) html += '<div class="cal-cell empty"></div>';
    for (let d = 1; d <= last; d++) {
      html += d === wd
        ? `<div class="cal-cell wedding-day">${d}<span class="cal-heart">♥</span></div>`
        : `<div class="cal-cell">${d}</div>`;
    }
    html += '</div>';
    box.innerHTML = html;
  }

  /* ─────────────────────────────────────────
     교통 탭
  ───────────────────────────────────────── */
  function initTransport() {
    const t = CONFIG.wedding.transport;
    if (!t) return;
    [['transport-subway', t.subway], ['transport-bus', t.bus], ['transport-car', t.car]].forEach(([id, val]) => {
      const el = $(`#${id}`);
      if (el && val) el.innerHTML = val.replace(/\n/g,'<br>');
    });
    $$('.transport-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.transport-tab').forEach(t => t.classList.remove('active'));
        $$('.transport-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        $(`#tab-${tab.dataset.tab}`)?.classList.add('active');
      });
    });
  }

  /* ─────────────────────────────────────────
     스토리
  ───────────────────────────────────────── */
  function initStory(imgs) {
    const setTxt = (id, v) => { const el = $(`#${id}`); if (el) el.textContent = v; };
    setTxt('storyTitle',   CONFIG.story.title);
    setTxt('storyContent', CONFIG.story.content);

    const top = $('#storyPhotos'), bot = $('#storyPhotosBottom');
    top?.querySelector('.loading-placeholder')?.remove();
    bot?.querySelector('.loading-placeholder')?.remove();
    if (!imgs.length) return;

    imgs.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'story-image-container ' + (i % 2 === 0 ? 'fade-in-left' : 'fade-in-right');
      div.innerHTML = `<img src="${src}" alt="스토리 사진 ${i+1}" loading="lazy">`;
      div.addEventListener('click', () => openViewer(imgs, i));
      (i === 0 ? top : bot)?.appendChild(div);
    });
    observeNew();
  }

  /* ─────────────────────────────────────────
     갤러리
  ───────────────────────────────────────── */
  function initGallery(imgs) {
    const grid = $('#galleryGrid');
    if (!grid) return;
    grid.querySelector('.loading-placeholder')?.remove();

    if (!imgs.length) { $('#gallerySection').style.display = 'none'; return; }

    imgs.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'gallery-item scale-in';
      div.style.setProperty('--delay', i);
      div.innerHTML = `<img src="${src}" alt="갤러리 사진 ${i+1}" loading="lazy">`;
      div.addEventListener('click', () => openViewer(imgs, i));
      grid.appendChild(div);
    });
    observeNew();
  }

  /* ─────────────────────────────────────────
     슬라이더 — getBoundingClientRect 로 정확한 이동 거리 계산
  ───────────────────────────────────────── */
  function initSlider(trackId, prevId, nextId, imgs) {
    const track = $(`#${trackId}`);
    if (!track || !imgs.length) {
      track?.closest('.section-slider')?.remove();
      return;
    }

    imgs.forEach((src, i) => {
      const item = document.createElement('div');
      item.className = 'slider-item';
      item.innerHTML = `<img src="${src}" alt="사진 ${i+1}" loading="lazy">`;
      item.addEventListener('click', () => openViewer(imgs, i));
      track.appendChild(item);
    });

    let cur = 0;
    const total = imgs.length;

    const itemW = () => {
      const el = track.querySelector('.slider-item');
      return el ? el.getBoundingClientRect().width + 12 : 0; /* 12 = gap */
    };

    const move = () => { track.style.transform = `translateX(${-cur * itemW()}px)`; };

    const updateBtns = () => {
      const p = $(`#${prevId}`), n = $(`#${nextId}`);
      if (p) p.style.opacity = cur === 0          ? '0.3' : '1';
      if (n) n.style.opacity = cur >= total - 1   ? '0.3' : '1';
    };

    $(`#${prevId}`)?.addEventListener('click', () => { if (cur > 0)          { cur--; move(); updateBtns(); } });
    $(`#${nextId}`)?.addEventListener('click', () => { if (cur < total - 1)  { cur++; move(); updateBtns(); } });
    updateBtns();

    let sx = 0;
    track.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive:true });
    track.addEventListener('touchend',   e => {
      const dx = sx - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 40) {
        if (dx > 0 && cur < total - 1) { cur++; move(); updateBtns(); }
        else if (dx < 0 && cur > 0)   { cur--; move(); updateBtns(); }
      }
    });

    window.addEventListener('resize', move);
  }

  /* ─────────────────────────────────────────
     사진 뷰어 — 닫을 때 원래 스크롤 위치 복원
  ───────────────────────────────────────── */
  let vImgs = [], vIdx = 0, savedY = 0;
  let touchSX = 0, singleTouch = false;

  function openViewer(imgs, idx) {
    savedY = window.scrollY || window.pageYOffset;   // ★ 위치 저장
    vImgs  = imgs; vIdx = idx;
    showVImg();
    document.body.style.top = `-${savedY}px`;        // ★ 점프 방지
    document.body.classList.add('no-scroll');
    $('#photoViewer').classList.add('active');
  }

  function closeViewer() {
    $('#photoViewer').classList.remove('active');
    document.body.classList.remove('no-scroll');
    document.body.style.top = '';
    window.scrollTo({ top: savedY, behavior: 'instant' }); // ★ 위치 복원
    const img = $('#viewerImage');
    if (img) { img.style.transform = ''; img.style.opacity = ''; }
  }

  function showVImg() {
    const img = $('#viewerImage'), ld = $('#viewerLoading');
    ld.classList.remove('hidden');
    img.style.opacity = '0';
    img.src = vImgs[vIdx];
    $('#currentIndex').textContent = vIdx + 1;
    $('#totalCount').textContent   = vImgs.length;
  }

  function navViewer(dir) {
    const img  = $('#viewerImage');
    const out  = dir === 'next' ? '-100%' : '100%';
    const in_  = dir === 'next' ?  '100%' : '-100%';
    img.style.transition = 'transform .28s ease, opacity .28s ease';
    img.style.transform  = `translateX(${out})`;
    img.style.opacity    = '0';
    setTimeout(() => {
      vIdx = dir === 'prev'
        ? (vIdx - 1 + vImgs.length) % vImgs.length
        : (vIdx + 1) % vImgs.length;
      img.style.transition = 'none';
      img.style.transform  = `translateX(${in_})`;
      img.style.opacity    = '0';
      showVImg();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        img.style.transition = 'transform .28s ease, opacity .28s ease';
        img.style.transform  = 'translateX(0)';
        img.style.opacity    = '1';
      }));
    }, 280);
  }

  function initPhotoViewer() {
    const viewer = $('#photoViewer');
    const img    = $('#viewerImage');
    const ld     = $('#viewerLoading');

    $('#viewerClose').addEventListener('click', closeViewer);
    $('#viewerPrev').addEventListener('click',  () => navViewer('prev'));
    $('#viewerNext').addEventListener('click',  () => navViewer('next'));

    img.addEventListener('load',  () => { ld.classList.add('hidden'); img.style.opacity = '1'; });
    img.addEventListener('error', () => { ld.classList.add('hidden'); img.style.opacity = '1'; });

    document.addEventListener('keydown', e => {
      if (!viewer.classList.contains('active')) return;
      if (e.key === 'Escape')     closeViewer();
      if (e.key === 'ArrowLeft')  navViewer('prev');
      if (e.key === 'ArrowRight') navViewer('next');
    });

    const content = $('#viewerContent');
    content.addEventListener('touchstart', e => {
      singleTouch = e.touches.length === 1;
      if (singleTouch) touchSX = e.touches[0].clientX;
    }, { passive:true });
    content.addEventListener('touchend', e => {
      if (!singleTouch) return;
      const dx = touchSX - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 50) navViewer(dx > 0 ? 'next' : 'prev');
    });
  }

  /* ─────────────────────────────────────────
     오시는 길 — 카카오맵 iframe 삽입
  ───────────────────────────────────────── */
  function initLocation() {
    const w = CONFIG.wedding;

    const setTxt = (id, v) => { const el = $(`#${id}`); if (el) el.textContent = v; };
    setTxt('locationVenue',   w.venue);
    setTxt('locationAddress', w.address);

    const kBtn = $('#kakaoMapBtn'), nBtn = $('#naverMapBtn');
    if (kBtn) kBtn.href = w.mapLinks?.kakao || '#';
    if (nBtn) nBtn.href = w.mapLinks?.naver || '#';

    $('#copyAddressBtn')?.addEventListener('click', () => copyText(w.address, '주소가 복사되었습니다'));

    /* ★ 카카오 place ID 추출 → iframe 삽입 */
    const kakaoUrl = w.mapLinks?.kakao || '';
    const match    = kakaoUrl.match(/\/(\d+)(?:[?#].*)?$/);
    const box      = $('#locationMapContainer');   /* index.html 에서 id 추가된 요소 */

    if (box && match) {
      const placeId = match[1];
      box.innerHTML  = `<iframe
        src="https://map.kakao.com/link/embed/place,${placeId}"
        width="100%" height="300"
        style="border:0;display:block;"
        allowfullscreen loading="lazy"
        title="오시는 길"></iframe>`;
    } else if (box) {
      /* fallback: 정적 이미지 */
      const img = $('#locationMapImg');
      if (img) {
        img.src = 'images/location/1.jpg';
        img.onerror = () => { box.style.display = 'none'; };
      }
    }
  }

  /* ─────────────────────────────────────────
     축의금
  ───────────────────────────────────────── */
  function renderAccounts(list, containerId) {
    const box = $(`#${containerId}`);
    if (!box) return;
    list.forEach(acc => {
      const str  = `${acc.bank} ${acc.number}`;
      const item = document.createElement('div');
      item.className = 'account-item';
      item.innerHTML = `
        <p class="account-role">${acc.role}</p>
        <p class="account-info">${str}</p>
        <button class="copy-btn" data-account="${str}">복사</button>`;
      box.appendChild(item);
    });
  }

  function initAccounts() {
    renderAccounts(CONFIG.accounts.groom, 'groomAccountList');
    renderAccounts(CONFIG.accounts.bride, 'brideAccountList');
    $$('.accordion-header').forEach(h => h.addEventListener('click', () => h.parentElement.classList.toggle('active')));
    document.addEventListener('click', e => {
      const btn = e.target.closest('.account-item .copy-btn');
      if (btn) copyText(btn.dataset.account, '계좌번호가 복사되었습니다');
    });
  }

  /* ─────────────────────────────────────────
     푸터
  ───────────────────────────────────────── */
  function initFooter() {
    const [y, m, d] = CONFIG.wedding.date.split('-');
    const el = $('#footerText');
    if (el) el.textContent = `${CONFIG.groom.name} & ${CONFIG.bride.name} — ${y}.${m}.${d}`;
  }

  /* ─────────────────────────────────────────
     로딩 플레이스홀더
  ───────────────────────────────────────── */
  function showLoading() {
    const html = '<div class="loading-placeholder"><span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span></div>';
    ['#storyPhotos','#galleryGrid'].forEach(sel => { const el = $(sel); if (el) el.innerHTML = html; });
  }

  /* ─────────────────────────────────────────
     스크롤 애니메이션
  ───────────────────────────────────────── */
  let observer;

  function initScrollAnim() {
    observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
      });
    }, { threshold: 0.1 });

    [
      ['.story-text',             'fade-in-right'],
      ['.gallery-title',          'fade-in'],
      ['.gallery-subtitle',       'fade-in'],
      ['.location-title',         'fade-in'],
      ['.location-info',          'fade-in'],
      ['.location-map-container', 'scale-in'],
      ['.account-title',          'fade-in'],
      ['.account-subtitle',       'fade-in'],
    ].forEach(([sel, cls]) => { const el = $(sel); if (el) el.classList.add(cls); });

    $$('.fade-in,.fade-in-left,.fade-in-right,.scale-in').forEach(el => observer.observe(el));
  }

  function observeNew() {
    if (!observer) return;
    $$('.fade-in,.fade-in-left,.fade-in-right,.scale-in').forEach(el => {
      if (!el.classList.contains('visible')) observer.observe(el);
    });
  }

  /* ─────────────────────────────────────────
     초기화
  ───────────────────────────────────────── */
  async function init() {
    setMetaTags();
    initCurtain();
    initHero();
    initCountdown();
    initCalendar();
    initWeddingCalendar();
    initTransport();
    showLoading();
    initPhotoViewer();
    initLocation();
    initAccounts();
    initFooter();
    initScrollAnim();
    initPetals();

    const [story, gallery, school, jeju] = await Promise.all([
      loadFolder('story'),
      loadFolder('gallery'),
      loadFolder('school'),
      loadFolder('jeju'),
    ]);

    initStory(story);
    initGallery(gallery);
    initSlider('schoolTrack','schoolPrev','schoolNext', school);
    initSlider('jejuTrack',  'jejuPrev',  'jejuNext',  jeju);
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
