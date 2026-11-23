# Site web de Next Gen Africa Finance

Site vitrine de Next Gen Africa Finance (NGAF), Ouagadougou. Ce dépôt ne contient **que le site** : le business plan est conservé à part.

Le site est en HTML, CSS et JavaScript simples : rien à installer, aucune commande à lancer.

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `index.html` | La page d'accueil : mission, services, parcours, équipe, agenda, contact |
| `mentions-legales.html` | Les mentions légales, à compléter après l'immatriculation |
| `assets/css/style.css` | Les couleurs, polices et mises en page (bleu marine `#1F3864`, or `#C9A227`) |
| `assets/js/main.js` | Le menu sur téléphone, le formulaire de contact et **les coordonnées à renseigner** |
| `assets/img/` | Le logo et l'icône de l'onglet du navigateur |

## Voir le site sur ton ordinateur

Double-clique sur `index.html` : il s'ouvre dans ton navigateur.

## Ce qu'il faut compléter avant la mise en ligne

1. **Les coordonnées**, en haut de `assets/js/main.js` :
   - `CONTACT_EMAIL` : l'adresse e-mail de NGAF ;
   - `CONTACT_WHATSAPP` : le numéro WhatsApp au format international, sans espace ni « + » (par exemple `22670000000`).
2. **L'agenda** dans `index.html` (section `agenda`) : le lieu et la date de la formation gratuite de février 2027.
3. **Les mentions légales** dans `mentions-legales.html` : forme juridique, capital, RCCM, IFU, adresse, directeur de la publication.
4. **Le logo** : remplacer `assets/img/logo.svg` par le logo définitif, en gardant le même nom de fichier.

## Mettre le site en ligne gratuitement

Ce dépôt est prêt pour GitHub Pages :

1. Sur GitHub, ouvrir le dépôt **ngaf-site** puis **Settings → Pages**.
2. Dans **Source**, choisir **Deploy from a branch**, puis la branche `main` et le dossier `/ (root)`, et enregistrer.
3. Le site est en ligne quelques minutes plus tard, à l'adresse `https://ishaqfadelalexouedraogo-afk.github.io/ngaf-site/`.

Autres possibilités : Netlify ou Vercel (glisser-déposer le dossier). Un nom de domaine (par exemple en `.bf`) peut être ajouté ensuite.

## Règle de contenu à respecter

NGAF n'a pas encore d'agrément de l'AMF-UMOA. Le site ne doit donc jamais :

- recommander un titre à acheter ou à vendre ;
- proposer de gérer l'argent de quelqu'un ou de recevoir des fonds ;
- présenter la mise en relation avec des investisseurs comme déjà ouverte.

Le service « Mise en relation » est affiché « Bientôt ». Il ne sera ouvert qu'après l'obtention des agréments et l'avis d'un juriste.

## Évolutions possibles

- Une page par formation, avec programme et tarifs, une fois les prix validés par le sondage.
- Un formulaire d'inscription relié à un vrai service (Google Forms, Tally, ou un petit serveur).
- Une version en anglais pour la diaspora et les partenaires.
- Un blog d'éducation financière (contenus pédagogiques, jamais de recommandations).
