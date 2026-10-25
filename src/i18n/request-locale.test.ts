import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { describe, expect, it, vi } from 'vitest';
import { withLocale } from './request-locale';

vi.mock('next-intl/server', () => ({ setRequestLocale: vi.fn() }));
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

describe('withLocale', () => {
  it('renvoie et enregistre la langue de l’adresse', async () => {
    await expect(withLocale(Promise.resolve({ locale: 'en' }))).resolves.toBe('en');
    expect(setRequestLocale).toHaveBeenCalledWith('en');
    await expect(withLocale(Promise.resolve({ locale: 'fr' }))).resolves.toBe('fr');
    expect(setRequestLocale).toHaveBeenLastCalledWith('fr');
  });

  it('langue inconnue : page introuvable, rien n’est enregistré', async () => {
    await expect(withLocale(Promise.resolve({ locale: 'de' }))).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
    expect(setRequestLocale).not.toHaveBeenCalled();
  });
});
