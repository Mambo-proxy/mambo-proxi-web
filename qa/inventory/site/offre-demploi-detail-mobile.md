# Inventaire — site/offre-demploi-detail-mobile

- Figma : fileKey `lsun63JexZYvgYUVpmSYyg`, frame `82:9299` « Offre d’emploi (détail) — Mobile 390 » (390 × 3256,5)
- Différences uniquement par rapport à `offre-demploi-detail-desktop.md`. Tailles déduites des hauteurs de boîtes.

## Différences vs desktop

- Header mobile (69), pas de TopBar, Footer mobile, WhatsApp flottant 56 (x 318, y 772).
- Ordre : Hero → Colonne principale (Le poste, Vos missions, Votre profil, Ce que nous offrons) → **carte latérale « Intéressé·e ? » placée après tout le contenu** → lien `Voir toutes les offres` → Footer.

### Hero (82:9320, h 318)
- p 20 (pt 20). Fil d'Ariane identique sur 3 niveaux (369 px de large : arrive au bord droit de l'écran 390 → risque de débordement, prévoir troncature/ellipse du dernier niveau).
- Titre H1 `Coordinateur·rice de services` sur 2 lignes (h 72 → ~30/36).
- Méta empilées sur 3 rangées : `Douala, Cameroun` + `CDI · temps plein` / `Prise de poste : janvier 2027` / `Publiée le 2 octobre 2026` (gap vertical 12).

### Contenu (82:9356, h 1278)
- Chaque bloc a px 20 et un espacement haut de 32 ; titres de bloc h 32 (taille réduite, ~22–24/32).
- Paragraphe `Le poste` sur 4 lignes (h 100, ~16/25).
- Items de liste longs passent sur 2 lignes (largeur 314).

### Carte « Intéressé·e ? » (82:9423)
- 350 × 250, mêmes contenus ; bouton `Postuler à cette offre` 292 px ; boutons de partage centrés.
- Aucun texte différent.
