'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Trash2 } from 'lucide-react';
import { useEffect, useId, useState, type ComponentProps } from 'react';
import {
  AddItemButton,
  ConfirmDialog,
  EditorLayout,
  EditorSection,
  SideCard,
  StatusPill,
} from '@/components/admin/editor/editor-ui';
import { RepeatableList, SubInput } from '@/components/admin/editor/repeatable-list';
import { DragHandle, SortableItem, SortableList } from '@/components/admin/editor/sortable';
import { AdminCard } from '@/components/admin/ui/admin-ui';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type { AdminSurveyQuestion, SurveyQuestionInput, SurveyQuestionKind } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { SURVEY_KIND_LABELS, surveyQuestionsKey } from './review-ui';

/** Contrat : 10 questions au plus, dont 5 actives. */
export const MAX_QUESTIONS = 10;
export const MAX_ACTIVE = 5;

export type DraftQuestion = SurveyQuestionInput & { key: string; options: string[] };

const SCALE = ['Oui, tout à fait', 'Plutôt oui', 'Plutôt non', 'Non, pas du tout'];

/** Choix proposés par défaut selon le type (étoiles : libellés 1 → 5 ; échelle : bornes 0 et 10). */
export function defaultOptions(kind: SurveyQuestionKind): string[] {
  if (kind === 'STARS') return ['Très décevant', 'Décevant', 'Correct', 'Très bien', 'Excellent'];
  if (kind === 'CHOICE') return [...SCALE];
  if (kind === 'NPS') return ['Pas du tout probable', 'Très probable'];
  return [];
}

let sequence = 0;
const newKey = () => `question-${sequence++}`;

export function toDraft(question: AdminSurveyQuestion): DraftQuestion {
  return {
    key: question.id,
    id: question.id,
    kind: question.kind,
    label: question.label,
    helpText: question.helpText ?? null,
    options: [...question.options],
    required: question.required,
    active: question.active,
  };
}

/** Corps de `PUT /v1/admin/survey-questions` : l'ordre de la liste fait foi. */
export function toInput(draft: DraftQuestion): SurveyQuestionInput {
  const { id, kind, required, active, ...question } = draft;
  return {
    id,
    kind,
    required,
    active,
    label: question.label.trim(),
    helpText: question.helpText?.trim() || null,
    options: kind === 'TEXT' ? [] : question.options.map((option) => option.trim()),
  };
}

/** Contrôles avant envoi (mêmes règles que l'API) : intitulé, au moins deux choix, 5 questions actives au plus. */
export function validateDraft(questions: DraftQuestion[]): {
  fields: Record<string, string>;
  general?: string;
} {
  const fields: Record<string, string> = {};
  questions.forEach((question, index) => {
    if (!question.label.trim()) fields[`${index}.label`] = 'Saisissez l’intitulé de la question.';
    if (question.kind === 'CHOICE' && question.options.filter((option) => option.trim()).length < 2)
      fields[`${index}.options`] = 'Proposez au moins deux choix de réponse.';
  });
  const active = questions.filter((question) => question.active).length;
  return {
    fields,
    general:
      active > MAX_ACTIVE
        ? `Le questionnaire compte ${MAX_ACTIVE} questions actives au maximum\u00A0: désactivez-en ${active - MAX_ACTIVE}.`
        : undefined,
  };
}

