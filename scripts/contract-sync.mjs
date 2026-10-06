// Copie le contrat OpenAPI depuis le dépôt de l'API (ou une URL) puis régénère les types.
// Usage : pnpm contract:sync            → ../mambo-proxi-api/contracts/openapi.yaml
//         CONTRACT_SOURCE=<chemin|url> pnpm contract:sync
import { execSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const source = process.env.CONTRACT_SOURCE ?? '../mambo-proxi-api/contracts/openapi.yaml';
const target = path.resolve('contracts/openapi.yaml');

const content = /^https?:\/\//.test(source)
  ? await fetch(source).then((res) => {
      if (!res.ok) throw new Error(`Téléchargement impossible (${res.status}) : ${source}`);
      return res.text();
    })
  : await readFile(path.resolve(source), 'utf8');

await mkdir(path.dirname(target), { recursive: true });
await writeFile(target, content);
console.log(`Contrat synchronisé depuis ${source}`);

execSync('pnpm contract:types', { stdio: 'inherit' });
