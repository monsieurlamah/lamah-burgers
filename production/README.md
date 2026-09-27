# Lamah Burger — note de production du vol

État : **plan de vol, identité, site et moteur de scroll terminés ; images et vidéos Higgsfield non générées.**
Le connecteur Higgsfield était installé sur le compte mais sa connexion n'était pas finalisée (« connect incomplete »), donc ses outils n'étaient pas disponibles dans cette session. Aucun autre fournisseur de génération n'a été utilisé à sa place.

## Brief retenu

| | |
|---|---|
| Activité | Restaurant de burgers haut de gamme à Conakry (Guinée) : sur place, à emporter, au volant. |
| Public | Familles, actifs, sorties entre amis ; clientèle qui veut la rapidité d'un fast-food et une vraie qualité. |
| Action attendue | Voir le menu → venir / commander (téléphone, WhatsApp, réservation de table). |
| Référence | « Un peu comme McDonald's » : bâtiment autonome avec parking et voie drive, comptoir, marque simple et iconique. Aucun élément de McDonald's (arches, rouge-jaune exact, typographie) n'est repris. |
| Direction | **Charbon & Or** : fond charbon, or safran pour l'action, braise (latérite) en accent, papier kraft. Titres condensés en capitales + italique serif — voir `design/style-tile.html`. |
| Mode | Autonome pour l'identité et le contenu (propositions à valider) ; points de validation proposés : image de départ et plan de vol. |

Hypothèses à valider (marquées `// À CONFIRMER` dans `content/site.js`) : adresse, horaires, téléphone, WhatsApp, prix, présence d'une voie drive, d'une terrasse et d'une réserve/boulangerie, pain cuit sur place, noms et recettes des burgers.

## Visual Story

| Scene | Visual story | Website copy |
|---|---|---|
| 01 — Arrivée | Heure dorée, à hauteur d'œil sur le parvis. La caméra avance, dérive à droite puis s'incline à gauche en arc le long de la terrasse (lanternes, tables en bois), se réaligne sur les portes vitrées grandes ouvertes, plonge légèrement et entre. | **Le burger, *en grand.*** — « La rapidité d'un fast-food, l'exigence d'une grande table : steaks grillés à la minute, pain brioché doré, frites maison. » · [Voir le menu] [Nous trouver] |
| 02 — La salle | Ralentit nettement. S'incline à droite et glisse latéralement le long du comptoir (bois sombre, rampe laiton, panneaux de menu rétroéclairés sans texte, équipier qui pose un burger emballé sur un plateau). Courbe en S autour de la grande table commune en chêne, puis lacet pour regarder vers la cuisine vitrée où brille le grill. | **Commandez. *On s'occupe du reste.*** — « Un comptoir ouvert, une salle chaleureuse, une cuisine à vue. Votre commande part au grill dès qu'elle est passée. » · [Découvrir les burgers] |
| Transition — Porte de cuisine | Un équipier pousse la porte battante inox à côté du comptoir ; la caméra accélère et passe tout droit. | Pas de texte — le mouvement parle. |
| 03 — La cuisine | Ralentit, arc lent à gauche autour du cuisinier qui presse les steaks sur la plancha, flammes du grill à côté ; plonge pour voir le cheddar fondre et les pains dorer, remonte ; courbe à droite le long de la ligne d'assemblage (burgers emballés dans du kraft, lampes chauffantes). | **Grillé à la minute, *jamais à l'avance.*** — « Le steak est pressé sur la plaque, saisi à la flamme, le cheddar fond, le pain dore. Puis on assemble, on emballe, on vous appelle. » · [Notre savoir-faire] |
| 04 — Le frais | Tourne à droite par une porte latérale dans la salle de préparation, slalome dans l'allée entre les rayonnages inox (plaques de pains briochés, cagettes de tomates, oignons, salades), tourne à gauche au bout ; la porte arrière ouverte montre la cour de service, la camionnette blanche sans marque et le ciel du soir. | **Le frais *d'abord.*** — « Tomates, oignons, salades et pains : tout est lavé, taillé et préparé sur place, chaque jour. » |
| Transition — Sortie et demi-tour | Sort par la porte arrière dans la cour clôturée (camionnette, cagettes, palmiers, voie de service derrière la clôture), continue d'avancer en montant un peu, puis pivote de 180° en mouvement pour faire face à la porte qu'elle vient de franchir. | Pas de texte — le mouvement parle. |
| 05 — Nous trouver | Recule et monte en continu : toit plat, voie drive qui fait le tour du bâtiment avec deux voitures, parking, terrasse avant, boulevard animé devant, bâtiments bas voisins, palmiers, océan Atlantique à l'horizon au coucher du soleil. Plan aérien final stable. | **Venez nous voir *à Conakry.*** — « Salle, terrasse et voie drive : arrêtez-vous le temps d'un repas ou repartez sans descendre de voiture. » + adresse / horaires / téléphone · [Commander] [Itinéraire] |

