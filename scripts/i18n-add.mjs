// Ajoute des textes dans messages/fr.json et messages/en.json sous un espace de noms, sans conflit entre plusieurs
// écritures simultanées (verrou) : node scripts/i18n-add.mjs <espace.de.noms> <fragment-fr.json> <fragment-en.json>
// Les fragments sont fusionnés (clés existantes remplacées), puis les deux fichiers sont reformatés par Prettier.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const [namespace, frFile, enFile] = process.argv.slice(2);
if (!namespace || !frFile || !enFile) {
  console.error('Usage : node scripts/i18n-add.mjs <espace.de.noms> <fragment-fr.json> <fragment-en.json>');
  process.exit(1);
}

const LOCK = '.i18n-lock';
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
for (let attempt = 0; ; attempt += 1) {
  try {
    mkdirSync(LOCK);
    break;
  } catch {
    if (attempt > 600) throw new Error('Verrou .i18n-lock tenu depuis plus de 60 s.');
    sleep(100);
  }
}

function merge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      target[key] = merge(typeof target[key] === 'object' && target[key] ? target[key] : {}, value);
    } else target[key] = value;
  }
  return target;
}

try {
  for (const [file, fragment] of [
    ['messages/fr.json', frFile],
    ['messages/en.json', enFile],
  ]) {
    const messages = JSON.parse(readFileSync(file, 'utf8'));
    let node = messages;
    for (const part of namespace.split('.')) {
      node[part] ??= {};
      node = node[part];
    }
    merge(node, JSON.parse(readFileSync(fragment, 'utf8')));
    writeFileSync(file, `${JSON.stringify(messages, null, 2)}\n`);
  }
  execFileSync(
    process.execPath,
    ['node_modules/prettier/bin/prettier.cjs', '--write', 'messages/fr.json', 'messages/en.json'],
    {
      stdio: 'ignore',
    },
  );
} finally {
  rmSync(LOCK, { recursive: true, force: true });
}
console.log(`Textes ajoutés sous « ${namespace} » (fr, en).`);
