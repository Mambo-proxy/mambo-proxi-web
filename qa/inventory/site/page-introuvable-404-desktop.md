# Inventaire — site/page-introuvable-404-desktop

- Frame : `83:9961` « Page introuvable (404) — Desktop 1440 » — fond de page blanc.
- Gabarit standard (TopBar + Header + Footer + WhatsApp flottant). Les composants globaux sont décrits ici car la lecture complète les a exposés.

## 1. Structure
| # | Node | Calque | Fond | Paddings / gap | Taille | Rayon |
|---|---|---|---|---|---|---|
| 1 | (45:25) | Web/TopBar — Desktop | `#1c1a18` | px 80 / py 10 | 1440 × 36 | — |
| 2 | 83:9994 | Web/Header — Desktop | blanc + `backdrop-blur 12px` ; bordure basse 1 px `#e4e1dc` | px 40 / py 18 | 1440 × 85 | — |
| 3 | 83:10067 | Contenu (2 colonnes, centrées verticalement) | `--mp-color-neutral-50` `#f8f7f5` | pt 96, pb 128, px 64 ; gap 72 | 1440 | — |
| 3.1 | 83:10068 | Illustration — voiture | `#fce7d5` (Art 560 × 420) | — | 560 × 420 | 32 |
| 3.2 | 83:10089 | Texte | — | colonne gap 18, flex 1 | ~680 | — |
| 3.2.1 | 83:10093 | Actions | — | rangée gap 10 | — | — |
| 3.2.2 | 83:10098 | Liens utiles | — | flex-wrap gap 16 | — | — |
| 4 | (46:87) | Web/Footer — Desktop | `#1c1a18` | pb 36 ; ruban 4 px puis contenu pt 40 / px 64, gap 56 | 1440 × 831,5 | — |
| 5 | 83:10226 | Web/WhatsApp flottant | `#25D366` ; ombre 0 10 14 `rgba(18,102,51,0.35)` | icône whatsapp 30 | 64 × 64, x 1348 / y 808 (24 px des bords) | 32 |

## 2. Textes — contenu 404
| Node | Rôle | Texte verbatim | Typo | Couleur |
|---|---|---|---|---|
| 83:10090 | Eyebrow | `Erreur 404` (uppercase → « ERREUR 404 ») | Inter SemiBold 13 / 16, ls 1.04px (style `web/eyebrow`) | `#ad5300` |
| 83:10091 | H1 | `Oups, cette page a pris un autre chemin.` | Poppins SemiBold 52 / 58, ls −1.3px | main `#1c1a18` (aucun mot orange) |
| 83:10092 | Paragraphe | `Elle a peut-être été déplacée ou n’existe plus. Voici quelques pistes pour retrouver votre route.` | Inter Regular 19 / 30 | muted `#5e5952` |
| 4:3 | Bouton 1 | `Retour à l’accueil` | Inter SemiBold 16 / 24 | `#1c1a18` |
| 4:19 | Bouton 2 | `Voir nos services` | Inter SemiBold 16 / 24 | main |
| 83:10100 | Lien utile | `Devis gratuit` + `arrow-right` 16 | Inter SemiBold 14 / 20, ls 0.07px | main |
| 83:10105 | Lien utile | `Contact` + `arrow-right` | idem | main |
| 83:10110 | Lien utile | `Avis clients` + `arrow-right` | idem | main |

## 2 bis. Composants globaux exposés (référence)
**TopBar** : `France  +33 6 00 00 00 00` (deux espaces après « France »), `Cameroun  +237 6 00 00 00 00`, `contact@mamboproxi.com` (Inter Medium 13/16, `#e4e1dc`, icônes phone/mail 14, gap 28) ; à droite `Lun – Sam · 8h – 20h` (Inter Regular 13/16 `#a8a29a`) + icônes instagram, facebook, linkedin, tiktok 16 (gap 14).
**Header** : logo couleur (symbole 52 × 39,5, « Mambo » Poppins Bold 22 dégradé, « Proxi » Poppins Medium 14 `#699b22`) ; navigation (Inter Medium 14/20 `#46423d`, gap 10, indicateur point 5 px) : `Accueil`, `Nos services` ▾, `Partenaires` ▾, `Formation` ▾, `Mission` ▾, `Qui sommes-nous ?` ▾, `Recrutement` ▾, `Contact` ▾ ; actions : pilule `S'inscrire` (icône user 18, bordure `#cfcac3`, rayon 999, px 14 / py 12, Inter SemiBold 14) + Button Primary `Devis gratuit`.
**Footer** : ruban 4 px dégradé horizontal `#7db928` → `#c9a814` → `#ff7a00` ; bloc newsletter fond `#2e2b28` rayon 28 p 40 : eyebrow `La lettre Mambo` (Inter SemiBold 13, ls 1.04, uppercase, `#f59842`), titre `Restez au plus près de nos nouveautés` (Poppins SemiBold 28/36 blanc), texte `Nouveaux services, sorties culturelles et conseils pour la France et le Cameroun. Désinscription en un clic.` (Inter 14/20 `#cfcac3`) ; champs pilule (fond `#1c1a18`, bordure `#46423d`, px 20 / py 14) `Votre nom` (user), `Votre adresse e-mail` (mail), `Téléphone (WhatsApp)` (phone), placeholders `#a8a29a` ; bouton `S'abonner`. Colonnes : marque (logo blanc + baseline `VOS SERVICES, AU PLUS PRÈS DE VOUS`, texte `Votre conciergerie de proximité entre la France et le Cameroun. Des services pensés pour vous, des personnes de confiance pour les réaliser.` Inter 14/22 `#cfcac3`, réseaux en pastilles 38 bordure `#46423d` : instagram, facebook, linkedin, tiktok, whatsapp) ; `Nos services` : Expérience, Immobilier, Services de proximité, Culture & événementiel, Devis gratuit ; `Mambo Proxi` : Qui sommes-nous ?, Mission, Partenaires, Avis clients, Contact ; `Nous rejoindre` : S'inscrire, Devenir partenaire, Recrutement, Formation ; `Nous contacter` : `France · +33 6 00 00 00 00`, `Cameroun · +237 6 00 00 00 00`, `contact@mamboproxi.com`, `Prendre rendez-vous` (icône calendar-check). Titres de colonnes Inter SemiBold 15/24 blanc ; liens Inter 14/20 `#cfcac3`, gap 14. Bas de page (bordure haute `#2e2b28`, pt 24, Inter 13/16 `#a8a29a`) : `© 2026 Mambo Proxi · France — Cameroun` | `Mentions légales`, `CGU`, `Politique de confidentialité`, `Cookies` (gap 24).

## 3. Données répétées
Liens utiles : Devis gratuit → `/devis-gratuit` ; Contact → `/contact` ; Avis clients → `/avis-clients`.

## 4. Interactifs
| Libellé | Variante | Destination |
|---|---|---|
| `Retour à l’accueil` | Button Primary | `/` |
| `Voir nos services` | Button Outline (bordure 1,5 `#cfcac3`) | page services |
| Liens utiles (×3) | lien texte + flèche | voir §3 |

## 5. Visuels
- Illustration « voiture » (voiture, palmiers, route, soleil) sur `#fce7d5`, rayon 32, 560 × 420.
- Icônes : arrow-right, user, phone, mail, calendar-check, instagram, facebook, linkedin, tiktok, whatsapp, chevron-down (nav).
- Ombre : bouton WhatsApp flottant uniquement.
