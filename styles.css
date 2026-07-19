(function () {
  'use strict';

  var $ = function(id) { return document.getElementById(id); };
  var $$ = function(sel) { return Array.from(document.querySelectorAll(sel)); };

  /* ── Config 헬퍼 ── */
  function getWeddingDateTime() {
    return new Date(CONFIG.wedding.date + 'T' + CONFIG.wedding.time + ':00+09:00');
  }

  /* ── 토스트 ── */
  var toastTimer = null;
  function showToast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function() { el.classList.remove('show'); }, 2500);
  }

  /* ── 클립보드 ── */
  function copyText(text, msg) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function() { showToast(msg); });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
        document.body.appendChild(ta); ta.focus(); ta.select();
        document.execCommand('copy'); ta.remove(); showToast(msg);
      }
    } catch(e) { showToast('복사에 실패했습니다'); }
  }

  /* ── 이미지 폴더 감지 ── */
  function loadFolder(folder, max) {
    max = max || 50;
    return new Promise(function(resolve) {
      var imgs = [], cur = 1, fails = 0;
      function next() {
        if (cur > max || fails >= 3) { resolve(imgs); return; }
        var im = new Image();
        var path = 'images/' + folder + '/' + cur + '.jpg';
        im.onload = function() { imgs.push(path); fails = 0; cur++; next(); };
        im.onerror = function() { fails++; cur++; next(); };
        im.src = path;
      }
      next();
    });
  }

  /* ── 커버 ── */
  function initCover() {
    var el = $('coverNames');
    if (el) el.textContent = CONFIG.groom.name + ' · ' + CONFIG.bride.name;
  }

  /* ── 초대 문구 ── */
  function initInvite() {
    var g = CONFIG.groom, b = CONFIG.bride;
    var dateStr = formatDateKo();
    var venueStr = CONFIG.wedding.venue;

    var textEl = $('inviteText');
    if (textEl) textEl.innerHTML =
      '<p style="margin-bottom:6px">' + dateStr + '</p>' +
      '<p style="margin-bottom:20px">' + venueStr + '</p>' +
      '<p style="margin-bottom:4px"><strong>━━━</strong></p>' +
      '<br>' + CONFIG.story.content.replace(/\n/g, '<br>');

    var namesEl = $('inviteNames');
    if (namesEl) {
      namesEl.textContent = '신랑 ' + g.father + ' · ' + g.mother + '의 아들 ' + g.name +
        '  신부 ' + b.father + ' · ' + b.mother + '의 딸 ' + b.name;
    }
  }

  function formatDateKo() {
    var dt = getWeddingDateTime();
    var year = dt.getFullYear();
    var month = dt.getMonth() + 1;
    var day = dt.getDate();
    var dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    var dayName = dayNames[dt.getDay()];
    var h = dt.getHours();
    var ampm = h < 12 ? '오전' : '오후';
    var h12 = h % 12 || 12;
    return year + '년 ' + month + '월 ' + day + '일 ' + dayName + '요일 ' + ampm + ' ' + h12 + '시';
  }

  function formatDateEn() {
    var dt = getWeddingDateTime();
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var h = dt.getHours();
    var ampm = h < 12 ? 'AM' : 'PM';
    var h12 = h % 12 || 12;
    return days[dt.getDay()] + ', ' + months[dt.getMonth()] + ' ' + dt.getDate() + ', ' + dt.getFullYear() + ' | ' + ampm + ' ' + h12 + ':' + String(dt.getMinutes()).padStart(2,'0');
  }

  /* ── 달력 ── */
  function initCalendar() {
    var koEl = $('calDateKo'), enEl = $('calDateEn');
    if (koEl) koEl.textContent = formatDateKo();
    if (enEl) enEl.textContent = formatDateEn();

    var dt = getWeddingDateTime();
    var year = dt.getFullYear(), month = dt.getMonth(), wDay = dt.getDate();
    var firstDay = new Date(year, month, 1).getDay();
    var lastDate = new Date(year, month + 1, 0).getDate();
    var dayNames = ['일','월','화','수','목','금','토'];

    var grid = $('calGrid');
    if (!grid) return;
    var html = '<div class="cal-grid">';
    dayNames.forEach(function(d, i) {
      html += '<div class="cal-day-name' + (i === 0 ? ' sun' : '') + '">' + d + '</div>';
    });
    for (var i = 0; i < firstDay; i++) html += '<div class="cal-cell empty"></div>';
    for (var d = 1; d <= lastDate; d++) {
      var col = (firstDay + d - 1) % 7;
      var cls = 'cal-cell';
      if (col === 0) cls += ' sun';
      if (col === 6) cls += ' sat';
      if (d === wDay) cls += ' today';
      html += '<div class="' + cls + '">' + d + '</div>';
    }
    html += '</div>';
    grid.innerHTML = html;

    /* D-DAY */
    var ddEl = $('ddayText');
    if (ddEl) {
      var now = new Date();
      var diff = Math.ceil((dt - now) / (1000 * 60 * 60 * 24));
      if (diff > 0) {
        ddEl.innerHTML = CONFIG.groom.name + ' <span class="dday-heart"></span> ' + CONFIG.bride.name +
          ' 결혼식이 <strong style="color:#7c7c7c;margin:0 4px">' + diff + '일</strong> 남았습니다';
      } else if (diff === 0) {
        ddEl.textContent = '오늘이 결혼식 날입니다 🎉';
      } else {
        ddEl.textContent = CONFIG.groom.name + ' & ' + CONFIG.bride.name + ' 행복한 결혼을 축하드립니다 💕';
      }
    }

    /* 구글 캘린더 */
    var startStr = dt.toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
    var endDt = new Date(dt.getTime() + 2 * 60 * 60 * 1000);
    var endStr = endDt.toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
    var gcalBtn = $('googleCalBtn');
    if (gcalBtn) {
      gcalBtn.href = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' +
        encodeURIComponent(CONFIG.groom.name + ' ♥ ' + CONFIG.bride.name + ' 결혼식') +
        '&dates=' + startStr + '/' + endStr +
        '&location=' + encodeURIComponent(CONFIG.wedding.venue + ' ' + CONFIG.wedding.address) +
        '&details=' + encodeURIComponent('결혼식에 초대합니다.');
    }

    /* ICS */
    var icsBtn = $('icsDownloadBtn');
    if (icsBtn) {
      icsBtn.addEventListener('click', function() {
        var ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Wedding//KO','BEGIN:VEVENT',
          'DTSTART:' + startStr,'DTEND:' + endStr,
          'SUMMARY:' + CONFIG.groom.name + ' ♥ ' + CONFIG.bride.name + ' 결혼식',
          'LOCATION:' + CONFIG.wedding.venue + ' ' + CONFIG.wedding.address,
          'DESCRIPTION:결혼식에 초대합니다.','END:VEVENT','END:VCALENDAR'].join('\r\n');
        var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = 'wedding.ics'; a.click();
        URL.revokeObjectURL(url);
        showToast('캘린더 파일이 다운로드됩니다');
      });
    }
  }

  /* ── 혼주 ── */
  function initHost() {
    var g = CONFIG.groom, b = CONFIG.bride;
    function makeRow(father, mother, fDead, mDead, relation, childName) {
      return '<div class="host-parents">' +
        (fDead ? '<span style="font-size:0.7em;opacity:0.5">故</span> ' : '') + father +
        ' <span style="opacity:0.4">·</span> ' +
        (mDead ? '<span style="font-size:0.7em;opacity:0.5">故</span> ' : '') + mother +
        '</div>' +
        '<span class="host-of">의</span>' +
        '<div class="host-relation">' + relation + '</div>' +
        '<div class="host-name">' + childName + '</div>';
    }
    var groomEl = $('hostGroom');
    if (groomEl) groomEl.innerHTML = makeRow(g.father, g.mother, g.fatherDeceased, g.motherDeceased, '장남', g.name);
    var brideEl = $('hostBride');
    if (brideEl) brideEl.innerHTML = makeRow(b.father, b.mother, b.fatherDeceased, b.motherDeceased, '장녀', b.name);
  }

  /* ── 갤러리 슬라이더 공통 ── */
  function makeSlider(trackId, dotsId, images, openAll) {
    var track = $(trackId), dotsWrap = $(dotsId);
    if (!track || images.length === 0) return;

    images.forEach(function(src, i) {
      var slide = document.createElement('div');
      slide.className = 'gallery-slide';
      var img = document.createElement('img');
      img.src = src;
      img.alt = '사진 ' + (i + 1);
      img.loading = i < 3 ? 'eager' : 'lazy';
      img.addEventListener('click', function() { openViewer(openAll || images, i); });
      slide.appendChild(img);
      track.appendChild(slide);
    });

    /* 도트 */
    var maxDots = Math.min(images.length, 10);
    for (var d = 0; d < maxDots; d++) {
      var dot = document.createElement('span');
      dot.className = 'gallery-dot' + (d === 0 ? ' active' : '');
      dotsWrap.appendChild(dot);
    }

    var current = 0;
    function move(idx) {
      current = idx;
      track.style.transform = 'translate3d(' + (-100 * idx) + '%, 0, 0)';
      var dots = dotsWrap.querySelectorAll('.gallery-dot');
      dots.forEach(function(dot, i) { dot.classList.toggle('active', i === idx); });
    }

    /* 터치 스와이프 */
    var startX = 0;
    track.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function(e) {
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        if (diff > 0 && current < images.length - 1) move(current + 1);
        else if (diff < 0 && current > 0) move(current - 1);
      }
    });
  }

  /* ── 사진 뷰어 ── */
  var viewerImages = [], viewerIndex = 0;
  var touchStartX = 0;

  function openViewer(images, index) {
    viewerImages = images;
    viewerIndex = index;
    showViewerImage();
    $('photoViewer').classList.add('active');
    document.body.classList.add('no-scroll');
  }

  function closeViewer() {
    $('photoViewer').classList.remove('active');
    document.body.classList.remove('no-scroll');
    var img = $('viewerImage');
    if (img) { img.style.transform = ''; img.style.opacity = ''; }
  }

  function showViewerImage() {
    var img = $('viewerImage'), loading = $('viewerLoading');
    loading.classList.remove('hidden');
    img.style.opacity = '0';
    img.src = viewerImages[viewerIndex];
    $('currentIndex').textContent = viewerIndex + 1;
    $('totalCount').textContent = viewerImages.length;
  }

  function navigateViewer(dir) {
    var img = $('viewerImage');
    var out = dir === 'next' ? '-100%' : '100%';
    var ins = dir === 'next' ? '100%' : '-100%';
    img.style.transition = 'transform 0.28s ease, opacity 0.28s ease';
    img.style.transform = 'translateX(' + out + ')';
    img.style.opacity = '0';
    setTimeout(function() {
      viewerIndex = dir === 'next'
        ? (viewerIndex + 1) % viewerImages.length
        : (viewerIndex - 1 + viewerImages.length) % viewerImages.length;
      img.style.transition = 'none';
      img.style.transform = 'translateX(' + ins + ')';
      img.style.opacity = '0';
      showViewerImage();
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          img.style.transition = 'transform 0.28s ease, opacity 0.28s ease';
          img.style.transform = 'translateX(0)';
          img.style.opacity = '1';
        });
      });
    }, 280);
  }

  function initViewer() {
    $('viewerClose').addEventListener('click', closeViewer);
    $('viewerPrev').addEventListener('click', function() { navigateViewer('prev'); });
    $('viewerNext').addEventListener('click', function() { navigateViewer('next'); });
    $('viewerImage').addEventListener('load', function() {
      $('viewerLoading').classList.add('hidden');
      $('viewerImage').style.opacity = '1';
    });
    $('viewerImage').addEventListener('error', function() {
      $('viewerLoading').classList.add('hidden');
      $('viewerImage').style.opacity = '1';
    });
    document.addEventListener('keydown', function(e) {
      if (!$('photoViewer').classList.contains('active')) return;
      if (e.key === 'Escape') closeViewer();
      if (e.key === 'ArrowLeft') navigateViewer('prev');
      if (e.key === 'ArrowRight') navigateViewer('next');
    });
    var content = $('viewerContent');
    content.addEventListener('touchstart', function(e) {
      if (e.touches.length === 1) touchStartX = e.touches[0].clientX;
    }, { passive: true });
    content.addEventListener('touchend', function(e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) navigateViewer('next');
        else navigateViewer('prev');
      }
    });
  }

  /* ── 오시는 길 ── */
  function initLocation() {
    var w = CONFIG.wedding;
    var venueEl = $('locVenue');
    if (venueEl) venueEl.textContent = w.venue;
    var addrEl = $('locAddr');
    if (addrEl) addrEl.textContent = w.address;
    var addrBtn = $('locAddrBtn');
    if (addrBtn) addrBtn.addEventListener('click', function() { copyText(w.address, '주소가 복사되었습니다'); });
    var kakao = $('kakaoMapBtn');
    if (kakao) kakao.href = w.mapLinks.kakao || '#';
    var naver = $('naverMapBtn');
    if (naver) naver.href = w.mapLinks.naver || '#';

    /* 교통 정보 */
    var t = w.transport;
    var tw = $('transportWrap');
    if (t && tw) {
      var items = [
        { icon: '🚇', label: '지하철', content: t.subway },
        { icon: '🚌', label: '버스', content: t.bus },
        { icon: '🚗', label: '자가용', content: t.car }
      ];
      items.forEach(function(item) {
        if (!item.content) return;
        var div = document.createElement('div');
        div.className = 'transport-item';
        div.innerHTML = '<div class="transport-label">' + item.icon + ' ' + item.label + '</div>' +
          '<div class="transport-content">' + item.content.replace(/\n/g, '<br>') + '</div>';
        tw.appendChild(div);
      });
    }
  }

  /* ── 계좌 ── */
  function makeAccCard(acc) {
    var accountStr = acc.bank + ' ' + acc.number;
    var div = document.createElement('div');
    div.className = 'acc-card';
    div.innerHTML =
      '<div class="acc-card-row">' +
        '<span class="acc-card-name">' + acc.role + '</span>' +
        '<div style="text-align:right"><div class="acc-card-bank">' + acc.bank + '</div><div class="acc-card-num">' + acc.number + '</div></div>' +
      '</div>' +
      '<button class="acc-copy-btn" data-account="' + accountStr + '">' +
        '<span>계좌번호 복사하기</span>' +
        '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M16.4445 7.89H9.449C8.591 7.89 7.895 8.587 7.895 9.445V16.44C7.895 17.299 8.591 17.995 9.449 17.995H16.44C17.299 17.995 17.995 17.299 17.995 16.44V9.445C17.995 8.587 17.299 7.89 16.44 7.89H16.4445ZM4.332 12.104H3.555C3.142 12.104 2.747 11.941 2.455 11.649C2.164 11.358 2 10.962 2 10.55V3.555C2 3.142 2.164 2.747 2.455 2.455C2.747 2.164 3.142 2 3.555 2H10.55C10.962 2 11.358 2.164 11.649 2.455C11.941 2.747 12.104 3.142 12.104 3.555V4.332" stroke="white" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>';
    return div;
  }

  function initAccount() {
    var groomPanel = $('panelGroom'), bridePanel = $('panelBride');
    if (groomPanel) CONFIG.accounts.groom.forEach(function(acc) { groomPanel.appendChild(makeAccCard(acc)); });
    if (bridePanel) CONFIG.accounts.bride.forEach(function(acc) { bridePanel.appendChild(makeAccCard(acc)); });

    /* 탭 전환 */
    $$('.acc-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        $$('.acc-tab').forEach(function(t) { t.classList.remove('active'); });
        $$('.acc-panel').forEach(function(p) { p.classList.remove('active'); });
        tab.classList.add('active');
        var panel = tab.dataset.tab === 'groom' ? $('panelGroom') : $('panelBride');
        if (panel) panel.classList.add('active');
      });
    });

    /* 복사 버튼 위임 */
    document.addEventListener('click', function(e) {
      var btn = e.target.closest('.acc-copy-btn');
      if (!btn) return;
      copyText(btn.dataset.account, '계좌번호가 복사되었습니다');
    });
  }

  /* ── 푸터 ── */
  function initFooter() {
    var dt = getWeddingDateTime();
    var y = dt.getFullYear(), m = String(dt.getMonth()+1).padStart(2,'0'), d = String(dt.getDate()).padStart(2,'0');
    var el = $('footerText');
    if (el) el.textContent = CONFIG.groom.name + ' & ' + CONFIG.bride.name + ' — ' + y + '.' + m + '.' + d;
  }

  /* ── 스크롤 애니메이션 ── */
  function initScrollAnim() {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    function observeAll() {
      $$('.gsap-item').forEach(function(el) {
        if (!el.classList.contains('visible')) observer.observe(el);
      });
    }
    observeAll();
    return observeAll;
  }

  /* ── 메인 초기화 ── */
  async function init() {
    initCover();
    initInvite();
    initCalendar();
    initHost();
    initViewer();
    initLocation();
    initAccount();
    initFooter();
    var reobserve = initScrollAnim();

    var results = await Promise.all([
      loadFolder('gallery'),
      loadFolder('school'),
      loadFolder('jeju')
    ]);

    var galleryImgs = results[0];
    var schoolImgs = results[1];
    var jejuImgs = results[2];

    makeSlider('galleryTrack', 'galleryDots', galleryImgs);

    if (schoolImgs.length === 0) {
      var sSec = $('schoolSection');
      if (sSec) sSec.style.display = 'none';
    } else {
      makeSlider('schoolTrack', 'schoolDots', schoolImgs);
    }

    if (jejuImgs.length === 0) {
      var jSec = $('jejuSection');
      if (jSec) jSec.style.display = 'none';
    } else {
      makeSlider('jejuTrack', 'jejuDots', jejuImgs);
    }

    reobserve();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
