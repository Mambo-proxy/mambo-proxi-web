'use client';

import { CircleCheck, Clock, Lock, Mail, MapPin, Plus, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { SideCard } from '@/components/admin/editor/editor-ui';
import type { EditorLanguage } from '@/components/admin/pages/translation-editor';
import { useCan } from '@/components/admin/shell/permissions';
import { ROLE_LABELS } from '@/components/admin/shell/nav';
import { Avatar } from '@/components/admin/shell/sidebar';
import { SOCIAL_ICONS, WhatsappIcon } from '@/components/brand/social-icons';
import { Field, Input, Textarea } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { formatNumber } from '@/lib/format/number';
import { EmailFamiliesCard } from './settings-emails';
import { SettingsLanguageTabs } from './settings-english';
import { FieldGrid, FormattedInput, SettingsCard } from './settings-fields';
import { useSettingsGroup } from './settings-form';
import {
  backupLabel,
  formatPhone,
  parsePhone,
  SOCIAL_NETWORKS,
  socialDisplay,
  socialUrl,
} from './settings-model';
import { useAdminUsers, useSystemStatus } from './settings-queries';

const cardSkeleton = (height: string) => <Skeleton className={`${height} w-full rounded-md`} />;

/**
 * Onglet « Coordonnées » (`94:11866`) : agence, bouton WhatsApp, réseaux sociaux et e-mails automatiques. Onglets
 * « Français | English » : la version anglaise ne reprend que les textes (horaires, adresse, message WhatsApp…).
 */
export function CoordinatesTab({ onInvite }: { onInvite: () => void }) {
  const [lang, setLang] = useState<EditorLanguage>('fr');
  return (
    <SettingsLanguageTabs
      id="settings-coordonnees"
      groups={['coordonnees', 'whatsapp']}
      lang={lang}
      onChange={setLang}
      french={<FrenchCoordinates onInvite={onInvite} />}
    />
  );
}

function FrenchCoordinates({ onInvite }: { onInvite: () => void }) {
  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-5">
        <AgencyCard />
        <WhatsappCard />
        <SocialCard />
        <EmailFamiliesCard />
      </div>
      <aside aria-label="À savoir" className="flex flex-col gap-5 xl:sticky xl:top-[107px]">
        <DisplayedOnCard />
        <AccessCard onInvite={onInvite} />
        <BackupCard />
      </aside>
    </div>
  );
}

function AgencyCard() {
  const contact = useSettingsGroup('coordonnees');
  const whatsapp = useSettingsGroup('whatsapp');
  const value = contact.value;
  return (
    <SettingsCard
      title="Coordonnées de l’agence"
      subtitle="Une seule saisie : mises à jour partout sur le site"
    >
      {!value || !whatsapp.value ? (
        cardSkeleton('h-[290px]')
      ) : (
        <>
          <FieldGrid>
            <Field label="Téléphone WhatsApp" error={whatsapp.error('number')}>
              {(control) => (
                <FormattedInput
                  {...control}
                  icon={Smartphone}
                  type="tel"
                  autoComplete="off"
                  value={whatsapp.value!.number}
                  format={formatPhone}
                  parse={parsePhone}
                  onValueChange={(number) => whatsapp.update({ number })}
                />
              )}
            </Field>
            <Field label="Téléphone Cameroun" error={contact.error('phoneCameroon')}>
              {(control) => (
                <FormattedInput
                  {...control}
                  icon={Smartphone}
                  type="tel"
                  autoComplete="off"
                  value={value.phoneCameroon}
                  format={formatPhone}
                  parse={parsePhone}
                  onValueChange={(phoneCameroon) => contact.update({ phoneCameroon })}
                />
              )}
            </Field>
            <Field label="E-mail de contact" error={contact.error('email')}>
              {(control) => (
                <Input
                  {...control}
                  icon={Mail}
                  type="email"
                  value={value.email}
                  onChange={(event) => contact.update({ email: event.target.value.trim() })}
                />
              )}
            </Field>
            <Field label="Horaires" error={contact.error('hoursLabel')}>
              {(control) => (
                <Input
                  {...control}
                  icon={Clock}
                  value={value.hoursLabel}
                  onChange={(event) => contact.update({ hoursLabel: event.target.value })}
                />
              )}
            </Field>
          </FieldGrid>
          <Field
            label="Adresse de l’agence (réception des colis et courriers)"
            error={contact.error('agency')}
          >
            {(control) => (
              <Input
                {...control}
                icon={MapPin}
                placeholder={`Adresse à compléter · ${value.agency.city}, Cameroun`}
                value={value.agency.addressLines.join(', ')}
                onChange={(event) =>
                  contact.update({
                    agency: { ...value.agency, addressLines: event.target.value ? [event.target.value] : [] },
                  })
                }
              />
            )}
          </Field>
        </>
      )}
    </SettingsCard>
  );
}

