#!/usr/bin/env node
/**
 * sync-ai-excludes — propaga `.aiexclude` a los ignore files de cada herramienta de IA.
 *
 * `.aiexclude` es la ÚNICA fuente canónica. `.claudeignore`, `.cursorignore` y
 * `.geminiignore` son copias porque ningún formato de ignore soporta un
 * mecanismo de `include`: no existe forma de que un archivo referencie a otro.
 * Duplicar es la única opción; generarlas es lo que evita que se desincronicen.
 *
 * Las copias se normalizan a LF. El canónico suele estar en CRLF porque git lo
 * convierte al checkout (`core.autocrlf=true`), así que el SHA crudo difiere aunque
 * el contenido sea idéntico. Por eso la comparación de `--check` normaliza ambos lados:
 * sin eso, el chequeo daría falsos positivos en Windows.
 *
 * Las copias están en `.gitignore` a propósito: son artefactos reconstruibles, no fuentes.
 * Por eso `--check` es una guarda LOCAL del working copy (detecta ediciones a mano),
 * no una verificación de git. En un clone nuevo no existen hasta que se generan.
 *
 * Uso:
 *   node scripts/sync-ai-excludes.mjs           # escribe las copias
 *   node scripts/sync-ai-excludes.mjs --check   # falla si hay drift
 *
 * En CI, encadenar en orden:  ai:excludes  &&  ai:excludes:check
 */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CANONICAL = '.aiexclude';
const TARGETS = ['.claudeignore', '.cursorignore', '.geminiignore'];

/**
 * Normaliza a LF con salto final: CRLF de Windows haría que `diff` y el
 * chequeo de drift dieran falsos positivos en cualquier plataforma.
 * @param {string} raw
 * @returns {string}
 */
const normalize = (raw) => {
  const lf = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return lf.endsWith('\n') ? lf : `${lf}\n`;
};

/**
 * @param {string} rel
 * @returns {Promise<string | null>} contenido normalizado, o null si no existe
 */
const readIfPresent = async (rel) => {
  const abs = path.join(ROOT, rel);
  if (!existsSync(abs)) return null;
  return normalize(await readFile(abs, 'utf8'));
};

const main = async () => {
  const check = process.argv.includes('--check');

  let canonical;
  try {
    canonical = normalize(await readFile(path.join(ROOT, CANONICAL), 'utf8'));
  } catch {
    console.error(`[sync-ai-excludes] ERROR: no se pudo leer ${CANONICAL} en ${ROOT}`);
    process.exitCode = 1;
    return;
  }

  const drifted = [];

  for (const target of TARGETS) {
    const current = await readIfPresent(target);
    const inSync = current === canonical;

    if (check) {
      if (!inSync) {
        drifted.push(target);
        console.error(
          `[sync-ai-excludes] DRIFT  ${target} ${current === null ? '(falta)' : 'difiere de'} ${CANONICAL}`,
        );
      } else {
        console.log(`[sync-ai-excludes] ok     ${target}`);
      }
      continue;
    }

    if (inSync) {
      console.log(`[sync-ai-excludes] ok     ${target} (ya sincronizado)`);
      continue;
    }

    await writeFile(path.join(ROOT, target), canonical, 'utf8');
    const verb = current === null ? 'creado  ' : 'actualiz';
    console.log(`[sync-ai-excludes] ${verb} ${target} desde ${CANONICAL}`);
  }

  if (check) {
    if (drifted.length > 0) {
      console.error(
        `\n[sync-ai-excludes] ${drifted.length} archivo(s) desincronizado(s).\n` +
          `[sync-ai-excludes] Ejecutá \`pnpm ai:excludes\` y commiteá el resultado.`,
      );
      process.exitCode = 1;
    } else {
      console.log('\n[sync-ai-excludes] Sin drift. Las copias están sincronizadas.');
    }
  }
};

await main();
