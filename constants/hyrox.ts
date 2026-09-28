import {
  Backpack,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUp,
  Footprints,
  LucideIcon,
  Volleyball,
  Waves,
  Weight,
} from 'lucide-react-native'

export const CATEGORIES = ['INDIVIDUAL PRO', 'INDIVIDUAL OPEN', 'DOUBLES', 'RELAY'] as const
export type Category = (typeof CATEGORIES)[number]

export type StationKey =
  | 'run_avg'
  | 'ski_erg'
  | 'sled_push'
  | 'sled_pull'
  | 'burpee_broad_jump'
  | 'row_erg'
  | 'farmers_carry'
  | 'sandbag_lunges'
  | 'wall_balls'

export type Station = {
  key: StationKey
  icon: LucideIcon
  name: string
  reference: string
  unit: string
}

export const STATIONS: Station[] = [
  { key: 'run_avg', icon: Footprints, name: 'Corrida', reference: 'Pace médio entre estações', unit: 'seg/km' },
  { key: 'ski_erg', icon: ChevronsDown, name: 'SkiErg', reference: '1000m', unit: 'seg' },
  { key: 'sled_push', icon: ChevronsRight, name: 'Sled Push', reference: '50m', unit: 'seg' },
  { key: 'sled_pull', icon: ChevronsLeft, name: 'Sled Pull', reference: '50m', unit: 'seg' },
  { key: 'burpee_broad_jump', icon: ChevronsUp, name: 'Burpee Broad Jump', reference: '80m', unit: 'seg' },
  { key: 'row_erg', icon: Waves, name: 'Row Erg', reference: '1000m', unit: 'seg' },
  { key: 'farmers_carry', icon: Weight, name: "Farmer's Carry", reference: '200m', unit: 'seg' },
  { key: 'sandbag_lunges', icon: Backpack, name: 'Sandbag Lunges', reference: '100m', unit: 'seg' },
  { key: 'wall_balls', icon: Volleyball, name: 'Wall Balls', reference: '100 reps', unit: 'seg' },
]

// Benchmarks por categoria, em segundos
export const BENCHMARKS: Record<Category, Record<StationKey, number>> = {
  'INDIVIDUAL PRO': {
    ski_erg: 195, sled_push: 165, sled_pull: 175,
    burpee_broad_jump: 185, row_erg: 200, farmers_carry: 90,
    sandbag_lunges: 195, wall_balls: 155, run_avg: 270,
  },
  'INDIVIDUAL OPEN': {
    ski_erg: 240, sled_push: 210, sled_pull: 220,
    burpee_broad_jump: 230, row_erg: 245, farmers_carry: 115,
    sandbag_lunges: 240, wall_balls: 195, run_avg: 330,
  },
  'DOUBLES': {
    ski_erg: 220, sled_push: 190, sled_pull: 200,
    burpee_broad_jump: 210, row_erg: 225, farmers_carry: 100,
    sandbag_lunges: 220, wall_balls: 175, run_avg: 300,
  },
  'RELAY': {
    ski_erg: 260, sled_push: 230, sled_pull: 240,
    burpee_broad_jump: 250, row_erg: 265, farmers_carry: 130,
    sandbag_lunges: 260, wall_balls: 210, run_avg: 360,
  },
}

export function benchmarksFor(category: string | null | undefined) {
  return BENCHMARKS[category as Category] ?? BENCHMARKS['INDIVIDUAL OPEN']
}

// Aceita "95" (segundos) ou "1:35" (mm:ss). Retorna null se inválido.
export function parseTime(input: string): number | null {
  const value = input.trim()
  if (/^\d+$/.test(value)) {
    const seconds = Number(value)
    return seconds > 0 ? seconds : null
  }
  const match = value.match(/^(\d+):([0-5]\d)$/)
  if (!match) return null
  const seconds = Number(match[1]) * 60 + Number(match[2])
  return seconds > 0 ? seconds : null
}

