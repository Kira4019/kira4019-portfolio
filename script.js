(function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  // Lê um caminho tipo "profile.name" ou "servers.items.0.name" do objeto de config
  const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  const ytEmbed = v => {
    const m = (v || '').match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || (v || '').match(/^([\w-]{11})$/);
    return m ? 'https://www.youtube.com/embed/' + m[1] : '';
  };

  /* ---------- Sons (Web Audio, opcional) ---------- */
  const SFX = (function () {
    let ctx = null, enabled = true;
    try { enabled = localStorage.getItem('kira4019-sfx') !== 'off'; } catch (e) {}
    function ac() {
      if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    function tone(freq, dur, type, vol, slideTo, when) {
      if (!enabled) return;
      const a = ac(); if (!a) return;
      const t = a.currentTime + (when || 0);
      const o = a.createOscillator(), g = a.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol || 0.05, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(a.destination);
      o.start(t); o.stop(t + dur + 0.03);
    }
    return {
      hover: () => tone(470 + Math.random() * 170, 0.045, 'sine', 0.022),
      click: () => { tone(300, 0.09, 'triangle', 0.055, 560); },
      copy:  () => { tone(660, 0.08, 'sine', 0.05); tone(990, 0.11, 'sine', 0.05, null, 0.07); },
      open:  () => tone(360, 0.14, 'sine', 0.045, 760),
      theme: () => { tone(220, 0.28, 'sine', 0.05, 1320); },
      set: v => { enabled = v; try { localStorage.setItem('kira4019-sfx', v ? 'on' : 'off'); } catch (e) {} if (v) ac(); },
      unlock: () => { if (enabled) ac(); },
      get enabled() { return enabled; },
    };
  })();

  /* ---------- Render do conteúdo ---------- */
  function render(c) {
    // Meta, título, favicon e cor do tema
    document.title = c.site.title;
    const setMeta = (id, v) => { const el = $('#' + id); if (el) el.setAttribute('content', v || ''); };
    setMeta('metaDesc', c.site.description);
    setMeta('metaAuthor', c.site.author);
    setMeta('metaTheme', c.site.themeColor);
    setMeta('ogTitle', c.site.title);
    setMeta('ogDesc', c.site.description);
    const fav = $('#favicon'); const favSrc = c.site.favicon || c.brand.logo; if (fav && favSrc) fav.href = favSrc;
    if (c.servers.background) document.documentElement.style.setProperty('--showcase-bg', `url("${c.servers.background}")`);

    // Campos simples: data-bind (texto), data-bind-src, data-bind-href
    $$('[data-bind]').forEach(el => { const v = get(c, el.dataset.bind); el.textContent = v ?? ''; });
    $$('[data-bind-src]').forEach(el => { const v = get(c, el.dataset.bindSrc); if (v) el.src = v; else el.remove(); });
    $$('[data-bind-href]').forEach(el => { el.href = get(c, el.dataset.bindHref) || '#'; });
    $$('[data-copy-bind]').forEach(el => { el.dataset.copy = get(c, el.dataset.copyBind) || ''; });

    // Avatar: iniciais caso a imagem não exista
    const initials = $('#initials');
    if (initials) initials.textContent = (c.profile.name || '??').slice(0, 2).toUpperCase();
    const av = $('#avatarImg');
    if (av && !c.profile.avatar) av.style.display = 'none';

    // Faixa de tecnologias (duplicada para o loop contínuo)
    const seq = c.tape.map(t => `<span>${esc(t)}</span><b>✦</b>`).join('');
    $('#tapeTrack').innerHTML = `<div class="tape__seq">${seq}</div><div class="tape__seq">${seq}</div>`;

    // Números
    $('#statsGrid').innerHTML = c.stats.map(s => `
      <div class="stat reveal">
        <span class="stat__num" data-count="${Number(s.value) || 0}" data-prefix="${esc(s.prefix)}" data-suffix="${esc(s.suffix)}">0</span>
        <span class="stat__label">${esc(s.label)}</span>
      </div>`).join('');

    // Sobre
    $('#aboutParas').innerHTML = c.about.paragraphs.map(p => `<p class="reveal">${esc(p)}</p>`).join('');
    $('#aboutChips').innerHTML = c.about.chips.map(ch => `<span>${esc(ch)}</span>`).join('');

    // Barras de habilidade
    $('#bars').innerHTML = c.skills.map(s => `
      <div class="bar" data-level="${Number(s.level) || 0}">
        <div class="bar__head"><span>${esc(s.name)}</span><b>${Number(s.level) || 0}%</b></div>
        <div class="bar__track"><div class="bar__fill"></div></div>
      </div>`).join('');

    // Próximas áreas em mira
    const nextChips = $('#nextChips');
    if (nextChips) nextChips.innerHTML = (c.next || []).map(x => `<span>${esc(x)}</span>`).join('');

    // Cards de servidores
    $('#serverCards').innerHTML = c.servers.items.map((sv, i) => `
      <button type="button" class="scard" data-server="${i}" aria-haspopup="dialog">
        <div class="scard__bg" aria-hidden="true"></div>
        <span class="scard__more" aria-hidden="true">ver +</span>
        <div class="scard__art">
          ${sv.image ? `<img src="${esc(sv.image)}" alt="${esc(sv.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'" />` : ''}
          <span class="scard__mono" style="${sv.image ? 'display:none' : ''}">${esc((sv.name || '?').slice(0, 3).toUpperCase())}</span>
        </div>
        <div class="scard__foot">
          <span class="scard__label">${esc(sv.name)}</span>
          <span class="scard__sub">${esc(sv.sub)}</span>
        </div>
      </button>`).join('');

  }

  /* ---------- Modal de projetos ---------- */
  function setupModal(c) {
    const modal = $('#projModal');
    const picker = $('#modalPicker');
    const proj = $('#modalProject');
    let currentServer = null;

    function showView(name) {
      picker.classList.toggle('is-active', name === 'picker');
      picker.hidden = name !== 'picker';
      proj.classList.toggle('is-active', name === 'project');
      proj.hidden = name !== 'project';
      $('.modal__box', modal).scrollTop = 0;
    }

    function openServer(i) {
      currentServer = c.servers.items[i];
      $('#modalTitle').textContent = currentServer.modalTitle || currentServer.name;
      $('#modalSub').textContent = currentServer.modalSub || '';
      $('#modalLogo').innerHTML = currentServer.image
        ? `<img src="${esc(currentServer.image)}" alt="" onerror="this.remove()" />`
        : `<span class="modal__mono">${esc((currentServer.name || '?').slice(0, 3).toUpperCase())}</span>`;

      picker.innerHTML = `<div class="picker">${currentServer.projects.map((p, idx) => p.soon
        ? `<div class="pickcard pickcard--soon" aria-disabled="true" title="Em breve">
             <span class="pickcard__badge">Em breve</span>
             <div class="pickcard__art"></div>
             <span class="pickcard__name">${esc(p.name)}</span>
           </div>`
        : `<button class="pickcard" type="button" data-project="${idx}">
             <div class="pickcard__art">${p.image ? `<img src="${esc(p.image)}" alt="" onerror="this.remove()" />` : ''}</div>
             <span class="pickcard__name">${esc(p.name)}</span>
             ${(p.paragraphs || []).length ? `<span class="pickcard__preview">${p.paragraphs.map(t => `<span class="pickcard__preview-item">${esc(t)}</span>`).join('')}</span>` : ''}
           </button>`).join('')}</div>`;

      showView('picker');
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      SFX.open();
    }

    function openProject(idx) {
      const p = currentServer.projects[idx];
      const embed = ytEmbed(p.video);
      const rarities = (p.items || []).length ? `
        <div class="rarities">${p.items.map(it => `
          <div class="rarity rarity--${esc(it.tier || 'normal')}">
            <span class="rarity__dot"></span>
            <span class="rarity__name">${esc(it.name)}</span>
            <span class="rarity__info">${esc(it.info)}</span>
          </div>`).join('')}
        </div>` : '';
      proj.innerHTML = `
        <button class="mback" type="button" data-back>← Voltar</button>
        ${embed ? `<div class="video"><iframe src="${embed}" title="${esc(p.title || p.name)}" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>` : ''}
        <h4 class="mpanel__title">${esc(p.title || p.name)}</h4>
        ${(p.paragraphs || []).map(t => `<p class="mpanel__text">${esc(t)}</p>`).join('')}
        ${rarities}
        ${p.note ? `<p class="mpanel__text mpanel__note">${esc(p.note)}</p>` : ''}`;
      showView('project');
      SFX.click();
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    $('#serverCards').addEventListener('click', e => {
      const btn = e.target.closest('[data-server]');
      if (btn) openServer(Number(btn.dataset.server));
    });
    modal.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) return closeModal();
      const pj = e.target.closest('[data-project]');
      if (pj) return openProject(Number(pj.dataset.project));
      if (e.target.closest('[data-back]')) showView('picker');
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });
  }

  /* ---------- Efeitos de página ---------- */
  function setupEffects(c) {
    const yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Barra de scroll e cabeçalho
    const nav = $('#nav'), progress = $('#scrollProgress');
    let raf = null;
    function onScroll() {
      raf = null;
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 24);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
    }
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(onScroll); }, { passive: true });
    onScroll();

    // Menu mobile
    const burger = $('#burger'), navLinks = $('#navLinks');
    const closeMenu = () => { burger.classList.remove('open'); navLinks.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); };
    burger.addEventListener('click', () => {
      const open = burger.classList.toggle('open');
      navLinks.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    $$('.nav__link', navLinks).forEach(a => a.addEventListener('click', closeMenu));

    // Destaque do link ativo conforme a seção visível
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        $$('.nav__link').forEach(l => l.classList.remove('active'));
        const link = $(`.nav__link[href="#${en.target.id}"]`);
        if (link) link.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('section[id]').forEach(s => spy.observe(s));

    // Revelar elementos ao rolar
    const revealObs = new IntersectionObserver((entries, o) => {
      entries.forEach((en, i) => {
        if (en.isIntersecting) {
          setTimeout(() => en.target.classList.add('in'), Math.min(i * 65, 220));
          o.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(el => revealObs.observe(el));

    // Animar barras de habilidade
    const barObs = new IntersectionObserver((entries, o) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const fill = $('.bar__fill', en.target);
        if (fill) fill.style.width = (en.target.dataset.level || 0) + '%';
        o.unobserve(en.target);
      });
    }, { threshold: 0.4 });
    $$('.bar').forEach(b => barObs.observe(b));

    // Contadores dos números
    const countObs = new IntersectionObserver((entries, o) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = parseInt(el.dataset.count, 10) || 0;
        const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
        let start = null;
        (function step(ts) {
          if (!start) start = ts;
          const p = Math.min((ts - start) / 1500, 1);
          el.textContent = pre + Math.round((1 - Math.pow(1 - p, 3)) * target) + suf;
          if (p < 1) requestAnimationFrame(step);
        })(performance.now());
        o.unobserve(el);
      });
    }, { threshold: 0.5 });
    $$('.stat__num').forEach(s => countObs.observe(s));

    // Copiar para a área de transferência
    const copybar = $('#copybar'), copybarText = $('#copybarText');
    let copyTimer;
    async function copyText(text) {
      try { await navigator.clipboard.writeText(text); }
      catch {
        const t = document.createElement('textarea');
        t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
        document.body.appendChild(t); t.select();
        try { document.execCommand('copy'); } catch {}
        document.body.removeChild(t);
      }
    }
    document.addEventListener('click', async e => {
      const el = e.target.closest('[data-copy]');
      if (!el || !el.dataset.copy) return;
      await copyText(el.dataset.copy);
      SFX.copy();
      copybarText.textContent = (el.dataset.copyLabel || 'Copiado') + ': ' + el.dataset.copy;
      copybar.classList.add('show');
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => copybar.classList.remove('show'), 2000);
    });

    // Botão de tema e de som (canto inferior)
    const I = {
      sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14"/></svg>',
      mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="m17 9 6 6M23 9l-6 6"/></svg>',
      moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>',
      sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>',
      up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    };
    const root = document.documentElement;
    const isLight = () => root.getAttribute('data-theme') === 'light';
    const dock = document.createElement('div');
    dock.className = 'dock';
    dock.id = 'dock';

    const sBtn = document.createElement('button');
    sBtn.type = 'button';
    sBtn.className = 'dock-btn sfx-btn' + (SFX.enabled ? '' : ' is-off');
    sBtn.setAttribute('aria-label', 'Ligar ou desligar o som');
    sBtn.innerHTML = SFX.enabled ? I.sound : I.mute;
    sBtn.addEventListener('click', () => {
      SFX.set(!SFX.enabled);
      sBtn.classList.toggle('is-off', !SFX.enabled);
      sBtn.innerHTML = SFX.enabled ? I.sound : I.mute;
    });

    const tBtn = document.createElement('button');
    tBtn.type = 'button';
    tBtn.className = 'dock-btn theme-btn';
    tBtn.setAttribute('aria-label', 'Alternar tema claro/escuro');
    tBtn.innerHTML = isLight() ? I.sun : I.moon;
    tBtn.addEventListener('click', () => {
      const light = !isLight();
      root.setAttribute('data-theme', light ? 'light' : 'dark');
      try { localStorage.setItem('kira4019-theme', light ? 'light' : 'dark'); } catch (e) {}
      tBtn.innerHTML = light ? I.sun : I.moon;
      SFX.theme();
    });

    dock.append(sBtn, tBtn);

    const topBtn = document.createElement('button');
    topBtn.type = 'button';
    topBtn.className = 'dock-btn top-btn';
    topBtn.setAttribute('aria-label', 'Voltar ao topo');
    topBtn.innerHTML = I.up;
    topBtn.hidden = true;
    topBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      SFX.click();
    });
    dock.appendChild(topBtn);

    const syncTop = () => { topBtn.hidden = window.scrollY < 500; };
    window.addEventListener('scroll', syncTop, { passive: true });
    syncTop();

    document.body.appendChild(dock);

    // Sons de interação (leves)
    let lastHover = 0;
    document.addEventListener('mouseover', e => {
      if (!e.target.closest('a, button, .scard, .pickcard:not(.pickcard--soon), .contact-card, .stat, .chips span')) return;
      const now = performance.now();
      if (now - lastHover < 80) return;
      lastHover = now;
      SFX.hover();
    });
    document.addEventListener('pointerdown', () => SFX.unlock(), { once: true });
  }

  /* ---------- Digitação do hero ---------- */
  function setupTyping(c) {
    const el = $('#typed');
    if (!el) return;

    const fallback = ['Bots Discord', 'Automação', 'Python', 'JavaScript', 'Java', 'Engenharia Militar'];
    const words = (c.hero && Array.isArray(c.hero.roles) && c.hero.roles.length ? c.hero.roles : fallback)
      .map(w => String(w || '').trim()).filter(Boolean);
    if (!words.length) return;

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = words[0];
      return;
    }

    let word = 0, char = 0, deleting = false, timer = null;

    function tick() {
      if (document.hidden) { timer = setTimeout(tick, 600); return; }
      const current = words[word];
      el.textContent = current.slice(0, char);

      if (!deleting && char < current.length) {
        char++;
        timer = setTimeout(tick, 62 + Math.random() * 46);
        return;
      }
      if (!deleting) {
        deleting = true;
        timer = setTimeout(tick, 1700);
        return;
      }
      if (char > 0) {
        char--;
        timer = setTimeout(tick, 26 + Math.random() * 18);
        return;
      }
      deleting = false;
      word = (word + 1) % words.length;
      timer = setTimeout(tick, 320);
    }

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) { clearTimeout(timer); tick(); }
    });

    timer = setTimeout(tick, 850);
  }

  /* ---------- Interações fluidas ---------- */
  function setupInteractions() {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Brilho que segue o cursor
    const glow = $('#cursorGlow');
    if (glow && fine && !reduce) {
      let tx = window.innerWidth / 2, ty = window.innerHeight / 3;
      let x = tx, y = ty, running = false;

      const move = e => {
        tx = e.clientX; ty = e.clientY;
        glow.classList.add('is-on');
        if (!running) { running = true; requestAnimationFrame(loop); }
      };
      function loop() {
        x += (tx - x) * 0.16;
        y += (ty - y) * 0.16;
        glow.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        if (Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4) requestAnimationFrame(loop);
        else running = false;
      }
      window.addEventListener('pointermove', move, { passive: true });
      document.addEventListener('pointerleave', () => glow.classList.remove('is-on'));
      window.addEventListener('blur', () => glow.classList.remove('is-on'));
    }

    // Inclinação 3D suave nos cartões
    if (fine && !reduce) {
      $$('.profile-card, .info-card, .contact-card').forEach(el => {
        el.classList.add('tilt');
        el.addEventListener('pointermove', e => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          el.style.setProperty('--rx', (py * -5.5).toFixed(2) + 'deg');
          el.style.setProperty('--ry', (px * 6.5).toFixed(2) + 'deg');
          el.style.setProperty('--gx', ((px + 0.5) * 100).toFixed(1) + '%');
          el.style.setProperty('--gy', ((py + 0.5) * 100).toFixed(1) + '%');
        });
        el.addEventListener('pointerleave', () => {
          el.style.setProperty('--rx', '0deg');
          el.style.setProperty('--ry', '0deg');
        });
      });

      // Botões magnéticos
      $$('.btn, .nav__link--cta').forEach(el => {
        el.classList.add('magnetic');
        el.addEventListener('pointermove', e => {
          const r = el.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
          const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
          el.style.setProperty('--mag-x', (dx * 9).toFixed(2) + 'px');
          el.style.setProperty('--mag-y', (dy * 7).toFixed(2) + 'px');
        });
        el.addEventListener('pointerleave', () => {
          el.style.setProperty('--mag-x', '0px');
          el.style.setProperty('--mag-y', '0px');
        });
      });

      // Paralaxe leve do personagem
      const art = $('.hero__art');
      if (art) {
        window.addEventListener('pointermove', e => {
          if (window.scrollY > window.innerHeight) return;
          const x = e.clientX / window.innerWidth - 0.5;
          const y = e.clientY / window.innerHeight - 0.5;
          art.style.translate = `${(x * 20).toFixed(1)}px ${(y * 14).toFixed(1)}px`;
        }, { passive: true });
      }
    }

    // Onda ao clicar
    document.addEventListener('pointerdown', e => {
      if (reduce) return;
      const btn = e.target.closest('.btn, .music__play, .scard, .nav__link--cta');
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 1.15;
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - r.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - r.top - size / 2) + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    }, { passive: true });
  }

  /* ---------- Música de fundo ---------- */
  function setupMusic(c) {
    const cfg = c.music || {};
    if (cfg.enabled === false) return;

    const card = $('#musicPlayer');
    const frame = $('#musicFrame');
    if (!card || !frame) return;

    const tagEl = $('#musicTag');
    const toggle = $('#musicToggle');
    const muteBtn = $('#musicMute');
    const volEl = $('#musicVolume');
    const progressEl = $('#musicProgress');
    const fillEl = $('#musicFill');
    const closeBtn = $('#musicClose');
    const spotifyLink = $('#musicSpotify');
    const ytLink = $('#musicYtLink');

    $('#musicTitle').textContent = cfg.title || 'worry (slowed)';
    $('#musicArtist').textContent = cfg.artist || 'lonown';

    const embed = ytEmbed(cfg.youtube);
    const videoId = embed ? embed.split('/embed/')[1] : '';
    const fallbackEmbed = ytEmbed(cfg.youtubeFallback);
    const fallbackId = fallbackEmbed ? fallbackEmbed.split('/embed/')[1] : '';
    let usedFallback = false;
    if (videoId) ytLink.href = 'https://www.youtube.com/watch?v=' + videoId;
    else ytLink.hidden = true;
    if (cfg.spotify) spotifyLink.href = cfg.spotify;
    else spotifyLink.hidden = true;

    let volume = Number(cfg.volume);
    if (!Number.isFinite(volume)) volume = 45;
    volume = Math.max(0, Math.min(100, volume));
    try {
      const saved = localStorage.getItem('kira4019-music-vol');
      if (saved !== null && Number.isFinite(Number(saved))) volume = Math.max(0, Math.min(100, Number(saved)));
    } catch (e) {}
    volEl.value = String(volume);

    let audio = null;
    let player = null;
    let ready = false;
    let playing = false;
    let wantsPlay = true;
    let userPaused = false;
    let muted = false;
    let lastVolume = volume || 45;
    let lastPct = 0;
    let poll = null;
    let dead = false;
    let dockBtn = null;

    const setTag = t => { if (tagEl) tagEl.textContent = t; };

    function syncDock() {
      if (!dockBtn) return;
      dockBtn.classList.toggle('is-playing', playing);
      dockBtn.setAttribute('aria-label', playing ? 'Pausar música' : 'Tocar música');
      dockBtn.setAttribute('aria-pressed', String(playing));
    }

    function setPlayingUI(on) {
      playing = on;
      card.classList.toggle('is-playing', on);
      toggle.setAttribute('aria-label', on ? 'Pausar música' : 'Tocar música');
      syncDock();
    }

    function startPoll() {
      stopPoll();
      poll = setInterval(updateProgress, 500);
    }
    function stopPoll() {
      if (poll) { clearInterval(poll); poll = null; }
    }

    function updateProgress() {
      let cur = 0, dur = 0;
      if (audio) {
        cur = audio.currentTime || 0;
        dur = audio.duration || 0;
      } else if (player && ready && typeof player.getCurrentTime === 'function') {
        cur = player.getCurrentTime() || 0;
        dur = player.getDuration() || 0;
      }
      lastPct = dur > 0 ? Math.min(100, (cur / dur) * 100) : 0;
      if (fillEl) fillEl.style.width = lastPct + '%';
      if (progressEl) progressEl.setAttribute('aria-valuenow', String(Math.round(lastPct)));
    }

    function seek(ratio) {
      const r = Math.max(0, Math.min(1, ratio));
      if (audio && audio.duration) {
        audio.currentTime = r * audio.duration;
      } else if (player && ready && typeof player.getDuration === 'function') {
        const d = player.getDuration() || 0;
        if (d) player.seekTo(r * d, true);
      }
      updateProgress();
    }

    function currentVolume() { return muted ? 0 : volume; }

    function applyVolume() {
      const v = currentVolume();
      if (audio) audio.volume = v / 100;
      if (player && ready) {
        try {
          if (v === 0) player.mute();
          else { player.unMute(); player.setVolume(v); }
        } catch (e) {}
      }
      volEl.value = String(volume);
      const off = v === 0;
      muteBtn.classList.toggle('is-muted', off);
      muteBtn.setAttribute('aria-label', off ? 'Ativar som' : 'Silenciar');
    }

    function persistVolume() {
      try { localStorage.setItem('kira4019-music-vol', String(volume)); } catch (e) {}
    }

    function revealCard() {
      card.hidden = false;
      document.body.classList.add('has-music');
    }

    function onStarted() {
      setPlayingUI(true);
      card.classList.remove('is-blocked');
      setTag('Tocando agora');
      startPoll();
      armGestureOff();
    }

    function onBlocked() {
      if (!wantsPlay) return;
      setPlayingUI(false);
      card.classList.add('is-blocked');
      setTag('Toque para ouvir');
    }

    function onFail() {
      if (dead) return;
      if (player && ready && playing) return;
      dead = true;
      stopPoll();
      setPlayingUI(false);
      card.classList.remove('is-blocked');
      card.classList.add('is-unavailable');
      setTag(cfg.spotify ? 'Ouvir no Spotify' : (videoId ? 'Ouvir no YouTube' : 'Player indisponível'));
      console.warn('Player de música indisponível. Use os links do Spotify ou do YouTube no cartão.');
    }

    function checkStart(attempt) {
      if (!wantsPlay) return;
      if (audio) {
        if (audio.paused) onBlocked();
        return;
      }
      if (!player || !ready) return;
      let st = -1;
      try { st = player.getPlayerState(); } catch (e) {}
      if (st === 1) { onStarted(); return; }
      if (st === 3) {
        if (!playing) setTag('Carregando…');
        const n = (attempt || 0) + 1;
        if (n <= 4) setTimeout(() => checkStart(n), 1600);
        else onBlocked();
        return;
      }
      onBlocked();
    }

    function tryPlay() {
      if (audio) {
        const p = audio.play();
        if (p && p.catch) p.catch(onBlocked);
        setTimeout(() => checkStart(0), 1200);
        return;
      }
      if (!player || !ready) { setTag('Carregando…'); return; }
      try {
        player.unMute();
        player.setVolume(currentVolume());
        player.playVideo();
      } catch (e) {}
      setTimeout(() => checkStart(0), 1500);
    }

    /* Local MP3 (opcional): assets/music/worry-slowed.mp3 */
    function initLocal(src) {
      setTag('Carregando…');
      audio = new Audio(src);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = currentVolume() / 100;

      audio.addEventListener('playing', onStarted);
      audio.addEventListener('pause', () => {
        setPlayingUI(false);
        stopPoll();
        if (!userPaused) setTag('Pausado');
      });
      audio.addEventListener('error', () => {
        audio = null;
        if (videoId) initYT();
        else onFail();
      });
      audio.addEventListener('loadedmetadata', () => {
        const at = Number(cfg.startAt);
        if (Number.isFinite(at) && at > 0 && at < audio.duration) audio.currentTime = at;
        updateProgress();
      });

      if (wantsPlay) {
        const p = audio.play();
        if (p && p.catch) p.catch(onBlocked);
        setTimeout(checkStart, 1200);
      }
    }

    /* YouTube IFrame API */
    function initYT() {
      if (!videoId || dead) return;
      setTag('Carregando…');

      const boot = () => {
        if (dead || !window.YT || !window.YT.Player || player) return;
        const vars = {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          start: Math.max(0, Number(cfg.startAt) || 0),
        };
        if (location.protocol === 'http:' || location.protocol === 'https:') vars.origin = location.origin;

        player = new window.YT.Player(frame.id, {
          width: 200,
          height: 120,
          videoId,
          playerVars: vars,
          events: {
            onReady: () => {
              if (dead) return;
              ready = true;
              try { player.setVolume(currentVolume()); } catch (e) {}
              if (wantsPlay) tryPlay();
              else setTag('Pausado');
            },
            onStateChange: e => {
              if (e.data === 1) onStarted();
              else if (e.data === 3) { if (!playing) setTag('Carregando…'); }
              else if (e.data === 2) {
                setPlayingUI(false);
                stopPoll();
                if (!userPaused) setTag('Pausado');
              } else if (e.data === 0) {
                if (wantsPlay) {
                  try { player.seekTo(0, true); player.playVideo(); } catch (err) {}
                }
              }
            },
            onError: () => {
              if (!usedFallback && fallbackId) {
                usedFallback = true;
                try {
                  player.loadVideoById(fallbackId);
                  setTag('Carregando…');
                  return;
                } catch (err) {}
              }
              onFail();
            },
          },
        });
      };

      if (window.YT && window.YT.Player) { boot(); return; }

      if (!document.querySelector('script[data-yt-api]')) {
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        s.async = true;
        s.dataset.ytApi = '1';
        s.onerror = onFail;
        document.head.appendChild(s);
      }

      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prev === 'function') { try { prev(); } catch (e) {} }
        boot();
      };

      setTimeout(() => { if (!player) onFail(); }, 8000);
    }

    /* Primeiro gesto do usuário libera o áudio */
    const gestures = ['pointerdown', 'mousedown', 'keydown', 'touchstart', 'wheel', 'scroll'];
    let lastGestureTry = 0;
    function firstGesture() {
      if (dead || userPaused || !wantsPlay) return;
      if (playing) { armGestureOff(); return; }
      const now = performance.now();
      if (now - lastGestureTry < 1200) return;
      lastGestureTry = now;
      card.classList.remove('is-blocked');
      tryPlay();
    }
    function armGestureOff() {
      gestures.forEach(ev => window.removeEventListener(ev, firstGesture));
    }

    function play() {
      userPaused = false;
      wantsPlay = true;
      card.classList.remove('is-blocked');
      if (dead) {
        const target = (cfg.spotify || ytLink.href || 'https://www.youtube.com/watch?v=' + videoId);
        window.open(target, '_blank', 'noopener');
        return;
      }
      if (!card.hidden) setTag('Carregando…');
      if (audio) {
        const p = audio.play();
        if (p && p.catch) p.catch(onBlocked);
        setTimeout(() => checkStart(0), 1200);
      } else if (player && ready) {
        tryPlay();
      } else if (videoId) {
        initYT();
      } else {
        window.open(ytLink.href, '_blank', 'noopener');
      }
    }

    function pause() {
      userPaused = true;
      wantsPlay = false;
      if (audio) audio.pause();
      else if (player && ready) { try { player.pauseVideo(); } catch (e) {} }
      setPlayingUI(false);
      setTag('Pausado');
      stopPoll();
    }

    /* Controles */
    toggle.addEventListener('click', () => { playing ? pause() : play(); });

    muteBtn.addEventListener('click', () => {
      if (muted || volume === 0) {
        muted = false;
        if (!volume) volume = lastVolume || 45;
      } else {
        muted = true;
        lastVolume = volume;
      }
      applyVolume();
      persistVolume();
    });

    volEl.addEventListener('input', () => {
      volume = Math.max(0, Math.min(100, Number(volEl.value) || 0));
      if (volume > 0) { muted = false; lastVolume = volume; }
      else muted = true;
      applyVolume();
      persistVolume();
    });

    progressEl.addEventListener('click', e => {
      const r = progressEl.getBoundingClientRect();
      seek((e.clientX - r.left) / r.width);
    });
    progressEl.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        seek((lastPct + (e.key === 'ArrowRight' ? 5 : -5)) / 100);
      }
    });

    closeBtn.addEventListener('click', () => {
      card.hidden = true;
      document.body.classList.remove('has-music');
    });

    /* Atalho: M para música, quando não estiver digitando */
    document.addEventListener('keydown', e => {
      if (e.key !== 'm' && e.key !== 'M') return;
      if (e.target.closest('input, textarea, select, [contenteditable]')) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      revealCard();
      playing ? pause() : play();
    });

    /* Configura e tenta iniciar */
    revealCard();
    applyVolume();

    const dock = $('#dock');
    if (dock) {
      dockBtn = document.createElement('button');
      dockBtn.type = 'button';
      dockBtn.className = 'dock-btn music-btn';
      dockBtn.setAttribute('aria-pressed', 'false');
      dockBtn.setAttribute('aria-label', 'Tocar música');
      dockBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
      dockBtn.addEventListener('click', () => {
        if (card.hidden) {
          revealCard();
          if (!playing) play();
        } else {
          playing ? pause() : play();
        }
      });
      dock.prepend(dockBtn);
    }

    const localSrc = String(cfg.local || '').trim();
    if (localSrc) initLocal(localSrc);
    else if (videoId) initYT();
    else onFail();

    gestures.forEach(ev => window.addEventListener(ev, firstGesture, { passive: true }));

    // Se o autoplay falhar, o player continua visível com "Toque para ouvir".
    window.addEventListener('beforeunload', () => {
      stopPoll();
      if (player && typeof player.stopVideo === 'function') { try { player.stopVideo(); } catch (e) {} }
    });
  }

  /* ---------- Inicialização ---------- */
  async function init() {
    let c;
    try {
      const r = await fetch('data/site.json', { cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      c = await r.json();
    } catch (err) {
      // Permite abrir o index.html direto (file://) sem servidor local.
      if (window.SITE_DATA) {
        c = window.SITE_DATA;
        console.warn('Prévia local: usando data/site.fallback.js. Rode start.bat para carregar o site.json atualizado.', err);
      } else {
        console.error('Não foi possível carregar data/site.json:', err);
        return;
      }
    }
    render(c);
    setupModal(c);
    setupEffects(c);
    setupTyping(c);
    setupInteractions();
    setupMusic(c);
    console.log('%c ' + (c.brand.name || 'Portfólio') + ' ', 'background:#c084fc;color:#170f24;font-weight:bold;padding:4px 10px;border-radius:6px;', ' carregado.');
  }

  init();
})();
