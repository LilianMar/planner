/** Generador mock de checklists para M09 · Eventos con IA.
 *  Simula la respuesta de Claude API categorizando ítems según el texto libre.
 *  En producción se reemplaza por una llamada real a Anthropic Claude API. */

type SeedItem = { text: string; category: string }

const BASE: SeedItem[] = [
  { text: 'Definir fecha y hora', category: 'Logística' },
  { text: 'Confirmar lugar', category: 'Logística' },
  { text: 'Hacer lista de invitados', category: 'Invitados' },
  { text: 'Enviar invitaciones', category: 'Invitados' },
  { text: 'Definir presupuesto', category: 'Presupuesto' },
]

const RULES: { match: RegExp; items: SeedItem[] }[] = [
  {
    match: /cumple|cumpleaños|fiesta/i,
    items: [
      { text: 'Encargar tarta', category: 'Comida' },
      { text: 'Comprar globos y decoración', category: 'Decoración' },
      { text: 'Preparar piñata', category: 'Decoración' },
      { text: 'Bolsas de chuches', category: 'Detalles' },
      { text: 'Música y juegos', category: 'Entretenimiento' },
    ],
  },
  {
    match: /boda|aniversario/i,
    items: [
      { text: 'Reservar catering', category: 'Comida' },
      { text: 'Contratar fotógrafo', category: 'Servicios' },
      { text: 'Elegir flores', category: 'Decoración' },
      { text: 'Definir vestimenta', category: 'Detalles' },
    ],
  },
  {
    match: /viaje|vacacion|escapada/i,
    items: [
      { text: 'Reservar alojamiento', category: 'Logística' },
      { text: 'Comprar billetes', category: 'Logística' },
      { text: 'Preparar maletas', category: 'Equipaje' },
      { text: 'Documentos y seguros', category: 'Documentación' },
    ],
  },
  {
    match: /cena|comida|almuerzo/i,
    items: [
      { text: 'Planificar menú', category: 'Comida' },
      { text: 'Comprar ingredientes', category: 'Comida' },
      { text: 'Poner la mesa', category: 'Decoración' },
    ],
  },
  {
    match: /reunión|reunion|junta|trabajo/i,
    items: [
      { text: 'Preparar agenda', category: 'Logística' },
      { text: 'Reservar sala', category: 'Logística' },
      { text: 'Enviar recordatorio', category: 'Invitados' },
    ],
  },
]

export interface AIResult {
  name: string
  items: SeedItem[]
}

/** Genera (de forma simulada) una checklist categorizada a partir del texto. */
export function generateChecklist(description: string): Promise<AIResult> {
  const items: SeedItem[] = [...BASE]
  for (const rule of RULES) {
    if (rule.match.test(description)) items.push(...rule.items)
  }
  // Nombre del evento: primera frase corta del texto.
  const name = description.trim().split(/[.\n]/)[0].slice(0, 48) || 'Nuevo evento'
  // Simula la latencia de la API.
  return new Promise((resolve) => setTimeout(() => resolve({ name, items }), 1200))
}
