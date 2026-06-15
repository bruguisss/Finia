---
name: Finia
description: App de finanzas personales — extracto bancario nocturno, minimalista y preciso
colors:
  base: "#000000"
  surface: "#0F0F0F"
  elevated: "#1A1A1A"
  muted: "#242424"
  border: "rgba(255,255,255,0.1)"
  border-hover: "rgba(255,255,255,0.2)"
  primary: "#FFFFFF"
  secondary: "#8A8A8A"
  tertiary: "#555555"
  accent: "#FFFFFF"
  accent-hover: "#E5E5E5"
  accent-dim: "#B0B0B0"
  success: "#00D4A8"
  danger: "#FF4D4D"
  warning: "#FFAA00"
typography:
  title:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.02em"
  stat:
    fontFamily: "ui-monospace, SF Mono, SFMono-Regular, Menlo, monospace"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.03em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  2xl: "24px"
  3xl: "28px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.base}"
    rounded: "{rounded.md}"
    padding: "6px 14px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.base}"
    rounded: "{rounded.md}"
    padding: "6px 14px"
  button-secondary:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "16px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
---

# Design System: Finia

## 1. Overview

**Creative North Star: "El Extracto Nocturno" (The Midnight Statement)**

Finia se siente como el extracto de una cuenta premium abierto a medianoche: lienzo en
negro absoluto, números alineados con precisión quirúrgica, y un único acento — blanco
puro — reservado para la acción principal de cada pantalla. La densidad de información
es alta (tablas, listas, gráficas) pero el ruido visual es casi nulo: sin gradientes,
sin tarjetas-métrica decorativas, sin iconografía genérica de "dashboard de IA". Donde
el sistema se permite un momento de lujo es en la navegación móvil y el botón flotante:
ahí, y solo ahí, aparece vidrio translúcido — un guiño táctil, no decoración gratuita.

El sistema rechaza explícitamente las plantillas genéricas de "dashboard de IA"
(tarjetas con gradiente, glassmorphism decorativo por todas partes, grids de tarjetas
idénticas, bordes laterales de color, eyebrows en mayúsculas, numeración 01/02/03).

**Key Characteristics:**
- Negro absoluto como lienzo; nunca negro "casi puro" con tinte de color.
- Un solo acento real: blanco puro, usado con moderación (CTAs primarios).
- Verde menta / coral para signos financieros (positivo/negativo), nunca para decoración.
- Vidrio translúcido como excepción deliberada, limitado a la navegación móvil flotante.
- Tipografía Inter para todo el texto; monoespaciada tabular para cifras.

## 2. Colors

Paleta casi monocroma — negro, blancos y grises — con dos acentos semánticos
(verde/coral) reservados estrictamente para signo de cantidades, y un tercero (ámbar)
para avisos.