export function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export type StationResult = Station & {
  time: number
  benchmark: number
  // Positivo = mais lento que o benchmark (ex: 0.18 = 18% acima do ideal)
  deficit: number
}

export type StationTimes = Partial<Record<StationKey, number | null>>

export function analyze(times: StationTimes, category: string | null | undefined): StationResult[] {
  const bench = benchmarksFor(category)
  return STATIONS.filter((s) => typeof times[s.key] === 'number')
    .map((s) => {
      const time = times[s.key] as number
      const benchmark = bench[s.key]
      return { ...s, time, benchmark, deficit: (time - benchmark) / benchmark }
    })
    .sort((a, b) => b.deficit - a.deficit)
}

export function deficitColor(deficit: number, colors: { success: string; warning: string; danger: string }) {
  if (deficit <= 0) return colors.success
  if (deficit <= 0.2) return colors.warning
  return colors.danger
}

export function formatDeficit(deficit: number) {
  const pct = Math.round(Math.abs(deficit) * 100)
  if (pct === 0) return 'No ideal'
  return deficit > 0 ? `+${pct}% acima do ideal` : `${pct}% melhor que o ideal`
}

// Sequência oficial de uma prova HYROX: 1 km de corrida antes de cada estação
export type WorkoutStage = {
  key: StationKey
  icon: LucideIcon
  name: string
  reference: string
}

const RUN = STATIONS[0]

export const WORKOUT_STAGES: WorkoutStage[] = STATIONS.slice(1).flatMap((station, i) => [
  { key: RUN.key, icon: RUN.icon, name: `Corrida ${i + 1}`, reference: '1 km' },
  { key: station.key, icon: station.icon, name: station.name, reference: station.reference },
])

// Converte as parciais (ms) de um treino completo no formato de station_times
export function lapsToStationTimes(lapsMs: number[]): Record<StationKey, number> {
  const runs: number[] = []
  const times = {} as Record<StationKey, number>
  WORKOUT_STAGES.forEach((stage, i) => {
    const seconds = Math.round(lapsMs[i] / 1000)
    if (stage.key === 'run_avg') runs.push(seconds)
    else times[stage.key] = seconds
  })
  times.run_avg = Math.round(runs.reduce((a, b) => a + b, 0) / runs.length)
  return times
}

// Cronômetro: "12:34" ou "1:02:34"
export function formatClock(ms: number) {
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${String(m).padStart(2, '0')}:${ss}`
}

export const CATEGORY_LABELS: Record<Category, string> = {
  'INDIVIDUAL PRO': 'Individual Pro',
  'INDIVIDUAL OPEN': 'Individual Open',
  DOUBLES: 'Doubles',
  RELAY: 'Relay',
}

export const EXPERIENCES = [
  { value: 'INICIANTE', label: 'Iniciante', description: 'Primeira ou segunda prova' },
  { value: 'INTERMEDIÁRIO', label: 'Intermediário', description: 'Já completei algumas provas' },
  { value: 'AVANÇADO', label: 'Avançado', description: 'Busco meu PR constantemente' },
  { value: 'ELITE', label: 'Elite', description: 'Compito em nível nacional' },
]

export const categoryLabel = (value: string | null | undefined) => CATEGORY_LABELS[value as Category] ?? value ?? ''
export const experienceLabel = (value: string | null | undefined) =>
  EXPERIENCES.find((e) => e.value === value)?.label ?? value ?? ''

export function stationByKey(key: StationKey) {
  return STATIONS.find((s) => s.key === key) ?? STATIONS[0]
}

// Segundos que o atleta ganharia na prova chegando ao ideal em cada etapa.
// A corrida conta 8 vezes (8 x 1 km); estações já no ideal não somam.
export function potentialGainSeconds(results: StationResult[]) {
  return results.reduce((sum, r) => {
    const gap = Math.max(0, r.time - r.benchmark)
    return sum + (r.key === 'run_avg' ? gap * 8 : gap)
  }, 0)
}
