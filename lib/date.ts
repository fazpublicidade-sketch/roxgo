// "DD/MM/AAAA" enquanto digita
export function maskDate(text: string) {
  const digits = text.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

// "DD/MM/AAAA" → "AAAA-MM-DD", ou null se a data não existe
export function toIsoDate(text: string) {
  const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null
  const [, d, m, y] = match
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  if (date.getDate() !== Number(d) || date.getMonth() !== Number(m) - 1) return null
  return `${y}-${m}-${d}`
}

// "AAAA-MM-DD" → Date local (sem deslocamento de fuso)
export function parseIsoDate(value: string | null | undefined) {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

export function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// Semana começando na segunda-feira, como no calendário do app
export function startOfWeek(date: Date) {
  const d = startOfDay(date)
  const offset = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - offset)
  return d
}

export function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function daysUntil(date: Date) {
  return Math.round((startOfDay(date).getTime() - startOfDay(new Date()).getTime()) / 86_400_000)
}

export const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

export function formatLongDate(date: Date) {
  return capitalize(date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }))
}

export function formatShortDate(date: Date) {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')
}

// "Hoje às 11:47", "Ontem às 08:10", "12 de set. às 07:30"
export function formatWhen(date: Date) {
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const diff = Math.round((startOfDay(new Date()).getTime() - startOfDay(date).getTime()) / 86_400_000)
  if (diff === 0) return `Hoje às ${time}`
  if (diff === 1) return `Ontem às ${time}`
  return `${date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} às ${time}`
}
