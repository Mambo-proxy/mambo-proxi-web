import type { Page } from '@/lib/api/schema';

/**
 * Pages légales simulées. « Mentions légales » reprend le texte de la maquette (`71:9645`) ; les trois autres sont des
 * modèles marqués « à compléter » : le texte juridique est fourni par la cliente (docs/03, Pages légales).
 */
type LegalKey = 'mentions-legales' | 'confidentialite' | 'cookies' | 'cgu';

type Article = { title: string; html: string };

const UPDATED = 'Dernière mise à jour : octobre 2026';

function legalPage(key: LegalKey, title: string, articles: Article[], toComplete: boolean): Page {
  return {
    key,
    title,
    updatedAt: '2026-10-01T08:00:00.000Z',
    isPreview: false,
    seo: { title, description: `${title} du site MAMBO Proxi.`, ogImageUrl: null, noindex: false },
    sections: [
      {
        id: 'hero',
        type: 'hero',
        enabled: true,
        variant: 'legal',
        title,
        updatedLabel: UPDATED,
        showWhatsapp: false,
      },
      { id: 'contenu', type: 'richText', enabled: true, articles, toComplete },
    ],
  };
}

export const legalPages: Record<LegalKey, Page> = {
  'mentions-legales': legalPage(
    'mentions-legales',
    'Mentions légales',
    [
      {
        title: 'Éditeur du site',
        html: '<p>Le site est édité par MAMBO Proxi. Raison sociale, forme juridique, adresse du siège, numéro d’immatriculation et responsable de la publication : informations à compléter par la cliente.</p>',
      },
      {
        title: 'Hébergement',
        html: '<p>Nom, adresse et coordonnées de l’hébergeur du site : à compléter à la mise en ligne.</p>',
      },
      {
        title: 'Propriété intellectuelle',
        html: '<p>L’ensemble des contenus du site (textes, logos, photographies, éléments graphiques) est la propriété de MAMBO Proxi, sauf mention contraire. Toute reproduction sans autorisation est interdite.</p>',
      },
      {
        title: 'Données personnelles',
        html: '<p>Les données collectées par les formulaires sont limitées au nécessaire et utilisées uniquement pour répondre à vos demandes. Vous disposez d’un droit d’accès, de rectification et de suppression. Voir la <a href="/confidentialite">politique de confidentialité</a>.</p>',
      },
      {
        title: 'Contact',
        html: '<p>Pour toute question : <a href="mailto:contact@mamboproxi.com">contact@mamboproxi.com</a>.</p>',
      },
    ],
    false,
  ),
  confidentialite: legalPage(
    'confidentialite',
    'Politique de confidentialité',
    [
      {
        title: 'Responsable du traitement',
        html: '<p>MAMBO Proxi, dont les coordonnées figurent dans les <a href="/mentions-legales">mentions légales</a>. Informations à compléter par la cliente.</p>',
      },
      {
        title: 'Données collectées',
        html: '<p>Nous collectons uniquement les données que vous saisissez dans nos formulaires :</p><ul><li>identité et coordonnées (nom, e-mail, téléphone, pays et ville) ;</li><li>description de votre besoin et préférences de contact ;</li><li>pièces jointes que vous choisissez d’envoyer (CV).</li></ul>',
      },
      {
        title: 'Finalités et bases légales',
        html: '<p>Répondre à vos demandes de devis, de contact, de rendez-vous ou de partenariat, sur la base de votre consentement ; envoyer la lettre d’information si vous l’avez demandée. À compléter par la cliente.</p>',
      },
      {
        title: 'Durée de conservation',
        html: '<p>Durées de conservation par type de demande : à compléter par la cliente.</p>',
      },
      {
        title: 'Vos droits',
        html: '<p>Vous disposez d’un droit d’accès, de rectification, d’effacement, d’opposition et de portabilité. Pour les exercer : <a href="mailto:contact@mamboproxi.com">contact@mamboproxi.com</a>.</p>',
      },
    ],
    true,
  ),
  cookies: legalPage(
    'cookies',
    'Gestion des cookies',
    [
      {
        title: 'Cookies nécessaires',
        html: '<p>Ils permettent au site de fonctionner (mémorisation de vos choix de cookies, sécurité des formulaires) et ne peuvent pas être désactivés.</p>',
      },
      {
        title: 'Mesure d’audience',
        html: '<p>Avec votre accord uniquement, nous mesurons la fréquentation du site (Google Analytics 4) pour l’améliorer. Aucun script de mesure n’est chargé avant votre choix.</p>',
      },
      {
        title: 'Durée de vos choix',
        html: '<p>Votre choix est conservé 6 mois. Vous pouvez le modifier à tout moment depuis cette page ou le lien « Cookies » du pied de page.</p>',
      },
    ],
    true,
  ),
  cgu: legalPage(
    'cgu',
    'Conditions générales d’utilisation',
    [
      {
        title: 'Objet',
        html: '<p>Conditions d’utilisation du site MAMBO Proxi : à compléter par la cliente.</p>',
      },
      {
        title: 'Accès au site',
        html: '<p>Le site est accessible gratuitement. MAMBO Proxi peut en suspendre l’accès pour maintenance.</p>',
      },
      {
        title: 'Responsabilité',
        html: '<p>Conditions de responsabilité et droit applicable : à compléter par la cliente.</p>',
      },
    ],
    true,
  ),
};
