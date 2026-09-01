# Sistema de Diseño — App de Agendamiento para Barberías

> **Documento de dirección visual y de movimiento.**
> Complemento de `especificacion-app-barberia.md` (funciones y stack técnico).
> Destinatarios: Claude Design (preview visual) y el agente de código (implementación).
> Versión 1.0 · React · Tailwind v4 · shadcn/ui

---

## 0. Cómo usar este documento

- **Para Claude Design:** usa las secciones 1 a 5 (dirección, tokens, tipografía, firma) y la 11 (pantallas). Los tokens de color son literales: no los reinterpretes.
- **Para el agente de código:** las secciones 5 a 10 traen CSS y componentes listos. Las clases y variables aquí definidas son la fuente de verdad.
- **Regla de oro:** un solo elemento lleva el peso visual (la hélice del poste). Todo lo demás es disciplinado y silencioso.

---

## 1. Dirección de arte

### El concepto

Dos temas, mismo mundo, distinta hora del día.

**`salon` (claro) — "La silla de la mañana."**
Porcelana, cromo y luz de espejo. Limpio, cuadriculado, profesional. La referencia es la barbería bien puesta: azulejo, toalla blanca, navaja de acero. Confianza y orden. Es el tema por defecto para agendar.

**`medianoche` (oscuro) — "La vitrina a las once."**
El local cerrado, el letrero de neón todavía encendido, el poste girando en la vidriera y el cromo de las máquinas reflejando azul. De ahí sale el brillo: neón real sobre negro azulado, no "cripto" por decoración. Es el tema para los momentos de espectáculo — el QR a pantalla completa, el check-in exitoso, el portafolio de cortes.

> **Por qué no un oscuro genérico:** el patrón de fondo negro con un acento verde ácido está en todas partes y no dice nada de una barbería. Anclar el modo oscuro en la vitrina nocturna da el mismo impacto y además justifica cada decisión: el glow es neón, el metal es cromo, el gradiente es el reflejo del poste en el vidrio.

### El elemento firma: **la hélice**

La franja helicoidal del poste de barbero, a **63° de la horizontal**, en secuencia azul → blanco → rojo. Se mueve siempre en la misma dirección (de abajo a la derecha hacia arriba a la izquierda), a velocidad constante y lenta.

Aparece exactamente en cuatro lugares, nunca más:

1. **Loader global** — un poste vertical de 6 px, animado.
2. **Barra de progreso del agendamiento** — los 5 pasos avanzan sobre la hélice.
3. **Filo izquierdo de la tarjeta de la próxima cita** — 4 px, estático en claro, con glow en oscuro.
4. **Divisor de sección en el portafolio** — 2 px, horizontal.

En `medianoche` la hélice emite luz. En `salon` es mate, como tela.

### El segundo momento: **el tiquete**

La cita confirmada no es una tarjeta más: es un **tiquete físico**. Borde troquelado (perforación), dos muescas laterales que lo parten en cuerpo y talón, el QR en el cuerpo y el código de respaldo en el talón, en monoespaciada grande, tratado como un sello. Es la pantalla que el cliente le va a mostrar al barbero, así que tiene que verse como un objeto, no como un `<Card>`.

### Lo que evitamos deliberadamente

- Degradados morado-a-rosa sin motivo.
- Tarjetas de vidrio en todas partes (el glass se usa **solo** en la barra inferior y en los overlays del modo oscuro).
- Iconos de tijeras y navajas por todos lados. La navaja aparece una vez, en el logo.
- Fondo crema con serif de alto contraste y acento terracota.
- Marcadores numerados 01 / 02 / 03 salvo donde hay una secuencia real (el flujo de agendamiento sí la tiene).

---

## 2. Paleta

### Tema `salon` (claro) — 6 valores nombrados

| Nombre | Hex | Rol |
|---|---|---|
| **Porcelana** | `#F7F8FA` | Fondo de la app |
| **Talco** | `#FFFFFF` | Tarjetas y superficies elevadas |
| **Tinta** | `#0E1420` | Texto principal (negro azulado, nunca `#000`) |
| **Azul Poste** | `#1B3FA0` | Primario: acciones, enlaces, estado activo |
| **Rojo Navaja** | `#C81E24` | Acento: alertas, cancelaciones, la franja roja |
| **Cromo** | `#B8C0CC` | Bordes, separadores, elementos metálicos |

### Tema `medianoche` (oscuro) — 6 valores nombrados

| Nombre | Hex | Rol |
|---|---|---|
| **Vitrina** | `#080B14` | Fondo (negro azulado profundo) |
| **Asfalto** | `#101828` | Superficies y tarjetas |
| **Neón Azul** | `#4D8CFF` | Primario, con glow |
| **Neón Rojo** | `#FF3B47` | Acento, con glow |
| **Cromo Frío** | `#8FA0B8` | Texto secundario y filos metálicos |
| **Reflejo** | `#7C5CFF` | **Solo en degradados.** Nunca como color plano |

> `Reflejo` es el violeta que aparece cuando el azul y el rojo del poste se mezclan en el vidrio. Existe únicamente para los degradados de los momentos espectaculares. Si lo ves como color de un botón, está mal usado.

### Variables CSS (formato shadcn / Tailwind v4)

