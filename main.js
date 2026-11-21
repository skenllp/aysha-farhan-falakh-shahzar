/* Cover → Video → Hero */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var cover = $('cover'), overlay = $('video-overlay'), video = $('reveal-video'),
      skipBtn = $('skip-btn'), mask = $('video-fade-mask'), openBtn = $('open-btn'),
      musicBtn = $('music-btn');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var started = false, finished = false, watchdog, audio = null, wantMusic = false;

  /* music (optional, starts from the Open tap, toggle bottom-right) */
  function setMusic(on) {
    wantMusic = on;
    musicBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (!audio) { audio = new Audio('assets/music.mp3'); audio.loop = true; audio.volume = .6; }
    if (on) audio.play().catch(function () { wantMusic = false; musicBtn.setAttribute('aria-pressed', 'false'); });
    else audio.pause();
  }
  musicBtn.addEventListener('click', function () { setMusic(!wantMusic); });
  document.addEventListener('visibilitychange', function () {
    if (!audio) return;
    if (document.hidden) audio.pause(); else if (wantMusic) audio.play().catch(function () {});
  });

  function unlock() { document.documentElement.classList.remove('locked'); document.body.classList.remove('locked'); }

  /* Stage 3: dark fade → hero reveal */
  function toHero() {
    if (finished) return;
    finished = true;
    clearTimeout(watchdog);
    skipBtn.classList.remove('visible');
    mask.classList.add('on');                       // video dims to black (800ms)
    setTimeout(function () {
      unlock();
      window.scrollTo(0, 0);
      overlay.classList.add('gone');                // black fades off the hero (900ms)
      document.body.classList.add('live');          // staggered text reveal
      musicBtn.hidden = false;
      try { video.pause(); } catch (e) {}
      setTimeout(function () { overlay.remove(); cover.remove(); }, 1000);
    }, reduce ? 50 : 800);
  }

  /* Stage 1 → 2 */
  function openInvitation() {
    if (started) return;
    started = true;
    openBtn.disabled = true;
    setMusic(true);
    cover.classList.add('out');
    if (reduce) { setTimeout(toHero, 400); return; }  // no video for reduced-motion users
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    skipBtn.focus({ preventScroll: true });
    setTimeout(function () { skipBtn.classList.add('visible'); }, 900);
    var p;
    try { p = video.play(); } catch (e) {}
    if (p && p.catch) p.catch(function () { setTimeout(toHero, 600); });
    // fallback if video never starts
    watchdog = setTimeout(function () { if (video.currentTime < .1) toHero(); }, 5000);
  }

  openBtn.addEventListener('click', openInvitation);
  skipBtn.addEventListener('click', toHero);
  video.addEventListener('ended', toHero);
  video.addEventListener('error', function () { if (started) toHero(); });
  video.addEventListener('timeupdate', function () {
    if (video.duration && video.duration - video.currentTime < .85) toHero();   // begin fade before final frame
  });
  document.addEventListener('keydown', function (e) {
    if (started && !finished && (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); toHero(); }
  });

  /* gentle hero parallax */
  if (!reduce) {
    var hc = document.querySelector('.hero-content'), ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < 1200) hc.style.transform = 'translateY(' + (y * .06).toFixed(1) + 'px)';
        ticking = false;
      });
    }, { passive: true });
  }
})();

/* Scroll reveal */
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
  }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  els.forEach(function (e) { io.observe(e); });
})();

/* Countdown — target: start of 3 Jan 2027, Asia/Kolkata (no Maghrib time invented) */
(function () {
  var target = new Date('2027-01-03T00:00:00+05:30').getTime();
  var ids = ['days', 'hours', 'minutes', 'seconds'].map(function (k) { return document.getElementById('cd-' + k); });
  var grid = document.getElementById('cd'), done = document.getElementById('cd-done'),
      note = document.querySelector('.cd-note');
  function pad(n) { return String(n).padStart(2, '0'); }
  var t;
  function tick() {
    var diff = target - Date.now();
    if (diff <= 0) {
      grid.hidden = true; note.hidden = true; done.hidden = false; clearInterval(t); return;
    }
    var v = [Math.floor(diff / 864e5), Math.floor(diff % 864e5 / 36e5), Math.floor(diff % 36e5 / 6e4), Math.floor(diff % 6e4 / 1e3)];
    ids.forEach(function (el, i) { el.textContent = pad(v[i]); });
  }
  tick(); t = setInterval(tick, 1000);
})();

