'use client';

import { Check, Star } from 'lucide-react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, Textarea } from '@/components/ui/field';
import { toast } from '@/components/ui/toaster';
import { browserApi } from '@/lib/api/browser';
import { errorMessage, toApiError } from '@/lib/api/errors';
import type { SurveyQuestion } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';

type Value = number | string | null;

const PUBLISH_TEXT =
  'J’accepte que mon avis (prénom, ville, note et commentaire) soit publié sur le site après validation par l’agence.';

/** Valeur renseignée (le texte libre compte dès qu'il n'est pas vide). */
const answered = (value: Value | undefined) =>
  value !== undefined && value !== null && (typeof value !== 'string' || value.trim() !== '');

/** Note en étoiles (Q1) : 5 boutons radio 36 px (32 en mobile), libellé de la note choisie dessous. */
function StarsQuestion({
  question,
  value,
  onChange,
}: {
  question: SurveyQuestion;
  value: number | null;
  onChange: (value: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value ?? 0;
  const label = shown ? question.options[shown - 1] : null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2" onMouseLeave={() => setHover(null)}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <label
            key={rating}
            onMouseEnter={() => setHover(rating)}
            className="cursor-pointer rounded-xs has-[:focus-visible]:focus-ring"
          >
            <input
              type="radio"
              name={question.id}
              value={rating}
              checked={value === rating}
              onChange={() => onChange(rating)}
              className="sr-only"
            />
            <span className="sr-only">{`${rating} sur 5${question.options[rating - 1] ? ` : ${question.options[rating - 1]}` : ''}`}</span>
            <Star
              aria-hidden
              strokeWidth={1.5}
              className={cn(
                'size-8 transition-colors duration-150 md:size-9',
                rating <= shown
                  ? 'fill-brand-primary text-brand-primary'
                  : 'fill-transparent text-border-strong',
              )}
            />
          </label>
        ))}
      </div>
      <p aria-hidden className="min-h-4 font-ui text-[12px] leading-4 text-text-muted">
        {label}
      </p>
    </div>
  );
}

/** Choix unique en puces (Q2, Q3). */
function ChoiceQuestion({
  question,
  value,
  onChange,
}: {
  question: SurveyQuestion;
  value: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {question.options.map((option) => {
        const selected = value === option;
        return (
          <label
            key={option}
            className={cn(
              'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-[9px] font-ui text-[14px] leading-5 font-medium tracking-[0.005em] transition-colors duration-150 has-[:focus-visible]:focus-ring',
              selected
                ? 'border-neutral-900 bg-neutral-900 text-neutral-0'
                : 'border-border-strong bg-neutral-0 text-text-main hover:bg-neutral-100',
            )}
          >
            <input
              type="radio"
              name={question.id}
              value={option}
              checked={selected}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            {selected && <Check aria-hidden size={14} strokeWidth={2.5} />}
            {option}
          </label>
        );
      })}
    </div>
  );
}

