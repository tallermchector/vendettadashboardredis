# Arquitectura

## Árbol real del proyecto

```text
/src
├── ai/                     # Genkit: flujos y tools de IA (punto de entrada src/ai/dev.ts)
├── app/                    # App Router — Server Components por defecto
│   ├── (dashboard)/        # Zona autenticada. layout.tsx dispara el Game Tick en cada navegación
│   │   ├── buildings/      #   construcción y ampliación
│   │   ├── family/         #   sindicatos, solicitudes, banco de recursos
│   │   ├── map/            #   coordenadas urbanas
│   │   ├── messages/       #   tablón de mensajes
│   │   ├── missions/       #   órdenes de ataque / transporte / espionaje
│   │   ├── overview/       #   panel principal
│   │   ├── profile/        #   perfil del jugador
│   │   ├── rankings/       #   clasificaciones por puntos y honor
│   │   ├── recruitment/    #   reclutamiento de tropas
│   │   ├── resources/      #   detalle de recursos
│   │   ├── rooms/          #   gestión de habitaciones
│   │   ├── search/         #   búsqueda
│   │   ├── security/       #   vista de seguridad / contraataque
│   │   ├── settings/       #   ajustes de cuenta
│   │   ├── simulator/      #   simulador de combate
│   │   ├── statistics/     #   estadísticas y gráficas (recharts)
│   │   ├── technologies/   #   árbol tecnológico
│   │   ├── training/       #   investigaciones
│   │   └── layout.tsx
│   ├── admin/              # Panel de balanceo (protegido por superusuario)
│   ├── login/              # Autenticación
│   ├── globals.css         # Tokens de diseño + capas Tailwind
│   ├── layout.tsx          # Root layout, fuentes (Bebas Neue + Roboto)
│   ├── not-found.tsx
│   ├── page.tsx            # Puerta de acceso, verifica superusuario
│   └── sitemap.ts
├── components/
│   ├── dashboard/          # Vistas interactivas ('use client')
│   ├── admin/              # Matrices y formularios de balanceo
│   └── ui/                 # Primitivas shadcn (button, dialog, table, …)
├── contexts/               # Estado transitorio de cliente (p. ej. propiedad activa)
├── data/                   # Datos estáticos del cliente
├── hooks/                  # useToast, useMobile, …
├── lib/                    # Núcleo de negocio y persistencia
└── types/                  # Tipos y enums compartidos (client-safe)

/prisma
├── schema.prisma           # Modelo de datos
├── prisma.config.ts        # Config declarativa: schema, migrations, seed, datasource
├── seed.ts                 # Orquestador de carga inicial
├── migrations/             # Migraciones SQL
├── datosactuales/          # Datasets de configuración inicial
├── export/  importar/      # Pipelines de exportación / importación
└── *.json                  # Volcados de tablas de balanceo (NO leer: son pesados)

/prisma8
├── contract.prisma         # Contrato de la migración a Prisma 8
└── test.prisma             # Banco de prueba de la migración
```

## Las tres capas de `src/lib`

Regla fundacional del proyecto: **acciones** (qué hacer) · **fórmulas** (cómo calcular) ·
**datos** (qué información usar). Separadas para que cada una evolucione sola.

### 1. `src/lib/actions/` — mutaciones

15 archivos, uno por dominio. Son el **único** punto de entrada para mutaciones desde el cliente.

- Todos llevan `'use server'`.
- **No contienen lógica de negocio compleja**: orquestan, validan y delegan.
- Validan entrada con Zod antes de tocar la base.
- Devuelven siempre el resultado estándar (`success` / `error`).
- Toda mutación que afecte más de una tabla va en `prisma.$transaction`.
- Usan `revalidatePath()` solo si la mutación cambia algo visible en pantalla.

```
admin.actions.ts      auth.actions.ts       cancel-mission.action.ts
family.actions.ts     map.actions.ts        message.actions.ts
mission.actions.ts    room.actions.ts       score-formulas.ts
session.actions.ts    simulation.actions.ts super-auth.actions.ts
training.actions.ts   troop.actions.ts      user.actions.ts
```

> `session.actions.ts` es la **única** entrada pública de autenticación desde el cliente.
> Los módulos `auth*.ts` de `src/lib/` son primitivas internas y **no** llevan `'use server'`.

### 2. `src/lib/formulas/` — matemática pura

```
mission-formulas.ts   produccion-formulas.ts   room-formulas.ts
score-formulas.ts     training-formulas.ts     troop-formulas.ts
```

Funciones **puras**: sin efectos secundarios, sin `Date.now()` implícito, sin Prisma.
Todo escalado de edificios, bonus de investigación y poder de combate vive aquí.
Es la capa que hace el proyecto testeable y balanceable sin tocar base de datos.

> `src/lib/formulas.ts` (raíz de `lib`) y `score-formulas.ts` (dentro de `actions/`) existen
> junto a las de `formulas/`. Antes de añadir una fórmula, busca en las tres y reutiliza.

### 3. `src/lib/data.ts` — Data Access Layer

**Único** canal de lectura de la base de datos.

- **No lleva `'use server'`.** Es un módulo de servidor importado por Server Components
  y Server Actions. Marcarlo como action lo expondría al cliente — no lo hagas.
- Centraliza todo `findUnique` / `findMany` / `include`.
- Usa `include` de Prisma para traer relaciones en una sola query y evitar N+1.
- Envuelve lecturas related en `Promise.all` para no crear cascadas.
- Usa `React.cache()` para memoizar lecturas idempotentes dentro de un mismo request.
- Exporta los tipos compuestos del dominio (`UserWithProgress`, `FullPropiedad`, …).

### Primitivas de infraestructura

| Archivo | Responsabilidad |
| :--- | :--- |
| `src/lib/prisma/prisma.ts` | Cliente **singleton** de Prisma (evita agotar el pool en dev). |
| `src/lib/auth.ts` | Sesión de jugador: cookies HTTP-only, verificación. |
| `src/lib/auth-admin.ts` | Permisos del panel de administración. |
| `src/lib/auth-super.ts` | Permisos de superusuario. |
| `src/lib/utils.ts` | `cn()` de shadcn. |

## Reglas de App Router (Next.js 15+)

Obligatorio, sin excepciones:

```typescript
// APIs dinámicas SIEMPRE asíncronas
const cookieStore = await cookies();
const { propertyCoords } = await params;      // params es Promise
const { tab } = await searchParams;            // searchParams es Promise

// Nunca: const cookieStore = cookies();  → error runtime sync-dynamic-apis
```

Tipos de props de página:

```typescript
interface PageProps {
  params: Promise<{ propertyCoords: string }>;
  searchParams: Promise<{ tab?: string }>;
}
```

`'use client'` vive **solo** en hojas interactivas del árbol DOM. Si un componente de
`components/dashboard/` necesita datos, pásalos como props desde el Server Component padre;
no arrastres el DAL al cliente.

## Capas de Tailwind en `globals.css`

El orden de los `@layer` es **load-bearing** y no debe reordenarse:

```css
@tailwind base;        /* 1 */
@tailwind components;  /* 2 */
@tailwind utilities;   /* 3 */
```

Invertir `components` y `utilities` hace que las clases de componente ganan a todas las
utilidades y el layout se rompe silenciosamente. `components.json` apunta a
`tailwind.config.ts` + `src/app/globals.css`; cualquier cambio aquí rompe el CLI de shadcn.
