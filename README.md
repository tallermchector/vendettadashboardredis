# 🕶️ Vendetta — Mafia Strategy RTS

> Plataforma web de estrategia militar, expansión territorial y gestión de recursos en
> tiempo real, inspirada en los clásicos juegos de navegador de la mafia. Construye
> propiedades, investiga tecnologías criminales, recluta sicarios y compite con tu familia
> por el control de la ciudad.

[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?style=flat&logo=pnpm)](https://pnpm.io/)

---

## 📑 Contenido

1. [El juego](#-el-juego)
2. [Arquitectura](#-arquitectura)
3. [Puesta en marcha](#-puesta-en-marcha)
4. [Variables de entorno](#-variables-de-entorno)
5. [Scripts](#-scripts)
6. [Despliegue](#-despliegue)
7. [Documentación](#-documentación)

---

## 🎮 El juego

Cada jugador administra una organización criminal con múltiples propiedades repartidas por
barrios y ciudades.

| Mecánica | Descripción |
| :--- | :--- |
| **Economía de 4 recursos** | Armas, Munición, Alcohol y Dólares. Se generan pasivamente según el nivel de los edificios y se almacenan hasta el tope de cada depósito. |
| **Propiedades** | Construcción y ampliación de habitaciones clave: Oficina Central, Campo de Tiro, Cervecería, Fundición, Laboratorios. |
| **Árbol tecnológico** | Investigaciones de combate, extorsión, contrabando, espionaje y honor que desbloquean tropas y bonificadores tácticos. |
| **Reclutamiento** | Desde matones, porteros y carteristas hasta asesinos, francotiradores, ocupación y servicios secretos. |
| **Misiones** | Envío de tropas en tiempo real para transporte, espionaje, saqueo u ocupación territorial. |
| **Familias** | Aliaciones mafiosas con rangos jerárquicos, banco de recursos compartido, tablón de mensajes y guerras de facciones. |

**El tiempo es real, pero sin daemon.** No hay un proceso de fondo consumiendo CPU: los
recursos y las colas se resuelven por cálculo diferencial contra `Date.now()` cada vez que
el servidor atiende una petición. Cuesta cero cuando nadie juega y es correcto por
construcción.

---

## 🏗️ Arquitectura

Next.js 16 con App Router sobre PostgreSQL. Tres capas en `src/lib` sostienen todo el
contenido del juego:

```
src/lib/actions/     ¿Qué hacer?   Mutaciones desde el cliente (Server Actions)
src/lib/formulas/    ¿Cómo calcular? Escalados, costes y combate — funciones puras
src/lib/data.ts      ¿Qué datos?   Único canal de lectura (Data Access Layer)
```

- **App Router, Server Components por defecto.** `'use client'` solo en las hojas
  interactivas de `components/dashboard/`.
- **Prisma 7** con driver adapters contra un PostgreSQL remoto. Las lecturas van agrupadas
  con `Promise.all` y memoizadas con `React.cache()`; cada query de más se nota en latencia.
- **Migración a Prisma 8 en curso**, en paralelo sobre `prisma8/`.
- **Tailwind 3 + shadcn/ui**, tema oscuro mafioso con acentos carmesí y dorados.
- **Genkit + Gemini** para los flujos de IA en `src/ai/`.
- **Panel `/admin`** para balancear costes, escalados y matrices de tropas en caliente.

El detalle vive en [`docs/knowledge_base/`](./docs/knowledge_base/README.md).

---

## 🚀 Puesta en marcha

**Requisitos:** Node.js moderno, `pnpm`, y una instancia de PostgreSQL accesible.
`bun` solo si vas a correr el seed o la exportación.

```bash
git clone <URL_DEL_REPOSITORIO>
cd vendetta
pnpm install                 # postinstall genera el cliente de Prisma
```

Configura el entorno:

```bash
cp .env.example .env         # completa DATABASE_URL
```

Sincroniza y puebla la base de datos:

```bash
pnpm prisma:generate         # tipos del cliente
pnpm prisma db seed          # carga inicial (datos de balanceo, usuario inicial)
```

Arranca el entorno de desarrollo:

```bash
pnpm dev                     # http://localhost:3000
```

> Instalación, variables y troubleshooting:
> [`docs/knowledge_base/setup-and-env.md`](./docs/knowledge_base/setup-and-env.md).

---

## 🔑 Variables de entorno

```env
# Conexión a PostgreSQL — obligatoria
DATABASE_URL=

# Clave de Gemini para los flujos de IA — opcional
GEMINI_API_KEY=
```

`.env` está en `.gitignore`. Solo `.env.example` se versiona.

---

## ⚙️ Scripts

| Comando | Qué hace |
| :--- | :--- |
| `pnpm dev` | Servidor de desarrollo en `:3000` |
| `pnpm build` | Build de producción |
| `pnpm start` | Servidor de producción |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm prisma:generate` | Regenera los tipos del cliente Prisma |
| `pnpm prisma db seed` | Carga los datos iniciales |
| `pnpm db:export` | Exporta tablas a JSON |
| `pnpm prisma studio` | Inspecciona las tablas en el navegador |
| `pnpm prisma8:migrate` | Avanza la migración a Prisma 8 |
| `pnpm genkit:dev` | Servidor de desarrollo de los flujos de IA |
| `pnpm ai:excludes` | Regenera los archivos de ignore de las IAs |

---

## 🚀 Despliegue

El proyecto tiene configuración para dos plataformas:

- **Vercel** — `next.config.ts` (`output: 'standalone'`, que Vercel ignora).
- **Firebase App Hosting** — `apphosting.yaml` y `metadata.json`.

Antes de un cambio, asegúrate de que sigue siendo válido en ambas.

---

## 📚 Documentación

| | |
| :--- | :--- |
| [`AGENTS.md`](./AGENTS.md) | **Conventions para agentes de IA.** Punto de entrada normativo. |
| [`docs/knowledge_base/`](./docs/knowledge_base/README.md) | Documentación técnica temática: stack, arquitectura, motor de juego, modelo de datos, setup, convenciones. |
| [`docs/knowledge_base/history/`](./docs/knowledge_base/history/) | Specs originales superadas. Referencia histórica, no guía. |
