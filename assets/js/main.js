// Next Gen Africa Finance — script du site vitrine

// ====== À COMPLÉTER : coordonnées de contact ======
const CONTACT_EMAIL = "";      // exemple : "contact@nextgenafricafinance.bf"
const CONTACT_WHATSAPP = "";   // numéro au format international, sans espace ni « + » : exemple "22670000000"
// ==================================================

// Menu mobile
const toggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("menu");
if (toggle && menu) {
  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
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
const waLink = document.getElementById("contact-whatsapp");
if (waLink && CONTACT_WHATSAPP) {
  waLink.href = "https://wa.me/" + CONTACT_WHATSAPP;
  waLink.textContent = "+" + CONTACT_WHATSAPP;
  waLink.target = "_blank";
  waLink.rel = "noopener";
}

// Formulaire : ouvre la messagerie avec le message prérempli (aucun serveur nécessaire)
const form = document.getElementById("contact-form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const nom = (data.get("nom") || "").toString().trim();
    const contact = (data.get("contact") || "").toString().trim();
    if (!nom || !contact) {
      alert("Merci d'indiquer votre nom et un moyen de vous recontacter.");
      return;
    }
    const objet = data.get("objet");
    const body = `Nom : ${nom}\nContact : ${contact}\n\n${data.get("message") || ""}`;
    if (CONTACT_EMAIL) {
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(objet)}&body=${encodeURIComponent(body)}`;
    } else if (CONTACT_WHATSAPP) {
      window.open(`https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(objet + "\n" + body)}`, "_blank", "noopener");
    } else {
      alert("Les coordonnées de contact ne sont pas encore renseignées (fichier assets/js/main.js).");
    }
  });
}
