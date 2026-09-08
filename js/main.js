/* =========================================================
   DAVID SHATON — portfolio interactions
   ========================================================= */

(() => {
  'use strict';

  const CONTACTS = {
    telegram: 'https://t.me/error_090',
    whatsapp: 'https://wa.me/79183280452',
    max: 'https://max.ru/u/f9LHodD0cOKjKl1-NABs7Yp0WEn2eO1a9sJrIswN4yPeTUkqg1WSs3SJB8I',
    phone: 'tel:+79183280452',
    instagram: 'https://www.instagram.com/davidshaton',
  };

  const isTouch = window.matchMedia('(hover: none)').matches;

  /* =========================================================
     THEME — light / dark toggle, persisted, system-aware
     (initial theme is already applied by the inline head script
     to avoid a flash; this just wires up the toggle button)
     ========================================================= */
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('ds_theme', next); } catch (e) {}
    });
  }

  /* =========================================================
     MOBILE NAV DRAWER
     ========================================================= */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileDrawerBackdrop = document.getElementById('mobileDrawerBackdrop');
  if (hamburgerBtn && mobileDrawer) {
    function openDrawer() {
      mobileDrawer.classList.add('open');
      mobileDrawer.setAttribute('aria-hidden', 'false');
      hamburgerBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeDrawer() {
      mobileDrawer.classList.remove('open');
      mobileDrawer.setAttribute('aria-hidden', 'true');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('open');
      isOpen ? closeDrawer() : openDrawer();
    });
    mobileDrawerBackdrop.addEventListener('click', closeDrawer);
    mobileDrawer.querySelectorAll('.mobile-drawer-link, .mobile-drawer-actions a').forEach((el) => {
      el.addEventListener('click', closeDrawer);
    });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });
  }

  /* =========================================================
     SOUND — tiny synthesized UI feedback (no audio files)
     Muted by default; user opts in via the header toggle.
     ========================================================= */
  const Sound = (() => {
    let ctx = null;
    let enabled = localStorage.getItem('ds_sound') === 'on';

    function ensureCtx() {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }

    function tone({ freq = 440, duration = 0.12, type = 'sine', gain = 0.06, glideTo = null }) {
      if (!enabled) return;
      try {
        const c = ensureCtx();
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, c.currentTime);
        if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, c.currentTime + duration);
        g.gain.setValueAtTime(gain, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
        osc.connect(g).connect(c.destination);
        osc.start();
        osc.stop(c.currentTime + duration);
      } catch (e) { /* audio unsupported — silently no-op */ }
    }

    function vibrate(ms) {
      if (enabled && navigator.vibrate) navigator.vibrate(ms);
    }

    return {
      isEnabled: () => enabled,
      setEnabled(v) { enabled = v; localStorage.setItem('ds_sound', v ? 'on' : 'off'); },
      click() { tone({ freq: 320, duration: 0.06, type: 'square', gain: 0.04 }); },
      clunk() { tone({ freq: 180, duration: 0.18, type: 'square', gain: 0.07, glideTo: 90 }); vibrate(20); },
      ding() { tone({ freq: 880, duration: 0.22, type: 'triangle', gain: 0.06, glideTo: 1200 }); vibrate([10, 30, 10]); },
      flip() { tone({ freq: 240, duration: 0.14, type: 'sine', gain: 0.05, glideTo: 480 }); vibrate(15); },
    };
  })();

  const soundToggle = document.getElementById('soundToggle');
  if (soundToggle) {
    soundToggle.setAttribute('aria-pressed', String(Sound.isEnabled()));
    soundToggle.addEventListener('click', () => {
      const next = !Sound.isEnabled();
      Sound.setEnabled(next);
      soundToggle.setAttribute('aria-pressed', String(next));
      if (next) Sound.ding();
    });
  }

  /* ---------------- custom cursor ---------------- */
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');

  if (!isTouch && dot && ring) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    loop();

    document.querySelectorAll('a, button, [data-magnetic], input').forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('active'));
      el.addEventListener('mouseleave', () => ring.classList.remove('active'));
    });

    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const relX = e.clientX - r.left - r.width / 2;
        const relY = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${relX * 0.18}px, ${relY * 0.28}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------------- hero ticker (fixed height, no reflow) ---------------- */
  const ticker = document.getElementById('tickerViewport');
  const tickerLines = [
    'принимаю новые проекты',
    'отвечаю в течение часа',
    'сайты, реклама и соцсети — один исполнитель',
    'работаю по всей России удалённо',
  ];
  if (ticker) {
    tickerLines.forEach((text, i) => {
      const span = document.createElement('span');
      span.className = 'ticker-item' + (i === 0 ? ' active' : '');
      span.textContent = text;
      ticker.appendChild(span);
    });
    let ti = 0;
    setInterval(() => {
      const items = ticker.querySelectorAll('.ticker-item');
      items[ti].classList.remove('active');
      ti = (ti + 1) % items.length;
      items[ti].classList.add('active');
    }, 3200);
  }

  /* ---------------- blueprint grid background ---------------- */
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, dpr;
  const parallax = { tx: 0, ty: 0, mx: 0, my: 0 };
  const GRID = 44;
  let scanY = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  if (!isTouch) {
    window.addEventListener('mousemove', (e) => {
      parallax.mx = (e.clientX / W - 0.5) * 14;
      parallax.my = (e.clientY / H - 0.5) * 14;
    });
  }
  resize();

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function drawGrid() {
    const dark = isDark();
    const bg = dark ? '#0a0b0d' : '#ffffff';
    const accentRGB = dark ? '95,176,255' : '47,111,237';
    const lineMajor = dark ? 0.09 : 0.05;
    const lineMinor = dark ? 0.04 : 0.022;
    const scanAlpha = dark ? 0.05 : 0.02;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    parallax.tx += (parallax.mx - parallax.tx) * 0.04;
    parallax.ty += (parallax.my - parallax.ty) * 0.04;

    ctx.save();
    ctx.translate(parallax.tx, parallax.ty);

    const offX = ((parallax.tx % GRID) + GRID) % GRID;
    const offY = ((parallax.ty % GRID) + GRID) % GRID;

    let col = 0;
    for (let x = -offX; x < W + GRID; x += GRID, col++) {
      ctx.strokeStyle = `rgba(${accentRGB},${col % 5 === 0 ? lineMajor : lineMinor})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, -20);
      ctx.lineTo(x, H + 20);
      ctx.stroke();
    }
    let row = 0;
    for (let y = -offY; y < H + GRID; y += GRID, row++) {
      ctx.strokeStyle = `rgba(${accentRGB},${row % 5 === 0 ? lineMajor : lineMinor})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-20, y);
      ctx.lineTo(W + 20, y);
      ctx.stroke();
    }
    ctx.restore();

    scanY = (scanY + 0.55) % (H + 200);
    const grad = ctx.createLinearGradient(0, scanY - 100, 0, scanY + 100);
    grad.addColorStop(0, `rgba(${accentRGB},0)`);
    grad.addColorStop(0.5, `rgba(${accentRGB},${scanAlpha})`);
    grad.addColorStop(1, `rgba(${accentRGB},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, scanY - 100, W, 200);

    requestAnimationFrame(drawGrid);
  }
  drawGrid();

  /* ---------------- scroll reveal ---------------- */
  const revealTargets = document.querySelectorAll('.project-row, .stat, .process-list li, .chip, .contact-card, .manifest-list li, .audit-card');
  revealTargets.forEach((el) => { el.style.opacity = 0; el.style.transform += ' translateY(24px)'; el.style.transition = 'opacity .6s ease, transform .6s ease'; });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
        entry.target.style.transform = entry.target.style.transform.replace('translateY(24px)', 'translateY(0)');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealTargets.forEach((el) => io.observe(el));

  const headIo = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        headIo.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.section-head').forEach((el) => headIo.observe(el));

  /* =========================================================
     THE MACHINE — signature feature
     Drag a "problem" chip into the machine (or just tap it) and
     watch it get processed into a plain-language solution. The
     physical-machine metaphor needs no explanation for anyone.
     ========================================================= */
  const SOLUTIONS = {
    clients: { problem: 'Нет клиентов', text: 'Настрою трафик: Директ + Авито + SEO' },
    site: { problem: 'Сайт старый или его нет', text: 'Соберу новый сайт или PWA под задачу' },
    crm: { problem: 'Заявки теряются', text: 'Внедрю CRM, автоответы и аналитику' },
    smm: { problem: 'Соцсети заброшены', text: 'Упакую контент: Reels, карусели, посты' },
    start: { problem: 'Не знаю, с чего начать', text: 'Бесплатно разберу нишу и дам план' },
  };
  const solvedItems = [];

  const chipsTray = document.getElementById('chipsTray');
  const machine = document.getElementById('machineBox');
  const machineBody = document.getElementById('machineBody');
  const machineLight = document.getElementById('machineLight');
  const resultsTray = document.getElementById('resultsTray');
  const resultsPlaceholder = document.getElementById('resultsPlaceholder');
  const machineDone = document.getElementById('machineDone');
  const downloadTzBtn = document.getElementById('downloadTzBtn');

  if (chipsTray && machine) {
    machineLight.classList.add('idle');

    function machineRect() {
      return machineBody.getBoundingClientRect();
    }
    function pointInRect(x, y, r) {
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    }

    function solve(chip) {
      if (chip.classList.contains('solved')) return;
      const key = chip.dataset.problem;
      const solution = SOLUTIONS[key];
      if (!solution) return;

      chip.classList.add('solved');
      machine.classList.remove('drop-active');
      machineBody.classList.add('processing');
      machineLight.classList.remove('idle');
      machineLight.classList.add('busy');
      Sound.clunk();

      setTimeout(() => {
        machineBody.classList.remove('processing');
        machineLight.classList.remove('busy');
        machineLight.classList.add('idle');
        Sound.ding();

        if (resultsPlaceholder) resultsPlaceholder.remove();
        const result = document.createElement('div');
        result.className = 'result-chip';
        result.innerHTML = `<span class="tick">✓</span><span>${solution.text}</span>`;
        resultsTray.insertBefore(result, downloadTzBtn);

        solvedItems.push(solution);
        if (downloadTzBtn) downloadTzBtn.hidden = false;

        const remaining = chipsTray.querySelectorAll('.chip:not(.solved)').length;
        if (remaining === 0 && machineDone) {
          machineDone.hidden = false;
        }
      }, 950);
    }

    /* tap / click fallback — works everywhere, no drag required */
    chipsTray.querySelectorAll('.chip').forEach((chip) => {
      let downX = 0, downY = 0, moved = false;

      chip.addEventListener('pointerdown', (e) => {
        if (chip.classList.contains('solved')) return;
        downX = e.clientX; downY = e.clientY; moved = false;
        chip.setPointerCapture(e.pointerId);

        const ghost = document.createElement('div');
        ghost.className = 'chip-ghost';
        ghost.textContent = chip.textContent;
        document.body.appendChild(ghost);
        ghost.style.left = e.clientX + 'px';
        ghost.style.top = e.clientY + 'px';
        chip.classList.add('dragging');

        function onMove(ev) {
          const dx = ev.clientX - downX, dy = ev.clientY - downY;
          if (Math.hypot(dx, dy) > 6) moved = true;
          ghost.style.left = ev.clientX + 'px';
          ghost.style.top = ev.clientY + 'px';
          const r = machineRect();
          const over = pointInRect(ev.clientX, ev.clientY, r);
          machine.classList.toggle('drop-active', over);
        }
        function onUp(ev) {
          chip.releasePointerCapture(e.pointerId);
          chip.removeEventListener('pointermove', onMove);
          chip.removeEventListener('pointerup', onUp);
          ghost.remove();
          chip.classList.remove('dragging');
          machine.classList.remove('drop-active');

          const r = machineRect();
          const droppedOnMachine = pointInRect(ev.clientX, ev.clientY, r);
          if (droppedOnMachine || !moved) {
            solve(chip);
          }
        }
        chip.addEventListener('pointermove', onMove);
        chip.addEventListener('pointerup', onUp);
      });

      chip.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); solve(chip); }
      });
    });
  }

  /* ---------------- downloadable TZ from the machine ---------------- */
  if (downloadTzBtn) {
    downloadTzBtn.addEventListener('click', () => {
      const printProblems = document.getElementById('printProblems');
      const printSolutions = document.getElementById('printSolutions');
      printProblems.innerHTML = solvedItems.map((s) => `<li>${s.problem}</li>`).join('');
      printSolutions.innerHTML = solvedItems.map((s) => `<li>${s.text}</li>`).join('');
      window.print();
    });
  }

  /* =========================================================
     QR BUSINESS CARD
     ========================================================= */
  const cardOverlay = document.getElementById('cardOverlay');
  const flipCard = document.getElementById('flipCard');
  const cardClose = document.getElementById('cardClose');
  const qrImage = document.getElementById('qrImage');
  const saveContactBtn = document.getElementById('saveContactBtn');
  const openers = [document.getElementById('cardToggle'), document.getElementById('ctaCardBtn')].filter(Boolean);

  if (cardOverlay && flipCard) {
    const qrData = encodeURIComponent(CONTACTS.whatsapp);
    if (qrImage) {
      qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=0&data=${qrData}`;
    }
    if (saveContactBtn) {
      const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'N:Шатон;Давид;;;',
        'FN:Давид Шатон',
        'TITLE:Маркетолог и разработчик',
        'TEL;TYPE=CELL:+79183280452',
        'URL:https://davidshaton2006-droid.github.io/portfolio-fullstack/',
        'END:VCARD',
      ].join('\n');
      saveContactBtn.href = 'data:text/vcard;charset=utf-8,' + encodeURIComponent(vcard);
    }

    function openCard() {
      cardOverlay.classList.add('open');
      cardOverlay.setAttribute('aria-hidden', 'false');
      flipCard.classList.remove('flipped');
    }
    function closeCard() {
      cardOverlay.classList.remove('open');
      cardOverlay.setAttribute('aria-hidden', 'true');
    }
    openers.forEach((btn) => btn.addEventListener('click', openCard));
    cardClose.addEventListener('click', closeCard);
    cardOverlay.addEventListener('click', (e) => { if (e.target === cardOverlay) closeCard(); });
    flipCard.addEventListener('click', () => { flipCard.classList.toggle('flipped'); Sound.flip(); });
    flipCard.querySelectorAll('a').forEach((a) => a.addEventListener('click', (e) => e.stopPropagation()));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCard(); });
  }

  /* =========================================================
     NICHE AUDIT — express quiz -> personal recommendation
     ========================================================= */
  const auditCard = document.querySelector('.audit-card');
  if (auditCard) {
    const steps = Array.from(auditCard.querySelectorAll('.audit-step'));
    const progressDots = Array.from(document.getElementById('auditProgress').children);
    const resultBox = document.getElementById('auditResult');
    const resultText = document.getElementById('auditResultText');
    const sendBtn = document.getElementById('auditSendBtn');
    const restartBtn = document.getElementById('auditRestartBtn');
    const answers = {};
    let stepIndex = 0;

    function updateProgress() {
      progressDots.forEach((dot, i) => {
        dot.classList.toggle('done', i < stepIndex);
        dot.classList.toggle('active', i === stepIndex);
      });
    }

    function showStep(i) {
      steps.forEach((s, idx) => { s.hidden = idx !== i; });
      resultBox.hidden = true;
      updateProgress();
    }

    const NICHE_LABEL = { services: 'услуги и локальный бизнес', ecom: 'товары и e-commerce', realty: 'недвижимость и B2B', other: 'вашу нишу' };
    const PAIN_CHANNEL = {
      clients: 'связку Яндекс Директ + Авито + SEO, с упором на быстрые заявки',
      site: 'новый сайт или PWA — без него трафик просто некуда вести',
      crm: 'CRM с автоответами и аналитикой, чтобы ни одна заявка не терялась',
      smm: 'контент-план и упаковку соцсетей: Reels, карусели, регулярные посты',
    };

    function buildRecommendation() {
      const niche = NICHE_LABEL[answers.niche] || 'вашу нишу';
      const channel = PAIN_CHANNEL[answers.pain] || 'разбор текущей воронки';
      let stagePart = '';
      if (answers.stage === 'none') stagePart = 'Раз ещё ничего не пробовали — начнём с малого теста, чтобы не тратить бюджет вслепую.';
      if (answers.stage === 'tried') stagePart = 'Раз разовые попытки уже были — сразу выстроим систему, а не ещё один разовый всплеск.';
      if (answers.stage === 'unhappy') stagePart = 'Если текущий подрядчик не устраивает — начну с честного аудита того, что сделано, и покажу, что чинить в первую очередь.';
      const speedPart = answers.speed === 'fast'
        ? 'Раз горит — предложу быстрый первый шаг на 1-2 недели, который даст результат уже сейчас.'
        : 'Раз есть время — соберём план на 2-3 месяца с постепенным ростом без резких скачков бюджета.';

      return `Для ниши «${niche}» с задачей «${channel}» я бы начал с этого. ${stagePart} ${speedPart}`;
    }

    steps.forEach((step) => {
      step.querySelectorAll('.audit-opt').forEach((opt) => {
        opt.addEventListener('click', () => {
          answers[opt.dataset.q] = opt.dataset.v;
          Sound.click();
          if (stepIndex < steps.length - 1) {
            stepIndex++;
            showStep(stepIndex);
          } else {
            steps.forEach((s) => { s.hidden = true; });
            const text = buildRecommendation();
            resultText.textContent = text;
            sendBtn.href = `https://t.me/error_090?text=${encodeURIComponent('Прошёл разбор на сайте:\n\n' + text + '\n\nХочу обсудить.')}`;
            resultBox.hidden = false;
            progressDots.forEach((dot) => dot.classList.add('done'));
            Sound.ding();
          }
        });
      });
    });

    restartBtn.addEventListener('click', () => {
      Object.keys(answers).forEach((k) => delete answers[k]);
      stepIndex = 0;
      showStep(0);
    });

    showStep(0);
  }
})();
