'use client';

import { ArrowRight, ChevronDown, ImageIcon, Trash2 } from 'lucide-react';
import { createContext, useContext, useId, useState } from 'react';
import { AddItemButton, charCountHelp } from '@/components/admin/editor/editor-ui';
import { ImageField, MediaThumb } from '@/components/admin/editor/media-picker';
import { RepeatableList, SubInput, SubTextarea } from '@/components/admin/editor/repeatable-list';
import { AccentText } from '@/components/ui/accent-text';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { Switch } from '@/components/ui/switch';
import { Visual } from '@/components/ui/visual';
import type { IllustrationScene, KeyFigure, Link, SectionItem, Visual as VisualData } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import {
  emptyItem,
  formatFigure,
  ITEM_ICONS,
  LINK_TARGETS,
  linkTargetLabel,
  parseFigure,
  SCENE_LABELS,
  type FieldErrors,
} from './page-model';

/**
 * Champs des éditeurs de sections : texte avec compteur, texte mis en avant (`==…==`), bouton (`Link`), visuel
 * (scène d'illustration + photo facultative), listes d'éléments et chiffres clés. Les erreurs sont lues par chemin
 * (`sections.1.title`) dans le contexte fourni par l'éditeur de page.
 */

export const FieldErrorsContext = createContext<FieldErrors>({});

export function useFieldError(path: string): string | null {
  return useContext(FieldErrorsContext)[path] ?? null;
}

const nullable = (value: string) => (value === '' ? null : value);

type TextFieldProps = {
  label: string;
  value: string | null | undefined;
  onChange: (value: string) => void;
  path: string;
  max: number;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  help?: string;
  placeholder?: string;
  className?: string;
};

/** Champ texte de l'éditeur (Inter 16, bordure `border/strong`, rayon 12) avec compteur de caractères. */
export function TextField({
  label,
  value,
  onChange,
  path,
  max,
  required,
  multiline,
  rows = 2,
  help,
  placeholder,
  className,
}: TextFieldProps) {
  const error = useFieldError(path);
  return (
    <Field
      label={label}
      required={required}
      error={error}
      help={charCountHelp(value, max, help)}
      className={className}
    >
      {(control) =>
        multiline ? (
          <Textarea
            {...control}
            rows={rows}
            maxLength={max}
            value={value ?? ''}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
            className="field-sizing-content min-h-0"
          />
        ) : (
          <Input
            {...control}
            maxLength={max}
            value={value ?? ''}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
          />
        )
      }
    </Field>
  );
}

/** Texte facultatif : une saisie vide est enregistrée `null` (valeur par défaut de l'API). */
export function OptionalTextField(
  props: Omit<TextFieldProps, 'onChange'> & { onChange: (value: string | null) => void },
) {
  return <TextField {...props} onChange={(value) => props.onChange(nullable(value))} />;
}

/**
 * Texte mis en avant (`AccentText`) : les mots entre `==…==` s'affichent en orange sur le site. Zone à hauteur
 * automatique (les titres peuvent contenir un retour à la ligne) et aperçu du rendu.
 */
export function AccentField({
  label,
  value,
  onChange,
  path,
  required,
  max = 400,
}: {
  label: string;
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  path: string;
  required?: boolean;
  max?: number;
}) {
  const error = useFieldError(path);
  const text = value ?? '';
  return (
    <Field
      label={label}
      required={required}
      error={error}
      help={
        <>
          {charCountHelp(
            text,
            max,
            'Encadrez des mots avec == pour les mettre en couleur (==pensée pour vous==).',
          )}
          {text.includes('==') && (
            <span className="mt-1 block text-text-main">
              Aperçu : <AccentText text={text} />
            </span>
          )}
        </>
      }
    >
      {(control) => (
        <Textarea
          {...control}
          rows={1}
          maxLength={max}
          value={text}
          onChange={(event) => onChange(required ? event.target.value : nullable(event.target.value))}
          className="field-sizing-content min-h-0 resize-none"
        />
      )}
    </Field>
  );
}

