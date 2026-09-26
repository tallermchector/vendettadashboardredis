// Verificacion de purga de Tailwind.
//
// Por que existe: Tailwind v3 PURGA en silencio todo className que no
// encuentra en los globs de `content` ni en el `@apply` de globals.css. Un
// typo en un className no da error de build — da un elemento sin estilo, que
// es peor. Este script cierra ese agujero.
//
// Uso:
//   pnpm purgecheck                 # archivos modificados contra HEAD
//   pnpm purgecheck <archivo>...    # rutas explicitas
//
// Por defecto revisa SOLO lo que cambio contra HEAD. Es a proposito: correrlo
// sobre todo `src` reporta como faltantes las clases que el codigo construye
// con template literals (`cn(activo ? 'a' : 'b')`), que no aparecen escritas en
// ningun lado. Ese ruido haria que se deje de confiar en la herramienta.
//
// Como funciona: Tailwind escapa en el CSS todo caracter fuera de
// [a-zA-Z0-9_-] anteponiendo una barra invertida (`.h-3\.5`, `.md\:grid-cols-2`,
// `.text-\[10px\]`). Se aplica esa misma regla a cada token escrito en el JSX
// y se busca la cadena resultante en el CSS compilado.
const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync } = require('child_process')

const root = path.resolve(__dirname, '..')
const CLI = path.join(root, 'node_modules', 'tailwindcss', 'lib', 'cli.js')
const CONFIG = path.join(root, 'tailwind.config.ts')
const ENTRY = path.join(root, 'src', 'app', 'globals.css')

/** Globs de `content` de tailwind.config.ts. */
const CONTENT_DIRS = ['src/app', 'src/components', 'src/contexts', 'src/hooks', 'src/lib', 'src/pages']
const SOURCE_RE = /\.(?:js|ts|jsx|tsx|mdx)$/

// --- 1. Que archivos reviso -----------------------------------------------

const git = (...args) =>
    execFileSync('git', args, { cwd: root, encoding: 'utf8' })

/** Archivos de codigo que difieren de HEAD, incluidos los untracked. */
function changedFiles() {
    const tracked = git('diff', '--name-only', 'HEAD').split('\n')
    const untracked = git('ls-files', '--others', '--exclude-standard').split('\n')
    return [...tracked, ...untracked]
        .map((f) => f.trim())
        .filter((f) => f && SOURCE_RE.test(f) && CONTENT_DIRS.some((d) => f.startsWith(d + path.sep) || f.startsWith(d + '/')))
}

const args = process.argv.slice(2)
const files = args.length > 0 ? args.map((f) => path.resolve(f)) : changedFiles()

if (files.length === 0) {
    console.log('Sin archivos de codigo modificados contra HEAD. Nada que verificar.')
    console.log('Para revisar rutas concretas: pnpm purgecheck <archivo>...')
    process.exit(0)
}

const missingFiles = files.filter((f) => !fs.existsSync(f))
if (missingFiles.length > 0) {
    console.error('No existe(n): ' + missingFiles.join(', '))
    process.exit(1)
}

// --- 2. Compilo el CSS ------------------------------------------------------

const out = path.join(os.tmpdir(), `purgecheck-${process.pid}.css`)

let css
try {
    execFileSync(process.execPath, [CLI, '-c', CONFIG, '-i', ENTRY, '-o', out], {
        cwd: root,
        stdio: ['ignore', 'ignore', 'ignore'], // silencia el aviso de caniuse-lite
    })
    // La lectura va DENTRO del try: el `finally` borra el temporal, asi que
    // leer despues lo encontraria ya borrado.
    css = fs.readFileSync(out, 'utf8')
} catch (err) {
    console.error('Fallo la compilacion de Tailwind: ' + err.message)
    process.exit(1)
} finally {
    fs.rmSync(out, { force: true })
}

/** Regla de escape de Tailwind (CSS.escape). */
const cssEscape = (cls) =>
    cls
        .replace(/[^a-zA-Z0-9_-]/g, (c) => '\\' + c)
        .replace(/^(\d)/, '\\3$1 ')

/**
 * Extrae las cadenas que pueden contener clases: `className="..."`,
 * `className={cn('a', cond && 'b')}`, `className={`...`}` y los mapas de tonos
 * (`tone: 'border-l-...'`) que nunca pasan por className.
 */
function classLiterals(src) {
    const out = []
    const patterns = [
        /className\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})/g,
        /\b(?:tone|bar|ink|chip|colorClass|badgeClass|classNames|cls)\s*:\s*(?:'([^']*)'|"([^"]*)")/g,
    ]
    for (const re of patterns) {
        let m
        // `slice(1)`: sin esto se cuela el match completo (`tone: '...'`) y se
        // reporta como si fuera una clase.
        while ((m = re.exec(src)) !== null) out.push(m.slice(1).filter(Boolean).join(' '))
    }
    return out
}

let checked = 0
const missing = new Set()

for (const file of files) {
    const src = fs.readFileSync(file, 'utf8')
    const tokens = new Set()

    for (const lit of classLiterals(src)) {
        lit
            .replace(/\$\{[^}]*\}/g, ' ') // interpolaciones de template
            .replace(/['"`]/g, ' ')        // comillas internas de cn('a', 'b')
            .split(/\s+/)
            .forEach((t) => { if (t) tokens.add(t) })
    }

    for (const t of tokens) {
        // Descarta identificadores de JS, restos de expresiones y prefijos
        // huerfanos de un template interpolado (`ribbon-${x}` -> `ribbon-`).
        if (!/^[a-z0-9][a-z0-9[\]/.:%()#!_-]*$/i.test(t)) continue
        if (/[A-Z$_]/.test(t) || t.length < 2 || t.endsWith('-')) continue

        checked++
        if (!css.includes('.' + cssEscape(t))) {
            missing.add(`${path.relative(root, file)}  ->  ${t}`)
        }
    }
}

// --- 3. Resultado -----------------------------------------------------------

console.log(`archivos: ${files.length}   tokens revisados: ${checked}`)

if (missing.size === 0) {
    console.log('OK — ningun className esta purgado.')
} else {
    console.log(`\nPURGADOS / INEXISTENTES (${missing.size}):\n` + [...missing].join('\n'))
    process.exitCode = 1
}
