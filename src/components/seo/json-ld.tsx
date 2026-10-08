import type { JsonLdThing } from '@/lib/seo/json-ld';

/** Échappe `<` pour qu'un texte saisi dans le back-office ne puisse pas fermer la balise `<script>`. */
function serialize(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/**
 * Données structurées JSON-LD. Un bloc de données (`application/ld+json`) n'est pas exécuté par le navigateur : la
 * politique de sécurité du contenu ne le bloque pas. Les entrées nulles sont ignorées.
 */
export function JsonLd({ data }: { data: JsonLdThing | (JsonLdThing | null)[] | null }) {
  const things = (Array.isArray(data) ? data : [data]).filter(
    (thing): thing is JsonLdThing => thing !== null,
  );
  if (!things.length) return null;
  const graph =
    things.length === 1
      ? { '@context': 'https://schema.org', ...things[0] }
      : { '@context': 'https://schema.org', '@graph': things };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialize(graph) }} />;
}
