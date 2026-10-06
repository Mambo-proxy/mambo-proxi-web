// Extrait les exemples de réponses du contrat OpenAPI vers src/mocks/data/contract-examples.json.
// Ils alimentent les gestionnaires MSW génériques (src/mocks/handlers/contract.ts).
// Usage : pnpm contract:examples (appelé aussi par pnpm contract:types)
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';

const METHODS = ['get', 'post', 'put', 'patch', 'delete'];
const contract = parse(await readFile(path.resolve('contracts/openapi.yaml'), 'utf8'));
const target = path.resolve('src/mocks/data/contract-examples.json');

function resolve(node) {
  let current = node;
  while (current && typeof current === 'object' && typeof current.$ref === 'string') {
    const segments = current.$ref.replace(/^#\//, '').split('/');
    current = segments.reduce((acc, key) => acc?.[key.replaceAll('~1', '/').replaceAll('~0', '~')], contract);
  }
  return current;
}

// Exemples d'un contenu de réponse : `examples` nommés, puis `example`, puis l'exemple porté par le schéma.
function examplesOf(media) {
  if (media.examples) {
    return Object.fromEntries(
      Object.entries(media.examples).map(([key, value]) => [key, resolve(value).value]),
    );
  }
  if ('example' in media) return { default: media.example };
  const schema = resolve(media.schema);
  if (schema && 'example' in schema) return { default: schema.example };
  if (Array.isArray(schema?.examples) && schema.examples.length > 0) return { default: schema.examples[0] };
  return {};
}

const operations = [];
for (const [route, item] of Object.entries(contract.paths)) {
  for (const method of METHODS) {
    const operation = item[method];
    if (!operation) continue;
    const [status, rawResponse] =
      Object.entries(operation.responses).find(([code]) => /^2\d\d$/.test(code)) ?? [];
    if (!status) continue;
    const response = resolve(rawResponse);
    const [contentType, media] = Object.entries(response.content ?? {})[0] ?? [null, null];
    operations.push({
      operationId: operation.operationId,
      method: method.toUpperCase(),
      path: route.replace(/\{(\w+)\}/g, ':$1'),
      status: Number(status),
      contentType,
      examples: media ? examplesOf(media) : {},
    });
  }
}

await writeFile(target, `${JSON.stringify(operations, null, 2)}\n`);
const withExamples = operations.filter((op) => !op.contentType || Object.keys(op.examples).length > 0).length;
console.log(
  `${operations.length} opérations, ${withExamples} simulables depuis le contrat → ${path.relative('.', target)}`,
);
