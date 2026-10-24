'use client';

import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
  Unlink,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/cn';
import { EmailButton, EmailImage } from './email-nodes';
import { MediaPickerDialog } from './media-picker';

/** Outils de la barre à libellés ; `image` et `button` (e-mails) ajoutent les nœuds `EmailHtml`. */
export type LabelTool = 'bold' | 'italic' | 'heading' | 'bullet' | 'quote' | 'link' | 'image' | 'button';

const DEFAULT_LABEL_TOOLS: LabelTool[] = ['bold', 'italic', 'heading', 'bullet', 'quote', 'link'];

type RichTextEditorProps = {
  /** Libellé du champ (associé à la zone d'édition). */
  label: string;
  /** HTML (balises autorisées par l'API : p, h2, h3, h4, strong, em, a, ul, ol, li, br, blockquote). */
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Hauteur minimale de la zone d'édition (px). */
  minHeight?: number;
  /** Niveaux de titre proposés (pages légales : 2 et 3). */
  headings?: (2 | 3)[];
  help?: string;
  error?: string | null;
  /**
   * `labels` : barre d'outils à libellés (« B », « I », « Titre », « Liste », « Citation », « Lien ») posée au-dessus
   * de la zone de saisie (édito du Magazine `269:2044`), libellé du champ masqué visuellement.
   */
  variant?: 'icons' | 'labels';
  /** Outils de la barre à libellés (newsletter `94:11800` : gras, italique, lien, image, bouton). */
  tools?: LabelTool[];
};

/**
 * Éditeur de texte riche (pages légales, descriptions longues, campagnes) : barre d'outils (gras, italique,
 * titres, listes, citation, lien, annuler / rétablir), raccourcis clavier usuels. Non maquetté : même langage que
 * les champs (bordure `border/strong`, rayon 12, focus orange). Le HTML produit est assaini à nouveau par l'API.
 */
export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
  minHeight = 180,
  headings = [2, 3],
  help,
  error,
  variant = 'icons',
  tools = DEFAULT_LABEL_TOOLS,
}: RichTextEditorProps) {
  const id = useId();
  const labelled = variant === 'labels';
  const email = labelled && (tools.includes('image') || tools.includes('button'));
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        code: false,
        codeBlock: false,
        strike: false,
        underline: false,
        horizontalRule: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
          protocols: ['mailto', 'tel'],
          HTMLAttributes: { rel: 'noopener noreferrer', target: null },
        },
      }),
      ...(email ? [EmailImage, EmailButton] : []),
    ],
    content: value,
    editorProps: {
      attributes: {
        id,
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-labelledby': `${id}-label`,
        ...(help ? { 'aria-describedby': `${id}-help` } : {}),
        ...(error ? { 'aria-invalid': 'true' } : {}),
        ...(placeholder ? { 'data-placeholder': placeholder } : {}),
        class: labelled
          ? 'rich-text-editor rich-text-editor-compact min-h-(--rte-min) p-4 font-ui text-[14px] leading-[17px] text-text-main outline-none'
          : 'rich-text-editor prose-admin min-h-(--rte-min) px-4 py-3.5 font-ui text-[15px] leading-6 text-text-main outline-none',
      },
    },
    onUpdate: ({ editor: instance }) => onChange(instance.isEmpty ? '' : instance.getHTML()),
  });

  // Contenu remplacé de l'extérieur (rechargement, annulation des modifications) : synchronisation.
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const current = editor.isEmpty ? '' : editor.getHTML();
    if (value !== current) editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  if (labelled)
    return (
      <div className="flex flex-col gap-4">
        <span id={`${id}-label`} className="sr-only">
          {label}
        </span>
        {editor && <LabelToolbar editor={editor} label={label} tools={tools} />}
        <div
          style={{ ['--rte-min' as string]: `${minHeight}px` }}
          className={cn(
            'overflow-hidden rounded-[10px] border border-border-strong bg-neutral-0 transition-colors',
            'focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary focus-within:ring-inset',
            error && 'border-feedback-error ring-1 ring-feedback-error ring-inset',
          )}
        >
          <EditorContent editor={editor} />
        </div>
        {help && !error && (
          <p id={`${id}-help`} className="text-caption text-text-muted">
            {help}
          </p>
        )}
        {error && (
          <p role="alert" className="text-[13px] leading-4 text-feedback-error">
            {error}
          </p>
        )}
      </div>
    );

  return (
    <div className="flex flex-col gap-2">
      <span id={`${id}-label`} className="font-ui text-[14px] leading-5 font-semibold text-text-main">
        {label}
      </span>
      <div
        style={{ ['--rte-min' as string]: `${minHeight}px` }}
        className={cn(
          'overflow-hidden rounded-md border border-border-strong bg-neutral-0 transition-colors',
          'focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary focus-within:ring-inset',
          error && 'border-feedback-error ring-1 ring-feedback-error ring-inset',
        )}
      >
        {editor && <Toolbar editor={editor} headings={headings} label={label} />}
        <EditorContent editor={editor} />
      </div>
      {help && !error && (
        <p id={`${id}-help`} className="text-caption text-text-muted">
          {help}
        </p>
      )}
      {error && (
        <p role="alert" className="text-[13px] leading-4 text-feedback-error">
          {error}
        </p>
      )}
    </div>
  );
}

