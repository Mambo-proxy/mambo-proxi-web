'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { addMonths, endOfMonth, format, max as latest, startOfMonth } from 'date-fns';
import { ArrowLeft, CalendarCheck, Check, CircleCheck, Globe, Mail, Smartphone, User } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod/mini';
import { Button } from '@/components/ui/button';
import { Calendar, type DateKey } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, Input, PhoneInput, Textarea } from '@/components/ui/field';
import { toast } from '@/components/ui/toaster';
import { browserApi } from '@/lib/api/browser';
import { ApiError, formErrorMessage, toApiError } from '@/lib/api/errors';
import type { AppointmentFormat, AppointmentReason, Availability } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { DEFAULT_TIME_ZONE, formatClock, formatDate, formatTime, formatWeekdayDate } from '@/lib/format/date';
import { trimmed, useFormCommon, type FieldRules } from '@/lib/forms/schemas';
import { useAntiSpam } from '@/lib/forms/use-anti-spam';

/** Motifs et formats proposés ; libellés dans la langue de la page (`forms.appointment.reasons` / `formats`). */
const REASONS: ReadonlyArray<AppointmentReason> = [
  'DEVIS',
  'IMMOBILIER',
  'PARTENARIAT',
  'RECRUTEMENT',
  'AUTRE',
];

const FORMATS: ReadonlyArray<AppointmentFormat> = ['AGENCE', 'TELEPHONE', 'VISIO'];

/** Rendez-vous possibles jusqu'à deux mois après le mois en cours. */
const MONTHS_AHEAD = 2;

type AppointmentMessages = ReturnType<typeof useTranslations<'forms.appointment'>>;

function makeSchema(rules: FieldRules, t: AppointmentMessages) {
  return z.object({
    fullName: rules.fullName,
    email: rules.email,
    phone: rules.phone,
    message: trimmed(z.maxLength(1000, t('messageTooLong'))),
    consent: rules.consent,
  });
}

type FormInput = z.input<ReturnType<typeof makeSchema>>;
type FormOutput = z.output<ReturnType<typeof makeSchema>>;

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
      <legend className="mb-2.5 font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-text-main">
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

/** « mardi 6 octobre » en français, « Tuesday 6 October » en anglais (heure de Douala). */
function weekdayDate(date: string, locale: 'fr' | 'en') {
  return formatWeekdayDate(date, DEFAULT_TIME_ZONE, locale);
}

/**
 * « Prendre rendez-vous » (Contact `69:7867`) : motif, format, calendrier des disponibilités
 * (`GET /v1/appointments/availability`), créneaux du jour choisi en heure de Douala, puis — dans le même encart,
 * non maquetté — coordonnées et consentement, envoi `POST /v1/appointments` (statut « À confirmer »).
 */
