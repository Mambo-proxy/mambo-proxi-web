'use client';

import { Globe } from 'lucide-react';
import type { AdminCategory, AdminReview, AdminServiceListItem } from '@/lib/api/schema';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { ChipSelect } from '@/components/admin/editor/chip-select';
import { EditorSection, charCountHelp } from '@/components/admin/editor/editor-ui';
import { GalleryField, ImageField } from '@/components/admin/editor/media-picker';
import { RepeatableList, SubInput, SubTextarea } from '@/components/admin/editor/repeatable-list';
import { publicPath, type ServiceDraft } from './service-editor-model';

export type SectionProps = {
  draft: ServiceDraft;
  update: (changes: Partial<ServiceDraft>) => void;
  categories: AdminCategory[];
  services: AdminServiceListItem[];
  reviews: AdminReview[];
  errors: Record<string, string>;
};

/** 1. Informations générales (`91:10758`) : nom, rubrique, accroche, description, visuels. */
export function GeneralSection({ draft, update, categories, errors }: SectionProps) {
  return (
    <EditorSection
      number={1}
      title="Informations générales"
      subtitle="Ce qui apparaît en haut de la page et sur la carte du service."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nom du service" required error={errors.name}>
          {(control) => (
            <Input
              {...control}
              value={draft.name}
              onChange={(event) => update({ name: event.target.value })}
              placeholder="Ex. Visites guidées de Douala"
            />
          )}
        </Field>
        <Field label="Rubrique" required error={errors.categoryId}>
          {(control) => (
            <Select
              {...control}
              value={draft.categoryId}
              onChange={(event) => update({ categoryId: event.target.value })}
            >
              <option value="">Choisir une rubrique</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>
      <Field
        label="Phrase d’accroche"
        required
        error={errors.tagline}
        help={charCountHelp(draft.tagline, 120, 'Une phrase courte, affichée sous le titre.')}
      >
        {(control) => (
          <Input
            {...control}
            value={draft.tagline}
            maxLength={120}
            onChange={(event) => update({ tagline: event.target.value })}
            placeholder="Une phrase courte qui donne envie de découvrir le service."
          />
        )}
      </Field>
      <Field label="Description courte (cartes et résultats)">
        {(control) => (
          <Textarea
            {...control}
            rows={2}
            value={draft.summary}
            onChange={(event) => update({ summary: event.target.value })}
          />
        )}
      </Field>
      <ImageField
        label="Visuel principal"
        value={draft.coverImage}
        onChange={(coverImage) => update({ coverImage })}
        help="JPG ou PNG · 1600 px conseillé pour la photo principale."
      />
      <GalleryField
        label="Autres visuels"
        value={draft.gallery}
        onChange={(gallery) => update({ gallery })}
      />
    </EditorSection>
  );
}

/** 2. Public (`91:10853`) : une ligne par public, réordonnable. */
export function AudiencesSection({ draft, update }: SectionProps) {
  return (
    <EditorSection
      number={2}
      title="À qui s’adresse ce service ?"
      subtitle="Une ligne par public. Affiché sous forme de liste cochée."
    >
      <RepeatableList
        value={draft.audiences}
        onChange={(audiences) => update({ audiences })}
        createItem={() => ''}
        addLabel="Ajouter un public"
        itemName="public"
        getLabel={(item) => item}
        renderFields={(item, set, index) => (
          <SubInput
            aria-label={`Public ${index + 1}`}
            value={item}
            onChange={(event) => set(event.target.value)}
            placeholder="Ex. Aux nouveaux arrivants qui veulent découvrir la ville"
          />
        )}
      />
    </EditorSection>
  );
}

/** 3. Étapes (`91:10852`) : titre et texte de chaque étape, dans l'ordre. */
export function StepsSection({ draft, update }: SectionProps) {
  return (
    <EditorSection
      number={3}
      title="Ce que Mambo fait concrètement"
      subtitle="Les étapes du service, dans l’ordre."
    >
      <RepeatableList
        value={draft.steps}
        onChange={(steps) => update({ steps })}
        createItem={() => ({ title: '', text: '' })}
        addLabel="Ajouter une étape"
        itemName="étape"
        getLabel={(item) => item.title}
        renderFields={(item, set, index) => (
          <>
            <SubInput
              aria-label={`Titre de l’étape ${index + 1}`}
              value={item.title}
              onChange={(event) => set({ ...item, title: event.target.value })}
              placeholder="Titre de l’étape"
            />
            <SubTextarea
              aria-label={`Texte de l’étape ${index + 1}`}
              rows={2}
              value={item.text}
              onChange={(event) => set({ ...item, text: event.target.value })}
              placeholder="Ce que fait Mambo, concrètement."
            />
          </>
        )}
      />
    </EditorSection>
  );
}

/** 4. Avantages (`91:10909`) : titre et texte. */
export function AdvantagesSection({ draft, update }: SectionProps) {
  return (
    <EditorSection
      number={4}
      title="Les avantages pour le bénéficiaire"
      subtitle="Ce qui distingue ce service, en quelques points."
    >
      <RepeatableList
        value={draft.advantages}
        onChange={(advantages) => update({ advantages })}
        createItem={() => ({ title: '', text: '' })}
        addLabel="Ajouter un avantage"
        itemName="avantage"
        getLabel={(item) => item.title}
        renderFields={(item, set, index) => (
          <>
            <SubInput
              aria-label={`Titre de l’avantage ${index + 1}`}
              value={item.title}
              onChange={(event) => set({ ...item, title: event.target.value })}
              placeholder="Titre de l’avantage"
            />
            <SubTextarea
              aria-label={`Texte de l’avantage ${index + 1}`}
              rows={2}
              value={item.text}
              onChange={(event) => set({ ...item, text: event.target.value })}
              placeholder="Pourquoi ce point compte pour le bénéficiaire."
            />
          </>
        )}
      />
    </EditorSection>
  );
}

/** 5. Questions fréquentes (`91:10970`) : facultatives. */
export function FaqSection({ draft, update }: SectionProps) {
  return (
    <EditorSection number={5} title="Questions fréquentes" subtitle="Facultatif.">
      <RepeatableList
        value={draft.faq}
        onChange={(faq) => update({ faq })}
        createItem={() => ({ question: '', answer: '' })}
        addLabel="Ajouter une question"
        itemName="question"
        getLabel={(item) => item.question}
        renderFields={(item, set, index) => (
          <>
            <SubInput
              aria-label={`Question ${index + 1}`}
              value={item.question}
              onChange={(event) => set({ ...item, question: event.target.value })}
              placeholder="Question fréquente"
            />
            <SubTextarea
              aria-label={`Réponse à la question ${index + 1}`}
              rows={2}
              value={item.answer}
              onChange={(event) => set({ ...item, answer: event.target.value })}
              placeholder="Réponse courte et précise."
            />
          </>
        )}
      />
    </EditorSection>
  );
}

/** 6. Services liés et témoignages (`91:11022`) : puces à sélection multiple. */
export function RelationsSection({ draft, update, services, reviews }: SectionProps) {
  return (
    <EditorSection
      number={6}
      title="Services liés et témoignages"
      subtitle="Affichés en bas de la page du service."
    >
      <ChipSelect
        label="Services liés"
        options={services
          .filter((service) => service.slug !== draft.slug)
          .map((service) => ({ value: service.id, label: service.name }))}
        value={draft.relatedServiceIds}
        onChange={(relatedServiceIds) => update({ relatedServiceIds })}
      />
      <ChipSelect
        label="Témoignages affichés"
        options={reviews.map((review) => ({
          value: review.id,
          label: `${review.authorName} · ${'★'.repeat(review.rating)}`,
        }))}
        value={draft.featuredReviewIds}
        onChange={(featuredReviewIds) => update({ featuredReviewIds })}
      />
    </EditorSection>
  );
}

/** 7. Référencement (`91:11086`) : adresse de la page, titre et description pour Google. */
export function SeoSection({ draft, update, categories, errors }: SectionProps) {
  const path = publicPath(draft, categories);
  return (
    <EditorSection
      number={7}
      title="Référencement (SEO)"
      subtitle="Rempli automatiquement, modifiable si besoin."
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="service-slug" className="font-ui text-[14px] leading-5 font-semibold text-text-main">
          Adresse de la page
        </label>
        <div className="flex items-center gap-2 rounded-md border border-border-strong bg-neutral-0 px-4 py-3.5 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary focus-within:ring-inset">
          <Globe aria-hidden size={18} className="shrink-0 text-icon-default" />
          <span className="font-ui text-[16px] leading-6 whitespace-nowrap text-text-muted">
            mamboproxi.com/services/
          </span>
          <input
            id="service-slug"
            value={draft.slug}
            onChange={(event) => update({ slug: event.target.value })}
            aria-invalid={errors.slug ? true : undefined}
            placeholder="adresse-du-service"
            className="min-w-0 flex-1 border-0 bg-transparent p-0 font-ui text-[16px] leading-6 text-text-main placeholder:text-text-subtle focus:outline-none"
          />
        </div>
        <p className="text-caption text-text-muted">{path}</p>
      </div>
      <Field label="Titre pour Google" error={errors.seoTitle} help={charCountHelp(draft.seoTitle, 60)}>
        {(control) => (
          <Input
            {...control}
            value={draft.seoTitle}
            maxLength={60}
            onChange={(event) => update({ seoTitle: event.target.value })}
            placeholder="Nom du service | MAMBO Proxi"
          />
        )}
      </Field>
      <Field
        label="Description pour Google"
        error={errors.seoDescription}
        help={charCountHelp(draft.seoDescription, 160)}
      >
        {(control) => (
          <Textarea
            {...control}
            rows={3}
            value={draft.seoDescription}
            maxLength={160}
            onChange={(event) => update({ seoDescription: event.target.value })}
          />
        )}
      </Field>
    </EditorSection>
  );
}
