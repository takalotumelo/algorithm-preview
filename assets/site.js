(function () {
  'use strict';
  var doc = document;

  // Desktop dropdowns + mobile menu
  var menus = Array.prototype.slice.call(doc.querySelectorAll('[data-menu-btn]'));
  function closeAll(except) {
    menus.forEach(function (b) {
      if (b !== except) { b.setAttribute('aria-expanded', 'false'); var m = doc.getElementById(b.getAttribute('aria-controls')); if (m) m.hidden = true; }
    });
  }
  menus.forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = b.getAttribute('aria-expanded') === 'true';
      closeAll(b);
      b.setAttribute('aria-expanded', String(!open));
      var m = doc.getElementById(b.getAttribute('aria-controls'));
      if (m) m.hidden = open;
    });
  });
  doc.addEventListener('click', function (e) { if (!e.target.closest || !e.target.closest('.nav')) closeAll(); });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var openBtn = menus.filter(function (b) { return b.getAttribute('aria-expanded') === 'true'; })[0];
      closeAll(); if (openBtn) openBtn.focus();
      if (burger && burger.getAttribute('aria-expanded') === 'true') toggleMobile(false);
    }
  });
  var burger = doc.querySelector('[data-burger]');
  var navWrap = doc.getElementById('site-nav');
  var mq = window.matchMedia('(max-width:819px)');
  function toggleMobile(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navWrap.hidden = !open;
    doc.body.style.overflow = open ? 'hidden' : ''; doc.documentElement.classList.toggle('menu-open', open); var mb = doc.querySelector('[data-mbar]'); if (mb && open) mb.classList.remove('show');
  }
  function syncMq() { if (!navWrap) return; if (mq.matches) { navWrap.hidden = burger.getAttribute('aria-expanded') !== 'true'; } else { navWrap.hidden = false; doc.body.style.overflow = ''; } }
  if (burger && navWrap) {
    burger.addEventListener('click', function () { toggleMobile(burger.getAttribute('aria-expanded') !== 'true'); });
    if (mq.addEventListener) mq.addEventListener('change', syncMq); else if (mq.addListener) mq.addListener(syncMq);
    syncMq();
  }

  // Hero line: cycles Algorithm's own "Turn X into Y" lines
  var rot = doc.querySelector('[data-rotator]');
  if (rot && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var pairs; try { pairs = JSON.parse(rot.getAttribute('data-rotator')); } catch (e) { pairs = []; }
    var i = 0, from = rot.querySelector('[data-from]'), to = rot.querySelector('[data-to]');
    if (pairs.length && from && to) setInterval(function () { i = (i + 1) % pairs.length; from.textContent = pairs[i][0]; to.textContent = pairs[i][1]; }, 2800);
  }

  // Enquiry form: validation; real submission on Netlify, simulated in preview
  var form = doc.querySelector('form[data-enquiry]');
  if (form) {
    form.setAttribute('novalidate', '');
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      Array.prototype.forEach.call(form.querySelectorAll('[required]'), function (el) {
        var f = el.closest('.field'); var valid = el.checkValidity() && el.value.trim() !== '';
        if (f) f.classList.toggle('invalid', !valid);
        el.setAttribute('aria-invalid', String(!valid));
        if (!valid && !first) first = el;
        if (!valid) ok = false;
      });
      if (!ok) { e.preventDefault(); first.focus(); return; }
      var done = function () { form.hidden = true; var s = doc.getElementById('form-success'); if (s) { s.hidden = false; s.focus(); } };
      var errBox = doc.getElementById('form-error'); if (errBox) errBox.hidden = true;
      var live = /algorithm\.agency$|netlify\.app$|pages\.dev$|github\.io$/.test(location.hostname);
      if (!live) { e.preventDefault(); done(); return; }
      // Cloudflare build: send to Formspree in the background and stay on the page
      if (form.hasAttribute('data-ajax') && window.fetch) {
        e.preventDefault();
        var btn = form.querySelector('[type="submit"]'); if (btn) { btn.disabled = true; btn.setAttribute('aria-busy', 'true'); }
        fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
          .then(function (r) { if (!r.ok) throw new Error(r.status); done(); })
          .catch(function () { if (errBox) { errBox.hidden = false; errBox.focus && errBox.focus(); } })
          .then(function () { if (btn) { btn.disabled = false; btn.removeAttribute('aria-busy'); } });
      }
    });
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero network: drifting nodes that link up, echoing the geometric mark in Algorithm's logo
  Array.prototype.forEach.call(doc.querySelectorAll('canvas.hero-net'), function (cv) {
    var ctx = cv.getContext('2d'); if (!ctx) return;
    var seed = +cv.getAttribute('data-seed') || 1;
    function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    var nodes = [], W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), visible = true, raf = 0, ptr = null;
    function size() {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.max(24, Math.min(90, Math.round(W * H / 15000)));
      nodes = [];
      for (var i = 0; i < n; i++) nodes.push({ x: rnd() * W, y: rnd() * H, vx: (rnd() - .5) * .25, vy: (rnd() - .5) * .25, r: rnd() < .12 ? 2.6 : 1.4 });
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      var L = Math.min(170, Math.max(110, W / 9));
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        if (!reduce) { a.x += a.vx; a.y += a.vy; if (a.x < 0 || a.x > W) a.vx *= -1; if (a.y < 0 || a.y > H) a.vy *= -1; }
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < L) { ctx.strokeStyle = 'rgba(79,140,255,' + (0.42 * (1 - d / L)).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
        if (ptr) { var px = a.x - ptr.x, py = a.y - ptr.y, pd = Math.sqrt(px * px + py * py); if (pd < 200) { ctx.strokeStyle = 'rgba(0,224,160,' + (0.5 * (1 - pd / 200)).toFixed(3) + ')'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(ptr.x, ptr.y); ctx.stroke(); } }
        ctx.fillStyle = a.r > 2 ? '#00E0A0' : '#00A9D9';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
      if (!reduce && visible) raf = requestAnimationFrame(frame);
    }
    size(); frame();
    window.addEventListener('resize', function () { size(); if (reduce || !visible) frame(); });
    var host = cv.parentElement;
    host.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); ptr = { x: e.clientX - r.left, y: e.clientY - r.top }; });
    host.addEventListener('pointerleave', function () { ptr = null; });
    if ('IntersectionObserver' in window && !reduce) {
      new IntersectionObserver(function (es) { es.forEach(function (en) { var was = visible; visible = en.isIntersecting; if (visible && !was) { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); } }); }).observe(cv);
    }
    doc.addEventListener('visibilitychange', function () { visible = !doc.hidden; if (visible && !reduce) { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); } });
  });

  // Count-up numbers and the engine line, only for things that start below the fold
  if ('IntersectionObserver' in window && !reduce) {
    var below = function (el) { return el.getBoundingClientRect().top > window.innerHeight; };
    var counters = Array.prototype.filter.call(doc.querySelectorAll('[data-count]'), below);
    var lines = Array.prototype.filter.call(doc.querySelectorAll('.steps.draw'), below);
    counters.forEach(function (el) { el.textContent = '0' + el.getAttribute('data-suffix'); });
    lines.forEach(function (el) { el.classList.add('armed'); });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return; var el = en.target; io.unobserve(el);
        if (el.classList.contains('steps')) { el.classList.add('in'); return; }
        var end = +el.getAttribute('data-count'), suf = el.getAttribute('data-suffix'), t0 = performance.now();
        (function tick(t) { var p = Math.min(1, (t - t0) / 1100), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e) + suf; if (p < 1) requestAnimationFrame(tick); })(t0);
      });
    }, { threshold: 0.4 });
    counters.concat(lines).forEach(function (el) { io.observe(el); });
  }
})();

