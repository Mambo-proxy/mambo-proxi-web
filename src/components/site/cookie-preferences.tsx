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
}: {
  open: boolean;
  onClose: () => void;
  analytics: boolean;
  onAnalyticsChange: (value: boolean) => void;
  onDecide: (analytics: boolean) => void;
}) {
  const t = useTranslations('site.cookies');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('modalTitle')}
      description={t('modalText')}
      footer={
        <>
          <Button variant="outline" onClick={() => onDecide(false)}>
            {t('refuseAll')}
          </Button>
          <Button onClick={() => onDecide(analytics)}>{t('save')}</Button>
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
