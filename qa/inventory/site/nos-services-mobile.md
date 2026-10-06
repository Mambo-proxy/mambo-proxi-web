# Inventaire — site/nos-services-mobile (différences vs desktop)

- Figma : frame `58:1543` « Nos services — Mobile 390 », 390 × 6741,5 px. Référence : `nos-services-desktop.md`.

## Ordre des sections
| # | Node | Calque | Hauteur | Notes |
|---|------|--------|---------|-------|
| 0 | 58:1544 | Web/Header — Mobile (pas de TopBar) | 69 | |
| 1 | 58:1564 | Hero | 727 | texte puis illustration (350×240) en dessous ; px 20, pt 20 |
| 2 | 58:1590 | Navigation rubriques | 69 | py 14, px 20 ; rangée de pills de 614 px **défilante horizontalement** (déborde) |
| 3 | 58:1602 | Rubrique — Expérience | 968 | |
| 4 | 58:1670 | Rubrique — Immobilier | 1254 | |
| 5 | 58:1753 | Rubrique — Services de proximité | 755 | |
| 6 | 58:1799 | Rubrique — Culture & événementiel | 868 | |
| 7 | 58:1853 | Web/CTA — Mobile (textes surchargés) | 440 | |
| 8 | 58:1869 | Web/Footer — Mobile | 1591,5 | |
| — | 58:1982 | WhatsApp flottant 56×56 (318,772) | | |

Ordre identique. Textes identiques au desktop (hero, rubriques, 19 services : titres et descriptions inchangés).

## Hero (58:1565)
- Gap 16. Fil d'Ariane identique (`Accueil` › `Nos services`).
- Eyebrow `Nos services` Inter SemiBold **12/16 ls 0.96**.
- H1 `19 services, ` + **`un seul interlocuteur.` (#ad5300)** — **Poppins SemiBold 32/38 ls -0.64** (desktop 52/58).
- Lead identique, Inter **16/25**.
- Boutons **empilés pleine largeur** (gap 10) : `Demander un devis gratuit` puis `Écrire sur WhatsApp`.
- `Illustration — accueil` 350×240 sous le texte.

## Rubriques
- **Pas d'illustration** dans la présentation sur mobile.
- Présentation (350 px, gap 16) : numéro Poppins SemiBold **36/40** ls -0.72 (#f8cfaa) ; titre Poppins SemiBold **28/34** ls -0.42 ; sous-titre Inter SemiBold 16/24 text-brand ; description Inter 16/26 ; lien `Découvrir la rubrique` + arrow-right 16.
- Services : **liste verticale** (gap 10) de lignes 350 px : carte radius **18**, p 16, gap 14, bordure border-default ; pastille icône 44 radius 13 (icône 20) ; titre **Inter SemiBold 15/24** ; description Inter 13/19 text-muted ; **chevron-right 18** à droite. **Pas de flèche ronde ni de lien « En savoir plus »** (toute la ligne est cliquable).
- Couleurs de fond carte/pastille identiques au desktop par rubrique (ex. Expérience : carte neutral-50, pastille orange-50).

## CTA (58:1853)
- Bandeau radius 28, p 28, gap 16 ; section px 20, pb 56.
- Titre `Vous ne trouvez pas` / `votre besoin ?` — Poppins SemiBold **30/36** ls -0.45.
- Texte `Décrivez-nous votre projet : nous trouvons la bonne solution et vous répondons sous 24 h.` Inter 16/24.
- Boutons pleine largeur empilés : `Demander un devis gratuit` (sombre, **sans icône**, px 20 py 14) ; `Écrire sur WhatsApp`.
- Filigrane symbole 192×145,9 opacité 20 % pos (178,-16).

## Tailles de titres mobile
| Rôle | Mobile | Desktop |
|------|--------|---------|
| H1 | Poppins SemiBold 32/38 | 52/58 |
| Numéro rubrique | 36/40 | 56/60 |
| Titre rubrique | 28/34 | 40/48 |
| Titre service | Inter SemiBold 15/24 | Poppins SemiBold 20/28 |
| Titre CTA | 30/36 | 52/58 |
