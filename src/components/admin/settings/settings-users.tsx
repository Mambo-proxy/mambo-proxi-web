'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { KeyRound, Mail, Plus, Power, ShieldCheck, Trash2, User, UserPen, Users } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog, StatusPill } from '@/components/admin/editor/editor-ui';
import { useAdmin } from '@/components/admin/shell/admin-context';
import { ROLE_LABELS } from '@/components/admin/shell/nav';
import { Avatar } from '@/components/admin/shell/sidebar';
import { ActionMenu, type ActionMenuItem } from '@/components/admin/ui/action-menu';
import { EmptyState } from '@/components/admin/ui/filters';
import { Button } from '@/components/ui/button';
import { Field, Input, Select } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type { AdminUser, Role } from '@/lib/api/schema';
import { formatAgo } from '@/lib/format/date';
import { SettingsCard } from './settings-fields';
import { ROLE_SCOPES } from './settings-model';
import { adminUsersKey, useAdminUsers } from './settings-queries';

const STATUS = {
  ACTIF: { label: 'Actif', tone: 'success' },
  INVITE: { label: 'Invité·e', tone: 'warning' },
  DESACTIVE: { label: 'Désactivé', tone: 'muted' },
} as const;

/** « Dernière connexion il y a 2 h », « Invitation envoyée hier », « Jamais connecté ». */
function activityOf(user: AdminUser): string {
  if (user.status === 'INVITE' && user.invitedAt)
    return `Invitation envoyée ${formatAgo(user.invitedAt).replace(/^(\D)/, (letter) => letter.toLowerCase())}`;
  if (!user.lastLoginAt) return 'Jamais connecté·e';
  const ago = formatAgo(user.lastLoginAt);
  return `Dernière connexion ${/^\d/.test(ago) ? `le ${ago}` : ago.toLowerCase()}`;
}

