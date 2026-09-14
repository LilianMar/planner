# Themis — Plan de Trabajo

> Estado del proyecto y hoja de ruta para cerrar el frontend y preparar el backend.
> Basado en `THEMIS_Especificacion_Producto.docx` y en el código actual de `desarrollo/frontend`.
> Última actualización: 2026-06-25

---

## 1. Contexto y estado actual

Themis es una PWA de gestión integral (hogar, vida personal y bienestar). El **frontend** está construido en **Next.js (App Router) + TypeScript + Tailwind v4 + Zustand (persist) + Recharts + Lucide**, simulando una app móvil (phone-frame) con navegación inferior fija.

**Cobertura frente a la spec:**
- Módulos core (Inicio, Planeador, Hábitos, Finanzas, Rueda): **~90%**
- Módulos familia (Hogar, Descarga, Familia, Académico, Eventos): **~60%**
- Onboarding / Splash / Animaciones / Accesibilidad: **~15%**
- Extras añadidos fuera de la spec: **Módulo Ciclo Menstrual** completo, **Finanzas ampliado** (presupuesto personal/compartido con aportes, plantillas, inversiones, gráfico plan-vs-real) e ilustraciones en headers.

**Persistencia actual:** todo en `localStorage` bajo la clave `themis-store` (Zustand persist). Sin auth ni backend todavía.

---

## 2. Objetivo de este documento

Dejar **ordenado y priorizado** el trabajo pendiente para:
1. Cerrar los huecos del **frontend** respecto a la spec.
2. Cubrir la **gestión operativa real** (lo que hace que el día a día funcione solo).
3. Preparar el frontend para conectarse a un **backend** sin reescribir lógica.
4. Definir el **alcance y arquitectura del backend** (Supabase + Claude API).

---

## 3. Frontend — Trabajo pendiente vs. spec (priorizado)

### Fase A — Primera impresión (alto impacto, ausente hoy)
- [ ] **Splash screen** con logo y animación de entrada.
- [ ] **Onboarding** de 3 pantallas: nombre · módulos activos · primer hábito, con **confetti** al terminar.
- [ ] **Grid de accesos a los 10 módulos** en Inicio (hoy hay 4 accesos rápidos + "Más").

### Fase B — Completar módulos de Fase 3
- [ ] **M07 Familia**: añadir **Colegio** (calendario semanal + tareas/materiales) y **Alimentación de mellizos** (tracker por comidas).
- [ ] **M08 Académico**: añadir **plan de estudios (Gantt simplificado)**, **gestión de clases** (horario + preparación + correcciones) y **lista de lecturas**.
- [ ] **M06 Descarga Mental**: añadir **diario emocional** (rueda de emoción), **pausa de comparación (5 pasos)** y **vaciado semanal** con sugerencia de IA.
- [ ] **M09 Eventos**: **responsable por ítem**, **follow-up de sugerencias** y **plantillas reutilizables** (historial).
- [ ] **M04 Hogar**: frecuencias **Bimestral/Semestral**, **% Yo/Pareja editable** y gesto de **swipe** para completar.

### Fase C — Identidad "viva" y accesibilidad (Fase 4 de la spec)
- [ ] Instalar **Framer Motion**: entrada escalonada, rebote de hábito, stickers flotantes, bottom-sheets deslizables.
- [ ] Soporte **`prefers-reduced-motion`** (desactivar animaciones).
- [ ] Revisión de **accesibilidad**: focus rings, contraste, aria-labels completos.
- [ ] **Hábitos**: grid mensual de 31 burbujas + **confetti** al completar (hoy es semanal).

### Fase D — Pulido técnico
- [ ] **Lazy loading** de módulos pesados (Recharts).
- [ ] Revisar viewport 375 / 390 / 430 px (sin scroll horizontal).

> Nota: la paleta "Wealth", la navegación inferior (Mi Día/Hábitos/Rueda/Finanzas/Más) y el stack Next.js son **decisiones tomadas** y no se consideran deuda.

---

## 4. Gestión operativa / vida real (hallazgos de evaluación)

