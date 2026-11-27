/**
 * Separa el aviso de contacto para no mostrarlo dos veces: el backend usa
 * "Contáctanos" como señal y la interfaz lo reemplaza por una acción.
 */
export function splitContactMessage(message: string): {
  text: string
  needsContact: boolean
} {
  const needsContact = /contáctanos/i.test(message)
  const text = message.replace(/\s*contáctanos\.?\s*$/i, "").trim()
  return { text, needsContact }
}
