// NextGen Africa Finance — animations de la page d'accueil
// L'Afrique en particules : le continent se compose au chargement, respire,
// s'écarte au passage de la souris et se disperse en champ d'étoiles au défilement.
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.querySelector(".hero");
  const figure = hero && hero.querySelector(".hero-figure");
  const svg = figure && figure.querySelector(".hero-map");
  if (!hero || !svg || reduce) return;

  // ---------- Hasard reproductible ----------
  let seed = 20270201;
  const rand = () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // ---------- Échantillonnage du continent ----------
  const VB = { x: -20, y: -10, w: 740, h: 750 };
  const mobile = window.matchMedia("(max-width: 720px)").matches;
  const STEP = mobile ? 8.5 : 6;
  const off = document.createElement("canvas");
  off.width = VB.w; off.height = VB.h;
  const octx = off.getContext("2d", { willReadFrequently: true });
  octx.translate(-VB.x, -VB.y);
  const fill = (sel, color) => svg.querySelectorAll(sel).forEach((p) => { octx.fillStyle = color; octx.fill(new Path2D(p.getAttribute("d"))); });
  fill("path.land", "#0000ff");
  fill("path.uemoa", "#ff0000");
  fill("path.uemoa.bf", "#00ff00");
  const img = octx.getImageData(0, 0, VB.w, VB.h).data;

  const hx = [], hy = [], kind = [];
  for (let y = 0; y < VB.h; y += STEP) {
    for (let x = 0; x < VB.w; x += STEP) {
      const sx = Math.min(VB.w - 1, Math.round(x + (rand() - 0.5) * STEP * 0.9));
      const sy = Math.min(VB.h - 1, Math.round(y + (rand() - 0.5) * STEP * 0.9));
      const i = (sy * VB.w + sx) * 4;
      if (img[i + 3] < 200) continue;
      hx.push(sx); hy.push(sy);
      kind.push(img[i + 1] > 128 ? 2 : img[i] > 128 ? 1 : 0); // 0 continent, 1 UEMOA, 2 Burkina Faso
    }
  }
  const N = hx.length;
  const STARS = mobile ? 70 : 160;
  const T = N + STARS;
  const px = new Float32Array(T), py = new Float32Array(T), pz = new Float32Array(T);
  const ox = new Float32Array(T), oy = new Float32Array(T), vx = new Float32Array(T), vy = new Float32Array(T);
  const dirx = new Float32Array(T), diry = new Float32Array(T), dist = new Float32Array(T);
  const delay = new Float32Array(T), phase = new Float32Array(T), sx0 = new Float32Array(T), sy0 = new Float32Array(T);
  for (let i = 0; i < T; i++) {
    pz[i] = rand() * 2 - 1;
    const a = rand() * Math.PI * 2;
    dirx[i] = Math.cos(a); diry[i] = Math.sin(a);
    dist[i] = 180 + rand() * 720;
    delay[i] = rand() * 0.55;
    phase[i] = rand() * Math.PI * 2;
    sx0[i] = rand(); sy0[i] = rand();
  }
  // centre de gravité du Burkina Faso (pour le halo)
  let bfx = 0, bfy = 0, bfn = 0;
  for (let i = 0; i < N; i++) if (kind[i] === 2) { bfx += hx[i]; bfy += hy[i]; bfn++; }
  bfx /= bfn || 1; bfy /= bfn || 1;

  // ---------- Toile ----------
  const canvas = document.createElement("canvas");
  canvas.className = "hero-particles";
  canvas.setAttribute("aria-hidden", "true");
  hero.prepend(canvas);
  hero.classList.add("has-particles");
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, dpr = 1, scale = 1, mx = 0, my = 0;

  function layout() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const hr = hero.getBoundingClientRect(), sr = svg.getBoundingClientRect();
    scale = Math.min(sr.width / VB.w, sr.height / VB.h);
    mx = sr.left - hr.left + (sr.width - VB.w * scale) / 2;
    my = sr.top - hr.top + (sr.height - VB.h * scale) / 2;
  }
  layout();
  new ResizeObserver(layout).observe(hero);

  // ---------- Souris ----------
  let mouseX = -9999, mouseY = -9999;
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    mouseX = e.clientX - r.left; mouseY = e.clientY - r.top;
  });
  hero.addEventListener("pointerleave", () => { mouseX = mouseY = -9999; });

  // ---------- Rendu ----------
  const state = { p: 0 };           // dispersion liée au défilement (0 → 1)
  const COLORS = ["rgb(150,172,240)", "rgb(217,182,114)", "rgb(246,226,178)"];
  const start = performance.now();
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  let running = true;

  function frame(now) {
    if (!running) return;
    const t = now - start;
    const intro = Math.min(1, t / 2600);
    const p = state.p;
    const theta = Math.sin(t * 0.00032) * 0.28;          // le continent pivote lentement
    const cos = Math.cos(theta), sin = Math.sin(theta);
    const cx = VB.w / 2, depth = 90, persp = 900;
    const R = 90 * Math.max(scale, 0.6), R2 = R * R;
    ctx.clearRect(0, 0, W, H);

    // halo sur le Burkina Faso
    const gx = mx + bfx * scale, gy = my + bfy * scale;
    const pulse = 0.55 + 0.45 * Math.sin(t * 0.0021);
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 150 * scale + 40);
    g.addColorStop(0, `rgba(217,182,114,${0.34 * pulse * (1 - p) * intro})`);
    g.addColorStop(1, "rgba(217,182,114,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    for (let k = 0; k < 3; k++) {
      ctx.fillStyle = COLORS[k];
      for (let i = 0; i < N; i++) {
        if (kind[i] !== k) continue;
        // pivot 3D autour de l'axe vertical
        const dx = hx[i] - cx, dz = pz[i] * depth;
        const rx = dx * cos + dz * sin, rz = -dx * sin + dz * cos;
        const f = persp / (persp - rz);
        let x = mx + (cx + rx * f) * scale + Math.sin(t * 0.0011 + phase[i]) * 0.9;
        let y = my + (hy[i] * f + (1 - f) * VB.h / 2) * scale + Math.cos(t * 0.0013 + phase[i]) * 0.9;
        // assemblage au chargement
        const a = easeOut(Math.min(1, Math.max(0, (intro - delay[i]) / (1 - delay[i] + 1e-6))));
        if (a < 1) {
          x = sx0[i] * W + (x - sx0[i] * W) * a;
          y = sy0[i] * H + (y - sy0[i] * H) * a;
        }
        // dispersion au défilement
        if (p > 0) { const d = dist[i] * p * p; x += dirx[i] * d; y += diry[i] * d - p * 60; }
        // la souris écarte les particules, un ressort les ramène
        const ddx = x + ox[i] - mouseX, ddy = y + oy[i] - mouseY, d2 = ddx * ddx + ddy * ddy;
        if (d2 < R2) { const s = (1 - Math.sqrt(d2) / R) * 2.4; const n = Math.sqrt(d2) || 1; vx[i] += (ddx / n) * s; vy[i] += (ddy / n) * s; }
        vx[i] = (vx[i] - ox[i] * 0.06) * 0.86; vy[i] = (vy[i] - oy[i] * 0.06) * 0.86;
        ox[i] += vx[i]; oy[i] += vy[i];
        const size = (k ? 1.7 : 1.35) * f * (0.8 + scale * 0.6) * (1 + p * 0.8);
        ctx.globalAlpha = (k ? 0.95 : 0.55) * (0.55 + 0.45 * f) * (1 - p * 0.55) * (0.25 + 0.75 * a);
        ctx.fillRect(x + ox[i], y + oy[i], size, size);
      }
    }
    // repère de la BRVM (Abidjan), comme dans la légende
    {
      const dx = 160 - cx, rz = -dx * sin, f = persp / (persp - rz);
      const ax = mx + (cx + dx * cos * f) * scale, ay = my + (337 * f + (1 - f) * VB.h / 2) * scale;
      ctx.globalAlpha = intro * (1 - p);
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(ax, ay, 5.5, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = intro * (1 - p) * (1 - ((t / 2200) % 1));
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(ax, ay, 6 + 16 * ((t / 2200) % 1), 0, Math.PI * 2); ctx.stroke();
    }
    // étoiles de fond
    ctx.fillStyle = "#fff";
    for (let i = N; i < T; i++) {
      ctx.globalAlpha = (0.15 + 0.35 * (0.5 + 0.5 * Math.sin(t * 0.0012 + phase[i]))) * intro;
      const s = 1 + (pz[i] + 1) * 0.6;
      ctx.fillRect(sx0[i] * W, (sy0[i] * H - p * 120 * (pz[i] + 1.5) + H) % H, s, s);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  new IntersectionObserver(([e]) => {
    const was = running; running = e.isIntersecting;
    if (running && !was) requestAnimationFrame(frame);
  }).observe(hero);
  requestAnimationFrame(frame);

  // ---------- Défilement (GSAP + ScrollTrigger) ----------
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const headerH = () => (document.querySelector(".site-header") || { offsetHeight: 0 }).offsetHeight;
  const mm = gsap.matchMedia();

  mm.add("(min-width: 901px)", () => {
    // le bandeau reste en place pendant que le titre s'écarte et que le continent se disperse
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero, start: () => `top ${headerH()}px`, end: "+=85%", scrub: 0.7, pin: true,
        anticipatePin: 1, invalidateOnRefresh: true, onUpdate: (s) => { state.p = s.progress; },
      },
    });
    // on anime le bloc de texte entier : ses enfants ont déjà leur propre animation d'apparition en CSS
    tl.fromTo(".hero-text", { xPercent: 0, autoAlpha: 1 }, { xPercent: -28, autoAlpha: 0, ease: "power1.in", immediateRender: false }, 0)
      .fromTo(".map-legend", { autoAlpha: 1 }, { autoAlpha: 0, ease: "none", immediateRender: false }, 0);
    return () => { state.p = 0; };
  });
  mm.add("(max-width: 900px)", () => {
    ScrollTrigger.create({ trigger: hero, start: "top top", end: "bottom top", scrub: true, onUpdate: (s) => { state.p = s.progress * 0.7; } });
  });

  // ---------- La phrase forte s'allume mot à mot ----------
  const statement = document.querySelector(".statement h2");
  if (statement) {
    statement.setAttribute("aria-label", statement.textContent);
    statement.innerHTML = statement.textContent.trim().split(/\s+/)
      .map((w) => `<span class="word" aria-hidden="true">${w}</span>`).join(" ");
    gsap.fromTo(statement.querySelectorAll(".word"), { opacity: 0.14 }, {
      opacity: 1, stagger: 0.08, ease: "none",
      scrollTrigger: { trigger: statement, start: "top 85%", end: "bottom 45%", scrub: true },
    });
  }

  // ---------- Les chiffres clés défilent ----------
  document.querySelectorAll(".facts dt").forEach((dt) => {
    const end = parseInt(dt.textContent, 10);
    if (!end) return;
    const from = end > 1000 ? end - 12 : 0;
    const obj = { v: from };
    dt.textContent = from;
    gsap.to(obj, {
      v: end, duration: end > 1000 ? 1.4 : 1.6, ease: "power2.out",
      onUpdate: () => { dt.textContent = Math.round(obj.v); },
      scrollTrigger: { trigger: dt, start: "top 88%", once: true },
    });
  });

  // ---------- Faisceau de lumière dans l'appel à l'action ----------
  const band = document.querySelector(".cta-band");
  if (band) {
    const beam = document.createElement("div");
    beam.className = "beam"; beam.setAttribute("aria-hidden", "true");
    band.prepend(beam);
    gsap.fromTo(beam, { scaleY: 0, opacity: 0 }, {
      scaleY: 1, opacity: 1, ease: "power2.out", duration: 1.6,
      scrollTrigger: { trigger: band, start: "top 80%", once: true },
    });
  }

  // les polices et la carte modifient la mise en page : on recalcule
  window.addEventListener("load", () => { layout(); ScrollTrigger.refresh(); });
})();