```css
/* globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --radius: 0.75rem;

  /* ---- Tema salon (claro) ---- */
  --background:            oklch(0.977 0.003 250);   /* Porcelana */
  --foreground:            oklch(0.190 0.020 260);   /* Tinta      */
  --card:                  oklch(1 0 0);             /* Talco      */
  --card-foreground:       oklch(0.190 0.020 260);
  --popover:               oklch(1 0 0);
  --popover-foreground:    oklch(0.190 0.020 260);

  --primary:               oklch(0.400 0.160 265);   /* Azul Poste */
  --primary-foreground:    oklch(0.990 0 0);

  --secondary:             oklch(0.960 0.005 255);
  --secondary-foreground:  oklch(0.280 0.025 260);

  --muted:                 oklch(0.955 0.005 255);
  --muted-foreground:      oklch(0.550 0.028 257);

  --accent:                oklch(0.520 0.200 27);    /* Rojo Navaja */
  --accent-foreground:     oklch(0.990 0 0);

  --destructive:           oklch(0.520 0.200 27);
  --destructive-foreground:oklch(0.990 0 0);

  --border:                oklch(0.920 0.006 255);
  --input:                 oklch(0.920 0.006 255);
  --ring:                  oklch(0.400 0.160 265);

  /* Semánticos de dominio */
  --chrome:                oklch(0.800 0.015 255);
  --available:             oklch(0.560 0.130 155);   /* slot libre    */
  --occupied:              oklch(0.700 0.020 255);   /* slot ocupado  */
  --pending:               oklch(0.720 0.150 75);    /* por confirmar */

  /* Hélice */
  --pole-blue:             oklch(0.400 0.160 265);
  --pole-white:            oklch(1 0 0);
  --pole-red:              oklch(0.520 0.200 27);
  --pole-angle:            63deg;
  --pole-speed:            2.4s;

  --glow-primary:          transparent;
  --glow-accent:           transparent;
}

.dark {
  /* ---- Tema medianoche (oscuro) ---- */
  --background:            oklch(0.130 0.018 265);   /* Vitrina    */
  --foreground:            oklch(0.970 0.005 250);
  --card:                  oklch(0.200 0.025 265);   /* Asfalto    */
  --card-foreground:       oklch(0.970 0.005 250);
  --popover:               oklch(0.200 0.025 265);
  --popover-foreground:    oklch(0.970 0.005 250);

  --primary:               oklch(0.680 0.170 258);   /* Neón Azul  */
  --primary-foreground:    oklch(0.120 0.020 265);

  --secondary:             oklch(0.260 0.025 265);
  --secondary-foreground:  oklch(0.940 0.008 250);

  --muted:                 oklch(0.240 0.022 265);
  --muted-foreground:      oklch(0.680 0.030 255);   /* Cromo Frío */

  --accent:                oklch(0.650 0.220 22);    /* Neón Rojo  */
  --accent-foreground:     oklch(0.980 0 0);

  --destructive:           oklch(0.650 0.220 22);
  --destructive-foreground:oklch(0.980 0 0);

  --border:                oklch(0.300 0.025 265);
  --input:                 oklch(0.300 0.025 265);
  --ring:                  oklch(0.680 0.170 258);

  --chrome:                oklch(0.680 0.030 255);
  --available:             oklch(0.700 0.160 158);
  --occupied:              oklch(0.350 0.020 265);
  --pending:               oklch(0.780 0.160 78);

  --reflejo:               oklch(0.600 0.210 285);   /* solo gradientes */

  --pole-blue:             oklch(0.680 0.170 258);
  --pole-white:            oklch(0.950 0.010 250);
  --pole-red:              oklch(0.650 0.220 22);

  /* El glow solo existe de noche */
  --glow-primary: 0 0 24px oklch(0.680 0.170 258 / 0.45),
                  0 0 64px oklch(0.680 0.170 258 / 0.18);
  --glow-accent:  0 0 24px oklch(0.650 0.220 22 / 0.45),
                  0 0 64px oklch(0.650 0.220 22 / 0.18);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chrome: var(--chrome);
  --color-available: var(--available);
  --color-occupied: var(--occupied);
  --color-pending: var(--pending);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --font-display: "Archivo", ui-sans-serif, system-ui, sans-serif;
  --font-sans: "Inter Tight", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}
```

> Los valores OKLCH son conversiones aproximadas de los hex de las tablas. **Los hex mandan**; si hay diferencia visible, ajusta el OKLCH, no el hex.

### Colores de estado de cita

| Estado | Claro | Oscuro | Uso |
|---|---|---|---|
| `CONFIRMADA` | Azul Poste | Neón Azul | Borde izquierdo de la tarjeta |
| `PENDIENTE` | `--pending` ámbar | ámbar con glow tenue | Punto pulsante |
| `EN_CURSO` | Verde `--available` | verde neón | Anillo animado |
| `COMPLETADA` | Cromo | Cromo Frío | Sin énfasis, opacidad 70 % |
| `CANCELADA` | Rojo Navaja al 60 % | Neón Rojo al 50 % | Texto tachado |
| `NO_ASISTIO` | Rojo Navaja | Neón Rojo | Badge sólido |

---

## 3. Tipografía

Tres roles, tres familias, cada una con un trabajo.

| Rol | Familia | Por qué |
|---|---|---|
| **Display** | **Archivo** (variable, ejes width + weight) | Grotesca de linaje de rotulación norteamericana: es la letra del letrero de la barbería. En ancho expandido y peso 800 grita "BARBERÍA"; en ancho normal se comporta. Se usa **con restricción**: solo títulos de pantalla y números grandes. |
| **Cuerpo** | **Inter Tight** | Legible a 14 px en celular, tracking un poco más cerrado que Inter, lo que le da densidad sin sacrificar lectura. |
| **Datos** | **JetBrains Mono** | Precios, horas, contadores y **el código de respaldo**. Los caracteres ambiguos se distinguen bien, que es un requisito funcional: alguien va a leer ese código en voz alta. De noche, la monoespaciada es la que carga la energía de terminal. |

