# Site web de NextGen Africa Finance

Site de NextGen Africa Finance (Ouagadougou, Burkina Faso) : éducation financière, formations à la bourse régionale (BRVM) et conseil aux PME.

Le site est en HTML, CSS et JavaScript simples : rien à installer. Les polices sont hébergées dans le site, sans service externe.

## Les pages

| Fichier | Contenu |
|---|---|
| `index.html` | Accueil : carte de l'UEMOA, approche, services, parcours, équipes, agenda |
| `a-propos.html` | Mission, signature *Connect. Empower. Transform.*, ce que nous faisons et ne faisons pas, les 8 pôles, transparence |
| `formations.html` | Les 3 niveaux (Découverte, Intermédiaire, Avancé) et la formation IA et finance : public, objectifs, programme |
| `entreprises.html` | Conseil aux PME, méthode en 4 étapes, ateliers en entreprise, panels et partenariats, mise en relation (bientôt) |
| `ressources.html` | Guides : la BRVM en bref, choisir une SGI, repérer une arnaque, lexique |
| `agenda.html` | Formations à venir, panels et conférences |
| `faq.html` | Questions fréquentes |
| `contact.html` | Formulaire de contact (l'objet se présélectionne avec `contact.html?objet=entreprise`, `formation`, `atelier`, `partenariat`…) |
| `mentions-legales.html`, `confidentialite.html` | Pages légales |
| `404.html` | Page affichée quand un lien est cassé |
| `sitemap.xml`, `robots.txt`, `site.webmanifest` | Référencement et icône d'application |
| `assets/css/style.css` | Couleurs (bleu nuit `#030D27`, or `#B89050`), polices Sora et Newsreader, mises en page |
| `assets/js/main.js` | Menu mobile, formulaire et **coordonnées à renseigner** |
| `assets/js/home.js` | Animations de l'accueil : l'Afrique en particules avec ses frontières, le Burkina Faso et la Côte d'Ivoire mis en avant et étiquetés, réaction à la souris, dispersion au défilement ; parcours qui s'allume étape par étape ; phrase qui s'allume mot à mot ; chiffres qui défilent ; faisceau de lumière |
| `assets/vendor/` | GSAP 3.13 et ScrollTrigger, la bibliothèque d'animation, hébergés dans le site |
| `.claude/skills/` | Les skills d'Anthropic utilisés : `frontend-design` (design) et `algorithmic-art` (systèmes de particules) |

## À faire avant d'ouvrir le site au public

1. **Coordonnées** en haut de `assets/js/main.js` :
   - `CONTACT_EMAIL` : l'adresse e-mail de NGAF ;
   - `CONTACT_WHATSAPP` : le numéro au format international, sans espace ni « + » (par exemple `22670000000`) ;
   - `FORM_ENDPOINT` (conseillé) : un service de formulaire gratuit comme [Formspree](https://formspree.io). Les messages arrivent alors directement par e-mail, sans que le visiteur ait à ouvrir sa messagerie.

   Tant qu'aucune de ces trois valeurs n'est renseignée, le formulaire ne peut rien envoyer.
2. **Mentions légales** (`mentions-legales.html`) : forme juridique, capital, RCCM, IFU, adresse du siège, directeur de la publication. Ce sont les seuls « À compléter » visibles sur le site.
3. **Équipe** (`index.html` et `a-propos.html`, section `equipe`) : sous le titre de chaque pôle, ajouter `<p class="member-role">Prénom Nom</p>`, et remplacer les initiales par une photo. Mettre les photos (carrées, au moins 400 × 400 pixels) dans `assets/img/equipe/`, puis remplacer `<span class="avatar" aria-hidden="true">DG</span>` par `<img class="avatar" src="assets/img/equipe/prenom-nom.jpg" alt="Prénom Nom">`.
4. **Agenda** (`index.html` et `agenda.html`) : le lieu et la date de la formation gratuite de février 2027.
5. **Nom de domaine** : si le site passe sur un domaine propre (par exemple `nextgenafricafinance.com`), remplacer `https://ishaqfadelalexouedraogo-afk.github.io/ngaf-site/` dans toutes les pages, `sitemap.xml` et `robots.txt`.

## Mettre le site en ligne gratuitement

1. Sur GitHub, ouvrir le dépôt **ngaf-site** puis **Settings → Pages**.
2. Dans **Source**, choisir **Deploy from a branch**, la branche `main` et le dossier `/ (root)`, puis enregistrer.
3. Le site est en ligne quelques minutes plus tard, à l'adresse `https://ishaqfadelalexouedraogo-afk.github.io/ngaf-site/`.

## Voir le site sur son ordinateur

Double-cliquer sur `index.html`. Pour un rendu identique à la version en ligne, lancer `python3 -m http.server` dans le dossier puis ouvrir `http://localhost:8000`.

## Animations et accessibilité

Les animations de l'accueil se coupent automatiquement pour les visiteurs qui ont activé « Réduire les animations » sur leur appareil : la carte s'affiche alors fixe. Sans JavaScript, la carte fixe s'affiche aussi.

## Règle de contenu à respecter

NGAF n'a pas encore d'agrément de l'AMF-UMOA. Le site ne doit donc jamais :

- recommander un titre à acheter ou à vendre ;
- proposer de gérer l'argent de quelqu'un ou de recevoir des fonds ;
- présenter la mise en relation avec des investisseurs comme déjà ouverte.

Le service « Mise en relation » est affiché « Bientôt ». Il ne sera ouvert qu'après l'obtention des agréments et l'avis d'un juriste.

## Évolutions possibles

- Une version en anglais pour la diaspora et les partenaires.
- Des tarifs et un formulaire d'inscription par session, une fois les prix validés.
- De nouveaux guides dans `ressources.html` (contenus pédagogiques, jamais de recommandations).
