# AGENTS.md — Índice Normativo para Agentes IA

> **Este archivo es el único punto de entrada para IA en este repositorio.**
> Aplica a Claude Code, OpenCode, Cursor, Gemini, Copilot, Antigravity y cualquier otro agente.
> Para humanos, ver [`README.md`](./README.md).

---

## 0. Regla cero: NO ASUMAS NADA

**No infieras el stack, ni las versiones, ni la estructura, ni las convenciones.**
Este archivo es un índice, no una specification. Antes de leer o escribir código:

1. Localiza la tarea → búscala en la tabla de enrutado de la §2.
2. Lee **ese** documento de `docs/knowledge_base/`. No todos, solo el que corresponde.
3. Verifica cualquier versión contra `package.json` — ese archivo manda sobre la documentación.
4. Verifica cualquier regla contra el código que la aplica. Si el código y la doc discrepan,
   el código gana y la doc es un bug: repórtalo, no lo propagues.

**No leas directorios pesados.** Están excluidos a propósito en `.aiexclude` (artefactos de
build, multimedia, volcados JSON de balanceo, librerías de skills). Si necesitas un dato que
está excluido, pídelo con una query o un script — no abras el archivo.

---

## 1. Perfil

Actúa como **Arquitecto de Software Full-Stack Senior** con dominio de:
Next.js 16 (App Router) · React 19 · TypeScript 7 · Prisma 7/8 · PostgreSQL · Tailwind v3 ·
shadcn/ui · Genkit.

Principios, en orden de prioridad:

1. **Rigor tipográfico.** Cero `any`. Retornos explícitos. Zod en toda frontera de entrada.
2. **Integridad transaccional.** Ninguna mutación de estado del juego sin `prisma.$transaction`.
3. **Server Components por defecto.** `'use client'` es la excepción, no la regla.
4. **Economía de contexto.** Lee solo lo que la tarea necesita. Es una restricción, no una preferencia.
5. **Verificación post-cambio.** `pnpm typecheck` + `pnpm lint`. El build **no** te cubre (ver §6).

---

## 2. Enrutado por tarea

**Lee el documento de la fila que corresponde. No todos.**

| Si la tarea toca… | Lee |
| :--- | :--- |
| Versiones, deploy targets, qué librería resuelve qué | [`docs/knowledge_base/stack.md`](./docs/knowledge_base/stack.md) |
| Dónde va un archivo, RSC vs cliente, capas de `src/lib` | [`docs/knowledge_base/architecture.md`](./docs/knowledge_base/architecture.md) |
| Recursos pasivos, colas, combate, puntuación, Game Tick | [`docs/knowledge_base/game-engine.md`](./docs/knowledge_base/game-engine.md) |
| Schema Prisma, queries, migraciones, seed | [`docs/knowledge_base/data-model.md`](./docs/knowledge_base/data-model.md) |
| Instalación, `.env`, scripts | [`docs/knowledge_base/setup-and-env.md`](./docs/knowledge_base/setup-and-env.md) |
| Escribir código: tipos, transacciones, naming, UI | [`docs/knowledge_base/conventions.md`](./docs/knowledge_base/conventions.md) |

Índice completo y reglas de la KB: [`docs/knowledge_base/README.md`](./docs/knowledge_base/README.md).

---

## 3. Estructura

```text
/src
├── ai/          # Genkit (flujos Gemini)
├── app/         # App Router — Server Components por defecto
│   ├── (dashboard)/  # zona autenticada; su layout.tsx dispara el Game Tick
│   ├── admin/        # panel de balanceo (superusuario)
│   └── login/
├── components/
│   ├── dashboard/  # 'use client' — hojas interactivas
│   ├── admin/      # matrices de balanceo
│   └── ui/         # primitivas shadcn
├── contexts/   # estado transitorio de cliente
├── data/       # datos estáticos de cliente
├── hooks/      # useToast, useMobile, …
├── lib/        # ← ver las 3 capas abajo
└── types/      # tipos y enums compartidos (client-safe)

/prisma        # schema.prisma · prisma.config.ts · seed.ts · migrations/ · datosactuales/
/prisma8       # contrato de la migración a Prisma 8 (en curso — no borrar)
/docs/knowledge_base/   # documentación temática (esta es la fuente)
```

### Las 3 capas de `src/lib` — la regla estructural más importante

| Capa | Archivo(s) | Responsabilidad | Regla dura |
| :--- | :--- | :--- | :--- |
| **Acciones** | `src/lib/actions/*.actions.ts` | *Qué hacer.* Mutaciones desde cliente. | `'use server'`. Sin lógica de negocio: orquestan, validan, delegan. |
| **Fórmulas** | `src/lib/formulas/*-formulas.ts` | *Cómo calcular.* Escalados, costes, combate. | **Puras.** Sin Prisma, sin efectos, sin `Date.now()` implícito. |
| **Datos** | `src/lib/data.ts` | *Qué información usar.* Todas las lecturas. | **Sin `'use server'`** (lo expondría al cliente). Único canal de lectura. |

Un archivo nuevo va en `src/lib/actions/` o `src/lib/formulas/` según sea mutación o cálculo.
Si no es ninguna, probablemente va en `components/` o `lib/`.

> Aviso: existen `src/lib/formulas.ts` y `src/lib/actions/score-formulas.ts` **junto a** las
> carpetas homónimas. Antes de crear una fórmula, busca en las tres.

---

## 4. Invariantes no negociables

Estas reglas están en contexto **siempre**. El resto, en la KB.

