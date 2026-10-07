'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { addMonths, endOfMonth, format, max as latest, startOfMonth } from 'date-fns';
import { ArrowLeft, CalendarCheck, Check, CircleCheck, Globe, Mail, Smartphone, User } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Calendar, type DateKey } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, Input, PhoneInput, Textarea } from '@/components/ui/field';
import { toast } from '@/components/ui/toaster';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage, toApiError } from '@/lib/api/errors';
import type { AppointmentFormat, AppointmentReason, Availability } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatClock, formatDateTime, formatWeekdayDate } from '@/lib/format/date';
import { CONSENT_TEXT, fieldRules } from '@/lib/forms/schemas';
import { useAntiSpam } from '@/lib/forms/use-anti-spam';

const REASONS: ReadonlyArray<{ value: AppointmentReason; label: string }> = [
  { value: 'DEVIS', label: 'Devis' },
  { value: 'IMMOBILIER', label: 'Immobilier' },
  { value: 'PARTENARIAT', label: 'Partenariat' },
  { value: 'RECRUTEMENT', label: 'Recrutement' },
  { value: 'AUTRE', label: 'Autre' },
];

const FORMATS: ReadonlyArray<{ value: AppointmentFormat; label: string }> = [
  { value: 'AGENCE', label: 'À l’agence' },
  { value: 'TELEPHONE', label: 'Téléphone' },
  { value: 'VISIO', label: 'Visio' },
];

/** Rendez-vous possibles jusqu'à deux mois après le mois en cours. */
const MONTHS_AHEAD = 2;

