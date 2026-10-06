import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mail } from 'lucide-react';
import type { Route } from 'next';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AccentText } from './accent-text';
import { Badge } from './badge';
import { Breadcrumb } from './breadcrumb';
import { Button, ButtonLink } from './button';
import { Checkbox } from './checkbox';
import { Chip } from './chip';
import { Field, Input } from './field';
import { Pagination, paginationRange } from './pagination';
import { SegmentedTabs } from './segmented-tabs';
import { Stars } from './stars';
import { Switch } from './switch';

describe('Button', () => {
  it('conserve le libellé et se désactive pendant le chargement', () => {
    render(<Button loading>Envoyer le message</Button>);
    const button = screen.getByRole('button', { name: 'Envoyer le message' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('ouvre les liens externes dans un nouvel onglet, les pages internes avec next/link', () => {
    render(
      <>
        <ButtonLink href="https://wa.me/237699000000" variant="whatsapp">
          Écrire sur WhatsApp
        </ButtonLink>
        <ButtonLink href={'/devis' as Route}>Devis gratuit</ButtonLink>
      </>,
    );
    expect(screen.getByRole('link', { name: 'Écrire sur WhatsApp' })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: 'Devis gratuit' })).toHaveAttribute('href', '/devis');
  });
});

describe('Chip', () => {
  it('expose son état avec aria-pressed', () => {
    render(<Chip selected>Tous</Chip>);
    expect(screen.getByRole('button', { name: 'Tous' })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('Field', () => {
  it('relie libellé, aide et erreur au contrôle', () => {
    const { rerender } = render(
      <Field label="E-mail" required help="Nous ne partageons jamais votre adresse.">
        {(control) => <Input type="email" icon={Mail} {...control} />}
      </Field>,
    );
    const input = screen.getByLabelText(/E-mail/);
    expect(input).toBeRequired();
    expect(input).toHaveAccessibleDescription('Nous ne partageons jamais votre adresse.');
    expect(input).not.toHaveAttribute('aria-invalid');

    rerender(
      <Field label="E-mail" required error="Merci d'indiquer une adresse e-mail valide.">
        {(control) => <Input type="email" {...control} />}
      </Field>,
    );
    expect(screen.getByLabelText(/E-mail/)).toBeInvalid();
    expect(screen.getByLabelText(/E-mail/)).toHaveAccessibleDescription(
      "Merci d'indiquer une adresse e-mail valide.",
    );
  });
});

describe('Checkbox et Switch', () => {
  it('ne sont jamais cochés par défaut et se cochent au clic sur le libellé', async () => {
    render(
      <>
        <Checkbox label="J'accepte d'être recontacté." />
        <Switch label="Afficher dans le menu" hideLabel />
      </>,
    );
    const checkbox = screen.getByRole('checkbox', { name: "J'accepte d'être recontacté." });
    expect(checkbox).not.toBeChecked();
    await userEvent.click(screen.getByText("J'accepte d'être recontacté."));
    expect(checkbox).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Afficher dans le menu' })).not.toBeChecked();
  });
});

describe('SegmentedTabs', () => {
  function Profile({ onChange }: { onChange: (value: string) => void }) {
    const [value, setValue] = useState<'particulier' | 'professionnel'>('particulier');
    return (
      <SegmentedTabs
        label="Profil"
        value={value}
        onChange={(next) => {
          setValue(next);
          onChange(next);
        }}
        options={[
          { value: 'particulier', label: 'Je suis un particulier' },
          { value: 'professionnel', label: 'Je suis un professionnel' },
        ]}
      />
    );
  }

  it('se pilote au clavier avec les flèches', async () => {
    const onChange = vi.fn();
    render(<Profile onChange={onChange} />);
    const first = screen.getByRole('radio', { name: 'Je suis un particulier' });
    expect(first).toBeChecked();
    first.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith('professionnel');
    expect(screen.getByRole('radio', { name: 'Je suis un professionnel' })).toHaveFocus();
  });
});

describe('Pagination', () => {
  it('calcule les pages affichées', () => {
    expect(paginationRange(1, 12)).toEqual([1, 2, 3, 'ellipsis', 12]);
    expect(paginationRange(6, 12)).toEqual([1, 'ellipsis', 5, 6, 7, 'ellipsis', 12]);
    expect(paginationRange(12, 12)).toEqual([1, 'ellipsis', 10, 11, 12]);
    expect(paginationRange(3, 12)).toEqual([1, 2, 3, 4, 'ellipsis', 12]);
    expect(paginationRange(2, 4)).toEqual([1, 2, 3, 4]);
  });

  it('marque la page courante', () => {
    render(<Pagination page={2} totalPages={12} hrefFor={(page) => `/avis-clients?page=${page}` as never} />);
    expect(document.querySelector('[aria-current="page"]')).toHaveTextContent(/^Page\s2$/);
    expect(screen.getByRole('link', { name: 'Page 3' })).toHaveAttribute('href', '/avis-clients?page=3');
  });
});

describe('affichage', () => {
  it('Stars, Badge, Breadcrumb et AccentText', () => {
    render(
      <>
        <Stars rating={4.8} />
        <Badge tone="green">Publié</Badge>
        <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Devis gratuit' }]} />
        <h1>
          <AccentText text="19 services, ==un seul interlocuteur.==" />
        </h1>
      </>,
    );
    expect(screen.getByRole('img', { name: 'Note : 4,8 sur 5' })).toBeInTheDocument();
    expect(screen.getByText('Publié')).toBeInTheDocument();
    expect(screen.getByText('Devis gratuit')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading')).toHaveTextContent('19 services, un seul interlocuteur.');
    expect(screen.getByText('un seul interlocuteur.')).toHaveClass('text-text-brand');
  });
});
