# Contexto del proyecto — calculadora de notas chilena mobile-first

> Documento vivo. Cada iteración de producto se refleja primero acá, antes de pasar a implementación.
> Última actualización: 24 de abril de 2026 (v0.2.1 — Promedio ponderado + edición de ramo + escalas guardadas).
> Nombre del producto: **Compañero de Notas** (placeholder iterable).

## Tabla de contenidos

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Público objetivo](#2-público-objetivo)
3. [Análisis competitivo](#3-análisis-competitivo)
4. [Diferenciales y estrategia](#4-diferenciales-y-estrategia)
5. [Modelo de monetización](#5-modelo-de-monetización)
6. [Arquitectura del producto](#6-arquitectura-del-producto)
7. [Sistema de diseño](#7-sistema-de-diseño)
8. [Idioma y locale](#8-idioma-y-locale)
9. [Módulos — especificaciones detalladas](#9-módulos--especificaciones-detalladas)
10. [Algoritmos y fórmulas](#10-algoritmos-y-fórmulas)
11. [Persistencia y storage](#11-persistencia-y-storage)
12. [Stack técnico](#12-stack-técnico)
13. [Roadmap](#13-roadmap)
14. [Principios de UX](#14-principios-de-ux)
15. [Decisiones pendientes](#15-decisiones-pendientes)
16. [Referencias externas](#16-referencias-externas)
17. [Estado de implementación](#17-estado-de-implementación)

---

## 1. Resumen ejecutivo

**Qué es**: PWA instalable para iOS/Android/desktop, con modelo free + banner ads discretos + premium one-time. Convierte puntajes a notas en la escala chilena (1,0 a 7,0), calcula promedios semestrales ponderados o simples, y responde la pregunta clave del estudiante: "¿qué necesito sacar en la final para quedar con X?".

**Para quién**: estudiantes chilenos de 5° básico a universidad, con expansión planificada hacia postulantes a PAES/NEM y docentes.

**Por qué ahora**: el ecosistema actual de calculadoras chilenas tiene UX móvil pésima, ads invasivos y branding amateur. El calendario PAES 2027 abre una ventana de activación clara (PAES Regular el 30 de noviembre, 1 y 2 de diciembre de 2026, postulación centralizada en enero 2027).

**Diferencial clave**: UX móvil con la nota como hero visual + identidad cultural chilena genuina (papel roneo + azul lápiz pasta) + features únicos (simulador "¿bajar escala?", validador de nota, modo edufísica).

---

## 2. Público objetivo

Cinco perfiles identificados, con distinta prioridad por versión:

| Perfil | Descripción | Prioridad |
|---|---|---|
| Estudiante básica | 5° a 8° básico | MVP v0.1 |
| Estudiante media | 1° a 4° medio | MVP v0.1 |
| Universitario | universidad o IP | MVP v0.1 |
| Postulando a U | 4° medio o egresado con PAES/NEM | v0.3 |
| Docente | profesor o ayudante con escalas/batch | v0.2 |

El onboarding muestra las 5 opciones desde el día 1. Los perfiles aún no implementados ("Postulando a U" en MVP, por ejemplo) llevan badge "PRONTO" y capturan email para avisar cuando estén listos.

**Hipótesis de uso**:
- Estudiantes: dark mode, uso nocturno, alta frecuencia pre-prueba.
- Profesores: light mode, uso diurno, alta frecuencia fin de semestre.
- El producto respeta el tema del sistema operativo como default.

---

## 3. Análisis competitivo

### escaladenotas.cl (Juan Pumarino)

- Referente histórico. 6,75 millones de visitas anuales en 2017.
- Stack Sinatra/Ruby. UX de 2008.
- Ads invasivos en producción (banner Adobe + 2 cuadrados + popup lateral + rascacielos).
- La app móvil fue **descontinuada**: vendía menos de 10 unidades al año, no cubría los USD 99 anuales de Apple.
- **Lección**: app nativa con modelo pago upfront no es viable en este nicho.

### Chalalo (app móvil "Escala de Notas")

- Modelo: free + banner ads. Sobrevive hace años.
- Features útiles: "Escalas Registradas" (guardado de presets), "Cálculo Promedio" (con toggle "¿Doy examen?"), export PDF.
- Problemas UX graves:
  - Tabla de resultados escondida bajo scroll
  - Contraste roto en dropdowns
  - Iconografía confusa (toggle "ver en 2 columnas" con ícono de pausa)
  - Color picker HSV completo como over-engineering
  - Branding amateur ("By Chalalo" con avatar de vampiro)
- **Lección**: el modelo free + ads discretos sí funciona, pero la UX actual deja espacio amplio para competir.

### calculadoradenotas.cl

- Competidor web más completo: tabs para Escala, Conversor, NEM, PAES, Egreso, Blog.
- Cubre el módulo inverso ("Nota Necesito") que yo pensaba era diferencial — no lo es.
- Estética claramente IA-generada (amarillo/verde Bootstrap).
- Saturado de ads: dos rascacielos laterales de Mercado Libre + banner sticky inferior.
- Sin jerarquía entre tabs: 7 pestañas de igual peso.
- Estrategia SEO con blog de captación orgánica.
- **Lección**: tenemos que igualar en features básicos (promedio, meta, NEM, PAES) y ganar por UX móvil y por identidad visual.

---

## 4. Diferenciales y estrategia

Cuatro palancas de diferenciación:

1. **UX móvil con la nota como hero visual** (resuelve el error común de Chalalo y Pumarino)
2. **Identidad cultural chilena genuina**:
   - Dark mode moderno con azul eléctrico (estudiante nocturno)
   - Light mode "papel roneo" con azul lápiz pasta (profesor diurno)
   - Vocabulario real: "Prueba coef 2", "si sacas un 2,0", "me saqué un azul"
3. **Features únicos**:
   - Simulador "¿me conviene pedir bajar la escala?" (dos escalas lado a lado)
   - Validador de nota con desglose matemático
   - Modo edufísica (tiempos → notas)
4. **Microcopy honesto**: estados como "ALCANZABLE / EXIGENTE / IMPOSIBLE / ASEGURADO" en vez del binario típico "alcanzable / imposible".

---

## 5. Modelo de monetización

**Free tier**:
- Tier 1 completo (Escala + Promedio + Meta)
- Banner ad discreto al pie, **nunca entre inputs y resultados**
- Sin popups ni interrupciones

**Premium one-time CLP $2.990**:
- Tier 2 completo (simulador, validador, edufísica, dashboard multi-ramo)
- Temas adicionales
- Sin ads

**Justificación del precio**: barrera psicológica sub-$3.000 sin parecer regalado. Referencia mental del usuario: el precio de un café específico. Múltiplo que permite promociones fuertes ("50% off inicio de semestre" → $1.490).

**Decisiones explícitas**:
- NO suscripción (uso estacional del producto)
- NO App Store de Apple día 1 (costo anual prohibitivo vs volumen esperado)
- SÍ Google Play vía TWA + PWA instalable
- SÍ landing web con SEO

**Justificación del modelo one-time**: respeta que el uso tiene picos (fin de semestre, PAES) y no justifica suscripción mensual. Los ads se perciben como "precio justo por la función básica", el premium se percibe como "más herramienta", no como rescate del castigo.

---

## 6. Arquitectura del producto

### Tier 1 — MVP (v0.1)

- Módulo **Escala** (calculadora puntaje → nota)
- Módulo **Promedio** (aritmético simple + ponderado opcional)
- Módulo **Meta** (calculadora inversa, nota objetivo → qué necesito)
- **Onboarding** 2 pasos
- Persistencia localStorage

### Tier 2 — Diferenciadores (v0.2)

- Simulador comparativo "¿bajar escala?"
- Validador de nota con explicación
- Modo edufísica (tiempos → notas)
- Dashboard multi-ramo en Promedio
- Meta: modo "ajustar individualmente" para múltiples pendientes
- Modo profesor con batch y export PDF
- Premium tier (unlock + sin ads)

### Tier 2.5 — PAES/NEM (v0.3)

- Módulo PAES/NEM/Egreso
- Gestor de múltiples rendiciones
- Simulador de carreras con Compendio DEMRE (ponderaciones anuales)
- Comparador con puntajes de corte históricos

### Tier 3 — Ampliación (v1.0+)

- Publicación en Google Play vía TWA
- Landing web con artículos SEO
- Export/import JSON
- Compartir escala por URL (zero-storage, marketing viral)
- Compartir captura "tu nota explicada" para WhatsApp

### Trampas a evitar (explícitamente descartadas)

- Cuentas con login y sync cross-device (localStorage alcanza hasta decenas de miles de usuarios)
- Rúbricas personalizadas (imposible universalizar sin perder foco)
- Integración con NAPSIS/Colegium/Webclass (requiere convenios institucionales)
- Color picker HSV completo (over-engineering tipo Chalalo)
- Asistente IA tutor (moda que no resuelve el problema real)

---

## 7. Sistema de diseño

### Paletas

#### Dark mode (estudiante, noche, moderno)

| Token | Valor |
|---|---|
| `bg-primary` | `#0A1220` |
| `bg-secondary` (cards) | `rgba(255,255,255,0.035)` |
| `bg-tertiary` (device frame) | `#000000` |
| `text-primary` | `rgba(255,255,255,0.92)` |
| `text-secondary` | `rgba(255,255,255,0.45)` |
| `text-tertiary` | `rgba(255,255,255,0.30)` |
| `accent-primary` (aprobación, azul eléctrico) | `#1F7FFF` |
| `accent-danger` (reprobación) | `#FF7A7A` |
| `accent-warning` (exigente) | `#E09A3D` (derivado ámbar para dark) |
| `border-subtle` | `rgba(255,255,255,0.08)` |

#### Light mode (profesor, día, clásico "papel roneo")

| Token | Valor |
|---|---|
| `bg-primary` (papel roneo) | `#F1E9D4` |
| `bg-secondary` (cards elevadas) | `#E8DEC5` |
| `bg-tertiary` (device frame, "cuero") | `#2A2420` |
| `text-primary` (tinta oscura) | `#3A2C1C` |
| `text-secondary` | `#6D5B44` |
| `text-tertiary` | `#8A755A` |
| `text-muted` | `#A89070` |
| `accent-primary` (azul lápiz pasta) | `#1A3A6E` |
| `accent-danger` (rojo sello) | `#8F2E2A` |
| `accent-warning` (ámbar exigente) | `#A86B0B` |
| `border-subtle` | `rgba(58,44,28,0.10)` |
| `border-emphasis` | `rgba(58,44,28,0.20)` |

**Coherencia cromática del sistema**: el par azul/rojo corresponde al código escolar chileno histórico ("me saqué un azul" / "me salvé de sacar un rojo"). Cada color tiene un gemelo cross-modo: el azul eléctrico del dark es la versión contemporánea del azul lápiz pasta del light; el coral del dark es la versión moderna del rojo sello del light. Mismo rol funcional, distinto registro temporal.

**Accesibilidad**: contraste medido. `#3A2C1C` sobre `#F1E9D4` da ratio ~9.8:1 (AAA). `#6D5B44` sobre `#F1E9D4` da ~4.6:1 (AA, apenas). Ajustar secundario si se requiere holgura.

### Tipografía

- **Sans primaria (UI general)**: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. Evaluar en producción: Inter, Manrope, Figtree.
- **Serif hero (nota grande en light mode)**: `'Palatino Linotype', 'Book Antiqua', Palatino, 'URW Palladio L', Georgia, serif`.
- **Serif alternativa premium**: Fraunces (Google Fonts, vía jsdelivr fontsource si se decide incorporar).
- **Mono (Courier)**: **descartado**. Referencia cultural demasiado nicho — pocos docentes jóvenes reconocen el mimeógrafo.

### Pesos tipográficos

Solo dos: **400 regular** y **500 bold**. No usar 600 ni 700.

### Tamaños (hero de nota)

- Módulo Escala: 78 – 92 px
- Módulo Promedio: 68 – 76 px
- Módulo Meta (hero resultado): 62 – 76 px
- Números en listas de evaluaciones: 17 – 20 px
- Número secundario (meta, input): 20 – 24 px

### Radios

- `--radius-md`: 8 px (botones, inputs)
- `--radius-lg`: 12 px (cards)
- `--radius-xl`: 14 – 20 px (sheets, device frames)
- Pills/badges: 999 px

### Componentes reutilizables

- **Card de evaluación**: bg secondary, border subtle, padding 10-12px, radius-md
- **Badge de estado**: pill con bg acento al 12% de opacidad + texto acento 100%
- **Card de ramo (superior)**: bg secondary, padding 10-14px, radius-lg, indicador de estado en mini-summary
- **Slider**: accent-primary, track 4px, thumb 14px circular
- **Bottom sheet**: overlay oscuro + sheet con border-radius-top, handle dragger de 36×4px, shadow superior sutil
- **Chip selector**: pill bg secondary para no seleccionado, pill bg accent-primary + text light para seleccionado
- **Tab/botón en estado "próximamente"**: tratamiento visual disabled que evoca el patrón OS (macOS/Windows) — opacity ~0.45, color `text-tertiary`, sin hover state activo, cursor normal (no pointer). Sin etiqueta "PRONTO" persistente que robe espacio. `aria-disabled="true"` pero el elemento sí es clickeable: al tap abre la pantalla "Próximamente" (§9.6) en vez de navegar a la ruta. Patrón aplica a la tab Meta en v0.2.0 y a perfiles no implementados en el onboarding (§9.5).

#### Gotcha de transparencia con `--bg-secondary` en dark mode

En dark mode `--bg-secondary` es `rgba(255,255,255,0.035)` — un overlay casi-transparente diseñado para sumarse sobre `--bg-primary` y dar textura sutil. **Sirve perfecto como overlay**, pero **no como tapa opaca**: si un componente con `background: var(--bg-secondary)` tiene un elemento con color saturado por detrás (típicamente `position: absolute` con bg de acento), ese elemento se transparenta a través del card.

Síntoma encontrado en v0.2.0 con `CardEvaluacion`: la franja roja de "Eliminar" (delete-bg absolute) se veía a través del card aunque `translateX = 0`.

Solución estándar — doble background:

```css
.card {
  background-color: var(--bg-primary);
  background-image: linear-gradient(var(--bg-secondary), var(--bg-secondary));
}
```

Cuándo aplicarla: cualquier componente que (a) use `--bg-secondary` como base y (b) tenga elementos hermanos con `position: absolute` (o uno-arriba-del-otro vía z-index) con bg coloreado. En light mode no hace falta (`--bg-secondary` es opaco) pero la doble capa renderiza idéntico en ambos modos, así que se puede aplicar como default sin pensarlo.

Auditoría v0.3.0: el caso real es raro. Hoy sólo `CardEvaluacion` lo tiene; todos los demás cards/sheets usan `--bg-primary` opaco (BottomSheet, Modal de PantallaProximamente) o son overlays intencionales sobre bg-primary (`.card-params`, `.params-panel`, `.item` de ListaRamos). Documentado acá para no redescubrirlo en v0.4.0+.

---

## 8. Idioma y locale

### Tuteo chileno estricto — NO voseo argentino

**Correcto** (tuteo chileno):
- tú quieres, tú sacas, tú tienes, tú puedes, tú sabes
- mueve, sube, saca, quiere, cambia

**Incorrecto** (voseo argentino — NUNCA):
- vos querés, vos sacás, vos tenés, vos podés, vos sabés
- mové, subí, sacá

Esta regla aplica a todo microcopy, placeholder, botón, estado y mensaje de error del producto.

### Formato decimal

- **Coma** por defecto en ambos modos (dark y light). Ejemplo: `5,1`, no `5.1`.
- **Punto** disponible solo en Ajustes → Formato regional, para usuarios fuera de Chile.
- **Siempre 1 decimal en notas**. Los inputs de configuración de escala, los campos de agregar evaluación y el display de notas muestran siempre 1 decimal (ej. `7,0`, `4,0`, `5,1` — nunca `7`, `4` o `5`). Convención chilena: un profesor escribe "7,0" en la prueba, no "7". No aplica al puntaje, que es entero.

### Moneda

- CLP con símbolo `$` sin decimales. Ejemplo: `$2.500`.

### Formato de fecha

- DD/MM/YYYY o "23 de abril de 2026" según contexto.

### Tono del microcopy

- Directo, cálido, sin relleno corporativo.
- Sin diminutivos excesivos ("notita", "rampito").
- Humor chileno sutil si aplica, nunca regionalismos duros que pierdan universalidad.
- Nunca abrir con "¡Bienvenido a nuestra increíble app!" ni cerrar con "¡Gracias por usar [nombre]!".

---

## 9. Módulos — especificaciones detalladas

### 9.1 Módulo Escala

**Propósito**: convertir puntaje → nota, ver tabla completa de la escala activa.

**Layout principal (mobile, 320px)**:

```
┌──────────────────────────┐
│ [status bar]             │
│ Escala activa       ⌥    │
│                          │
│ [card: Prueba de Historia│ ← tap abre bottom sheet
│  32 pts · 60% · 2,0–7,0 ›│   de parámetros
│ ]                        │
│                          │
│        TU NOTA           │
│         5,1              │ ← hero, serif grande
│       [APROBADO]         │ ← badge estado
│                          │
│ Puntaje obtenido    24   │
│ [=========●=====]        │ ← slider
│ 0               32       │
│                          │
│   ↑ ver tabla completa   │ ← swipe up
│                          │
├──────────────────────────┤
│ [▣Escala] Σ Promedio ◎Meta│ ← tab bar
└──────────────────────────┘
```

**Bottom sheet de parámetros** (abre con tap en card superior o con ⌥):

- Sección "Puntaje":
  - Puntaje máximo (input numérico entero, default 50)
  - Exigencia (input % o slider, default 60%)
- Sección "Notas":
  - Nota mínima (input, default 2,0; alternativa histórica 1,0)
  - Nota aprobación (input, default 4,0)
  - Nota máxima (input, default 7,0)
  - Todos los inputs de nota muestran siempre 1 decimal (`7,0` no `7`); el formato se aplica tanto al display como al parseo de lo que el usuario escribe.
- Sección "Preferencias":
  - Incremento del slider: chips `1` / `0,5` / `0,25` (los tres valores son potencias de 2 — `2⁰`, `2⁻¹`, `2⁻²` — representables exactamente en IEEE 754, evitando acumulación de error en punto flotante)
- Sección "Guardar":
  - Nombre de la escala (input text)
  - [Guardar cambios] primary
  - [Restaurar valores por defecto] link secondary (con confirm)

**Comportamientos**:

- Slider de puntaje: valor continuo con step según incremento configurado; tap directo en el número abre teclado numérico para ingreso preciso.
- Recálculo en vivo al mover el slider (no hay botón "calcular").
- Cambio de color del número hero cuando cruza el umbral de aprobación (azul ↔ rojo).
**Tabla completa de la escala** (bottom sheet expandido, accesible por swipe-up):

- Layout multi-column con CSS nativo (`columns: 140px` + `column-gap: 24px`). El navegador calcula automáticamente cuántas columnas caben según el ancho disponible: ~1 columna en móviles chicos, 2-3 en tablet, 4-6+ en desktop. Las filas mantienen orden de lectura vertical (col 1 de menor a mayor, luego col 2 continúa, etc.), al estilo escaladenotas.cl.
- Cada fila: puntaje a la izquierda, nota a la derecha, con `break-inside: avoid` para que no se corten entre columnas.
- Fila correspondiente al puntaje actual del slider: resaltada con barra lateral azul y fondo sutil.
- Nota coloreada con azul (aprobación) o rojo sello (reprobación), consistente con el hero.
- El bottom sheet tiene su propio `max-width: 720px` centrado, independiente del contenedor principal de la app (que es más angosto). Esto permite que la tabla respire en pantallas grandes.
- Funciona tanto en dark como light mode.

### 9.2 Módulo Promedio

**Propósito**: calcular promedio actual del ramo con evaluaciones listadas.

**Default**: promedio aritmético simple (todas las notas pesan igual). Modo ponderado es **opcional** y se activa por ramo.

**Justificación del default**: la mayoría chilena (colegios públicos y subvencionados) usa promedio aritmético. Las ponderaciones son caso de minoría (colegios IB, privados premium, universidad).

**Layout principal**:

```
┌──────────────────────────┐
│ Promedio            ⌥    │
│                          │
│ [card: Historia · 2° med.│
│  4 eval · 75% asignado ›]│
│                          │
│    PROMEDIO PARCIAL      │
│         5,5              │
│      [APROBADO]          │
│                          │
│ EVALUACIONES      4      │
│ [Prueba coef 2    5,8]   │
│  30%                     │
│ [Trabajo grupal   6,2]   │
│  25%                     │
│ [Control lectura  4,3]   │
│  20%                     │
│ [Prueba final      —]    │ ← pendiente, borde punteado
│  25% · pendiente         │
│                          │
│ [+ Agregar evaluación]   │ ← borde punteado, link visual
│                          │
│ ¿Doy examen?      [ ]    │
│                          │
├──────────────────────────┤
│ ▣Escala [Σ Promedio] ◎Meta│
└──────────────────────────┘
```

**Arquitectura v0.1**: single-ramo. Un ramo a la vez, card superior funciona como selector (tap abre lista de ramos del usuario).

**Arquitectura v0.2**: dashboard multi-ramo — una pantalla anterior lista todos los ramos con su promedio parcial.

### 9.3 Bottom sheet "Agregar evaluación"

**Dos modos**, según configuración del ramo.

#### Modo simple (default)

- Título "Nueva evaluación" + subtitle "Historia · 2° medio"
- Microcopy: "Todas las notas pesan lo mismo"
- Campo **Nombre** con input + chips preset:
  - Prueba, Control, Trabajo, Tarea, Interrogación, Coef 2
  - Usuario puede editar el input libremente
- Campo **Nota obtenida**: valor grande central serif + slider 1,0 – 7,0 con rango visible `[1,0 ... 7,0]`
- Botón [Agregar] primary
- Campo nota es **opcional**: si queda vacío, la evaluación se guarda como "pendiente" y aparece en la lista con em-dash `—`.

#### Modo ponderado (toggle activado a nivel ramo)

- Mismos campos +
- Badge "PONDERADO" arriba
- Subtitle muestra progreso: "Historia IB · 3° medio · 75% asignado"
- Campo **Ponderación (%)**:
  - Stepper `−` / número grande / `+`
  - Chips preset: `10%` `20%` `25%` `30%` `50%`
  - Indicador dinámico: "con esta: 95%" (o "105%" en rojo si supera 100%)
- Validación:
  - Si el total excede 100%, el botón [Agregar] se deshabilita con texto "Excede 100%, ajusta primero"

**Chips de nombre adicionales para modo ponderado**:

- Ensayo, Oral, Portfolio, Extended essay, Laboratorio, Informe

### 9.4 Módulo Meta

**Propósito**: cálculo inverso — dada una meta de promedio, qué nota necesito sacar en la(s) evaluación(es) pendiente(s).

**Layout principal (una pendiente)**:

```
┌──────────────────────────┐
│ Meta                ⌥    │
│                          │
│ [card: Historia · 2° med.│
│  parcial 5,5 · Prueba    │
│  final 25%]              │
│                          │
│ Quieres quedar con   5,0 │
│ [=====●=========]        │ ← slider 4,0 → 7,0
│ 4,0   5,5        7,0     │
│ ───────────────────────  │
│    NECESITAS SACAR       │
│         3,4              │ ← hero
│    en la prueba final    │
│     [ALCANZABLE]         │
│ ───────────────────────  │
│ MAPA DE ESCENARIOS       │
│ si sacas un 2,0 →  4,7   │ ← rojo sello
│ si sacas un 4,0 →  5,2   │
│ si sacas un 5,0 →  5,4   │
│ si sacas un 6,0 →  5,7   │
│ si sacas un 7,0 →  5,9   │
│                          │
├──────────────────────────┤
│ ▣Escala Σ Promedio [◎Meta]│
└──────────────────────────┘
```

**Estados del resultado**:

| Condición | Estado | Color |
|---|---|---|
| `necesita <= 1,0` | ASEGURADO | accent-primary |
| `1,0 < necesita <= 5,5` | ALCANZABLE | accent-primary |
| `5,5 < necesita <= 7,0` | EXIGENTE | accent-warning |
| `necesita > 7,0` | IMPOSIBLE | accent-danger (display "—") |

**Layout múltiples pendientes**:

- Card del ramo muestra "2 evaluaciones pendientes · 40% sin asignar"
- Modo default: asume igual nota en todas las pendientes. Hero muestra único número con texto "en cada una de las X pendientes".
- Lista debajo muestra cada pendiente con el mismo valor calculado.
- Toggle "Ajustar individualmente" (v0.2): despliega sliders independientes con cálculo cruzado.

### 9.5 Módulo Onboarding

#### Paso 1 — Selección de perfil

```
┌──────────────────────────┐
│      [icono Σ]           │
│      Bienvenido          │
│  Cuéntame quién eres y   │
│  adapto la app para ti.  │
│    Toma 5 segundos.      │
│                          │
│ ¿QUIÉN ERES?             │
│                          │
│ [Estudiante básica    ›] │
│  5° a 8° básico          │
│ [Estudiante media     ›] │
│  1° a 4° medio           │
│ [Postulando a U  PRONTO ›]│
│  PAES, NEM y ranking     │
│ [Universitario        ›] │
│  promedio ponderado      │
│ [Docente              ›] │
│  escalas y corrección    │
│                          │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─      │
│ Solo quiero calcular     │
│ una nota  →              │
└──────────────────────────┘
```

**Comportamientos**:

- Tap en card → navegación directa, sin confirmar.
- Tap en "Postulando a U" → pantalla "próximamente, ¿te aviso?" con captura email opcional; después redirige a Modo Escala base.
- Tap en skip → directo al módulo Escala con parámetros chilenos default (puntaje máx 50, exigencia 60%, escala 2,0 – 7,0, aprobación 4,0).

#### Paso 2 — Configuración del estudiante

Solo aparece para perfiles "Estudiante básica", "Estudiante media", "Universitario".

```
┌──────────────────────────┐
│ ‹          Paso 2 de 2   │
│                          │
│ ¿EN QUÉ AÑO VAS?         │
│ [1°][2°][3°][4°]         │ ← 2° seleccionado por default
│                          │
│ TUS RAMOS   opcional     │
│ Si los agregas ahora, te │
│ ahorras tiempo después.  │
│                          │
│ [✓ Lenguaje][✓ Matemática]│
│ [✓ Historia][Biología]   │
│ [Física][Química]        │
│ [✓ Inglés][Ed. Física]   │
│ [Artes][Tecnología]      │
│ [+ otro]                 │ ← borde punteado
│                          │
│ [Listo]                  │ ← primary
│ Puedo hacerlo después  → │ ← link
└──────────────────────────┘
```

**Defaults preseleccionados**: Lenguaje, Matemática, Historia, Inglés (los 4 con mayor ponderación NEM histórica).

**Perfiles no-estudiante** (Docente, Universitario con configuración propia): cada uno tiene su paso 2 adaptado, a especificar cuando se aborde cada perfil en detalle.

### 9.6 Pantalla "Próximamente" (reutilizable)

Patrón compartido entre la tab Meta (mientras no está implementada) y los perfiles no-implementados del onboarding (ej. "Postulando a U" en MVP).

**Cuándo se abre**: al tocar un elemento en estado disabled (tab, card de perfil, link). Nunca aparece sin interacción explícita del usuario — si un usuario no toca la tab disabled, no ve la pantalla.

**Contenido**:

- Título: "Pronto" o "Próximamente"
- Subtítulo breve adaptado al contexto: "El módulo Meta llega en la siguiente versión" / "PAES y NEM están en desarrollo"
- Campo email opcional + botón "Avísame cuando esté listo"
- Link "Volver" que cierra la pantalla y regresa al estado previo (no navega a otra ruta)

**Comportamiento**:

- Implementada como bottom sheet en móvil (consistente con resto del sistema), modal centrado en desktop.
- El email capturado se guarda en localStorage (`calcnotas_waitlist`) para enviarlo cuando exista backend de notificaciones. En MVP sin backend, queda local. No enviar desde el cliente para no exponer endpoint.
- ESC o tap fuera cierran.

---

## 10. Algoritmos y fórmulas

### 10.1 Escala lineal de dos tramos (algoritmo oficial chileno)

Este algoritmo es el "estándar" implícito chileno descrito en el FAQ de Juan Pumarino. No hay norma oficial del MINEDUC: el Ministerio solo define los extremos (1,0 – 4,0 – 7,0), todo lo demás es convención adoptada.

**Entradas**:
- `pmax`: puntaje máximo (ej. 100, 32, 60)
- `exig`: exigencia (decimal 0 a 1, típicamente 0,60)
- `nmin`: nota mínima (típicamente 1,0, alternativa 2,0)
- `napr`: nota de aprobación (típicamente 4,0)
- `nmax`: nota máxima (típicamente 7,0)
- `p`: puntaje obtenido por el alumno

**Paso 1**: puntaje de aprobación.
```
papr = pmax × exig
```

**Paso 2**: cálculo según tramo.
```
si p <= papr:
  nota = nmin + (napr - nmin) × (p / papr)
si p > papr:
  nota = napr + (nmax - napr) × ((p - papr) / (pmax - papr))
```

**Paso 3**: redondeo chileno (ver sección siguiente).

### 10.2 Redondeo chileno

Convención tradicional (no normada por MINEDUC): se trunca a centésimas, y si la centésima es mayor o igual a 5, se sube la décima. Resultado final con 1 decimal.

**Pseudocódigo**:
```
truncada = floor(nota × 100) / 100    # 3,94711 → 3,94
centesima = floor((truncada × 100) mod 10)   # 4
decimal_base = floor(truncada × 10) / 10     # 3,9
si centesima >= 5:
  resultado = decimal_base + 0,1
si no:
  resultado = decimal_base
```

**⚠️ Gotcha crítico en JavaScript**: por precisión de floating point, `3.95 * 10` no da exactamente `39.5` sino `39.499999...`, entonces `Math.round(3.95 * 10)` devuelve `39`, no `40`. Esto produce un redondeo incorrecto.

**Solución**: operar con enteros cuando sea posible, o usar `Math.round((nota + Number.EPSILON) * 100) / 100` para compensar.

**Implementación segura sugerida**:
```javascript
function redondeoChileno(nota) {
  const truncada = Math.floor(nota * 100 + Number.EPSILON) / 100;
  const centesima = Math.round((truncada * 100) % 10);
  const decimalBase = Math.floor(truncada * 10) / 10;
  return centesima >= 5 ? decimalBase + 0.1 : decimalBase;
}
```

**Caso paradoja documentado**: con exigencia 50% y puntaje máximo 120, un puntaje de 59 da 3,95 que redondea a 4,0 — el alumno "aprueba" con puntaje menor al de aprobación (60). Esto es consecuencia natural del redondeo, no un bug.

### 10.3 Cálculo inverso (Meta)

**Una pendiente**:

Dadas evaluaciones ya ingresadas (cada una con `nota_i` y `peso_i` donde `Σ peso_i < 1`) y una meta `M`:

```
acumulado = Σ (nota_i × peso_i)   # suma ponderada de notas ingresadas
peso_pendiente = 1 − Σ peso_i
nota_pendiente_requerida = (M − acumulado) / peso_pendiente
```

**Múltiples pendientes (modo simple)**:

Si hay N pendientes con pesos `peso_p1, peso_p2, ..., peso_pN`, se asume misma nota en todas:

```
peso_total_pendiente = Σ peso_pi
nota_cada_una = (M − acumulado) / peso_total_pendiente
```

**Múltiples pendientes (modo avanzado, v0.2)**:

El usuario fija N-1 notas con sliders, la N-ésima se calcula despejando. Restricción: `nota_i ∈ [nmin, nmax]` para todas.

### 10.4 Promedio ponderado

Considera solo evaluaciones con nota ingresada (las pendientes no afectan al parcial):

```
suma_parcial = Σ (nota_i × peso_i) para i con nota
pesos_con_nota = Σ peso_i para i con nota
promedio_parcial = suma_parcial / pesos_con_nota
```

### 10.5 Promedio aritmético simple (default)

```
promedio = (Σ nota_i) / cantidad_de_notas
```

Solo considera evaluaciones con nota. Pendientes no se cuentan.

### 10.5.1 ⚠️ Regla del parcial declarado (clave para promedio anual / final)

**Convención chilena estricta**: los promedios parciales y finales se calculan **usando solamente el primer decimal declarado** (la nota que ya aparece en el libro de clases, con `redondeoChileno` aplicado). **Nunca** se recalcula desde las notas individuales con decimales internos escondidos.

**Traducción concreta** cuando se implemente promedio anual / final:

```
# CORRECTO — promedio anual chileno
parcial_sem1 = redondeoChileno(Σ notas_sem1 / N1)   # ej. 3,9
parcial_sem2 = redondeoChileno(Σ notas_sem2 / N2)   # ej. 6,7
promedio_anual = redondeoChileno((parcial_sem1 + parcial_sem2) / 2)
                = redondeoChileno((3,9 + 6,7) / 2)
                = redondeoChileno(5,3)
                = 5,3

# INCORRECTO — "matemáticamente puro" pero no chileno
todas_las_notas = [...notas_sem1, ...notas_sem2]
promedio_anual = redondeoChileno(Σ todas / N_total)
                # podría dar 5,4 por decimales escondidos (3,944... + 6,666... / 2)
```

**Por qué no "promediar nota por nota": los edge cases son parte de la convención, no un defecto**. Si un alumno termina `5,3` por una fracción de centésima, el sistema chileno lo deja en `5,3` — no lo "redime" recalculando. Esto afecta decisiones de aprobación, repitencia y ranking y tiene que reflejarse 1:1 en la app o perdemos credibilidad con profesores.

**Estado actual del código** (v0.3.0):
- `calcularPromedioSimple` ya retorna el valor ya redondeado — el `3,8` que ve el usuario ES el valor exacto que devuelve, no porta decimales escondidos. Cualquier futuro `calcularPromedioAnual(parciales[])` debe alimentarse de los outputs de esta función, nunca reagrupar las notas individuales.
- `calcularNotaNecesaria` (módulo Meta) sí recalcula desde notas crudas — es aceptable porque responde a la pregunta "dado X que ya tengo, qué necesito para llegar a M", no calcula un parcial/final oficial. Pero si eventualmente derivamos un "parcial proyectado" y lo reutilizamos para un cálculo final, tenemos que redondearlo primero al valor declarable.

### 10.6 Modo edufísica (tiempos → notas)

**Justificación**: el caso aparece en el FAQ de Pumarino, nadie lo automatiza.

**Entradas del profesor**:
- `t_max`: tiempo peor, corresponde a nmin
- `t_aprob`: tiempo de aprobación, corresponde a napr
- `t_min`: tiempo mejor, corresponde a nmax

**Transformación a puntaje virtual**:
```
pmax_virtual = t_max − t_min
papr_virtual = t_max − t_aprob
exig_virtual = papr_virtual / pmax_virtual
p_alumno = clamp(t_max − t_alumno, 0, pmax_virtual)
```

Luego aplicar escala lineal estándar con estos parámetros. Si `t_alumno <= t_min`, la nota es nmax.

### 10.7 Estados de alcanzabilidad (Meta)

Dados `nota_necesaria` calculada y rango `[nmin, nmax]`:

```
si nota_necesaria <= nmin:
  estado = ASEGURADO
  display = "1,0 (ya está asegurado)"
si nmin < nota_necesaria <= 5,5:
  estado = ALCANZABLE
si 5,5 < nota_necesaria <= nmax:
  estado = EXIGENTE
si nota_necesaria > nmax:
  estado = IMPOSIBLE
  display = "—" + "ni con un 7,0"
```

El umbral 5,5 es convención pedagógica discutible. Puede exponerse como ajuste avanzado.

---

## 11. Persistencia y storage

### Estrategia

**localStorage del navegador**. Sin backend, sin cuentas, sin sync cross-device en MVP.

**Justificación**:
- Cero costo operacional (sin servidores, sin BD, sin backups)
- Funciona offline desde el primer uso
- Privacidad real (las notas son datos sensibles: no tenerlos en servidores nuestros es mejor que protegerlos)
- Cero fricción de onboarding (sin "crear cuenta" antes de usar)

**Trade-off**: si el usuario borra caché o cambia de dispositivo, pierde datos. Mitigaciones:

1. **Export JSON**: botón en Ajustes que descarga un archivo con toda la data local. El usuario lo guarda en Drive/Mail/WhatsApp.
2. **Import JSON**: el usuario puede restaurar en otro dispositivo.
3. **Compartir escala por URL**: query string con parámetros (patrón de Pumarino), zero storage, marketing orgánico gratis.
4. **Alerta pedagógica** al guardar primera escala: "Tus escalas se guardan en este dispositivo. Puedes exportarlas para respaldarlas."

Sync cross-device como feature **premium** en v2+, no en MVP.

### Schema de datos

Clave principal: `calcnotas_v1` (JSON serializado).

```json
{
  "version": 1,
  "perfil": {
    "tipo": "estudiante_media",
    "nivel": "2_medio",
    "creado": "2026-04-23T01:00:00Z"
  },
  "preferencias": {
    "tema": "auto",
    "decimal": "coma",
    "incremento_slider_default": 1.0
  },
  "escalas_guardadas": [
    {
      "id": "uuid-v4",
      "nombre": "Prueba de Historia",
      "puntaje_max": 32,
      "exigencia": 0.60,
      "nota_min": 2.0,
      "nota_aprobacion": 4.0,
      "nota_max": 7.0,
      "incremento": 1.0,
      "creado": "2026-04-23T01:00:00Z",
      "modificado": "2026-04-23T02:30:00Z"
    }
  ],
  "ramos": [
    {
      "id": "uuid-v4",
      "nombre": "Historia",
      "nivel": "2_medio",
      "modo_ponderado": false,
      "evaluaciones": [
        {
          "id": "uuid-v4",
          "nombre": "Prueba coef 2",
          "ponderacion": 0.30,
          "nota": 5.8,
          "estado": "rendida",
          "creado": "2026-04-15T10:00:00Z"
        },
        {
          "id": "uuid-v4",
          "nombre": "Prueba final",
          "ponderacion": 0.25,
          "nota": null,
          "estado": "pendiente",
          "creado": "2026-04-23T14:00:00Z"
        }
      ],
      "examen": {
        "activo": false,
        "ponderacion": null,
        "nota": null
      },
      "creado": "2026-03-01T09:00:00Z"
    }
  ]
}
```

### Claves secundarias

- `calcnotas_consent_storage`: booleano, se setea `true` al aceptar el primer guardado.
- `calcnotas_first_run`: booleano, se setea `false` después del onboarding.

### Tamaño estimado

Una app bien cargada (10 escalas + 10 ramos con 6 evaluaciones cada uno) pesa ~15 KB. Límite de localStorage es ~5 MB por dominio. Zero issue.

### Migración de schema

Incluir campo `version` desde v1. Cuando se requiera migrar:

```javascript
function migrarDesde(data) {
  if (data.version === 1) return data;
  // lógica de migración por versión
  return data;
}
```

---

## 12. Stack técnico

### Requerimientos

- PWA instalable en iOS (Safari), Android (Chrome), desktop
- Service Worker para offline
- Cero backend
- Bundle pequeño (<100 KB gzipped idealmente)
- Dark/light mode según preferencia del sistema o del usuario
- Soporte a tamaños desde ~320px (iPhone SE) hasta desktop

### Opciones que se consideraron

| Opción | Pros | Cons | Veredicto |
|---|---|---|---|
| Vanilla JS + Vite | Bundle mínimo, cero deps | Más boilerplate, peor DX | Descartado |
| **Svelte + Vite** | **Compile-time, bundle muy pequeño, excelente DX** | Ecosistema más chico | **Elegido** |
| React + Vite | Ecosistema enorme, conocido | Bundle grande, boilerplate, overkill | Descartado |
| Preact + Vite | React-like, bundle chico | Middle ground sin ventajas únicas | Descartado |

### Stack confirmado

- **Framework**: Svelte (v4 o v5 con runas) + SvelteKit static adapter (o solo Vite si se prefiere menos abstracción)
- **PWA**: `vite-plugin-pwa` con Workbox para service worker
- **Estilos**: CSS vars + CSS nesting nativo (sin preprocesador); opcional Tailwind si facilita velocidad
- **Estado**: Svelte stores nativos para estado compartido; localStorage abstracto detrás de una capa `storage.js`
- **Testing**:
  - Vitest para algoritmos críticos (escala, redondeo, meta)
  - Playwright para flows E2E principales (onboarding, agregar evaluación, calcular meta)
- **Build**: Vite
- **Tipado**: TypeScript

### Estructura de carpetas sugerida

```
/src
  /lib
    /algoritmos
      escala.ts
      redondeo.ts
      meta.ts
      promedio.ts
      edufisica.ts
    /storage
      localStorage.ts
      schema.ts
      migraciones.ts
    /componentes
      DeviceFrame.svelte
      SliderPuntaje.svelte
      NotaHero.svelte
      CardEvaluacion.svelte
      BottomSheet.svelte
      TabBar.svelte
    /stores
      perfil.ts
      ramos.ts
      preferencias.ts
      escalaActiva.ts
  /rutas
    onboarding
    escala
    promedio
    meta
    ajustes
  app.css
  app.html
```

### Consideraciones de performance

- Code splitting por ruta
- Lazy-load de módulos que no son el principal (si el usuario entra a Escala, no se carga inmediatamente el código de Promedio/Meta)
- Service worker cachea toda la app después de primera visita
- Sin tracking/analytics en free tier (o usar algo privacy-first como Plausible)

---

## 13. Roadmap

### v0.1 — MVP (estimado 4 semanas)

Entregable: PWA instalable con los 3 módulos funcionales.

Alcance:
- Onboarding 2 pasos (con skip)
- Módulo Escala completo con persistencia y bottom sheet de parámetros
- Módulo Promedio simple + ponderado opcional (single-ramo)
- Módulo Meta con caso simple y múltiples pendientes en modo default
- Dark + light mode completos
- Tuteo chileno, coma decimal
- Service worker ofreciendo offline completo

### v0.2 — Diferenciadores (estimado 6 semanas)

- Dashboard multi-ramo en Promedio
- Simulador comparativo "¿bajar escala?"
- Validador de nota con explicación matemática
- Modo edufísica
- Meta: modo "ajustar individualmente"
- Modo profesor con batch y export PDF
- Sistema de premium tier (unlock + sin ads)
- Ads discretos (servicio a decidir: Google AdMob, Carbon, etc.)
- Export/import JSON

### v0.3 — PAES/NEM (estimado 6-8 semanas)

Objetivo: activación PAES Regular 2026 (noviembre-diciembre) y postulación centralizada (enero 2027).

- Módulo PAES con gestor de múltiples rendiciones
- Cálculo de NEM con escala 100-1000
- Cálculo de Ranking
- Simulador de carreras con Compendio DEMRE 2027 (publicado 24 septiembre 2026)
- Comparador con puntajes de corte históricos (fuente demre.cl)

### v1.0 — Lanzamiento público

- Publicación en Google Play Store vía Trusted Web Activity
- Landing web con SEO y artículos educativos
- Compartir escala por URL
- Compartir captura "tu nota explicada"

---

## 14. Principios de UX

Referencia rápida para cualquier decisión de producto. En orden de prioridad:

1. **La nota es el hero**. En cada pantalla, el número relevante (nota calculada, promedio, nota necesaria) debe ser lo más grande visualmente.
2. **Mobile-first real**. Todo diseño, implementación y testing parte en móvil. Desktop es bonus.
3. **Cero fricción de entrada**. El usuario usa la app sin crear cuenta, sin pedir permisos, sin leer tutoriales. El skip del onboarding va directo a calcular una nota.
4. **Tuteo chileno estricto**. Nunca voseo argentino, nunca "ustedeo" corporativo.
5. **Coma como decimal** por defecto.
6. **Presets chilenos reales**. Nombres de evaluaciones, ramos, rangos de nota típicos.
7. **Jerarquía visual clara**. Si algo importante no se ve, está mal diseñado. Si hay dos cosas igualmente "importantes", falta jerarquizar.
8. **Microcopy que educa sin asumir**. Explica el régimen activo, el redondeo, el por qué. Pero no satura.
9. **Estados honestos**. "Parcial", "exigente", "asegurado" — no eufemismos corporativos.
10. **Respeto al usuario**. Sin dark patterns, sin ads intrusivos, sin upselling agresivo.
11. **Accesibilidad AA como mínimo**. Contraste ≥ 4.5:1 para texto normal, ≥ 3:1 para grande. Navegación por teclado funcional. ARIA labels donde corresponde.

---

## 15. Decisiones pendientes

Cosas no resueltas que hay que cerrar antes o durante implementación:

- **Nombre final del producto**. Actual: "Compañero de Notas" como placeholder iterable. Revisar cuando el producto tenga tracción para evaluar si el placeholder se queda o se cambia por algo más distintivo (candidatos fuertes históricos: Azul, Roneo, Escala).
- **Logo e ícono de la app**. Placeholder actual es "Σ" en azul escolar.
- **Nombre de dominio y handle de redes**. Verificar disponibilidad cuando se confirme nombre final.
- **Estrategia de landing y SEO**. Fuera del PWA pero complementaria.
- **Proveedor de ads**. AdMob (Google) vs alternativas privacy-first (Ethical Ads, Carbon).
- **Segunda pantalla de onboarding para Docente y Universitario**. Pendiente de especificar en detalle.
- **Estados de error y edge cases específicos**: ponderaciones > 100%, notas fuera de rango, edición de evaluación existente con botón eliminar. Pendiente de diseñar estos flujos, probablemente en código.
- **Migración de tipografías a Inter + Fraunces** en v0.2, si se decide dar más carácter propio al producto.

### Decisiones cerradas en esta iteración (23 abr 2026)

- ✅ Nombre de trabajo: **Compañero de Notas** (placeholder iterable).
- ✅ Azul eléctrico dark mode: **#1F7FFF**.
- ✅ Stack técnico: **Svelte + Vite + TypeScript + vite-plugin-pwa**.
- ✅ Tipografías MVP: **system-ui** sans + **Palatino Linotype** stack para hero serif en light.
- ✅ Precio premium: **CLP $2.990** one-time.

### Decisiones cerradas (24 abr 2026)

- ✅ Defaults chilenos finales de escala: **puntaje máx 50, exigencia 60%, nota mín 2,0, aprobación 4,0, nota máx 7,0**. Confirmado en dogfood que 50 es más representativo que 100 para pruebas de clase (el 100 aplica a pruebas estandarizadas tipo PAES).
- ✅ **Regla de formato "siempre 1 decimal en notas"**: inputs de configuración de escala, campos de agregar evaluación y display de notas (hero, tabla, cards) muestran siempre 1 decimal. El puntaje es entero.
- ✅ No existe UI de "guardar escala con nombre" en v0.1.x. Se suma junto con persistencia localStorage en v0.2.0.

---

## 16. Referencias externas

- [escaladenotas.cl](https://escaladenotas.cl) — Juan Pumarino. Referente histórico. FAQ como fuente canónica del redondeo chileno.
- Chalalo "Escala de Notas" — app móvil en Play Store. Competencia directa.
- [calculadoradenotas.cl](https://calculadoradenotas.cl) — Competidor web más completo.
- [demre.cl](https://demre.cl) — DEMRE, fuente oficial PAES. Compendio de Oferta Definitiva de Carreras, Vacantes y Ponderaciones se publica cada 24 de septiembre.
- [Preguntas frecuentes PAES Regular 2027](https://demre.cl/mesa-de-ayuda/preguntas-frecuentes-paes-regular)

---

## 17. Estado de implementación

### v0.1.x — Módulo Escala funcional (23–24 abril 2026)

**Implementado por Claude Code en 4 micro-iteraciones**. Base del proyecto Svelte + Vite + TypeScript + vite-plugin-pwa operativa.

**Módulo Escala** (estado actual):
- Slider de puntaje con recálculo en vivo y parámetros configurables (puntaje máx, exigencia, notas mín/apr/máx).
- Incremento del slider con snap automático al cambiar de grid (chips `1 / 0,5 / 0,25`).
- Algoritmo de redondeo chileno con el gotcha de FP resuelto **trabajando en milésimas enteras** (`Math.round(nota × 1000)` absorbe el ruido de FP; la pista del spec con `Number.EPSILON` no compensa a magnitud ~395).
- Hero con cambio de color azul ↔ coral/rojo según aprobación. Badge ALCANZADO/REPROBADO consistente con el hero.
- **Tabla completa puntaje → nota** accesible por hint `↑ ver tabla completa` con tap o swipe-up. En móvil/tablet (`<900px`): bottom sheet con `max-width: 720px` independiente del shell, scroll interno con `body.overflow: hidden` mientras está abierto, swipe-down ≥80px o ESC para cerrar. En desktop (`≥900px`): la tabla aparece como `<aside>` inline a la derecha del slider; el shell se expande de 480 a 1100px máx en grid `480 + 1fr`. El sheet y el hint quedan ocultos en desktop, y un `$effect` cierra el sheet automáticamente si el viewport pasa de móvil a desktop con la tabla abierta.
- Tabla en layout **CSS multi-column nativo** (`columns: 140px; column-gap: 24px; column-rule: 0.5px`). Se calculan automáticamente ~1 col en móvil chico, 2 en móvil estándar, 3-4 en desktop. Cada fila usa `break-inside: avoid` para no cortarse entre columnas.
- Fila activa (puntaje actual del slider) resaltada con `box-shadow: inset 3px` en azul + bg con `color-mix` al 12%; usar box-shadow en vez de `border-left` mantiene el flow del multi-column intacto. La fila activa hace `scrollIntoView({ block: 'center', behavior: 'instant' })` cuando se mueve el slider.
- Notas en la tabla coloreadas en azul (aprobación) o coral/rojo sello (reprobación), consistentes con el hero.
- Dark mode `#0A1220` con accent `#1F7FFF` y danger `#FF7A7A`.
- Light mode `#F1E9D4` papel roneo, hero serif Palatino en azul lápiz pasta `#1A3A6E`, danger rojo sello `#8F2E2A`.

**Arquitectura de layout**:
- `App.svelte` (shell): padding lateral generoso, sin `max-width` propio. Cada vista gestiona su propio ancho.
- Vistas estrechas (futuros Promedio, Meta) se quedan en 480px centrados.
- Vista Escala se expande a 1100px sólo cuando el `<aside>` con tabla es visible (desktop), si no se mantiene en 480px.

**Pipelines y tooling**:
- `npm run dev` — Vite dev server en `:5173`
- `npm test` — Vitest (27 tests pasando: 16 redondeo + 11 escala)
- `npm run check` — svelte-check (0 errors, 0 warnings)
- `npm run build` — genera PWA en `dist/` (~20 KB JS gz + ~3 KB CSS gz + service worker; bajo el target de 100 KB)

**Tests críticos verificados**:
- Gotcha de floating point: `1 + 3×(59/60)` redondea correctamente a `4,0`.
- Paradoja Pumarino: `pmax=120, exig=50%, p=59` da `4,0` (aprobado con puntaje menor al de aprobación).

### Hallazgos del dogfood v0.1 (resueltos)

- ~~**Tabla completa de escala no implementada en v0.1 original**~~ → resuelto en v0.1.1 (sheet mono-columna), v0.1.2 (multi-column + sheet a 720px independiente del shell), y v0.1.3 (panel lateral inline en desktop con shell expandible).
- ~~**Responsive general**: contenedor centrado a 480px en todos los anchos~~ → evolucionó a "shell estrecho por defecto, vista que renderiza panel lateral expande su shell sólo cuando ese panel es visible". Patrón aplicable a futuros módulos (ej. dashboard multi-ramo de Promedio v0.2 podría usar el mismo expand-when-aside).

### v0.1.4 — Defaults chilenos y regla de 1 decimal en notas (24 abril 2026)

- **Defaults nuevos en `escala.ts`**: `ESCALA_DEFAULT = { pmax: 50, exigencia: 0.60, nmin: 2.0, napr: 4.0, nmax: 7.0 }`. Único lugar donde viven; el store ya los consumía desde ahí.
- **`NotaInput.svelte` nuevo**: `<input type="text" inputmode="decimal">` + parse coma/punto + format on blur con `Intl.NumberFormat('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })`. Sin re-formato durante tipeo (acepta `5,` transitorio). Texto inicial vía `$effect.pre` para evitar flash de input vacío.
- **`EscalaView.svelte`**: los 3 inputs de nota (mín/aprobación/máx) usan `<NotaInput>` con cross-validación reactiva (`nmin.max = napr - 0.1`, etc.). Pmax y exigencia se quedan como `<input type="number">` porque son enteros sin issue de locale.
- Tests verificados en preview (mobile, dark, light papel roneo): `5` → `5,0`, `5,5` → `5,5`, `6.2` → `6,2` (punto normalizado), `20` con max=6,9 → `6,9` (clamp), `,` solo → revierte al último válido.
- Pipeline: 27/27 tests pass (`escala.test.ts` actualizado al nuevo default), 0 errors/warnings, build OK.

### v0.2.0 — Tab bar + storage + Promedio simple (24 abril 2026)

Tres bloques implementados en orden 1 → 2 → 3, cada uno validando sobre el anterior. **Bundle final: ~30 KB JS gz + ~3 KB CSS gz**, todavía bajo el target de 100 KB.

**Bloque 1 — Capa de storage**:
- `src/lib/storage/schema.ts`: tipos TS del schema §11 (`DatosApp`, `Perfil`, `Preferencias`, `EscalaGuardada`, `Ramo`, `Evaluacion`, `Examen`, `EntradaWaitlist`) + constantes `SCHEMA_VERSION = 1`, `STORAGE_KEY = 'calcnotas_v1'`, `WAITLIST_KEY`. Función `estadoInicial()` para arranque limpio.
- `src/lib/storage/storage.ts`: API pública `leerDatos()` / `escribirDatos()` / `limpiarDatos()` + helper `migrar()` (no-op en v1, listo para `if (data.version === 1) ...` en v2). JSON corrupto → estado inicial. Schema futuro (`version > SCHEMA_VERSION`) → `StorageError` para no corromper. Modo privado / cuota llena → `false` sin crashear.
- `src/lib/storage/store.svelte.ts`: clase `PersistedStore` con `datos = $state(leerDatos())` profundo, `iniciar()` arma `$effect.root` + `$effect` que toma `$state.snapshot` para trackear todo el árbol y debouncea escritura a 300ms. Método `flush()` para guardar inmediato (se llama en `beforeunload`). Helper `agregarAWaitlist()` aparte usa `WAITLIST_KEY` con array de `{ email, contexto, fecha }` — no se mete en el schema principal porque son conversiones del producto, no datos del usuario.
- Tests: `storage.test.ts` cubre round-trip, JSON corrupto, sin clave, version mayor (lanza), v1→v1 identidad, modo privado (sin `window`), cuota llena (setItem tira). 11 tests, 0 mocks de Vitest — fake `localStorage` minimal asignado a `globalThis.window`.
- Migración del módulo Escala: `incremento_slider_default` ya vive en `store.datos.preferencias`. `EscalaActivaState` lo expone via getter/setter para no exponer la dependencia con storage en cada componente.

**Bloque 2 — Tab bar + routing + pantalla próximamente**:
- `src/lib/router.svelte.ts`: clase `Router` minimalista con `ruta = $state<Ruta>(...)` y listener `hashchange`. Sin SvelteKit. Persistir la tab activa en la URL (`#promedio`) significa que un reload o un link compartido aterrizan en la misma vista.
- `src/lib/componentes/TabBar.svelte`: 3 tabs con icons `▣ Σ ◎`. Meta marcada `enabled: false` → patrón disabled del §7 (opacity 0.45, color `text-tertiary`, cursor normal, `aria-disabled="true"`). Tap en disabled NO navega; emite `onDisabledTap(ruta)` al padre.
- `src/lib/componentes/PantallaProximamente.svelte`: bottom sheet en `<700px`, modal centrado en desktop. Props `{ titulo, subtitulo, contexto, open, onClose }`. Email opcional + validación regex; al guardar agrega entrada a `calcnotas_waitlist`. Estado `idle | guardado | error` con micro-feedback, ESC/click-fuera cierra. NO envía desde el cliente (sin endpoint expuesto).
- `App.svelte` reescrita para enrutar via `router.ruta`: renderiza `EscalaView` o `PromedioView` según `ruta`, deja Meta sin vista; el tap en Meta llama `abrirProximamente('meta')` que hidrata `subtitulo` específico ("El módulo Meta llega en la siguiente versión..."). `onMount` arranca `store.iniciar()` y `router.iniciar()`, y registra `beforeunload → store.flush()`.

**Bloque 3 — Módulo Promedio simple**:
- `src/lib/util/formato.ts`: `formatearNota(n)` y `parsearNota(raw)` extraídos para reuso entre Escala y Promedio. Centraliza `Intl.NumberFormat('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })`. `redondeo.ts` re-exporta `formatNota` como alias para no romper imports existentes.
- `src/lib/algoritmos/promedio.ts` + tests: `calcularPromedioSimple(evaluaciones)` ignora pendientes (numerador y denominador), aplica `redondeoChileno` al resultado, devuelve `null` si no hay rendidas. `contarEvaluaciones()` desglosa rendidas/pendientes/total. 8 tests cubren vacío, todas pendientes, mix, redondeo (5,15 → 5,2), una sola nota.
- `src/lib/stores/ramos.svelte.ts`: clase `RamosState` con CRUD (`crearRamo`, `actualizarRamo`, `eliminarRamo`, `agregarEvaluacion`, `actualizarEvaluacion`, `eliminarEvaluacion`) que mutan `store.datos.ramos` (autosave los persiste). `ramoActivo` es derivado del primer ramo si no hay selección explícita. `crypto.randomUUID()` para ids. Constantes `NIVEL_LABEL` y `NIVELES_ORDENADOS` exportadas.
- Componentes: `CardEvaluacion` (swipe-left ≥40px revela botón eliminar con accent-danger; confirm inline "¿Eliminar? Sí/No"; doble background `bg-primary` + overlay `bg-secondary` para tapar el delete-bg en dark mode donde `bg-secondary` es semi-transparente; kebab `⋯` visible on hover en desktop como afordancia mouse). `SheetCrearRamo` (input + 9 chips de nivel single-select). `SheetEditarEvaluacion` (modo `crear` | `editar`, chips de preset Prueba/Control/etc., toggle "Sin nota todavía (pendiente)" oculta `NotaInput`). `ListaRamos` (cards con promedio actual via `calcularPromedioSimple`, swap a confirm enfático "¿Eliminar 'Historia' y todas sus evaluaciones?" porque borrar ramo arrastra evals).
- `PromedioView.svelte`: estado vacío con CTA "+ Crear primer ramo" centrado cuando `ramoActivo === null`. Con ramo: card superior (tap abre `ListaRamos`), `NotaHero` con promedio + badge APROBADO/REPROBADO según `napr` por defecto (4,0), lista de `CardEvaluacion`, "+ Agregar evaluación" con borde punteado.

**Verificación dogfood (en preview)**:
- Crear ramo "Historia 2° medio", agregar 3 evals (Prueba coef 2 = 5,8 / Trabajo grupal = 6,2 / Prueba final pendiente). Hero promedio 6,0 APROBADO en azul. Reload → todo persiste.
- Tap en Meta → sheet "Pronto" con el subtitulo del módulo Meta. URL no cambia a `#meta`. ESC cierra.
- Auto-close del sheet "próximamente" funciona ESC y click fuera.
- Layout desktop verificado por inspect: `view` 1037px, `primary` 480px x=24, `aside` 537px x=524 (= 24 + 480 + 20 gap). El screenshot del preview tool clipa a ~500px de ancho — la verificación real es por bounding boxes.

**Hallazgos del dogfood v0.2.0**:
- Bug visual descubierto: en dark mode `--bg-secondary` es `rgba(255,255,255,0.035)` (3.5% white). Cualquier card con `background: var(--bg-secondary)` que tenga elementos absolute detrás se transparenta. Resuelto en `CardEvaluacion` con doble background (`bg-primary` opaco + `bg-secondary` overlay). Patrón a aplicar a futuros componentes con z-stacking — anotar en checklist de revisión visual.
- `incremento_slider_default` persiste pero `tema` aún no — falta UI de toggle (queda para v0.4.0 con Onboarding).
- Layout grid `480 + 1fr` de Escala se mantiene activo aunque el panel de tabla esté cerrado (no aplica acá pero notable para consistencia futura).

**Explícitamente fuera de v0.2.0** (referencia): modo ponderado (→ v0.2.1), toggle "¿Doy examen?" (→ v0.2.1), UI de "guardar escala con nombre" en Escala (→ v0.2.1, la infra de storage la deja lista), dashboard multi-ramo (→ v0.3.0), export/import JSON (→ v1.0).

### v0.2.0.1 — Fix UX de eliminación de evaluaciones (24 abril 2026)

Hotfix tras dogfood: la eliminación vía swipe-left + kebab `⋯` quedaba ininteligible en desktop. El kebab disparaba el mismo `abrirConfirm()` que el swipe — slideaba el card -92px y mostraba un confirm comprimido en 92px de ancho ("¿Eliminar?" + "No" + "Sí" no entraban legiblemente). Resuelto con dos cambios:

- **`SheetEditarEvaluacion`** (en modo `editar`): nueva sección "zona peligrosa" debajo del botón "Guardar", separada por divider. Botón "Eliminar evaluación" en `accent-danger`; tap abre confirm inline con texto explicativo ("¿Eliminar esta evaluación? Se borra del ramo y no se puede deshacer.") + [Cancelar] [Sí, eliminar]. Esta es la **ruta principal** de borrado en desktop, donde la UX es tap → sheet → eliminar. La prop `onEliminar` es opcional para que el modo `crear` no muestre el botón.
- **`CardEvaluacion`**: removido el botón `⋯` (kebab) que era el desktop-fallback awkward. Reescrita la confirm inline: cuando se tappea "Eliminar" tras el swipe, el card entero se reemplaza por un **confirm row full-width** con el nombre de la evaluación y botones [Cancelar] [Sí] cómodos. Sin slideo, sin cramping. La altura coincide con la del card (`min-height: 48px`) para no causar layout shift.

Decisión deliberada: en desktop **no hay** affordance de borrado en la card misma. La ruta es tap → editar → eliminar. Razón: con mouse, todo gesto de "swipe" es artificial, y un botón siempre-visible en cada card mete ruido visual a una lista que típicamente tiene 8+ items. En mobile el swipe se mantiene como atajo para usuarios power.

Pipeline: 46/46 tests, 0 errors/warnings, build sigue ~30 KB JS gz.

### v0.3.0 — Módulo Meta + consolidación (24 abril 2026)

**Bloque 0 — Consolidación**:
- **Auditoría del bug de transparencia**: revisé todos los componentes con `background: var(--bg-secondary)` (BottomSheet, sheets de Promedio, ListaRamos, PantallaProximamente, card-params/params-panel de Escala). Sólo `CardEvaluacion` lo tenía genuinamente — el resto usa bg-secondary como overlay sobre bg-primary opaco, comportamiento intencional. Documentado en §7 "Componentes reutilizables · Gotcha de transparencia con --bg-secondary en dark mode" con la solución estándar (doble background) para no redescubrirlo en v0.4+.
- **`ThemeToggle.svelte`**: botón flotante top-right que cicla auto → dark → light → auto. Iconos `◐ ☾ ☼`. Persiste en `store.datos.preferencias.tema`. Un `$effect` aplica/quita `data-theme` en el `<html>`; `auto` deja al CSS resolver vía `prefers-color-scheme`. Posición `position: fixed; top: env(safe-area-inset-top); right`.

**Bloque 1 — Algoritmo Meta** (`src/lib/algoritmos/meta.ts`):
- `calcularNotaNecesaria({ evaluaciones, metaPromedio, pesos? })`: §10.3, asume peso uniforme `1/N` si no se pasan pesos. La firma con `pesos` ya está lista para v0.2.1 (ponderado) y v0.3.1 (ajustar individualmente). Devuelve `null` si no hay pendientes; **no** redondea — el llamador debe usar el valor exacto para evaluar `estadoAlcanzabilidad` y aplicar `redondeoChileno` sólo al display (sino se cuelan falsos IMPOSIBLE por rebote del redondeo, ej. 7,01 → 7,0 → engaño).
- `estadoAlcanzabilidad(necesaria, escala)` por §10.7. Umbral 5,5 hardcoded entre ALCANZABLE y EXIGENTE. Estados: ASEGURADO / ALCANZABLE / EXIGENTE / IMPOSIBLE.
- `mapaEscenarios(evaluaciones, pesos?)` para las 5 notas canónicas `[2, 4, 5, 6, 7]`. Aplica `redondeoChileno` al promedio final de cada escenario.
- `resumenPendientes()` helper para el subtítulo adaptativo del card y del hero.
- 17 tests cubren: una pendiente, dos pendientes (misma nota), peso uniforme vs custom, ASEGURADO en bordes, IMPOSIBLE > nmax, mapa con redondeo verificado punto por punto.

**Bloque 2 — Layout y hero**:
- `Router` y `App.svelte` enrutan `meta` → `MetaView`. `TabBar` hace `enabled: true` para Meta. El handler `onDisabledTap` queda por si vuelve a haber alguna tab "próximamente".
- `src/lib/stores/metaState.svelte.ts`: meta por ramo en memoria (`Record<ramoId, number>`, default 5,0). Persiste entre cambios de tab pero no entre reloads — la meta es un experimento momentáneo, no un dato del ramo. Si en v0.4+ se quiere persistir, se promueve al schema.
- `MetaView.svelte`: tres estados visuales:
  1. Sin ramo activo → CTA "Ir a Promedio" para crear primero.
  2. Ramo activo sin pendientes → card visible + CTA "Editar evaluaciones" que vuelve a Promedio.
  3. Estado normal → card con `parcial 3,8 · 2 pendientes (40%)`, control de meta (slider `napr → nmax` step 0,1 + `NotaInput` para ingreso preciso, sincronizados), hero adaptativo, mapa de escenarios.
- Hero usa custom variable `--hero-color` que cambia por `data-estado`: ALCANZABLE/ASEGURADO → `accent-primary`, EXIGENTE → `accent-warning`, IMPOSIBLE → `accent-danger`. Cuando IMPOSIBLE, hero muestra `—` en lugar del número y subtítulo cambia a "ni con un 7,0 alcanzas". Subtítulo normal es adaptativo: `en {nombreEvaluacion}` (una pendiente) o `en cada una de las N pendientes` (varias).

**Bloque 3 — Mapa de escenarios**: 5 filas en grid `1fr auto auto` (`si sacas un X,X | → | Y,Y`). Color de la nota final `accent-primary` si `>= napr`, `accent-danger` si no. La fila del techo (7,0) en `font-weight: 500` para destacarla como caso límite.

**Verificación dogfood end-to-end** (en preview, mobile dark + light):
- Ramo Historia con 3 rendidas (5,5 / 4,0 / 2,0) + 2 pendientes (40% peso). Parcial 3,8.
- Meta 5,0 → necesaria 6,8 EXIGENTE en ámbar; mapa muestra que con 7,0 sólo se alcanza 5,1.
- Subir meta a 6,5 → IMPOSIBLE coral con `—` y "ni con un 7,0 alcanzas".
- Math verificada paso a paso: `acumulado = (5,5 + 4 + 2) × 0,2 = 2,3`, `peso_pendiente = 0,4`, `(5,0 - 2,3) / 0,4 = 6,75 → 6,8` ✓.
- Theme toggle ciclando: auto (◐) → dark (☾) → light (☼). En light mode papel roneo, hero coral cambia a rojo sello, mapa con azul lápiz pasta y rojo sello según aprobación.
- Persistencia: `meta` por ramo se mantiene cambiando entre tabs Escala/Promedio/Meta; `tema` persiste tras reload.

**Hallazgos del dogfood v0.3.0**:
- El mapa de escenarios resuelve naturalmente la sensación de "no me sirve sólo saber el número, ¿qué pasa si saco un poco menos?" — y al mostrar el redondeo chileno aplicado, el alumno puede ver cómo 6,8 (necesaria) y 6,7 dan promedios distintos por la regla de centésimas.
- Ramos con TODAS las evaluaciones rendidas tienen un empty state propio que dirige a Promedio. Sin esto, el slider quedaba "muerto" sin sentido.
- El parcial-marker en la barra del slider ("parcial 3,8" centrado debajo) es un anchor mental útil — el usuario ve dónde está hoy y hacia dónde apunta.
- `data-estado` en el hero como hook de CSS resultó más limpio que múltiples class:foo — sumaría como patrón para futuros componentes con N estados.
- **Regla del parcial declarado documentada en §10.5.1**: los promedios chilenos se calculan solamente con el primer decimal ya redondeado, nunca con decimales internos. Hoy `calcularPromedioSimple` retorna el valor ya redondeado (no hay decimales escondidos), pero cuando toque implementar promedio anual/final (v0.4+ probablemente) hay que alimentar ese cálculo con los outputs de `calcularPromedioSimple` por semestre, no reagrupar notas individuales. Los edge cases que surgen (ej. `5,3` en vez de `5,4` por fracciones de centésima) son la convención, no defectos. Flagged porque es el tipo de detalle que perdemos credibilidad con profesores si lo hacemos "matemáticamente puro" en vez de "chileno correcto".

**Pipeline**: 63 tests pass (16 redondeo + 11 escala + 11 storage + 8 promedio + 17 meta), 0 errors/warnings en svelte-check, build ~37 KB JS gz + 4 KB CSS gz + service worker (precache 120 KB total). Sigue bajo el target de 100 KB JS.

**Explícitamente fuera de v0.3.0**: modo "ajustar individualmente" con sliders por pendiente (→ v0.3.1), modo ponderado completo (→ v0.2.1 o mergeado a v0.3.1), exposición del umbral 5,5 como ajuste avanzado (→ probablemente nunca para MVP), UI de "guardar escala con nombre" en Escala (→ v0.2.1), persistencia de la meta entre reloads (→ v0.4+), Onboarding (→ v0.4.0).

### v0.2.1 — Promedio ponderado + edición de ramo + escalas guardadas (24 abril 2026)

Esta versión cierra deuda larga: el modo ponderado del Promedio (§9.3 / §10.4) y la persistencia de escalas con nombre (§11 `escalas_guardadas`, schema vacío hasta ahora). Cuatro bloques en orden 3a → 1 → 2 → 3b → 4 (algoritmo primero, después la UI que lo enchufa).

**Bloque 3a — Algoritmo ponderado** (`src/lib/algoritmos/promedio.ts` + tests):
- `calcularPromedioPonderado(evaluaciones)` por §10.4: `Σ(nota × peso) / Σ peso_con_nota`. Considera sólo rendidas, divide por la suma de pesos rendidas — **no se normaliza al 100% del ramo**, así el parcial refleja sólo lo que hay (no proyecta 0 sobre las pendientes).
- `calcularPromedio(ramo)` wrapper que elige simple o ponderado según `ramo.modo_ponderado` — **puerta canónica** para todos los consumers; cambiar de modo es transparente.
- `sumaPonderaciones(evaluaciones)` helper para el indicador "con esta: X%" del SheetEditarEvaluacion.
- 10 tests nuevos: vacío, todas pendientes, Σ pesos = 0 (caso borde), ponderado con todas rendidas, parcial sin normalizar, wrapper en ambos modos, bordes de `sumaPonderaciones`.

**Bloque 1 — Toggle ponderado a nivel ramo + edición**:
- `SheetCrearRamo.svelte` se renombró/reescribió como `SheetRamo.svelte` con `modo: 'crear' | 'editar'` + `ramo?: Ramo | null`. Mismo patrón de `SheetEditarEvaluacion`. Toggle "Ponderación personalizada" con microcopy "Cada evaluación pesa distinto (típico en universidad, IB)" persiste en `ramo.modo_ponderado`. Default `false` al crear (aritmético chileno).
- En modo editar: divider + "Eliminar ramo" en accent-danger con confirm explícito ("se borra con todas sus evaluaciones, no se puede deshacer").
- `ramos.actualizarRamo()` extendido para aceptar `modo_ponderado` en parches. **Toggling preserva las ponderaciones existentes** — si el usuario apaga ponderado, los pesos quedan dormidos en cada eval; si vuelve a encenderlo, recupera todo. Si quiere empezar de cero, edita cada eval.
- `ListaRamos.svelte` tiene ahora botón ✎ por ramo que dispara `onEditar(ramoId)`. El delete inline se removió — la ruta canónica es tap ✎ → SheetRamo → "Eliminar ramo", consistente con CardEvaluacion.
- `PromedioView` y `MetaView` cablean el handler `onEditar`. En MetaView va a `irAPromedio` (ahí se edita).

**Bloque 2 — UI de ponderación en SheetEditarEvaluacion**:
- Cuando `modoPonderado=true`: banner [PONDERADO] arriba, campo "Ponderación (%)" con stepper `−` / input `<input type="number">` / `+` (paso de 5%) + chips preset 10/20/25/30/50, indicador "Con esta: X%" calculado en vivo desde `otrasPonderaciones` (suma de pesos del ramo excluyendo la actual) + esta. Si `totalPct > 100` → texto en `accent-danger` "Excede 100%, ajusta primero" + botón Guardar deshabilitado.
- Chips de nombre adicionales en modo ponderado (§9.3): Ensayo, Oral, Portfolio, Extended essay, Laboratorio, Informe — concatenados a los base.
- En modo simple el campo de ponderación NO aparece (no ocupa espacio); microcopy queda "Todas las notas pesan lo mismo".
- `agregarEvaluacion` y `actualizarEvaluacion` aceptan `ponderacion` opcional, clamp a [0, 1].

**Bloque 3b — Wire Meta + PromedioView a `calcularPromedio` + pesos**:
- `MetaView` construye `pesos = new Map(evaluaciones.map(e => [e.id, e.ponderacion]))` cuando `ramo.modo_ponderado` y los pasa a `calcularNotaNecesaria` y `mapaEscenarios`. La firma con `pesos?` ya existía desde v0.3.0 — sólo había que conectarla.
- `resumenPendientes` también respeta `pesos` opcionales (4 tests nuevos: una pendiente única ponderada, múltiples ponderadas, mapa coincidente al pixel con cálculo manual, etc.).
- `PromedioView` y `ListaRamos` usan el wrapper `calcularPromedio(ramo)` en vez de `calcularPromedioSimple` directo, así el modo se respeta en todas partes.
- Card del ramo en Promedio muestra badge [PONDERADO] + "X% asignado" cuando aplica; si `> 100%` el porcentaje se pinta en `accent-danger`. ListaRamos hace lo mismo en cada item.

**Bloque 4 — UI guardar escala + Mis Escalas**:
- `escalaActiva.guardarComoEscala(nombre)` crea entrada en `store.datos.escalas_guardadas` con id UUID + timestamps. `cargarEscalaGuardada(id)` restaura todos los parámetros + nombre + incremento del slider (clampea puntaje al nuevo `pmax`). `eliminarEscalaGuardada(id)` quita por id.
- En `EscalaView` panel de parámetros, sección final "Guardar como" con `<input>` de nombre + botón [Guardar] (deshabilitado si nombre vacío) + feedback transitorio "Guardada ✓" 2s con CSS `@keyframes feedback-fade`. Enter en el input también guarda.
- Link "Ver mis escalas (N)" sólo aparece si hay al menos una guardada — abre `SheetMisEscalas.svelte` con la lista. Cada item: nombre + summary `30 pts · 70% · 2,0–7,0`. Tap carga la escala y cierra el sheet. Botón ⌫ con confirm enfático "¿Eliminar 'X'?". Estado vacío con copy explicativo.

**Verificación dogfood (en preview, light mode)**:
- Editar ramo Historia → toggle ponderado, guardar (badge [Ponderado] aparece).
- Crear "Filosofía Universidad" en modo ponderado, agregar 3 evals: Ensayo 1 (5,5 / 30%), Ensayo 2 (6,0 / 30%), Final (pendiente / 40%). Card muestra `Universitario · 3 eval · 1 pendiente · 100% asignado`. Hero promedio = **5,8** = (5,5×0,3 + 6×0,3) / 0,6 = 3,45/0,6 = 5,75 → redondeo chileno ✓ (matcha el dogfood spec exacto).
- Tab Meta → card "parcial 5,8 · 1 pendiente (40%)", meta 6,0 → necesaria **6,4** EXIGENTE ámbar (`(6 - 3,45)/0,4 = 6,375 → 6,4`). Mapa de escenarios pixel-perfect: 2,0→4,3 / 4,0→5,1 / 5,0→5,5 / 6,0→5,9 / 7,0→6,3.
- Sheet de parámetros Escala: setear pmax=30, exigencia=70, escribir "Pruebas 30 pts 70%" → guardar → "Guardada ✓" + link "Ver mis escalas (1)".
- Reset a default (50 pts 60%) → abrir Mis escalas → tap en la guardada → escala restaurada a 30 pts 70%.
- Eliminar desde Mis escalas → confirm "¿Eliminar 'Pruebas 30 pts 70%'?" → estado vacío con copy CTA.

**Hallazgos del dogfood v0.2.1**:
- Una observación importante (de §10.5.1 ya documentada): el cálculo Meta usa el promedio **exacto** de las notas crudas, no el redondeado. En modo ponderado igual: pasa los pesos del ramo y multiplica `Σ(nota × peso)` sin redondear el acumulado. Para Meta es aceptable porque NO es un promedio "oficial" — es la pregunta "qué necesito". Si en v0.4+ derivamos un parcial proyectado y lo reutilizamos para algo declarable (ej. promedio anual con semestre proyectado), ahí sí hay que redondear primero.
- El stepper de ponderación con `+`/`−` paso de 5% sintió fluido para los chips usuales (10/20/25/30/50). Si el profesor usa pesos atípicos (ej. 33%) se entra a mano sin fricción.
- El doble fix "renombrar SheetCrearRamo a SheetRamo + mover delete fuera de ListaRamos" centraliza toda la edición de ramo en un sólo lugar — patrón consistente con cómo SheetEditarEvaluacion maneja crear+editar+eliminar. ListaRamos vuelve a ser puramente "switcher".
- `agregarAWaitlist` y demás del schema no tocados — sin disruption sobre v0.3.0 funcionalidad existente.

**Pipeline**: 77 tests pass (16 redondeo + 11 escala + 11 storage + **18** promedio (+10) + **21** meta (+4)), 0 errors/warnings en svelte-check, build ~46 KB JS gz + ~5 KB CSS gz. Bajo el target de 100 KB.

### Pendiente después de v0.2.1

- v0.3.1 — Meta modo "ajustar individualmente" para múltiples pendientes
- v0.4.0 — Onboarding 2 pasos + estados de error y polish + persistencia de meta entre reloads
- v0.5+ — Promedio anual / final usando parciales declarados (§10.5.1)

---