/* Motion layer: reveal on scroll, crystal parallax and entrance, header state, reading progress, spotlight */
(function () {
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var head = doc.querySelector('.site-head');

  // reading progress + compact header
  var bar = doc.createElement('div'); bar.className = 'progress'; bar.setAttribute('aria-hidden', 'true');
  if (head) head.appendChild(bar);
  var ticking = false;
  function onScroll() {
    var y = window.scrollY, max = Math.max(1, root.scrollHeight - window.innerHeight);
    root.style.setProperty('--read', (y / max).toFixed(4));
    root.style.setProperty('--sy', Math.min(y, 1200).toFixed(0));
    if (head) head.classList.toggle('scrolled', y > 24);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  if (reduce) return;
  root.classList.add('motion');

  // reveal: only things that start below the fold, staggered within their group
  if ('IntersectionObserver' in window) {
    var sel = '.sec-head,.cards > *,.pillar,.stat,.steps li,.tbl-box,.quote,.faq details,.years > *,.box,.split > div,.chips-row,.related .wrap,.cta-panel,.posts > *,.offices > *,.prose .body';
    var items = Array.prototype.filter.call(doc.querySelectorAll(sel), function (el) { return el.getBoundingClientRect().top > window.innerHeight * 0.95; });
    items.forEach(function (el) {
      var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty('--d', (Math.min(sib, 6) * 70) + 'ms'); el.classList.add('rv');
    });
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); ro.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { ro.observe(el); });
    // numbered pillars light up as they reach the reading line
    var po = new IntersectionObserver(function (es) {
      es.forEach(function (en) { en.target.classList.toggle('on', en.isIntersecting); });
    }, { rootMargin: '-35% 0px -45% 0px' });
    doc.querySelectorAll('.pillar').forEach(function (el) { po.observe(el); });
  }

  // crystal: draws in on load, then follows the pointer a little
  var cr = doc.querySelector('.hero .crystal');
  if (cr) {
    cr.classList.add('enter');
    var hero = cr.closest('.hero');
    if (window.matchMedia('(pointer:fine)').matches && hero) {
      var tx = 0, ty = 0, cx = 0, cy = 0, run = false;
      function loop() { cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06; cr.style.setProperty('--mx', cx.toFixed(3)); cr.style.setProperty('--my', cy.toFixed(3)); if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) requestAnimationFrame(loop); else run = false; }
      hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5; if (!run) { run = true; requestAnimationFrame(loop); } });
      hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; if (!run) { run = true; requestAnimationFrame(loop); } });
    }
  }

  // spotlight that follows the pointer on dark panels
  if (window.matchMedia('(pointer:fine)').matches) {
    doc.querySelectorAll('.ink,.cta-panel').forEach(function (el) {
      el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); el.style.setProperty('--px', (e.clientX - r.left) + 'px'); el.style.setProperty('--py', (e.clientY - r.top) + 'px'); el.classList.add('lit'); });
      el.addEventListener('pointerleave', function () { el.classList.remove('lit'); });
    });
  }
})();

