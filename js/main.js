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

  function drawGrid() {
    ctx.fillStyle = '#0a121d';
    ctx.fillRect(0, 0, W, H);

    parallax.tx += (parallax.mx - parallax.tx) * 0.04;
    parallax.ty += (parallax.my - parallax.ty) * 0.04;

    ctx.save();
    ctx.translate(parallax.tx, parallax.ty);

    const offX = ((parallax.tx % GRID) + GRID) % GRID;
    const offY = ((parallax.ty % GRID) + GRID) % GRID;

    let col = 0;
    for (let x = -offX; x < W + GRID; x += GRID, col++) {
      ctx.strokeStyle = col % 5 === 0 ? 'rgba(79,184,255,0.10)' : 'rgba(79,184,255,0.045)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, -20);
      ctx.lineTo(x, H + 20);
      ctx.stroke();
    }
    let row = 0;
    for (let y = -offY; y < H + GRID; y += GRID, row++) {
      ctx.strokeStyle = row % 5 === 0 ? 'rgba(79,184,255,0.10)' : 'rgba(79,184,255,0.045)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-20, y);
      ctx.lineTo(W + 20, y);
      ctx.stroke();
    }
    ctx.restore();

    scanY = (scanY + 0.55) % (H + 200);
    const grad = ctx.createLinearGradient(0, scanY - 100, 0, scanY + 100);
    grad.addColorStop(0, 'rgba(79,184,255,0)');
    grad.addColorStop(0.5, 'rgba(79,184,255,0.05)');
    grad.addColorStop(1, 'rgba(79,184,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, scanY - 100, W, 200);

    requestAnimationFrame(drawGrid);
  }
  drawGrid();

  /* ---------------- scroll reveal ---------------- */
  const revealTargets = document.querySelectorAll('.project-row, .stat, .process-list li, .chip, .contact-card');
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
    clients: { text: 'Настрою трафик: Директ + Авито + SEO' },
    site: { text: 'Соберу новый сайт или PWA под задачу' },
    crm: { text: 'Внедрю CRM, автоответы и аналитику' },
    smm: { text: 'Упакую контент: Reels, карусели, посты' },
    start: { text: 'Бесплатно разберу нишу и дам план' },
  };

  const chipsTray = document.getElementById('chipsTray');
  const machine = document.getElementById('machine');
  const machineBody = document.getElementById('machineBody');
  const machineLight = document.getElementById('machineLight');
  const resultsTray = document.getElementById('resultsTray');
  const resultsPlaceholder = document.getElementById('resultsPlaceholder');
  const machineDone = document.getElementById('machineDone');

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

      setTimeout(() => {
        machineBody.classList.remove('processing');
        machineLight.classList.remove('busy');
        machineLight.classList.add('idle');

        if (resultsPlaceholder) resultsPlaceholder.remove();
        const result = document.createElement('div');
        result.className = 'result-chip';
        result.innerHTML = `<span class="tick">✓</span><span>${solution.text}</span>`;
        resultsTray.appendChild(result);

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
    flipCard.addEventListener('click', () => flipCard.classList.toggle('flipped'));
    flipCard.querySelectorAll('a').forEach((a) => a.addEventListener('click', (e) => e.stopPropagation()));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCard(); });
  }
})();