```
Archivo        →  https://fonts.google.com/specimen/Archivo
Inter Tight    →  https://fonts.google.com/specimen/Inter+Tight
JetBrains Mono →  https://fonts.google.com/specimen/JetBrains+Mono
```

### Escala

| Token | Tamaño / interlínea | Familia | Peso | Tracking | Uso |
|---|---|---|---|---|---|
| `display-xl` | 48 / 44 px | Archivo | 800 exp. | −0.03em | Hora del QR, número de la cita |
| `display-lg` | 34 / 34 px | Archivo | 800 | −0.025em | Título de pantalla |
| `display-md` | 26 / 30 px | Archivo | 700 | −0.02em | Título de sección |
| `title` | 19 / 26 px | Inter Tight | 600 | −0.01em | Nombre de barbero, servicio |
| `body` | 15 / 23 px | Inter Tight | 400 | 0 | Texto general |
| `body-sm` | 13 / 19 px | Inter Tight | 400 | 0 | Secundario |
| `label` | 11 / 14 px | Archivo | 700 | **+0.14em**, MAYÚSCULAS | Etiquetas, eyebrows, badges |
| `data` | 15 / 20 px | JetBrains Mono | 500 | 0 | Precios, horas |
| `data-lg` | 30 / 34 px | JetBrains Mono | 700 | **+0.22em** | Código de respaldo |

**Regla del `label`:** las mayúsculas espaciadas son el eco tipográfico del rótulo de vinilo en la vidriera. Es lo que amarra la tipografía al tema. No las uses en frases largas — máximo 3 palabras.

**Números tabulares obligatorios** en precios, horas y contadores:
```css
.tabular { font-variant-numeric: tabular-nums; }
```

---

## 4. Espacio, radio y elevación

**Rejilla base de 4 px.** Escala: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`.

| Contexto | Valor |
|---|---|
| Padding de pantalla (móvil) | 16 px |
| Padding de pantalla (≥768 px) | 24 px |
| Separación entre tarjetas | 12 px |
| Padding interno de tarjeta | 16 px |
| Alto mínimo de área táctil | **44 px** (sin excepciones) |
| Ancho de contenido máx. | 480 px en móvil, 1200 px en escritorio |

**Radios:** `sm 8px` (chips, badges) · `md 10px` (inputs, botones) · `lg 12px` (tarjetas) · `xl 16px` (hojas y modales) · `full` (avatares y las puntas del poste).

**Elevación.** En `salon` son sombras suaves y frías. En `medianoche` **la sombra no existe**: la jerarquía se hace con luminosidad de superficie y con glow. Es la diferencia clave entre los dos temas.

```css
:root {
  --shadow-sm: 0 1px 2px oklch(0.19 0.02 260 / 0.05);
  --shadow-md: 0 4px 12px oklch(0.19 0.02 260 / 0.07);
  --shadow-lg: 0 12px 32px oklch(0.19 0.02 260 / 0.10);
}
.dark {
  --shadow-sm: none;
  --shadow-md: none;
  --shadow-lg: 0 0 0 1px oklch(0.30 0.025 265);
}
```

---

## 5. Los elementos firma (CSS listo)

### 5.1 La hélice del poste

```css
@property --pole-offset {
  syntax: "<length-percentage>";
  inherits: false;
  initial-value: 0%;
}

.pole {
  --stripe: 14px;
  background: repeating-linear-gradient(
    var(--pole-angle),
    var(--pole-blue)  0px                      var(--stripe),
    var(--pole-white) var(--stripe)            calc(var(--stripe) * 2),
    var(--pole-red)   calc(var(--stripe) * 2)  calc(var(--stripe) * 3),
    var(--pole-white) calc(var(--stripe) * 3)  calc(var(--stripe) * 4)
  );
  background-size: 200% 200%;
  animation: pole-spin var(--pole-speed) linear infinite;
}

@keyframes pole-spin {
  from { background-position: 0 0; }
  to   { background-position: 0 calc(var(--stripe) * -4); }
}

/* Variantes */
.pole--loader { width: 6px;  height: 56px; border-radius: 999px; }
.pole--edge   { width: 4px;  height: 100%; border-radius: 999px 0 0 999px; }
.pole--rule   { height: 2px; width: 100%;  border-radius: 999px; }

.dark .pole { box-shadow: var(--glow-primary); }

@media (prefers-reduced-motion: reduce) {
  .pole { animation: none; }
}
```

### 5.2 El tiquete de cita

```css
.ticket {
  position: relative;
  background: var(--card);
  border-radius: var(--radius-xl);
  isolation: isolate;
}

/* Muescas laterales que separan cuerpo y talón */
.ticket::before,
.ticket::after {
  content: "";
  position: absolute;
  top: var(--stub-y, 68%);
  width: 22px; height: 22px;
  border-radius: 999px;
  background: var(--background);
  z-index: 2;
}
.ticket::before { left: -11px; }
.ticket::after  { right: -11px; }

/* Perforación */
.ticket__perf {
  position: absolute;
  top: var(--stub-y, 68%);
  left: 18px; right: 18px;
  height: 0;
  border-top: 2px dashed var(--border);
  transform: translateY(10px);
}