### Primary
- **Blanco Puro** (#FFFFFF): texto principal, iconografía activa, y fondo de los
  botones de acción primaria (`bg-accent text-base`). Es el único "color" que el
  sistema trata como acento — su escasez es la regla.

### Secondary
- **Verde Menta** (#00D4A8): importes positivos / ingresos / estados "success". Solo
  aparece junto a una cifra o indicador de tendencia, nunca como fondo decorativo.
- **Coral de Alerta** (#FF4D4D): importes negativos / gastos / estados "danger". Mismo
  principio: siempre ligado a un dato, nunca decorativo.

### Tertiary
- **Ámbar** (#FFAA00): avisos de presupuesto / estados "warning" puntuales (ej.
  `AlertBanner`).

### Neutral
- **Negro Absoluto** (#000000): `base` — fondo de `html`, `body` y `#root` en todo
  momento, incluso durante estados de carga.
- **Carbón** (#0F0F0F): `surface` — fondo de tarjetas, filas de tabla, paneles.
- **Carbón Elevado** (#1A1A1A): `elevated` — modales y superficies por encima de las
  tarjetas; también el color del skeleton de carga.
- **Grafito** (#242424): `muted` — fondo de inputs y botones secundarios.
- **Línea Fantasma** (`rgba(255,255,255,0.1)`): `border` — separadores y bordes de
  tarjeta en reposo.
- **Línea Fantasma Activa** (`rgba(255,255,255,0.2)`): `border-hover` — borde al pasar
  el ratón o al enfocar.
- **Gris Niebla** (#8A8A8A): `secondary` — texto secundario, labels, iconografía
  inactiva.
- **Gris Pizarra** (#555555): `tertiary` — hover de botones `muted`.
- **Blanco Apagado** (#E5E5E5) / **Gris Plata** (#B0B0B0): `accent-hover` /
  `accent-dim` — variantes del acento blanco para hover y para texto/iconos con
  énfasis sutil.

### Named Rules
**La Regla del Acento Único.** El blanco puro (#FFFFFF) es el ÚNICO color no-semántico
del sistema. Si algo necesita "destacar" y no es un CTA primario ni un dato
positivo/negativo/de aviso, destaca con tipografía o espaciado, nunca con un nuevo
color.

**La Regla del Vidrio Excepcional.** `backdrop-blur` + transparencia solo aparecen en
la navegación móvil flotante (isla inferior y FAB). En cualquier otro componente —
tarjetas, modales, inputs — las superficies son opacas y planas.

## 3. Typography

**Body Font:** Inter (con fallback a `-apple-system, BlinkMacSystemFont, system-ui,
sans-serif`)
**Label/Mono Font:** pila `ui-monospace` (SF Mono / Menlo) para cifras tabulares

**Character:** Inter en pesos 400-800 cubre toda la jerarquía — desde labels en
mayúsculas hasta títulos de página — sin necesitar una segunda familia display. Las
cifras grandes (totales, stats) cambian a la pila monoespaciada para que los dígitos
se alineen verticalmente entre tarjetas.

### Hierarchy
- **Title** (600, 20px / `text-xl`, `tracking-tight` -0.025em): títulos de página y de
  modal (`<h2>`).
- **Heading** (500-600, 14px, `tracking-heading` -0.01em): cabeceras de sección
  (`<h3>`).
- **Body** (400-500, 13-14px, normal): texto de tablas, filas, formularios. Línea
  máxima implícita por el ancho de columna/tarjeta, no por `ch`.
- **Stat** (600, 28px, `tracking-stat` -0.03em, mono tabular): cifras protagonistas en
  `StatCard` y totales de dashboard.
- **Label** (500, 11px, `tracking-badge` +0.02em, uppercase): etiquetas de categoría,
  badges de tendencia, labels de formulario.

### Named Rules
**La Regla del Mono Tabular.** Cualquier cifra que se compare visualmente con otra
(listas de transacciones, totales, presupuestos) usa `tabular-nums` — Inter para el
texto, mono para el número, nunca al revés.

## 4. Elevation

Sistema plano por defecto: la profundidad se transmite con `border` (Línea Fantasma) y
diferencias sutiles de luminosidad entre `base` → `surface` → `elevated`, no con
sombras. La única excepción es la capa de navegación flotante en móvil (isla inferior y
FAB), que usa sombra + blur para leerse como un objeto físico sobre el contenido.

### Shadow Vocabulary
- **Separador de panel** (`box-shadow: 4px 0 24px -12px rgba(0,0,0,0.7)`): separa el
  sidebar de escritorio del contenido sin añadir un borde visible.
- **Flotante (nav / FAB)** (`box-shadow: 0 8px 32px rgba(0,0,0,0.35)` /
  `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 0 rgba(255,255,255,0.1)`): eleva la isla de
  navegación y el FAB sobre el contenido; el `inset` superior simula el borde
  iluminado de un cristal.

### Named Rules
**La Regla de lo Plano por Defecto.** Las tarjetas, modales e inputs no tienen sombra.
Si un elemento "necesita destacar", sube de `surface` a `elevated` o añade un borde
`border-hover`, no una sombra.

## 5. Components

### Buttons
- **Shape:** `rounded-md` (8px) en botones de acción; `rounded-2xl`/`rounded-3xl`
  (16-28px) solo en la navegación flotante móvil.
- **Primary:** `bg-accent text-base` (blanco sobre negro), `px-3.5 py-1.5`, peso 600,
  13px. Es la única superficie donde el blanco actúa como fondo.
- **Secondary / Muted:** `bg-muted` (#242424) con texto `text-primary`, hover a
  `tertiary` (#555555).
- **Hover / Focus:** transición de 150ms en color/fondo/borde; `:active` aplica
  `scale(0.97)`. El foco visible (`outline: 2px solid #FFFFFF`) solo se muestra en
  dispositivos con ratón/teclado (`@media (hover: hover) and (pointer: fine)`); en
  táctil no hay outline ni highlight de tap.

### Cards / Containers
- **Corner Style:** `rounded-lg` (12px).
- **Background:** `bg-surface` (#0F0F0F), borde `border-border`
  (`rgba(255,255,255,0.1)`).
- **Shadow Strategy:** ninguna (ver Elevation — plano por defecto).
- **Hover:** `border-border-hover` (`rgba(255,255,255,0.2)`), transición 150ms.
- **Internal Padding:** `p-4` (16px) en stats, `p-5` (20px) en tarjetas de contenido.

### Inputs / Fields
- **Style:** `bg-surface` o `bg-muted`, `border border-border`, `rounded-lg` (12px),
  texto 14px.
- **Focus:** `border-white/30`, sin halo ni `box-shadow` adicional — el cambio de
  borde es la única señal de foco.

### Navigation
- **Desktop:** sidebar fijo de 240px (`w-60`), fondo `bg-base` (igual que el lienzo),
  separado del contenido solo por el "Separador de panel" (sombra, sin borde). Item
  activo se distingue por color de texto/icono, no por fondo.
- **Mobile (signature component):** isla flotante inferior, `rounded-3xl`,
  `bg-[rgba(28,28,32,0.45)]` + `backdrop-blur-2xl backdrop-saturate-150` + borde
  `border-white/[0.12]` + sombra flotante. El item activo añade `bg-white/[0.12]`,
  `backdrop-blur-[20px]`, borde `border-white/[0.18]` y `rounded-2xl`; los inactivos
  son `text-white/45` sin fondo. El FAB replica el mismo lenguaje de vidrio en un
  círculo de 56px (`w-14 h-14 rounded-full`).

## 6. Do's and Don'ts

### Do:
- **Do** mantener `html`, `body` y `#root` en `#000000` en todo momento, incluso
  durante estados de carga — nunca debe verse un flash blanco entre páginas.
- **Do** usar `tabular-nums` / la pila monoespaciada para cualquier cifra que se
  compare con otra en la misma vista.
- **Do** reservar el blanco puro (#FFFFFF) como único acento no-semántico; verde menta,
  coral y ámbar solo para signo financiero o aviso.
- **Do** mantener las tarjetas planas (`border`, sin `box-shadow`); el vidrio
  (`backdrop-blur`) es exclusivo de la navegación móvil flotante.
- **Do** ocultar el `outline` de foco en dispositivos táctiles y mostrarlo solo bajo
  `(hover: hover) and (pointer: fine)`.

### Don't:
- **Don't** usar plantillas genéricas de "dashboard de IA": tarjetas con gradiente,
  hero-metric con stat gigante + gradiente, grids de tarjetas idénticas.
- **Don't** usar `border-left`/`border-right` de más de 1px como acento de color en
  tarjetas, filas o alertas.
- **Don't** usar `background-clip: text` con gradiente para textos o títulos.
- **Don't** añadir glassmorphism decorativo fuera de la navegación móvil flotante.
- **Don't** usar eyebrows en mayúsculas con tracking ancho ni numeración 01/02/03 como
  scaffolding de secciones.
- **Don't** combinar `border: 1px solid` + `box-shadow` de blur ≥16px en el mismo
  elemento ("ghost card").
- **Don't** usar `border-radius` ≥32px en tarjetas o inputs; el máximo para tarjetas es
  16px, y 24-28px solo para la navegación flotante.