function WhatsappCard() {
  const { value, update, error } = useSettingsGroup('whatsapp');
  return (
    <SettingsCard
      title="Bouton WhatsApp"
      subtitle="Affiché en bas à droite de toutes les pages"
      action={
        value && (
          <Switch
            label="Afficher le bouton WhatsApp"
            hideLabel
            checked={value.enabled}
            onChange={(event) => update({ enabled: event.target.checked })}
            className="mt-1"
          />
        )
      }
    >
      {!value ? (
        cardSkeleton('h-[104px]')
      ) : (
        <FieldGrid>
          <Field label="Numéro WhatsApp" error={error('number')}>
            {(control) => (
              <FormattedInput
                {...control}
                icon={WhatsappIcon}
                type="tel"
                autoComplete="off"
                value={value.number}
                format={formatPhone}
                parse={parsePhone}
                onValueChange={(number) => update({ number })}
              />
            )}
          </Field>
          <Field label="Message pré-rempli" error={error('message')}>
            {(control) => (
              <Textarea
                {...control}
                rows={2}
                maxLength={500}
                value={value.message}
                onChange={(event) => update({ message: event.target.value })}
                className="min-h-0"
              />
            )}
          </Field>
        </FieldGrid>
      )}
    </SettingsCard>
  );
}

function SocialCard() {
  const { value, update, error } = useSettingsGroup('reseaux');
  return (
    <SettingsCard title="Réseaux sociaux">
      {!value ? (
        cardSkeleton('h-[194px]')
      ) : (
        <FieldGrid>
          {SOCIAL_NETWORKS.map(({ network, label, placeholder }) => {
            const index = value.social.findIndex((item) => item.network === network);
            return (
              <Field key={network} label={label} error={index >= 0 ? error(`social.${index}.url`) : null}>
                {(control) => (
                  <FormattedInput
                    {...control}
                    icon={SOCIAL_ICONS[network]}
                    inputMode="url"
                    placeholder={placeholder}
                    value={index >= 0 ? value.social[index]!.url : ''}
                    format={socialDisplay}
                    parse={socialUrl}
                    onValueChange={(url) => {
                      const others = value.social.filter((item) => item.network !== network);
                      const social = url ? [...others, { network, url }] : others;
                      // Ordre du site : celui de la liste des réseaux.
                      const order: string[] = SOCIAL_NETWORKS.map((item) => item.network);
                      update({
                        social: social.sort((a, b) => order.indexOf(a.network) - order.indexOf(b.network)),
                      });
                    }}
                  />
                )}
              </Field>
            );
          })}
        </FieldGrid>
      )}
    </SettingsCard>
  );
}

const DISPLAYED_ON = [
  'Bandeau supérieur du site',
  'Pied de page',
  'Page Contact et carte',
  'Bouton WhatsApp flottant',
  'E-mails envoyés aux clients',
];

/** « Où ces informations s’affichent » (`94:12171`). */
function DisplayedOnCard() {
  return (
    <SideCard title="Où ces informations s’affichent">
      <ul className="flex flex-col gap-3">
        {DISPLAYED_ON.map((item) => (
          <li key={item} className="flex items-center gap-2 font-ui text-[14px] leading-5 text-text-main">
            <CircleCheck aria-hidden size={16} className="shrink-0 text-vert-600" />
            {item}
          </li>
        ))}
      </ul>
    </SideCard>
  );
}

/** « Accès au back-office » (`94:12185`) : utilisateurs et invitation (administrateurs). */
function AccessCard({ onInvite }: { onInvite: () => void }) {
  // Utilisateurs et invitation : permission `users:manage`.
  const isAdmin = useCan()('users:manage');
  const users = useAdminUsers(isAdmin);
  if (!isAdmin) return null;
  const list = users.data?.filter((item) => item.status !== 'DESACTIVE');
  return (
    <SideCard
      title={
        <span className="flex flex-col gap-0.5">
          Accès au back-office
          <span className="font-ui text-[12px] leading-4 font-normal tracking-[0.01em] text-text-muted">
            {list ? `${formatNumber(list.length)} utilisateur${list.length > 1 ? 's' : ''}` : '…'}
          </span>
        </span>
      }
      action={
        <button
          type="button"
          onClick={onInvite}
          className="flex h-[42px] shrink-0 items-center gap-2 rounded-md border border-border-strong bg-neutral-0 px-3.5 font-ui text-[14px] leading-5 font-semibold text-text-main transition-colors hover:bg-neutral-50"
        >
          <Plus aria-hidden size={16} />
          Inviter
        </button>
      }
    >
      {!list ? (
        cardSkeleton('h-[90px]')
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((item) => (
            <li key={item.id} className="flex items-center gap-2.5">
              <Avatar initials={item.initials} size={32} />
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-ui text-[14px] leading-5 font-semibold text-text-main">
                  {item.name}
                </span>
                <span className="truncate font-ui text-[12px] leading-4 tracking-[0.01em] text-text-muted">
                  {item.status === 'INVITE'
                    ? 'Invitation envoyée'
                    : item.role === 'EDITOR'
                      ? `${ROLE_LABELS.EDITOR} (demandes et contenus)`
                      : ROLE_LABELS[item.role]}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </SideCard>
  );
}

/** « Sauvegarde automatique » (`94:12207`) : dernière sauvegarde de la nuit et HTTPS. */
function BackupCard() {
  const status = useSystemStatus();
  return (
    <SideCard title="Sauvegarde automatique" className="gap-1">
      {!status.data ? (
        cardSkeleton('h-10')
      ) : (
        <>
          <p className="font-ui text-[13px] leading-4 text-text-muted">
            {backupLabel(status.data.lastBackupAt)}
          </p>
          {status.data.https && (
            <p className="mt-2 flex items-center gap-1.5 font-ui text-[12px] leading-4 font-semibold text-vert-700">
              <Lock aria-hidden size={14} />
              Connexion sécurisée (HTTPS) active
            </p>
          )}
        </>
      )}
    </SideCard>
  );
}
