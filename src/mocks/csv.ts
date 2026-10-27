import { HttpResponse } from 'msw';

/**
 * Exports CSV simulés des demandes et des contacts, au format exact de l'API (`src/common/csv/csv.ts`) : UTF-8 avec
 * BOM, séparateur `;`, lignes CRLF, chaque cellule entre guillemets (`"` doublé). Une cellule qui commence par `=`,
 * `+`, `-`, `@`, une tabulation ou un retour chariot est préfixée d'une apostrophe (injection de formules), sauf un
 * nombre ou un numéro de téléphone (`+237…`).
 */
const CSV_BOM = String.fromCharCode(0xfeff);
const FORMULA_START = /^[=+\-@\t\r]/;
const PLAIN_NUMBER = /^[+-]?\d[\d\s.,]*$/;

export type CsvValue = string | number | null | undefined;

/** Valeur d'une cellule, neutralisée puis échappée. */
export function csvCell(value: CsvValue): string {
  const text = value === null || value === undefined ? '' : String(value);
  const safe = FORMULA_START.test(text) && !PLAIN_NUMBER.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** Document complet : BOM, en-tête puis lignes. */
export function toCsv(header: readonly string[], rows: readonly (readonly CsvValue[])[]): string {
  return `${CSV_BOM}${[header, ...rows].map((row) => row.map(csvCell).join(';')).join('\r\n')}`;
}

/** En-tête `Content-Disposition` d'un fichier à télécharger (nom ASCII, comme l'API). */
export function attachmentDisposition(fileName: string): string {
  return `attachment; filename="${fileName.replace(/[^\w.-]/g, '_')}"`;
}

/** Réponse CSV non mise en cache (`no-store`), en-têtes de l'API. */
export function csvExport(
  fileName: string,
  header: readonly string[],
  rows: readonly (readonly CsvValue[])[],
) {
  return new HttpResponse(toCsv(header, rows), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': attachmentDisposition(fileName),
      'Cache-Control': 'no-store',
    },
  });
}
