import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChipSelect } from './chip-select';
import { charCountHelp, CompletenessCard } from './editor-ui';
import { RepeatableList, SubInput } from './repeatable-list';
import { moveItem } from './sortable';
import { useAutosave } from './use-autosave';

function Steps({ initial }: { initial: string[] }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <RepeatableList
        value={value}
        onChange={setValue}
        createItem={() => ''}
        addLabel="Ajouter un public"
        itemName="public"
        getLabel={(item) => item}
        renderFields={(item, update, index) => (
          <SubInput
            aria-label={`Public ${index + 1}`}
            value={item}
            onChange={(event) => update(event.target.value)}
          />
        )}
      />
      <output data-testid="value">{JSON.stringify(value)}</output>
    </>
  );
}

describe('RepeatableList', () => {
  it('ajoute, modifie et supprime des éléments', async () => {
    const user = userEvent.setup();
    render(<Steps initial={['Aux groupes']} />);
    await user.click(screen.getByRole('button', { name: 'Ajouter un public' }));
    await user.type(screen.getByRole('textbox', { name: 'Public 2' }), 'À la diaspora');
    expect(screen.getByTestId('value')).toHaveTextContent('["Aux groupes","À la diaspora"]');
    await user.click(screen.getByRole('button', { name: 'Supprimer Aux groupes' }));
    expect(screen.getByTestId('value')).toHaveTextContent('["À la diaspora"]');
  });

  it('propose une poignée de déplacement nommée pour chaque élément', () => {
    render(<Steps initial={['Aux groupes', 'Aux entreprises']} />);
    expect(screen.getByRole('button', { name: 'Déplacer Aux entreprises' })).toBeInTheDocument();
  });
});

describe('outils des éditeurs', () => {
  it('compteur de caractères', () => {
    expect(charCountHelp('Bonjour', 120, 'Une phrase courte.')).toBe(
      'Une phrase courte. 7 / 120 caractères.',
    );
    expect(charCountHelp(null, 60)).toBe('0 / 60 caractères');
  });

  it('déplacement sans glisser-déposer', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
    expect(moveItem(['a', 'b'], 0, -1)).toEqual(['a', 'b']);
  });

  it('complétude : pourcentage et critères', () => {
    render(
      <CompletenessCard
        criteria={[
          { label: 'Informations générales', done: true },
          { label: 'Public', done: true },
          { label: 'Photo principale en haute définition', done: false },
        ]}
      />,
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '67');
    expect(screen.getByText('2 sections sur 3')).toBeInTheDocument();
  });

  it('puces : sélection multiple', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ChipSelect
        label="Services liés"
        options={[
          { value: 'a', label: 'Chef privé' },
          { value: 'b', label: 'Location de voiture' },
        ]}
        value={['a']}
        onChange={onChange}
      />,
    );
    expect(screen.getByRole('button', { name: 'Chef privé' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Location de voiture' }));
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
  });
});

describe('useAutosave', () => {
  afterEach(() => vi.useRealTimers());

  it('enregistre après une pause de saisie, une seule fois par modification', async () => {
    vi.useFakeTimers();
    const save = vi.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(({ value }) => useAutosave({ value, save, delay: 1000 }), {
      initialProps: { value: { name: 'Chef' } },
    });
    expect(result.current.dirty).toBe(false);
    rerender({ value: { name: 'Chef privé' } });
    expect(result.current.dirty).toBe(true);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith({ name: 'Chef privé' });
    expect(result.current.dirty).toBe(false);
    expect(result.current.savedAt).not.toBeNull();
  });

  it('signale un échec sans perdre la modification', async () => {
    vi.useFakeTimers();
    const save = vi.fn().mockRejectedValue(new Error('réseau'));
    const { result, rerender } = renderHook(({ value }) => useAutosave({ value, save, delay: 500 }), {
      initialProps: { value: 'a' },
    });
    rerender({ value: 'b' });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(result.current.error).toBe(true);
    expect(result.current.dirty).toBe(true);
  });
});
