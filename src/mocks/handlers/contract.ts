import { http, HttpResponse, type HttpHandler } from 'msw';
import operations from '../data/contract-examples.json';
import { problem } from '../problem';

type ContractOperation = {
  operationId: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  status: number;
  contentType: string | null;
  examples: Record<string, unknown>;
};

const toCamelCase = (value: string) => value.replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase());

/**
 * Choisit l'exemple à renvoyer : celui dont le nom correspond à un paramètre de chemin
 * (`/v1/categories/experience` → exemple « experience », `chef-prive` → « chefPrive »),
 * sinon l'exemple unique ou « default ».
 */
function pickExample(operation: ContractOperation, params: Record<string, unknown>) {
  const names = Object.keys(operation.examples);
  const values = Object.values(params).filter((value): value is string => typeof value === 'string');
  const match = names.find((name) => values.some((value) => value === name || toCamelCase(value) === name));
  if (match) return { found: true, body: operation.examples[match] } as const;
  if (values.length > 0 && !('default' in operation.examples) && names.length > 0)
    return { found: false } as const;
  const fallback = 'default' in operation.examples ? 'default' : names[0];
  return fallback
    ? ({ found: true, body: operation.examples[fallback] } as const)
    : ({ found: false } as const);
}

/** Gestionnaires génériques : chaque opération du contrat renvoie son exemple. */
export const contractHandlers: HttpHandler[] = (operations as ContractOperation[]).map((operation) =>
  http[operation.method.toLowerCase() as Lowercase<ContractOperation['method']>](
    `*${operation.path}`,
    ({ params }) => {
      if (!operation.contentType) return new HttpResponse(null, { status: operation.status });
      const example = pickExample(operation, params);
      if (!example.found) {
        return Object.keys(operation.examples).length > 0
          ? problem(404, "Cette ressource n'existe pas dans les données simulées.")
          : problem(501, `Aucune donnée simulée pour ${operation.operationId}.`);
      }
      if (operation.contentType === 'application/json') {
        return HttpResponse.json(example.body as never, { status: operation.status });
      }
      return new HttpResponse(String(example.body), {
        status: operation.status,
        headers: { 'Content-Type': operation.contentType },
      });
    },
  ),
);
