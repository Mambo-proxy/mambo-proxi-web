'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lock, Mail, Pencil, Reply, Users } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { EmptyState } from '@/components/admin/ui/filters';
import { Field, Input, Select } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { errorMessage } from '@/lib/api/errors';
import type { EmailTemplate, EmailTemplateKey } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { FieldGrid, FormattedInput, NumberInput, SettingsCard } from './settings-fields';
import { useSettingsGroup } from './settings-form';
import { emailTemplatesKey, useEmailTemplates } from './settings-queries';
import { AUDIENCE_LABELS, EMAIL_FAMILIES, familyEnabled, parseEmails } from './settings-model';
import { TemplateDialog } from './template-dialog';

/** Active ou désactive des modèles (immédiatement, sans « Enregistrer ») ; les e-mails indispensables restent actifs. */
function useToggleTemplates() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ keys, enabled }: { keys: EmailTemplateKey[]; enabled: boolean; label: string }) => {
      const templates = client.getQueryData<EmailTemplate[]>(emailTemplatesKey) ?? [];
      const targets = templates.filter((item) => keys.includes(item.key!) && item.canDisable);
      return Promise.all(
        targets.map((item) =>
          data(
            browserApi.PUT('/v1/admin/email-templates/{key}', {
              params: { path: { key: item.key! } },
              body: { enabled } as never,
            }),
          ),
        ),
      );
    },
    onMutate: ({ keys, enabled }) => {
      const previous = client.getQueryData<EmailTemplate[]>(emailTemplatesKey);
      client.setQueryData<EmailTemplate[]>(emailTemplatesKey, (list) =>
        list?.map((item) => (keys.includes(item.key!) && item.canDisable ? { ...item, enabled } : item)),
      );
      return { previous };
    },
    onSuccess: (_, { enabled, label }) =>
      toast.success(enabled ? `« ${label} » activé.` : `« ${label} » désactivé : il ne sera plus envoyé.`),
    onError: (error, _, context) => {
      client.setQueryData(emailTemplatesKey, context?.previous);
      toast.error(errorMessage(error));
    },
    onSettled: () => client.invalidateQueries({ queryKey: emailTemplatesKey }),
  });
}

