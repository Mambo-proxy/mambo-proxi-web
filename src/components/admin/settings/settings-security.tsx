'use client';

import { CircleAlert, DatabaseBackup } from 'lucide-react';
import { EmptyState } from '@/components/admin/ui/filters';
import { Field } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { formatFileSize, formatNumber } from '@/lib/format/number';
import { FieldGrid, NumberInput, SettingsCard } from './settings-fields';
import { useSettingsGroup } from './settings-form';
import { backupMoment } from './settings-model';
import { useSystemStatus } from './settings-queries';

/** Onglet « Sécurité & sauvegardes » (administrateurs) : état du système, maintenance, connexion, conservation RGPD. */
export function SecurityTab() {
  return (
    <div className="flex max-w-[752px] flex-col gap-5">
      <BackupsCard />
      <SecurityCard />
      <RetentionCard />
    </div>
  );
}

function BackupsCard() {
  const status = useSystemStatus();
  const value = status.data;
  const rows = value
    ? [
        // Tâche `database-backup` de l'API : 2 h, heure de Douala.
        ['Fréquence', 'Chaque nuit à 02:00'],
        [
          'Dernière sauvegarde',
          value.lastBackupAt ? backupMoment(value.lastBackupAt) : 'Aucune pour l’instant',
        ],
        ['Taille', value.lastBackupSize ? formatFileSize(value.lastBackupSize) : '—'],
        ['Conservation', `${formatNumber(value.backupRetentionDays)} jours`],
        ['Connexion sécurisée (HTTPS)', value.https ? 'Active' : 'Inactive'],
        ['Envoi des e-mails', value.emailProvider ?? '—'],
        ['Version', value.version],
      ]
    : [];
  return (
    <SettingsCard
      title="Sauvegardes et état du site"
      subtitle="Sauvegarde automatique chaque nuit, sans action de votre part"
    >
      {status.isError && !value ? (
        <EmptyState
          icon={<DatabaseBackup size={24} />}
          title="État indisponible"
          text="Le chargement a échoué."
        />
      ) : !value ? (
        <Skeleton className="h-[200px] w-full rounded-md" />
      ) : (
        <dl className="-mt-1.5 flex flex-col">
          {rows.map(([label, text]) => (
            <div
              key={label}
              className="flex flex-wrap justify-between gap-x-4 gap-y-0.5 border-b border-border-default py-3 last:border-b-0 last:pb-0"
            >
              <dt className="font-ui text-[14px] leading-5 text-text-muted">{label}</dt>
              <dd className="font-ui text-[14px] leading-5 font-semibold text-text-main">{text}</dd>
            </div>
          ))}
        </dl>
      )}
    </SettingsCard>
  );
}

function SecurityCard() {
  const { value, update, error } = useSettingsGroup('securite');
  return (
    <SettingsCard title="Sécurité">
      {!value ? (
        <Skeleton className="h-[160px] w-full rounded-md" />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <Switch
              label="Mode maintenance"
              checked={value.maintenanceMode}
              onChange={(event) => update({ maintenanceMode: event.target.checked })}
            />
            <p className="font-ui text-[13px] leading-5 text-text-muted">
              Le site affiche une page de maintenance ; le back-office reste accessible.
            </p>
            {value.maintenanceMode && (
              <p
                role="status"
                className="flex items-start gap-2 rounded-md bg-orange-50 p-3 font-ui text-[13px] leading-5 text-orange-800"
              >
                <CircleAlert aria-hidden size={16} className="mt-0.5 shrink-0" />
                Après « Enregistrer », le site ne sera plus visible par les visiteurs.
              </p>
            )}
          </div>
          <Field
            label="Appareil de confiance"
            help="Durée pendant laquelle le code de connexion n’est plus demandé sur un appareil reconnu (0 : toujours)."
            error={error('trustedDeviceDays')}
            className="sm:max-w-[360px]"
          >
            {(control) => (
              <NumberInput
                {...control}
                unit="jours"
                min={0}
                max={90}
                value={value.trustedDeviceDays}
                onValueChange={(days) => update({ trustedDeviceDays: days })}
              />
            )}
          </Field>
        </>
      )}
    </SettingsCard>
  );
}

function RetentionCard() {
  const { value, update, error } = useSettingsGroup('rgpd');
  return (
    <SettingsCard
      title="Données personnelles (RGPD)"
      subtitle="Durées de conservation, puis suppression automatique"
    >
      {!value ? (
        <Skeleton className="h-[100px] w-full rounded-md" />
      ) : (
        <FieldGrid>
          <Field
            label="Contacts sans activité"
            help="Entre 6 et 120 mois."
            error={error('inactiveContactsRetentionMonths')}
          >
            {(control) => (
              <NumberInput
                {...control}
                unit="mois"
                min={6}
                max={120}
                value={value.inactiveContactsRetentionMonths}
                onValueChange={(months) => update({ inactiveContactsRetentionMonths: months })}
              />
            )}
          </Field>
          <Field
            label="Candidatures non retenues"
            help="Entre 1 et 60 mois."
            error={error('rejectedApplicationsRetentionMonths')}
          >
            {(control) => (
              <NumberInput
                {...control}
                unit="mois"
                min={1}
                max={60}
                value={value.rejectedApplicationsRetentionMonths}
                onValueChange={(months) => update({ rejectedApplicationsRetentionMonths: months })}
              />
            )}
          </Field>
        </FieldGrid>
      )}
    </SettingsCard>
  );
}
