'use client';

import { addMonths, startOfMonth } from 'date-fns';
import { Mail, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, type DateKey } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Chip } from '@/components/ui/chip';
import { Dropzone } from '@/components/ui/dropzone';
import { Field, Input, PhoneInput, Select, Textarea } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toaster';

const FILTERS = ['Tous', 'Expérience', 'Immobilier', 'Proximité', 'Culture & événementiel'];

export function InteractiveDemos() {
  const [filter, setFilter] = useState('Tous');
  const [profile, setProfile] = useState<'particulier' | 'professionnel'>('particulier');
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [day, setDay] = useState<DateKey | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-4">
        <h2 className="mp-text-h3">Puces et onglets</h2>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((label) => (
            <Chip key={label} selected={filter === label} onClick={() => setFilter(label)}>
              {label}
            </Chip>
          ))}
        </div>
        <SegmentedTabs
          label="Profil"
          value={profile}
          onChange={setProfile}
          fullWidth
          className="md:max-w-[664px]"
          options={[
            { value: 'particulier', label: 'Je suis un particulier', shortLabel: 'Particulier' },
            {
              value: 'professionnel',
              label: 'Je suis un professionnel / partenaire',
              shortLabel: 'Professionnel',
            },
          ]}
        />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <h2 className="mp-text-h3 md:col-span-2">Champs</h2>
        <Field label="Nom complet" required>
          {(control) => <Input icon={User} placeholder="Awa Mbarga" autoComplete="name" {...control} />}
        </Field>
        <Field label="E-mail" required error="Merci d'indiquer une adresse e-mail valide.">
          {(control) => <Input icon={Mail} type="email" defaultValue="awa@" {...control} />}
        </Field>
        <Field label="Téléphone / WhatsApp" help="Avec l'indicatif du pays.">
          {(control) => <PhoneInput {...control} />}
        </Field>
        <Field label="Rubrique" required>
          {(control) => (
            <Select defaultValue="" {...control}>
              <option value="" disabled>
                Choisir une rubrique
              </option>
              <option>Expérience</option>
              <option>Immobilier</option>
            </Select>
          )}
        </Field>
        <Field label="Votre message" className="md:col-span-2">
          {(control) => <Textarea placeholder="Décrivez votre besoin…" {...control} />}
        </Field>
        <Checkbox
          className="md:col-span-2"
          label="J'accepte que mes données soient utilisées pour être recontacté(e)."
        />
        <Switch label="Afficher dans le menu" defaultChecked />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <h2 className="mp-text-h3 md:col-span-2">Calendrier et dépôt de fichier</h2>
        <Calendar
          month={month}
          onMonthChange={setMonth}
          selected={day}
          onSelect={setDay}
          minMonth={startOfMonth(new Date())}
          maxMonth={addMonths(new Date(), 3)}
          isAvailable={(key) => new Date(key).getDay() !== 0 && new Date(key) > new Date()}
        />
        <Dropzone
          accept=".pdf,.doc,.docx"
          maxSize={5 * 1024 * 1024}
          file={file}
          onFileChange={setFile}
          label="Déposez votre CV ou cliquez pour parcourir"
          help="PDF, DOC ou DOCX — 5 Mo maximum"
        />
      </section>

      <section className="flex flex-wrap gap-4">
        <h2 className="mp-text-h3 w-full">Modale et notifications</h2>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Ouvrir la modale
        </Button>
        <Button variant="outline" onClick={() => toast.success('Votre message est bien envoyé.')}>
          Notification de succès
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.error('Une erreur est survenue. Merci de réessayer dans quelques instants.')}
        >
          Notification d’erreur
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Personnaliser les cookies"
          description="Choisissez les cookies que vous acceptez."
          footer={
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Tout refuser
              </Button>
              <Button onClick={() => setOpen(false)}>Enregistrer mes choix</Button>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <Switch label="Mesure d'audience (Google Analytics)" />
            <Switch label="Cookies nécessaires" defaultChecked disabled />
          </div>
        </Modal>
      </section>
    </div>
  );
}
