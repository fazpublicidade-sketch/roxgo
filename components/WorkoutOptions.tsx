import { Pressable, StyleSheet, Text, View } from 'react-native'
import { ChevronRight, Timer } from 'lucide-react-native'
import type { Workout } from '../lib/data'
import { useAppNavigation } from '../lib/navigation'
import { ActionGradient, Card, IconTile } from './ui'
import { COLORS, FONTS, ICON, TYPE } from '../constants/theme'
import { formatClock, STATIONS, StationKey } from '../constants/hyrox'

// Melhor tempo de cada estação nos testes isolados
export function bestStationTimes(workouts: Workout[]) {
  const best: Partial<Record<StationKey, number>> = {}
  for (const w of workouts) {
    if (w.type !== 'estacao' || !w.station) continue
    if (best[w.station] === undefined || w.total_ms < best[w.station]!) best[w.station] = w.total_ms
  }
  return best
}

export function SimuladoCard({ onStart }: { onStart?: () => void }) {
  const navigation = useAppNavigation()
  return (
    <Pressable
      onPress={() => {
        onStart?.()
        navigation.navigate('Gravar')
      }}
      style={({ pressed }) => [styles.simulado, pressed && styles.pressed]}
    >
      <ActionGradient />
      <View style={styles.simuladoIcon}>
        <Timer size={22} color={COLORS.onPrimary} strokeWidth={2} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.simuladoTitle}>Simulado HYROX completo</Text>
        <Text style={styles.simuladoSub}>8 km + 8 estações · 16 etapas</Text>
      </View>
      <View>
        <ChevronRight size={22} color={COLORS.onPrimary} strokeWidth={2} />
      </View>
    </Pressable>
  )
}

export function StationTestList({ bests, onStart }: { bests: Partial<Record<StationKey, number>>; onStart?: () => void }) {
  const navigation = useAppNavigation()
  return (
    <Card style={styles.list}>
      {STATIONS.map((station, i) => {
        const best = bests[station.key]
        return (
          <Pressable
            key={station.key}
            onPress={() => {
              onStart?.()
              navigation.navigate('Gravar', { station: station.key })
            }}
            style={({ pressed }) => [styles.row, i < STATIONS.length - 1 && styles.divider, pressed && styles.rowPressed]}
          >
            <IconTile icon={station.icon} color={COLORS.primary} />
            <View style={styles.flex}>
              <Text style={TYPE.heading}>{station.key === 'run_avg' ? 'Corrida 1 km' : station.name}</Text>
              <Text style={[TYPE.body, styles.sub]}>
                {station.key === 'run_avg' ? 'Pace de prova' : station.reference}
              </Text>
            </View>
            {best !== undefined && (
              <View style={styles.best}>
                <Text style={TYPE.caption}>Melhor</Text>
                <Text style={styles.bestValue}>{formatClock(best)}</Text>
              </View>
            )}
            <ChevronRight size={20} color={COLORS.textDim} strokeWidth={ICON.stroke} />
          </Pressable>
        )
      })}
    </Card>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },
  simulado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  simuladoIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: COLORS.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simuladoTitle: { fontFamily: FONTS.bold, color: COLORS.onPrimary, fontSize: 17 },
  simuladoSub: { fontFamily: FONTS.medium, color: 'rgba(0,0,0,0.65)', fontSize: 13, marginTop: 1 },
  list: { paddingVertical: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border },
  rowPressed: { opacity: 0.6 },
  sub: { fontSize: 13, marginTop: 1 },
  best: { alignItems: 'flex-end', marginRight: 4 },
  bestValue: { fontFamily: FONTS.regular, color: COLORS.text, fontSize: 15, fontVariant: ['tabular-nums'] },
})