export function AppointmentForm() {
  const t = useTranslations('forms.appointment');
  const common = useFormCommon();
  const schema = useMemo(() => makeSchema(common.rules, t), [common.rules, t]);
  const locale = useLocale() === 'en' ? 'en' : 'fr';
  const a11y = useTranslations('site.a11y');
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
  // Relance du chargement des disponibilités (créneau pris entre-temps par un autre visiteur).
  const [reloads, setReloads] = useState(0);

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
      .then(({ data, error, response }) => {
        if (cancelled) return;
        if (!response.ok || !data) throw toApiError(error, response);
        setAvailability({ key: queryKey, data });
      })
      .catch(() => {
        if (!cancelled) toast.error(t('availabilityError'));
      });
    return () => {
      cancelled = true;
    };
  }, [queryKey, reloads, t]);

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
      !reason && t('missing.reason'),
      !formatChoice && t('missing.format'),
      !slot && t('missing.slot'),
    ].filter((item): item is string => Boolean(item));
    if (missing.length > 0) {
      // « le motif, le format et un jour… » / « the reason, the format and a day… »
      const list = new Intl.ListFormat(locale === 'en' ? 'en-GB' : 'fr', { type: 'conjunction' });
      setProblem(t('missingChoice', { items: list.format(missing) }));
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
          antiSpam: await antiSpam.build(),
        },
      });
      if (!response.ok || !data) throw toApiError(error, response);
      setReference(data.reference);
      setStep('sent');
    } catch (caught) {
      const shown = (path: string) => path.replace(/^contact\./, '') in schema.shape;
      if (caught instanceof ApiError) {
        for (const [path, message] of Object.entries(caught.fieldErrors)) {
          const name = path.replace(/^contact\./, '') as keyof FormInput;
          if (shown(path)) form.setError(name, { message });
        }
        // Créneau pris entre-temps (409 `slot-taken`) ou plus proposé (422 `startsAt`) : retour au choix du créneau,
        // disponibilités rechargées.
        if (caught.status === 409 || 'startsAt' in caught.fieldErrors) {
          setSlot(null);
          setStep('choose');
          setAvailability(null);
          setReloads((count) => count + 1);
        }
      }
      toast.error(formErrorMessage(caught, shown, common.t('unexpectedError')));
    }
  }

  function restart() {
    form.reset();
    setSlot(null);
    setDay(null);
    setReference(null);
    setStep('choose');
  }

  const reasonLabel = reason ? t(`reasons.${reason}`) : undefined;
  const formatLabel = formatChoice ? t(`formats.${formatChoice}`) : undefined;
  const timezoneLabel = loaded?.timezoneLabel ?? t('defaultTimezone');
  const reasonOptions = REASONS.map((value) => ({ value, label: t(`reasons.${value}`) }));
  const formatOptions = FORMATS.map((value) => ({ value, label: t(`formats.${value}`) }));
  /** « 6 octobre 2026 à 14 h 30 » / « 6 October 2026 at 14:30 ». */
  const slotDateTime = (date: string) =>
    t('slotAt', {
      date: formatDate(date, DEFAULT_TIME_ZONE, locale),
      time: locale === 'en' ? formatClock(date) : formatTime(date),
    });

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
            {t('title')}
          </h2>
          <p className="font-ui text-[14px] leading-5 text-text-muted">{t('subtitle')}</p>
        </div>
      </div>

      {step === 'choose' && (
        <>
          <ChoiceChips
            legend={t('reasonLegend')}
            name="motif"
            options={reasonOptions}
            value={reason}
            onChange={setReason}
          />
          <ChoiceChips
            legend={t('formatLegend')}
            name="format"
            options={formatOptions}
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
            locale={locale}
            labels={{ previousMonth: a11y('previousMonth'), nextMonth: a11y('nextMonth') }}
          />
          {day ? (
            <ChoiceChips
              legend={
                <span className="inline-block first-letter:uppercase">
                  {t('daySlots', { day: weekdayDate(`${day}T12:00:00Z`, locale) })}
                </span>
              }
              name="creneau"
              options={daySlots.map((item) => ({ value: item.startsAt, label: formatClock(item.startsAt) }))}
              value={slot?.startsAt ?? null}
              onChange={(value) => setSlot(daySlots.find((item) => item.startsAt === value) ?? null)}
            />
          ) : (
            <p className="font-ui text-[14px] leading-5 text-text-muted">{t('chooseDay')}</p>
          )}
          <p className="flex items-center gap-1.5 text-caption text-text-muted">
            <Globe aria-hidden size={14} />
            {timezoneLabel}
          </p>
          {problem && (
            <p role="alert" className="text-[13px] leading-4 text-feedback-error">
              {problem}
            </p>
          )}
          <Button type="button" fullWidth onClick={requestAppointment}>
            {t('request')}
          </Button>
          <p className="text-caption text-text-muted">{t('confirmationNote')}</p>
        </>
      )}

      {step !== 'choose' && slot && (
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-neutral-0 p-4">
          <p className="flex flex-col font-ui text-[14px] leading-5">
            <span className="font-semibold text-text-main first-letter:uppercase">
              {t('slotAt', { date: weekdayDate(slot.startsAt, locale), time: formatClock(slot.startsAt) })}
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
              {t('edit')}
            </button>
          )}
        </div>
      )}

      {step === 'details' && (
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          aria-label={t('detailsTitle')}
          className="flex flex-col gap-5"
        >
          <input {...antiSpam.honeypotProps} />
          <div {...antiSpam.widgetProps} />
          <p className="font-ui text-[14px] leading-5 font-semibold text-text-main">{t('detailsTitle')}</p>
          <Field label={t('fullName')} required error={errors.fullName?.message}>
            {(control) => (
              <Input
                icon={User}
                autoComplete="name"
                placeholder={t('fullNamePlaceholder')}
                {...control}
                {...form.register('fullName')}
              />
            )}
          </Field>
          <Field label={t('email')} required error={errors.email?.message}>
            {(control) => (
              <Input
                icon={Mail}
                type="email"
                autoComplete="email"
                placeholder={t('emailPlaceholder')}
                {...control}
                {...form.register('email')}
              />
            )}
          </Field>
          <Field label={t('phone')} required error={errors.phone?.message}>
            {(control) => <PhoneInput icon={Smartphone} {...control} {...form.register('phone')} />}
          </Field>
          <Field label={t('message')} help={t('messageHelp')} error={errors.message?.message}>
            {(control) => (
              <Textarea
                rows={3}
                placeholder={t('messagePlaceholder')}
                {...control}
                {...form.register('message')}
              />
            )}
          </Field>
          <div className="flex flex-col gap-1.5">
            <Checkbox
              id="rdv-consent"
              label={common.t('consentText')}
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
            {t('submit')}
          </Button>
        </form>
      )}

      {step === 'sent' && slot && (
        <div role="status" className="flex flex-col items-start gap-4">
          <p className="flex items-start gap-3 font-ui text-[16px] leading-6 text-text-main">
            <CircleCheck aria-hidden size={22} className="mt-px shrink-0 text-vert-600" />
            {t('sent', { dateTime: slotDateTime(slot.startsAt) })}
          </p>
          {reference && (
            <p className="font-ui text-[14px] leading-5 text-text-muted">
              {common.t('reference')} <span className="font-semibold text-text-main">{reference}</span>
            </p>
          )}
          <Button variant="outline" onClick={restart}>
            {t('another')}
          </Button>
        </div>
      )}
    </section>
  );
}