/** Liste déroulante d'un sous-champ (même gabarit que `SubInput`). */
function SubSelect({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select
        className={cn(
          'w-full cursor-pointer appearance-none rounded-sm border border-border-default bg-neutral-0 py-2.5 pr-9 pl-3 font-ui text-[14px] leading-5 text-text-main',
          'focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none focus:ring-inset',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        size={16}
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-icon-default"
      />
    </div>
  );
}

function OptionsFields({
  question,
  error,
  onChange,
}: {
  question: DraftQuestion;
  error?: string;
  onChange: (options: string[]) => void;
}) {
  const groupId = useId();
  if (question.kind === 'TEXT') return null;
  if (question.kind === 'CHOICE')
    return (
      <div role="group" aria-labelledby={groupId} className="flex flex-col gap-2">
        <span id={groupId} className="font-ui text-[14px] leading-5 font-semibold text-text-main">
          Choix de réponse
        </span>
        <RepeatableList
          value={question.options}
          onChange={onChange}
          createItem={() => ''}
          addLabel="Ajouter un choix"
          itemName="choix"
          getLabel={(option, index) => option || `choix ${index + 1}`}
          max={MAX_QUESTIONS}
          renderFields={(option, update, index) => (
            <SubInput
              aria-label={`Choix ${index + 1}`}
              maxLength={60}
              value={option}
              onChange={(event) => update(event.target.value)}
            />
          )}
        />
        {error && (
          <p role="alert" className="text-[13px] leading-4 text-feedback-error">
            {error}
          </p>
        )}
      </div>
    );
  const labels =
    question.kind === 'STARS'
      ? ['1 étoile', '2 étoiles', '3 étoiles', '4 étoiles', '5 étoiles']
      : ['Libellé de la note 0', 'Libellé de la note 10'];
  const options = labels.map((_, index) => question.options[index] ?? '');
  return (
    <div role="group" aria-labelledby={groupId} className="flex flex-col gap-2">
      <span id={groupId} className="font-ui text-[14px] leading-5 font-semibold text-text-main">
        {question.kind === 'STARS' ? 'Libellés des notes' : 'Bornes de l’échelle'}
      </span>
      <div className={cn('grid gap-2', question.kind === 'STARS' ? 'sm:grid-cols-5' : 'sm:grid-cols-2')}>
        {labels.map((label, index) => (
          <label key={label} className="flex flex-col gap-1 font-ui text-[12px] leading-4 text-text-muted">
            {label}
            <SubInput
              maxLength={60}
              value={options[index]}
              onChange={(event) =>
                onChange(
                  options.map((option, position) => (position === index ? event.target.value : option)),
                )
              }
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function QuestionItem({
  question,
  index,
  expanded,
  errors,
  onToggle,
  onChange,
  onDelete,
}: {
  question: DraftQuestion;
  index: number;
  expanded: boolean;
  errors: Record<string, string>;
  onToggle: () => void;
  onChange: (next: DraftQuestion) => void;
  onDelete: () => void;
}) {
  const panelId = useId();
  const title = question.label.trim() || 'Nouvelle question';
  const labelError = errors[`${index}.label`];
  const invalid = Boolean(labelError || errors[`${index}.options`]);
  return (
    <SortableItem
      id={question.key}
      className={cn(
        'flex flex-col rounded-md border bg-neutral-0',
        invalid ? 'border-feedback-error' : 'border-border-default',
      )}
    >
      <div className="flex items-center gap-2 p-2.5 pr-3">
        <DragHandle label={`la question ${index + 1}`} />
        <span
          aria-hidden
          className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-neutral-100 font-ui text-[11px] leading-4 font-semibold text-text-main"
        >
          {index + 1}
        </span>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex min-w-0 flex-1 flex-col items-start gap-0.5 rounded-xs py-1 text-left"
        >
          <span className="max-w-full truncate font-ui text-[14px] leading-5 font-semibold text-text-main">
            {title}
          </span>
          <span className="font-ui text-[12px] leading-4 text-text-muted">
            {SURVEY_KIND_LABELS[question.kind]}
            {question.required ? ' · obligatoire' : ''}
            <span className="sr-only">{expanded ? ' (replier)' : ' (modifier)'}</span>
          </span>
        </button>
        {!question.active && <StatusPill tone="neutral">Inactive</StatusPill>}
        <ChevronDown
          aria-hidden
          size={16}
          className={cn('shrink-0 text-icon-default transition-transform', expanded && 'rotate-180')}
        />
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Supprimer la question ${index + 1} : ${title}`}
          className="flex size-8 shrink-0 items-center justify-center rounded-sm text-icon-default hover:bg-neutral-100 hover:text-text-main"
        >
          <Trash2 aria-hidden size={16} />
        </button>
      </div>
      <div
        id={panelId}
        hidden={!expanded}
        className={cn(
          'flex-col gap-4 border-t border-border-default bg-neutral-50 p-3.5 md:p-4',
          expanded ? 'flex' : 'hidden',
        )}
      >
        <Field label="Intitulé de la question" required error={labelError}>
          {(control) => (
            <SubInput
              {...control}
              maxLength={200}
              value={question.label}
              onChange={(event) => onChange({ ...question, label: event.target.value })}
            />
          )}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type de réponse">
            {(control) => (
              <SubSelect
                {...control}
                value={question.kind}
                onChange={(event) => {
                  const kind = event.target.value as SurveyQuestionKind;
                  onChange({ ...question, kind, options: defaultOptions(kind) });
                }}
              >
                {(Object.keys(SURVEY_KIND_LABELS) as SurveyQuestionKind[]).map((kind) => (
                  <option key={kind} value={kind}>
                    {SURVEY_KIND_LABELS[kind]}
                  </option>
                ))}
              </SubSelect>
            )}
          </Field>
          <Field label="Aide (facultatif)">
            {(control) => (
              <SubInput
                {...control}
                maxLength={200}
                value={question.helpText ?? ''}
                onChange={(event) => onChange({ ...question, helpText: event.target.value })}
              />
            )}
          </Field>
        </div>
        <OptionsFields
          question={question}
          error={errors[`${index}.options`]}
          onChange={(options) => onChange({ ...question, options })}
        />
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <Switch
            label="Réponse obligatoire"
            checked={question.required}
            onChange={(event) => onChange({ ...question, required: event.target.checked })}
          />
          <Switch
            label="Question posée aux clients"
            checked={question.active}
            onChange={(event) => onChange({ ...question, active: event.target.checked })}
          />
        </div>
      </div>
    </SortableItem>
  );
}

function SurveyForm({ initial }: { initial: AdminSurveyQuestion[] }) {
  const client = useQueryClient();
  const [questions, setQuestions] = useState<DraftQuestion[]>(() => initial.map(toDraft));
  const [saved, setSaved] = useState(() => JSON.stringify(initial.map(toDraft).map(toInput)));
  const [expanded, setExpanded] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [general, setGeneral] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<DraftQuestion | null>(null);
  const dirty = JSON.stringify(questions.map(toInput)) !== saved;
  const activeCount = questions.filter((question) => question.active).length;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const save = useMutation({
    mutationFn: (body: SurveyQuestionInput[]) => data(browserApi.PUT('/v1/admin/survey-questions', { body })),
    onSuccess: (result) => {
      const next = result.map(toDraft);
      setQuestions(next);
      setSaved(JSON.stringify(next.map(toInput)));
      setErrors({});
      setGeneral(null);
      client.setQueryData(surveyQuestionsKey, result);
      toast.success('Questionnaire enregistré.');
    },
    onError: (error) => {
      const fields = error instanceof ApiError ? error.fieldErrors : {};
      setErrors(fields);
      if (!Object.keys(fields).length) setGeneral(errorMessage(error));
      const first = Object.keys(fields)[0];
      const question = first ? questions[Number(first.split('.')[0])] : undefined;
      if (question) setExpanded(question.key);
    },
  });

  function submit() {
    const check = validateDraft(questions);
    setErrors(check.fields);
    setGeneral(check.general ?? null);
    const first = Object.keys(check.fields)[0];
    if (first) {
      setExpanded(questions[Number(first.split('.')[0])]?.key ?? null);
      return;
    }
    if (check.general) return;
    save.mutate(questions.map(toInput));
  }

  function add() {
    const question: DraftQuestion = {
      key: newKey(),
      id: null,
      kind: 'CHOICE',
      label: '',
      helpText: null,
      options: defaultOptions('CHOICE'),
      required: false,
      active: activeCount < MAX_ACTIVE,
    };
    setQuestions([...questions, question]);
    setExpanded(question.key);
  }

  return (
    <EditorLayout
      aside={
        <>
          <SideCard title="Enregistrement">
            <p aria-live="polite" className="font-ui text-[13px] leading-5 text-text-muted">
              {dirty ? 'Modifications non enregistrées.' : 'Toutes les modifications sont enregistrées.'}
            </p>
            <Button size="sm" fullWidth loading={save.isPending} onClick={submit}>
              Enregistrer le questionnaire
            </Button>
          </SideCard>
          <SideCard title="Envoi">
            <ul className="flex list-disc flex-col gap-2 pl-4 font-ui text-[13px] leading-5 text-text-muted">
              <li>
                Envoyé automatiquement 24{'\u00A0'}h après le passage d’une demande au statut «{'\u00A0'}
                Prestation réalisée{'\u00A0'}».
              </li>
              <li>
                {MAX_ACTIVE} questions posées au maximum ({activeCount} actuellement), {MAX_QUESTIONS}{' '}
                questions enregistrées au plus.
              </li>
              <li>Les réponses déjà reçues ne sont pas modifiées.</li>
            </ul>
          </SideCard>
        </>
      }
    >
      <EditorSection
        title="Questions"
        subtitle="Glissez une question par sa poignée (ou Espace puis flèches au clavier) pour changer l’ordre."
      >
        {general && (
          <p
            role="alert"
            className="rounded-md bg-orange-50 px-3.5 py-3 font-ui text-[14px] leading-5 text-text-brand"
          >
            {general}
          </p>
        )}
        <SortableList
          items={questions}
          getId={(question) => question.key}
          getLabel={(question) => question.label.trim() || 'Nouvelle question'}
          onReorder={(next) => {
            setQuestions(next);
            setErrors({});
          }}
          as="ol"
          className="flex flex-col gap-2.5"
          renderItem={(question, index) => (
            <QuestionItem
              key={question.key}
              question={question}
              index={index}
              expanded={expanded === question.key}
              errors={errors}
              onToggle={() => setExpanded(expanded === question.key ? null : question.key)}
              onChange={(next) =>
                setQuestions(questions.map((item) => (item.key === question.key ? next : item)))
              }
              onDelete={() => setToDelete(question)}
            />
          )}
        />
        <AddItemButton onClick={add} disabled={questions.length >= MAX_QUESTIONS}>
          Ajouter une question
        </AddItemButton>
      </EditorSection>
      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          setQuestions(questions.filter((question) => question.key !== toDelete?.key));
          setErrors({});
          setToDelete(null);
        }}
        title="Supprimer cette question ?"
        description={`«\u00A0${toDelete?.label.trim() || 'Nouvelle question'}\u00A0» sera retirée du questionnaire à l’enregistrement. Les réponses déjà reçues restent consultables.`}
        confirmLabel="Supprimer la question"
        destructive
      />
    </EditorLayout>
  );
}

/** Questions du questionnaire de satisfaction : ordre (glisser-déposer, clavier), ajout, modification, suppression. */
export function SurveyEditor() {
  const query = useQuery({
    queryKey: surveyQuestionsKey,
    queryFn: () => data(browserApi.GET('/v1/admin/survey-questions')),
    // Le formulaire part des questions enregistrées : pas de rechargement pendant l'édition.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  if (query.isError)
    return (
      <AdminCard role="alert" className="flex flex-col items-start gap-3 p-6">
        <p className="font-ui text-[15px] leading-6">Impossible de charger les questions.</p>
        <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
          Réessayer
        </Button>
      </AdminCard>
    );
  if (!query.data)
    return (
      <div aria-hidden className="flex flex-col gap-2.5">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-[60px] rounded-md" />
        ))}
      </div>
    );
  return <SurveyForm initial={query.data} />;
}
