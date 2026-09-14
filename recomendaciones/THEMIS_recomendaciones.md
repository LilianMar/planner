**THEMIS — Recomendaciones de Diseño (Web + Móvil)**

**Resumen ejecutivo:**
- **Objetivo:** Entregar una guía de diseño práctica y lista para desarrollo (web PWA mobile-first) que preserve la identidad cálida, holística y ordenada de la spec. Priorizar reutilización, accesibilidad y preparación para migración a React Native / Expo.
- **Alcance del documento:** paleta y tokens, tipografía, layout y navegación móvil-first, sistema de componentes con variantes, animaciones, accesibilidad, assets y pasos siguientes (MVP & migración).

**Principios de diseño (guía rápida):**
- Mobile-first: diseñar para 375–430px y adaptar a desktop mediante "phone-frame" centrado o fullscreen móvil.
- Calidez y calma: uso de fondos cremosos, acentos violetas y colores pastel para categorías.
- Jerarquía clara: títulos prominentes (Playfair Display), cuerpo legible (Plus Jakarta Sans), elementos de datos con DM Mono.
- Metáforas visuales: stickers, post-its y animaciones suaves para reducir carga cognitiva.
- Accesibilidad: contrastes suficientes (AA preferible), touch targets >= 44×44px, prefieres-reduced-motion.

**Paleta de colores (tokens - usar en tailwind/variables):**
- cream: #FAF0E6  — fondo global
- violet: #6B4FA0 — acento principal / CTA
- mint: #4ECDC4   — éxito / progreso
- rose: #E8547A   — alertas suaves / amor
- sun: #F5C842    — logros / rachas
- coral: #E8724A  — finanzas / advertencias cálidas
- sage: #52B788   — bienestar / salud
- lila: #C77DFF   — descarga mental / creatividad
- navy: #2D3A8C   — académico / profesional

Sugerencia: definir variantes `-light` y `-dark` (10–20% tints/shades) y tokens semánticos: `--bg`, `--surface`, `--muted`, `--accent`, `--success`, `--danger`.

Tailwind tokens (ejemplo en `theme.extend.colors`):
```js
colors: {
  cream: '#FAF0E6',
  violet: '#6B4FA0',
  mint: '#4ECDC4',
  rose: '#E8547A',
  sun: '#F5C842',
  coral: '#E8724A',
  sage: '#52B788',
  lila: '#C77DFF',
  navy: '#2D3A8C',
}
```

**Tipografía:**
- Playfair Display — títulos / portadas (estilo elegante). Escalas móviles: h1=22px, h2=18px, h3=15px.
- Plus Jakarta Sans — texto UI, labels, navegación (body=14px, line-height=1.6).
- DM Mono — números, porcentajes, timestamps.
- Recomendación: cargar con `font-display: swap` y agrupar pesos: Playfair(400,700), Jakarta(400,600), DM Mono(400).

**Iconografía y assets:**
- Usar Lucide (React) por ligereza; mantener set consistente con icon-size de 20–28px según contexto.
- Exportar stickers, post-its y jar SVGs como vectores (SVG) con layers separables para animaciones.
- Mantener sprites/íconos en `/public/icons` y componentes `Icon.x` que acepten `size`, `color` y `aria-label`.

**Layout y navegación (mobile-first):**
- Phone frame en desktop: ancho fijo 390px, alto 844px, borde redondeado 44px; en pantallas <=430px usar fullscreen.
- Layout base: StatusBar (hora/batería mock) → Main scrollable → BottomNav fijo (64px). Content area con padding 16px.
- BottomNav: 5 tabs visibles (Home, Planner, HomeControl, Finance, Más). "Más" abre `BottomSheet` con módulos adicionales.
- Vistas calendario: Day / Week / Month. Day con bloques horarios 07:00–22:00, marcador de hora actual.

**Sistema de componentes (prioritarios):**
- `AppShell` — contenedor general, StatusBar, Outlet, BottomNav.
- `ModuleHeader(title, icon, color, sticker?)` — reutilizable en cada módulo.
- `StatCard(label, value, icon, variant)` — métricas resumidas.
- `HabitBubble(name, color, completed)` — círculo 32px con animación.
- `PostIt(note)` — color, editable inline.
- `ProgressJar(percentage)` — SVG animado para ahorros.
- `BottomSheet(items)` — panel deslizable con overlay.
- `ChecklistItem(text, assignee, done)` — swipe para completar.
- `GridTiles` — accesos directos a módulos (4-col icon grid en móvil small).

Para cada componente: definir `props`, estados (loading/empty/error), y variantes (`small|default|large`, `outlined|filled`). Crear storybook stories para cada variante.