/* Performance Engine visual: cycle the channel highlight */
(function () {
  var v = document.querySelector('.engine-viz'); if (!v || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var tabs = v.querySelectorAll('.ev-tabs i'), rows = v.querySelectorAll('.ev-bars div'), i = 0;
  setInterval(function () {
    if (document.hidden) return;
    tabs[i].classList.remove('on'); rows[i].classList.remove('on');
    i = (i + 1) % tabs.length;
    tabs[i].classList.add('on'); rows[i].classList.add('on');
  }, 2400);
})();

/* Article rail: highlight the section being read */
(function () {
  var links = document.querySelectorAll('.article-rail a'); if (!links.length || !('IntersectionObserver' in window)) return;
  var map = {}; links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { links.forEach(function (l) { l.classList.remove('on'); }); var a = map[en.target.id]; if (a) a.classList.add('on'); } });
  }, { rootMargin: '-20% 0px -70% 0px' });
  Object.keys(map).forEach(function (id) { var h = document.getElementById(id); if (h) io.observe(h); });
})();

/* ===== UX layer: search, sub-navigation, blog topics, mobile bar, back to top ===== */
(function () {
  var doc = document, root = doc.documentElement;
  var R = root.getAttribute('data-root');               // set only in the preview build
  function href(p) { return R == null ? p : R + (p === '/' ? '/index.html' : p + '/index.html'); }
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  // --- site search (⌘K, Ctrl+K or "/")
  var dlg = doc.getElementById('site-search');
  if (dlg && typeof dlg.showModal === 'function') {
    var input = dlg.querySelector('input'), list = dlg.querySelector('.sd-res'), hint = dlg.querySelector('[data-sd-hint]'), data = null, last = null;
    function load() {
      if (data) return Promise.resolve(data);
      return fetch((R == null ? '' : R) + '/assets/search.json').then(function (r) { return r.json(); }).then(function (j) { data = j; return j; }).catch(function () { data = []; return data; });
    }
    function open() { last = doc.activeElement; dlg.showModal(); input.value = ''; render(''); input.focus(); load(); }
    function close() { dlg.close(); }
    dlg.addEventListener('close', function () { if (last && last.focus) last.focus(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
    doc.querySelectorAll('[data-search-open]').forEach(function (b) { b.addEventListener('click', open); });
    doc.querySelectorAll('[data-search-close]').forEach(function (b) { b.addEventListener('click', close); });
    doc.addEventListener('keydown', function (e) {
      var t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); dlg.open ? close() : open(); }
      else if (e.key === '/' && !typing && !dlg.open) { e.preventDefault(); open(); }
    });
    function score(it, terms) {
      var t = it.t.toLowerCase(), d = (it.d || '').toLowerCase(), s = 0;
      for (var i = 0; i < terms.length; i++) {
        var w = terms[i], ti = t.indexOf(w);
        if (ti === -1 && d.indexOf(w) === -1) return 0;
        s += ti === 0 ? 12 : ti > 0 ? 8 : 2;
      }
      if (it.s !== 'Article') s += 3;
      return s;
    }
    function mark(text, terms) {
      var out = esc(text);
      terms.forEach(function (w) { if (w.length > 1) out = out.replace(new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); });
      return out;
    }
    function render(q) {
      var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      hint.hidden = terms.length > 0;
      if (!terms.length) { list.innerHTML = ''; return; }
      load().then(function (all) {
        var hits = all.map(function (it) { return [score(it, terms), it]; }).filter(function (x) { return x[0] > 0; })
          .sort(function (a, b) { return b[0] - a[0]; }).slice(0, 9);
        list.innerHTML = hits.length ? hits.map(function (x) {
          var it = x[1];
          return '<li><a href="' + esc(href(it.u)) + '"><span class="s">' + esc(it.s) + '</span><span class="t">' + mark(it.t, terms) + '</span><span class="d">' + mark(it.d || '', terms) + '</span></a></li>';
        }).join('') : '<li class="sd-empty">No results for “' + esc(q) + '”. Try SEO, GEO, paid media or Lighthouse.</li>';
      });
    }
    input.addEventListener('input', function () { render(input.value.trim()); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      var links = Array.prototype.slice.call(list.querySelectorAll('a')); if (!links.length) return;
      e.preventDefault();
      var i = links.indexOf(doc.activeElement);
      var n = e.key === 'ArrowDown' ? (i < 0 ? 0 : Math.min(i + 1, links.length - 1)) : (i <= 0 ? -1 : i - 1);
      (n < 0 ? input : links[n]).focus();
    });
  }

  // --- sticky sub-navigation: highlight the section in view
  var sub = doc.querySelectorAll('.subnav a');
  if (sub.length && 'IntersectionObserver' in window) {
    var byId = {}; sub.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        sub.forEach(function (a) { a.classList.remove('on'); });
        var a = byId[en.target.id]; if (a) { a.classList.add('on'); var ol = a.closest('ol'); if (ol) ol.scrollTo({ left: a.parentElement.offsetLeft - 24, behavior: 'smooth' }); }
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    Object.keys(byId).forEach(function (id) { var s = doc.getElementById(id); if (s) sio.observe(s); });
  }

  // --- blog: topic chips + text filter + show more
  var posts = Array.prototype.slice.call(doc.querySelectorAll('[data-post]'));
  if (posts.length) {
    var q = doc.querySelector('[data-filter]'), chips = doc.querySelectorAll('[data-cat-btn]'), more = doc.querySelector('[data-more]');
    var groups = doc.querySelectorAll('[data-year]'), count = doc.querySelector('[data-post-count]'), empty = doc.querySelector('[data-empty]');
    var cat = '', limit = 24;
    function apply() {
      var v = q ? q.value.trim().toLowerCase() : '', shown = 0, total = 0, filtering = v || cat;
      posts.forEach(function (li) {
        var hit = (!cat || li.getAttribute('data-cat') === cat) && (!v || li.textContent.toLowerCase().indexOf(v) !== -1);
        if (hit) total++;
        var vis = hit && (filtering || total <= limit);
        li.hidden = !vis; li.classList.toggle('shown', vis); if (vis) shown++;
      });
      groups.forEach(function (g) { g.hidden = !g.querySelector('[data-post]:not([hidden])'); });
      if (count) count.textContent = total + (total === 1 ? ' article' : ' articles');
      if (empty) empty.hidden = total !== 0;
      if (more) more.hidden = !!filtering || shown >= total;
    }
    chips.forEach(function (b) {
      b.addEventListener('click', function () {
        cat = b.getAttribute('data-cat-btn');
        chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); });
        apply();
      });
    });
    if (q) { q.addEventListener('input', apply); }
    if (more) more.addEventListener('click', function () {
      var firstNew = null; limit += 24; apply();
      var vis = posts.filter(function (li) { return !li.hidden; }); firstNew = vis[limit - 24];
      if (firstNew) { var a = firstNew.querySelector('a'); if (a) a.focus({ preventScroll: true }); }
    });
    apply();
  }

  // --- mobile action bar + back to top
  var mbar = doc.querySelector('[data-mbar]'), top = doc.querySelector('[data-to-top]'), foot = doc.querySelector('.site-foot'), stops = [].slice.call(doc.querySelectorAll('.cta, .form, .site-foot'));
  if (mbar) mbar.hidden = false;
  if (top) { top.hidden = false; top.addEventListener('click', function () { window.scrollTo({ top: 0 }); var m = doc.getElementById('main'); if (m) m.focus({ preventScroll: true }); }); }
  var ticking = false;
  function onScroll() {
    var y = window.scrollY, vh = window.innerHeight, nearFoot = foot && foot.getBoundingClientRect().top < vh - 40;
    // the bar steps aside wherever the page already offers the same actions (CTA band, enquiry form, footer)
    var covered = stops.some(function (el) { var r = el.getBoundingClientRect(); return r.top < vh - 60 && r.bottom > 80; });
    if (mbar) mbar.classList.toggle('show', y > 560 && !covered && !root.classList.contains('menu-open'));
    if (top) top.classList.toggle('show', y > 1400 && !nearFoot);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
})();

