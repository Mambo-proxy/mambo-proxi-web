# Inventaire — site/navigation-menu-mobile-ouvert-mobile

- Figma : frame `72:10211` « Navigation — Menu mobile ouvert — Mobile 390 » — panneau plein écran, fond `--mp-color-neutral-0` #fff.
- Équivalent mobile du header desktop + méga-menu.

## Structure
| Node | Calque | Détails |
|------|--------|---------|
| 72:10212 | Barre | px 16, py 12, justify-between : logo mobile (Symbole 46,8 × 35,6, `Mambo` dégradé Poppins Bold 19,8, `Proxi` Poppins Medium 12,6 vert-600) + bouton **Fermer** rond 44, fond `--mp-color-neutral-100` #f1efec, icône `close` (x) 22 |
| 72:10227 | Liens | px 20, py 8 ; liste en accordéon |
| 72:10309 | Actions | bordure haute border-default, pt 16 / pb 28, px 20, gap 10 |

## Liens (accordéon) — chaque item : bordure basse border-default, py 13 ; libellé Poppins SemiBold 19/28 text-main ; icône 20 à droite
| Ordre | Libellé | Icône | État |
|-------|---------|-------|------|
| 1 | Accueil | — | lien simple |
| 2 | **Nos services** (couleur text-brand #ad5300) | `minus` | **ouvert** |
| 3 | Partenaires | `plus` | fermé |
| 4 | Formation | `plus` | fermé |
| 5 | Mission | `plus` | fermé |
| 6 | Qui sommes-nous ? | `plus` | fermé |
| 7 | Recrutement | `plus` | fermé |
| 8 | Contact | `plus` | fermé |

Sous-menu « Nos services » (gap 8) — lignes fond neutral-50, radius 16, px 12 py 9, gap 12 ; pastille 36 radius 11 (fond blanc, sauf Culture : neutral-900) + icône 17 ; titre Inter SemiBold 14/20 ; compteur Inter 12/16 text-muted ; chevron-right 16 :

| Rubrique | Compteur | Icône |
|----------|----------|-------|
| Expérience | 5 services | sparkles |
| Immobilier | 7 services | building |
| Services de proximité | 3 services | cart |
| Culture & événementiel | 4 services | compass (blanc sur noir) |

## Actions (bas du panneau)
| Bouton | Variante | Disposition |
|--------|----------|-------------|
| `S'inscrire` | secondaire bordé (border-strong, radius 12, px 16 py 13, Inter SemiBold 16/24) | rangée 1, flex 1 |
| `Devis gratuit` | Button Primary | rangée 1, flex 1 |
| `Écrire sur WhatsApp` | Button WhatsApp pleine largeur | rangée 2 |

Destinations : Accueil → / ; rubriques → /experience, /immobilier, /services-de-proximite, /culture-evenementiel ; S'inscrire → /inscription ; Devis gratuit → /devis ; WhatsApp → wa.me ; Fermer → ferme le panneau. Pas d'informations de contact (téléphones/e-mail) dans ce panneau.