/* Scratch-to-reveal (pointer events: mouse, touch, pen) */
(function () {
  var canvas = document.getElementById('scratchCanvas'), spark = document.getElementById('sparkCanvas'),
      btn = document.getElementById('reveal-btn');
  if (!canvas) return;
  var ctx = canvas.getContext('2d', { willReadFrequently: true });
  var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), down = false, revealed = false, n = 0, last = null;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function paint() {
    var r = canvas.getBoundingClientRect(); W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#D6BA85'); g.addColorStop(.35, '#BEA06D'); g.addColorStop(.6, '#E2CB9B'); g.addColorStop(1, '#A68A57');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // brushed-metal texture
    for (var i = 0; i < 260; i++) {
      ctx.fillStyle = Math.random() > .5 ? 'rgba(255,248,226,.09)' : 'rgba(70,52,20,.08)';
      ctx.fillRect(Math.random() * W, Math.random() * H, 30 + Math.random() * 90, 1);
    }
    // inner hairline + label
    ctx.strokeStyle = 'rgba(60,44,16,.45)'; ctx.lineWidth = 1; ctx.strokeRect(8.5, 8.5, W - 17, H - 17);
    ctx.fillStyle = 'rgba(48,34,10,.85)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '500 ' + Math.round(W * .05) + 'px Cinzel, serif';
    ctx.fillText('SCRATCH HERE', W / 2, H / 2);
  }
  paint();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!n && !revealed) paint(); });
  window.addEventListener('resize', function () { if (!n && !revealed) paint(); });

  function pos(e) { var r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function scratch(e) {
    if (!down || revealed) return;
    var p = pos(e), rad = Math.max(20, W * .075);
    ctx.save(); ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = rad * 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo((last || p).x, (last || p).y); ctx.lineTo(p.x, p.y); ctx.stroke();
    ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, 7); ctx.fill(); ctx.restore();
    last = p;
    if (++n % 6 === 0) check();
  }
  function check() {
    var d = ctx.getImageData(0, 0, canvas.width, canvas.height).data, tot = 0, clear = 0, step = 4 * 12;
    for (var i = 3; i < d.length; i += step) { tot++; if (d[i] < 128) clear++; }
    if (clear / tot > .45) reveal();
  }
  function reveal() {
    if (revealed) return; revealed = true; down = false;
    canvas.classList.add('done');
    if (!reduce) sparkle();
  }
  canvas.addEventListener('pointerdown', function (e) { down = true; last = null; try { canvas.setPointerCapture(e.pointerId); } catch (x) {} scratch(e); });
  canvas.addEventListener('pointermove', scratch);
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { canvas.addEventListener(ev, function () { down = false; last = null; if (!revealed && n) check(); }); });
  btn.addEventListener('click', reveal);

  /* restrained gold sparkle */
  function sparkle() {
    var c = spark.getContext('2d'), w = spark.width = innerWidth, h = spark.height = innerHeight;
    var r = canvas.getBoundingClientRect(), cols = ['#BEA06D', '#D6BA85', '#F0E7D8'], ps = [], f = 0;
    for (var i = 0; i < 46; i++) ps.push({
      x: r.left + Math.random() * r.width, y: r.top + r.height * (.2 + Math.random() * .6),
      vx: (Math.random() - .5) * 1.1, vy: -.4 - Math.random() * 1.1, s: 1 + Math.random() * 2, c: cols[i % 3], l: 90 + Math.random() * 60
    });
    spark.style.opacity = 1;
    (function loop() {
      c.clearRect(0, 0, w, h); f++;
      ps.forEach(function (p) {
        p.x += p.vx; p.y += p.vy; p.vy += .008;
        c.globalAlpha = Math.max(0, 1 - f / p.l) * (.5 + .5 * Math.sin(f * .2 + p.x));
        c.fillStyle = p.c; c.beginPath(); c.moveTo(p.x, p.y - p.s * 2); c.lineTo(p.x + p.s * .7, p.y); c.lineTo(p.x, p.y + p.s * 2); c.lineTo(p.x - p.s * .7, p.y); c.fill();
      });
      if (f < 150) requestAnimationFrame(loop); else { c.clearRect(0, 0, w, h); spark.style.opacity = 0; }
    })();
  }
})();
