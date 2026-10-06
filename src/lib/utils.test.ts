import { describe, expect, it } from 'vitest';
import { parseAccentText } from '@/components/ui/accent-text';
import { cn } from './cn';
import { whatsappUrl } from './whatsapp';

describe('cn', () => {
  it('garde une taille et une couleur de texte du thème ensemble', () => {
    expect(cn('text-body-md text-text-main')).toBe('text-body-md text-text-main');
    expect(cn('text-web-section text-text-brand')).toBe('text-web-section text-text-brand');
  });

  it('résout les conflits : la dernière classe l’emporte', () => {
    expect(cn('text-body-md', 'text-body-sm')).toBe('text-body-sm');
    expect(cn('text-web-hero', 'text-web-section')).toBe('text-web-section');
    expect(cn('p-md', 'p-lg')).toBe('p-lg');
    expect(cn('shadow-2', 'shadow-3')).toBe('shadow-3');
    expect(cn('bg-neutral-0', false, 'bg-brand-primary')).toBe('bg-brand-primary');
  });
});

describe('parseAccentText', () => {
  it('isole la partie entre ==…==', () => {
    expect(
      parseAccentText("Mambo, ce n'est pas qu'un service. ==C'est une expérience pensée pour vous.=="),
    ).toEqual([
      { text: "Mambo, ce n'est pas qu'un service. ", accent: false },
      { text: "C'est une expérience pensée pour vous.", accent: true },
    ]);
  });

  it('renvoie le texte tel quel sans balisage', () => {
    expect(parseAccentText('Nos services')).toEqual([{ text: 'Nos services', accent: false }]);
  });
});

describe('whatsappUrl', () => {
  it('construit un lien wa.me avec le message et le contexte', () => {
    expect(whatsappUrl('+237 699 00 00 00', 'Bonjour Mambo Proxi,', 'Service : Chef privé')).toBe(
      'https://wa.me/237699000000?text=Bonjour%20Mambo%20Proxi%2C%20Service%20%3A%20Chef%20priv%C3%A9',
    );
    expect(whatsappUrl('+33612345678')).toBe('https://wa.me/33612345678');
  });
});
