/* ============================================================
   Portfolio main.js — handles index.html AND project.html
   Loads all data from /data/*.json, renders, wires interactions.
   ============================================================ */

(() => {
  'use strict';

  // ---------- Utilities ----------
  const $  = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  const escapeHTML = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const escapeAttr = escapeHTML;

  // ---------- Theme toggle ----------
  const THEME_KEY = 'portfolio-theme';
  const NUDGE_KEY = 'portfolio-theme-acknowledged';

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = $('#themeToggle');
    if (btn) btn.setAttribute('aria-pressed', String(theme === 'dark'));
  };

  const initThemeToggle = () => {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    const systemDark = matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (systemDark ? 'dark' : 'light'));

    const btn = $('#themeToggle');
    if (!btn) return;

    // Stop nudge animation if user has already interacted in the past
    try {
      if (localStorage.getItem(NUDGE_KEY)) btn.classList.remove('theme-toggle--nudge');
    } catch (e) {}

    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      // Enable color transitions only for this swap, then disable so layout
      // and other transitions don't run on a fresh page-load.
      document.body.classList.add('theme-tween');
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); localStorage.setItem(NUDGE_KEY, '1'); } catch (e) {}
      btn.classList.remove('theme-toggle--nudge');
      setTimeout(() => document.body.classList.remove('theme-tween'), 380);
    });
  };

  const initialsOf = (name) => {
    if (!name) return '·';
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase();
  };

  // Pull dotted-path key from an object
  const pick = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

  // Apply data-bind / data-bind-href / data-bind-src / data-bind-alt across the document
  const applyBindings = (data) => {
    $$('[data-bind]').forEach((el) => {
      const v = pick(data, el.dataset.bind);
      if (v != null && v !== '') el.textContent = v;
    });
    $$('[data-bind-href]').forEach((el) => {
      const v = pick(data, el.dataset.bindHref);
      if (v) el.setAttribute('href', v);
    });
    $$('[data-bind-src]').forEach((el) => {
      const v = pick(data, el.dataset.bindSrc);
      if (v) el.setAttribute('src', v);
    });
    $$('[data-bind-alt]').forEach((el) => {
      const v = pick(data, el.dataset.bindAlt);
      if (v) el.setAttribute('alt', v);
    });
  };

  // Fetch a JSON file with a friendly fallback
  const fetchJSON = (path) => fetch(path, { cache: 'no-cache' }).then((r) => {
    if (!r.ok) throw new Error(`${path} → ${r.status}`);
    return r.json();
  });

  // Tag classifier — slugify
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // ---------- SVG placeholders by category ----------
  const PLACEHOLDER_BY_CATEGORY = {
    'design': (title) => `<svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs><pattern id="ph-d" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M20 0H0V20" fill="none" stroke="#1A1815" stroke-width="0.4" opacity="0.25"/></pattern></defs>
      <rect width="400" height="280" fill="#ECE7DC"/>
      <rect width="400" height="280" fill="url(#ph-d)"/>
      <g stroke="#1A1815" stroke-width="1.2" fill="none">
        <circle cx="170" cy="140" r="60"/><circle cx="170" cy="140" r="48"/>
        <circle cx="170" cy="140" r="10" fill="#1A1815"/>
        <circle cx="270" cy="140" r="36"/><circle cx="270" cy="140" r="28"/>
        <circle cx="270" cy="140" r="6" fill="#1A1815"/>
        <line x1="110" y1="140" x2="230" y2="140" stroke-dasharray="4 4" opacity="0.5"/>
      </g>
      <text x="20" y="265" font-family="ui-monospace, monospace" font-size="10" fill="#7A736A">DWG / ${escapeHTML(title).toUpperCase()}</text>
    </svg>`,
    'simulation': (title) => `<svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="280" fill="#ECE7DC"/>
      <g stroke="#1A1815" stroke-width="0.6" fill="none" opacity="0.7">
        ${(() => { let s = ''; for (let i = 0; i < 18; i++) for (let j = 0; j < 13; j++) {
          const x = 40 + i*18 + (j%2?9:0); const y = 40 + j*16;
          s += `<polygon points="${x},${y} ${x+18},${y} ${x+9},${y+16}" />`;
        } return s; })()}
      </g>
      <ellipse cx="200" cy="140" rx="110" ry="60" fill="#C44A2F" opacity="0.18"/>
      <text x="20" y="265" font-family="ui-monospace, monospace" font-size="10" fill="#7A736A">SIM / ${escapeHTML(title).toUpperCase()}</text>
    </svg>`,
    'manufacturing': (title) => `<svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="280" fill="#ECE7DC"/>
      <g stroke="#1A1815" stroke-width="1.2" fill="none">
        <rect x="80" y="80" width="240" height="120"/>
        <rect x="100" y="100" width="200" height="80"/>
        <line x1="80" y1="80" x2="100" y2="100"/>
        <line x1="320" y1="80" x2="300" y2="100"/>
        <line x1="80" y1="200" x2="100" y2="180"/>
        <line x1="320" y1="200" x2="300" y2="180"/>
      </g>
      <g stroke="#1A1815" stroke-width="0.4" opacity="0.4">
        ${Array.from({length: 12}).map((_,i) => `<line x1="${100+i*16}" y1="100" x2="${112+i*16}" y2="180"/>`).join('')}
      </g>
      <text x="20" y="265" font-family="ui-monospace, monospace" font-size="10" fill="#7A736A">MFG / ${escapeHTML(title).toUpperCase()}</text>
    </svg>`,
    'research': (title) => `<svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="ph-r" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stop-color="#C44A2F" stop-opacity="0.9"/>
          <stop offset="60%" stop-color="#C44A2F" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#C44A2F" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="280" fill="#ECE7DC"/>
      <rect x="60" y="60" width="280" height="160" fill="url(#ph-r)"/>
      <g stroke="#1A1815" stroke-width="0.8" fill="none">
        <rect x="60" y="60" width="280" height="160"/>
        <ellipse cx="200" cy="140" rx="60" ry="32"/>
        <ellipse cx="200" cy="140" rx="100" ry="52" opacity="0.6"/>
        <ellipse cx="200" cy="140" rx="135" ry="72" opacity="0.35"/>
      </g>
      <text x="20" y="265" font-family="ui-monospace, monospace" font-size="10" fill="#7A736A">LAB / ${escapeHTML(title).toUpperCase()}</text>
    </svg>`,
    'coursework': (title) => `<svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="280" fill="#ECE7DC"/>
      <g stroke="#1A1815" stroke-width="1" fill="none">
        <line x1="40" y1="220" x2="360" y2="220"/>
        <line x1="40" y1="220" x2="100" y2="120"/>
        <line x1="100" y1="120" x2="160" y2="220"/>
        <line x1="160" y1="220" x2="220" y2="120"/>
        <line x1="220" y1="120" x2="280" y2="220"/>
        <line x1="280" y1="220" x2="340" y2="120"/>
        <line x1="340" y1="120" x2="360" y2="220"/>
        <line x1="100" y1="120" x2="220" y2="120"/>
        <line x1="220" y1="120" x2="340" y2="120"/>
      </g>
      <g fill="#C44A2F">
        <circle cx="40" cy="220" r="4"/><circle cx="160" cy="220" r="4"/>
        <circle cx="280" cy="220" r="4"/><circle cx="360" cy="220" r="4"/>
        <circle cx="100" cy="120" r="4"/><circle cx="220" cy="120" r="4"/><circle cx="340" cy="120" r="4"/>
      </g>
      <text x="20" y="265" font-family="ui-monospace, monospace" font-size="10" fill="#7A736A">CRSE / ${escapeHTML(title).toUpperCase()}</text>
    </svg>`,
    'internship': (title) => `<svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="280" fill="#ECE7DC"/>
      <g stroke="#1A1815" stroke-width="1.2" fill="none">
        <rect x="100" y="80" width="200" height="120"/>
        <line x1="100" y1="100" x2="300" y2="100"/>
        <circle cx="120" cy="90" r="3" fill="#C44A2F"/>
        <circle cx="135" cy="90" r="3" fill="#1A1815"/>
        <circle cx="150" cy="90" r="3" fill="#1A1815"/>
        <line x1="120" y1="125" x2="280" y2="125" opacity="0.5"/>
        <line x1="120" y1="145" x2="240" y2="145" opacity="0.5"/>
        <line x1="120" y1="165" x2="260" y2="165" opacity="0.5"/>
      </g>
      <text x="20" y="265" font-family="ui-monospace, monospace" font-size="10" fill="#7A736A">INT / ${escapeHTML(title).toUpperCase()}</text>
    </svg>`
  };

  const placeholderFor = (project) => {
    const key = slug(project.category || 'design');
    const fn = PLACEHOLDER_BY_CATEGORY[key] || PLACEHOLDER_BY_CATEGORY['design'];
    return fn(project.title || project.id || 'PROJECT');
  };

  const galleryPlaceholder = (idx, label) => {
    const labels = ['CAD MODEL', 'ANALYSIS', 'DOCUMENTATION', 'PROTOTYPE'];
    const l = label || labels[idx % labels.length];
    return `<div class="placeholder-tile">
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="pg-${idx}" width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M14 0H0V14" fill="none" stroke="#1A1815" stroke-width="0.4" opacity="0.3"/></pattern></defs>
        <rect width="400" height="300" fill="#ECE7DC"/>
        <rect width="400" height="300" fill="url(#pg-${idx})"/>
        <g stroke="#1A1815" stroke-width="0.8" fill="none" opacity="0.6">
          <line x1="40" y1="40" x2="80" y2="40"/><line x1="40" y1="40" x2="40" y2="80"/>
          <line x1="360" y1="40" x2="320" y2="40"/><line x1="360" y1="40" x2="360" y2="80"/>
          <line x1="40" y1="260" x2="80" y2="260"/><line x1="40" y1="260" x2="40" y2="220"/>
          <line x1="360" y1="260" x2="320" y2="260"/><line x1="360" y1="260" x2="360" y2="220"/>
          <circle cx="200" cy="150" r="3" fill="#C44A2F" stroke="none"/>
          <line x1="60" y1="150" x2="340" y2="150" stroke-dasharray="3 4" opacity="0.4"/>
          <line x1="200" y1="60" x2="200" y2="240" stroke-dasharray="3 4" opacity="0.4"/>
        </g>
        <text x="200" y="155" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-size="14" font-weight="600" fill="#1A1815" opacity="0.85">${escapeHTML(l)}</text>
      </svg>
    </div>`;
  };

  // ============================================================
  // SHARED: nav scroll, cursor, reveals, grain, year, etc.
  // ============================================================

  const initShared = (profile) => {
    // Footer year
    const fy = $('#footerYear'); if (fy) fy.textContent = new Date().getFullYear();

    // Theme toggle: persisted, system-default-aware, attention-nudge until first click
    initThemeToggle();

    // Nav scroll behavior
    const nav = $('#nav');
    const onScroll = () => {
      if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 16);
      const r = $('#readoutScroll');
      if (r) {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        r.textContent = String(Math.round((window.scrollY / max) * 100)).padStart(3, '0');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Generic scroll reveal
    const reveals = $$('.reveal');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            // stagger by sibling position
            const sib = Array.from(e.target.parentElement?.children || []).indexOf(e.target);
            e.target.style.transitionDelay = `${Math.min(sib, 6) * 60}ms`;
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
      reveals.forEach((el) => io.observe(el));
    } else {
      reveals.forEach((el) => el.classList.add('is-in'));
    }

    // Mobile menu toggle (only on index)
    const toggle = $('#navToggle');
    const menu = $('.nav__links');
    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        const open = menu.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
      });
      menu.addEventListener('click', (e) => {
        if (e.target.closest('a')) {
          menu.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Custom cursor (desktop only, reduced-motion respect)
    if (matchMedia('(hover: hover) and (pointer: fine)').matches &&
        !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('has-cursor');
      const dot = $('.cursor-dot');
      const ring = $('.cursor-ring');
      let mx = 0, my = 0, rx = 0, ry = 0;
      window.addEventListener('pointermove', (e) => {
        mx = e.clientX; my = e.clientY;
        if (dot) dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
        // hero readout
        const rxe = $('#readoutX'), rye = $('#readoutY');
        if (rxe) rxe.textContent = String(Math.round(mx)).padStart(4, '0');
        if (rye) rye.textContent = String(Math.round(my)).padStart(4, '0');
      }, { passive: true });
      const tick = () => {
        rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
        if (ring) ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      const interactive = 'a, button, .card, .pill, .filter__btn, input, textarea, .contact__link, .gallery__item';
      document.addEventListener('pointerover', (e) => {
        if (e.target.closest?.(interactive)) document.body.classList.add('cursor-hover');
      });
      document.addEventListener('pointerout', (e) => {
        if (e.target.closest?.(interactive)) document.body.classList.remove('cursor-hover');
      });
    }

    // Lightbox keyboard
    const lb = $('#lightbox');
    if (lb) {
      lb.addEventListener('click', (e) => {
        if (e.target.matches('[data-lightbox-close]') || e.target === lb) closeLightbox();
        if (e.target.matches('[data-lightbox-prev]')) lightboxStep(-1);
        if (e.target.matches('[data-lightbox-next]')) lightboxStep(+1);
      });
      document.addEventListener('keydown', (e) => {
        if (!lb.classList.contains('is-open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') lightboxStep(-1);
        if (e.key === 'ArrowRight') lightboxStep(+1);
      });
    }
  };

  // ============================================================
  // LIGHTBOX
  // ============================================================

  let lbImages = [];
  let lbIndex = 0;

  const openLightbox = (images, idx = 0) => {
    if (!images || !images.length) return;
    lbImages = images;
    lbIndex = idx;
    const lb = $('#lightbox');
    if (!lb) return;
    lb.setAttribute('aria-hidden', 'false');
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    renderLightbox();
  };

  const closeLightbox = () => {
    const lb = $('#lightbox');
    if (!lb) return;
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const lightboxStep = (d) => {
    if (!lbImages.length) return;
    lbIndex = (lbIndex + d + lbImages.length) % lbImages.length;
    renderLightbox();
  };

  const renderLightbox = () => {
    const img = $('#lightboxImg');
    const cap = $('#lightboxCaption');
    const cur = lbImages[lbIndex];
    if (img && cur) img.src = cur.src;
    if (cap) cap.textContent = `${String(lbIndex + 1).padStart(2, '0')} / ${String(lbImages.length).padStart(2, '0')}${cur.caption ? ' — ' + cur.caption : ''}`;
  };

  // ============================================================
  // INDEX PAGE
  // ============================================================

  const renderIndex = async (profile, projects, experience, skills, education) => {
    // Title + meta
    document.title = `${profile.name} — ${profile.title || 'Portfolio'}`;
    profile.initials = initialsOf(profile.name);
    profile.figCaption = `PORTRAIT / ${profile.name.toUpperCase()}`;
    profile.description = profile.shortBio || profile.bio || '';
    applyBindings(profile);

    // ---- Hero name (split into rows + reveal-word) ----
    const nameEl = $('#heroName');
    if (nameEl) {
      const parts = profile.name.trim().split(/\s+/);
      // 1-word names: one row; 2: first / last; 3+: first / rest joined
      const rows = parts.length === 1
        ? [parts[0]]
        : [parts[0], parts.slice(1).join(' ')];
      nameEl.innerHTML = rows.map((w) =>
        `<span class="hero__name-row"><span class="reveal-word">${escapeHTML(w)}</span></span>`
      ).join('');
    }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      $('#heroName')?.classList.add('is-revealed');
      $('#heroRule')?.classList.add('is-revealed');
      $('#heroTagline')?.classList.add('is-revealed');
      $('#heroCtas')?.classList.add('is-revealed');
      $('.hero')?.classList.add('is-revealed');
    }));

    // ---- Cycling tagline ----
    const cycleEl = $('#taglineCycle');
    const list = (profile.taglines && profile.taglines.length) ? profile.taglines : [profile.tagline].filter(Boolean);
    if (cycleEl && list.length) {
      cycleEl.textContent = list[0];
      if (list.length > 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        let i = 0;
        setInterval(() => {
          cycleEl.classList.add('is-out');
          setTimeout(() => {
            i = (i + 1) % list.length;
            cycleEl.textContent = list[i];
            cycleEl.classList.remove('is-out');
          }, 320);
        }, 3400);
      }
    }

    // ---- Stats ----
    const statsEl = $('#aboutStats');
    if (statsEl && profile.stats?.length) {
      statsEl.innerHTML = profile.stats.map((s) => `
        <div class="stat">
          <dt class="mono">${escapeHTML(s.label)}</dt>
          <dd>${escapeHTML(s.value)}</dd>
        </div>
      `).join('');
    }

    // ---- Skills ----
    const skillsEl = $('#skillsGrid');
    if (skillsEl) {
      const groups = Object.entries(skills);
      const ICONS = {
        'cad-design':              '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 12l9 4 9-4"/><path d="M3 17l9 4 9-4"/></svg>',
        'simulation-analysis':     '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16v16H4z"/><path d="M4 9h16M9 4v16"/><circle cx="14" cy="14" r="2"/></svg>',
        'programming':             '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 18l5-12 4 8 3-4 4 8"/><circle cx="9" cy="6" r="1"/></svg>',
        'manufacturing-workshop':  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4v4M12 16v4M4 12h4M16 12h4"/></svg>',
        'lab-instrumentation':     '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 3v6L4 20a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-11V3"/><line x1="9" y1="3" x2="15" y2="3"/></svg>',
        'other':                   '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="11" r="2.5"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><path d="M14 20c0-2 1.5-3.5 3-3.5s3 1.5 3 3.5"/></svg>',
      };
      skillsEl.innerHTML = groups.map(([title, items]) => {
        const key = slug(title);
        const icon = ICONS[key] || ICONS['other'];
        return `<article class="skill-group reveal">
          <header>
            <span class="skill-group__icon" aria-hidden="true">${icon}</span>
            <h3>${escapeHTML(title)}</h3>
            <span class="skill-group__count mono">${String(items.length).padStart(2, '0')}</span>
          </header>
          <ul class="skill-list">
            ${items.map((s) => `<li>${escapeHTML(s)}</li>`).join('')}
          </ul>
        </article>`;
      }).join('');
      // newly added reveals: observe them
      $$('#skillsGrid .reveal').forEach((el) => {
        new IntersectionObserver((entries, obs) => {
          entries.forEach((e) => {
            if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target); }
          });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }).observe(el);
      });
    }

    // ---- Filter ----
    renderFilter(projects);

    // ---- Cards ----
    renderCards(projects);
    wireCardClicks(projects);

    // ---- Experience ----
    const expEl = $('#experienceTimeline');
    if (expEl && experience?.length) {
      expEl.innerHTML = `
        <div class="timeline__group reveal">
          <ol class="timeline__list">
            ${experience.map((x) => `
              <li class="timeline__item">
                <span class="timeline__date mono">${escapeHTML(x.start)} — ${escapeHTML(x.end)}</span>
                <div class="timeline__body">
                  <h4>${escapeHTML(x.role)} <span class="timeline__sub">— ${escapeHTML(x.company)}${x.type ? ` · ${escapeHTML(x.type)}` : ''}</span></h4>
                  ${(x.bullets || []).map((b) => `<p>${escapeHTML(b)}</p>`).join('')}
                  ${(x.tools && x.tools.length) ? `<ul class="pills pills--inline">${x.tools.map((t) => `<li class="pill">${escapeHTML(t)}</li>`).join('')}</ul>` : ''}
                </div>
              </li>
            `).join('')}
          </ol>
        </div>
      `;
      // observe the new reveal
      const newReveal = expEl.querySelector('.reveal');
      if (newReveal) new IntersectionObserver((entries, obs) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target); }});
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }).observe(newReveal);
    }

    // ---- Resume embed ----
    const resumeEl = $('#resumeEmbed');
    if (resumeEl && profile.resume) {
      // Try a HEAD probe; if it fails we'll show the fallback note
      try {
        const r = await fetch(profile.resume, { method: 'HEAD' });
        if (r.ok) {
          resumeEl.innerHTML = `<iframe class="resume__pdf" src="${escapeAttr(profile.resume)}#view=FitH&toolbar=0" title="Resume PDF" loading="lazy"></iframe>`;
        } else throw new Error('not ok');
      } catch (e) {
        resumeEl.innerHTML = `<div class="resume__missing mono">Resume PDF not yet available. The download button above will work once <code>${escapeHTML(profile.resume)}</code> is in place.</div>`;
      }
    }

    // ---- Contact links ----
    const cl = $('#contactLinks');
    if (cl) {
      const items = [];
      if (profile.email)    items.push({ label: 'EMAIL',    value: profile.email,    href: `mailto:${profile.email}` });
      if (profile.linkedin) items.push({ label: 'LINKEDIN', value: profile.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\//, '/'), href: profile.linkedin });
      if (profile.github)   items.push({ label: 'GITHUB',   value: profile.github.replace(/^https?:\/\/(www\.)?github\.com\//, '@'), href: profile.github });
      if (profile.phone)    items.push({ label: 'PHONE',    value: profile.phone,    href: `tel:${profile.phone.replace(/[^+\d]/g, '')}` });
      cl.innerHTML = items.map((it) => `
        <li><a href="${escapeAttr(it.href)}" class="contact__link"${it.href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>
          <span class="contact__link-label mono">${escapeHTML(it.label)}</span>
          <span class="contact__link-value">${escapeHTML(it.value)}</span>
          <span class="contact__link-arrow" aria-hidden="true">↗</span>
        </a></li>
      `).join('');
    }

    // ---- Nav active-section ----
    const navObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = e.target.id;
        $$('.nav__links a[data-nav]').forEach((a) => a.classList.toggle('is-active', a.dataset.nav === id));
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    $$('section[data-section]').forEach((s) => navObs.observe(s));
  };

  // ---- Render filter buttons from categories actually present ----
  const renderFilter = (projects) => {
    const filterEl = $('#filterEl');
    if (!filterEl) return;
    // gather categories preserving the order they appear in projects.json
    const seen = new Set();
    const cats = [];
    projects.forEach((p) => {
      if (p.category && !seen.has(p.category)) { seen.add(p.category); cats.push(p.category); }
    });
    const buttons = [
      '<button class="filter__btn is-active" data-filter="all" role="tab" aria-selected="true">All</button>'
    ].concat(cats.map((c) =>
      `<button class="filter__btn" data-filter="${escapeAttr(c)}" role="tab" aria-selected="false">${escapeHTML(c)}</button>`
    ));
    // Insert AFTER the pill element
    const pill = filterEl.querySelector('.filter__pill');
    filterEl.innerHTML = '';
    if (pill) filterEl.appendChild(pill); else filterEl.appendChild(document.createElement('span'));
    buttons.forEach((b) => { const tpl = document.createElement('template'); tpl.innerHTML = b; filterEl.appendChild(tpl.content.firstChild); });

    const btns = $$('.filter__btn', filterEl);
    const movePill = (btn) => {
      const p = filterEl.querySelector('.filter__pill');
      if (!btn || !p) return;
      const fR = filterEl.getBoundingClientRect();
      const bR = btn.getBoundingClientRect();
      p.style.width = bR.width + 'px';
      p.style.transform = `translateX(${bR.left - fR.left - 4}px)`;
    };
    btns.forEach((b) => {
      b.addEventListener('click', () => {
        btns.forEach((x) => {
          x.classList.toggle('is-active', x === b);
          x.setAttribute('aria-selected', x === b ? 'true' : 'false');
        });
        movePill(b);
        const f = b.dataset.filter;
        $$('.card').forEach((c) => {
          c.classList.toggle('is-hidden', !(f === 'all' || c.dataset.cat === f));
        });
      });
    });
    requestAnimationFrame(() => movePill(filterEl.querySelector('.filter__btn.is-active')));
    window.addEventListener('resize', () => movePill(filterEl.querySelector('.filter__btn.is-active')));
    if (document.fonts?.ready) document.fonts.ready.then(() => movePill(filterEl.querySelector('.filter__btn.is-active')));
  };

  // ---- Render cards ----
  const renderCards = (projects) => {
    const cardsEl = $('#projectCards');
    if (!cardsEl) return;
    cardsEl.innerHTML = projects.map((p, i) => {
      const hasCover = p.cover || (p.images && p.images[0]);
      const cover = hasCover ? `<img src="${escapeAttr(p.cover || p.images[0])}" alt="${escapeAttr(p.title)} cover" loading="lazy"/>` : placeholderFor(p);
      const tools = (p.tools || p.tags || []).slice(0, 4);
      return `<a class="card" href="project.html?id=${encodeURIComponent(p.id)}" data-cat="${escapeAttr(p.category || '')}" data-id="${escapeAttr(p.id)}" aria-label="${escapeAttr(p.title)} — view details">
        <div class="card__media">
          <span class="card__badge mono">PRJ.${String(i + 1).padStart(2, '0')}</span>
          <span class="card__cat mono">${escapeHTML(p.category || 'Project')}</span>
          ${cover}
          <span class="card__overlay">
            <span class="card__overlay-label mono">CLICK TO EXPLORE →</span>
          </span>
        </div>
        <div class="card__body">
          <h3 class="card__title">${escapeHTML(p.title)}</h3>
          <p class="card__desc">${escapeHTML(p.summary || '')}</p>
          <ul class="card__tags">
            ${tools.map((t) => `<li class="card__tag">${escapeHTML(t)}</li>`).join('')}
          </ul>
          <span class="card__cta mono">View Details</span>
        </div>
      </a>`;
    }).join('');
  };

  // ---- View Transitions wrapper for card click ----
  const wireCardClicks = (projects) => {
    const cardsEl = $('#projectCards');
    if (!cardsEl) return;
    cardsEl.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (!card) return;
      // brief exit animation
      if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        e.preventDefault();
        const href = card.getAttribute('href');
        card.classList.add('is-leaving');
        document.startViewTransition(() => { window.location.href = href; });
      }
      // else: default link navigation
    });
  };

  // ============================================================
  // PROJECT DETAIL PAGE
  // ============================================================

  const renderDetail = (profile, projects) => {
    profile.initials = initialsOf(profile.name);
    profile.description = profile.shortBio || profile.bio || '';
    applyBindings(profile);

    const main = $('#detailMain');
    if (!main) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const project = projects.find((p) => p.id === id);

    if (!project) {
      document.title = `Project not found — ${profile.name}`;
      main.innerHTML = `
        <section class="section detail-missing">
          <div class="container">
            <span class="mono section__num">404</span>
            <h1 class="contact__big">Project not found.</h1>
            <p>That project ID doesn't match anything in <code>data/projects.json</code>.</p>
            <a class="btn btn--solid" href="index.html"><span class="btn__label">← Back to Projects</span></a>
          </div>
        </section>
      `;
      main.removeAttribute('aria-busy');
      return;
    }

    document.title = `${project.title} — ${profile.name}`;
    const md = $('meta[data-bind="description"]');
    if (md) md.setAttribute('content', project.summary || project.description?.slice(0, 160) || '');

    main.innerHTML = renderDetailHTML(project, projects);
    main.removeAttribute('aria-busy');

    // Wire lightbox gallery
    const gallery = $('#detailGallery');
    if (gallery) {
      gallery.addEventListener('click', (e) => {
        const item = e.target.closest('.gallery__item');
        if (!item) return;
        const items = $$('.gallery__item', gallery);
        const idx = items.indexOf(item);
        const images = items.map((el) => ({
          src: el.dataset.src || el.querySelector('img')?.src,
          caption: el.dataset.caption || ''
        })).filter((x) => x.src);
        if (!images.length) return; // placeholders only, no lightbox
        openLightbox(images, Math.max(0, items.findIndex((el) => el.dataset.src) === -1 ? 0 : idx));
      });
    }

    // Staggered intro for sections
    requestAnimationFrame(() => {
      $$('.detail__section').forEach((s, i) => {
        s.style.transitionDelay = `${i * 100}ms`;
        requestAnimationFrame(() => s.classList.add('is-in'));
      });
    });

    // Back link uses history if possible
    const back = $('#backLink');
    if (back) {
      back.addEventListener('click', (e) => {
        if (document.referrer && document.referrer.includes(window.location.host)) {
          e.preventDefault();
          if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.startViewTransition(() => history.back());
          } else { history.back(); }
        }
      });
    }

    // Top link
    const top = $('#topLink');
    if (top) top.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

    // Active reveals for sections within main
    $$('.detail__section').forEach((el) => el.classList.add('reveal'));
  };

  const renderDetailHTML = (p, allProjects) => {
    const cover = p.cover || (p.images && p.images[0]);
    const coverHTML = cover
      ? `<img src="${escapeAttr(cover)}" alt="${escapeAttr(p.title)}"/>`
      : placeholderFor(p);

    const heroBlock = `
      <header class="detail__hero detail__section">
        <div class="detail__hero-media">${coverHTML}</div>
        <div class="container detail__hero-body">
          <div class="detail__meta mono">
            <span>${escapeHTML(p.category || '')}${p.subcategory ? ` / ${escapeHTML(p.subcategory)}` : ''}</span>
            <span>${escapeHTML(p.dateRange || p.year || '')}</span>
          </div>
          <h1 class="detail__title">${escapeHTML(p.title)}</h1>
          ${p.summary ? `<p class="detail__lede">${escapeHTML(p.summary)}</p>` : ''}
          ${(p.tags && p.tags.length) ? `<ul class="pills pills--inline">${p.tags.map((t) => `<li class="pill">${escapeHTML(t)}</li>`).join('')}</ul>` : ''}
        </div>
      </header>
    `;

    // Quick-strip stats row (4 max)
    const strip = [];
    if (p.role)     strip.push({ label: 'Role',      value: p.role });
    if (p.team)     strip.push({ label: 'Team',      value: p.team });
    if (p.client)   strip.push({ label: 'Client',    value: p.client });
    if (p.course)   strip.push({ label: 'Course',    value: p.course });
    if (p.year && strip.length < 4) strip.push({ label: 'Year', value: p.dateRange || p.year });
    if (p.advisors && strip.length < 4) strip.push({ label: 'Advisors', value: p.advisors });

    const stripBlock = strip.length ? `
      <section class="detail__section detail__strip">
        <div class="container">
          <dl class="strip__grid" style="--cols:${strip.length}">
            ${strip.map((s) => `<div class="strip__item"><dt class="mono">${escapeHTML(s.label)}</dt><dd>${escapeHTML(s.value)}</dd></div>`).join('')}
          </dl>
        </div>
      </section>
    ` : '';

    const descBlock = p.description ? `
      <section class="detail__section detail__desc">
        <div class="container container--narrow">
          <div class="desc__body">
            ${p.description.split('\n\n').map((para) => {
              if (para.startsWith('## ')) return `<h3>${escapeHTML(para.slice(3))}</h3>`;
              return `<p>${escapeHTML(para)}</p>`;
            }).join('')}
          </div>
        </div>
      </section>
    ` : '';

    const highlightsBlock = (p.highlights && p.highlights.length) ? `
      <section class="detail__section detail__highlights">
        <div class="container">
          <h2 class="section__title section__title--inline"><span class="section__title-lead mono">/ </span>Key Outcomes</h2>
          <ol class="highlights">
            ${p.highlights.map((h, i) => `
              <li class="highlight">
                <span class="highlight__num mono">${String(i + 1).padStart(2, '0')}</span>
                <p class="highlight__body">${escapeHTML(h)}</p>
              </li>
            `).join('')}
          </ol>
        </div>
      </section>
    ` : '';

    const toolsBlock = (p.tools && p.tools.length) ? `
      <section class="detail__section detail__tools">
        <div class="container">
          <h2 class="section__title section__title--inline"><span class="section__title-lead mono">/ </span>Tools &amp; Methods</h2>
          <ul class="pills pills--lg">
            ${p.tools.map((t) => `<li class="pill">${escapeHTML(t)}</li>`).join('')}
          </ul>
        </div>
      </section>
    ` : '';

    // Gallery — if user provided images, use those; otherwise three labelled placeholder tiles
    const galleryItems = (p.images && p.images.length)
      ? p.images.map((src, i) => `<a class="gallery__item" data-src="${escapeAttr(src)}" data-caption="${escapeAttr(p.title)} — ${i + 1}"><img src="${escapeAttr(src)}" alt="${escapeAttr(p.title)} — image ${i + 1}" loading="lazy"/></a>`).join('')
      : ['CAD MODEL', 'ANALYSIS', 'DOCUMENTATION'].map((l, i) => `<div class="gallery__item gallery__item--placeholder">${galleryPlaceholder(i, l)}</div>`).join('');

    const galleryBlock = `
      <section class="detail__section detail__gallery">
        <div class="container">
          <h2 class="section__title section__title--inline"><span class="section__title-lead mono">/ </span>Documentation</h2>
          <div class="gallery" id="detailGallery">${galleryItems}</div>
        </div>
      </section>
    `;

    const pdfBlock = p.pdf ? `
      <section class="detail__section detail__pdf">
        <div class="container">
          <div class="pdf__head">
            <h2 class="section__title section__title--inline"><span class="section__title-lead mono">/ </span>Read the Report</h2>
            <a class="btn btn--ghost" href="${escapeAttr(p.pdf)}" target="_blank" rel="noopener" download>
              <span class="btn__label">Open / Download</span>
              <span class="btn__icon" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="14" height="14"><path d="M8 1v10M3 7l5 5 5-5M1 15h14" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
              </span>
            </a>
          </div>
          <div class="pdf__frame">
            <iframe src="${escapeAttr(p.pdf)}#view=FitH&toolbar=1" title="${escapeAttr(p.title)} report" loading="lazy"></iframe>
          </div>
        </div>
      </section>
    ` : '';

    const linksBlock = (p.links && Object.keys(p.links).filter((k) => p.links[k]).length) ? `
      <section class="detail__section detail__links">
        <div class="container">
          <h2 class="section__title section__title--inline"><span class="section__title-lead mono">/ </span>References</h2>
          <ul class="mp__links">
            ${Object.entries(p.links).filter(([_, v]) => v).map(([k, v]) => {
              const label = k.charAt(0).toUpperCase() + k.slice(1);
              const isFile = String(v).startsWith('data/');
              return `<a class="mp__link" href="${escapeAttr(v)}"${isFile ? '' : ' target="_blank" rel="noopener"'}>${escapeHTML(label)} ${isFile ? '↓' : '↗'}</a>`;
            }).join('')}
          </ul>
        </div>
      </section>
    ` : '';

    // Related: same category first, then others — up to 3 total
    const related = []
      .concat(allProjects.filter((x) => x.id !== p.id && x.category === p.category))
      .concat(allProjects.filter((x) => x.id !== p.id && x.category !== p.category))
      .slice(0, 3);

    const relatedBlock = related.length ? `
      <section class="detail__section detail__related">
        <div class="container">
          <h2 class="section__title section__title--inline"><span class="section__title-lead mono">/ </span>More Projects</h2>
          <div class="cards cards--related">
            ${related.map((r, i) => {
              const c = r.cover || (r.images && r.images[0]);
              const cov = c ? `<img src="${escapeAttr(c)}" alt="${escapeAttr(r.title)} cover" loading="lazy"/>` : placeholderFor(r);
              return `<a class="card" href="project.html?id=${encodeURIComponent(r.id)}">
                <div class="card__media">
                  <span class="card__badge mono">PRJ.${String(allProjects.indexOf(r) + 1).padStart(2, '0')}</span>
                  <span class="card__cat mono">${escapeHTML(r.category || '')}</span>
                  ${cov}
                  <span class="card__overlay"><span class="card__overlay-label mono">CLICK TO EXPLORE →</span></span>
                </div>
                <div class="card__body">
                  <h3 class="card__title">${escapeHTML(r.title)}</h3>
                  <p class="card__desc">${escapeHTML(r.summary || '')}</p>
                </div>
              </a>`;
            }).join('')}
          </div>
        </div>
      </section>
    ` : '';

    return heroBlock + stripBlock + descBlock + highlightsBlock + toolsBlock + galleryBlock + pdfBlock + linksBlock + relatedBlock;
  };

  // ============================================================
  // BOOT
  // ============================================================

  const boot = async () => {
    const isDetail = !!$('#detailMain');
    const isIndex = !!$('#projectCards');

    try {
      const [profile, projects, experience, skills, education] = await Promise.all([
        fetchJSON('data/profile.json'),
        fetchJSON('data/projects.json'),
        fetchJSON('data/experience.json').catch(() => []),
        fetchJSON('data/skills.json').catch(() => ({})),
        fetchJSON('data/education.json').catch(() => ({})),
      ]);

      initShared(profile);

      if (isIndex) await renderIndex(profile, projects, experience, skills, education);
      else if (isDetail) renderDetail(profile, projects);
    } catch (err) {
      console.error('[portfolio] load failed', err);
      // friendly fallback for file:// access
      const main = $('#detailMain') || $('main');
      if (main) {
        const note = document.createElement('div');
        note.style.cssText = 'padding:3rem 1.5rem;max-width:560px;margin:6rem auto 0;font-family:ui-monospace,monospace;font-size:0.85rem;line-height:1.6;border:1px dashed #cfc8b8;border-radius:4px;color:#3a352f;background:#f2efe8';
        note.innerHTML = `Couldn't load site data.<br/><br/>If you opened this file directly (file://), run a local server:<br/><br/><code style="display:inline-block;padding:0.3rem 0.5rem;background:#ECE7DC">python3 -m http.server 8000</code><br/><br/>Then visit <code>http://localhost:8000</code>.`;
        main.appendChild(note);
        main.removeAttribute('aria-busy');
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
