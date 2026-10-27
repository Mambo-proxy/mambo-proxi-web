'use client';

import { ChevronRight, CircleCheck } from 'lucide-react';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useAdmin } from '@/components/admin/shell/admin-context';
import { ReadOnlyNotice, useCan } from '@/components/admin/shell/permissions';
import { AdminPage, topbarActionClass } from '@/components/admin/shell/admin-page';
import { StatusTabs } from '@/components/admin/ui/filters';
import { cn } from '@/lib/cn';
import { CoordinatesTab } from './settings-coordinates';
import { EmailsTab } from './settings-emails';
import { SettingsFormProvider, useSettingsDrafts } from './settings-form';
import { tabsFor, type SettingsTab } from './settings-model';
import { SecurityTab } from './settings-security';
import { SeoTab } from './settings-seo';
import { UsersTab } from './settings-users';

/**
 * Paramètres (`94:12218`) : onglets Coordonnées (maquetté), E-mails automatiques, Référencement, Utilisateurs et
 * Sécurité & sauvegardes. « Enregistrer » envoie toutes les modifications en cours, quel que soit l'onglet ; les
 * modèles d'e-mails et les utilisateurs s'enregistrent à chaque action.
 */
export function SettingsView() {
  const { user } = useAdmin();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const can = useCan();
  const tabs = tabsFor(user);
  const requested = params.get('onglet');
  const tab: SettingsTab = tabs.find((item) => item.value === requested)?.value ?? 'coordonnees';
  const [inviting, setInviting] = useState(false);
  const { form, dirty, saving, save } = useSettingsDrafts();

  function select(next: SettingsTab) {
    router.replace(`${pathname}${next === 'coordonnees' ? '' : `?onglet=${next}`}` as Route, {
      scroll: false,
    });
  }

  return (
    <AdminPage
      title="Paramètres"
      breadcrumb={
        <span className="flex items-center gap-1.5">
          Réglages <ChevronRight aria-hidden size={12} /> Paramètres
        </span>
      }
      actions={
        // Responsable : paramètres en lecture seule (`settings:read` sans `settings:write`).
        can('settings:write', 'settings:admin') && (
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className={cn(topbarActionClass, 'disabled:opacity-60')}
          >
            <CircleCheck aria-hidden />
            Enregistrer
            {dirty && <span className="sr-only"> (modifications non enregistrées)</span>}
          </button>
        )
      }
    >
      <SettingsFormProvider form={form}>
        <div className="flex flex-col gap-6">
          <StatusTabs
            label="Rubriques des paramètres"
            tabs={tabs.map((item) => ({ value: item.value, label: item.label }))}
            value={tab}
            onChange={select}
          />
          {/* Responsable : `settings:read` sans `settings:write` (l'API refuse toute écriture, 403) : cartes figées par `SettingsCard`. */}
          <ReadOnlyNotice
            permission={['settings:write', 'settings:admin']}
            text="votre rôle permet de consulter les paramètres, pas de les modifier."
          />
          <div role="tabpanel" aria-label={tabs.find((item) => item.value === tab)?.label}>
            {tab === 'coordonnees' && (
              <CoordinatesTab
                onInvite={() => {
                  setInviting(true);
                  select('utilisateurs');
                }}
              />
            )}
            {tab === 'e-mails' && <EmailsTab />}
            {tab === 'referencement' && <SeoTab />}
            {tab === 'utilisateurs' && <UsersTab inviting={inviting} onInvitingChange={setInviting} />}
            {tab === 'securite' && <SecurityTab />}
          </div>
        </div>
      </SettingsFormProvider>
    </AdminPage>
  );
}