> Evaluación más allá de la spec: la **amplitud de áreas** está prácticamente completa, pero faltan las piezas **operativas** que evitan depender de la memoria. Esto es lo que convierte a Themis de "organizador visual" en "sistema donde delegar la carga mental".

### Críticos (sin esto, sigues dependiendo de la memoria)
- [ ] **Recordatorios / notificaciones.** Las tareas, la regla y la junta financiera tienen fecha/hora pero **nada avisa**. Necesita notificaciones locales/push. *(Front: UI de recordatorio por ítem · Back: programación/push.)*
- [ ] **Elementos recurrentes.** Arriendo, servicios, guardería, limpieza, hábitos: hoy hay que **re-registrarlos cada vez**. Añadir recurrencia (diaria/semanal/mensual) que genere las instancias automáticamente. *(Front + Back.)*
- [ ] **Cuenta + respaldo en la nube.** Todo vive en `localStorage`; si se borra la caché o cambias de dispositivo, **se pierde**. *(Llega con el backend — sección 6.)*

### Importantes (parte en spec, parte nueva)
- [ ] **Planificación de comidas + lista de compras.** Pieza grande del hogar y hoy **ausente**; conectar con el inventario (lo que baja del umbral entra a la lista). *(Front + Back.)*
- [ ] **Agenda de salud (más allá del ciclo).** Citas médicas, vacunas de los mellizos, medicamentos/controles con recordatorio. Hoy los datos médicos son estáticos. *(Front + Back.)*
- [ ] **Fechas importantes y mantenimiento.** Cumpleaños, renovaciones (seguros/documentos), mantenimiento de casa/coche/electrodomésticos. *(Front + Back.)*

### Deseables (suman, no bloquean)
- [ ] **Delegación real con la pareja** en tiempo real (Hogar y Finanzas compartidas). *(Back — modo pareja.)*
- [ ] **Metas a largo plazo** con seguimiento temporal (la Rueda es foto del mes, no traza objetivos).
- [ ] **Vista única "Hoy"** que agregue tareas + hábitos + regla + pagos del día, y **búsqueda global**.

---

## 5. Preparación del frontend para el backend (capa puente)

Objetivo: que conectar el backend sea **cambiar una capa de datos**, no reescribir componentes.

- [ ] **Capa de acceso a datos (`lib/api/`)**: cliente único (fetch/Supabase) y funciones por entidad (`getHabits`, `upsertTransaction`, …). Hoy los componentes leen Zustand directo; introducir esta capa entre el store y la fuente de datos.
- [ ] **Abstracción de almacenamiento (`useStorage`)**: hook que hoy use `localStorage` y mañana Supabase/AsyncStorage. La spec lo exige para la migración a React Native.
- [ ] **Tipos centralizados (`types/`)**: extraer las interfaces del store (`Habit`, `Transaction`, `BudgetBucket`, `Investment`, `CycleDayLog`, …) a `types/` para compartir entre front y back.
- [ ] **Modo offline-first**: el store sigue siendo la fuente reactiva; el backend sincroniza en segundo plano (no perder datos locales al introducir red).
- [ ] **Sesión/usuario**: reemplazar `userName` fijo por un objeto de usuario autenticado (`id`, `name`, `avatar`, `partnerId`).
- [ ] **IDs**: hoy se generan con `uid()` local; prever IDs de servidor (uuid) y reconciliación.

---

## 6. Backend — Alcance y arquitectura

Stack objetivo (según spec): **Supabase** (Postgres + Auth + Realtime + Storage) y **Anthropic Claude API** para el módulo de Eventos (M09).

### 6.1 Autenticación y modo pareja
- [ ] Auth con email/contraseña (y opcional OAuth).
- [ ] Perfil de usuaria + **vínculo de pareja** (`partner_id`) para compartir "Compartida" de Finanzas y el Hogar.
- [ ] **Realtime** para que ambos miembros vean cambios del fondo compartido / tareas del hogar.

### 6.2 Base de datos — Entidades a migrar
Derivadas del store actual (`lib/store.ts`). Sugerencia de tablas:

