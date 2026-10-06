# Composant — Web/TopBar — Desktop (`45:25`)

- Page Figma `43:2`, section « Web — Composants du site ». En tête de toutes les pages **desktop** (absent sur mobile).
- 1440 × 36 ; fond `--mp-color-neutral-900` #1c1a18 ; px 80, py 10 ; justify-between.
- Relevé sur l'instance de la fiche service (contenu identique au composant).

## Textes
| Zone | Élément | Texte exact | Typo | Couleur |
|------|---------|-------------|------|---------|
| Gauche (gap 28) | icône `phone` 14 + texte | `France  +33 6 00 00 00 00` (**deux espaces** entre « France » et « +33 », whitespace-pre) | Inter Medium 13/16 ls 0.13 | `--mp-color-neutral-200` #e4e1dc |
| | icône `phone` 14 + texte | `Cameroun  +237 6 00 00 00 00` (deux espaces) | idem | idem |
| | icône `mail` 14 + texte | `contact@mamboproxi.com` | idem | idem |
| Droite (gap 20) | horaires | `Lun – Sam · 8h – 20h` (tirets demi-cadratin U+2013, point médian) | Inter Regular 13/16 ls 0.13 | `--mp-color-neutral-400` #a8a29a |
| | réseaux (gap 14), icônes 16 | instagram · facebook · linkedin · tiktok | — | clair |

## Interactifs
| Élément | Destination présumée |
|---------|----------------------|
| France +33… | tel:+33600000000 |
| Cameroun +237… | tel:+237600000000 |
| contact@mamboproxi.com | mailto: |
| 4 icônes réseaux | URLs sociales (settings) |

## Données (settings)
Téléphones FR `+33 6 00 00 00 00`, CM `+237 6 00 00 00 00` ; e-mail `contact@mamboproxi.com` ; horaires `Lun – Sam · 8h – 20h` ; réseaux : Instagram, Facebook, LinkedIn, TikTok (pas de WhatsApp dans la topbar).
