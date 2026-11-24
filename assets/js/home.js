// NextGen Africa Finance — animations de la page d'accueil
// L'Afrique en particules : le continent se compose au chargement, puis son contour
// se dessine ; le Burkina Faso et la Côte d'Ivoire sont mis en avant. Les particules
// s'écartent au passage de la souris et se dispersent en étoiles au défilement.
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
  const STEP = mobile ? 6.5 : 5;
  const off = document.createElement("canvas");
  off.width = VB.w; off.height = VB.h;
  const octx = off.getContext("2d", { willReadFrequently: true });
  octx.translate(-VB.x, -VB.y);
  const fill = (sel, color) => svg.querySelectorAll(sel).forEach((p) => { octx.fillStyle = color; octx.fill(new Path2D(p.getAttribute("d"))); });
  fill("path.land", "#0000ff");
  fill("path.uemoa", "#ff0000");
  fill("path.uemoa.bf", "#00ff00");
  fill("path.uemoa.ci", "#ff00ff");
  const img = octx.getImageData(0, 0, VB.w, VB.h).data;

  const hx = [], hy = [], kind = [];
  for (let y = 0; y < VB.h; y += STEP) {
    for (let x = 0; x < VB.w; x += STEP) {
      const sx = Math.min(VB.w - 1, Math.round(x + (rand() - 0.5) * STEP * 0.9));
      const sy = Math.min(VB.h - 1, Math.round(y + (rand() - 0.5) * STEP * 0.9));
      const i = (sy * VB.w + sx) * 4;
      if (img[i + 3] < 200) continue;
      hx.push(sx); hy.push(sy);
      // 0 continent, 1 autres pays de l'UEMOA, 2 Burkina Faso, 3 Côte d'Ivoire
      const r = img[i], gg = img[i + 1], b = img[i + 2];
      kind.push(gg > 128 ? 2 : r > 128 && b > 128 ? 3 : r > 128 ? 1 : 0);
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
  // centres du Burkina Faso et de la Côte d'Ivoire (pour les halos)
  const centre = (k) => { let x = 0, y = 0, n = 0; for (let i = 0; i < N; i++) if (kind[i] === k) { x += hx[i]; y += hy[i]; n++; } return [x / (n || 1), y / (n || 1)]; };
  const [bfx, bfy] = centre(2), [cix, ciy] = centre(3);
  // tracés vectoriels pour les contours nets
  const shapes = (sel) => [...svg.querySelectorAll(sel)].map((p) => new Path2D(p.getAttribute("d")));
  const allPaths = shapes("path.land, path.uemoa"), bfPath = shapes("path.uemoa.bf"), ciPath = shapes("path.uemoa.ci"), uemoaPaths = shapes("path.uemoa");

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
  // continent, autres pays de l'UEMOA, Burkina Faso, Côte d'Ivoire
  const COLORS = ["rgb(150,172,240)", "rgb(176,138,78)", "rgb(252,238,205)", "rgb(226,190,118)"];
  const ALPHA = [0.5, 0.75, 1, 1];
  const SIZE = [1.25, 1.4, 1.8, 1.7];
  const start = performance.now();
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  let running = true;

  function frame(now) {
    if (!running) return;
    const t = now - start;
    const intro = Math.min(1, t / 2600);
    const lines = Math.min(1, Math.max(0, (t - 1500) / 1400));   // les contours se dessinent après l'assemblage
    const p = state.p;
    const R = 80 * Math.max(scale, 0.6), R2 = R * R;
    const float = Math.sin(t * 0.0006) * 4;                         // le continent flotte doucement
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // halos : Burkina Faso et Côte d'Ivoire
    const halo = (x, y, rad, a) => {
      const gx = mx + x * scale, gy = my + y * scale + float;
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, rad * scale + 30);
      g.addColorStop(0, `rgba(217,182,114,${a})`); g.addColorStop(1, "rgba(217,182,114,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    };
    const pulse = 0.6 + 0.4 * Math.sin(t * 0.0021);
    halo(bfx, bfy, 120, 0.30 * pulse * (1 - p) * intro);
    halo(cix, ciy, 110, 0.22 * (1.4 - pulse) * (1 - p) * intro);

    // contours vectoriels (dans le repère de la carte)
    if (lines > 0 && p < 1) {
      const k = lines * (1 - p);
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * (mx - VB.x * scale), dpr * (my - VB.y * scale + float));
      ctx.lineJoin = "round";
      ctx.lineWidth = 0.9 / scale;
      ctx.strokeStyle = `rgba(190,205,255,${0.22 * k})`;
      allPaths.forEach((p2) => ctx.stroke(p2));
      ctx.fillStyle = `rgba(184,144,80,${0.10 * k})`;
      uemoaPaths.forEach((p2) => ctx.fill(p2));
      ctx.fillStyle = `rgba(217,182,114,${0.30 * k})`;
      ciPath.forEach((p2) => ctx.fill(p2));
      ctx.fillStyle = `rgba(246,226,178,${0.36 * k})`;
      bfPath.forEach((p2) => ctx.fill(p2));
      ctx.lineWidth = 2 / scale;
      ctx.strokeStyle = `rgba(217,182,114,${0.95 * k})`;
      ciPath.forEach((p2) => ctx.stroke(p2));
      ctx.strokeStyle = `rgba(250,236,200,${k})`;
      bfPath.forEach((p2) => ctx.stroke(p2));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    for (let k = 0; k < 4; k++) {
      ctx.fillStyle = COLORS[k];
      const base = ALPHA[k], sz = SIZE[k];
      for (let i = 0; i < N; i++) {
        if (kind[i] !== k) continue;
        let x = mx + hx[i] * scale + Math.sin(t * 0.0011 + phase[i]) * 0.7;
        let y = my + hy[i] * scale + float + Math.cos(t * 0.0013 + phase[i]) * 0.7;
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
        if (d2 < R2) { const n = Math.sqrt(d2) || 1; const f = (1 - n / R) * 2.2; vx[i] += (ddx / n) * f; vy[i] += (ddy / n) * f; }
        vx[i] = (vx[i] - ox[i] * 0.06) * 0.86; vy[i] = (vy[i] - oy[i] * 0.06) * 0.86;
        ox[i] += vx[i]; oy[i] += vy[i];
        const twinkle = 0.75 + 0.25 * Math.sin(t * 0.002 + phase[i] * 3);
        const size = sz * (0.85 + scale * 0.5) * (1 + p * 0.8) * (0.8 + 0.2 * (pz[i] + 1));
        ctx.globalAlpha = base * twinkle * (1 - p * 0.55) * (0.25 + 0.75 * a);
        ctx.fillRect(x + ox[i], y + oy[i], size, size);
      }
    }
    // repère de la BRVM (Abidjan), comme dans la légende
    {
      const ax = mx + 160 * scale, ay = my + 337 * scale + float;
      const ring = (t / 2200) % 1;
      ctx.strokeStyle = "#fff";
      ctx.globalAlpha = intro * (1 - p); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(ax, ay, 5.5, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = intro * (1 - p) * (1 - ring); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(ax, ay, 6 + 16 * ring, 0, Math.PI * 2); ctx.stroke();
    }
    // étiquettes reliées par un trait fin : Burkina Faso et Côte d'Ivoire
    if (lines > 0 && p < 0.6 && W > 720) {
      const k = lines * (1 - p / 0.6);
      const callout = (x, y, lx, ly, text, color) => {
        const ax = mx + x * scale, ay = my + y * scale + float;
        const bx = mx + lx * scale, by = my + ly * scale + float;
        ctx.globalAlpha = k;
        ctx.strokeStyle = color; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(bx + (lx < x ? -14 : 14), by); ctx.stroke();
        ctx.beginPath(); ctx.arc(ax, ay, 2.5, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
        ctx.font = "500 14px Sora, system-ui, sans-serif";
        ctx.textBaseline = "middle"; ctx.textAlign = lx < x ? "right" : "left";
        const tx = bx + (lx < x ? -20 : 20);
        ctx.lineWidth = 4; ctx.strokeStyle = "rgba(3,13,39,0.85)"; ctx.strokeText(text, tx, by);
        ctx.fillStyle = color; ctx.fillText(text, tx, by);
      };
      callout(bfx, bfy, bfx + 70, bfy - 150, "Burkina Faso", "rgb(252,238,205)");
      callout(cix, ciy + 8, cix - 20, ciy + 120, "Côte d'Ivoire", "rgb(232,200,135)");
      ctx.globalAlpha = 1; ctx.textAlign = "left";
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

  // ---------- Le parcours s'allume étape par étape ----------
  const steps = document.querySelector(".journey .steps");
  if (steps) {
    const items = [...steps.children];
    steps.classList.add("js-progress");
    ScrollTrigger.create({
      trigger: steps, start: "top 80%", end: "bottom 50%", scrub: true,
      onUpdate: (s) => {
        const pos = s.progress * (items.length - 1);
        items.forEach((li, i) => {
          li.classList.toggle("is-active", s.progress > 0 && pos >= i - 0.02);
          li.style.setProperty("--fill", Math.min(1, Math.max(0, pos - i)).toFixed(3));
        });
      },
    });
  }

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
