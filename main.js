/* AI 마에스트로 · 성과공유회 — reveal, counters, chapter nav, scroll-scrubbed video */
(() => {
  document.documentElement.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ── reveal on scroll (staggered within each section) ── */
  document.querySelectorAll('section').forEach((sec) => {
    sec.querySelectorAll('.reveal').forEach((el, i) => el.style.setProperty('--d', `${Math.min(i, 8) * 0.07}s`));
  });
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      revealIO.unobserve(e.target);
      const num = e.target.querySelector('[data-count]');
      if (num) countUp(num);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => revealIO.observe(el));

  function countUp(el) {
    const end = +el.dataset.count;
    if (reduced) { el.textContent = end; return; }
    const t0 = performance.now(), dur = 1100;
    const tick = (t) => {
      const k = clamp((t - t0) / dur, 0, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    };
    el.textContent = 0;
    requestAnimationFrame(tick);
  }

  /* ── missions: mark done / this week by today's date ── */
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let marked = false;
  document.querySelectorAll('#missions li').forEach((li) => {
    const due = new Date(li.dataset.due + 'T00:00:00');
    if (due < today) li.classList.add('done');
    else if (!marked) { li.classList.add('current'); marked = true; }
  });

  /* ── global nav: tint to the tile underneath, active chapter, progress ── */
  const bar = document.getElementById('topbar');
  const prog = document.getElementById('progress');
  const navLinks = [...document.querySelectorAll('.chapters a')];
  const blocks = [...document.querySelectorAll('main > *')];
  function updateChrome() {
    const probe = bar.offsetHeight + 1;
    let under = null;
    for (const s of blocks) {
      const r = s.getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) { under = s; break; }
    }
    // a .row2 holds several tiles side by side; take the tone of its first tile
    const tone = under && (under.matches('.tile, .scrub') ? under : under.querySelector('.tile'));
    bar.classList.toggle('on-dark', !!tone && (tone.classList.contains('t-dark') || tone.classList.contains('scrub')));
    const ch = under && under.dataset.chapter;
    navLinks.forEach((a) => a.classList.toggle('active', a.dataset.ch === ch));
    const max = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  }

  /* ── recordings gallery: scroll-snap track + dots + auto-advance with pause ── */
  document.querySelectorAll('.gallery').forEach((g) => {
    const track = g.querySelector('.gallery-track');
    const slides = [...track.children];
    const dotsBox = g.querySelector('.dots');
    const playBtn = g.querySelector('.play');
    const dots = slides.map((_, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', `${i + 1}번째 항목`);
      d.addEventListener('click', () => { go(i); stop(); });
      dotsBox.appendChild(d);
      return d;
    });
    let idx = 0, timer = null;
    const current = () => {
      const x = track.scrollLeft;
      let best = 0, bestD = Infinity;
      slides.forEach((s, i) => { const d = Math.abs(s.offsetLeft - track.offsetLeft - x); if (d < bestD) { bestD = d; best = i; } });
      return best;
    };
    const paint = () => { idx = current(); dots.forEach((d, i) => d.setAttribute('aria-selected', String(i === idx))); };
    const atEnd = () => track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    function go(i) { track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: reduced ? 'auto' : 'smooth' }); }
    const next = () => go(atEnd() ? 0 : Math.min(idx + 1, slides.length - 1));
    function start() { if (timer || reduced) return; timer = setInterval(next, +g.dataset.autoplay || 4500); playBtn.setAttribute('aria-pressed', 'true'); playBtn.setAttribute('aria-label', '자동 넘김 일시정지'); }
    function stop() { clearInterval(timer); timer = null; playBtn.setAttribute('aria-pressed', 'false'); playBtn.setAttribute('aria-label', '자동 넘김 재생'); }
    track.addEventListener('scroll', paint, { passive: true });
    playBtn.addEventListener('click', () => (timer ? stop() : start()));
    track.addEventListener('pointerdown', stop);
    track.addEventListener('focusin', stop);
    paint();
    if (reduced) stop();
    else {
      // only auto-advance while the gallery is on screen
      new IntersectionObserver(([e]) => { if (e.isIntersecting && playBtn.getAttribute('aria-pressed') === 'true') start(); else if (!e.isIntersecting && timer) { clearInterval(timer); timer = null; } }, { threshold: 0.4 }).observe(g);
    }
  });

  /* ── scroll-scrubbed video (scroll drives time; blob-backed so seeking works on any static server) ── */
  const mobile = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  const scrubs = [...document.querySelectorAll('.scrub')].map((sec) => ({
    sec,
    video: sec.querySelector('video'),
    beats: [...sec.querySelectorAll('.beat')],
    fill: sec.querySelector('.scrub-bar i'),
    src: mobile && sec.dataset.srcM ? sec.dataset.srcM : sec.dataset.src,
    loaded: false, dur: 0, cur: 0,
  }));

  async function load(s) {
    if (s.loaded) return;
    s.loaded = true;
    s.sec.classList.add('loading');
    try {
      const res = await fetch(s.src);
      if (!res.ok) throw new Error(res.status);
      s.video.src = URL.createObjectURL(await res.blob());
    } catch (err) {
      s.video.src = s.src; // fall back to direct streaming
    }
    s.video.addEventListener('loadedmetadata', () => {
      s.dur = s.video.duration || 0;
      s.sec.classList.remove('loading');
      s.video.pause();
    }, { once: true });
    s.video.load();
  }

  function progressOf(r) {
    const span = r.height - innerHeight;
    return span > 0 ? clamp(-r.top / span, 0, 1) : 0;
  }

  // `ease` < 1 smooths the seek toward the scroll target on each animation frame; scroll events
  // arriving while frames are throttled (background/hidden pane) snap straight to the target.
  let lastFrame = 0;
  function update(ease) {
    for (const s of scrubs) {
      const r = s.sec.getBoundingClientRect();
      // start fetching ~1.5 screens ahead; only drive the video while it is on screen
      if (r.top < innerHeight * 2.5 && r.bottom > -innerHeight * 1.5) load(s);
      if (r.top >= innerHeight || r.bottom <= 0) continue;
      const p = progressOf(r);
      s.fill.style.width = `${p * 100}%`;
      s.beats.forEach((b) => b.classList.toggle('on', p >= +b.dataset.from && p < +b.dataset.to));
      if (!s.dur) continue;
      const target = p * (s.dur - 0.04);
      s.cur += (target - s.cur) * ease;
      if (Math.abs(s.video.currentTime - s.cur) > 1 / 60 && !s.video.seeking) s.video.currentTime = s.cur;
    }
    updateChrome();
  }
  function frame(t) {
    lastFrame = t;
    update(reduced ? 1 : 0.2);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  addEventListener('scroll', () => { if (performance.now() - lastFrame > 120) update(1); }, { passive: true });
  addEventListener('resize', () => update(1));
  update(1);
})();