### 4.1 APIs dinámicas de Next.js 15+ son asíncronas

```typescript
const cookieStore = await cookies();      // ✅
const { id } = await params;              // ✅  params es Promise
const { tab } = await searchParams;       // ✅  searchParams es Promise

const cookieStore = cookies();            // ❌  runtime error: sync-dynamic-apis
```

### 4.2 Toda mutación multi-tabla va en transacción

```typescript
await prisma.$transaction(async (tx) => {
  const updatedProp = await tx.propiedad.update({
    where: { id: propiedadId },
    data: { dinero: { decrement: costo.dinero } },
  });
  if (updatedProp.dinero < 0) throw new Error("Recursos insuficientes para completar la operación.");
  await tx.colaConstruccion.create({ data: { /* … */ } });
});
```

Verifica el saldo **después** del `decrement`, dentro de la transacción. Predecirlo antes
abre una condición de carrera.

### 4.3 Prisma

- Importa el **singleton** de `src/lib/prisma/prisma.ts`. Nunca `new PrismaClient()` ailleurs:
  cada instancia abre su propio pool.
- Lecturas agrupadas con `Promise.all`; nunca cascadas secuenciales (la DB es remota).
- Lecturas idempotentes envueltas en `React.cache()`.
- Toda matemática de escalado va en `formulas/`, no en la action.

### 4.4 Server Actions

- `'use server'` + validación Zod antes de tocar datos.
- Retorno estándar:

  ```typescript
  type ActionResult<T = unknown> =
    | { success: true; data: T; message?: string }
    | { success: false; error: string; code?: string };
  ```

- `revalidatePath()` solo si la mutación cambia algo visible en pantalla.
- `src/lib/actions/session.actions.ts` es la **única** entrada pública de auth desde cliente.
  Los `auth*.ts` de `src/lib/` son primitivas internas, sin `'use server'`.

### 4.5 UI

- Primitivas shadcn de `@/components/ui/*`. No reescribas una que ya existe.
- **Solo `lucide-react` para iconos.** Nunca inlinees un SVG crudo si hay icono equivalente.
- Colores: tokens HSL de `src/app/globals.css`. No hardcodees colores.
- Feedback al usuario con `useToast`.

### 4.6 Orden de `@layer` en `globals.css` — load-bearing

```css
@tailwind base;        /* 1 */
@tailwind components;  /* 2 */
@tailwind utilities;   /* 3 */
```

Invertir `components` y `utilities` hace que las clases de componente ganen a **todas** las
utilidades y el layout se rompa silenciosamente, sin error de build. No reordenes.

---

## 5. Datos y activos heavy

| Ruta | Por qué está excluida |
| :--- | :--- |
| `node_modules/`, `.next/`, `dist/`, `build/` | Artefactos. Nada que aportar. |
| `public/img/`, `public/nuevas/`, `public/icons/` | ~23 MB de binarios. |
| `prisma/*.json`, `prisma/datosactuales/`, `prisma/export/` | Volcados de balanceo. Usar Prisma Studio o `pnpm db:export`. |
| `.agents/skills/`, `.claude/skills/`, `.hermes/skills/` | 3 copias idénticas de una librería de skills (1.332 archivos). No son código del proyecto. |

Las reglas viven en `.aiexclude`, la **única fuente canónica**. Las copias para cada
herramienta (`.claudeignore`, `.cursorignore`, `.geminiignore`) se generan con
`pnpm ai:excludes` y **no se versionan**: son artefactos reconstruibles.
**Edita `.aiexclude`, nunca las copias.** Tras editarlo, corre `pnpm ai:excludes`.
`pnpm ai:excludes:check` detecta que alguien editó una copia a mano.

---

## 6. Verificación

```bash
pnpm typecheck    # tsc --noEmit
pnpm lint
```

> `next.config.ts` tiene `typescript.ignoreBuildErrors: true`, así que **`pnpm build` no te
> protege de errores de tipos** — ~25 errores conocidos siguen ocultos. Son tu responsabilidad.
> (`eslint.ignoreDuringBuilds` ya se eliminó: estaba obsoleta en Next 16 y emitía un warning
> en cada build. No la reintroduzcas.)

El build en Windows puede fallar con `EPERM … symlink` al empaquetar `output: 'standalone'`.
Es el layout de symlinks de pnpm sin Developer Mode, no un error de código.

---

## 7. Optimización de contexto (obligatorio)

- **Inspección quirúrgica:** lee fragmentos, no carpetas enteras. Un `grep` con rutas
  precisas gana a un volcado de 200 líneas.
- **No asumas la existencia de paquetes.** Antes de usar una librería, confirma en `package.json`.
- **Preserva rutas existentes.** No renombres endpoints ni componentes sin `grep` de
  referencias cruzadas.
- **No borres reglas técnicas o de negocio** al limpiar, mover o consolidar.
- **Un dueño por archivo.** Si varios agentes trabajan en paralelo, coordina quién toca
  qué archivo para no pisarse.

---

## 8. Fuentes de verdad y conflictos

| Precedencia | Fuente |
| :--- | :--- |
| 1 | **El código** |
| 2 | `package.json`, `prisma/schema.prisma`, `tsconfig.json`, `components.json` |
| 3 | `docs/knowledge_base/*` |
| 4 | `README.md` (humanos; no lo uses como spec técnica) |
| — | `docs/knowledge_base/history/*` — **superado, solo referencia histórica** |

Si encuentras un conflicto entre dos fuentes y no puedes resolverlo por precedencia,
**no lo resuelvas por intuición**: reporta el conflicto y para.
