/** Banco de Frases Motivacionales (Especificación THEMIS §9.1).
 *  Rotan en cada ingreso a la app — aparecen bajo el saludo en Inicio. */
export const MOTIVATIONAL_PHRASES = [
  'Pequeñas acciones diarias crean grandes cambios en tu vida.',
  'Hoy tienes el poder de diseñar una vida con propósito, bienestar y equilibrio.',
  'Tu camino es único. Menos comparación, más conexión contigo.',
  'No se trata de ser perfecta, sino de ser completamente tú.',
  'La clave está en el equilibrio, no en la perfección.',
  'Cuando todo está en un sistema, puedes verlo, ordenarlo y tomar mejores decisiones.',
  'Que todo va a estar bien. Que vas a poder con eso.',
  'Tú eres capaz de todo lo que te propones — hoy y siempre.',
  'Florecer no es llegar, es el camino de cada día.',
  'Cuídate primero. Desde ahí puedes dar lo mejor a todos.',
] as const

/** Devuelve una frase al azar. Llamar dentro de un efecto/cliente para
 *  evitar desajustes de hidratación (el resultado varía en cada render). */
export function randomPhrase() {
  return MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)]
}
