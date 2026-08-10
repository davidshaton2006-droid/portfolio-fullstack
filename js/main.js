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

  /* ---------------- hero typed line ---------------- */
  const typedEl = document.getElementById('typedLine');
  const lines = [
    'whoami',
    './build.sh --stack=marketing+dev --output=результат',
    'echo "принимаю новые проекты"',
  ];
  let li = 0, ci = 0, deleting = false;

  function typeLoop() {
    if (!typedEl) return;
    const full = lines[li];
    if (!deleting) {
      ci++;
      typedEl.textContent = full.slice(0, ci);
      if (ci === full.length) {
        deleting = true;
        setTimeout(typeLoop, 1600);
        return;
      }
    } else {
      ci--;
      typedEl.textContent = full.slice(0, ci);
      if (ci === 0) {
        deleting = false;
        li = (li + 1) % lines.length;
      }
    }
    setTimeout(typeLoop, deleting ? 28 : 46);
  }
  typeLoop();

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
     TERMINAL EASTER EGG
     ========================================================= */
  const overlay = document.getElementById('terminalOverlay');
  const body = document.getElementById('terminalBody');
  const input = document.getElementById('terminalInput');
  const openers = [
    document.getElementById('terminalToggle'),
    document.getElementById('heroTerminalBtn'),
    document.getElementById('ctaTerminalBtn'),
  ].filter(Boolean);
  const closeBtn = document.getElementById('terminalClose');

  function openTerminal() {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => input.focus(), 150);
  }
  function closeTerminal() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }
  openers.forEach((btn) => btn.addEventListener('click', openTerminal));
  closeBtn.addEventListener('click', closeTerminal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeTerminal(); });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeTerminal();
    if (e.key === '`' && !overlay.classList.contains('open')) { e.preventDefault(); openTerminal(); }
  });

  function print(html, cls = '') {
    const p = document.createElement('p');
    p.className = `term-line ${cls}`;
    p.innerHTML = html;
    body.appendChild(p);
    body.scrollTop = body.scrollHeight;
  }

  const ASCII = `
 ____             _     _
|  _ \\  __ ___   _(_) __| |
| | | |/ _\` \\ \\ / / |/ _\` |
| |_| | (_| |\\ V /| | (_| |
|____/ \\__,_| \\_/ |_|\\__,_|
  маркетолог · разработчик`;

  const COMMANDS = {
    help() {
      print(`Доступные команды:`);
      print(`  <span class="term-hl">whoami</span>       — кто я и чем занимаюсь`);
      print(`  <span class="term-hl">about</span>        — коротко обо мне`);
      print(`  <span class="term-hl">skills</span>       — стек и услуги`);
      print(`  <span class="term-hl">projects</span>     — список проектов`);
      print(`  <span class="term-hl">contact</span>      — все контакты`);
      print(`  <span class="term-hl">open</span> &lt;tg|wa|max|ig|phone&gt; — открыть контакт`);
      print(`  <span class="term-hl">sudo hire-me</span> — не пытайтесь, просто напишите :)`);
      print(`  <span class="term-hl">clear</span>        — очистить экран`);
    },
    whoami() {
      print(`<pre style="margin:0;color:var(--acid);font-size:11px;line-height:1.3">${ASCII}</pre>`);
      print(`Давид Шатон — маркетолог и разработчик полного цикла.`);
      print(`Делаю сайты, приложения, трафик, соцсети и системы. Один человек, весь маркетинг.`);
    },
    about() {
      print(`Закрываю маркетинг в одном лице: от идеи и кода до рекламы и контента.`);
      print(`Работал с эко-курортом «Романтик», платформой SHAREVO, центром выкупа`);
      print(`недвижимости и десятками бизнесов на Авито. Знаю Ranker 3 изнутри.`);
    },
    skills() {
      print(`<span class="term-hl">Разработка:</span> сайты, лендинги, PWA, Telegram-боты, бронирование`);
      print(`<span class="term-hl">Трафик:</span> Яндекс Директ, SEO, Авито, таргет`);
      print(`<span class="term-hl">Контент:</span> Reels, карусели, Instagram, ВКонтакте`);
      print(`<span class="term-hl">Система:</span> CRM, аналитика, автоответы, автоматизация`);
    },
    projects() {
      print(`<span class="term-hl">01</span> База отдыха «Романтик»       — PWA + бронирование`);
      print(`<span class="term-hl">02</span> SHAREVO                      — платформа совместных покупок`);
      print(`<span class="term-hl">03</span> Центр выкупа недвижимости    — карусели, SMM, заявки`);
      print(`<span class="term-hl">04</span> Авито-направление            — Ranker 3, CPL, трафик`);
      print(`Подробнее — секция <span class="term-hl">#projects</span> на странице.`);
    },
    contact() {
      print(`Telegram   → <a class="term-link" href="${CONTACTS.telegram}" target="_blank" rel="noopener">@error_090</a>`);
      print(`WhatsApp   → <a class="term-link" href="${CONTACTS.whatsapp}" target="_blank" rel="noopener">+7 918 328-04-52</a>`);
      print(`MAX        → <a class="term-link" href="${CONTACTS.max}" target="_blank" rel="noopener">Давид Шатон</a>`);
      print(`Телефон    → <a class="term-link" href="${CONTACTS.phone}">+7 918 328-04-52</a>`);
      print(`Instagram  → <a class="term-link" href="${CONTACTS.instagram}" target="_blank" rel="noopener">@davidshaton</a>`);
    },
    open(arg) {
      const map = { tg: 'telegram', telegram: 'telegram', wa: 'whatsapp', whatsapp: 'whatsapp', max: 'max', ig: 'instagram', instagram: 'instagram', phone: 'phone', tel: 'phone' };
      const key = map[(arg || '').toLowerCase()];
      if (!key) { print(`Использование: open &lt;tg|wa|max|ig|phone&gt;`, 'term-err'); return; }
      print(`Открываю ${key}...`);
      window.open(CONTACTS[key], key === 'phone' ? '_self' : '_blank');
    },
    clear() {
      body.innerHTML = '';
    },
    sudo(arg) {
      if ((arg || '').toLowerCase().includes('hire-me')) {
        print(`Permission granted. Просто напишите в Telegram — быстрее, чем sudo.`);
        print(`→ <a class="term-link" href="${CONTACTS.telegram}" target="_blank" rel="noopener">${CONTACTS.telegram}</a>`);
      } else {
        print(`sudo: davidshaton не в списке judoers. Инцидент будет отправлен... шучу, тут никого нет.`, 'term-err');
      }
    },
  };

  function runCommand(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    print(trimmed, 'echo');
    const [cmd, ...rest] = trimmed.split(/\s+/);
    const fn = COMMANDS[cmd.toLowerCase()];
    if (fn) {
      fn(rest.join(' '));
    } else {
      print(`команда не найдена: <span class="term-hl">${cmd}</span>. Введите <span class="term-hl">help</span>.`, 'term-err');
    }
  }

  const history = [];
  let hIdx = -1;
  input && input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = input.value;
      runCommand(val);
      if (val.trim()) { history.push(val); hIdx = history.length; }
      input.value = '';
    } else if (e.key === 'ArrowUp') {
      if (hIdx > 0) { hIdx--; input.value = history[hIdx]; }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (hIdx < history.length - 1) { hIdx++; input.value = history[hIdx]; }
      else { hIdx = history.length; input.value = ''; }
      e.preventDefault();
    }
  });
})();