**Le parcours.** Entrée par l'avant, face au boulevard ; traversée de la salle vers la cuisine ouverte au fond à droite ; sortie latérale de la cuisine vers la réserve qui longe l'arrière ; sortie par la porte de livraison dans la cour de service. La caméra ne se retrouve jamais devant la façade qu'elle vient de quitter : elle sort à l'arrière, pivote pour regarder la porte arrière, puis recule en montant, si bien que le bâtiment entier, puis le boulevard derrière lui, entrent dans le cadre.

**Le texte et le scroll.** Le premier chapitre est visible au repos, sur l'image de départ tenue. Chaque chapitre apparaît en fondu (0,3 hauteur d'écran) au début de son beat, reste pendant les manœuvres qu'il décrit, puis s'efface avant la transition suivante ; les deux transitions (porte, sortie + demi-tour) n'ont aucun texte. Le dernier chapitre reste affiché sur le plan aérien final. Le texte occupe à tour de rôle le côté gauche ou droit, à l'opposé de l'action ; sur téléphone, il se place en bas sur un dégradé.

## Scroll pacing

Distance de scroll épinglé totale : **13,0 hauteurs d'écran** (plus une hauteur pour la scène elle-même). Chaque beat relie son propre intervalle de scroll à son propre intervalle du film (timeline par morceaux, `content/site.js → flight.beats`). Temps en secondes du film maître provisoire de 45 s.

