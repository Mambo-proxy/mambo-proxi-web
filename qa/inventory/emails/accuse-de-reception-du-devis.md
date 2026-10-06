# Inventaire — emails/accuse-de-reception-du-devis

- Frame : `83:10416` « E-mail — Accusé de réception du devis » — 680 px de large.
- Déclencheur : soumission du formulaire de devis.

## 1. Gabarit (commun aux 4 e-mails — à reproduire en React Email)
| # | Node | Bloc | Fond | Paddings / gap | Taille | Rayon |
|---|---|---|---|---|---|---|
| 0 | 83:10416 | Fond extérieur (body) | `--mp-color-neutral-100` `#f1efec` | py 40, contenu centré | 680 | — |
| 1 | 83:10417 | Message (carte) | blanc `#ffffff`, overflow hidden | colonne, sans gap | **600** | **20** |
| 1.1 | 83:10418 | En-tête : logo centré | blanc | py 28, centré | 600 | — |
| 1.1.a | 83:10419 | Logo couleur | — | gap 7 : symbole « M-Lien » 52 × 39,5 + « Mambo » (Poppins Bold 22, ls −0.66px, texte en dégradé 165,5° `#ff9a1f` 14,6 % → `#ff7a00` 53,5 % → `#f0550f` 85,4 %) au-dessus de « Proxi » (Poppins Medium 14, `#699b22`) | — | — |
| 1.2 | 83:10430 | Ruban dégradé (`gradient/lien`) | linear-gradient horizontal `#7db928` → `#c9a814` (50 %) → `#ff7a00` | — | 600 × **4** | 0 |
| 1.3 | 83:10431 | Corps | blanc | **px 44 / py 36**, colonne **gap 18** | 600 | — |
| 1.4 | 83:10450 | Pied | `--mp-color-neutral-50` `#f8f7f5` | px 44 / py 24, gap 8, centré | 600 | — |

Recommandations e-mail : le texte « Mambo » en dégradé n’est pas supporté par la plupart des clients mail → utiliser le logo en image (PNG) ; polices de repli Poppins → Arial/Helvetica, Inter → Arial/Helvetica.

## 2. Textes (verbatim)
| Node | Rôle | Texte | Typo | Couleur |
|---|---|---|---|---|
| 83:10432 | Titre (H1) | `Bonjour Aurélie, nous avons bien reçu votre demande.` | Poppins SemiBold 26 / 34, ls −0.26px | main `#1c1a18` |
| 83:10433 | Paragraphe | `Merci pour votre confiance. Un conseiller étudie votre besoin et vous envoie un devis personnalisé sous 24 h.` | Inter Regular 16 / 26 | muted `#5e5952` |
| 83:10436–10446 | Récapitulatif | voir §3 | libellé Inter Regular 14/20 muted ; valeur Inter SemiBold 14/20, ls 0.07px, main | |
| 4:3 | Bouton | `Écrire à mon conseiller sur WhatsApp` | Inter SemiBold 16 / 24 | `#1c1a18` |
| 83:10449 | Signature | `L’équipe MAMBO Proxi` (apostrophe ’, MAMBO en capitales) | Inter SemiBold 14 / 20, ls 0.07px | main |
| 83:10451 | Pied ligne 1 | `France +33 6 00 00 00 00 · Cameroun +237 6 00 00 00 00` | Inter Regular 12 / 16, ls 0.12px, centré | muted |
| 83:10452 | Pied ligne 2 | `contact@mamboproxi.com · Vos services, au plus près de vous` | Inter Regular 12 / 16 | muted |
| 83:10453 | Pied mention | `Vous recevez cet e-mail suite à votre demande sur mamboproxi.com.` | Inter Regular **11** / 16, ls 0.11px | subtle `#7d776f` |

## 3. Récapitulatif (83:10434) — fond `#f8f7f5`, p 20, gap 10, rayon 14 ; lignes libellé à gauche / valeur à droite (justify-between)
| Libellé | Valeur exemple | Variable |
|---|---|---|
| `Référence` | `MP-2026-0142` | `reference` |
| `Service` | `Chef privé` | `serviceName` |
| `Date souhaitée` | `Samedi 14 novembre 2026` | `desiredDate` (format long fr, majuscule initiale) |
| `Ville` | `Douala` | `city` |

## 4. Interactifs
| Libellé | Variante | Taille | Destination |
|---|---|---|---|
| `Écrire à mon conseiller sur WhatsApp` | Button **Primary orange** (`#ff7a00`, texte `#1c1a18`, px 24 / py 12, rayon 12) — et non la variante verte WhatsApp | pleine largeur 512 × 48 | lien wa.me (message pré-rempli avec la référence) |

## 5. Variables
`firstName` (Aurélie), `reference`, `serviceName`, `desiredDate`, `city`, `whatsappUrl`. Constantes : téléphones FR/CM, e-mail de contact, baseline.