export function SwitchField({
  label,
  checked,
  onChange,
  help,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  help?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <Switch
        id={id}
        label={label}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        aria-describedby={help ? `${id}-help` : undefined}
      />
      {help && (
        <p id={`${id}-help`} className="pl-[52px] font-ui text-[12px] leading-4 text-text-muted">
          {help}
        </p>
      )}
    </div>
  );
}

// ───────────────────────────── Boutons (Link) ─────────────────────────────

const CUSTOM = '__autre';

/**
 * Bouton d'une section (maquette : liste « Demander un devis gratuit → Devis gratuit ») : le champ affiche le libellé
 * et la destination ; il ouvre une fenêtre pour choisir le libellé, la page du site ou une autre adresse.
 */
export function LinkField({
  label,
  value,
  onChange,
  path,
  removable = true,
}: {
  label: string;
  value: Link | null | undefined;
  onChange: (value: Link | null) => void;
  path: string;
  removable?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const labelError = useFieldError(`${path}.label`);
  const hrefError = useFieldError(`${path}.href`);
  const error = labelError ?? hrefError;
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span id={`${id}-label`} className="font-ui text-[14px] leading-5 font-semibold text-text-main">
        {label}
      </span>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-labelledby={`${id}-label ${id}-value`}
        data-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onClick={() => setOpen(true)}
        className={cn(
          'flex w-full min-w-0 items-center gap-3 rounded-md border border-border-strong bg-neutral-0 px-4 py-3.5 text-left font-ui text-[16px] leading-6 text-text-main transition-colors hover:bg-neutral-50',
          'data-invalid:border-feedback-error data-invalid:ring-1 data-invalid:ring-feedback-error data-invalid:ring-inset',
        )}
      >
        <span id={`${id}-value`} className="flex min-w-0 flex-1 items-center gap-1.5">
          {value ? (
            <>
              <span className="truncate">{value.label || 'Sans libellé'}</span>
              <ArrowRight aria-hidden size={16} className="shrink-0" />
              <span className="sr-only">vers</span>
              <span className="truncate">{linkTargetLabel(value.href)}</span>
            </>
          ) : (
            <span className="text-text-muted">Aucun bouton</span>
          )}
        </span>
        <ChevronDown aria-hidden size={18} className="shrink-0 text-icon-default" />
      </button>
      {error && (
        <p id={`${id}-error`} className="text-[13px] leading-4 text-feedback-error">
          {error}
        </p>
      )}
      <LinkDialog
        open={open}
        title={label}
        value={value ?? null}
        removable={removable}
        onClose={() => setOpen(false)}
        onSubmit={(next) => {
          onChange(next);
          setOpen(false);
        }}
      />
    </div>
  );
}

