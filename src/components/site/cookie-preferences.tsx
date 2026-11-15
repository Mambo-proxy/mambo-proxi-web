'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Switch } from '@/components/ui/switch';

/** Modale « Personnaliser » du bandeau cookies (chargée à sa première ouverture). */
export function CookiePreferences({
  open,
  onClose,
  analytics,
  onAnalyticsChange,
  onDecide,
  analyticsConsented,
}: {
  open: boolean;
  onClose: () => void;
  analytics: boolean;
  onAnalyticsChange: (value: boolean) => void;
  onDecide: (analytics: boolean) => void;
  /** Mesure d'audience acceptée jusqu'ici (Google Analytics chargé). */
  analyticsConsented: boolean;
}) {
  const t = useTranslations('site.cookies');
  const a11y = useTranslations('site.a11y');

  // Retrait du consentement (possible seulement depuis cette modale, le bandeau ne s'affichant qu'avant un choix) :
  // gtag déjà chargé ne se décharge pas (démonter `<Script>` ne l'arrête pas) ; ses cookies sont effacés et la page
  // rechargée, sans Google Analytics. Code gardé ici, hors du JavaScript initial des pages.
  function decide(value: boolean) {
    onDecide(value);
    if (analyticsConsented && !value) {
      clearAnalyticsCookies();
      window.location.reload();
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('modalTitle')}
      closeLabel={a11y('close')}
      description={t('modalText')}
      footer={
        <>
          <Button variant="outline" onClick={() => decide(false)}>
            {t('refuseAll')}
          </Button>
          <Button onClick={() => decide(analytics)}>{t('save')}</Button>
        </>
      }
    >
      <ul className="flex flex-col divide-y divide-border-default">
        <li className="flex flex-col gap-2 pb-4">
          <Switch id="cookies-necessaires" label={t('necessary')} checked disabled readOnly />
          <p className="font-ui text-[14px] leading-5 text-text-muted">{t('necessaryText')}</p>
        </li>
        <li className="flex flex-col gap-2 pt-4">
          <Switch
            id="cookies-mesure"
            label={t('analytics')}
            checked={analytics}
            onChange={(event) => onAnalyticsChange(event.target.checked)}
          />
          <p className="font-ui text-[14px] leading-5 text-text-muted">{t('analyticsText')}</p>
        </li>
      </ul>
    </Modal>
  );
}

/** Cookies de Google Analytics (`_ga`, `_ga_<id>`) effacés pour l'hôte et ses domaines parents. */
function clearAnalyticsCookies() {
  const names = document.cookie
    .split(';')
    .map((entry) => entry.split('=')[0]?.trim() ?? '')
    .filter((name) => name === '_ga' || name.startsWith('_ga_'));
  const parts = window.location.hostname.split('.');
  const domains = parts
    .map((_, index) => parts.slice(index).join('.'))
    .filter((domain) => domain.includes('.'));
  for (const name of names) {
    document.cookie = `${name}=; Max-Age=0; path=/`;
    for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/; domain=.${domain}`;
  }
}