/** Ligne d'e-mail (`94:12121`) : nom 14 SemiBold, description 12 `text/muted`, « Modèle » (bordé, 44 px) et interrupteur. */
function TemplateRow({
  name,
  description,
  onEdit,
  control,
}: {
  name: string;
  description: string;
  onEdit: () => void;
  control: ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 border-b border-border-default py-3.5">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-ui text-[14px] leading-5 font-semibold text-text-main">{name}</span>
        <span className="font-ui text-[12px] leading-4 tracking-[0.01em] text-text-muted">{description}</span>
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Modifier le modèle « ${name} »`}
        className="flex h-11 shrink-0 items-center gap-2 rounded-md border border-border-strong bg-neutral-0 px-3 font-ui text-[14px] leading-5 font-semibold text-text-main transition-colors hover:bg-neutral-50 md:px-3.5"
      >
        <Pencil aria-hidden size={16} />
        <span className="max-sm:sr-only">Modèle</span>
      </button>
      {control}
    </li>
  );
}

/** « E-mails automatiques » de l'onglet Coordonnées (`94:12112`) : 4 familles, interrupteur et modèle principal. */
export function EmailFamiliesCard() {
  const templates = useEmailTemplates();
  const { value: emails } = useSettingsGroup('emails');
  const toggle = useToggleTemplates();
  const [editing, setEditing] = useState<EmailTemplateKey | null>(null);
  const list = templates.data;

  return (
    <SettingsCard title="E-mails automatiques" subtitle="Envoyés sans action de votre part">
      {!list ? (
        <Skeleton className="h-[280px] w-full rounded-md" />
      ) : (
        <ul className="-mt-1.5 flex flex-col">
          {EMAIL_FAMILIES.map((family) => (
            <TemplateRow
              key={family.id}
              name={family.name}
              description={family.description(emails?.surveyDelayHours ?? 24)}
              onEdit={() => setEditing(family.template)}
              control={
                <Switch
                  label={`Envoyer « ${family.name} »`}
                  hideLabel
                  checked={familyEnabled(family, list)}
                  onChange={(event) =>
                    toggle.mutate({ keys: family.keys, enabled: event.target.checked, label: family.name })
                  }
                />
              }
            />
          ))}
        </ul>
      )}
      <TemplateDialog templateKey={editing} onClose={() => setEditing(null)} />
    </SettingsCard>
  );
}

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

/** Onglet « E-mails automatiques » : réglages des envois et tous les modèles, par destinataire. */
export function EmailsTab() {
  const { value, update, error, isError } = useSettingsGroup('emails');
  const templates = useEmailTemplates();
  const toggle = useToggleTemplates();
  const [editing, setEditing] = useState<EmailTemplateKey | null>(null);
  const audiences = Object.keys(AUDIENCE_LABELS) as (keyof typeof AUDIENCE_LABELS)[];

  return (
    <div className="flex max-w-[752px] flex-col gap-5">
      <SettingsCard title="Réglages des envois" subtitle="Expéditeur, destinataires des alertes et délais">
        {isError ? (
          <EmptyState
            icon={<Mail size={24} />}
            title="Réglages indisponibles"
            text="Le chargement a échoué."
          />
        ) : !value ? (
          <Skeleton className="h-[260px] w-full rounded-md" />
        ) : (
          <>
            <FieldGrid>
              <Field label="Nom de l’expéditeur" error={error('senderName')}>
                {(control) => (
                  <Input
                    {...control}
                    icon={Mail}
                    value={value.senderName}
                    onChange={(event) => update({ senderName: event.target.value })}
                  />
                )}
              </Field>
              <Field label="Adresse de réponse" error={error('replyTo')}>
                {(control) => (
                  <Input
                    {...control}
                    icon={Reply}
                    type="email"
                    value={value.replyTo ?? ''}
                    onChange={(event) => update({ replyTo: event.target.value.trim() || null })}
                  />
                )}
              </Field>
            </FieldGrid>
            <Field
              label="Destinataires des alertes de l’équipe"
              help="Séparez les adresses par une virgule."
              error={error('teamRecipients')}
            >
              {(control) => (
                <FormattedInput
                  {...control}
                  icon={Users}
                  value={value.teamRecipients.join(', ')}
                  format={(text) => text}
                  parse={(text) => parseEmails(text).join(', ')}
                  onValueChange={(text) => update({ teamRecipients: parseEmails(text) })}
                />
              )}
            </Field>
            <FieldGrid className="md:grid-cols-3">
              <Field
                label="Questionnaire envoyé après"
                help="Après « Prestation réalisée »."
                error={error('surveyDelayHours')}
              >
                {(control) => (
                  <NumberInput
                    {...control}
                    unit="heures"
                    min={0}
                    max={720}
                    value={value.surveyDelayHours}
                    onValueChange={(hours) => update({ surveyDelayHours: hours })}
                  />
                )}
              </Field>
              <Field
                label="Relance du questionnaire"
                help="Vide : pas de relance."
                error={error('surveyReminderDays')}
              >
                {(control) => (
                  <NumberInput
                    {...control}
                    unit="jours"
                    min={1}
                    max={30}
                    value={value.surveyReminderDays}
                    onValueChange={(days) => update({ surveyReminderDays: Number.isNaN(days) ? null : days })}
                  />
                )}
              </Field>
              <Field
                label="Rappel de rendez-vous"
                help="La veille, à cette heure."
                error={error('appointmentReminderHour')}
              >
                {(control) => (
                  <Select
                    {...control}
                    value={value.appointmentReminderHour}
                    onChange={(event) => update({ appointmentReminderHour: Number(event.target.value) })}
                  >
                    {HOURS.map((hour) => (
                      <option key={hour} value={hour}>
                        {`${hour}\u00A0h`}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </FieldGrid>
          </>
        )}
      </SettingsCard>

      <SettingsCard
        title="Modèles d’e-mails"
        subtitle="Objet, texte et bouton de chaque e-mail ; les e-mails de sécurité sont toujours envoyés"
      >
        {!templates.data ? (
          <Skeleton className="h-[480px] w-full rounded-md" />
        ) : (
          audiences.map((audience) => {
            const items = templates.data.filter((item) => (item.audience ?? 'client') === audience);
            if (!items.length) return null;
            return (
              <section key={audience} aria-label={AUDIENCE_LABELS[audience]} className="flex flex-col gap-4">
                <h3 className="font-ui text-[12px] leading-4 font-semibold tracking-[0.04em] text-text-muted uppercase">
                  {AUDIENCE_LABELS[audience]}
                </h3>
                <ul className="-mt-2 flex flex-col">
                  {items.map((item) => (
                    <TemplateRow
                      key={item.key}
                      name={item.name ?? ''}
                      description={item.description ?? ''}
                      onEdit={() => setEditing(item.key!)}
                      control={
                        item.canDisable ? (
                          <Switch
                            label={`Envoyer « ${item.name} »`}
                            hideLabel
                            checked={Boolean(item.enabled)}
                            onChange={(event) =>
                              toggle.mutate({
                                keys: [item.key!],
                                enabled: event.target.checked,
                                label: item.name ?? '',
                              })
                            }
                          />
                        ) : (
                          <span
                            title="E-mail indispensable : toujours envoyé"
                            className={cn('flex w-10 shrink-0 justify-center text-icon-default')}
                          >
                            <Lock aria-hidden size={16} />
                            <span className="sr-only">Toujours envoyé</span>
                          </span>
                        )
                      }
                    />
                  ))}
                </ul>
              </section>
            );
          })
        )}
      </SettingsCard>
      <TemplateDialog templateKey={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