function Toolbar({ editor, headings, label }: { editor: Editor; headings: (2 | 3)[]; label: string }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const state = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      bold: instance.isActive('bold'),
      italic: instance.isActive('italic'),
      h2: instance.isActive('heading', { level: 2 }),
      h3: instance.isActive('heading', { level: 3 }),
      bullet: instance.isActive('bulletList'),
      ordered: instance.isActive('orderedList'),
      quote: instance.isActive('blockquote'),
      link: instance.isActive('link'),
      canUndo: instance.can().undo(),
      canRedo: instance.can().redo(),
    }),
  });
  const chain = () => editor.chain().focus();

  return (
    <div
      role="toolbar"
      aria-label={`Mise en forme : ${label}`}
      className="flex flex-wrap items-center gap-0.5 border-b border-border-default bg-neutral-50 px-2 py-1.5"
    >
      <ToolButton icon={Bold} label="Gras" active={state.bold} onClick={() => chain().toggleBold().run()} />
      <ToolButton
        icon={Italic}
        label="Italique"
        active={state.italic}
        onClick={() => chain().toggleItalic().run()}
      />
      <Separator />
      {headings.includes(2) && (
        <ToolButton
          icon={Heading2}
          label="Titre de section"
          active={state.h2}
          onClick={() => chain().toggleHeading({ level: 2 }).run()}
        />
      )}
      {headings.includes(3) && (
        <ToolButton
          icon={Heading3}
          label="Sous-titre"
          active={state.h3}
          onClick={() => chain().toggleHeading({ level: 3 }).run()}
        />
      )}
      <ToolButton
        icon={List}
        label="Liste à puces"
        active={state.bullet}
        onClick={() => chain().toggleBulletList().run()}
      />
      <ToolButton
        icon={ListOrdered}
        label="Liste numérotée"
        active={state.ordered}
        onClick={() => chain().toggleOrderedList().run()}
      />
      <ToolButton
        icon={Quote}
        label="Citation"
        active={state.quote}
        onClick={() => chain().toggleBlockquote().run()}
      />
      <Separator />
      <ToolButton
        icon={Link2}
        label="Ajouter un lien"
        active={state.link}
        onClick={() => setLinkOpen(true)}
      />
      {state.link && (
        <ToolButton
          icon={Unlink}
          label="Retirer le lien"
          onClick={() => chain().extendMarkRange('link').unsetLink().run()}
        />
      )}
      <Separator />
      <ToolButton
        icon={Undo2}
        label="Annuler"
        disabled={!state.canUndo}
        onClick={() => chain().undo().run()}
      />
      <ToolButton
        icon={Redo2}
        label="Rétablir"
        disabled={!state.canRedo}
        onClick={() => chain().redo().run()}
      />
      <LinkDialog
        open={linkOpen}
        initial={(editor.getAttributes('link').href as string | undefined) ?? ''}
        onClose={() => setLinkOpen(false)}
        onSubmit={(href) => {
          setLinkOpen(false);
          applyLink(editor, href);
        }}
      />
    </div>
  );
}

