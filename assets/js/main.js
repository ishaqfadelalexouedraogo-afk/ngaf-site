// NextGen Africa Finance — script commun à toutes les pages

// ====== À COMPLÉTER AVANT LA MISE EN LIGNE ======
const CONTACT_EMAIL = "";      // exemple : "contact@nextgenafricafinance.com"
const CONTACT_WHATSAPP = "";   // numéro au format international, sans espace ni « + » : exemple "22670000000"
const FORM_ENDPOINT = "";      // facultatif : adresse d'un service de formulaire (par exemple Formspree : "https://formspree.io/f/xxxxxxx")
// ================================================

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

// Coordonnées : affichées seulement quand elles sont renseignées
if (CONTACT_EMAIL) {
  const a = document.getElementById("contact-email");
  if (a) { a.href = "mailto:" + CONTACT_EMAIL; a.textContent = CONTACT_EMAIL; }
  document.querySelectorAll('[data-config="email"]').forEach((el) => (el.hidden = false));
}
if (CONTACT_WHATSAPP) {
  const waUrl = "https://wa.me/" + CONTACT_WHATSAPP;
  document.querySelectorAll("#contact-whatsapp, .js-whatsapp").forEach((a) => {
    a.href = waUrl; a.target = "_blank"; a.rel = "noopener"; a.hidden = false;
  });
  const wa = document.getElementById("contact-whatsapp");
  if (wa) wa.textContent = "+" + CONTACT_WHATSAPP;
  document.querySelectorAll('[data-config="whatsapp"]').forEach((el) => (el.hidden = false));
}

// Formulaire de contact
const form = document.getElementById("contact-form");
if (form) {
  const errorBox = document.getElementById("form-error");
  const successBox = document.getElementById("form-success");
  const select = form.querySelector("select[name=objet]");

  // Objet présélectionné depuis le lien (contact.html?objet=entreprise)
  const wanted = new URLSearchParams(window.location.search).get("objet");
  if (wanted && select && select.querySelector(`option[value="${CSS.escape(wanted)}"]`)) select.value = wanted;

  const showError = (msg) => { successBox.hidden = true; errorBox.textContent = msg; errorBox.hidden = false; };
  const showSuccess = (msg) => { errorBox.hidden = true; successBox.textContent = msg; successBox.hidden = false; };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.hidden = true;
    const data = new FormData(form);
    const nom = (data.get("nom") || "").toString().trim();
    const contact = (data.get("contact") || "").toString().trim();
    if (!nom || !contact) {
      showError("Indiquez votre nom et un téléphone ou un e-mail pour que nous puissions vous répondre.");
      (nom ? form.contact : form.nom).focus();
      return;
    }
    const objet = select.options[select.selectedIndex].text;
    const message = (data.get("message") || "").toString().trim();
    const body = `Nom : ${nom}\nContact : ${contact}\n\n${message}`;
    const button = form.querySelector("button[type=submit]");

    if (FORM_ENDPOINT) {
      button.disabled = true;
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: (() => { const f = new FormData(); f.append("nom", nom); f.append("contact", contact); f.append("objet", objet); f.append("message", message); return f; })(),
        });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        showSuccess("Message envoyé. Nous vous répondons dès que possible.");
      } catch {
        showError("Le message n'a pas pu être envoyé. Vérifiez votre connexion et réessayez.");
      } finally {
        button.disabled = false;
      }
    } else if (CONTACT_EMAIL) {
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(objet)}&body=${encodeURIComponent(body)}`;
      showSuccess("Votre messagerie s'ouvre avec le message prérempli : il ne reste qu'à l'envoyer.");
    } else if (CONTACT_WHATSAPP) {
      window.open(`https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(objet + "\n" + body)}`, "_blank", "noopener");
      showSuccess("WhatsApp s'ouvre avec le message prérempli : il ne reste qu'à l'envoyer.");
    } else {
      showError("L'envoi n'est pas encore activé : les coordonnées de contact restent à renseigner dans assets/js/main.js.");
    }
  });
}
