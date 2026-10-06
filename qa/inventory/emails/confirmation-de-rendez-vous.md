# Inventaire — emails/confirmation-de-rendez-vous

- Frame : `83:10490` « E-mail — Confirmation de rendez-vous » — 680 px.
- Déclencheur : prise de rendez-vous (lien footer « Prendre rendez-vous ») confirmée.
- **Gabarit identique** à `accuse-de-reception-du-devis.md` §1 (fond `#f1efec` py 40 ; carte 600 rayon 20 ; en-tête logo 83:10492 py 28 ; ruban 4 px 83:10504 ; corps 83:10505 px 44 / py 36 gap 18 ; pied 83:10524).

## Textes (verbatim)
| Node | Rôle | Texte | Typo | Couleur |
|---|---|---|---|---|
| 83:10506 | Titre | `Votre rendez-vous est confirmé.` | Poppins SemiBold 26 / 34, ls −0.26px | main |
| 83:10507 | Paragraphe | `Nous avons hâte d’échanger avec vous. Vous recevrez un rappel la veille.` | Inter Regular 16 / 26 | muted |
| 4:3 | Bouton | `Ajouter à mon agenda` | Inter SemiBold 16 / 24 | `#1c1a18` |
| 83:10523 | Signature | `L’équipe MAMBO Proxi` | Inter SemiBold 14 / 20 | main |
| 83:10525–10527 | Pied | identique aux autres e-mails (`France +33 6 00 00 00 00 · Cameroun +237 6 00 00 00 00` / `contact@mamboproxi.com · Vos services, au plus près de vous` / `Vous recevez cet e-mail suite à votre demande sur mamboproxi.com.`) | 12/16 muted ; 11/16 subtle | |

Note : le titre ne contient pas de prénom (contrairement aux autres e-mails).

## Récapitulatif (83:10508) — fond `#f8f7f5`, p 20, gap 10, rayon 14
| Libellé | Valeur exemple | Variable |
|---|---|---|
| `Motif` | `Immobilier` | `topic` (rubrique) |
| `Date` | `Jeudi 12 novembre 2026` | `appointmentDate` (format long fr) |
| `Heure` | `14:00 (heure de Douala)` | `appointmentTime` + fuseau (`timezoneLabel`) |
| `Format` | `Visio · lien envoyé la veille` | `format` (ex. Visio / Téléphone / Agence) + précision |

Styles : libellé Inter Regular 14/20 muted à gauche ; valeur Inter SemiBold 14/20 main à droite.

## Interactifs
| Libellé | Variante | Taille | Destination |
|---|---|---|---|
| `Ajouter à mon agenda` | Button Primary orange pleine largeur | 512 × 48 | fichier .ics / lien Google Calendar |

## Variables
`topic`, `appointmentDate`, `appointmentTime`, `timezoneLabel` (« heure de Douala »), `format`, `calendarUrl`.
