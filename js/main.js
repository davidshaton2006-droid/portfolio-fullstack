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

  /* ---------------- custom cursor ---------------- */
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  const isTouch = window.matchMedia('(hover: none)').matches;

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

    /* magnetic pull */
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const relX = e.clientX - r.left - r.width / 2;
        const relY = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${relX * 0.18}px, ${relY * 0.28}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ---------------- tilt cards ---------------- */
  if (!isTouch) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      const target = card.classList.contains('tilt-card') ? card.querySelector('.tilt-inner') : card;
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        target.style.transform = `rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateZ(0)`;
      });
      card.addEventListener('mouseleave', () => {
        target.style.transform = '';
      });
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

  /* ---------------- canvas network background ---------------- */
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [];
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const count = Math.min(70, Math.floor((W * H) / 22000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.6,
    }));
  }
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
  resize();

  function step() {
    ctx.clearRect(0, 0, W, H);
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;

      const dxm = n.x - mouse.x, dym = n.y - mouse.y;
      const dm = Math.hypot(dxm, dym);
      if (dm < 140) {
        const f = (140 - dm) / 140 * 0.6;
        n.x += (dxm / dm) * f;
        n.y += (dym / dm) * f;
      }
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) {
          ctx.strokeStyle = `rgba(186,255,60,${(1 - d / 130) * 0.14})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    for (const n of nodes) {
      ctx.beginPath();
      ctx.fillStyle = 'rgba(233,239,230,0.5)';
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(step);
  }
  step();

  /* ---------------- scroll reveal ---------------- */
  const revealTargets = document.querySelectorAll('.tilt-card, .project-row, .stat, .process-list li');
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

  /* =========================================================
     QR BUSINESS CARD — signature feature
     A physical-business-card metaphor everyone already knows:
     tap to flip, scan the QR with a phone camera, or save the
     contact straight to the phone. No jargon required.
     ========================================================= */
  const cardOverlay = document.getElementById('cardOverlay');
  const flipCard = document.getElementById('flipCard');
  const cardClose = document.getElementById('cardClose');
  const qrImage = document.getElementById('qrImage');
  const saveContactBtn = document.getElementById('saveContactBtn');
  const openers = [
    document.getElementById('cardToggle'),
    document.getElementById('heroCardBtn'),
    document.getElementById('ctaCardBtn'),
  ].filter(Boolean);

  if (cardOverlay && flipCard) {
    const qrData = encodeURIComponent(CONTACTS.whatsapp);
    if (qrImage) {
      qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=440x440&margin=0&data=${qrData}`;
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
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeCard();
    });
  }
})();
