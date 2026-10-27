/**
 * Assainissement du texte riche des articles (`richText`), aux mêmes règles que l'API (`src/common/html/rich-text.ts`,
 * `sanitize-html`) mais sans dépendance : liste blanche du schéma `Html` (`p`, `h2`, `h3`, `h4`, `strong`, `em`, `a`,
 * `ul`, `ol`, `li`, `br`, `blockquote`), `b` → `strong` et `i` → `em`, seul `href` gardé (en `http(s)`, `mailto`,
 * `tel` ou relatif au site : `/…`, `#…`). Lien refusé : balise retirée, texte gardé. Autres balises retirées en
 * gardant leur texte, sauf `script`, `style`, `iframe`… supprimées avec leur contenu. Balises ouvertes refermées,
 * texte échappé, résultat sans espaces de début et de fin (idempotent).
 */

const ALLOWED = new Set(['p', 'h2', 'h3', 'h4', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'br', 'blockquote']);
const RENAMED: Record<string, string> = { b: 'strong', i: 'em' };
const SCHEMES = ['http', 'https', 'mailto', 'tel'];
const RELATIVE_HREF = /^(\/(?!\/)|#)/;
const NON_TEXT = new Set([
  'script',
  'style',
  'textarea',
  'option',
  'noscript',
  'iframe',
  'object',
  'embed',
  'template',
]);
const VOID = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]);
const P_CLOSERS = [
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'address',
  'article',
  'aside',
  'blockquote',
  'details',
  'div',
  'dl',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'header',
  'hr',
  'main',
  'nav',
  'ol',
  'pre',
  'section',
  'table',
  'ul',
];
/** Balises refermées implicitement à l'ouverture d'une autre (comme `htmlparser2`). */
const IMPLIED_CLOSE: Record<string, Set<string>> = {
  li: new Set(['li']),
  ...Object.fromEntries(P_CLOSERS.map((tag) => [tag, new Set(['p'])])),
};

/** Entités nommées courantes (les autres sont laissées telles quelles). */
const ENTITIES: Record<string, number> = {
  amp: 0x26,
  lt: 0x3c,
  gt: 0x3e,
  quot: 0x22,
  apos: 0x27,
  nbsp: 0xa0,
  laquo: 0xab,
  raquo: 0xbb,
  lsquo: 0x2018,
  rsquo: 0x2019,
  ldquo: 0x201c,
  rdquo: 0x201d,
  hellip: 0x2026,
  ndash: 0x2013,
  mdash: 0x2014,
  euro: 0x20ac,
  copy: 0xa9,
  agrave: 0xe0,
  acirc: 0xe2,
  ccedil: 0xe7,
  eacute: 0xe9,
  egrave: 0xe8,
  ecirc: 0xea,
  euml: 0xeb,
  icirc: 0xee,
  iuml: 0xef,
  ocirc: 0xf4,
  ugrave: 0xf9,
  ucirc: 0xfb,
  oelig: 0x153,
  Eacute: 0xc9,
  Agrave: 0xc0,
};

const ENTITY = /&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi;

/** Caractère d'une entité (`&eacute;`, `&#233;`, `&#xE9;`), ou `null` si elle est inconnue. */
function entityChar(name: string): string | null {
  if (name[0] === '#') {
    const code =
      name[1] === 'x' || name[1] === 'X' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
    return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : null;
  }
  const code = ENTITIES[name];
  return code === undefined ? null : String.fromCodePoint(code);
}

const decodeEntities = (text: string) =>
  text.replace(ENTITY, (match, name: string) => entityChar(name) ?? match);

const escapeChar = (char: string) => (char === '&' ? '&amp;' : char === '<' ? '&lt;' : '&gt;');

/** Texte décodé puis échappé (`&`, `<`, `>`) ; une entité inconnue (`&foo;`) reste telle quelle. */
function escapeText(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);|[&<>]/gi, (match, name: string | undefined) => {
    if (name === undefined) return escapeChar(match);
    const char = entityChar(name);
    return char === null ? match : char.replace(/[&<>]/g, escapeChar);
  });
}

const escapeAttribute = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function attributes(source: string): Record<string, string> {
  const result: Record<string, string> = {};
  const pattern = /([^\s=/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of source.matchAll(pattern)) {
    const name = match[1]!.toLowerCase();
    if (!(name in result)) result[name] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return result;
}

/** Destination d'un lien autorisée (même contrôle que la transformation `a` de l'API). */
function allowedHref(raw: string | undefined): string | null {
  const href = (raw ?? '').trim();
  if (href === '') return null;
  const absolute = /^[a-z][a-z0-9+.-]*:/i.test(href);
  const allowed = absolute
    ? SCHEMES.includes(href.split(':')[0]?.toLowerCase() ?? '')
    : RELATIVE_HREF.test(href);
  return allowed ? href : null;
}

type Open = { name: string; output: string | null };

const TOKEN =
  /<!--[\s\S]*?(?:-->|$)|<![^>]*>?|<\?[^>]*>?|<\/([a-zA-Z][\w:-]*)[^>]*>|<([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;

export function sanitizeRichText(html: string): string {
  let out = '';
  const stack: Open[] = [];
  const close = (entry: Open) => {
    if (entry.output) out += `</${entry.output}>`;
  };
  let position = 0;
  let skipUntil: string | null = null;

  for (const match of html.matchAll(TOKEN)) {
    const index = match.index;
    if (skipUntil) {
      if (match[1]?.toLowerCase() !== skipUntil) continue;
      skipUntil = null;
      position = index + match[0].length;
      continue;
    }
    out += escapeText(html.slice(position, index));
    position = index + match[0].length;
    const [, closing, opening, rawAttributes = ''] = match;

    if (closing) {
      const name = closing.toLowerCase();
      const at = stack.map((entry) => entry.name).lastIndexOf(name);
      if (at < 0) continue;
      while (stack.length > at) close(stack.pop()!);
      continue;
    }
    if (!opening) continue; // Commentaire, doctype, instruction.

    const name = opening.toLowerCase();
    if (NON_TEXT.has(name)) {
      if (!VOID.has(name) && !/\/\s*$/.test(rawAttributes)) skipUntil = name;
      continue;
    }
    const implied = IMPLIED_CLOSE[name];
    while (implied && stack.length > 0 && implied.has(stack.at(-1)!.name)) close(stack.pop()!);

    const tag = RENAMED[name] ?? name;
    let output: string | null = ALLOWED.has(tag) ? tag : null;
    let opened = output ? `<${tag}>` : '';
    if (tag === 'a') {
      const href = allowedHref(attributes(rawAttributes).href);
      output = href ? 'a' : null;
      opened = href ? `<a href="${escapeAttribute(href)}">` : '';
    }
    if (VOID.has(name)) {
      if (tag === 'br') out += '<br />';
      continue;
    }
    out += opened;
    stack.push({ name, output });
  }
  if (!skipUntil) out += escapeText(html.slice(position));
  while (stack.length > 0) close(stack.pop()!);
  return out.trim();
}
