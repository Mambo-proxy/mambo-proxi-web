# Composant — Web/NavLink (`45:24`, variante par défaut `45:12`)

Props Figma : `libelle` (texte, défaut « Accueil »), `actif` (booléen, défaut false), `sousMenu` (booléen, défaut false).

| Élément | Style |
|---------|-------|
| Conteneur | colonne, gap 4, px 4, py 8, centré |
| Libellé | Inter Medium 14/20 ls 0.07, `--mp-color-neutral-700` #46423d ; état actif : **Inter SemiBold**, text-main |
| Chevron (si `sousMenu`) | 14 px (chevron-down), gap 2 |
| Indicateur | point 5×5 sous le libellé, visible (orange) si `actif` |

Usages dans le header : Accueil (sans chevron), Nos services ▾ (actif sur les pages services), Partenaires ▾, Formation ▾, Mission ▾, Qui sommes-nous ? ▾, Recrutement ▾, Contact ▾.
