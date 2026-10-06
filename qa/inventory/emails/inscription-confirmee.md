# Inventaire — emails/inscription-confirmee

- Frame : `83:10528` « E-mail — Inscription confirmée » — 680 px.
- Déclencheur : création de compte (formulaire S’inscrire).
- **Gabarit identique** à `accuse-de-reception-du-devis.md` §1 (fond `#f1efec` py 40 ; carte 600 rayon 20 ; en-tête logo 83:10530 py 28 ; ruban 4 px 83:10542 ; corps 83:10543 px 44 / py 36 gap 18 ; pied 83:10550).

## Textes (verbatim)
| Node | Rôle | Texte | Typo | Couleur |
|---|---|---|---|---|
| 83:10544 | Titre | `Bienvenue chez Mambo Proxi !` | Poppins SemiBold 26 / 34, ls −0.26px | main |
| 83:10545 | Paragraphe 1 | `Votre inscription est enregistrée. Vos prochaines demandes seront plus rapides et mieux suivies.` | Inter Regular 16 / 26 | muted |
| 83:10546 | Paragraphe 2 | `Découvrez dès maintenant nos 19 services, en France comme au Cameroun.` | Inter Regular 16 / 26 | muted |
| 4:3 | Bouton | `Découvrir nos services` | Inter SemiBold 16 / 24 | `#1c1a18` |
| 83:10549 | Signature | `L’équipe MAMBO Proxi` | Inter SemiBold 14 / 20 | main |
| 83:10551–10553 | Pied | identique aux autres e-mails | | |

Notes : pas de prénom ni de récapitulatif. « 19 services » = somme des compteurs de rubriques (5 + 7 + 3 + 4) → à calculer dynamiquement (`serviceCount`). Même texte pour particulier et professionnel (aucune variante montrée).

## Interactifs
| Libellé | Variante | Taille | Destination |
|---|---|---|---|
| `Découvrir nos services` | Button Primary orange pleine largeur | 512 × 48 | page services du site |

## Variables
`serviceCount` (19), `servicesUrl`.
