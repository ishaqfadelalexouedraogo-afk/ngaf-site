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
    a.href = waUrl; a.target = "_blank"; a.rel = "noopener"; a.hidden = false;
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
