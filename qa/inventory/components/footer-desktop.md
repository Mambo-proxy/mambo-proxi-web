# Composant — Web/Footer — Desktop (`46:87`)

- 1440 × 831,5 ; fond `--mp-color-neutral-900` #1c1a18 ; pb 36 ; gap 56.
- **Ruban** (46:88) : 4 px, dégradé horizontal #7db928 → #c9a814 (50 %) → #ff7a00.
- Contenu (46:89) : pt 40, px 64, gap 56.

## 1. Newsletter (46:90) — fond `--mp-color-neutral-800` #2e2b28, radius 28, p 40, justify-between
| Rôle | Texte | Typo | Couleur |
|------|-------|------|---------|
| Eyebrow | `La lettre Mambo` (uppercase) | Inter SemiBold 13/16 ls 1.04 | `--mp-color-orange-400` |
| Titre | `Restez au plus près de nos nouveautés` | Poppins SemiBold 28/36 | #fff |
| Texte | `Nouveaux services, sorties culturelles et conseils pour la France et le Cameroun. Désinscription en un clic.` | Inter 14/20 | `--mp-color-neutral-300` |

Formulaire (gap 10) — champs pill fond neutral-900, bordure `--mp-color-neutral-700` #46423d, px 20 py 14, gap 10 ; placeholder Inter 16/24 `--mp-color-neutral-400` :
| Champ | Icône | Placeholder | Type présumé | Astérisque |
|-------|-------|-------------|--------------|------------|
| Champ nom | user | `Votre nom` | text | aucune |
| Champ e-mail | mail | `Votre adresse e-mail` | email | aucune (requis présumé) |
| Champ téléphone | phone | `Téléphone (WhatsApp)` | tel | aucune |
| Bouton | — | `S'abonner` (Button Primary) | submit | |
Aucun texte de consentement visible.

## 2. Colonnes (46:103, gap 40)
**Marque** (300 px, gap 20) : logo blanc (Symbole M-Lien 88,4 × 67,2 ; `Mambo` Poppins Bold 39,5 ; `Proxi` Poppins Medium 25 ; signature `VOS SERVICES, AU PLUS PRÈS DE VOUS` Poppins Medium 6,24 ls 1.25) ; texte `Votre conciergerie de proximité entre la France et le Cameroun. Des services pensés pour vous, des personnes de confiance pour les réaliser.` (Inter 14/22, neutral-300) ; réseaux : 5 boutons ronds bordure neutral-700, p 10, icônes 18 : **instagram, facebook, linkedin, tiktok, whatsapp**.

Colonnes de liens (gap 28) — titres Inter SemiBold 15/24 blanc ; liens Inter 14/20 neutral-300, gap 14 :
| Nos services | Mambo Proxi | Nous rejoindre | Nous contacter |
|--------------|-------------|----------------|----------------|
| Expérience | Qui sommes-nous ? | S'inscrire | (phone) `France · +33 6 00 00 00 00` |
| Immobilier | Mission | Devenir partenaire | (phone) `Cameroun · +237 6 00 00 00 00` |
| Services de proximité | Partenaires | Recrutement | (mail) `contact@mamboproxi.com` |
| Culture & événementiel | Avis clients | Formation | (calendar-check) `Prendre rendez-vous` |
| Devis gratuit | Contact | | |

## 3. Bas de page (46:182) — bordure haute neutral-800, pt 24 ; Inter 13/16 ls 0.13 neutral-400
- Gauche : `© 2026 Mambo Proxi · France — Cameroun` (tiret cadratin U+2014)
- Droite (gap 24) : `Mentions légales` · `CGU` · `Politique de confidentialité` · `Cookies`

## Destinations présumées
Rubriques → /experience, /immobilier, /services-de-proximite, /culture-evenementiel, /devis ; Mambo Proxi → /qui-sommes-nous, /mission, /partenaires, /avis, /contact ; Nous rejoindre → /inscription, /devenir-partenaire, /recrutement, /formation ; contacts → tel:, mailto:, /rendez-vous ; légal → /mentions-legales, /cgu, /confidentialite, /cookies ; newsletter → POST abonnement.
