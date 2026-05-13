/**
 * Original Warm Wedding Invitation
 * Korean Mobile 청첩장 - Script
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════
     Utility Helpers
     ═══════════════════════════════════════════ */

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function formatDateShort(dateStr, timeStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);
    const d = new Date(year, month - 1, day, hour, minute);
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dayName = days[d.getDay()];
    const period = hour < 12 ? 'AM' : 'PM';
    const h12 = hour % 12 || 12;
    const minuteStr = String(minute).padStart(2, '0');
    return `${year}. ${String(month).padStart(2,'0')}. ${String(day).padStart(2,'0')} ${dayName} ${period} ${h12}:${minuteStr}`;
  }

  /* ★ 수정: 타임존 문자열 파싱 대신 직접 Date 생성 → 모든 브라우저에서 안정 동작 */
  function getWeddingDateTime() {
    const [year, month, day] = CONFIG.wedding.date.split('-').map(Number);
    const [hour, minute] = CONFIG.wedding.time.split(':').map(Number);
    // 한국시간(UTC+9) 기준으로 UTC 변환
    return new Date(Date.UTC(year, month - 1, day, hour - 9, minute));
  }

  /* ═══════════════════════════════════════════
     Image Auto-Detection
     ★ 수정: fetch HEAD 방식으로 변경 → GitHub Pages에서 안정적으로 동작
     ═══════════════════════════════════════════ */

  function checkImageExists(path) {
    return new Promise(resolve => {
      const img = new Image();
      // 캐시 무효화 방지 + 빠른 실패를 위해 타임아웃 설정
      const timer = setTimeout(() => {
        img.src = ''; // 로딩 취소
        resolve(false);
      }, 5000);

      img.onload = function () {
        clearTimeout(timer);
        // naturalWidth가 0이면 실제 이미지 아님 (빈 응답 등)
        resolve(this.naturalWidth > 0);
      };
      img.onerror = function () {
        clearTimeout(timer);
        resolve(false);
      };
      // 캐시 우회 없이 그대로 로드 (GitHub Pages 정적 파일은 정상 응답)
      img.src = path;
    });
  }

  async function loadImagesFromFolder(folder, maxAttempts = 50) {
    const images = [];
    let consecutiveFails = 0;

    for (let i = 1; i <= maxAttempts; i++) {
      if (consecutiveFails >= 3) break;

      const path = `images/${folder}/${i}.jpg`;
      const exists = await checkImageExists(path);

      if (exists) {
        images.push(path);
        consecutiveFails = 0;
      } else {
        // .jpeg도 시도
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
  }

  /* ═══════════════════════════════════════════
     Toast
     ═══════════════════════════════════════════ */

  let toastTimer = null;

  function showToast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2500);
  }

  /* ═══════════════════════════════════════════
     Clipboard
     ═══════════════════════════════════════════ */

  async function copyToClipboard(text, successMsg) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      showToast(successMsg || '복사되었습니다');
    } catch {
      showToast('복사에 실패했습니다');
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
      if (el) el.setAttribute('content', content);
    };
    setMeta('property', 'og:title', m.title);
    setMeta('property', 'og:description', m.description);
    setMeta('property', 'og:image', 'images/og/1.jpg');
    setMeta('name', 'twitter:title', m.title);
    setMeta('name', 'twitter:description', m.description);
    setMeta('name', 'twitter:image', 'images/og/1.jpg');
    setMeta('name', 'description', m.description);
  }

  /* ═══════════════════════════════════════════
     Curtain
     ★ 수정: useCurtain=false면 처음부터 완전히 숨김
             useCurtain=true일 때만 curtain-active 클래스 추가 후 애니메이션
     ═══════════════════════════════════════════ */

  function initCurtain() {
    const curtain = $('#curtainOverlay');
    if (!curtain) return;

    if (CONFIG.useCurtain === false) {
      // CSS에서 이미 display:none이므로 아무것도 안 해도 됨
      // 혹시 모를 상황 대비해 명시적으로도 설정
      curtain.style.display = 'none';
      return;
    }

    // 커튼 사용 시: curtain-active 클래스 추가로 애니메이션 시작
    curtain.classList.add('curtain-active');

    setTimeout(() => {
      curtain.classList.add('hidden');
      curtain.classList.remove('curtain-active');
    }, 2800); // 애니메이션(0.8s delay + 1.8s duration) 완료 후 숨김
  }

  /* ═══════════════════════════════════════════
     Petal Animation
     ═══════════════════════════════════════════ */

  function initPetals() {
    function createPetalsContainer() {
      const container = document.createElement('div');
      container.className = 'petals-container';
      document.body.appendChild(container);
      return container;
    }

    function createPetal(container) {
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

      setTimeout(() => {
        petal.remove();
      }, (duration + delay) * 1000 + 100);
    }

    const container = createPetalsContainer();
    let petalCount = 0;
    const maxPetals = 40;

    const interval = setInterval(() => {
      if (petalCount >= maxPetals) {
        clearInterval(interval);
        setTimeout(() => {
          container.remove();
        }, 12000);
        return;
      }
      createPetal(container);
      if (Math.random() > 0.5) createPetal(container);
      petalCount++;
    }, 400);
  }

  /* ═══════════════════════════════════════════
     Hero Section
     ═══════════════════════════════════════════ */

  function initHero() {
    const heroImg = $('#heroImage');
    if (heroImg) {
      heroImg.src = 'images/hero/1.jpg';
      heroImg.onerror = function() {
        // hero 이미지 없으면 컨테이너 높이 최소화
        this.closest('.hero-image-container').style.minHeight = '0';
        this.style.display = 'none';
      };
    }

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

    const parentsHTML = `
      <p class="parent-line">${parentSpan(g.father, g.fatherDeceased)} · ${parentSpan(g.mother, g.motherDeceased)}의 아들 <span class="child-name">${g.name}</span></p>
      <p class="parent-line">${parentSpan(b.father, b.fatherDeceased)} · ${parentSpan(b.mother, b.motherDeceased)}의 딸 <span class="child-name">${b.name}</span></p>
    `;
    $('#heroParents').innerHTML = parentsHTML;
  }

  /* ═══════════════════════════════════════════
     Countdown
     ═══════════════════════════════════════════ */

  function initCountdown() {
    const target = getWeddingDateTime();

    function update() {
      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        $('#countdown-days').textContent = '0';
        $('#countdown-hours').textContent = '0';
        $('#countdown-minutes').textContent = '0';
        $('#countdown-seconds').textContent = '0';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      $('#countdown-days').textContent = days;
      $('#countdown-hours').textContent = hours;
      $('#countdown-minutes').textContent = minutes;
      $('#countdown-seconds').textContent = seconds;
    }

    update();
    setInterval(update, 1000);
  }

  /* ═══════════════════════════════════════════
     Calendar (Google Cal & ICS)
     ═══════════════════════════════════════════ */

  function initCalendar() {
    const dt = getWeddingDateTime();
    const pad = n => String(n).padStart(2, '0');
    const fmt = d => `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

    const startDate = fmt(dt);
    const endDt = new Date(dt.getTime() + 2 * 60 * 60 * 1000);
    const endDate = fmt(endDt);

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(CONFIG.groom.name + ' ♥ ' + CONFIG.bride.name + ' 결혼식')}&dates=${startDate}/${endDate}&location=${encodeURIComponent(CONFIG.wedding.venue + ' ' + CONFIG.wedding.address)}&details=${encodeURIComponent('결혼식에 초대합니다.')}`;
    const googleBtn = $('#googleCalBtn');
    if (googleBtn) googleBtn.href = gcalUrl;

    const icsBtn = $('#icsDownloadBtn');
    if (icsBtn) {
      icsBtn.addEventListener('click', () => {
        const icsContent = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//Wedding//Invitation//KO',
          'BEGIN:VEVENT',
          `DTSTART:${startDate}`,
          `DTEND:${endDate}`,
          `SUMMARY:${CONFIG.groom.name} ♥ ${CONFIG.bride.name} 결혼식`,
          `LOCATION:${CONFIG.wedding.venue} ${CONFIG.wedding.address}`,
          'DESCRIPTION:결혼식에 초대합니다.',
          'END:VEVENT',
          'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wedding.ics';
        a.click();
        URL.revokeObjectURL(url);
        showToast('캘린더 파일이 다운로드됩니다');
      });
    }
  }

  /* ═══════════════════════════════════════════
     Wedding Calendar (달력 UI)
     ═══════════════════════════════════════════ */

  function initWeddingCalendar() {
    const container = $('#weddingCalendar');
    if (!container) return;

    const [year, month, weddingDay] = CONFIG.wedding.date.split('-').map(Number);

    const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
    const dayNames = ['일','월','화','수','목','금','토'];

    const firstDay = new Date(year, month - 1, 1).getDay();
    const lastDate = new Date(year, month, 0).getDate();

    let html = `<div class="cal-header">${year}년 ${monthNames[month - 1]}</div>`;
    html += '<div class="cal-grid">';
    dayNames.forEach(d => {
      html += `<div class="cal-day-name">${d}</div>`;
    });

    for (let i = 0; i < firstDay; i++) {
      html += '<div class="cal-cell empty"></div>';
    }
    for (let d = 1; d <= lastDate; d++) {
      const isWedding = d === weddingDay;
      html += `<div class="cal-cell${isWedding ? ' wedding-day' : ''}">${d}${isWedding ? '<span class="cal-heart">♥</span>' : ''}</div>`;
    }

    html += '</div>';
    container.innerHTML = html;
  }

  /* ═══════════════════════════════════════════
     Transport Tabs
     ═══════════════════════════════════════════ */

  function initTransport() {
    const t = CONFIG.wedding.transport;
    if (!t) return;

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
  }

  /* ═══════════════════════════════════════════
     Story Section
     ═══════════════════════════════════════════ */

  function initStory(storyImages) {
    $('#storyTitle').textContent = CONFIG.story.title;
    $('#storyContent').textContent = CONFIG.story.content;

    const topContainer = $('#storyPhotos');
    const bottomContainer = $('#storyPhotosBottom');

    const placeholder = topContainer.querySelector('.loading-placeholder');
    if (placeholder) placeholder.remove();
    const placeholder2 = bottomContainer.querySelector('.loading-placeholder');
    if (placeholder2) placeholder2.remove();

    if (storyImages.length === 0) return;

    storyImages.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'story-image-container fade-in-left';
      div.innerHTML = `<img src="${src}" alt="스토리 사진 ${i + 1}" loading="lazy">`;
      div.addEventListener('click', () => openViewer(storyImages, i));

      if (i === 0) {
        topContainer.appendChild(div);
      } else {
        div.className = 'story-image-container ' + (i % 2 === 0 ? 'fade-in-left' : 'fade-in-right');
        bottomContainer.appendChild(div);
      }
    });

    observeNewElements();
  }

  /* ═══════════════════════════════════════════
     Gallery Section
     ═══════════════════════════════════════════ */

  let galleryImagesList = [];

  function initGallery(galleryImages) {
    galleryImagesList = galleryImages;
    const grid = $('#galleryGrid');

    const placeholder = grid.querySelector('.loading-placeholder');
    if (placeholder) placeholder.remove();

    if (galleryImages.length === 0) {
      const section = $('#gallerySection');
      if (section) section.style.display = 'none';
      return;
    }

    galleryImages.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'gallery-item scale-in';
      div.style.setProperty('--delay', i);
      div.setAttribute('data-index', i);
      div.innerHTML = `<img src="${src}" alt="갤러리 사진 ${i + 1}" loading="lazy">`;
      div.addEventListener('click', () => openViewer(galleryImages, i));
      grid.appendChild(div);
    });

    $('#totalCount').textContent = galleryImages.length;
    observeNewElements();
  }

  /* ═══════════════════════════════════════════
     Slider (학교 / 제주)
     ═══════════════════════════════════════════ */

  function initSlider(trackId, prevId, nextId, images) {
    const track = $(`#${trackId}`);
    if (!track || images.length === 0) {
      const section = track ? track.closest('.section-slider') : null;
      if (section) section.style.display = 'none';
      return;
    }

    images.forEach((src, i) => {
      const item = document.createElement('div');
      item.className = 'slider-item';
      item.innerHTML = `<img src="${src}" alt="사진 ${i + 1}" loading="lazy">`;
      item.addEventListener('click', () => openViewer(images, i));
      track.appendChild(item);
    });

    const itemWidth = () => {
      const first = track.querySelector('.slider-item');
      return first ? first.offsetWidth + 12 : 0;
    };

    let current = 0;
    const max = images.length - 1;

    const move = () => {
      track.style.transform = `translateX(${-current * itemWidth()}px)`;
    };

    $(`#${prevId}`).addEventListener('click', () => {
      if (current > 0) { current--; move(); }
    });

    $(`#${nextId}`).addEventListener('click', () => {
      if (current < max) { current++; move(); }
    });

    let startX = 0;
    track.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        if (diff > 0 && current < max) current++;
        else if (diff < 0 && current > 0) current--;
        move();
      }
    });
  }

  /* ═══════════════════════════════════════════
     Photo Viewer
     ═══════════════════════════════════════════ */

  let viewerImages = [];
  let viewerIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;

  function openViewer(images, index) {
    viewerImages = images;
    viewerIndex = index;
    showViewerImage();
    $('#photoViewer').classList.add('active');
    document.body.classList.add('no-scroll');
  }

  function closeViewer() {
    $('#photoViewer').classList.remove('active');
    document.body.classList.remove('no-scroll');
    const img = $('#viewerImage');
    if (img) img.style.transform = '';
  }

  function showViewerImage() {
    const img = $('#viewerImage');
    const loading = $('#viewerLoading');
    loading.classList.remove('hidden');
    img.style.opacity = '0';
    img.src = viewerImages[viewerIndex];
    $('#currentIndex').textContent = viewerIndex + 1;
    $('#totalCount').textContent = viewerImages.length;
  }

  function navigateViewer(direction) {
    const img = $('#viewerImage');
    const slideOut = direction === 'next' ? '-100%' : '100%';
    const slideIn  = direction === 'next' ?  '100%' : '-100%';

    img.style.transition = 'transform 0.28s ease, opacity 0.28s ease';
    img.style.transform  = `translateX(${slideOut})`;
    img.style.opacity    = '0';

    setTimeout(() => {
      if (direction === 'prev') {
        viewerIndex = (viewerIndex - 1 + viewerImages.length) % viewerImages.length;
      } else {
        viewerIndex = (viewerIndex + 1) % viewerImages.length;
      }

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
  }

  function initPhotoViewer() {
    const viewer = $('#photoViewer');
    const viewerImage = $('#viewerImage');
    const viewerLoading = $('#viewerLoading');

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
      if (e.touches.length === 1) {
        isSingleTouch = true;
        touchStartX = e.touches[0].clientX;
      } else {
        isSingleTouch = false;
      }
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
  }

  /* ═══════════════════════════════════════════
     Location Section
     ═══════════════════════════════════════════ */

  function initLocation() {
    const w = CONFIG.wedding;
    $('#locationVenue').textContent = w.venue;
    $('#locationAddress').textContent = w.address;

    const mapImg = $('#locationMapImg');
    if (mapImg) {
      mapImg.src = 'images/location/1.jpg';
      mapImg.onerror = function() {
        this.closest('.location-map-container').style.display = 'none';
      };
    }

    $('#kakaoMapBtn').href = w.mapLinks.kakao || '#';
    $('#naverMapBtn').href = w.mapLinks.naver || '#';

    $('#copyAddressBtn').addEventListener('click', () => {
      copyToClipboard(w.address, '주소가 복사되었습니다');
    });
  }

  /* ═══════════════════════════════════════════
     Account Section
     ═══════════════════════════════════════════ */

  function renderAccounts(accounts, containerId) {
    const container = $(`#${containerId}`);
    accounts.forEach((acc) => {
      const item = document.createElement('div');
      item.className = 'account-item';
      const accountStr = `${acc.bank} ${acc.number}`;
      item.innerHTML = `
        <p class="account-role">${acc.role}</p>
        <p class="account-info">${accountStr}</p>
        <button class="copy-btn" data-account="${accountStr}">복사</button>
      `;
      container.appendChild(item);
    });
  }

  function initAccounts() {
    renderAccounts(CONFIG.accounts.groom, 'groomAccountList');
    renderAccounts(CONFIG.accounts.bride, 'brideAccountList');

    $$('.accordion-header').forEach((header) => {
      header.addEventListener('click', () => {
        const accordion = header.parentElement;
        accordion.classList.toggle('active');
      });
    });

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.account-item .copy-btn');
      if (!btn) return;
      const text = btn.dataset.account;
      copyToClipboard(text, '계좌번호가 복사되었습니다');
    });
  }

  /* ═══════════════════════════════════════════
     Footer
     ═══════════════════════════════════════════ */

  function initFooter() {
    const [year, month, day] = CONFIG.wedding.date.split('-');
    $('#footerText').textContent = `${CONFIG.groom.name} & ${CONFIG.bride.name} — ${year}.${month}.${day}`;
  }

  /* ═══════════════════════════════════════════
     Loading Placeholders
     ═══════════════════════════════════════════ */

  function showLoadingPlaceholders() {
    const placeholderHTML = '<div class="loading-placeholder"><span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span></div>';
    const storyPhotos = $('#storyPhotos');
    const galleryGrid = $('#galleryGrid');
    if (storyPhotos) storyPhotos.innerHTML = placeholderHTML;
    if (galleryGrid) galleryGrid.innerHTML = placeholderHTML;
  }

  /* ═══════════════════════════════════════════
     Scroll Animations
     ═══════════════════════════════════════════ */

  let scrollObserver = null;

  function initScrollAnimations() {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          scrollObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const storyText = $('.story-text');
    const galleryTitle = $('.gallery-title');
    const gallerySubtitle = $('.gallery-subtitle');
    const locationTitle = $('.location-title');
    const locationInfo = $('.location-info');
    const locationMap = $('.location-map-container');
    const accountTitle = $('.account-title');
    const accountSubtitle = $('.account-subtitle');

    if (storyText) storyText.classList.add('fade-in-right');
    if (galleryTitle) galleryTitle.classList.add('fade-in');
    if (gallerySubtitle) gallerySubtitle.classList.add('fade-in');
    if (locationTitle) locationTitle.classList.add('fade-in');
    if (locationInfo) locationInfo.classList.add('fade-in');
    if (locationMap) locationMap.classList.add('scale-in');
    if (accountTitle) accountTitle.classList.add('fade-in');
    if (accountSubtitle) accountSubtitle.classList.add('fade-in');

    $$('.fade-in, .fade-in-left, .fade-in-right, .scale-in').forEach(el => {
      scrollObserver.observe(el);
    });
  }

  function observeNewElements() {
    if (!scrollObserver) return;
    $$('.fade-in, .fade-in-left, .fade-in-right, .scale-in').forEach(el => {
      if (!el.classList.contains('visible')) {
        scrollObserver.observe(el);
      }
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