**Animaciones (Framer Motion) — reglas:**
- Define motion presets: `float`, `container/item` (stagger), `habitDone`, `sheet`. Centralizar en `motionPresets.ts`.
- Respect `prefers-reduced-motion`: exportar hook `usePrefersReducedMotion()` y condicionar `motion` props.
- Microinteracciones: botones `whileTap={{ scale:0.96 }}`, listas con `staggerChildren: 0.08`.

**Accesibilidad (a11y):**
- Contrast ratio mínimo 4.5:1 para texto normal; 3:1 para texto grande. Verificar en colores secundarios.
- Todos los controles con `aria-label` y roles adecuados. Formularios con `aria-describedby` para errores.
- Focus visible claro (outline 3–4px con color `violet` semitransparente).
- Touch targets mínimo 44px; inputs height >=48px.

**Responsive & comportamientos:**
- Mobile-first: diseñar en 375–430px. En tablet y desktop:
  - Desktop: mostrar "phone-frame" centrado (para simulación) o permitir grid de 2 columnas para dashboards.
  - No scroll horizontal.
- Safe areas: usar `padding-bottom: env(safe-area-inset-bottom)` para Fab / BottomNav.

**Migración a React Native / Expo (prácticas concretas):**
- Mantener toda la lógica en hooks (`/hooks`) y stores (Zustand). Componentes solo renderizan.
- Abstraer almacenamiento con `useStorage` que exponga la misma API para `localStorage` (web) y `AsyncStorage` (native).
- Aislar gráficos (`ChartRadar.tsx`, `ChartDonut.tsx`) de Recharts; crear `Chart*` wrapper para poder reemplazar la implementación (Recharts web / Victory Native mobile).
- Evitar refs directos a `window/document` en hooks y stores.

**MVP — Prioridad de módulos para primera construcción (sprint 0–3):**
1. M01 Inicio (Mi Día Hoy) — saludo, métricas rápidas, 3 prioridades editables.
2. M02 Planeador Personal — vista día/semana/mes básica.
3. M03 Tracker de Hábitos — crear, marcar, rachas visuales.
4. M04 Centro de Mando del Hogar — tareas básicas y distribución.
5. Auth mínima + persistencia local (Zustand + localStorage) + BottomNav.

Motivo: proveen valor inmediato y cubren la mayoría de patrones UI (listas, calendarios, formularios, gráficos simples).

**Entregables recomendados para desarrollo inmediato:**
- `design-tokens` (colors, spacing, radii) en `src/constants/colors.ts` y en `tailwind.config.ts`.
- Sistema de componentes básicos (`ui/`): `Button`, `IconButton`, `Card`, `BottomSheet`, `Input`, `ModuleHeader`.
- Storybook con controles para variantes y states.
- Kit de assets: SVGs optimizados, fuentes en /public/fonts, paletas en /public/palettes.

**Snippets útiles (colors.ts):**
```ts
export const colors = {
  cream: '#FAF0E6',
  violet: '#6B4FA0',
  mint: '#4ECDC4',
  rose: '#E8547A',
  sun: '#F5C842',
  coral: '#E8724A',
  sage: '#52B788',
  lila: '#C77DFF',
  navy: '#2D3A8C',
}
```

**Recomendaciones de UX detalladas (pequeñas pero importantes):**
- Empty states empáticos: sticker + frase positiva + CTA claro.
- Confirmaciones no intrusivas: toast breve en esquina inferior; evitar modales bloqueantes.
- Onboarding ligero: 3 pantallas para configurar miembros de hogar, pareja y hábitos iniciales.
- Plantillas IA (M09): permitir editar el checklist generado por IA antes de guardar.

**Checklist de entrega de assets desde diseñadora/o:**
- SVGs exportados en capas (stickers, jar, icons) + versiones PNG 2x para previews.
- Paleta como `.ase` o `.sketchpalette` y PNGs de referencia.
- Fuentes con licencias y fallback list.
- Tokens exportados (JSON) y ejemplo de `tailwind.config`.

**Siguientes pasos recomendados (tácticos):**
1. Crear `design-tokens` y `colors.ts` (automático) — 1 día.
2. Implementar `AppShell`, `BottomNav`, y `ModuleHeader` — 1–2 días.
3. Implementar M01 + M03 MVP con mock data y persistencia local — 5–8 días.
4. Configurar Storybook y componente `Button`/`Card` base — paralelo a 2.
5. Preparar wrappers de gráficos para permitir swap a RN — durante 3.

**Notas finales:**
- Diseño coherente: priorizar consistencia de color y microinteracciones para crear sensación de apoyo y calma.
- Preparación RN: si planeas Expo pronto, mantener hooks y stores puros permitirá migración casi automática.

---
Documento generado y guardado en: recomendaciones/THEMIS_recomendaciones.md

¿Quieres que genere además:
- los `design-tokens` (files JS/JSON) y `tailwind.config` inicial? o
- componentes base `Button`, `AppShell` y `BottomNav` en React + TypeScript ahora?
