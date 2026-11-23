// Next Gen Africa Finance — script du site

// ====== À COMPLÉTER : coordonnées de contact ======
const CONTACT_EMAIL = "";      // exemple : "contact@nextgenafricafinance.bf"
const CONTACT_WHATSAPP = "";   // numéro au format international, sans espace ni « + » : exemple "22670000000"
// ==================================================

// Menu mobile
const toggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("menu");
if (toggle && menu) {
  const close = () => { menu.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); };
  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

// Année du pied de page
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// Coordonnées
const emailLink = document.getElementById("contact-email");
if (emailLink && CONTACT_EMAIL) {
  emailLink.href = "mailto:" + CONTACT_EMAIL;
  emailLink.textContent = CONTACT_EMAIL;
}
if (CONTACT_WHATSAPP) {
  const waUrl = "https://wa.me/" + CONTACT_WHATSAPP;
  document.querySelectorAll("#contact-whatsapp, .js-whatsapp").forEach((a) => {
    a.href = waUrl; a.target = "_blank"; a.rel = "noopener";
  });
  const waLink = document.getElementById("contact-whatsapp");
  if (waLink) waLink.textContent = "+" + CONTACT_WHATSAPP;
}

// Équipe : afficher / masquer les autres pôles
const teamToggle = document.getElementById("team-toggle");
if (teamToggle) {
  const more = document.querySelectorAll(".member[data-more]");
  if (!more.length) teamToggle.parentElement.hidden = true;
  teamToggle.addEventListener("click", () => {
    const open = teamToggle.getAttribute("aria-expanded") !== "true";
    more.forEach((m) => (m.hidden = !open));
    teamToggle.setAttribute("aria-expanded", String(open));
    teamToggle.textContent = open ? "Masquer les autres pôles" : "Voir les autres pôles";
  });
}

// Formulaire : ouvre la messagerie avec le message prérempli (aucun serveur nécessaire)
const form = document.getElementById("contact-form");
const formError = document.getElementById("form-error");
if (form) {
  const showError = (msg) => { formError.textContent = msg; formError.hidden = false; };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    formError.hidden = true;
    const data = new FormData(form);
    const nom = (data.get("nom") || "").toString().trim();
    const contact = (data.get("contact") || "").toString().trim();
    if (!nom || !contact) {
      showError("Indiquez votre nom et un téléphone ou un e-mail pour que nous puissions vous répondre.");
      (nom ? form.contact : form.nom).focus();
      return;
    }
    const objet = data.get("objet");
    const body = `Nom : ${nom}\nContact : ${contact}\n\n${data.get("message") || ""}`;
    if (CONTACT_EMAIL) {
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(objet)}&body=${encodeURIComponent(body)}`;
    } else if (CONTACT_WHATSAPP) {
      window.open(`https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(objet + "\n" + body)}`, "_blank", "noopener");
    } else {
      showError("L'envoi n'est pas encore activé : les coordonnées de contact restent à renseigner dans assets/js/main.js.");
    }
  });
}

// Bandeau d'accueil : orbites de l'UEMOA autour de Ouagadougou
(function heroOrbits() {
  const canvas = document.querySelector(".hero-orbits");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cities = [
    { name: "Ouagadougou", ring: 2, a: 3.55, gold: true },
    { name: "Abidjan · BRVM", ring: 4, a: 3.25, gold: true },
    { name: "Dakar", ring: 6, a: 3.75 },
    { name: "Bamako", ring: 3, a: 2.95 },
    { name: "Niamey", ring: 5, a: 4.05 },
    { name: "Lomé", ring: 7, a: 3.45 },
    { name: "Cotonou", ring: 8, a: 2.85 },
    { name: "Bissau", ring: 9, a: 3.95 },
  ];
  const dots = Array.from({ length: 46 }, (_, i) => ({
    ring: 1 + (i % 12), a: (i * 2.399) % (Math.PI * 2), s: 0.00004 + ((i * 37) % 10) * 0.000006, r: i % 7 === 0 ? 3.2 : 1.6,
  }));
  let w, h, dpr, cx, cy, step;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const narrow = w < 720;
    cx = narrow ? w * 1.05 : w * 0.98;
    cy = narrow ? h * 0.15 : h * 0.62;
    step = Math.max(w, h) * (narrow ? 0.07 : 0.055);
  }

  function ringR(i) { return step * (2.2 + i); }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    // halo doré
    const g = ctx.createRadialGradient(cx - step * 3, cy - step * 5, 0, cx - step * 3, cy - step * 5, step * 5);
    g.addColorStop(0, "rgba(217,182,114,0.28)"); g.addColorStop(1, "rgba(217,182,114,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 13; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, ringR(i), 0, Math.PI * 2);
      ctx.lineWidth = 1;
      ctx.strokeStyle = i === 4 || i === 9 ? "rgba(217,182,114,0.5)" : i === 6 ? "rgba(120,150,255,0.45)" : "rgba(255,255,255,0.16)";
      ctx.stroke();
    }
    // lignes de connexion entre villes
    const pts = cities.map((c) => {
      const a = c.a + (reduce ? 0 : t * 0.000012 * (c.ring % 2 ? 1 : -1));
      return { ...c, x: cx + Math.cos(a) * ringR(c.ring), y: cy + Math.sin(a) * ringR(c.ring) };
    });
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.beginPath();
    pts.slice(1).forEach((p) => { ctx.moveTo(pts[0].x, pts[0].y); ctx.lineTo(p.x, p.y); });
    ctx.stroke();

    dots.forEach((d) => {
      const a = d.a + (reduce ? 0 : t * d.s);
      const x = cx + Math.cos(a) * ringR(d.ring), y = cy + Math.sin(a) * ringR(d.ring);
      ctx.beginPath(); ctx.arc(x, y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.fill();
    });

    const showLabels = w >= 720;
    ctx.font = "500 12.5px Sora, system-ui, sans-serif";
    pts.forEach((p) => {
      ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
      ctx.strokeStyle = p.gold ? "#D9B672" : "rgba(255,255,255,0.8)"; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = p.gold ? "#D9B672" : "#fff"; ctx.fill();
      if (showLabels && p.x > w * 0.64 && p.x < w - 130 && p.y > 20 && p.y < h - 10) {
        ctx.fillStyle = p.gold ? "#E8CF9C" : "rgba(255,255,255,0.75)";
        ctx.fillText(p.name, p.x + 13, p.y + 4);
      }
    });
    // voile sombre à gauche pour garder le texte lisible
    const veil = ctx.createLinearGradient(0, 0, w * 0.62, 0);
    const edge = w < 720 ? 0.45 : 0;
    veil.addColorStop(0, "rgba(3,13,39,0.55)"); veil.addColorStop(1, `rgba(3,13,39,${edge})`);
    ctx.fillStyle = veil; ctx.fillRect(0, 0, w, h);
  }

  let visible = true;
  function loop(t) { if (visible) draw(t); requestAnimationFrame(loop); }
  resize();
  window.addEventListener("resize", () => { resize(); draw(performance.now()); });
  if (reduce) { draw(0); document.fonts && document.fonts.ready.then(() => draw(0)); return; }
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
  requestAnimationFrame(loop);
})();
