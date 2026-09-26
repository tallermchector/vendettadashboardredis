import "dotenv/config";
import { defineConfig } from "@prisma/orm-postgres/config";

// ---------------------------------------------------------------------------
// Migración a Prisma 8 — EN CURSO. Ver `docs/knowledge_base/data-model.md`.
//
// Este archivo NO participa en la app hoy: `src/` usa Prisma 7 vía
// `prisma.config.ts`. El script `prisma8:migrate` tampoco lo lee, porque no le
// pasa `--config prisma8.config.ts`.
//
// BLOQUEANTE CONOCIDO
// -------------------
// La forma canónica de Prisma 8 es un *envelope* de dos capas:
//
//   import { definePrismaConfig } from "@prisma/cli-engine";
//   import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";
//   export default definePrismaConfig({ orm: ormConfig({ ... }) });
//
// `@prisma/cli-engine` NO está en las dependencias del proyecto: existe solo en
// el store de pnpm como dependencia transitiva, desde donde Node no lo resuelve.
// Por eso aquí se usa la forma plana, que compila pero que el CLI de Prisma 8
// rechaza con `CONFIG.VERSION_MARKER_MISSING`.
//
// Para cerrarlo: agregar `@prisma/cli-engine` como devDependency y envolver
// este `defineConfig` en `definePrismaConfig({ orm: ... })`.
// ---------------------------------------------------------------------------
export default defineConfig({
  contract: "prisma8/contract.prisma",
  output: "generated/prisma8",
  db: {
    connection: process.env["DATABASE_URL"],
  },
});
