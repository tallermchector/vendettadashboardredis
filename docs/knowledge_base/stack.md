# Stack Tecnológico

> Fuente de verdad: `package.json`. Si este documento discrepa de `package.json`, gana `package.json`.
> Verificado: Next.js 16 · React 19 · TypeScript 7 · Tailwind 3 · Prisma 7 (+8 RC) · Genkit 1 · pnpm.

## Runtime

| Pieza | Versión | Nota |
| :--- | :--- | :--- |
| Next.js | `16.3.6` | App Router, `output: 'standalone'`, Turbopack por defecto. |
| React | `19.3.0` | Server Components por defecto. |
| TypeScript | `^7.0.2` | `strict: true`, `target: es2020`. **No es TS 5.x.** |
| `@types/node` | `^26.6.2` | El runtime objetivo es moderno; no apuntes a Node 18. |
| ESLint | `^10.11.0` + `eslint-config-next@16.3.6` | Config en `.eslintrc.json` → `next/core-web-vitals`. |

## Datos y persistencia

| Pieza | Versión | Nota |
| :--- | :--- | :--- |
| Prisma CLI + client | `^7.10.0` | Config declarativa en `prisma.config.ts` (no `package.json#prisma`). |
| `@prisma/adapter-pg` | `^7.10.0` | Prisma 7 usa **driver adapters**; la URL va en el adapter, no en el schema. |
| `@prisma/orm-postgres` | `^8.0.0-rc.11` | Prisma 8 release candidate, en paralelo. Ver [data-model.md](./data-model.md). |
| `@prisma/extension-accelerate` | `^3.0.1` | Cliente Prisma en entornos serverless. |
| `pg` | `^8.23.0` | Driver Postgres nativo. |
| PostgreSQL | — | **Remoto.** Ver [setup-and-env.md](./setup-and-env.md) para el piso de latencia. |
| `schema.prisma` | — | `previewFeatures = ["relationJoins"]` (~línea 4). Decisión pendiente de confirmar. |

## UI

| Pieza | Versión | Nota |
| :--- | :--- | :--- |
| Tailwind CSS | `^3.4.17` | **v3, no v4.** `tailwind.config.ts` sigue siendo válido. |
| `tailwindcss-animate` | `^1.0.7` | Plugin de animación de shadcn. |
| shadcn/ui | — | `components.json`: `style: "default"`, `cssVariables: true`, `rsc: true`, `iconLibrary: lucide`. |
| Radix UI | multipaquete | Primitivas accesibles. |
| `lucide-react` | `^0.525.0` | **Única** librería de iconos. |
| `recharts` | `^3.1.0` | Gráficas de estadísticas. |
| `react-hook-form` + `@hookform/resolvers` | `^7.60.0` / `^5.9.1` | Formularios cliente. |
| `embla-carousel-react` | `^8.6.0` | Carruseles. |
| `react-day-picker` | `^10.0.1` | Selectores de fecha. |
| `class-variance-authority` / `clsx` / `tailwind-merge` | — | Utilidades de estilo (`src/lib/utils.ts`). |

## Validación y AI

| Pieza | Versión | Nota |
| :--- | :--- | :--- |
| Zod | `4.6.5` | Validación en fronteras de entrada (Server Actions). |
| Genkit | `^1.15.2` | Framework de flujos IA. |
| `@genkit-ai/next` | `^1.15.2` | Integración con Next. |
| `@genkit-ai/google-genai` | `^1.42.0` | Plugin Gemini. |
| `firebase` / `firebase-admin` | `^12.19.0` / `^14.5.0` | Cliente y admin. |
| `csv-parse` | `^7.0.2` | Parseo de CSV en scripts de exportación. |

## Tooling

| Pieza | Nota |
| :--- | :--- |
| **pnpm** | Gestor de paquetes **único**. `pnpm-lock.yaml`, `pnpm-workspace.yaml`. |
| `pnpm-workspace.yaml` | `allowBuilds` para paquetes que requieren postinstall nativo. |
| `trustedDependencies` (package.json) | Lista equivalente para pnpm. |
| `postcss.config.mjs` | Pipeline de Tailwind. |
| `patch-package` | Parches de dependencias. |
| `tsx` | Ejecución TS directa (`genkit:*`, scripts). |
| `bun` | Solo para `prisma/seed.ts` y `prisma/exportacion.ts`. |

## Deploy

| Target | Señal en el repo |
| :--- | :--- |
| **Vercel** | Lockfile, `.vercel` ignorado, avisos de plataforma. `output: 'standalone'` **lo ignora**. |
| **Firebase App Hosting** | `apphosting.yaml` (`maxInstances: 1`), `metadata.json` (`MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`). |

> Con dos targets vivos, un cambio debe ser seguro en ambos. No introduzcas dependencias
> específicas de una plataforma en `src/` sin documentarlo aquí.
