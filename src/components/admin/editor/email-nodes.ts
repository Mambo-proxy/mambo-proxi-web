import { mergeAttributes, Node } from '@tiptap/react';

/**
 * Nœuds propres aux e-mails (`EmailHtml` du contrat) : image de la médiathèque et bouton d'appel à l'action
 * (`<a data-button href="…">Libellé</a>`). Blocs atomiques : ils se sélectionnent, se déplacent et se suppriment
 * d'un seul tenant.
 */
export const EmailImage = Node.create({
  name: 'emailImage',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return { src: { default: null }, alt: { default: '' } };
  },
  parseHTML() {
    return [{ tag: 'img[src]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)];
  },
});

export const EmailButton = Node.create({
  name: 'emailButton',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return { href: { default: '' }, label: { default: '' } };
  },
  parseHTML() {
    return [
      {
        tag: 'a[data-button]',
        priority: 60,
        getAttrs: (element) => ({
          href: element.getAttribute('href') ?? '',
          label: element.textContent ?? '',
        }),
      },
    ];
  },
  renderHTML({ node }) {
    return ['a', { 'data-button': '', href: node.attrs.href as string }, node.attrs.label as string];
  },
});
