import type {Config} from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  // Directorios que Tailwind escanea para extraer clases. Tailwind v3 PURGA
  // todo lo que no encuentra aqui: un archivo con classNames fuera de estos
  // globs pierde sus utilidades del bundle, en silencio y sin error de build.
  // src/contexts, src/hooks y src/lib hoy no contienen classNames, pero se
  // listan para que el primer componente que se agregue en ellos no se purgue.
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/contexts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      gridTemplateColumns: {
        '15': 'repeat(15, minmax(0, 1fr))',
        '17': 'repeat(17, minmax(0, 1fr))',
      },
      fontFamily: {
        // `sans` conserva el nombre de variable historico `--font-roboto`
        // aunque la familia cargada pase a ser Roboto Flex (ver app/layout.tsx).
        sans: ['var(--font-roboto)', 'sans-serif'],
        heading: ['var(--font-bebas-neue)', 'sans-serif'],
        // DESIGN.md "Typography": JetBrains Mono es EXCLUSIVO de datos
        // tabulares — cuentas regresivas, saldos, coordenadas. Se elige por su
        // `tabular-nums` natural: un reloj que se descompone cada segundo no
        // puede re-flowear la fila.
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'],
      },
      // Escalas crudas de .stitch/DESIGN.md. A diferencia de los tokens HSL de
      // globals.css, estas NO cambian con el tema: son el mundo fisico de la
      // marca (tinta, madera, pergamino) y la mecanica skeuomorfica depende de
      // sus valores exactos.
      colors: {
        // Tinta y madera carbonizada. Eliminan el negro digital.
        ink: {
          DEFAULT: '#0a0806',
          1: '#120e0a',
          2: '#1f1813',
          3: '#2a211a',
          4: '#362b22',
        },
        // Molduras y biseles de las tarjetas.
        wood: { DEFAULT: '#3a2e24', light: '#4a3b2e', dark: '#2a211a' },
        // La superficie luminosa: papel de archivo.
        parch: {
          50: '#f7f3ea',
          100: '#eee6d8',
          200: '#e4dbca',
          300: '#d5c8b1',
          400: '#bfae94',
        },
        // Tinta de maquina sobre el pergamino.
        umber: { DEFAULT: '#3b2d20', light: '#5a4634', lighter: '#6f5741' },
        // Prestigio y letalidad: el motor tactico.
        crimson: { DEFAULT: '#a02020', light: '#cc3333', dark: '#701818', deep: '#4a1010' },
        // Autoridad: rango, territorio, tesoro.
        gold: { DEFAULT: '#c9a227', light: '#e3c05a', dim: '#9a7a1c', deep: '#6b5210' },

        // Tokens semanticos: cada uno es un puente a una variable HSL de
        // globals.css, que es donde vive el valor real (ver el bloque de
        // comentario "SISTEMA VENDETTA SETIEMBRE" ahi). Cambiar el tema cambia
        // estos colores sin tocar este archivo.
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        // DESIGN.md "Shapes": roundedness 1, escala maxima 0.75rem.
        xs: '0.125rem',
        sm: 'calc(var(--radius) - 4px)',
        DEFAULT: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        lg: 'var(--radius)',
        xl: '0.75rem',
      },
      // DESIGN.md "Elevation": contacto de alta densidad con filete de luz
      // interior (rim-light del canto de carton) + sombra ambiental profunda.
      // Es la unica sombra del sistema: la profundidad viene de la luz de la
      // mesa, no de un desenfoque gris.
      boxShadow: {
        dossier: '0 1px 0 0 rgba(238,230,216,.06), 0 8px 24px -8px rgba(0,0,0,.8)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': {
            transform: 'translateX(100%)',
          },
        },
        // Barrido de avance del teletipo de noticias. Antes se referenciaba
        // como `animate-[progress_7s_linear_infinite]` SIN que existiera la
        // keyframe `progress`: la clase se purgaba y la barra de progreso del
        // teletipo nunca avanzaba. Se declara aqui.
        progress: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        viewIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-in-out',
        'fade-in-up': 'fade-in-up 0.5s ease-in-out',
        shimmer: 'shimmer 1.5s infinite',
        'view-in': 'viewIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        // `--value` lo fija el consumidor para no hardcodear 7s.
        progress: 'progress var(--progress-duration, 7s) linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config;
