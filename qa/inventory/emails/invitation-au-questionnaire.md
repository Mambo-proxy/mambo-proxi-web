# Inventaire — emails/invitation-au-questionnaire

- Frame : `83:10454` « E-mail — Invitation au questionnaire » — 680 px.
- Déclencheur : prestation terminée → invitation au questionnaire de satisfaction.
- **Gabarit identique** à `accuse-de-reception-du-devis.md` §1 : fond `#f1efec` py 40 ; carte blanche 600 px rayon 20 ; en-tête logo centré py 28 (83:10456) ; ruban dégradé 4 px `#7db928` → `#c9a814` → `#ff7a00` (83:10468) ; corps px 44 / py 36 gap 18 (83:10469) ; pied `#f8f7f5` px 44 / py 24 gap 8 (83:10486).

## Textes (verbatim)
| Node | Rôle | Texte | Typo | Couleur |
|---|---|---|---|---|
| 83:10470 | Titre | `Votre avis compte, Aurélie.` | Poppins SemiBold 26 / 34, ls −0.26px | main `#1c1a18` |
| 83:10471 | Paragraphe | `Votre prestation « Chef privé » du 14 novembre est terminée. Pouvez-vous nous dire comment elle s’est passée ? 5 questions, 2 minutes.` (guillemets « » avec espaces, apostrophe ’) | Inter Regular 16 / 26 | muted `#5e5952` |
| 4:3 | Bouton | `Donner mon avis` | Inter SemiBold 16 / 24 | `#1c1a18` |
| 83:10485 | Signature | `L’équipe MAMBO Proxi` | Inter SemiBold 14 / 20, ls 0.07px | main |
| 83:10487 | Pied 1 | `France +33 6 00 00 00 00 · Cameroun +237 6 00 00 00 00` | Inter 12 / 16 | muted |
| 83:10488 | Pied 2 | `contact@mamboproxi.com · Vos services, au plus près de vous` | Inter 12 / 16 | muted |
| 83:10489 | Pied mention | `Vous recevez cet e-mail suite à votre demande sur mamboproxi.com.` | Inter 11 / 16 | subtle `#7d776f` |

## Bloc spécifique
| Node | Bloc | Détail |
|---|---|---|
| 83:10472 | Étoiles | 5 icônes `star` **34 × 34**, gap 8, centrées, toutes identiques (même asset, état « vide/à noter ») ; décoratives ou liens vers le questionnaire pré-noté 1-5 (à décider) |
Pas de bloc récapitulatif.

## Interactifs
| Libellé | Variante | Taille | Destination |
|---|---|---|---|
| `Donner mon avis` | Button Primary orange pleine largeur | 512 × 48 | lien du questionnaire (`/questionnaire/{token}`) |

## Variables
`firstName` (Aurélie), `serviceName` (Chef privé), `serviceDate` (format court « 14 novembre », sans jour ni année), `surveyUrl`. Texte fixe « 5 questions, 2 minutes. »
