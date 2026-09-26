# Modelo de Datos y Prisma

## Configuración

`prisma.config.ts` es la fuente de verdad (Prisma 7 moved config fuera de `package.json`):

```typescript
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "bun prisma/seed.ts",          // ← así se ejecuta el seed
  },
  datasource: { url: process.env["DATABASE_URL"] },
});
```

`schema.prisma` usa **driver adapters** (`@prisma/adapter-pg`), no `url` en el bloque
`datasource`. La conexión se inyecta desde el singleton en `src/lib/prisma/prisma.ts`.

## Comandos

Todos vía **pnpm**:

| Acción | Comando | Notas |
| :--- | :--- | :--- |
| Instalar deps | `pnpm install` | `postinstall` corre `prisma generate` automáticamente. |
| Regenerar tipos | `pnpm prisma:generate` | Alias de `prisma generate`. También `pnpm generate`. |
| Seed | `pnpm prisma db seed` | Lee `migrations.seed` de `prisma.config.ts` → `bun prisma/seed.ts`. |
| Studio | `pnpm prisma studio` | |
| Migrar (dev) | `pnpm prisma migrate dev --name <nombre>` | |
| Exportar | `pnpm db:export` | `bun prisma/exportacion.ts`. |
| Migrar a Prisma 8 | `pnpm prisma8:migrate` | `prisma db migrate --advance-ref db`. |

> **No existe un script `prisma:seed` en `package.json`.** Cualquier documentación que lo
> mencione está mal. El seed se dispara con `prisma db seed`, que resuelve la config.

## Orden de operaciones seguro

Después de tocar `schema.prisma`:

```bash
pnpm prisma:generate      # 1. tipos del cliente
pnpm prisma migrate dev   # 2. migración SQL
pnpm prisma db seed       # 3. solo si la migración exige re-poblar
```

`prisma db push` existe para iteración rápida en desarrollo, pero **no genera historial de
migraciones**. No lo uses contra una base con datos.

## Migración a Prisma 8 (en curso)

El repo corre **dos** versiones en paralelo:

- **Prisma 7** (`@prisma/client@7.10.0`) — lo que usa `src/` hoy vía `prisma.config.ts`.
- **Prisma 8 RC** (`@prisma/orm-postgres@8.0.0-rc.11`) — contrato en `prisma8/contract.prisma`,
  banco de prueba en `prisma8/test.prisma`.

El objetivo es mover el repo a Prisma 8 (las plataformas de deploy ya lo ejecutan).
Mientras la migración esté abierta:

- **No borres** `prisma8/`, `prisma8.config.ts` ni el script `prisma8:migrate`.
- **No cambies** `prisma/schema.prisma` a sintaxis de Prisma 8 sin actualizar el contrato.
- Los cambios en el schema deben seguir siendo válidos en **ambas** versiones.
- Referencia: <https://www.prisma.io/docs/v8>

## `relationJoins`

`schema.prisma` (~línea 4) declara `previewFeatures = ["relationJoins"]`. Está activa
pero su estado es una decisión abierta: puede estar justificada o ser residuo. Si la
quitas, revalida las queries que usan `relationLoadStrategy`. **Decisión pendiente, no
la cambies de paso.**

## La base es remota

`DATABASE_URL` apunta a un PostgreSQL **remoto**. Cada query paga un piso de red de
~170 ms. Consecuencias prácticas:

1. `Promise.all` sobre lecturas relacionadas, nunca cascadas secuenciales.
2. `React.cache()` para lecturas idempotentes dentro del mismo request.
3. `include` de Prisma en lugar de N+1.
4. Cada query de más se nota en la latencia percibida. Antes de añadir una, cuenta las
   que ya existen en el mismo render.

## Archivos pesados — no los leas

`prisma/*.json` y `prisma/datosactuales/` son volcados de tablas de balanceo. Están en
`.aiexclude` a propósito. Para consultar datos de balance usa Prisma Studio o
`pnpm db:export`, no abras el JSON.
