# Inventaire — site/questionnaire-de-satisfaction-desktop

- Frame : `82:9565` « Questionnaire de satisfaction — Desktop 1440 » — fond de page `--mp-color-neutral-50` `#f8f7f5`.
- Page autonome (lien reçu par e-mail) : **pas de TopBar, Header, Footer ni bouton WhatsApp flottant**, seulement une barre logo.
- Note espaces : espace avant `?` dans les questions ; à rendre en espace insécable.

## 1. Structure
| # | Node | Calque | Fond | Paddings / gap | Taille | Rayon |
|---|---|---|---|---|---|---|
| 1 | 82:9566 | Barre (logo centré) | blanc ; bordure basse 1 px `#e4e1dc` | px 20 / py 18, contenu centré | 1440 × ~76 | 0 |
| 1.1 | 82:9567 | Logo (couleur) | — | gap 7 | symbole 52 × 39,5 + lettrage | — |
| 2 | 82:9578 | Contenu | `#f8f7f5` | pt 56, pb 96, colonne centrée | 1440 | — |
| 2.1 | 82:9579 | Carte | blanc ; bordure 1 px `#e4e1dc` | p 48, gap 28 | **720** de large | 28 |
| 2.1.1 | 82:9580 | En-tête | — | gap 10 | 624 | — |
| 2.1.2 | 82:9583 | Prestation (rappel) | `#f8f7f5` | p 14, gap 12 | pleine largeur | 16 |
| 2.1.3 | 82:9619 | Progression (5 segments) | — | gap 6, segments h 6 flex | pleine largeur | 999 |
| 2.1.4 | 82:9625 → 82:9693 | Questions 1 à 5 | — | chaque question gap 12 | — | — |
| 2.1.5 | 82:9700 | Consentement | — | gap 12 | — | — |
| 2.1.6 | 82:9704 | Bouton | Primary pleine largeur | — | 624 × 48 | 12 |
| 2.1.7 | 82:9705 | Mention de pied | — | centré | — | — |

## 2. Textes
| Node | Rôle | Texte verbatim | Typo | Couleur |
|---|---|---|---|---|
| I82:9567;17:22 | Logo | `Mambo` | Poppins Bold 22, ls −0.66px, texte en dégradé `gradient/energie` (165,5° : `#ff9a1f` 14,6 % → `#ff7a00` 53,5 % → `#f0550f` 85,4 %) | dégradé |
| I82:9567;17:23 | Logo | `Proxi` | Poppins Medium 14 | `--mp-color-vert-600` `#699b22` |
| 82:9581 | Surtitre | `Questionnaire de satisfaction` (affiché en CAPITALES via uppercase) | Inter SemiBold 12 / 16, ls 0.96px | `--mp-color-text-brand` `#ad5300` |
| 82:9582 | H1 | `Comment s’est passée votre prestation ?` (apostrophe ’) | Poppins SemiBold 32 (`--mp-font-size-h2`) / 40, ls −0.32px | main `#1c1a18` |
| 82:9617 | Prestation – intitulé | `Chef privé · samedi 14 novembre 2026` | Inter SemiBold 14 / 20, ls 0.07px | main |
| 82:9618 | Prestation – référence | `Demande MP-2026-0142` | Inter Regular 12 / 16, ls 0.12px | muted `#5e5952` |
| 82:9626 | Question 1 | `1. Quelle note donnez-vous à la prestation ?` | Inter SemiBold 16 / 24 | main |
| 82:9638 | Libellé de la note | `Très bien` | Inter Regular 12 / 16 | muted |
| 82:9640 | Question 2 | `2. Le prestataire était-il ponctuel et professionnel ?` | Inter SemiBold 16 / 24 | main |
| 82:9653 | Question 3 | `3. L’équipe Mambo vous a-t-elle bien informé ?` | Inter SemiBold 16 / 24 | main |
| 82:9666 | Question 4 | `4. Recommanderiez-vous Mambo Proxi à un proche ?` | Inter SemiBold 16 / 24 | main |
| 82:9691 / 82:9692 | Bornes échelle | `Peu probable` (gauche) / `Très probable` (droite) | Inter Regular 12 / 16 | muted |
| 82:9694 | Question 5 | `5. Un commentaire à partager ?` | Inter SemiBold 16 / 24 | main |
| 82:9697 | Label | `Votre commentaire` | Inter SemiBold 14 / 20 | main |
| 82:9699 | Placeholder | `Ce qui vous a plu, ce que nous pouvons améliorer…` (« … » U+2026) | Inter Regular 16 / 24 | subtle `#7d776f` |
| 82:9702 | Consentement publication | `J’accepte que mon avis (prénom, ville, note et commentaire) soit publié sur le site après validation par l’agence.` (apostrophes ’) | Inter Regular 14 / 20 | muted |
| 4:3 (82:9704) | Bouton | `Envoyer mes réponses` | Inter SemiBold 16 / 24 | `#1c1a18` |
| 82:9705 | Pied | `2 minutes · 5 questions · réponses confidentielles` | Inter Regular 12 / 16, centré | muted |