/** Pose, modifie ou retire (adresse vide) le lien de la sélection ; sans sélection, l'adresse devient le texte. */
function applyLink(editor: Editor, href: string) {
  const chain = editor.chain().focus();
  if (!href) chain.extendMarkRange('link').unsetLink().run();
  else if (editor.state.selection.empty && !editor.isActive('link'))
    chain.insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs: { href } }] }).run();
  else chain.extendMarkRange('link').setLink({ href }).run();
}

/** Barre d'outils à libellés (`269:2044`) : fond `neutral/50`, rayon 10, padding 6/8 ; boutons Inter 13, padding 5/10. */
function LabelToolbar({
  editor,
  label,
  tools: enabled,
}: {
  editor: Editor;
  label: string;
  tools: LabelTool[];
}) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [buttonOpen, setButtonOpen] = useState(false);
  const state = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      bold: instance.isActive('bold'),
      italic: instance.isActive('italic'),
      heading: instance.isActive('heading', { level: 3 }),
      bullet: instance.isActive('bulletList'),
      quote: instance.isActive('blockquote'),
      link: instance.isActive('link'),
    }),
  });
  const chain = () => editor.chain().focus();
  const tools: {
    key: LabelTool;
    text: string;
    name: string;
    active: boolean;
    bold?: boolean;
    italic?: boolean;
    run: () => void;
  }[] = [
    {
      key: 'bold',
      text: 'B',
      name: 'Gras',
      active: state.bold,
      bold: true,
      run: () => chain().toggleBold().run(),
    },
    {
      key: 'italic',
      text: 'I',
      name: 'Italique',
      active: state.italic,
      italic: true,
      run: () => chain().toggleItalic().run(),
    },
    {
      key: 'heading',
      text: 'Titre',
      name: 'Titre',
      active: state.heading,
      run: () => chain().toggleHeading({ level: 3 }).run(),
    },
    {
      key: 'bullet',
      text: 'Liste',
      name: 'Liste',
      active: state.bullet,
      run: () => chain().toggleBulletList().run(),
    },
    {
      key: 'quote',
      text: 'Citation',
      name: 'Citation',
      active: state.quote,
      run: () => chain().toggleBlockquote().run(),
    },
    { key: 'link', text: 'Lien', name: 'Lien', active: state.link, run: () => setLinkOpen(true) },
    { key: 'image', text: 'Image', name: 'Image', active: false, run: () => setImageOpen(true) },
    { key: 'button', text: 'Bouton', name: 'Bouton', active: false, run: () => setButtonOpen(true) },
  ];
  return (
    <div
      role="toolbar"
      aria-label={`Mise en forme : ${label}`}
      className="flex flex-wrap gap-1 rounded-[10px] bg-neutral-50 px-2 py-1.5"
    >
      {tools
        .filter((tool) => enabled.includes(tool.key))
        .map((tool) => (
          <button
            key={tool.name}
            type="button"
            aria-label={tool.name}
            aria-pressed={tool.active}
            onMouseDown={(event) => event.preventDefault()}
            onClick={tool.run}
            className={cn(
              'rounded-[6px] px-2.5 py-[5px] font-ui text-[13px] leading-4 text-neutral-700 transition-colors hover:bg-neutral-100',
              tool.bold ? 'font-semibold' : 'font-medium',
              tool.italic && 'italic',
              tool.active && 'bg-neutral-900 text-neutral-0 hover:bg-neutral-800',
            )}
          >
            {tool.text}
          </button>
        ))}
      <LinkDialog
        open={linkOpen}
        initial={(editor.getAttributes('link').href as string | undefined) ?? ''}
        onClose={() => setLinkOpen(false)}
        onSubmit={(href) => {
          setLinkOpen(false);
          applyLink(editor, href);
        }}
      />
      {enabled.includes('image') && (
        <MediaPickerDialog
          open={imageOpen}
          onClose={() => setImageOpen(false)}
          onSelect={(image) => {
            setImageOpen(false);
            editor
              .chain()
              .focus()
              .insertContent({ type: 'emailImage', attrs: { src: image.url, alt: image.alt ?? '' } })
              .run();
          }}
        />
      )}
      {enabled.includes('button') && (
        <ButtonDialog
          open={buttonOpen}
          onClose={() => setButtonOpen(false)}
          onSubmit={(attrs) => {
            setButtonOpen(false);
            editor.chain().focus().insertContent({ type: 'emailButton', attrs }).run();
          }}
        />
      )}
    </div>
  );
}

