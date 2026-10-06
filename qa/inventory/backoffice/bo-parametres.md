# BO — Paramètres (94:11839)

Écran desktop. Fond de page `--mp-color-neutral-50` #F8F7F5 (confirmé sur ce frame). Coque : voir `_shell.md` — élément actif **Paramètres** (groupe RÉGLAGES).
Onglet affiché : **Coordonnées** (les autres onglets ne sont pas maquettés en détail ; une partie de leur contenu est résumée dans les cartes de cette vue : e-mails automatiques, utilisateurs, sauvegardes).

## 1. Régions

| Région | Node | Détails |
|---|---|---|
| Barre latérale | 94:11840 | identique `_shell.md` |
| Barre supérieure | 94:11963 | fond #FFFFFF, bordure basse #E4E1DC, padding 16px / 32px |
| Contenu | 94:11988 | padding 32px, gap 24px |
| Onglets | 94:11989 | segmenté (fond #F1EFEC, radius 12px, padding 4px, gap 4px) |
| Rangée | 94:12000 | gap 20px : colonne Formulaires (flexible) + colonne Latéral 340px |
| Formulaires | 94:12001 | 4 cartes empilées, gap 20px |
| Latéral | 94:12157 | 3 cartes, gap 16px, largeur 340px |

Carte : fond #FFFFFF, bordure 1px #E4E1DC, radius 16px, padding 24px (latéral : 22px), gap 16px. Titre de carte Inter SemiBold 16px / lh 24px #1C1A18 ; sous-titre Inter Regular 13px / lh 16px #5E5952.
Champ : libellé Inter SemiBold 14px / lh 20px #1C1A18 ; saisie fond #FFFFFF, bordure 1px #CFCAC3, radius 12px, padding 14px / 16px, gap 10px, icône 18px à gauche ; valeur Inter Regular 16px / lh 24px #1C1A18. Champs par paires (gap 16px).

## 2. Textes et valeurs

### Barre supérieure
| Texte | Node | Style |
|---|---|---|
| `Réglages` › `Paramètres` | 94:11966 / 94:11969 | fil d’Ariane Inter Regular 12px #5E5952 |
| `Paramètres` | 94:11970 | Poppins SemiBold 24px / lh 32px #1C1A18 |
| `Rechercher…` / `⌘K` | 94:11976 / 94:11977 | recherche (coque) |
| `Enregistrer` | 94:11983 | bouton primaire, icon/check-circle 16px, fond #FF7A00, radius 10px, padding 10px / 14px, Inter SemiBold 14px #1C1A18 |

### Onglets (94:11989)
| Onglet | État |
|---|---|
| `Coordonnées` | actif (fond blanc + ombre elevation/1, Inter SemiBold 13px #1C1A18) |
| `E-mails automatiques` | inactif (Inter Medium 13px #5E5952) |
| `Référencement` | inactif |
| `Utilisateurs` | inactif |
| `Sécurité & sauvegardes` | inactif |

### Carte `Coordonnées de l’agence` (94:12002)
Sous-titre : `Une seule saisie : mises à jour partout sur le site`
| Champ | Icône | Valeur |
|---|---|---|
| `Téléphone France` | icon/phone | `+33 6 00 00 00 00` |
| `Téléphone Cameroun` | icon/phone | `+237 6 00 00 00 00` |
| `E-mail de contact` | icon/mail | `contact@mamboproxi.com` |
| `Horaires` | icon/clock | `Lun – Sam · 8h – 20h` (tirets demi-cadratin « – ») |
| `Adresse de l’agence (réception des colis et courriers)` (pleine largeur) | icon/map-pin | `Adresse à compléter · Douala, Cameroun` |

### Carte `Bouton WhatsApp` (94:12049)
Sous-titre : `Affiché en bas à droite de toutes les pages` ; interrupteur dans l’en-tête : **activé** (#7DB928).
| Champ | Icône | Valeur |
|---|---|---|
| `Numéro WhatsApp` | icon/whatsapp | `+237 6 00 00 00 00` |
| `Message pré-rempli` | — | `Bonjour Mambo Proxi, je souhaite des informations sur…` |

### Carte `Réseaux sociaux` (94:12070)
| Champ | Icône | Valeur |
|---|---|---|
| `Instagram` | icon/instagram | `instagram.com/mamboproxi` |
| `Facebook` | icon/facebook | `facebook.com/mamboproxi` |
| `LinkedIn` | icon/linkedin | `linkedin.com/company/mamboproxi` |
| `TikTok` | icon/tiktok | `tiktok.com/@mamboproxi` |

### Carte `E-mails automatiques` (94:12108)
Sous-titre : `Envoyés sans action de votre part`. Lignes : séparateur bas #E4E1DC, padding 12px 0, gap 12px ; titre Inter SemiBold 14px #1C1A18 ; déclencheur / délai Inter Regular 12px #5E5952 ; bouton secondaire `Modèle` (icon/pencil 16px, fond blanc, bordure #CFCAC3, radius 10px) ; interrupteur.
| E-mail | Déclencheur / délai (verbatim) | Actif |
|---|---|---|
| `Accusé de réception` | `À chaque demande de devis, contact, inscription ou candidature` | oui |
| `Questionnaire de satisfaction` | `24 h après le passage au statut « Prestation réalisée »` | oui |
| `Confirmation et rappel de rendez-vous` | `À la confirmation, puis la veille du rendez-vous` | oui |
| `Alerte à l’équipe` | `Une notification par e-mail pour chaque nouvelle demande` | oui |

### Latéral — `Où ces informations s’affichent` (94:12158)
Liste (icon/check-circle 16px vert, Inter Regular 14px #1C1A18, gap 8px) :
- `Bandeau supérieur du site`
- `Pied de page`
- `Page Contact et carte`
- `Bouton WhatsApp flottant`
- `E-mails envoyés aux clients`

### Latéral — `Accès au back-office` (94:12187)
Sous-titre `2 utilisateurs` ; bouton secondaire `Inviter` (icon/plus).
| Avatar (fond #FCE7D5, 32px) | Nom | Rôle |
|---|---|---|
| `MB` | `Mireille Bell` | `Administratrice` |
| `ED` | `Équipe Douala` | `Éditeur (demandes et contenus)` |

### Latéral — `Sauvegarde automatique` (94:12208)
- Sous-titre : `Chaque nuit · dernière : aujourd’hui 03:00`
- Statut : icon/lock 14px + `Connexion sécurisée (HTTPS) active` (Inter SemiBold 12px `--mp-color-vert-700` #557E1B).

## 3. Données — groupes de paramètres

| Groupe | Champs |
|---|---|
| coordonnees | telephoneFrance, telephoneCameroun, emailContact, horaires, adresseAgence |
| whatsapp | actif (bool), numero, messagePrerempli |
| reseauxSociaux | instagram, facebook, linkedin, tiktok |
| emailsAutomatiques[] | cle (accuse_reception, questionnaire_satisfaction, confirmation_rappel_rdv, alerte_equipe), libelle, declencheur, delai (ex. 24 h ; veille), actif (bool), modele (sujet + corps) |
| referencement | (onglet non maquetté) |
| utilisateurs[] | nom, initiales, rôle (administrateur / éditeur « demandes et contenus »), invitation |
| securiteSauvegardes | sauvegardeAuto (quotidienne, heure 03:00), derniereSauvegarde, httpsActif |

Les coordonnées alimentent : bandeau supérieur, pied de page, page Contact + carte, bouton WhatsApp flottant, e-mails clients.

## 4. Interactions

| Élément | Type |
|---|---|
| Onglets (5) | navigation |
| `Enregistrer` | sauvegarde globale |
| Champs texte | saisie |
| Interrupteur WhatsApp / interrupteurs e-mails | activation |
| `Modèle` | édition du modèle d’e-mail |
| `Inviter` | invitation d’un utilisateur |
