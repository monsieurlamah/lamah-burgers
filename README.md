# Lamah Burger — site web

Site vitrine d'un restaurant de burgers haut de gamme à Conakry, construit autour d'une visite en vol continu pilotée par le scroll : entrée par la porte, salle, cuisine, réserve, sortie arrière et révélation aérienne.

Site statique sans dépendance ni étape de build : HTML, CSS et JavaScript (modules ES).

## Lancer en local

```bash
npm start            # http://localhost:8080  (ou : python3 -m http.server 8080)
```

Paramètres d'URL utiles : `?motion=static` (version fixe sans animation), `?motion=full` (force l'animation), `?frames=dev` (mire de test, après `npm run frames:dev`).

## Modifier le contenu

Tout est dans **`content/site.js`** : textes des chapitres du vol, menu et prix, coordonnées, boutons, formulaire et timeline du vol. Enregistrez puis rechargez la page.

- Coordonnées : remplacez les `null` de `contact` (adresse, horaires, téléphone, WhatsApp, lien Google Maps). Les boutons correspondants apparaissent automatiquement.
- Formulaire : renseignez `contact.formEndpoint` (par exemple un endpoint Formspree). Tant qu'il est vide, le formulaire affiche clairement qu'il est en mode démonstration et n'envoie rien.
- Mention « site de démonstration » : `demo: false` une fois les contenus validés.
- Photos du menu : champ `image` de chaque burger (ex. `media/menu/le-lamah.webp`).

### Rythme du vol

`flight.beats` : chaque beat associe une distance de scroll `vh` (en hauteurs d'écran) à un intervalle du film `from` → `to` (en secondes). `from === to` = arrêt sur image. `chapter` = le texte affiché (null = pas de texte). `focusX` = cadrage horizontal sur écran vertical. Voir `production/README.md` pour le plan complet.

## Ajouter la vidéo du vol

1. Placer le film assemblé dans `media/video/flythrough-master.mp4` (voir `scripts/stitch.sh`).
2. `npm run frames` → `media/frames/{960,1440}/frame-XXXX.webp`, `poster.webp`, `manifest.json` (avec numéro de version pour invalider le cache).
3. `npm run check` puis, serveur lancé, `npm run test:flight` (Playwright).

Sans `media/frames/manifest.json`, le site affiche un décor provisoire, et le texte défile normalement.

## Structure

```
index.html                 page (structure sémantique)
content/site.js            contenu éditable + timeline du vol
assets/css/tokens.css      couleurs, typo, espacements (partagés avec la planche de style)
assets/css/site.css        styles
assets/js/main.js          rendu du contenu, en-tête, menu mobile, formulaire
assets/js/flight.js        scène épinglée, canvas, chapitres, mode fixe
assets/js/timeline.js      timeline par morceaux (scroll → image)
assets/js/frames.js        chargement prioritaire et mémoire bornée des images
assets/brand/              logos vectoriels (masters SVG)
assets/fonts/              polices auto-hébergées (OFL)
design/style-tile.html     planche de style (tokens réels du site)
design/logo/build-logo.cjs régénère les logos SVG
production/README.md       brief, plan de vol, rythme, prompts Higgsfield, journal
scripts/                   serveur local, FFmpeg (inspection, assemblage, extraction), contrôles
tests/                     tests de la timeline et contrôle navigateur
```

## Accessibilité et repli

- Le texte, les boutons et la navigation sont du HTML normal au-dessus du canvas ; les chapitres masqués sont `inert`.
- Lien « Passer la visite » sur toute la durée du vol.
- `prefers-reduced-motion`, mode économie de données et appareils à très faible mémoire : chaque chapitre est présenté sur une image fixe, sans épinglage.
- Scroll natif, aucun détournement : avant, arrière, sauts et redimensionnement fonctionnent.

## Mise en ligne

Hébergement statique (GitHub Pages, Netlify, Vercel, serveur Nginx…) : publier le dossier tel quel. Servir `media/frames/` avec un cache long ; l'URL des images porte la version du manifeste.