| Beat | Texte (entre / sort) | Scroll | Film | Type |
|---|---|---|---|---|
| b01-hold | 01 visible au repos | 0,8 vh | 0 s | **Arrêt sur image** — le titre se lit |
| b02-approach | 01 tenu, sort à la fin (fondu 0,3 vh) | 1,4 vh | 0 → 5,5 s | Mouvement continu |
| b03-counter | 02 entre | 1,3 vh | 5,5 → 9,5 s | Continu, ralenti (plus de scroll par seconde) |
| b04-dining | 02 tenu, sort à la fin | 1,1 vh | 9,5 → 13 s | Continu |
| t1-door | — | 0,6 vh | 13 → 16 s | Continu, transition rapide |
| b05-grill | 03 entre | 1,7 vh | 16 → 22 s | Continu, dense : le plus de scroll |
| b06-assembly | 03 tenu, sort à la fin | 0,9 vh | 22 → 25 s | Continu |
| b07-prep | 04 entre, tenu, sort | 1,4 vh | 25 → 30 s | Continu (virages dans l'allée) |
| t2-exit | — | 0,7 vh | 30 → 34 s | Continu |
| t3-yaw | — | 0,6 vh | 34 → 37 s | **Beat dédié** au demi-tour de 180° pour qu'il ne paraisse pas comme un saut |
| b08-reveal | 05 entre | 1,6 vh | 37 → 45 s | Continu, montée |
| b09-hold | 05 tenu jusqu'à la fin | 0,9 vh | 45 s | **Arrêt sur image** aérien final |

Ces durées sont à recaler sur les vrais clips : ouvrir la planche contact du master, noter la seconde de chaque événement (franchissement des portes, fin du demi-tour…), et modifier `from`/`to` dans `content/site.js`. Les `vh` se règlent indépendamment.

## Production Higgsfield — à exécuter une fois le connecteur connecté

1. **Vérifier le schéma** des modèles disponibles (durée max, ratio, résolution, rôles des références, modes `omni_reference` / `video_extension`). Ne pas acheter d'abonnement ni changer de réglage de compte.
2. **Logo** : 3 concepts Higgsfield à comparer au logo vectoriel provisoire (`assets/brand/`). Un rendu raster n'est pas un master : le master reste vectoriel.
3. **Images de départ** : générer A, B, C (16:9), en choisir une → premier frame exact.
4. **Image de révélation** à partir de l'image de départ retenue.
5. **Clip A** (image → vidéo, image de départ en `start_image`), l'inspecter (`scripts/inspect-clip.sh`).
6. **Clip B** = extension `forward` du clip A ; inspecter ; comparer dernier frame A / premier frame B.
7. **Clip C** = extension du clip B + image de révélation en référence ; inspecter.
8. Réparations ciblées si besoin (couper avant un défaut, retouche vidéo locale, extension depuis une fin propre) — pas de boucle de régénération.
9. `bash scripts/stitch.sh media/video/flythrough-master.mp4 media/video/clip-a.mp4 media/video/clip-b.mp4 media/video/clip-c.mp4`
10. `bash scripts/make-frames.sh media/video/flythrough-master.mp4 20 78` puis `npm run check` et `npm run test:flight`.
11. Photos produits des 5 burgers (champ `image` du menu).

### Prompts

Règles communes : jamais les mots « drone », « quadcopter », « UAV » ; décrire la caméra ; rien n'apparaît ni ne disparaît ; aucun texte, logo, marque ou enseigne. Refuser un preset proposé par la plateforme s'il ne correspond pas et envoyer le prompt tel quel.

**Image de départ A — pavillon à l'heure dorée (recommandée)**
> Photorealistic eye-level exterior photograph at golden hour of a freestanding premium burger restaurant in Conakry, Guinea. Single-storey modern pavilion: charcoal-stained vertical timber cladding over a dark brick base, tall floor-to-ceiling glazing with slim brass frames, a deep flat canopy whose underside is painted warm gold and lit. The wide double glass entrance doors are propped fully open in the centre of the frame, warm amber interior light spilling out; a long wooden order counter and pendant lights visible inside. Foreground: clean paved forecourt, low planters of tropical plants, a small terrace on the left with wooden tables and glowing lanterns, two tall palm trees. Camera 1.5 m high, 24 mm lens, centred on the open doors about 12 m away, inviting the viewer in. Low warm sun, long soft shadows, humid tropical air. No people outside. No text, no logos, no signage lettering, no brand badges anywhere. 16:9.

**Image de départ B — heure bleue après la pluie**
> Same brief as A, but at blue hour just after rain: the forecourt is wet and mirrors the warm interior light, deep blue sky, an unbadged parked scooter near the terrace, palms silhouetted. Doors wide open, warm glow inside. No text, no logos, no signage lettering. 16:9.

**Image de départ C — matin tropical, blanc et latérite**
> Same composition as A, bright tropical morning: white rendered walls with a laterite-red tiled base, a gold fabric awning, lush green planting, crisp shadows. Doors wide open, interior visible. No text, no logos, no signage lettering. 16:9.

**Image de révélation (référence de fin)** — avec l'image de départ retenue en référence
> High aerial photograph looking down at about 45 degrees at the REAR of the same freestanding restaurant pavilion as the reference image: same charcoal timber cladding, brass-framed glazing, flat roof with a gold canopy edge, same scale. The camera is behind and above the building. The rear delivery door is open with warm light spilling into a small fenced service yard holding an unbadged white van and stacked crates. A drive-through lane wraps around the building with two unbadged cars in it. Beyond the building: the car park, the landscaped front forecourt and terrace, and the busy four-lane urban boulevard it faces, with moving traffic and streetlights. Neighbouring low-rise buildings, palm trees and, far away, the Atlantic Ocean under a warm golden-hour sky, as in a coastal West African city. No text, no logos, no signage lettering, no brand badges. 16:9.

**Clip A — 15 s, image → vidéo (start_image = image de départ)**
> One single continuous first-person camera move, no cuts; the camera itself is flying; nothing flying or hovering is ever visible in frame. Every person, vehicle and object is stationary unless described; nothing appears, disappears or changes.
> 0–3s: from the first frame the camera glides forward across the forecourt at a brisk walking pace, drifts slightly right, then banks gently left in an arc past the terrace so the lanterns and wooden tables slide by on the left.
> 3–5.5s: straightens, lines up with the open double doors, dips slightly and flies straight through the doorway into the restaurant.
> 5.5–9.5s: slows right down; banks right and travels sideways along the full length of the long wooden order counter with a brass rail and backlit menu panels that carry no lettering, while a staff member in a charcoal apron places a paper-wrapped burger on a tray.
> 9.5–13s: S-curve: swings left around a large communal oak table set with plated burgers and fries, then right, yawing to look across the room at the glass-fronted open kitchen glowing with grill fire at the back right.
> 13–15s: speeds up towards a stainless swinging kitchen door beside the counter; a staff member pushes it open.
> Warm tungsten interior light, amber and brass tones, dark timber, 24 mm lens, light natural motion blur, smooth stabilised flight. No text, no logos, no brand badges, no signage lettering.

**Clip B — 15 s, extension forward du clip A**
> Continue the exact same single continuous first-person camera move, no cuts; the camera itself is flying; nothing flying or hovering is ever visible in frame. Same speed, light and lens. Every person and object is stationary unless described; nothing appears, disappears or changes.
> 0–1s: flies straight through the open swinging door into the open kitchen.
> 1–7s: slows; arcs slowly left around a chef pressing beef patties on a flat-top griddle, open flames rising from the charcoal grill beside it; dips low to look closely at cheddar melting on a patty and brioche buns toasting, then rises.
> 7–10s: curves right along the stainless assembly line where two cooks wrap burgers in plain kraft paper under glowing heat lamps.
> 10–12s: turns right through an open side door into a bright preparation room.
> 12–15s: weaves down an aisle between stainless shelving racks holding trays of golden brioche buns and crates of fresh tomatoes, onions and lettuce; at the end of the aisle turns left around the corner; ahead, an open rear delivery door shows a small fenced service yard, an unbadged white van and the golden evening sky outside.
> No text, no logos, no brand badges, no signage lettering.

**Clip C — 15 s, extension forward du clip B + image de révélation en référence**
> Continue the exact same single continuous first-person camera move, no cuts; the camera itself is flying; nothing flying or hovering is ever visible in frame. Same lens. Every person, vehicle and object is stationary unless described, except normal moving traffic on the boulevard; nothing appears, disappears or changes.
> 0–4s: flies out through the open rear delivery door into the fenced service yard — unbadged white van, stacked crates, palm trees, a service road behind the fence, golden evening sky — and keeps moving away from the building, rising slightly.
> 4–7s: while still moving away, yaws smoothly 180 degrees to face back at the rear of the restaurant it just left, the open door glowing warm.
> 7–15s: flies backwards and climbs steadily, revealing the whole restaurant from above as in the reference image: flat roof, the drive-through lane wrapping around the building with two cars, the car park, the front terrace, the busy boulevard in front with moving traffic and streetlights, neighbouring low-rise buildings and palms, and the Atlantic Ocean on the horizon. Ends on a steady high aerial view.
> Same architecture as before: charcoal timber cladding, brass-framed glazing, gold canopy edge. No text, no logos, no brand badges, no signage lettering.

**Photos produits (×5, une par burger)**
> Premium food photograph of [description du burger, champ `desc` du menu], served on a sheet of plain kraft paper on a dark charcoal stone counter, warm side light from the left, soft amber rim light, shallow depth of field, three-quarter angle at burger height, glistening but natural, a few sesame seeds and crumbs. No text, no logos, no packaging branding. 4:3.

**Concepts de logo (×3)**
> Flat vector-style logo concept for a premium burger restaurant named "Lamah Burger" in Conakry, Guinea: a simple iconic emblem plus wordmark, charcoal #14100D, saffron gold #F1A51F and ember red #C8401E on cream. Bold condensed sans-serif wordmark, confident and friendly, readable at small sizes. Must not resemble any existing fast-food brand (no arches, no clown, no crown). Plain background, no mockup.

## Journal de production

| Étape | Modèle / mode | Job ID | Résultat | Crédits |
|---|---|---|---|---|
| — | — | — | Aucune génération (connecteur non connecté) | 0 |

Consigner ici chaque job (y compris ceux en attente — un job en attente n'est pas un échec), le solde avant/après (les extensions peuvent coûter plus que l'estimation car elles traitent aussi la vidéo d'entrée) et les réparations.

## Mesures et contrôles réalisés

- Mire de test synthétique (`npm run frames:dev`, 900 images à 20 i/s, jamais publiée) : `tests/flight-check.mjs` en Chromium, 1440×900 et 390×844 (DPR 3). Chaque beat atteint l'image prévue au début, au milieu et à la fin ; le bon chapitre est visible au milieu de chaque beat ; aucun texte pendant les transitions ; arrêt final tenu ; molette aller-retour : écart médian 0 image entre image demandée et image affichée (p95 ≈ 7–8, rattrapé à l'arrêt) ; pas de défilement horizontal ; le focus clavier n'entre jamais dans un chapitre masqué ; en-tête lisible sur les sections claires ; « Passer la visite » mène à la carte ; formulaire en mode démo explicite ; mode mouvement réduit = chapitres empilés sur images fixes.
- Non vérifié : fluidité et poids réels avec les vraies images (la mire compresse beaucoup mieux qu'une vidéo réelle — prévoir 60–120 Ko par image en 1440 px, soit ≈ 55–110 Mo pour 900 images, chargées à la demande), rendu sur vrais téléphones et Safari.