function LinkDialog({
  open,
  title,
  value,
  removable,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  value: Link | null;
  removable: boolean;
  onClose: () => void;
  onSubmit: (value: Link | null) => void;
}) {
  const empty: Link = { label: '', href: '/devis', external: false };
  const [draft, setDraft] = useState<Link>(value ?? empty);
  const [custom, setCustom] = useState(false);
  const [errors, setErrors] = useState<{ label?: string; href?: string }>({});
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      const initial = value ?? empty;
      setDraft(initial);
      setCustom(!LINK_TARGETS.some((target) => target.href === initial.href));
      setErrors({});
    }
  }

  function submit() {
    const next: Link = {
      ...draft,
      label: draft.label.trim(),
      href: draft.href.trim(),
      labelMobile: draft.labelMobile?.trim() || null,
    };
    const found: typeof errors = {};
    if (!next.label) found.label = 'Indiquez le libellé du bouton.';
    if (!next.href) found.href = 'Indiquez l’adresse de destination.';
    else if (!/^(\/|https?:\/\/|mailto:|tel:|#)/i.test(next.href))
      found.href = 'Saisissez une adresse commençant par /, https://, mailto: ou tel:.';
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(next);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description="Libellé du bouton et page vers laquelle il mène."
      maxWidth={520}
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          {removable && value && (
            <Button variant="ghost" size="sm" className="mr-auto" onClick={() => onSubmit(null)}>
              <Trash2 aria-hidden />
              Retirer le bouton
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button size="sm" onClick={submit}>
            Valider
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
        <Field label="Libellé" required error={errors.label} help={charCountHelp(draft.label, 80)}>
          {(control) => (
            <Input
              {...control}
              maxLength={80}
              value={draft.label}
              onChange={(event) => setDraft({ ...draft, label: event.target.value })}
            />
          )}
        </Field>
        <Field label="Destination" required>
          {(control) => (
            <Select
              {...control}
              value={custom ? CUSTOM : draft.href}
              onChange={(event) => {
                const href = event.target.value;
                if (href === CUSTOM) {
                  setCustom(true);
                  setDraft({ ...draft, href: '' });
                } else {
                  setCustom(false);
                  setDraft({ ...draft, href, external: false });
                }
              }}
            >
              {LINK_TARGETS.map((target) => (
                <option key={target.href} value={target.href}>
                  {target.label}
                </option>
              ))}
              <option value={CUSTOM}>Autre adresse…</option>
            </Select>
          )}
        </Field>
        {custom && (
          <Field
            label="Adresse"
            required
            error={errors.href}
            help="Exemples : /services/experience/chef-prive, https://exemple.fr, tel:+237600000000"
          >
            {(control) => (
              <Input
                {...control}
                maxLength={500}
                value={draft.href}
                onChange={(event) => setDraft({ ...draft, href: event.target.value })}
                autoComplete="off"
              />
            )}
          </Field>
        )}
        <Field
          label="Libellé en mobile"
          help={charCountHelp(draft.labelMobile, 80, 'Facultatif : version courte affichée sur téléphone.')}
        >
          {(control) => (
            <Input
              {...control}
              maxLength={80}
              value={draft.labelMobile ?? ''}
              onChange={(event) => setDraft({ ...draft, labelMobile: event.target.value })}
            />
          )}
        </Field>
        {custom && (
          <SwitchField
            label="Ouvrir dans un nouvel onglet"
            checked={draft.external ?? false}
            onChange={(external) => setDraft({ ...draft, external })}
          />
        )}
      </form>
    </Modal>
  );
}

// ───────────────────────────── Visuel ─────────────────────────────

const SCENES = Object.keys(SCENE_LABELS) as IllustrationScene[];

const fileNameOf = (url: string) => decodeURIComponent(url.split('?')[0]?.split('/').pop() ?? url);

/**
 * Visuel d'une section (maquette : vignette 120 × 80, nom du fichier, dimensions, « Remplacer ») : une scène
 * d'illustration, remplacée sur le site par la photo lorsqu'elle est fournie.
 */
export function VisualField({
  label,
  value,
  onChange,
  optional = true,
}: {
  label: string;
  value: VisualData | null | undefined;
  onChange: (value: VisualData | null) => void;
  optional?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <div role="group" aria-labelledby={`${id}-label`} className="flex flex-col gap-2">
      <span id={`${id}-label`} className="font-ui text-[14px] leading-5 font-semibold text-text-main">
        {label}
      </span>
      {value ? (
        <div className="flex flex-wrap items-center gap-3">
          {value.image ? (
            <MediaThumb
              image={value.image}
              sizes="120px"
              className="h-20 w-[120px] shrink-0 rounded-[10px]"
            />
          ) : (
            <Visual visual={value} sizes="120px" className="h-20 w-[120px] shrink-0 rounded-[10px]" />
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-ui text-[14px] leading-5 font-semibold text-text-main">
              {value.image
                ? fileNameOf(value.image.url)
                : `Illustration « ${SCENE_LABELS[value.illustration]} »`}
            </span>
            <span className="font-ui text-[12px] leading-4 text-text-muted">
              {value.image
                ? `${value.image.width} × ${value.image.height}`
                : 'Illustration provisoire · ajoutez une photo pour la remplacer'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            aria-label={`Remplacer : ${label}`}
          >
            <ImageIcon aria-hidden />
            Remplacer
          </Button>
        </div>
      ) : (
        <AddItemButton
          onClick={() => {
            onChange({ illustration: 'accueil', image: null, alt: '' });
            setOpen(true);
          }}
        >
          Ajouter un visuel
        </AddItemButton>
      )}
      {value && (
        <VisualDialog
          open={open}
          title={label}
          value={value}
          optional={optional}
          onChange={onChange}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function VisualDialog({
  open,
  title,
  value,
  optional,
  onChange,
  onClose,
}: {
  open: boolean;
  title: string;
  value: VisualData;
  optional: boolean;
  onChange: (value: VisualData | null) => void;
  onClose: () => void;
}) {
  const name = useId();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description="L’illustration s’affiche tant qu’aucune photo n’est fournie ; la photo la remplace sans changer la mise en page."
      maxWidth={680}
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          {optional && (
            <Button
              variant="ghost"
              size="sm"
              className="mr-auto"
              onClick={() => {
                onChange(null);
                onClose();
              }}
            >
              <Trash2 aria-hidden />
              Retirer le visuel
            </Button>
          )}
          <Button size="sm" onClick={onClose}>
            Terminer
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 font-ui text-[14px] leading-5 font-semibold text-text-main">
            Illustration
          </legend>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {SCENES.map((scene) => (
              <label
                key={scene}
                className={cn(
                  'flex cursor-pointer flex-col gap-1 rounded-md border border-border-default p-1.5 transition-colors hover:bg-neutral-50',
                  'has-checked:border-brand-primary has-checked:bg-orange-50 has-checked:ring-1 has-checked:ring-brand-primary',
                  'has-focus-visible:focus-ring',
                )}
              >
                <input
                  type="radio"
                  name={name}
                  value={scene}
                  checked={value.illustration === scene}
                  onChange={() => onChange({ ...value, illustration: scene })}
                  className="sr-only"
                />
                <Visual
                  visual={{ illustration: scene, image: null, alt: '' }}
                  sizes="120px"
                  className="aspect-[3/2] w-full rounded-sm"
                />
                <span className="truncate text-center font-ui text-[12px] leading-4 text-text-main">
                  {SCENE_LABELS[scene]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <ImageField
          label="Photo (facultative)"
          value={value.image ?? null}
          onChange={(image) => onChange({ ...value, image })}
        />
        <Field
          label="Texte alternatif"
          help={charCountHelp(
            value.alt,
            200,
            'Décrivez l’image pour les personnes qui ne la voient pas ; laissez vide si elle est décorative.',
          )}
        >
          {(control) => (
            <Input
              {...control}
              maxLength={200}
              value={value.alt ?? ''}
              onChange={(event) => onChange({ ...value, alt: event.target.value })}
            />
          )}
        </Field>
      </div>
    </Modal>
  );
}

// ───────────────────────────── Listes ─────────────────────────────

/** Sous-champ d'un élément répétable avec son message d'erreur. */
export function ItemInput({
  label,
  path,
  multiline,
  className,
  ...props
}: {
  label: string;
  path: string;
  multiline?: boolean;
  className?: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
}) {
  const id = useId();
  const error = useFieldError(path);
  const common = {
    'aria-label': label,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
    maxLength: props.maxLength,
    value: props.value,
    placeholder: props.placeholder ?? label,
  } as const;
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      {multiline ? (
        <SubTextarea
          {...common}
          onChange={(event) => props.onChange(event.target.value)}
          className="aria-invalid:border-feedback-error"
        />
      ) : (
        <SubInput {...common} onChange={(event) => props.onChange(event.target.value)} />
      )}
      {error && (
        <p id={`${id}-error`} className="text-[12px] leading-4 text-feedback-error">
          {error}
        </p>
      )}
    </div>
  );
}

/** Liste de textes (mentions du bandeau, paragraphes, mots-clés). */
export function StringListField({
  label,
  value,
  onChange,
  path,
  itemName,
  addLabel,
  max,
  maxLength,
  multiline,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  path: string;
  itemName: string;
  addLabel: string;
  max?: number;
  maxLength: number;
  multiline?: boolean;
}) {
  const id = useId();
  const error = useFieldError(path);
  return (
    <div role="group" aria-labelledby={`${id}-label`} className="flex flex-col gap-2">
      <span id={`${id}-label`} className="font-ui text-[14px] leading-5 font-semibold text-text-main">
        {label}
      </span>
      <RepeatableList
        value={value}
        onChange={onChange}
        createItem={() => ''}
        addLabel={addLabel}
        itemName={itemName}
        max={max}
        getLabel={(item, index) => (item.trim() ? `${itemName} ${index + 1} « ${item.slice(0, 40)} »` : '')}
        renderFields={(item, update, index) => (
          <ItemInput
            label={`${capitalize(itemName)} ${index + 1}`}
            path={`${path}.${index}`}
            value={item}
            onChange={update}
            maxLength={maxLength}
            multiline={multiline}
          />
        )}
      />
      {error && <p className="text-[13px] leading-4 text-feedback-error">{error}</p>}
    </div>
  );
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** Éléments d'une section (étapes, engagements, cartes) : titre, texte, et selon le cas numéro, icône, visuel. */
export function ItemsField({
  label,
  value,
  onChange,
  path,
  itemName,
  addLabel,
  max,
  options = {},
}: {
  label: string;
  value: SectionItem[];
  onChange: (value: SectionItem[]) => void;
  path: string;
  itemName: string;
  addLabel: string;
  max?: number;
  options?: { number?: boolean; icon?: boolean; subtitle?: boolean; visual?: boolean };
}) {
  const id = useId();
  const error = useFieldError(path);
  return (
    <div role="group" aria-labelledby={`${id}-label`} className="flex flex-col gap-2">
      <span id={`${id}-label`} className="font-ui text-[14px] leading-5 font-semibold text-text-main">
        {label}
      </span>
      <RepeatableList
        value={value}
        onChange={onChange}
        createItem={() =>
          options.number ? { ...emptyItem(), number: String(value.length + 1).padStart(2, '0') } : emptyItem()
        }
        addLabel={addLabel}
        itemName={itemName}
        max={max}
        getLabel={(item, index) =>
          item.title.trim() ? `${itemName} « ${item.title} »` : `${itemName} ${index + 1}`
        }
        renderFields={(item, update, index) => {
          const name = `${itemName} ${index + 1}`;
          const itemPath = `${path}.${index}`;
          return (
            <>
              <div className="flex gap-2">
                {options.number && (
                  <ItemInput
                    label={`Numéro, ${name}`}
                    path={`${itemPath}.number`}
                    value={item.number ?? ''}
                    onChange={(number) => update({ ...item, number: number || null })}
                    maxLength={4}
                    placeholder="01"
                    className="w-[72px] shrink-0"
                  />
                )}
                <ItemInput
                  label={`Titre, ${name}`}
                  path={`${itemPath}.title`}
                  value={item.title}
                  onChange={(title) => update({ ...item, title })}
                  maxLength={160}
                  placeholder="Titre"
                  className="flex-1"
                />
              </div>
              {options.subtitle && (
                <ItemInput
                  label={`Sous-titre, ${name}`}
                  path={`${itemPath}.subtitle`}
                  value={item.subtitle ?? ''}
                  onChange={(subtitle) => update({ ...item, subtitle: subtitle || null })}
                  maxLength={200}
                  placeholder="Sous-titre (facultatif)"
                />
              )}
              <ItemInput
                label={`Texte, ${name}`}
                path={`${itemPath}.text`}
                value={item.text ?? ''}
                onChange={(text) => update({ ...item, text: text || null })}
                maxLength={800}
                placeholder="Texte"
                multiline
              />
              {options.icon && (
                <IconSelect
                  label={`Icône, ${name}`}
                  value={item.icon ?? ''}
                  onChange={(icon) => update({ ...item, icon: icon || null })}
                />
              )}
              {(options.visual || item.visual) && (
                <VisualField
                  label={`Visuel, ${name}`}
                  value={item.visual}
                  onChange={(visual) => update({ ...item, visual })}
                />
              )}
            </>
          );
        }}
      />
      {error && <p className="text-[13px] leading-4 text-feedback-error">{error}</p>}
    </div>
  );
}

function IconSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const options =
    ITEM_ICONS.includes(value as (typeof ITEM_ICONS)[number]) || !value ? ITEM_ICONS : [value, ...ITEM_ICONS];
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full cursor-pointer appearance-none rounded-sm border border-border-default bg-neutral-0 py-2.5 pr-9 pl-3 font-ui text-[14px] leading-5 text-text-main focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none focus:ring-inset"
      >
        <option value="">Sans icône</option>
        {options.map((icon) => (
          <option key={icon} value={icon}>
            Icône : {icon}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        size={16}
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-icon-default"
      />
    </div>
  );
}

// ───────────────────────────── Chiffres clés ─────────────────────────────

/**
 * Chiffres clés (maquette `92:11178`) : blocs `neutral/50` (rayon 12, padding 12, écart 8) avec la valeur
 * (« 150+ », Inter SemiBold 16) et le libellé (Inter 12 `text/muted`) ; 4 colonnes en desktop.
 */
export function FiguresField({
  label,
  value,
  onChange,
  path,
  max = 8,
}: {
  label: string;
  value: KeyFigure[];
  onChange: (value: KeyFigure[]) => void;
  path: string;
  max?: number;
}) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={`${id}-label`} className="flex flex-col gap-3">
      <span id={`${id}-label`} className="sr-only">
        {label}
      </span>
      {value.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {value.map((figure, index) => (
            <FigureBlock
              key={figure.key}
              figure={figure}
              index={index}
              path={`${path}.${index}`}
              onChange={(next) =>
                onChange(value.map((current, position) => (position === index ? next : current)))
              }
              onRemove={() => onChange(value.filter((_, position) => position !== index))}
            />
          ))}
        </ul>
      )}
      <AddItemButton
        disabled={value.length >= max}
        onClick={() => {
          const keys = value.map((figure) => figure.key);
          let next = value.length + 1;
          while (keys.includes(`chiffre-${next}`)) next += 1;
          onChange([
            ...value,
            { key: `chiffre-${next}`, value: 0, prefix: '', suffix: '', decimals: 0, label: '' },
          ]);
        }}
      >
        Ajouter un chiffre
      </AddItemButton>
    </div>
  );
}

function FigureBlock({
  figure,
  index,
  path,
  onChange,
  onRemove,
}: {
  figure: KeyFigure;
  index: number;
  path: string;
  onChange: (figure: KeyFigure) => void;
  onRemove: () => void;
}) {
  const id = useId();
  const [raw, setRaw] = useState(() => formatFigure(figure));
  const [invalid, setInvalid] = useState(false);
  // Valeur remplacée de l'extérieur (annulation du brouillon) : saisie resynchronisée.
  const formatted = formatFigure(figure);
  const [lastFormatted, setLastFormatted] = useState(formatted);
  if (formatted !== lastFormatted) {
    setLastFormatted(formatted);
    const parsed = parseFigure(raw);
    if (!parsed || formatFigure(parsed) !== formatted) setRaw(formatted);
  }
  const labelError = useFieldError(`${path}.label`);
  const name = figure.label.trim() ? `« ${figure.label} »` : `${index + 1}`;
  return (
    <li className="relative flex flex-col gap-2 rounded-md bg-neutral-50 p-3">
      <SubInput
        aria-label={`Valeur du chiffre ${name}`}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        value={raw}
        maxLength={16}
        placeholder="150+"
        onChange={(event) => {
          setRaw(event.target.value);
          const parsed = parseFigure(event.target.value);
          setInvalid(!parsed);
          if (parsed) onChange({ ...figure, ...parsed });
        }}
        className="pr-9 text-[16px] leading-6 font-semibold"
      />
      {invalid && (
        <p id={`${id}-error`} className="text-[12px] leading-4 text-feedback-error">
          Saisissez un nombre, ex. 150+ ou 4,8.
        </p>
      )}
      <SubInput
        aria-label={`Libellé du chiffre ${index + 1}`}
        aria-invalid={labelError ? true : undefined}
        aria-describedby={labelError ? `${id}-label-error` : undefined}
        value={figure.label}
        maxLength={80}
        placeholder="Libellé"
        onChange={(event) => onChange({ ...figure, label: event.target.value })}
        className="text-[12px] leading-4"
      />
      {labelError && (
        <p id={`${id}-label-error`} className="text-[12px] leading-4 text-feedback-error">
          {labelError}
        </p>
      )}
      <button
        type="button"
        aria-label={`Supprimer le chiffre ${name}`}
        onClick={onRemove}
        className="absolute top-[18px] right-[18px] flex size-6 items-center justify-center rounded-xs text-icon-default hover:bg-neutral-100 hover:text-text-main"
      >
        <Trash2 aria-hidden size={14} />
      </button>
    </li>
  );
}