/* Premier Partner journey: the line runs through each year, lighting the dots in turn, then a light keeps travelling */
(function () {
  var js = document.querySelectorAll('[data-journey]'); if (!js.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function layout(j) {
    var track = j.querySelector('.j-track'), nodes = j.querySelectorAll('.j-node');
    if (!track || !nodes.length) return;
    var jr = j.getBoundingClientRect(), n0 = nodes[0].getBoundingClientRect();
    var vertical0 = getComputedStyle(j.querySelector('.j-steps')).gridTemplateColumns.split(' ').length < 2;
    if (!vertical0) track.style.top = (n0.top + n0.height / 2 - jr.top - 1) + 'px'; else track.style.top = '';
    j.classList.toggle('j-vert', vertical0);
    var tr = track.getBoundingClientRect(), vertical = vertical0;
    var len = vertical ? tr.height : tr.width;
    nodes.forEach(function (n) {
      var r = n.getBoundingClientRect(), c = vertical ? (r.top + r.height / 2 - tr.top) : (r.left + r.width / 2 - tr.left);
      n.parentElement.style.setProperty('--t', Math.max(0, Math.min(1, c / len)).toFixed(3));
    });
  }
  js.forEach(function (j) {
    layout(j);
    window.addEventListener('resize', function () { layout(j); });
    if (reduce || !('IntersectionObserver' in window)) { j.classList.add('in', 'lit-all'); return; }
    j.classList.add('armed');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return; io.unobserve(j); layout(j);
        j.classList.add('in');
        setTimeout(function () { j.classList.add('looping'); }, 3600);
      });
    }, { threshold: 0.35 });
    io.observe(j);
  });
})();