/** Échelle de recommandation 0–10 (Q4) : 11 cases égales, bornes dessous. */
function NpsQuestion({
  question,
  value,
  onChange,
}: {
  question: SurveyQuestion;
  value: number | null;
  onChange: (value: number) => void;
}) {
  const [low, high] = question.options;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 md:gap-1.5">
        {Array.from({ length: 11 }, (_, score) => {
          const selected = value === score;
          return (
            <label
              key={score}
              className={cn(
                'flex h-[30px] flex-1 cursor-pointer items-center justify-center rounded-[10px] border font-ui text-[14px] leading-5 font-medium tabular-nums transition-colors duration-150 has-[:focus-visible]:focus-ring md:h-10',
                selected
                  ? 'border-neutral-900 bg-neutral-900 text-neutral-0'
                  : 'border-border-strong bg-neutral-0 text-text-main hover:bg-neutral-100',
              )}
            >
              <input
                type="radio"
                name={question.id}
                value={score}
                checked={selected}
                onChange={() => onChange(score)}
                className="sr-only"
              />
              {score}
            </label>
          );
        })}
      </div>
      {(low || high) && (
        <div aria-hidden className="flex justify-between font-ui text-[12px] leading-4 text-text-muted">
          <span>{low}</span>
          <span>{high}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Questionnaire (`82:9579`) : progression en 5 segments qui avance avec les réponses, questions administrables
 * (étoiles, choix, échelle 0–10, texte), consentement à la publication, « Envoyer mes réponses » →
 * `POST /v1/surveys/{token}/responses` puis page de remerciement.
 */
export function SurveyForm({ token, questions }: { token: string; questions: SurveyQuestion[] }) {
  const router = useRouter();
  const sorted = [...questions].sort((a, b) => a.order - b.order);
  const [values, setValues] = useState<Record<string, Value>>({});
  const [publish, setPublish] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const done = sorted.filter((question) => answered(values[question.id])).length;

  function set(id: string, value: Value) {
    setValues((current) => ({ ...current, [id]: value }));
    setMissing((current) => current.filter((item) => item !== id));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const required = sorted.filter((question) => question.required && !answered(values[question.id]));
    if (required.length > 0) {
      setMissing(required.map((question) => question.id));
      document.getElementById(`question-${required[0]!.id}`)?.focus();
      return;
    }
    setSending(true);
    try {
      const { data, error, response } = await browserApi.POST('/v1/surveys/{token}/responses', {
        params: { path: { token } },
        body: {
          answers: sorted.map((question) => ({
            questionId: question.id,
            value: answered(values[question.id]) ? (values[question.id] ?? null) : null,
          })),
          publishConsent: publish,
        },
      });
      if (!response.ok || !data) throw toApiError(error, response);
      router.push('/questionnaire/merci' as Route);
    } catch (caught) {
      setSending(false);
      toast.error(errorMessage(caught));
    }
  }

  return (
    <form
      noValidate
      onSubmit={submit}
      aria-label="Questionnaire de satisfaction"
      className="flex flex-col gap-6 md:gap-7"
    >
      <div
        role="progressbar"
        aria-label="Progression du questionnaire"
        aria-valuemin={0}
        aria-valuemax={sorted.length}
        aria-valuenow={done}
        aria-valuetext={`${done} question${done > 1 ? 's' : ''} sur ${sorted.length}`}
        className="flex gap-1.5"
      >
        {sorted.map((question, index) => (
          <span
            key={question.id}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              index < done ? 'bg-brand-primary' : 'bg-neutral-100',
            )}
          />
        ))}
      </div>

      {sorted.map((question, index) => {
        const title = `${index + 1}. ${question.label}`;
        const error = missing.includes(question.id) ? 'Merci de répondre à cette question.' : null;
        if (question.kind === 'TEXT') {
          return (
            <fieldset key={question.id} className="flex flex-col gap-3">
              <legend
                id={`question-${question.id}`}
                tabIndex={-1}
                className="mb-3 font-ui text-[16px] leading-6 font-semibold text-text-main outline-none"
              >
                {frenchTypography(title)}
              </legend>
              <Field label={question.helpText ?? 'Votre réponse'} error={error}>
                {(control) => (
                  <Textarea
                    rows={3}
                    maxLength={2000}
                    placeholder="Ce qui vous a plu, ce que nous pouvons améliorer…"
                    value={(values[question.id] as string | undefined) ?? ''}
                    onChange={(event) => set(question.id, event.target.value)}
                    {...control}
                  />
                )}
              </Field>
            </fieldset>
          );
        }
        return (
          <fieldset
            key={question.id}
            aria-describedby={error ? `erreur-${question.id}` : undefined}
            className="flex flex-col"
          >
            <legend
              id={`question-${question.id}`}
              tabIndex={-1}
              className="mb-3 font-ui text-[16px] leading-6 font-semibold text-text-main outline-none"
            >
              {frenchTypography(title)}
              {question.required && <span className="text-text-brand"> *</span>}
            </legend>
            {question.kind === 'STARS' && (
              <StarsQuestion
                question={question}
                value={(values[question.id] as number | undefined) ?? null}
                onChange={(value) => set(question.id, value)}
              />
            )}
            {question.kind === 'CHOICE' && (
              <ChoiceQuestion
                question={question}
                value={(values[question.id] as string | undefined) ?? null}
                onChange={(value) => set(question.id, value)}
              />
            )}
            {question.kind === 'NPS' && (
              <NpsQuestion
                question={question}
                value={(values[question.id] as number | undefined) ?? null}
                onChange={(value) => set(question.id, value)}
              />
            )}
            {error && (
              <p
                id={`erreur-${question.id}`}
                role="alert"
                className="mt-2 text-[13px] leading-4 text-feedback-error"
              >
                {error}
              </p>
            )}
          </fieldset>
        );
      })}

      <Checkbox
        id="questionnaire-publication"
        label={PUBLISH_TEXT}
        checked={publish}
        onChange={(event) => setPublish(event.target.checked)}
      />
      <Button type="submit" fullWidth loading={sending}>
        Envoyer mes réponses
      </Button>
      <p className="text-center font-ui text-[12px] leading-4 text-text-muted">
        {`2 minutes · ${sorted.length} questions · réponses confidentielles`}
      </p>
    </form>
  );
}