## 3. Questions (modèle)
| N° | Libellé | Type | Options / échelle | Valeur montrée | Style |
|---|---|---|---|---|---|
| 1 | `1. Quelle note donnez-vous à la prestation ?` | note 1-5 étoiles | 5 icônes `star` 36 × 36, gap 8 | **4/5** (4 étoiles pleines orange, 1 vide) → libellé `Très bien` sous les étoiles | les libellés des autres notes ne sont pas montrés |
| 2 | `2. Le prestataire était-il ponctuel et professionnel ?` | choix unique (puces) | `Oui, tout à fait` · `Plutôt oui` · `Plutôt non` · `Non` | `Oui, tout à fait` sélectionné | puces px 14 / py 9, rayon 999 ; sélection fond `#1c1a18` + check blanc 14 ; sinon blanc + bordure `#cfcac3` |
| 3 | `3. L’équipe Mambo vous a-t-elle bien informé ?` | choix unique (puces) | mêmes 4 options | `Plutôt oui` sélectionné | idem |
| 4 | `4. Recommanderiez-vous Mambo Proxi à un proche ?` | échelle NPS 0-10 | 11 cases `0`…`10`, flex égales, h 40, rayon 10, gap 6 ; bornes `Peu probable` / `Très probable` | `9` sélectionné (fond `#1c1a18`, texte blanc) | cases blanches bordure `#cfcac3`, Inter Medium 14/20 |
| 5 | `5. Un commentaire à partager ?` | texte libre (textarea h 110) | label `Votre commentaire`, placeholder ci-dessus | vide | bordure `#cfcac3`, rayon 12, px 16 / py 14 |
| — | Consentement publication | checkbox (décochée, 20 px, bordure 1,5 `#cfcac3`, rayon 6) | texte verbatim ci-dessus | — | optionnel (aucun astérisque) |

Aucune question n’est marquée requise (pas d’astérisque). Aucun état d’erreur n’est représenté.

### Progression (82:9619)
5 segments égaux (un par question) h 6, rayon 999, gap 6 : **2 premiers remplis** `--mp-color-brand-primary` `#ff7a00`, 3 suivants `--mp-color-neutral-100` `#f1efec` (alors que les questions 1 à 4 ont une réponse dans la maquette → progression indicative).

## 4. Interactifs
| Élément | Détail |
|---|---|
| Étoiles | radio 1-5, survol/remplissage orange |
| Puces Q2/Q3 | radio |
| Échelle Q4 | radio 0-10 |
| Textarea Q5 | facultatif |
| Checkbox publication | facultatif |
| `Envoyer mes réponses` | Button Primary pleine largeur → page `questionnaire-merci` |
| Logo | lien probable vers `/` |

## 5. Visuels
- Illustration « chef » 48 × 48, fond `#fce7d5`, rayon 12 (Art 64 × 48 centré).
- Icônes : star (pleine orange / contour), check.
- Rayons : carte 28 ; bloc prestation 16 ; saisies/bouton 12 ; cases échelle 10 ; checkbox 6 ; puces/segments 999. Pas d’ombre.