/* Section bar appears only after the hero has scrolled past */
(function () {
  var bar = document.querySelector('.subnav'), hero = document.querySelector('main .hero');
  if (!bar || !hero) return;
  function upd() { bar.classList.toggle('show', hero.getBoundingClientRect().bottom < 120); }
  window.addEventListener('scroll', upd, { passive: true }); upd();
})();

/* Phones: long lists become swipe rows, pillar details and footer links fold away */
(function () {
  var doc = document, mq = window.matchMedia('(max-width: 620px)');
  var rows = [].slice.call(doc.querySelectorAll('.cards, .steps, .boxes')).filter(function (r) { return r.children.length > 1; });
  rows.forEach(function (r) {
    var dots = doc.createElement('div'); dots.className = 'swipe-dots'; dots.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < r.children.length; i++) dots.appendChild(doc.createElement('i'));
    r.parentNode.insertBefore(dots, r.nextSibling);
    var sec = r.closest('section'), h = sec && sec.querySelector('h2');
    r._label = (h ? h.textContent.trim() + ': ' : '') + 'swipe for more';
    function upd() {
      var max = r.scrollWidth - r.clientWidth, n = r.children.length, k;
      if (max <= 2) k = 0; else if (r.scrollLeft >= max - 2) k = n - 1; else k = Math.round(r.scrollLeft / (r.children[0].getBoundingClientRect().width + 16));
      for (var i = 0; i < n; i++) dots.children[i].classList.toggle('on', i === k);
    }
    r.addEventListener('scroll', function () { window.requestAnimationFrame(upd); }, { passive: true });
    r._upd = upd;
  });

  function fold(group, itemSel, headSel, bodySel, openFirst, on) {
    [].forEach.call(doc.querySelectorAll(group), function (g) {
      g.classList.toggle('acc', on);
      [].forEach.call(g.querySelectorAll(itemSel), function (it, i) {
        var head = it.querySelector(headSel), body = it.querySelector(bodySel); if (!head || !body) return;
        var btn = head.querySelector(':scope > .acc-btn');
        if (on && !btn) {
          if (!body.id) body.id = 'acc-' + Math.random().toString(36).slice(2, 8);
          btn = doc.createElement('button'); btn.type = 'button'; btn.className = 'acc-btn'; btn.setAttribute('aria-controls', body.id);
          while (head.firstChild) btn.appendChild(head.firstChild);
          var ic = doc.createElement('span'); ic.className = 'acc-ic'; ic.setAttribute('aria-hidden', 'true'); btn.appendChild(ic);
          head.appendChild(btn);
          var open = openFirst && i === 0; it.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open));
          btn.addEventListener('click', function () { var o = !it.classList.contains('open'); it.classList.toggle('open', o); btn.setAttribute('aria-expanded', String(o)); });
        } else if (!on && btn) {
          var ic2 = btn.querySelector('.acc-ic'); if (ic2) ic2.remove();
          while (btn.firstChild) head.insertBefore(btn.firstChild, btn);
          btn.remove(); it.classList.remove('open');
        }
      });
    });
  }

  function apply() {
    var on = mq.matches;
    rows.forEach(function (r) {
      r.classList.toggle('swipe', on);
      if (on) { r.setAttribute('tabindex', '0'); if (!/^(OL|UL)$/.test(r.tagName)) r.setAttribute('role', 'region'); r.setAttribute('aria-label', r._label); r._upd(); }
      else { r.removeAttribute('tabindex'); r.removeAttribute('role'); r.removeAttribute('aria-label'); }
    });
    fold('.pillars', '.pillar', ':scope > div:not(.body) > h3', ':scope > .body', true, on);
    fold('.site-foot', '.foot-col', ':scope > h2', ':scope > ul', false, on);
  }
  apply();
  if (mq.addEventListener) mq.addEventListener('change', apply); else if (mq.addListener) mq.addListener(apply);
})();
