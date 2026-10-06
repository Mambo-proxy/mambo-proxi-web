# Inventaire — site/devis-gratuit-mobile (différences vs desktop)

- Frame : `70:8481` « Devis gratuit — Mobile 390 » — 390 × 4780,5 px
- Textes identiques au desktop (voir `devis-gratuit-desktop.md`) ; seules les différences sont listées.

## Structure
| Node | Calque | Différence |
|---|---|---|
| 70:8482 | Web/Header — Mobile | 390 × 69 (pas de TopBar sur mobile) |
| 70:8502 | Hero | fond `#f8f7f5` ; pt 20, px 20, pb 32, gap 16 ; 390 × 268 |
| 70:8524 | Contenu | une seule colonne : pt 24, px 20 ; Formulaire (350 × 2308) puis Récapitulatif (350 × 448) dessous, gap 16 |
| 70:8526 / 8579 / 8635 | Étapes 1-3 | padding **20** (au lieu de 36) ; hauteurs 666 / 776 / 834 |
| 70:8642 | Récapitulatif | **placé après le formulaire** ; carte p 20 ; aide p 20 |
| 70:8682 | Web/Footer — Mobile | 390 × 1591,5 |
| 70:8795 | Web/WhatsApp flottant | **56 × 56**, x 318 / y 772 |

## Typographie
| Élément | Desktop | Mobile |
|---|---|---|
| H1 `Votre devis gratuit ` + `en 3 minutes.` (orange `#ad5300`) | Poppins SemiBold 52/58, ls −1.3 | Poppins SemiBold **32/38**, ls **−0.8px** (3 lignes : « Votre devis gratuit en / 3 minutes. ») |
| Chapô | Inter 19/32 | Inter Regular **16/24** |
| Titres d’étape (Poppins SemiBold) | 21/28 | **18/28** (« Quel service vous intéresse ? » sur 2 lignes, « Parlez-nous de votre besoin » sur 2 lignes) |

## Progression (70:8510)
- gap 6 (au lieu de 12) ; traits de 73,5 px.
- Seule l’étape **active** affiche son libellé (`Votre besoin`) ; les étapes faite (✓) et à venir (`3`) ne montrent que la pastille 28 px.

## Mise en page des contenus
- Rubriques : grille 2 × 2, cartes **149 × 150**, gap 10.
- Puces services : retour à la ligne (Location de voiture, Photographe / Chef privé ✓, Massage bien-être / Services événementiels).
- Champs étape 2 et 3 : **un champ par ligne** (pleine largeur 306-308), espacement vertical 16 dans une « Rangée ».
- Textarea : texte d’exemple sur 3 lignes ; aide sur 2 lignes.
- Navigation étape 2 : `Retour ←` à gauche, `Continuer` (125 × 48) à droite (inchangé).
- Puces préférence : `WhatsApp` ✓, `Téléphone` sur la 1re ligne, `E-mail` sur la 2e.
- Consentement sur 4 lignes.
- Bouton `Envoyer ma demande de devis` **pleine largeur** (308 × 48).
- Bouton `Écrire sur WhatsApp` pleine largeur (310 × 48).