/** Onglet « Utilisateurs » (administrateurs) : accès au back-office, rôles, invitation, désactivation. */
export function UsersTab({
  inviting,
  onInvitingChange,
}: {
  inviting: boolean;
  onInvitingChange: (open: boolean) => void;
}) {
  const client = useQueryClient();
  const { user: me } = useAdmin();
  const users = useAdminUsers();
  const [removing, setRemoving] = useState<AdminUser | null>(null);

  const store = (saved: AdminUser) =>
    client.setQueryData<AdminUser[]>(adminUsersKey, (list) =>
      list?.map((item) => (item.id === saved.id ? saved : item)),
    );

  const patch = useMutation({
    mutationFn: ({
      user,
      body,
    }: {
      user: AdminUser;
      body: { role?: Role; isActive?: boolean };
      done: string;
    }) => data(browserApi.PATCH('/v1/admin/users/{id}', { params: { path: { id: user.id } }, body })),
    onSuccess: (saved, { done }) => {
      store(saved);
      toast.success(done);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const reset = useMutation({
    mutationFn: (user: AdminUser) =>
      data(browserApi.POST('/v1/admin/users/{id}/reset-password', { params: { path: { id: user.id } } })),
    onSuccess: (result) => toast.success(result.message),
    onError: (error) => toast.error(errorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: async (user: AdminUser) => {
      await data(browserApi.DELETE('/v1/admin/users/{id}', { params: { path: { id: user.id } } }));
      return user;
    },
    onSuccess: (user) => {
      client.setQueryData<AdminUser[]>(adminUsersKey, (list) => list?.filter((item) => item.id !== user.id));
      toast.success(`${user.name} n’a plus accès au back-office.`);
      setRemoving(null);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  function itemsFor(user: AdminUser): ActionMenuItem[] {
    const self = user.id === me?.id;
    const otherRole: Role = user.role === 'ADMIN' ? 'EDITOR' : 'ADMIN';
    return [
      {
        label: `Passer ${ROLE_LABELS[otherRole].toLowerCase()}`,
        icon: otherRole === 'ADMIN' ? ShieldCheck : UserPen,
        disabled: self,
        onSelect: () =>
          patch.mutate({
            user,
            body: { role: otherRole },
            done: `${user.name} est maintenant ${ROLE_LABELS[otherRole].toLowerCase()}.`,
          }),
      },
      {
        label: user.status === 'INVITE' ? 'Renvoyer l’invitation' : 'Réinitialiser le mot de passe',
        icon: user.status === 'INVITE' ? Mail : KeyRound,
        disabled: user.status === 'DESACTIVE',
        onSelect: () => reset.mutate(user),
      },
      {
        label: user.isActive ? 'Désactiver l’accès' : 'Réactiver l’accès',
        icon: Power,
        disabled: self,
        onSelect: () =>
          patch.mutate({
            user,
            body: { isActive: !user.isActive },
            done: user.isActive ? `Accès de ${user.name} désactivé.` : `Accès de ${user.name} réactivé.`,
          }),
      },
      { label: 'Supprimer', icon: Trash2, danger: true, disabled: self, onSelect: () => setRemoving(user) },
    ];
  }

  return (
    <div className="flex max-w-[1112px] flex-col gap-5">
      <SettingsCard
        title="Accès au back-office"
        subtitle="Chaque personne a son propre accès ; une invitation est valable 7 jours"
        action={
          <Button size="sm" onClick={() => onInvitingChange(true)} className="shrink-0">
            <Plus aria-hidden size={16} />
            Inviter
          </Button>
        }
      >
        {users.isError && !users.data ? (
          <EmptyState
            icon={<Users size={24} />}
            title="Utilisateurs indisponibles"
            text="Le chargement a échoué."
          />
        ) : !users.data ? (
          <Skeleton className="h-[140px] w-full rounded-md" />
        ) : (
          <ul aria-label="Utilisateurs du back-office" className="-mt-1.5 flex flex-col">
            {users.data.map((user) => (
              <li
                key={user.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border-default py-3.5 last:border-b-0 last:pb-0"
              >
                <Avatar initials={user.initials} size={36} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-ui text-[14px] leading-5 font-semibold text-text-main">
                    {user.name}
                    {user.id === me?.id && <span className="font-normal text-text-muted"> (vous)</span>}
                  </span>
                  <span className="truncate font-ui text-[12px] leading-4 tracking-[0.01em] text-text-muted">
                    {user.email} · {activityOf(user)}
                  </span>
                </div>
                <div className="flex items-center gap-3 max-sm:w-full max-sm:pl-12">
                  <span className="font-ui text-[13px] leading-4 text-text-main sm:w-[150px]">
                    {ROLE_LABELS[user.role]}
                  </span>
                  <StatusPill tone={STATUS[user.status].tone}>{STATUS[user.status].label}</StatusPill>
                  <span className="ml-auto">
                    <ActionMenu label={`Actions pour ${user.name}`} items={itemsFor(user)} />
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SettingsCard>

      <SettingsCard title="Rôles">
        <dl className="grid gap-4 sm:grid-cols-2">
          {(Object.keys(ROLE_SCOPES) as Role[]).map((role) => (
            <div key={role} className="flex flex-col gap-1 rounded-md bg-neutral-50 p-4">
              <dt className="flex items-center gap-2 font-ui text-[14px] leading-5 font-semibold text-text-main">
                {role === 'ADMIN' ? <ShieldCheck aria-hidden size={16} /> : <UserPen aria-hidden size={16} />}
                {ROLE_LABELS[role]}
              </dt>
              <dd className="font-ui text-[13px] leading-5 text-text-muted">{ROLE_SCOPES[role]}</dd>
            </div>
          ))}
        </dl>
      </SettingsCard>

      <InviteDialog open={inviting} onClose={() => onInvitingChange(false)} />
      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={() => removing && remove.mutate(removing)}
        title={`Supprimer ${removing?.name ?? ''} ?`}
        description="Ses sessions sont fermées et son accès supprimé. Ses actions restent visibles dans le journal."
        confirmLabel="Supprimer l’accès"
        destructive
        pending={remove.isPending}
      />
    </div>
  );
}

function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const client = useQueryClient();
  const [form, setForm] = useState({ name: '', email: '', role: 'EDITOR' as Role });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setForm({ name: '', email: '', role: 'EDITOR' });
      setErrors({});
    }
  }

  const invite = useMutation({
    mutationFn: () =>
      data(
        browserApi.POST('/v1/admin/users/invite', {
          body: { name: form.name.trim(), email: form.email.trim(), role: form.role },
        }),
      ),
    onSuccess: (user) => {
      client.setQueryData<AdminUser[]>(adminUsersKey, (list) => (list ? [...list, user] : list));
      toast.success(`Invitation envoyée à ${user.email}.`);
      onClose();
    },
    onError: (error) => {
      if (error instanceof ApiError) setErrors(error.fieldErrors);
      toast.error(errorMessage(error));
    },
  });

  function submit() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Indiquez le nom.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Saisissez une adresse e-mail valide.';
    setErrors(next);
    if (!Object.keys(next).length) invite.mutate();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Inviter un utilisateur"
      description="Un lien d’activation, valable 7 jours, est envoyé par e-mail."
      maxWidth={500}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button size="sm" loading={invite.isPending} onClick={submit}>
            Envoyer l’invitation
          </Button>
        </div>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Field label="Nom" required error={errors.name}>
          {(control) => (
            <Input
              {...control}
              icon={User}
              autoComplete="name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          )}
        </Field>
        <Field label="Adresse e-mail" required error={errors.email}>
          {(control) => (
            <Input
              {...control}
              icon={Mail}
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          )}
        </Field>
        <Field label="Rôle" help={ROLE_SCOPES[form.role]} error={errors.role}>
          {(control) => (
            <Select
              {...control}
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value as Role })}
            >
              <option value="EDITOR">{ROLE_LABELS.EDITOR}</option>
              <option value="ADMIN">{ROLE_LABELS.ADMIN}</option>
            </Select>
          )}
        </Field>
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
