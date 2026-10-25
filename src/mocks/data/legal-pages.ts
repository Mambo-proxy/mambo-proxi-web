import type { Page } from '@/lib/api/schema';

/**
 * Pages légales simulées. « Mentions légales » reprend le texte de la maquette (`71:9645`) ; les trois autres sont des
 * modèles marqués « à compléter » : le texte juridique est fourni par la cliente (docs/03, Pages légales).
 */
type LegalKey = 'mentions-legales' | 'confidentialite' | 'cookies' | 'cgu';

type Article = { title: string; html: string };

const UPDATED = 'Dernière mise à jour : octobre 2026';
const UPDATED_EN = 'Last updated: October 2026';

function legalPage(
  key: LegalKey,
  title: string,
  articles: Article[],
  toComplete: boolean,
  updated = UPDATED,
): Page {
  return {
    key,
    title,
    updatedAt: '2026-10-01T08:00:00.000Z',
    isPreview: false,
    seo: {
      title,
      description:
        updated === UPDATED ? `${title} du site MAMBO Proxi.` : `${title} of the MAMBO Proxi website.`,
      ogImageUrl: null,
      noindex: false,
    },
    sections: [
      {
        id: 'hero',
        type: 'hero',
        enabled: true,
        variant: 'legal',
        title,
        updatedLabel: updated,
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
        html: '<p>Sans cookie : pour améliorer le site, nous comptons de façon anonyme et agrégée les pages vues et les clics sur les principaux boutons (devis, WhatsApp, appel, e-mail, inscription…). Ce comptage n’utilise aucun identifiant, aucun cookie ni stockage dans votre navigateur et ne transmet aucune donnée saisie dans les formulaires ; votre adresse IP sert uniquement à écarter les abus et n’est pas conservée avec les mesures.</p><p>Avec votre accord uniquement, nous ajoutons un identifiant pseudonyme aléatoire, conservé dans votre navigateur et renouvelé au moins tous les 6 mois, pour compter les visiteurs uniques, et nous chargeons Google Analytics 4. Aucun script de mesure tiers n’est chargé avant votre choix. Si vous retirez votre accord, l’identifiant est effacé. Les réglages « Ne pas me pister » (Do Not Track) et Global Privacy Control de votre navigateur sont respectés : aucun identifiant n’est alors utilisé.</p>',
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

/** Pages légales en anglais (`?lang=en`) : mêmes modèles « à compléter », liens vers les adresses anglaises. */
export const legalPagesEn: Record<LegalKey, Page> = {
  'mentions-legales': legalPage(
    'mentions-legales',
    'Legal notice',
    [
      {
        title: 'Website publisher',
        html: '<p>This website is published by MAMBO Proxi. Company name, legal form, registered office, registration number and publication manager: details to be provided by the client.</p>',
      },
      {
        title: 'Hosting',
        html: '<p>Name, address and contact details of the website host: to be provided at launch.</p>',
      },
      {
        title: 'Intellectual property',
        html: '<p>All content on this website (text, logos, photographs, graphic elements) is the property of MAMBO Proxi unless otherwise stated. Any reproduction without permission is prohibited.</p>',
      },
      {
        title: 'Personal data',
        html: '<p>Data collected through the forms is limited to what is necessary and used only to answer your requests. You have the right to access, correct and delete it. See the <a href="/en/privacy-policy">privacy policy</a>.</p>',
      },
      {
        title: 'Contact',
        html: '<p>For any question: <a href="mailto:contact@mamboproxi.com">contact@mamboproxi.com</a>.</p>',
      },
    ],
    false,
    UPDATED_EN,
  ),
  confidentialite: legalPage(
    'confidentialite',
    'Privacy policy',
    [
      {
        title: 'Data controller',
        html: '<p>MAMBO Proxi, whose details appear in the <a href="/en/legal-notice">legal notice</a>. Details to be provided by the client.</p>',
      },
      {
        title: 'Data collected',
        html: '<p>We only collect the data you enter in our forms:</p><ul><li>identity and contact details (name, email, phone, country and city);</li><li>description of your need and contact preferences;</li><li>attachments you choose to send (CV).</li></ul>',
      },
      {
        title: 'Purposes and legal bases',
        html: '<p>Answering your quote, contact, appointment or partnership requests, based on your consent; sending the newsletter if you asked for it. To be completed by the client.</p>',
      },
      {
        title: 'Retention period',
        html: '<p>Retention periods by type of request: to be provided by the client.</p>',
      },
      {
        title: 'Your rights',
        html: '<p>You have the right to access, correct, erase, object and port your data. To exercise them: <a href="mailto:contact@mamboproxi.com">contact@mamboproxi.com</a>.</p>',
      },
    ],
    true,
    UPDATED_EN,
  ),
  cookies: legalPage(
    'cookies',
    'Cookie settings',
    [
      {
        title: 'Necessary cookies',
        html: '<p>They make the website work (remembering your cookie choices, form security) and cannot be switched off.</p>',
      },
      {
        title: 'Audience measurement',
        html: '<p>Without cookies: to improve the website, we count page views and clicks on the main buttons (quote, WhatsApp, call, email, sign-up…) anonymously and in aggregate. This count uses no identifier, no cookie or browser storage, and never sends anything you type into a form; your IP address is only used to filter out abuse and is not stored with the measurements.</p><p>Only with your consent, we add a random pseudonymous identifier, kept in your browser and renewed at least every 6 months, to count unique visitors, and we load Google Analytics 4. No third-party measurement script is loaded before you choose. If you withdraw your consent, the identifier is deleted. Your browser’s Do Not Track and Global Privacy Control settings are respected: no identifier is used.</p>',
      },
      {
        title: 'How long your choice lasts',
        html: '<p>Your choice is kept for 6 months. You can change it at any time from this page or the “Cookies” link in the footer.</p>',
      },
    ],
    true,
    UPDATED_EN,
  ),
  cgu: legalPage(
    'cgu',
    'Terms of use',
    [
      {
        title: 'Purpose',
        html: '<p>Terms of use of the MAMBO Proxi website: to be provided by the client.</p>',
      },
      {
        title: 'Access to the website',
        html: '<p>The website is free to access. MAMBO Proxi may suspend access for maintenance.</p>',
      },
      {
        title: 'Liability',
        html: '<p>Liability terms and governing law: to be provided by the client.</p>',
      },
    ],
    true,
    UPDATED_EN,
  ),
};
