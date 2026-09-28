import { StyleSheet, Text, View } from 'react-native'
import { Timer } from 'lucide-react-native'
import type { Workout } from '../lib/data'
import { formatWhen } from '../lib/date'
import { Avatar, Card, IconTile, Stat } from './ui'
import { COLORS, FONTS, TYPE } from '../constants/theme'
import {
  benchmarksFor,
  deficitColor,
  formatClock,
  formatDeficit,
  stationByKey,
  StationKey,
  WORKOUT_STAGES,
} from '../constants/hyrox'

type Props = { workout: Workout; athleteName: string | null; category: string | null }

// Card de atividade no feed, no formato do Strava
export default function WorkoutCard({ workout, athleteName, category }: Props) {
  const bench = benchmarksFor(category)
  const station = workout.station ? stationByKey(workout.station) : null
  const title = workout.type === 'simulado' ? 'Simulado HYROX' : `Teste · ${station?.name ?? ''}`

  let stats: { label: string; value: string; color?: string }[]
  let highlight: { icon: typeof Timer; text: string; detail: string; color: string } | null = null

  if (workout.type === 'simulado') {
    const runMs = workout.splits.filter((s) => s.key === 'run_avg').reduce((a, s) => a + s.ms, 0)
    stats = [
      { label: 'Tempo', value: formatClock(workout.total_ms) },
      { label: 'Corridas', value: formatClock(runMs) },
      { label: 'Estações', value: formatClock(workout.total_ms - runMs) },
    ]
    // Estação com maior déficit contra o benchmark
    const worst = workout.splits
      .filter((s) => s.key !== 'run_avg')
      .map((s) => ({ key: s.key, deficit: s.ms / 1000 / bench[s.key as StationKey] - 1 }))
      .sort((a, b) => b.deficit - a.deficit)[0]
    if (worst) {
      const s = stationByKey(worst.key)
      highlight = {
        icon: s.icon,
        text: `Maior gargalo: ${s.name}`,
        detail: formatDeficit(worst.deficit),
        color: deficitColor(worst.deficit, COLORS),
      }
    }
  } else {
    const ideal = station ? bench[station.key] : 0
    const deficit = ideal ? workout.total_ms / 1000 / ideal - 1 : 0
    stats = [
      { label: 'Tempo', value: formatClock(workout.total_ms) },
      { label: 'Ideal', value: formatClock(ideal * 1000) },
      { label: 'Diferença', value: `${deficit > 0 ? '+' : ''}${Math.round(deficit * 100)}%`, color: deficitColor(deficit, COLORS) },
    ]
  }

  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        <Avatar name={athleteName} size={40} />
        <View style={styles.flex}>
          <Text style={TYPE.heading}>{athleteName}</Text>
          <Text style={[TYPE.caption, styles.when]}>
            {formatWhen(new Date(workout.performed_at))} · {workout.type === 'simulado' ? `${WORKOUT_STAGES.length} etapas` : station?.reference}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.stats}>
        {stats.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </View>

      {highlight && (
        <View style={styles.highlight}>
          <IconTile icon={highlight.icon} color={highlight.color} size={36} />
          <View style={styles.flex}>
            <Text style={styles.highlightText}>{highlight.text}</Text>
            <Text style={[styles.highlightDetail, { color: highlight.color }]}>{highlight.detail}</Text>
          </View>
        </View>
      )}
    </Card>
  )
}


const styles = StyleSheet.create({
  card: { padding: 18 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
  when: { marginTop: 2 },
  title: { fontFamily: FONTS.bold, color: COLORS.text, fontSize: 22, letterSpacing: -0.4, marginTop: 16 },
  stats: { flexDirection: 'row', marginTop: 14 },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceAlt,
  },
  highlightText: { fontFamily: FONTS.semibold, color: COLORS.text, fontSize: 14 },
  highlightDetail: { fontFamily: FONTS.semibold, fontSize: 12, marginTop: 2 },
})
