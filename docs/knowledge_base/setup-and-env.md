# Instalación, Entorno y Scripts

> **pnpm es el único gestor de paquetes de este proyecto.** No uses `npm install` ni `yarn`.

## Prerrequisitos

| Requisito | Versión |
| :--- | :--- |
| Node.js | moderna (el repo apunta a tipos de Node 26, no a 18) |
| pnpm | la que resuelva `pnpm-lock.yaml` |
| PostgreSQL | instancia accesible, remota en el entorno de desarrollo |
| `bun` | solo para `prisma/seed.ts` y `prisma/exportacion.ts` |

## Instalación

```bash
git clone <URL>
cd vendetta
pnpm install
```

`pnpm install` dispara `postinstall` → `prisma generate`. Si el cliente falla por falta de
`DATABASE_URL`, es normal: la generación no necesita conexión, el *pool* sí.

## Variables de entorno

`.env.example` es la lista mínima:

```env
DATABASE_URL=
GEMINI_API_KEY=
```

| Variable | ¿Obligatoria? | Uso |
| :--- | :--- | :--- |
| `DATABASE_URL` | Sí | Conexión PostgreSQL. La lee `prisma.config.ts`. |
| `GEMINI_API_KEY` | No | Flujos Genkit (`src/ai/`). Sin ella, esas rutas fallan. |
| `NODE_ENV` | No | Lo fija el entorno de deploy. |

`.env`, `.env*.local`, `.env.production` están en `.gitignore` y en `.aiexclude`.
Nunca subas una clave; `!.env.example` es la excepción que sí se versiona.

## Scripts

| Script | Comando | Qué hace |
| :--- | :--- | :--- |
| `dev` | `pnpm dev` | Next dev en `:3000`, bind `0.0.0.0`. |
| `build` | `pnpm build` | Build de producción. |
| `start` | `pnpm start` | Servidor de producción. |
| `lint` | `pnpm lint` | ESLint. |
| `typecheck` | `pnpm typecheck` | `tsc --noEmit`. |
| `generate` | `pnpm generate` | `prisma generate`. |
| `prisma:generate` | `pnpm prisma:generate` | Alias del anterior. |
| `prisma8:migrate` | `pnpm prisma8:migrate` | Migración a Prisma 8. |
| `db:export` | `pnpm db:export` | Export de tablas a JSON. |
| `genkit:dev` | `pnpm genkit:dev` | Genkit dev server (`src/ai/dev.ts`). |
| `genkit:watch` | `pnpm genkit:watch` | Genkit en modo watch. |
| `ai:excludes` | `pnpm ai:excludes` | Genera `.claudeignore` / `.cursorignore` / `.geminiignore` desde `.aiexclude`. |
| `ai:excludes:check` | `pnpm ai:excludes:check` | Falla (exit 1) si una copia difiere del canónico. |

> **Los tres archivos generados están en `.gitignore` a propósito:** son artefactos locales
> reconstruibles, no fuentes. En git vive solo `.aiexclude`.
>
> Consecuencia práctica: en un clone nuevo no existen hasta que corras `pnpm ai:excludes`.
> Por eso `ai:excludes:check` está pensado como **guarda local** de tu working copy — detecta
> que editaste una copia a mano. En CI, encadena las dos en orden:
> `pnpm ai:excludes && pnpm ai:excludes:check`.

> `pnpm build` puede fallar en Windows con `EPERM: operation not permitted, symlink` al
> empaquetar `output: 'standalone'`. Es el layout de symlinks de pnpm contra Windows sin
> Developer Mode — no es un error de código. Vercel ignora `standalone`.

## Admin

`/admin` está protegido por superusuario. Para crear el primer superusuario, el seed es
el camino previsto: revisa `prisma/seed.ts` y `src/lib/actions/super-auth.actions.ts`
antes de improvisar un insert manual.