const schema = z.object({
  fullName: fieldRules.fullName,
  email: fieldRules.email,
  phone: fieldRules.phone,
  message: z.string().trim().max(1000, 'Ce message est trop long (1 000 caractères au plus).'),
  consent: fieldRules.consent,
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

type Slot = Availability['days'][number]['slots'][number];

/** Groupe de puces à choix unique (motif, format, créneau) : boutons radio natifs habillés en puces. */
function ChoiceChips<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: ReactNode;
  name: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T | null;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3 font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-text-main">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-[9px] font-ui text-[14px] leading-5 font-medium tracking-[0.005em] transition-colors duration-150 has-[:focus-visible]:focus-ring',
                selected
                  ? 'border-neutral-900 bg-neutral-900 text-neutral-0'
                  : 'border-border-strong bg-neutral-0 text-text-main hover:bg-neutral-100',
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {selected && <Check aria-hidden size={14} strokeWidth={2.5} />}
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

const dayKey = (date: Date) => format(date, 'yyyy-MM-dd');

/**
 * « Prendre rendez-vous » (Contact `69:7867`) : motif, format, calendrier des disponibilités
 * (`GET /v1/appointments/availability`), créneaux du jour choisi en heure de Douala, puis — dans le même encart,
 * non maquetté — coordonnées et consentement, envoi `POST /v1/appointments` (statut « À confirmer »).
 */
export function AppointmentForm() {
  const antiSpam = useAntiSpam();
  const [today] = useState(() => new Date());
  const [month, setMonth] = useState(() => startOfMonth(today));
  const [reason, setReason] = useState<AppointmentReason | null>(null);
  const [formatChoice, setFormatChoice] = useState<AppointmentFormat | null>(null);
  const [day, setDay] = useState<DateKey | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [step, setStep] = useState<'choose' | 'details' | 'sent'>('choose');
  const [reference, setReference] = useState<string | null>(null);
  const [availability, setAvailability] = useState<{ key: string; data: Availability } | null>(null);

  const query = {
    from: dayKey(latest([startOfMonth(month), today])),
    to: dayKey(endOfMonth(month)),
    ...(formatChoice ? { format: formatChoice } : {}),
  };
  const queryKey = JSON.stringify(query);
  const loaded = availability?.key === queryKey ? availability.data : null;
  const days = new Map(loaded?.days.map((item) => [item.date, item]) ?? []);
  const daySlots = (day && days.get(day)?.slots) || [];

  useEffect(() => {
    let cancelled = false;
    browserApi
      .GET('/v1/appointments/availability', { params: { query: JSON.parse(queryKey) } })
      .then(({ data }) => {
        if (!cancelled && data) setAvailability({ key: queryKey, data });
      })
      .catch(() => {
        if (!cancelled) toast.error('Les disponibilités n’ont pas pu être chargées. Merci de réessayer.');
      });
    return () => {
      cancelled = true;
    };
  }, [queryKey]);

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { fullName: '', email: '', phone: '', message: '', consent: false as unknown as true },
  });
  const { errors, isSubmitting } = form.formState;

  function chooseFormat(next: AppointmentFormat) {
    setFormatChoice(next);
    if (slot && !slot.formats.includes(next)) setSlot(null);
  }

  function chooseDay(next: DateKey) {
    setDay(next);
    setSlot(null);
  }

  function requestAppointment() {
    const missing = [
      !reason && 'le motif',
      !formatChoice && 'le format',
      !slot && 'un jour et un créneau',
    ].filter(Boolean);
    if (missing.length > 0) {
      setProblem(`Merci de choisir ${missing.join(', ').replace(/, ([^,]*)$/, ' et $1')}.`);
      return;
    }
    setProblem(null);
    setStep('details');
  }

  async function onSubmit(values: FormOutput) {
    if (!reason || !formatChoice || !slot) return;
    try {
      const { data, error, response } = await browserApi.POST('/v1/appointments', {
        body: {
          reason,
          format: formatChoice,
          startsAt: slot.startsAt,
          contact: { fullName: values.fullName, email: values.email, phone: values.phone },
          message: values.message || null,
          consent: true,
          antiSpam: antiSpam.build(),
        },
      });
      if (!response.ok || !data) throw toApiError(error, response);
      setReference(data.reference);
      setStep('sent');
    } catch (caught) {
      if (caught instanceof ApiError) {
        for (const [path, message] of Object.entries(caught.fieldErrors)) {
          const name = path.replace(/^contact\./, '') as keyof FormInput;
          if (name in schema.shape) form.setError(name, { message });
        }
      }
      toast.error(errorMessage(caught));
    }
  }

  function restart() {
    form.reset();
    setSlot(null);
    setDay(null);
    setReference(null);
    setStep('choose');
  }

  const reasonLabel = REASONS.find((item) => item.value === reason)?.label;
  const formatLabel = FORMATS.find((item) => item.value === formatChoice)?.label;
  const timezoneLabel = loaded?.timezoneLabel ?? 'Heure de Douala (UTC+1)';

  return (
    <section
      id="rendez-vous"
      aria-labelledby="rendez-vous-titre"
      className="flex scroll-mt-[calc(var(--site-header-h,85px)+16px)] flex-col gap-5 rounded-[28px] bg-neutral-50 p-5 md:p-10"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-11 shrink-0 items-center justify-center rounded-[13px] bg-neutral-0"
        >
          <CalendarCheck size={20} className="text-text-brand" />
        </span>
        <div className="flex flex-col">
          <h2
            id="rendez-vous-titre"
            className="font-brand text-[24px] leading-8 font-semibold tracking-[-0.02em] text-text-main md:text-[26px]"
          >
            Prendre rendez-vous
          </h2>
          <p className="font-ui text-[14px] leading-5 text-text-muted">
            À l’agence, par téléphone ou en visio
          </p>
        </div>
      </div>

      {step === 'choose' && (
        <>
          <ChoiceChips
            legend="Motif du rendez-vous"
            name="motif"
            options={REASONS}
            value={reason}
            onChange={setReason}
          />
          <ChoiceChips
            legend="Format"
            name="format"
            options={FORMATS}
            value={formatChoice}
            onChange={chooseFormat}
          />
          <Calendar
            month={month}
            onMonthChange={setMonth}
            selected={day}
            onSelect={chooseDay}
            isAvailable={(key) => days.get(key)?.available ?? false}
            minMonth={startOfMonth(today)}
            maxMonth={addMonths(startOfMonth(today), MONTHS_AHEAD)}
            className="md:px-[19px]"
          />
          {day ? (
            <ChoiceChips
              legend={
                <span className="first-letter:uppercase">{`${formatWeekdayDate(`${day}T12:00:00Z`)} · créneaux disponibles`}</span>
              }
              name="creneau"
              options={daySlots.map((item) => ({ value: item.startsAt, label: formatClock(item.startsAt) }))}
              value={slot?.startsAt ?? null}
              onChange={(value) => setSlot(daySlots.find((item) => item.startsAt === value) ?? null)}
            />
          ) : (
            <p className="font-ui text-[14px] leading-5 text-text-muted">
              Choisissez un jour pour voir les créneaux disponibles.
            </p>
          )}
          <p className="-mt-1 flex items-center gap-1.5 text-caption text-text-muted">
            <Globe aria-hidden size={14} />
            {timezoneLabel}
          </p>
          {problem && (
            <p role="alert" className="text-[13px] leading-4 text-feedback-error">
              {problem}
            </p>
          )}
          <Button type="button" fullWidth onClick={requestAppointment}>
            Demander ce rendez-vous
          </Button>
          <p className="text-caption text-text-muted">
            Le rendez-vous est confirmé par l’agence par e-mail ou WhatsApp.
          </p>
        </>
      )}

      {step !== 'choose' && slot && (
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-neutral-0 p-4">
          <p className="flex flex-col font-ui text-[14px] leading-5">
            <span className="font-semibold text-text-main first-letter:uppercase">
              {`${formatWeekdayDate(slot.startsAt)} à ${formatClock(slot.startsAt)}`}
            </span>
            <span className="text-text-muted">{`${reasonLabel} · ${formatLabel} · ${timezoneLabel}`}</span>
          </p>
          {step === 'details' && (
            <button
              type="button"
              onClick={() => setStep('choose')}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xs font-ui text-[14px] leading-5 font-semibold text-text-brand"
            >
              <ArrowLeft aria-hidden size={16} />
              Modifier
            </button>
          )}
        </div>
      )}

      {step === 'details' && (
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          aria-label="Vos coordonnées"
          className="flex flex-col gap-5"
        >
          <input {...antiSpam.honeypotProps} />
          <p className="font-ui text-[14px] leading-5 font-semibold text-text-main">Vos coordonnées</p>
          <Field label="Nom et prénom" required error={errors.fullName?.message}>
            {(control) => (
              <Input
                icon={User}
                autoComplete="name"
                placeholder="Votre nom complet"
                {...control}
                {...form.register('fullName')}
              />
            )}
          </Field>
          <Field label="E-mail" required error={errors.email?.message}>
            {(control) => (
              <Input
                icon={Mail}
                type="email"
                autoComplete="email"
                placeholder="vous@exemple.com"
                {...control}
                {...form.register('email')}
              />
            )}
          </Field>
          <Field label="Téléphone / WhatsApp" required error={errors.phone?.message}>
            {(control) => <PhoneInput icon={Smartphone} {...control} {...form.register('phone')} />}
          </Field>
          <Field label="Message" help="Facultatif : précisez votre besoin." error={errors.message?.message}>
            {(control) => (
              <Textarea rows={3} placeholder="Votre message…" {...control} {...form.register('message')} />
            )}
          </Field>
          <div className="flex flex-col gap-1.5">
            <Checkbox
              id="rdv-consent"
              label={CONSENT_TEXT}
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? 'rdv-consent-error' : undefined}
              {...form.register('consent')}
            />
            {errors.consent && (
              <p id="rdv-consent-error" className="pl-8 text-[13px] leading-4 text-feedback-error">
                {errors.consent.message}
              </p>
            )}
          </div>
          <Button type="submit" fullWidth loading={isSubmitting}>
            Envoyer ma demande de rendez-vous
          </Button>
        </form>
      )}

      {step === 'sent' && slot && (
        <div role="status" className="flex flex-col items-start gap-4">
          <p className="flex items-start gap-3 font-ui text-[16px] leading-6 text-text-main">
            <CircleCheck aria-hidden size={22} className="mt-px shrink-0 text-vert-600" />
            {`Votre demande de rendez-vous du ${formatDateTime(slot.startsAt)} est bien envoyée. L’agence vous la confirme par e-mail ou WhatsApp.`}
          </p>
          {reference && (
            <p className="font-ui text-[14px] leading-5 text-text-muted">
              Référence : <span className="font-semibold text-text-main">{reference}</span>
            </p>
          )}
          <Button variant="outline" onClick={restart}>
            Prendre un autre rendez-vous
          </Button>
        </div>
      )}
    </section>
  );
}
