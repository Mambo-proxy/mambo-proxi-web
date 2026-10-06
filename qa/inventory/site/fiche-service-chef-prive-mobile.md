# Inventaire — site/fiche-service-chef-prive-mobile (différences vs desktop)

- Figma : frame `62:4733` « Fiche service (Chef privé) — Mobile 390 ». Référence : `fiche-service-chef-prive-desktop.md`.
- Textes **identiques au desktop** (publics, étapes, avantages, FAQ, carte devis, avis, services liés, CTA « Prêt à recevoir / vos invités ? »).

## Ordre des sections (changements en gras)
| # | Node | Calque | Fond | Padding |
|---|------|--------|------|---------|
| 0 | — | Web/Header — Mobile (pas de TopBar) | #fff | |
| 1 | 62:4754 | Hero | neutral-50 | pt 20 / pb 32, px 20, gap 20 |
| 2 | 62:4812 | À qui s’adresse ce service ? | #fff | py 44, px 20, gap 18 |
| 3 | **62:4932** | **Devis mobile — la carte devis de la colonne latérale est insérée ici, après « À qui… »** | #fff | pb 44, px 20 |
| 4 | 62:4835 | Ce que Mambo fait concrètement | #fff | py 44, px 20 |
| 5 | 62:4877 | Les avantages pour vous | **neutral-50** (cartes blanches) | py 44, px 20 |
| 6 | 62:4909 | Questions fréquentes | #fff | py 44, px 20 |
| 7 | 62:4960 | Témoignages | neutral-50 | py 56, px 20, gap 28 |
| 8 | 62:5001 | Services liés | #fff | py 56, px 20, gap 28 |
| 9 | 62:5060 | Web/CTA — Mobile (textes surchargés identiques au desktop) | #fff | pb 56, px 20 |
| 10 | — | Web/Footer — Mobile | neutral-900 | |
| fixe | **62:5193** | **Barre d’action fixe (sticky bas d'écran)** | #fff, bordure haute border-default | pt 12 / pb 24, px 16, gap 10 |

- **Pas de bouton WhatsApp flottant** sur cette page mobile : remplacé par la barre d'action fixe.
- **Pas d'encart « Préférez un rendez-vous ? / Prendre rendez-vous »** sur mobile.
- **Pas de boutons dans le hero** sur mobile (actions portées par la carte devis et la barre fixe).

## Hero
- Fil d'Ariane identique (4 niveaux) ; tags identiques.
- H1 `Chef privé` **Poppins SemiBold 36/42 ls -0.9** (desktop 64/68).
- Lead identique, Inter 16/25.
- Galerie 350×220, gap 8 : grande `Illustration — chef` (radius 20) + colonne 100 px avec `Illustration — marche` et `Illustration — chef` (radius 16).

## Titres H2 de contenu
Poppins SemiBold **24/30 ls -0.24** (desktop h2 ≈32/40). Titres de section Témoignages / Services liés : eyebrow 12/16 ls 0.96 + Poppins SemiBold 30/36.

## Composants modifiés
- Publics : liste 1 colonne pleine largeur (cartes neutral-50 radius 16 p 16).
- Carte devis : p 20 (desktop 28), radius 24 ; boutons `Demander un devis gratuit` / `Écrire sur WhatsApp` pleine largeur ; ligne `ou appelez le +237 6 00 00 00 00`.
- Avantages : 1 colonne, cartes **blanches** sur fond neutral-50.
- Avis : 1 colonne, p 22, citation Inter 16/25.
- Services liés : 1 colonne, p 14, vignette **76×76**.

## Barre d’action fixe (62:5193)
| Bouton | Variante | Largeur |
|--------|----------|---------|
| `Devis gratuit` | Button Primary (#ff7a00) | flex 1 |
| `WhatsApp` | Button WhatsApp (#25d366) | flex 1 |
Position dans la maquette : y 759 (bas de l'écran 390×844).
