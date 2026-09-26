# Convenciones de Código

## Tipografía

- **Cero tolerancia con `any`.** Si no puedes tipar algo, el diseño está mal.
- Tipado explícito de retornos en toda función pública.
- Interfaces de dominio cohesivas; vive en `src/types/`.
- **Zod en toda frontera de entrada**: params, searchParams, body, cookies.
- `strict: true` es innegociable.

## Prisma

1. **Singleton siempre.** Importa `prisma` de `src/lib/prisma/prisma.ts`. Nunca instancies
   `new PrismaClient()` en otro sitio: en desarrollo cada instancia abre su propio pool.
2. **Toda mutación multi-tabla va en `prisma.$transaction`.** Compra, reclutamiento y
   órdenes de misión tocan recursos + cola: o pasan las dos cosas o no pasa ninguna.

   ```typescript
   await prisma.$transaction(async (tx) => {
     const updatedProp = await tx.propiedad.update({
       where: { id: propiedadId },
       data: { dinero: { decrement: costo.dinero } },
     });
     if (updatedProp.dinero < 0) {
       throw new Error("Recursos insuficientes para completar la operación.");
     }
     await tx.colaConstruccion.create({ data: { /* … */ } });
   });
   ```

3. **Lecturas solo por el DAL** (`src/lib/data.ts`). Ver [architecture.md](./architecture.md).
4. **Verifica saldos *después* del `decrement`**, dentro de la transacción. Predecir el saldo
   antes abre una condición de carrera.
5. La matemática de escalado va en `src/lib/formulas/`, nunca en una action. Ver
   [game-engine.md](./game-engine.md).

## Server Actions

- `'use server'` arriba del módulo.
- Validan con Zod antes de consultar o mutar.
- Devuelven siempre el mismo sobre:

  ```typescript
  type ActionResult<T = unknown> =
    | { success: true; data: T; message?: string }
    | { success: false; error: string; code?: string };
  ```

- `revalidatePath()` solo cuando la mutación afecta algo visible.
- **No** importes el DAL a un archivo `'use client'`.

## Next.js

- Server Components por defecto; `'use client'` en hojas interactivas.
- `await cookies()`, `await headers()`, `await params`, `await searchParams`. Siempre.
- Layouts y `loading.tsx` resuelven datos en paralelo, nunca en cascada.
- `metadata.json` y `apphosting.yaml` son de Firebase App Hosting; `next.config.ts` es de
  Vercel. Ver [stack.md](./stack.md) — el repo despliega a ambos.

## UI

- **shadcn/ui** (`@/components/ui/*`) como base. No reescribas una primitiva que ya existe.
- **`lucide-react` es la única librería de iconos.** Nunca inlinees un SVG crudo cuando
  exista un icono Lucide equivalente.
- Tema oscuro mafioso. Acentos carmesí y dorados definidos como variables HSL en
  `src/app/globals.css` — **no hardcodees colores** en clases, usa los tokens.
- Animaciones con Tailwind transitions y `motion/react` para micro-interacciones.
- Feedback de error, advertencia y éxito con `useToast`.
- Origen de la UI: [history/ui-blueprint-original.md](./history/ui-blueprint-original.md)
  (superado — el código actual manda).

## Formato y naming

- Nombres de archivo: `kebab-case.ts` (`room.actions.ts`, `troop-formulas.ts`).
  Los módulos transversales usan `auth*.ts` / `data.ts`.
- Server Actions: `<dominio>.actions.ts`.
- Fórmulas: `<dominio>-formulas.ts`.
- Imports con el alias `@/`.
- Comentarios explican **por qué**, no **qué**. Si el código no se explica solo, refactoriza.

## Verificación

Antes de dar por terminada una tarea:

```bash
pnpm typecheck
pnpm lint
```

`next.config.ts` tiene `typescript.ignoreBuildErrors: true`, así que **`pnpm build` no te
protege de errores de tipos**. Son tu responsabilidad. La clave `eslint.ignoreDuringBuilds`
ya se eliminó por estar obsoleta en Next 16; no la reintroduzcas.