.dark .ticket {
  border: 1px solid var(--border);
  background:
    radial-gradient(120% 80% at 50% 0%,
      oklch(0.68 0.17 258 / 0.10) 0%, transparent 60%),
    var(--card);
}
```

### 5.3 Superficie de vidrio (solo barra inferior y overlays oscuros)

```css
.glass {
  background: oklch(from var(--card) l c h / 0.72);
  backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid oklch(from var(--border) l c h / 0.6);
}
```

### 5.4 Filo de cromo (bisel metálico, solo en `medianoche`)

```css
.dark .chrome-edge {
  border: 1px solid transparent;
  background:
    linear-gradient(var(--card), var(--card)) padding-box,
    linear-gradient(135deg,
      oklch(0.85 0.02 255) 0%,
      oklch(0.40 0.02 255) 35%,
      oklch(0.78 0.02 255) 60%,
      oklch(0.35 0.02 255) 100%) border-box;
}
```

### 5.5 Degradado espectacular (uso contado: 3 lugares máximo)

Reservado para: encabezado del QR a pantalla completa, pantalla de check-in exitoso, y la portada del portafolio.

```css
.dark .aurora {
  background:
    radial-gradient(60% 40% at 15% 10%, oklch(0.68 0.17 258 / 0.28), transparent 65%),
    radial-gradient(50% 40% at 85% 20%, oklch(0.65 0.22 22 / 0.22), transparent 65%),
    radial-gradient(70% 50% at 50% 100%, var(--reflejo) / 0.16, transparent 70%),
    var(--background);
}
```

### 5.6 Grano (textura, evita el degradado plano)

```css
.grain::after {
  content: "";
  position: absolute; inset: 0;
  pointer-events: none;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

---

## 6. Stack de animación

### 6.1 Paquetes

```bash
npm i motion                    # framer-motion 12.x — ver nota
npm i tw-animate-css@1.3.4
npx shadcn@latest init
```

> **Nota importante sobre `framer-motion` 12.40:** desde la versión 11.12 la librería se publica también como paquete **`motion`**, y en la línea 12.x los imports recomendados son `motion/react`. El paquete `framer-motion` sigue funcionando como alias. Verifica en `npm` la versión exacta disponible al momento de instalar, porque `12.40` puede haber avanzado.
>
> ```ts
> import { motion, AnimatePresence } from "motion/react";        // recomendado
> // import { motion, AnimatePresence } from "framer-motion";    // alias, también válido
> ```

### 6.2 Reparto de responsabilidades

Cada librería tiene un territorio. No se pisan.

| Librería | Territorio | Ejemplos |
|---|---|---|
| **`motion` / framer-motion** | Todo lo que necesite **estado, gesto, orquestación o interrupción** | Transiciones de página, `layoutId` compartido, arrastre de hojas, escalonado de listas, gestos del calendario, la secuencia de éxito del check-in |
| **`tw-animate-css`** | **Entradas y salidas declarativas** de componentes shadcn | `animate-in fade-in slide-in-from-bottom-4`, popovers, tooltips, toasts, dropdowns |
| **CSS puro (patrones tipo `transitions.dev`)** | **3D, perspectiva y efectos ambientales** que no necesitan React | Volteo de tarjeta, tilt en hover, revelados con `clip-path`, el giro del poste, el brillo del cromo |

> **Sobre `transitions.dev`:** funciona como biblioteca de patrones para copiar y adaptar, no como dependencia. Por eso en la sección 8 los patrones que necesitamos están escritos con CSS propio: así el proyecto no depende de nombres de clase externos. Toma de ahí la inspiración y los valores de timing, y pégalos en `globals.css` bajo `@layer utilities`.

### 6.3 Tokens de movimiento

Duraciones y curvas centralizadas. **Nunca escribas un número de duración suelto en un componente.**

```ts
// lib/motion.ts
export const duration = {
  instant: 0.08,
  fast:    0.16,
  base:    0.24,
  slow:    0.4,
  slower:  0.65,
  cinema:  1.1,   // solo momentos firma
} as const;

export const ease = {
  /* Salida rápida, llegada suave. Curva por defecto de la app. */
  standard:   [0.22, 1, 0.36, 1],
  /* Para elementos que entran a escena */
  entrance:   [0.16, 1, 0.3, 1],
  /* Para elementos que salen */
  exit:       [0.4, 0, 1, 1],
  /* Acento con rebote mínimo — botones y chips */
  snap:       [0.34, 1.56, 0.64, 1],
} as const;

export const spring = {
  soft:  { type: "spring", stiffness: 260, damping: 30, mass: 0.9 },
  crisp: { type: "spring", stiffness: 420, damping: 34, mass: 0.7 },
  bouncy:{ type: "spring", stiffness: 500, damping: 22, mass: 0.8 },
} as const;

export const stagger = {
  list:  0.045,
  grid:  0.03,
  steps: 0.09,
} as const;
```

### 6.4 Variantes reutilizables

```ts
// lib/variants.ts
import { Variants } from "motion/react";
import { duration, ease, stagger } from "./motion";

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12, filter: "blur(4px)" },
  animate: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: duration.base, ease: ease.entrance },
  },
  exit: {
    opacity: 0, y: -8, filter: "blur(3px)",
    transition: { duration: duration.fast, ease: ease.exit },
  },
};

export const listContainer: Variants = {
  animate: { transition: { staggerChildren: stagger.list, delayChildren: 0.05 } },
};

export const listItem: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.entrance } },
};

/* Los pasos del agendamiento entran según la dirección de navegación */
export const stepVariants: Variants = {
  initial: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  animate: { opacity: 1, x: 0, transition: { duration: duration.base, ease: ease.standard } },
  exit:    (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40,
             transition: { duration: duration.fast, ease: ease.exit } }),
};

/* Slot de horario disponible */
export const slotVariants: Variants = {
  initial: { opacity: 0, scale: 0.94 },
  animate: { opacity: 1, scale: 1, transition: { duration: duration.fast, ease: ease.snap } },
  tap:     { scale: 0.96 },
};
```

### 6.5 Reglas de movimiento

1. **Nada dura más de 400 ms**, salvo los tres momentos firma de la sección 9.
2. **Solo se animan `transform`, `opacity` y `filter`.** Animar `width`, `height`, `top` o `left` está prohibido.
3. **La dirección tiene sentido**: avanzar entra por la derecha, retroceder por la izquierda. Un modal sube. Un toast baja.
4. **Interrumpible siempre.** Si el usuario toca durante una animación, la animación cede. Los springs de `motion` lo hacen solos; las animaciones CSS no, por eso todo lo interactivo va en `motion`.
5. **Cero animación en bucle** fuera de la hélice y del anillo de "cita en curso". Nada de pulsos decorativos.
6. **Escalonado con techo**: nunca escalones más de 8 elementos. Con listas largas, aplica el `stagger` solo a los primeros 8 y el resto entra de una.

### 6.6 `prefers-reduced-motion`

Obligatorio, no opcional.

```ts
// hooks/use-reduced-motion.ts
import { useReducedMotion } from "motion/react";

export function useMotionSafe() {
  const reduced = useReducedMotion();
  return {
    reduced,
    transition: reduced ? { duration: 0 } : undefined,
  };
}
```

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Con movimiento reducido: los desplazamientos se convierten en fundidos, la hélice se congela (sigue viéndose, deja de girar), y la secuencia de check-in se reduce a un cambio de color directo.

---

## 7. `tw-animate-css` — mapa de uso

Se usa para las entradas y salidas de componentes shadcn, donde no hace falta estado de React.

| Componente | Clases |
|---|---|
| `Dialog` | `data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95` |
| `Sheet` (inferior) | `data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom duration-300` |
| `DropdownMenu` | `animate-in fade-in-0 zoom-in-95 slide-in-from-top-2` |
| `Tooltip` | `animate-in fade-in-0 zoom-in-95 duration-150` |
| `Toast` | `animate-in slide-in-from-bottom-full sm:slide-in-from-right-full` |
| `Popover` (calendario) | `animate-in fade-in-0 slide-in-from-top-1` |
| Skeleton de carga | `animate-pulse` |
| Entrada de tarjeta al montar | `animate-in fade-in slide-in-from-bottom-3 duration-300 fill-mode-both` |
| Escalonado sin JS | `[animation-delay:var(--i)]` con `--i` calculado en el `style` |

---

## 8. Patrones CSS 3D (estilo `transitions.dev`)

Se escriben en `globals.css` dentro de `@layer utilities`.

### 8.1 Perspectiva compartida

```css
@layer utilities {
  .scene { perspective: 1200px; perspective-origin: 50% 40%; }
  .preserve-3d { transform-style: preserve-3d; }
  .backface-hidden { backface-visibility: hidden; }
}
```

### 8.2 Volteo de tarjeta — el tiquete gira para mostrar el QR

```css
.flip { transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1); }
.flip[data-flipped="true"] { transform: rotateY(180deg); }
.flip__face { position: absolute; inset: 0; }
.flip__back { transform: rotateY(180deg); }
```

### 8.3 Tilt en hover — tarjetas de barbero en escritorio

```css
.tilt {
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 0.35s ease;
  will-change: transform;
}
.tilt:hover {
  transform: rotateX(4deg) rotateY(-6deg) translateZ(14px);
}
.dark .tilt:hover { box-shadow: var(--glow-primary); }
```

### 8.4 Revelado con `clip-path` — fotos del portafolio al entrar en viewport

```css
@keyframes reveal-up {
  from { clip-path: inset(100% 0 0 0); transform: scale(1.06); }
  to   { clip-path: inset(0 0 0 0);    transform: scale(1); }
}
.reveal-up {
  animation: reveal-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}
```

### 8.5 Barrido de cromo — botón primario en `medianoche`

```css
.dark .sheen { position: relative; overflow: hidden; }
.dark .sheen::after {
  content: "";
  position: absolute; inset: 0;
  background: linear-gradient(105deg,
    transparent 35%,
    oklch(1 0 0 / 0.22) 50%,
    transparent 65%);
  transform: translateX(-100%);
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.dark .sheen:hover::after { transform: translateX(100%); }
```

### 8.6 Apilado de tarjetas — historial de citas en 3D

```css
.stack > * {
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.stack > *:nth-child(2) { transform: translateY(-8px)  scale(0.96); opacity: 0.7; }
.stack > *:nth-child(3) { transform: translateY(-16px) scale(0.92); opacity: 0.4; }
.stack:hover > *:nth-child(2) { transform: translateY(6px)  scale(0.98); opacity: 0.9; }
.stack:hover > *:nth-child(3) { transform: translateY(12px) scale(0.96); opacity: 0.7; }
```

---

## 9. Los tres momentos firma

Aquí sí se gasta presupuesto de animación. En ningún otro lado.

### 9.1 Confirmación de la cita — "el tiquete se imprime"

Duración total ≈ 1.4 s.

1. La pantalla se oscurece a `medianoche` aunque el usuario esté en `salon` *(el momento es nocturno por diseño)*.
2. El tiquete entra desde abajo con `spring.soft`, como saliendo de una ranura.
3. La perforación se dibuja de izquierda a derecha (`clip-path`, 0.3 s).
4. El QR aparece con `scale 0.8 → 1` y un fundido, con `stagger` de 0.03 s por módulo si se renderiza en SVG *(opcional, muy vistoso)*.
5. El código de respaldo se escribe carácter por carácter en monoespaciada, 60 ms cada uno.
6. La hélice del filo izquierdo arranca a girar.
7. Háptico: un pulso corto (`navigator.vibrate(12)`).

### 9.2 Check-in validado — "el sello"

Duración total ≈ 0.9 s. Es lo que ve el barbero, en el local, con prisa. Tiene que ser inequívoco a un metro de distancia.

1. La pantalla completa se llena de verde `--available` con `scale` desde el punto del escaneo (`clipPath: circle()` expandiéndose).
2. El check entra dibujándose (`pathLength` de 0 a 1 con `motion`, 0.35 s).
3. Nombre del cliente en `display-lg` y servicio debajo, con `stagger` de 0.09 s.
4. Háptico doble. Sonido corto opcional, configurable.
5. Vuelve solo a la agenda a los 2.5 s, con barra de cuenta regresiva.

**El caso de error importa igual o más:** rojo, sin animación juguetona, con el motivo escrito en texto grande (`Ya fue usada · 14:05` / `Fuera de horario · faltan 3 h` / `No existe`) y un botón grande para digitar el código manualmente.

### 9.3 Selección de horario — "la rejilla se llena"

Al elegir la fecha, los slots entran en rejilla con `stagger.grid` de 0.03 s, en orden de lectura. Los ocupados aparecen primero, apagados; los libres entran después con un `snap` mínimo. La diferencia entre libre y ocupado se percibe antes de leer nada.

---

## 10. Inventario de componentes shadcn/ui

```bash
npx shadcn@latest add button card badge avatar input label textarea \
  select dialog sheet drawer tabs calendar popover dropdown-menu \
  form checkbox radio-group switch separator skeleton sonner \
  scroll-area accordion alert alert-dialog tooltip progress \
  carousel command aspect-ratio
```

### Personalizaciones obligatorias

| Componente | Cambio |
|---|---|
| `Button` | Añadir variantes `pole` (fondo hélice, solo CTA principal) y `chrome` (bisel metálico, solo `medianoche`). Alto mínimo 44 px. Clase `.sheen` en la variante primaria oscura. |
| `Card` | Prop `accent` que pinta el filo izquierdo de 4 px con el color de estado de la cita. |
| `Badge` | Usar `label` tipográfico: mayúsculas, tracking `+0.14em`, 11 px. |
| `Calendar` | Días sin cupo en `--occupied` y con `pointer-events: none`. Día seleccionado con la hélice de fondo. Semana empieza en **lunes**. Festivos colombianos marcados con punto rojo. |
| `Skeleton` | En `medianoche`, sustituir el `pulse` por un barrido tipo `.sheen`. |
| `Sonner` | Posición inferior en móvil, sobre la barra de navegación. |
| `Progress` | Reemplazar el relleno sólido por la hélice. |
| `Tabs` | Indicador con `layoutId` de `motion`, no con `transition` CSS. |

### Componentes propios a construir

| Componente | Descripción |
|---|---|
| `<BarberPole />` | La hélice. Props: `variant="loader" \| "edge" \| "rule"`, `speed`, `glow`. |
| `<AppointmentTicket />` | El tiquete con QR, código de respaldo y volteo 3D. |
| `<TimeSlotGrid />` | Rejilla de horarios con estados y escalonado. |
| `<BookingStepper />` | Los 5 pasos con la hélice como barra de progreso. |
| `<QRScanner />` | Vista de cámara con marco de escaneo y línea de barrido. |
| `<BackupCodeInput />` | 6 casillas monoespaciadas, avance automático, pegado desde portapapeles. |
| `<CutGallery />` | Cuadrícula tipo mampostería con revelado `clip-path` y visor a pantalla completa. |
| `<BarberCard />` | Foto, nombre, calificación, especialidades, tilt en escritorio. |
| `<PriceTag />` | Precio en mono tabular, con precio tachado si hay cupón. |
| `<CouponChip />` | Chip con borde troquelado, en miniatura del tiquete. |
| `<EmptyState />` | Ilustración de azulejo de barbería + una acción. |

---

## 11. Pantallas

Móvil primero, 375 px de ancho base. Wireframes en ASCII.

### 11.1 Ingreso

```
┌─────────────────────────────┐
│                             │
│      ▟  [logo navaja]       │   ← tema medianoche fijo, .aurora + .grain
│                             │
│   R E S E R V A   T U       │   ← display-lg, mayúsculas espaciadas
│   S I L L A                 │
│                             │
│   Barberías de Cartagena,   │   ← body, muted
│   sin escribir a WhatsApp.  │
│                             │
│  ┌───────────────────────┐  │
│  │  G   Continuar con    │  │   ← botón blanco, alto 52
│  │      Google           │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │  Usar correo          │  │   ← ghost con borde cromo
│  └───────────────────────┘  │
│                             │
│  ¿Eres barbero? Entra aquí  │   ← link, body-sm
│                             │
│  ║ (hélice girando al pie)  │
└─────────────────────────────┘
```

Al montar: fundido del `.aurora` 0.6 s, luego logo con `spring.soft`, luego el texto con `stagger` 0.09 s, luego los botones. Total 1.1 s. Es la única pantalla con una entrada larga.

### 11.2 Inicio del cliente

```
┌─────────────────────────────┐
│ Hola, Stiven        [avatar]│
│                             │
│ ┃ PRÓXIMA CITA              │  ← filo hélice, tarjeta destacada
│ ┃ Sáb 2 ago · 10:30 a.m.    │  ← mono, tabular
│ ┃ Fade + barba              │
│ ┃ Kevin M. · Barbería Río   │
│ ┃ ┌────────┐ ┌───────────┐  │
│ ┃ │ Ver QR │ │ Reagendar │  │
│ ┃ └────────┘ └───────────┘  │
│                             │
│ ┌─────────────────────────┐ │
│ │   +  Agendar una cita   │ │  ← CTA variante pole
│ └─────────────────────────┘ │
│                             │
│ CERCA DE TI            Ver >│  ← label
│ ┌────┐ ┌────┐ ┌────┐        │  ← carrusel horizontal
│ │ ▨  │ │ ▨  │ │ ▨  │        │
│ └────┘ └────┘ └────┘        │
│                             │
│ INSPIRACIÓN            Ver >│
│ ┌────┐┌────┐┌────┐┌────┐    │  ← cuadrícula de cortes
│ └────┘└────┘└────┘└────┘    │
├─────────────────────────────┤
│ ⌂ Inicio  🔍 Buscar  ▤ Citas │  ← barra .glass
│           👤 Perfil          │
└─────────────────────────────┘
```

### 11.3 Flujo de agendamiento (5 pasos)

Barra de progreso = hélice que avanza. Encabezado fijo con el paso actual.

```
┌─────────────────────────────┐
│ ←   AGENDAR                 │
│ ▨▨▨▨▨▨▨▨░░░░░░░░  3 de 5    │  ← Progress con hélice
├─────────────────────────────┤
│ ELIGE UN HORARIO            │
│                             │
│  L   M   M   J   V   S   D  │  ← selector de fecha deslizable
│  28  29  30  31 [1]  2   3  │
│                             │
│ MAÑANA                      │
│ ┌──────┐┌──────┐┌──────┐    │
│ │ 8:00 ││ 8:45 ││ 9:30 │    │  ← libre: borde primario
│ └──────┘└──────┘└──────┘    │
│ ┌──────┐┌──────┐            │
│ │10:15 ││11:00 │            │
│ └──────┘└──────┘            │
│                             │
│ TARDE                       │
│ ┌──────┐┌──────┐┌──────┐    │
│ │ 2:00 ││░2:45░││ 3:30 │    │  ← ocupado: relleno apagado
│ └──────┘└──────┘└──────┘    │
├─────────────────────────────┤
│ Fade + barba · 45 min       │  ← resumen pegajoso
│ $35.000        [Continuar]  │
└─────────────────────────────┘
```

Los 5 pasos: **Barbería → Servicios → Barbero → Fecha y hora → Confirmar**. Transición entre pasos con `stepVariants`, dirección según avance o retroceso.

### 11.4 El tiquete (pantalla firma)

```
┌─────────────────────────────┐  ← medianoche forzado, .aurora
│  ×                          │
│                             │
│  ┌───────────────────────┐  │
│  │ ┃ CONFIRMADA          │  │
│  │ ┃                     │  │
│  │ ┃  SÁB 2 AGO          │  │  ← display-lg
│  │ ┃  10:30 a.m.         │  │  ← display-xl mono
│  │ ┃                     │  │
│  │ ┃  Fade + barba       │  │
│  │ ┃  Kevin M.           │  │
│  │ ┃  Barbería Río · 45m │  │
│  │ ┃                     │  │
│  │ ┃   ▛▀▀▀▀▀▀▀▀▀▜       │  │
│  │ ┃   ▌ [ QR ]  ▐       │  │  ← blanco puro, 240px
│  │ ┃   ▙▄▄▄▄▄▄▄▄▄▟       │  │
│  ●─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ●  │  ← perforación + muescas
│  │    SI FALLA LA CÁMARA   │  │  ← label
│  │                         │  │
│  │      7 K 4 M 9 X        │  │  ← data-lg, tracking +0.22em
│  │                         │  │
│  └───────────────────────┘  │
│                             │
│  [Guardar]  [Compartir]     │
│                             │
│  El brillo sube solo ☀      │  ← nota body-sm
└─────────────────────────────┘
```

Al abrirse eleva el brillo de pantalla si el navegador lo permite. Tocar el tiquete lo voltea (`.flip`) y muestra la dirección, el mapa y el botón "Cómo llegar".

### 11.5 Escáner del barbero

```
┌─────────────────────────────┐
│ ←  VALIDAR CITA             │
│                             │
│   ┌───┐             ┌───┐   │
│   │                     │   │  ← esquinas del marco en primario
│   │   [vista de cámara] │   │
│   │  ─────────────────  │   │  ← línea de barrido, 2s loop
│   │                     │   │
│   └───┘             └───┘   │
│                             │
│  Apunta al QR del cliente   │
│                             │
│  ┌───────────────────────┐  │
│  │  ⌨  Digitar código    │  │  ← siempre visible, no escondido
│  └───────────────────────┘  │
├─────────────────────────────┤
│ SIGUIENTE: 10:30 · Stiven R.│
└─────────────────────────────┘
```

El botón para digitar el código **nunca se esconde detrás de un menú**. Es el plan B de un local con mala luz y tiene que estar a un toque.

### 11.6 Agenda del barbero

```
┌─────────────────────────────┐
│ HOY · Sáb 2 ago      [Día▾] │
│ 7 citas · $245.000          │  ← mono tabular
├─────────────────────────────┤
│ 8:00 ┃ Carlos P.        ✓   │  ← completada, opacidad 70%
│      ┃ Corte clásico        │
│ ─────┼──────────────────────│
│ 9:00 ┃                      │  ← hueco: fondo rayado sutil
│ ─────┼──────────────────────│
│10:30 ┃ Stiven R.       ◉    │  ← próxima: anillo animado
│      ┃ Fade + barba         │
│      ┃ [Escanear]           │
│ ─────┼──────────────────────│
│11:30 ┃ Andrés M.            │
│      ┃ Barba                │
├─────────────────────────────┤
│      ⬤ Escanear QR          │  ← botón flotante, siempre visible
└─────────────────────────────┘
```

### 11.7 Otras pantallas a diseñar

| Pantalla | Nota de diseño |
|---|---|
| Perfil de barbería | Cabecera con foto a sangre, mapa embebido, catálogo con precios en mono |
| Perfil de barbero | Portafolio en mampostería, calificación con desglose, botón fijo "Agendar con Kevin" |
| Mis citas | Pestañas Próximas / Historial. El historial usa `.stack` en 3D |
| Cancelar cita | `AlertDialog` con la política visible y el costo de cancelar tarde |
| Reagendar | Reutiliza el paso 4 del agendamiento, con la hora original marcada |
| Cupones | Chips troquelados, los vencidos en escala de grises |
| Búsqueda | Mapa arriba, lista abajo, hoja arrastrable entre ambos |
| Panel admin | Escritorio primero, tablas densas, la tipografía mono carga los números |
| Estados vacíos | Azulejo de barbería como textura + una sola acción |

---

## 12. Voz y textos

- **Tuteo, español colombiano neutro.** Nada de "usted" ni de "¡Genial!".
- **Sentence case** en botones y títulos de contenido. **MAYÚSCULAS** solo en el estilo `label`.
- **El verbo del botón se repite en la confirmación.** Si dice "Agendar", el toast dice "Agendada".
- **Los errores no piden disculpas** y dicen qué hacer:
  - ❌ "Ups, algo salió mal 😅"
  - ✅ "No se pudo agendar: ese horario se acaba de ocupar. Estos quedan libres:"
- **Los estados vacíos invitan:**
  - ❌ "No tienes citas."
  - ✅ "Todavía no tienes citas. Mira quién está disponible hoy."
- **Precios siempre en pesos con punto de miles:** `$35.000`. Nunca `35000` ni `$35.000,00`.
- **Horas en formato de 12 h con a.m./p.m.**, que es como se lee en Colombia.
- **Duraciones en minutos** hasta 90; de ahí en adelante, `1 h 45 min`.

---

## 13. Calidad mínima

- Contraste **AA**: 4.5:1 en texto normal, 3:1 en texto grande y en bordes de controles. Verificar sobre todo el Cromo Frío sobre Asfalto en `medianoche`.
- **Foco visible** con anillo de 2 px en `--ring` y 2 px de separación. Nunca `outline: none` sin reemplazo.
- Navegación completa por teclado en el flujo de agendamiento.
- Área táctil mínima **44 × 44 px**.
- El QR se renderiza con **corrección de error nivel Q** y margen blanco de 16 px, para que escanee incluso con la pantalla rayada o sucia.
- El color nunca es el único portador de información: cada estado de cita lleva además icono y texto.
- `prefers-reduced-motion` respetado en todo.
- Presupuesto: LCP < 2.5 s en 4G. Las fuentes se cargan con `font-display: swap` y solo los pesos que se usan (Archivo 700/800, Inter Tight 400/600, JetBrains Mono 500/700).

---

## 14. Prompt para Claude Design

Copia esto tal cual y adjunta este documento:

```
Diseña el preview de una app web de agendamiento para barberías en Cartagena,
Colombia. Móvil primero, 375 px.

Usa EXACTAMENTE el sistema de diseño del documento adjunto: los hex de la
sección 2, las tres familias tipográficas de la sección 3 y el elemento
firma de la sección 1 (la hélice del poste de barbero a 63°).

Entrega estas 6 pantallas:
1. Ingreso (tema medianoche)
2. Inicio del cliente (tema salon)
3. Paso 4 del agendamiento: selección de fecha y hora (tema salon)
4. El tiquete de cita con QR y código de respaldo (tema medianoche)
5. Escáner del barbero (tema medianoche)
6. Agenda del día del barbero (tema salon)

Requisitos:
- React + Tailwind + shadcn/ui.
- Animación con `motion` (framer-motion 12.x) para transiciones y gestos,
  `tw-animate-css` para entradas de componentes, y CSS puro para el 3D.
- La hélice aparece solo en los 4 lugares que indica el documento.
- El tiquete debe verse como un objeto físico: troquel, muescas y talón.
- El código de respaldo en JetBrains Mono, 30 px, tracking +0.22em.
- Textos reales en español colombiano, no lorem ipsum. Usa nombres como
  Kevin M., Stiven R., Barbería Río. Precios reales: $25.000 corte,
  $35.000 fade + barba, $15.000 barba.
- Contraste AA y `prefers-reduced-motion` respetado.

No uses: degradados morado-rosa decorativos, glassmorphism fuera de la barra
inferior, fondo crema con serif y acento terracota, ni marcadores 01/02/03
salvo en el stepper del agendamiento.
```

---

## 15. Orden de construcción

| Paso | Qué |
|---|---|
| 1 | `globals.css` con los dos temas, `@theme inline`, fuentes cargadas |
| 2 | `lib/motion.ts` y `lib/variants.ts` |
| 3 | Utilidades de la sección 5 y patrones 3D de la sección 8 |
| 4 | Instalar shadcn y aplicar las personalizaciones de la sección 10 |
| 5 | `<BarberPole />` — todo el sistema visual depende de ella |
| 6 | Conmutador de tema con persistencia y `color-scheme` correcto |
| 7 | Página de galería en `/design-system` con todos los tokens y componentes |
| 8 | Pantallas, en el orden de la sección 11 |
| 9 | Los tres momentos firma de la sección 9 |
| 10 | Auditoría: contraste, foco, teclado, movimiento reducido, Lighthouse |

> El paso 7 no es opcional. Una página que muestre todos los tokens y componentes en ambos temas es lo que evita que el agente de código improvise colores nuevos a mitad del proyecto.

---

*Documento vivo. Cuando llegue la referencia visual que estás buscando, se contrasta contra la sección 1 y se ajusta la dirección antes de tocar los tokens.*
