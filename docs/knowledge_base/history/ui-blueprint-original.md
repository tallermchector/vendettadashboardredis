# ⚠️ SUPERADO — Spec UI original (pre-implementación)

> **No uses este documento como referencia de diseño.** Describe la intención original del
> producto; el código actual la implementó de otra forma. Donde discrepan, **manda el código**.
>
> Divergencias conocidas frente a lo implementado:
>
> | Este spec | Realidad |
> | :--- | :--- |
> | Fuente **Inter** | **Bebas Neue** (display) + **Roboto** (cuerpo), vía `next/font` en `src/app/layout.tsx` |
> | Primario `#8B0000` | `--primary: 0 75% 50%` (carmesí) en `src/app/globals.css` |
> | "tema oscuro y **arenoso**" | tema oscuro mafioso, sin arenas |
> | Acento `#BDB76B` | dorado `#eab308` |
>
> Tokens vigentes: [../conventions.md](../conventions.md) · Fuente: `src/app/globals.css`.

---

# **App Name**: Vendetta Dashboard

## Core Features:

- Barra Superior: Implementar una barra superior que muestre el título del proyecto y los indicadores de estado (ej., ARMAS, MUNICION, ALCOHOL, DOLAR) utilizando el Next.js App Router.
- Navegación Lateral: Crear una barra de navegación lateral con secciones clave como 'Visión General', 'Habitaciones', 'Reclutamiento', etc., permitiendo una navegación fluida entre los módulos del proyecto utilizando Next.js.
- Área de Contenido Dinámico: Diseñar un marcador de posición de área de contenido que se actualice dinámicamente según el elemento de navegación seleccionado en la navegación lateral, mostrando inicialmente un mensaje estático.
- Diseño de Página Inicial: Configurar el diseño del proyecto utilizando Next.js App Router para establecer la estructura básica de la página de inicio con un tema oscuro y arenoso.

## Style Guidelines:

- Color primario: Carmesí profundo (#8B0000) para representar la intensidad y el enfoque estratégico, como un juego sobre el tema del proyecto.
- Color de fondo: Gris muy oscuro (#121212) para mantener un ambiente arenoso, inmersivo y serio. Esto establece un telón de fondo ideal para mostrar las métricas del proyecto.
- Color de acento: Amarillo desaturado sutil (#BDB76B) como color análogo, para guiar las acciones del usuario y crear puntos de énfasis visual sin interrumpir el tono sombrío previsto.
- Fuente: 'Inter', una sans-serif de estilo grotesco con un aspecto moderno, mecanizado, objetivo y neutral adecuado tanto para titulares como para texto de cuerpo.
- El diseño se divide en una barra superior fija, una barra de navegación lateral de ancho fijo y un área de contenido flexible para garantizar que la información importante esté siempre accesible.
- Usa iconos vectoriales nítidos y minimalistas para la navegación lateral para proporcionar indicaciones visuales claras para cada sección (Objetivos, Operaciones, Inteligencia, Estado).