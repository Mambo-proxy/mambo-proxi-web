'use client';

import { BarChart3, Search } from 'lucide-react';
import { charCountHelp } from '@/components/admin/editor/editor-ui';
import { ImageField } from '@/components/admin/editor/media-picker';
import { useAdmin } from '@/components/admin/shell/admin-context';
import { EmptyState } from '@/components/admin/ui/filters';
import { Field, Input, Textarea } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { FieldGrid, SettingsCard } from './settings-fields';
import { useSettingsGroup } from './settings-form';

/** Onglet « Référencement » : titre, description et image de partage par défaut, mesure d'audience (administrateurs). */
export function SeoTab() {
  const { user } = useAdmin();
  return (
    <div className="flex max-w-[752px] flex-col gap-5">
      <SeoCard />
      {user?.role === 'ADMIN' && <AnalyticsCard />}
    </div>
  );
}

function SeoCard() {
  const { value, update, error, isError } = useSettingsGroup('seo');
  return (
    <SettingsCard
      title="Référencement"
      subtitle="Valeurs par défaut des pages sans titre ni description propres"
    >
      {isError ? (
        <EmptyState
          icon={<Search size={24} />}
          title="Réglages indisponibles"
          text="Le chargement a échoué."
        />
      ) : !value ? (
        <Skeleton className="h-[420px] w-full rounded-md" />
      ) : (
        <>
          <Field
            label="Titre par défaut"
            help={charCountHelp(value.defaultTitle, 60, 'Affiché dans l’onglet du navigateur et sur Google.')}
            error={error('defaultTitle')}
          >
            {(control) => (
              <Input
                {...control}
                maxLength={60}
                value={value.defaultTitle}
                onChange={(event) => update({ defaultTitle: event.target.value })}
              />
            )}
          </Field>
          <Field
            label="Description par défaut"
            help={charCountHelp(value.defaultDescription, 160, 'Texte affiché sous le titre dans Google.')}
            error={error('defaultDescription')}
          >
            {(control) => (
              <Textarea
                {...control}
                rows={3}
                maxLength={160}
                value={value.defaultDescription}
                onChange={(event) => update({ defaultDescription: event.target.value })}
                className="min-h-0"
              />
            )}
          </Field>
          <div
            aria-label="Aperçu dans Google"
            role="group"
            className="flex flex-col gap-1 rounded-md bg-neutral-50 p-4"
          >
            <span className="font-ui text-[12px] leading-4 text-text-muted">mamboproxi.com</span>
            <span className="font-ui text-[18px] leading-6 font-medium text-text-main">
              {value.defaultTitle || 'Titre de la page'}
            </span>
            <span className="line-clamp-2 font-ui text-[13px] leading-5 text-text-muted">
              {value.defaultDescription || 'Description de la page.'}
            </span>
          </div>
          <ImageField
            label="Image de partage"
            help="Affichée quand un lien du site est partagé (WhatsApp, Facebook…) : 1200 × 630 px conseillé."
            value={value.ogImage ?? null}
            aspectClassName="aspect-[1200/630]"
            onChange={(image) => update({ ogImageId: image?.id ?? null, ogImage: image })}
          />
          <Field
            label="Code de vérification Google Search Console"
            help="Balise « google-site-verification » fournie par la Search Console (facultatif)."
          >
            {(control) => (
              <Input
                {...control}
                value={value.searchConsoleVerification ?? ''}
                onChange={(event) => update({ searchConsoleVerification: event.target.value.trim() || null })}
              />
            )}
          </Field>
        </>
      )}
    </SettingsCard>
  );
}

function AnalyticsCard() {
  const { value, update, error } = useSettingsGroup('analytics');
  return (
    <SettingsCard
      title="Mesure d’audience"
      subtitle="Google Analytics 4 : visites du site et carte du tableau de bord"
    >
      {!value ? (
        <Skeleton className="h-[150px] w-full rounded-md" />
      ) : (
        <>
          <FieldGrid>
            <Field
              label="Identifiant de mesure"
              help="Au format G-XXXXXXXXXX."
              error={error('ga4MeasurementId')}
            >
              {(control) => (
                <Input
                  {...control}
                  icon={BarChart3}
                  placeholder="G-XXXXXXXXXX"
                  value={value.ga4MeasurementId ?? ''}
                  onChange={(event) =>
                    update({ ga4MeasurementId: event.target.value.trim().toUpperCase() || null })
                  }
                />
              )}
            </Field>
            <Field label="Identifiant de propriété" help="Pour la carte « Visites » du tableau de bord.">
              {(control) => (
                <Input
                  {...control}
                  inputMode="numeric"
                  value={value.ga4PropertyId ?? ''}
                  onChange={(event) => update({ ga4PropertyId: event.target.value.trim() || null })}
                />
              )}
            </Field>
          </FieldGrid>
          <Switch
            label="Mesurer l’ouverture et les clics des newsletters (mentionné dans la politique de confidentialité)"
            checked={Boolean(value.newsletterTracking)}
            onChange={(event) => update({ newsletterTracking: event.target.checked })}
          />
        </>
      )}
    </SettingsCard>
  );
}