| Tabla | Origen en el store | Notas |
|---|---|---|
| `users` | `userName` | + auth, avatar, partner_id |
| `tasks` | `tasks` | planeador / mi día · soporte recurrencia |
| `intentions` | `intentions` | 3 prioridades del día |
| `habits` + `habit_logs` | `habits[].log` | separar logs en su tabla |
| `life_areas` + `wheel_history` | `lifeAreas`, `wheelHistory` | rueda |
| `transactions` | `transactions` | con `scope` personal/compartida · recurrencia |
| `budget` | `mySalary`, `mySharePct`, `partnerSalary`, `partnerSharePct`, `personalBuckets`, `sharedBuckets` | presupuesto |
| `savings` | `savingsGoal`, `saved` | tarro de ahorro |
| `investments` | `investments` | con `scope` |
| `chores` + `inventory` | `chores`, `inventory` | hogar (compartido) |
| `notes` | `notes` | descarga mental |
| `family_members` + `contacts` + `milestones` | `family`, `contacts`, `milestones` | familia |
| `researches` + `journal` | `researches`, `journal` | académico |
| `events` (+ items, guests) | `events` | eventos |
| `cycle` (+ logs, period_starts) | `cycleAvgLength`, `periodLength`, `periodStarts`, `cycleLogs` | ciclo menstrual |
| `reminders` | *(nuevo — sección 4)* | recordatorios/notificaciones |
| `meals` + `shopping_list` | *(nuevo — sección 4)* | comidas y compras |
| `health_events` | *(nuevo — sección 4)* | citas, vacunas, medicación |
| `important_dates` | *(nuevo — sección 4)* | cumpleaños, renovaciones, mantenimiento |

- [ ] Definir **RLS (Row Level Security)**: cada usuaria ve solo lo suyo; recursos "compartidos" visibles para ambos miembros de la pareja.
- [ ] Datos compartidos vs personales: marcar con `scope` u `owner_id`/`couple_id`.

### 6.3 Notificaciones y recurrencia *(habilita la sección 4)*
- [ ] Motor de **recurrencia** (cron/Edge Functions) que genere instancias de tareas/pagos/limpieza.
- [ ] **Notificaciones** push/locales para recordatorios (hábitos, regla, junta, citas, pagos).

### 6.4 IA — Eventos (M09)
- [ ] Mover la generación de checklist de `lib/event-ai.ts` (mock) a un **endpoint** que llame a **Claude API** (modelo más reciente; mantener respuesta categorizada).
- [ ] Proteger la API key en el backend (nunca en el cliente).
- [ ] Añadir **follow-up de sugerencias** como segunda llamada.

### 6.5 Otros servicios
- [ ] **Almacenamiento** (Supabase Storage) si se suben avatares/imágenes.

---

## 7. Hitos / Milestones

- **M1 — Frontend listo para backend**: Fases A y B del frontend + capa puente (sección 5).
- **M2 — Backend base**: Supabase con Auth + tablas + RLS; sincronización del store.
- **M3 — Gestión operativa**: recordatorios + recurrencia + comidas/compras (sección 4 críticos/importantes).
- **M4 — Modo pareja**: realtime para Hogar y Finanzas compartidas.
- **M5 — IA real en Eventos**: Claude API conectada.
- **M6 — Pulido**: Framer Motion, accesibilidad, PWA/instalable, lazy loading.

---

## 8. Definición de "Terminado" (por entrega)
- Compila sin errores (`tsc --noEmit`) y todas las rutas responden 200.
- Sin scroll horizontal en 375–430 px; barra inferior fija.
- Datos persistidos correctamente (local hoy, backend después).
- Tono y voz Themis (cálido, en español).
- Lógica de negocio en hooks/lib aislada de la presentación (preparada para React Native).

---

## 9. Riesgos y decisiones abiertas
- [ ] Confirmar **Supabase** vs. backend propio (Node/Hono ya aparece en dependencias del lockfile).
- [ ] Estrategia de **sincronización/conflictos** offline-first (last-write-wins vs. merge).
- [ ] Reconciliación de **IDs locales** (`uid()`) con IDs de servidor.
- [ ] Alcance de **modo pareja** (¿qué se comparte exactamente?).
- [ ] Canal de **notificaciones** (push web vs. nativo cuando se migre a React Native).
