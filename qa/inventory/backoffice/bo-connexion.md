# BO — Connexion (95:11689)

Écran desktop (1440 de large), sans coque : page de connexion plein écran en 2 colonnes. Fond #FFFFFF.

## 1. Régions

| Région | Node | Taille | Détails |
|---|---|---|---|
| Visuel (gauche) | 95:11690 | 640 × pleine hauteur | fond `--mp-color-neutral-900` #1C1A18, padding 56px, colonne space-between |
| Logo | 95:11691 | — | symbole M-Lien 57,2 × 43,47 + « Mambo » (Poppins Bold 24,2px, tracking −0,726px) / « Proxi » (Poppins Medium 15,4px), lettrage **blanc** (#FFFFFF) sur fond sombre |
| Illustration | 95:11702 | 528 × 380 | scène « equipe », fond #FCE7D5, radius 24px |
| Accroche | 95:11740 | 528 large | gap 10px |
| Formulaire (droite) | 95:11743 | reste de la largeur | contenu centré verticalement et horizontalement |
| Carte | 95:11744 | 400 large | colonne gap 20px (pas de fond ni bordure) |

## 2. Textes et typographie

| Texte (verbatim) | Node | Rôle | Typo |
|---|---|---|---|
| `Pilotez tout le site depuis un seul endroit.` | 95:11741 | accroche | Poppins SemiBold 30px / lh 38px, tracking −0,3px, #FFFFFF |
| `Demandes, services, contenus, avis et rendez-vous : votre agence, simplement.` | 95:11742 | sous-accroche | Inter Regular 16px / lh 24px, `--mp-color-neutral-300` #CFCAC3 |
| `Connexion au back-office` | 95:11745 | titre | Poppins SemiBold 30px / lh 38px, tracking −0,3px, #1C1A18 |
| `Accès réservé à l’équipe MAMBO Proxi.` | 95:11746 | sous-titre | Inter Regular 16px / lh 24px #5E5952 |
| `Adresse e-mail` | 95:11749 | libellé | Inter SemiBold 14px / lh 20px #1C1A18 |
| `mireille@mamboproxi.com` | 95:11754 | valeur saisie (icon/mail 18px) | Inter Regular 16px / lh 24px #1C1A18 ; champ bordure 1px #CFCAC3, radius 12px, padding 14px / 16px |
| `Mot de passe` | 95:11757 | libellé | idem |
| `••••••••••` (10 puces) | 95:11762 | valeur masquée (icon/lock 18px) | champ **focus** : bordure 2px #FF7A00 |
| `Rester connecté` | 95:11768 | case à cocher **cochée** (20 × 20, fond #FF7A00, radius 6px, icon/check 14px) | Inter Regular 14px #1C1A18 |
| `Mot de passe oublié ?` | 95:11769 | lien | Inter SemiBold 14px `--mp-color-text-brand` #AD5300 |
| `Se connecter` | (instance Button 4:2) | bouton primaire pleine largeur | fond #FF7A00, radius 12px, padding 12px / 24px, hauteur 48px, Inter SemiBold 16px / lh 24px `--mp-color-text-on-primary` #1C1A18 |
| `Connexion sécurisée · double vérification par e-mail` | 95:11776 | mention sécurité (icon/lock 14px), centrée | Inter Regular 12px / lh 16px #5E5952 |

Note composant Button (description Figma) : Primary = fond orange + libellé foncé (contraste 6,6:1) ; Secondary = violet + blanc ; WhatsApp = vert #25D366 ; hauteur 48px ; libellés à l’infinitif.

## 3. Données / logique

- Authentification : e-mail + mot de passe, option « Rester connecté » (session longue), lien de réinitialisation du mot de passe.
- Double vérification par e-mail (2FA par code / lien e-mail) après saisie des identifiants.
- Accès réservé aux utilisateurs du back-office (voir Paramètres › Utilisateurs : rôles Administrateur / Éditeur).

## 4. Interactions

| Élément | Type |
|---|---|
| Champs e-mail / mot de passe | saisie (état focus = bordure 2px orange) |
| `Rester connecté` | case à cocher |
| `Mot de passe oublié ?` | lien vers réinitialisation |
| `Se connecter` | soumission |