/** Bouton d'appel à l'action d'un e-mail : libellé et adresse (page du site ou adresse externe). */
function ButtonDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (attrs: { label: string; href: string }) => void;
}) {
  const [label, setLabel] = useState('');
  const [href, setHref] = useState('');
  const [errors, setErrors] = useState<{ label?: string; href?: string }>({});
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setLabel('');
      setHref('');
      setErrors({});
    }
  }

  function submit() {
    const next: typeof errors = {};
    if (!label.trim()) next.label = 'Saisissez le texte du bouton.';
    if (!/^(https?:\/\/|\/)/i.test(href.trim()))
      next.href = 'Saisissez une adresse commençant par https:// ou / (page du site).';
    setErrors(next);
    if (!next.label && !next.href) onSubmit({ label: label.trim(), href: href.trim() });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bouton"
      description="Un bouton orange qui renvoie vers une page du site ou une adresse externe."
      maxWidth={460}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button size="sm" onClick={submit}>
            Insérer le bouton
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
        <Field label="Texte du bouton" error={errors.label}>
          {(control) => (
            <Input
              {...control}
              value={label}
              maxLength={40}
              placeholder="Découvrir les sorties"
              onChange={(event) => setLabel(event.target.value)}
            />
          )}
        </Field>
        <Field label="Adresse" error={errors.href} help="Exemples : /services, https://exemple.fr">
          {(control) => (
            <Input
              {...control}
              value={href}
              autoComplete="off"
              onChange={(event) => setHref(event.target.value)}
            />
          )}
        </Field>
      </form>
    </Modal>
  );
}

function Separator() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-border-default" />;
}

function ToolButton({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active === undefined ? undefined : active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        'flex size-8 items-center justify-center rounded-sm text-icon-default transition-colors hover:bg-neutral-100 hover:text-text-main',
        'disabled:cursor-not-allowed disabled:opacity-40',
        active && 'bg-neutral-900 text-neutral-0 hover:bg-neutral-800 hover:text-neutral-0',
      )}
    >
      <Icon aria-hidden size={16} />
    </button>
  );
}

/** Adresse d'un lien : page du site (`/contact`), adresse externe, `mailto:` ou `tel:`. */
function LinkDialog({
  open,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial: string;
  onClose: () => void;
  onSubmit: (href: string) => void;
}) {
  const [href, setHref] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setHref(initial);
      setError(null);
    }
  }

  function submit() {
    const value = href.trim();
    if (value && !/^(https?:\/\/|\/|mailto:|tel:|#)/i.test(value)) {
      setError('Saisissez une adresse commençant par https://, / (page du site), mailto: ou tel:.');
      return;
    }
    onSubmit(value);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Lien"
      description="Laissez vide pour retirer le lien."
      maxWidth={460}
      footer={
        <div className="flex justify-end gap-2">
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
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Field
          label="Adresse du lien"
          error={error}
          help="Exemples : /contact, https://exemple.fr, mailto:contact@mamboproxi.com"
        >
          {(control) => (
            <Input
              {...control}
              value={href}
              onChange={(event) => setHref(event.target.value)}
              autoComplete="off"
            />
          )}
        </Field>
      </form>
    </Modal>
  );
}
