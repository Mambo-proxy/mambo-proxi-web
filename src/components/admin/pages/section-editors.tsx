'use client';

import { ArrowUpRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { RepeatableList } from '@/components/admin/editor/repeatable-list';
import { RichTextEditor } from '@/components/admin/editor/rich-text-editor';
import { Field, Input, Select } from '@/components/ui/field';
import { adminRoutes } from '@/lib/admin/routes';
import type {
  CardGridSection,
  CtaBandSection,
  DynamicSection,
  FaqSection,
  FeatureListSection,
  HeroSection,
  MarqueeSection,
  PageSection,
  QuoteSection,
  RichTextSection,
  SectionTone,
  StatsGridSection,
  StepsSection,
  TeamSection,
  TextMediaSection,
} from '@/lib/api/schema';
import {
  AccentField,
  FiguresField,
  ItemInput,
  ItemsField,
  LinkField,
  OptionalTextField,
  StringListField,
  SwitchField,
  TextField,
  useFieldError,
  VisualField,
} from './fields';
import { DYNAMIC_SOURCES, TONE_LABELS } from './page-model';

/**
 * Un éditeur par type de section (`PageSection` du contrat). Chaque éditeur reçoit la section, la remplace par sa
 * nouvelle version (`onChange`) et connaît son chemin (`sections.2`) pour afficher les erreurs de validation.
 */

type EditorProps<T> = { section: T; onChange: (next: T) => void; path: string };

export function SectionEditor({ section, onChange, path }: EditorProps<PageSection>) {
  const props = { path, onChange: onChange as never };
  switch (section.type) {
    case 'hero':
      return <HeroEditor section={section} {...props} />;
    case 'marquee':
      return <MarqueeEditor section={section} {...props} />;
    case 'steps':
      return <StepsEditor section={section} {...props} />;
    case 'featureList':
      return <FeatureListEditor section={section} {...props} />;
    case 'cardGrid':
      return <CardGridEditor section={section} {...props} />;
    case 'textMedia':
      return <TextMediaEditor section={section} {...props} />;
    case 'quote':
      return <QuoteEditor section={section} {...props} />;
    case 'statsGrid':
      return <StatsGridEditor section={section} {...props} />;
    case 'team':
      return <TeamEditor section={section} {...props} />;
    case 'faq':
      return <FaqEditor section={section} {...props} />;
    case 'richText':
      return <RichTextSectionEditor section={section} {...props} />;
    case 'ctaBand':
      return <CtaBandEditor section={section} {...props} />;
    case 'dynamic':
      return <DynamicEditor section={section} {...props} />;
  }
}

/** En-tête commun : surtitre, titre (texte mis en avant) et chapô. */
function HeadingFields({
  section,
  onChange,
  path,
  eyebrow = true,
  lead = true,
  titleLabel = 'Titre',
  leadLabel = 'Chapô',
  titleRequired,
}: EditorProps<PageSection> & {
  eyebrow?: boolean;
  lead?: boolean;
  titleLabel?: string;
  leadLabel?: string;
  titleRequired?: boolean;
}) {
  return (
    <>
      {eyebrow && (
        <OptionalTextField
          label="Surtitre"
          value={section.eyebrow}
          onChange={(value) => onChange({ ...section, eyebrow: value })}
          path={`${path}.eyebrow`}
          max={80}
        />
      )}
      <AccentField
        label={titleLabel}
        value={section.title}
        required={titleRequired}
        onChange={(value) => onChange({ ...section, title: titleRequired ? (value ?? '') : value })}
        path={`${path}.title`}
      />
      {lead && (
        <OptionalTextField
          label={leadLabel}
          value={section.lead}
          onChange={(value) => onChange({ ...section, lead: value })}
          path={`${path}.lead`}
          max={600}
          multiline
        />
      )}
    </>
  );
}

/** Réglages avancés : nom dans le back-office, ancre, fond, variantes mobiles du titre et du chapô. */
export function AdvancedFields({ section, onChange, path }: EditorProps<PageSection>) {
  const anchorError = useFieldError(`${path}.anchor`);
  return (
    <details className="group rounded-md border border-border-default">
      <summary className="cursor-pointer list-none rounded-md px-4 py-3 font-ui text-[14px] leading-5 font-semibold text-text-main hover:bg-neutral-50 [&::-webkit-details-marker]:hidden">
        <span aria-hidden className="mr-2 inline-block transition-transform group-open:rotate-90">
          ›
        </span>
        Réglages avancés
      </summary>
      <div className="flex flex-col gap-4 border-t border-border-default p-4">
        <OptionalTextField
          label="Nom dans le back-office"
          value={section.adminLabel}
          onChange={(value) => onChange({ ...section, adminLabel: value })}
          path={`${path}.adminLabel`}
          max={80}
          help="Nom affiché dans cette liste (n’apparaît pas sur le site)."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Ancre" error={anchorError} help="Lien direct vers la section (ex. notre-equipe).">
            {(control) => (
              <Input
                {...control}
                value={section.anchor ?? ''}
                maxLength={64}
                onChange={(event) => onChange({ ...section, anchor: event.target.value || null })}
              />
            )}
          </Field>
          <Field label="Fond de la section">
            {(control) => (
              <Select
                {...control}
                value={section.tone ?? ''}
                onChange={(event) =>
                  onChange({ ...section, tone: (event.target.value || undefined) as SectionTone | undefined })
                }
              >
                <option value="">Par défaut</option>
                {Object.entries(TONE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
        <AccentField
          label="Titre en mobile"
          value={section.titleMobile}
          onChange={(value) => onChange({ ...section, titleMobile: value })}
          path={`${path}.titleMobile`}
        />
        <OptionalTextField
          label="Chapô en mobile"
          value={section.leadMobile}
          onChange={(value) => onChange({ ...section, leadMobile: value })}
          path={`${path}.leadMobile`}
          max={300}
          multiline
          help="Vide : chapô principal."
        />
      </div>
    </details>
  );
}

function HeroEditor({ section, onChange, path }: EditorProps<HeroSection>) {
  if (section.variant === 'legal')
    return (
      <>
        <AccentField
          label="Titre"
          required
          value={section.title}
          onChange={(title) => onChange({ ...section, title: title ?? '' })}
          path={`${path}.title`}
        />
        <OptionalTextField
          label="Mention de mise à jour"
          value={section.updatedLabel}
          onChange={(updatedLabel) => onChange({ ...section, updatedLabel })}
          path={`${path}.updatedLabel`}
          max={120}
          placeholder="Dernière mise à jour : octobre 2026"
        />
      </>
    );
  return (
    <>
      <AccentField
        label="Titre"
        required
        value={section.title}
        onChange={(title) => onChange({ ...section, title: title ?? '' })}
        path={`${path}.title`}
      />
      <OptionalTextField
        label="Texte de présentation"
        value={section.lead}
        onChange={(lead) => onChange({ ...section, lead })}
        path={`${path}.lead`}
        max={600}
        multiline
      />
      <div className="grid gap-4 md:grid-cols-2">
        <LinkField
          label="Bouton principal"
          value={section.primaryCta}
          onChange={(primaryCta) => onChange({ ...section, primaryCta })}
          path={`${path}.primaryCta`}
        />
        <LinkField
          label="Bouton secondaire"
          value={section.secondaryCta}
          onChange={(secondaryCta) => onChange({ ...section, secondaryCta })}
          path={`${path}.secondaryCta`}
        />
      </div>
      <VisualField
        label="Visuel"
        value={section.visual}
        onChange={(visual) => onChange({ ...section, visual })}
      />
      {section.variant === 'home' && (
        <VisualField
          label="Visuel secondaire"
          value={section.visualSecondary}
          onChange={(visualSecondary) => onChange({ ...section, visualSecondary })}
        />
      )}
      {section.variant !== 'home' && (
        <OptionalTextField
          label="Surtitre"
          value={section.eyebrow}
          onChange={(eyebrow) => onChange({ ...section, eyebrow })}
          path={`${path}.eyebrow`}
          max={80}
        />
      )}
      {(section.variant === 'home' || section.badge) && (
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Badge"
            value={section.badge?.text}
            onChange={(text) =>
              onChange({
                ...section,
                badge: text || section.badge?.tag ? { tag: section.badge?.tag ?? null, text } : null,
              })
            }
            path={`${path}.badge.text`}
            max={60}
          />
          <TextField
            label="Étiquette du badge"
            value={section.badge?.tag}
            onChange={(tag) =>
              onChange({ ...section, badge: { text: section.badge?.text ?? '', tag: tag || null } })
            }
            path={`${path}.badge.tag`}
            max={40}
          />
        </div>
      )}
      {(section.variant === 'home' || section.socialProof) && (
        <OptionalTextField
          label="Preuve sociale"
          value={section.socialProof}
          onChange={(socialProof) => onChange({ ...section, socialProof })}
          path={`${path}.socialProof`}
          max={120}
        />
      )}
      {(section.variant === 'home' || section.sticker) && (
        <OptionalTextField
          label="Pastille"
          value={section.sticker}
          onChange={(sticker) => onChange({ ...section, sticker })}
          path={`${path}.sticker`}
          max={40}
        />
      )}
      {section.floatingCards && section.floatingCards.length > 0 && (
        <FloatingCardsField section={section} onChange={onChange} path={path} />
      )}
      {section.variant !== 'home' && <AnchorsField section={section} onChange={onChange} path={path} />}
      <SwitchField
        label="Bouton WhatsApp"
        checked={section.showWhatsapp ?? false}
        onChange={(showWhatsapp) => onChange({ ...section, showWhatsapp })}
        help="Affiche le bouton « Écrire sur WhatsApp » à côté des boutons."
      />
    </>
  );
}

function FloatingCardsField({ section, onChange, path }: EditorProps<HeroSection>) {
  const cards = section.floatingCards ?? [];
  return (
    <div role="group" aria-label="Cartes flottantes" className="flex flex-col gap-2">
      <span aria-hidden className="font-ui text-[14px] leading-5 font-semibold text-text-main">
        Cartes flottantes
      </span>
      <RepeatableList
        value={cards}
        onChange={(floatingCards) => onChange({ ...section, floatingCards })}
        createItem={() => ({ title: '', text: null })}
        addLabel="Ajouter une carte"
        itemName="carte"
        max={3}
        getLabel={(card) => (card.title ? `carte « ${card.title} »` : '')}
        renderFields={(card, update, index) => (
          <>
            <ItemInput
              label={`Titre, carte ${index + 1}`}
              path={`${path}.floatingCards.${index}.title`}
              value={card.title}
              onChange={(title) => update({ ...card, title })}
              maxLength={80}
            />
            <ItemInput
              label={`Texte, carte ${index + 1}`}
              path={`${path}.floatingCards.${index}.text`}
              value={card.text ?? ''}
              onChange={(text) => update({ ...card, text: text || null })}
              maxLength={120}
            />
          </>
        )}
      />
    </div>
  );
}

function AnchorsField({ section, onChange, path }: EditorProps<HeroSection>) {
  return (
    <div role="group" aria-label="Navigation dans la page" className="flex flex-col gap-2">
      <span aria-hidden className="font-ui text-[14px] leading-5 font-semibold text-text-main">
        Navigation dans la page
      </span>
      <RepeatableList
        value={section.anchors ?? []}
        onChange={(anchors) => onChange({ ...section, anchors })}
        createItem={() => ({ label: '', href: '#', external: false })}
        addLabel="Ajouter un lien"
        itemName="lien"
        getLabel={(link) => (link.label ? `lien « ${link.label} »` : '')}
        renderFields={(link, update, index) => (
          <div className="grid gap-2 sm:grid-cols-2">
            <ItemInput
              label={`Libellé, lien ${index + 1}`}
              path={`${path}.anchors.${index}.label`}
              value={link.label}
              onChange={(label) => update({ ...link, label })}
              maxLength={80}
            />
            <ItemInput
              label={`Ancre, lien ${index + 1}`}
              path={`${path}.anchors.${index}.href`}
              value={link.href}
              onChange={(href) => update({ ...link, href })}
              maxLength={500}
              placeholder="#notre-equipe"
            />
          </div>
        )}
      />
    </div>
  );
}

function MarqueeEditor({ section, onChange, path }: EditorProps<MarqueeSection>) {
  return (
    <>
      <StringListField
        label="Mentions"
        value={section.items}
        onChange={(items) => onChange({ ...section, items })}
        path={`${path}.items`}
        itemName="mention"
        addLabel="Ajouter une mention"
        max={30}
        maxLength={60}
      />
      <StringListField
        label="Mentions en mobile"
        value={section.itemsMobile ?? []}
        onChange={(itemsMobile) => onChange({ ...section, itemsMobile })}
        path={`${path}.itemsMobile`}
        itemName="mention mobile"
        addLabel="Ajouter une mention mobile"
        max={30}
        maxLength={60}
      />
    </>
  );
}

function StepsEditor({ section, onChange, path }: EditorProps<StepsSection>) {
  return (
    <>
      <HeadingFields section={section} onChange={onChange as never} path={path} />
      <Field label="Présentation">
        {(control) => (
          <Select
            {...control}
            value={section.layout}
            onChange={(event) =>
              onChange({ ...section, layout: event.target.value as StepsSection['layout'] })
            }
          >
            <option value="cards">Cartes</option>
            <option value="timeline">Frise</option>
            <option value="rail">Rail</option>
          </Select>
        )}
      </Field>
      <ItemsField
        label="Étapes"
        value={section.items}
        onChange={(items) => onChange({ ...section, items })}
        path={`${path}.items`}
        itemName="étape"
        addLabel="Ajouter une étape"
        max={8}
        options={{ number: true, icon: true }}
      />
      <OptionalTextField
        label="Note"
        value={section.note}
        onChange={(note) => onChange({ ...section, note })}
        path={`${path}.note`}
        max={300}
      />
    </>
  );
}

function FeatureListEditor({ section, onChange, path }: EditorProps<FeatureListSection>) {
  return (
    <>
      <HeadingFields section={section} onChange={onChange as never} path={path} />
      <ItemsField
        label="Éléments"
        value={section.items}
        onChange={(items) => onChange({ ...section, items })}
        path={`${path}.items`}
        itemName="élément"
        addLabel="Ajouter un élément"
        max={8}
        options={{ icon: true, number: section.items.some((item) => item.number) }}
      />
      <VisualField
        label="Visuel"
        value={section.visual}
        onChange={(visual) => onChange({ ...section, visual })}
      />
      {section.figures && section.figures.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-ui text-[14px] leading-5 font-semibold text-text-main">Chiffres clés</span>
          <FiguresField
            label="Chiffres clés"
            value={section.figures}
            onChange={(figures) => onChange({ ...section, figures })}
            path={`${path}.figures`}
          />
        </div>
      )}
    </>
  );
}

function CardGridEditor({ section, onChange, path }: EditorProps<CardGridSection>) {
  const illustrated = section.layout === 'illustrated' || section.layout === 'horizontal';
  return (
    <>
      <HeadingFields section={section} onChange={onChange as never} path={path} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Présentation">
          {(control) => (
            <Select
              {...control}
              value={section.layout}
              onChange={(event) =>
                onChange({ ...section, layout: event.target.value as CardGridSection['layout'] })
              }
            >
              <option value="cards">Cartes</option>
              <option value="numbered">Cartes numérotées</option>
              <option value="illustrated">Cartes illustrées</option>
              <option value="horizontal">Cartes horizontales</option>
              <option value="compact">Compacte</option>
            </Select>
          )}
        </Field>
        <Field label="Colonnes">
          {(control) => (
            <Select
              {...control}
              value={String(section.columns)}
              onChange={(event) => onChange({ ...section, columns: Number(event.target.value) })}
            >
              {[1, 2, 3, 4].map((columns) => (
                <option key={columns} value={columns}>
                  {columns} colonne{columns > 1 ? 's' : ''}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>
      <ItemsField
        label="Cartes"
        value={section.items}
        onChange={(items) => onChange({ ...section, items })}
        path={`${path}.items`}
        itemName="carte"
        addLabel="Ajouter une carte"
        max={12}
        options={{
          icon: !illustrated,
          number: section.layout === 'numbered',
          subtitle: section.items.some((item) => item.subtitle),
          visual: illustrated,
        }}
      />
      <LinkField
        label="Bouton sous les cartes"
        value={section.cta}
        onChange={(cta) => onChange({ ...section, cta })}
        path={`${path}.cta`}
      />
    </>
  );
}

function TextMediaEditor({ section, onChange, path }: EditorProps<TextMediaSection>) {
  return (
    <>
      <HeadingFields section={section} onChange={onChange as never} path={path} lead={false} />
      <StringListField
        label="Paragraphes"
        value={section.paragraphs}
        onChange={(paragraphs) => onChange({ ...section, paragraphs })}
        path={`${path}.paragraphs`}
        itemName="paragraphe"
        addLabel="Ajouter un paragraphe"
        max={8}
        maxLength={1500}
        multiline
      />
      <OptionalTextField
        label="Citation"
        value={section.quote}
        onChange={(quote) => onChange({ ...section, quote })}
        path={`${path}.quote`}
        max={400}
        multiline
      />
      <OptionalTextField
        label="Signature"
        value={section.signature}
        onChange={(signature) => onChange({ ...section, signature })}
        path={`${path}.signature`}
        max={120}
      />
      <StringListField
        label="Mots-clés"
        value={section.chips ?? []}
        onChange={(chips) => onChange({ ...section, chips })}
        path={`${path}.chips`}
        itemName="mot-clé"
        addLabel="Ajouter un mot-clé"
        maxLength={40}
      />
      <VisualField
        label="Visuel"
        value={section.visual}
        onChange={(visual) => onChange({ ...section, visual })}
      />
      <SwitchField
        label="Visuel à gauche"
        checked={section.reverse ?? false}
        onChange={(reverse) => onChange({ ...section, reverse })}
      />
      <LinkField
        label="Bouton"
        value={section.cta}
        onChange={(cta) => onChange({ ...section, cta })}
        path={`${path}.cta`}
      />
    </>
  );
}

function QuoteEditor({ section, onChange, path }: EditorProps<QuoteSection>) {
  return (
    <>
      <TextField
        label="Citation"
        required
        value={section.text}
        onChange={(text) => onChange({ ...section, text })}
        path={`${path}.text`}
        max={600}
        multiline
        rows={3}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <OptionalTextField
          label="Auteur"
          value={section.author}
          onChange={(author) => onChange({ ...section, author })}
          path={`${path}.author`}
          max={80}
        />
        <OptionalTextField
          label="Rôle"
          value={section.role}
          onChange={(role) => onChange({ ...section, role })}
          path={`${path}.role`}
          max={120}
        />
      </div>
      <VisualField
        label="Visuel"
        value={section.visual}
        onChange={(visual) => onChange({ ...section, visual })}
      />
    </>
  );
}

function StatsGridEditor({ section, onChange, path }: EditorProps<StatsGridSection>) {
  return (
    <FiguresField
      label="Chiffres clés"
      value={section.items}
      onChange={(items) => onChange({ ...section, items })}
      path={`${path}.items`}
    />
  );
}

function TeamEditor({ section, onChange, path }: EditorProps<TeamSection>) {
  return (
    <>
      <HeadingFields section={section} onChange={onChange as never} path={path} />
      <div role="group" aria-label="Membres de l’équipe" className="flex flex-col gap-2">
        <span aria-hidden className="font-ui text-[14px] leading-5 font-semibold text-text-main">
          Membres de l’équipe
        </span>
        <RepeatableList
          value={section.members}
          onChange={(members) => onChange({ ...section, members })}
          createItem={() => ({
            name: '',
            role: '',
            location: null,
            visual: { illustration: 'portrait' as const, image: null, alt: '' },
          })}
          addLabel="Ajouter un membre"
          itemName="membre"
          max={24}
          getLabel={(member) => (member.name ? `membre « ${member.name} »` : '')}
          renderFields={(member, update, index) => {
            const memberPath = `${path}.members.${index}`;
            return (
              <>
                <div className="grid gap-2 sm:grid-cols-2">
                  <ItemInput
                    label={`Nom, membre ${index + 1}`}
                    path={`${memberPath}.name`}
                    value={member.name}
                    onChange={(name) => update({ ...member, name })}
                    maxLength={80}
                  />
                  <ItemInput
                    label={`Rôle, membre ${index + 1}`}
                    path={`${memberPath}.role`}
                    value={member.role}
                    onChange={(role) => update({ ...member, role })}
                    maxLength={120}
                  />
                </div>
                <ItemInput
                  label={`Ville, membre ${index + 1}`}
                  path={`${memberPath}.location`}
                  value={member.location ?? ''}
                  onChange={(location) => update({ ...member, location: location || null })}
                  maxLength={80}
                />
                <VisualField
                  label={`Photo, membre ${index + 1}`}
                  value={member.visual}
                  optional={false}
                  onChange={(visual) => visual && update({ ...member, visual })}
                />
              </>
            );
          }}
        />
      </div>
    </>
  );
}

function FaqEditor({ section, onChange, path }: EditorProps<FaqSection>) {
  return (
    <>
      <HeadingFields section={section} onChange={onChange as never} path={path} />
      <div role="group" aria-label="Questions" className="flex flex-col gap-2">
        <span aria-hidden className="font-ui text-[14px] leading-5 font-semibold text-text-main">
          Questions
        </span>
        <RepeatableList
          value={section.items}
          onChange={(items) => onChange({ ...section, items })}
          createItem={() => ({ question: '', answer: '' })}
          addLabel="Ajouter une question"
          itemName="question"
          max={30}
          getLabel={(item) => (item.question ? `question « ${item.question} »` : '')}
          renderFields={(item, update, index) => (
            <>
              <ItemInput
                label={`Question ${index + 1}`}
                path={`${path}.items.${index}.question`}
                value={item.question}
                onChange={(question) => update({ ...item, question })}
                maxLength={200}
              />
              <ItemInput
                label={`Réponse ${index + 1}`}
                path={`${path}.items.${index}.answer`}
                value={item.answer}
                onChange={(answer) => update({ ...item, answer })}
                maxLength={2000}
                multiline
              />
            </>
          )}
        />
      </div>
    </>
  );
}

/** Pages légales : articles numérotés, chacun avec son titre et son texte mis en forme (titres 2 et 3, listes, liens). */
function RichTextSectionEditor({ section, onChange, path }: EditorProps<RichTextSection>) {
  return (
    <>
      <SwitchField
        label="Modèle à compléter"
        checked={section.toComplete ?? false}
        onChange={(toComplete) => onChange({ ...section, toComplete })}
        help="Affiche sur le site une mention indiquant que le texte est en cours de rédaction."
      />
      <div role="group" aria-label="Articles" className="flex flex-col gap-2">
        <span aria-hidden className="font-ui text-[14px] leading-5 font-semibold text-text-main">
          Articles
        </span>
        <RepeatableList
          value={section.articles}
          onChange={(articles) => onChange({ ...section, articles })}
          createItem={() => ({ title: '', html: '' })}
          addLabel="Ajouter un article"
          itemName="article"
          getLabel={(article, index) => (article.title ? `article ${index + 1} « ${article.title} »` : '')}
          renderFields={(article, update, index) => (
            <>
              <ItemInput
                label={`Titre de l’article ${index + 1}`}
                path={`${path}.articles.${index}.title`}
                value={article.title}
                onChange={(title) => update({ ...article, title })}
                maxLength={160}
              />
              <RichTextEditor
                label={`Texte de l’article ${index + 1}`}
                value={article.html}
                onChange={(html) => update({ ...article, html })}
                headings={[2, 3]}
                minHeight={120}
              />
            </>
          )}
        />
      </div>
    </>
  );
}

function CtaBandEditor({ section, onChange, path }: EditorProps<CtaBandSection>) {
  return (
    <>
      <AccentField
        label="Titre"
        value={section.title}
        onChange={(title) => onChange({ ...section, title })}
        path={`${path}.title`}
      />
      <OptionalTextField
        label="Texte"
        value={section.text}
        onChange={(text) => onChange({ ...section, text })}
        path={`${path}.text`}
        max={300}
        multiline
      />
      <OptionalTextField
        label="Texte en mobile"
        value={section.textMobile}
        onChange={(textMobile) => onChange({ ...section, textMobile })}
        path={`${path}.textMobile`}
        max={200}
        help="Vide : texte principal."
      />
      <LinkField
        label="Bouton"
        value={section.primaryCta}
        onChange={(primaryCta) => onChange({ ...section, primaryCta })}
        path={`${path}.primaryCta`}
      />
      <SwitchField
        label="Bouton WhatsApp"
        checked={section.showWhatsapp ?? true}
        onChange={(showWhatsapp) => onChange({ ...section, showWhatsapp })}
      />
    </>
  );
}

const MANAGE_ROUTES: Record<string, string> = {
  services: adminRoutes.services,
  reviews: adminRoutes.reviews,
  partners: adminRoutes.partners,
  trainings: adminRoutes.trainings,
  jobs: adminRoutes.jobs,
  settings: adminRoutes.settings,
  appointments: adminRoutes.appointments,
};

/** Contenu calculé (avis, rubriques, partenaires…) : seuls l'en-tête, le lien et les réglages sont modifiables. */
function DynamicEditor({ section, onChange, path }: EditorProps<DynamicSection>) {
  const source = DYNAMIC_SOURCES[section.source];
  const manage = source.manage;
  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-md bg-neutral-50 p-3.5 font-ui text-[14px] leading-5 text-text-main">
        <Sparkles aria-hidden size={18} className="shrink-0 text-icon-default" />
        <p className="min-w-0 flex-1">
          Contenu calculé automatiquement :{' '}
          {source.description.charAt(0).toLowerCase() + source.description.slice(1)}.
        </p>
        {manage && (
          <Link
            href={MANAGE_ROUTES[manage.screen] as never}
            className="inline-flex items-center gap-1 rounded-xs font-semibold underline underline-offset-2"
          >
            Gérer dans {manage.label}
            <ArrowUpRight aria-hidden size={14} />
          </Link>
        )}
      </div>
      <HeadingFields section={section} onChange={onChange as never} path={path} />
      {section.limit !== undefined && section.limit !== null && (
        <Field label="Nombre d’éléments affichés" help="Entre 1 et 50.">
          {(control) => (
            <Input
              {...control}
              type="number"
              min={1}
              max={50}
              value={section.limit ?? ''}
              onChange={(event) => {
                const limit = Math.min(50, Math.max(1, Number(event.target.value) || 1));
                onChange({ ...section, limit });
              }}
              className="max-w-[160px]"
            />
          )}
        </Field>
      )}
      <LinkField
        label="Lien"
        value={section.link}
        onChange={(link) => onChange({ ...section, link })}
        path={`${path}.link`}
      />
      {section.note !== undefined && section.note !== null && (
        <OptionalTextField
          label="Note"
          value={section.note}
          onChange={(note) => onChange({ ...section, note })}
          path={`${path}.note`}
          max={400}
          multiline
        />
      )}
      {section.items && section.items.length > 0 && (
        <ItemsField
          label="Éléments complémentaires"
          value={section.items}
          onChange={(items) => onChange({ ...section, items })}
          path={`${path}.items`}
          itemName="élément"
          addLabel="Ajouter un élément"
          options={{ icon: true }}
        />
      )}
    </>
  );
}
