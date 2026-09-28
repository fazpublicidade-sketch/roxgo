import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { ChevronRight, Target } from 'lucide-react-native'
import type { Athlete } from '../lib/athlete'
import { useLatestStationTimes } from '../lib/hooks'
import { useAppNavigation } from '../lib/navigation'
import { Card, IconTile, PrimaryButton, ProgressBar, SecondaryButton } from './ui'
import { COLORS, FONTS, ICON, TYPE } from '../constants/theme'
import { analyze, deficitColor, formatTime, potentialGainSeconds, StationTimes } from '../constants/hyrox'

// Destaque da Home: onde o atleta mais perde tempo — o diferencial do ROXGO
export default function GapHero({ athlete }: { athlete: Athlete }) {
  const navigation = useAppNavigation()
  const latest = useLatestStationTimes(athlete.id)

  if (latest.loading) {
    return (
      <Card style={styles.card}>
        <ActivityIndicator color={COLORS.textMuted} style={styles.loading} />
      </Card>
    )
  }

  const results = latest.data ? analyze(latest.data as StationTimes, athlete.category) : []
  const worst = results[0]

  if (!worst) {
    return (
      <Card style={styles.card}>
        <Text style={styles.kicker}>ONDE VOCÊ PERDE TEMPO</Text>
        <View style={styles.emptyHead}>
          <IconTile icon={Target} color={COLORS.primary} size={48} />
          <Text style={[TYPE.title, styles.emptyTitle]}>Descubra seus gargalos</Text>
        </View>
        <Text style={TYPE.body}>
          Grave um simulado ou informe seus tempos e mostramos exatamente em quais estações você está perdendo mais
          tempo em relação à sua categoria.
        </Text>
        <PrimaryButton title="Gravar simulado" onPress={() => navigation.navigate('Gravar')} style={styles.cta} />
        <SecondaryButton title="Diagnóstico rápido" onPress={() => navigation.navigate('Diagnostico')} style={styles.ctaSecondary} />
      </Card>
    )
  }

  const gain = potentialGainSeconds(results)
  const top = results.filter((r) => r.deficit > 0).slice(0, 3)
  const worstColor = deficitColor(worst.deficit, COLORS)
  const openAnalysis = () => navigation.navigate('Resultado', { athleteId: athlete.id, category: athlete.category ?? '' })

  return (
    <Card style={styles.card}>
      <Text style={styles.kicker}>ONDE VOCÊ PRECISA MELHORAR</Text>

      <View style={styles.worstRow}>
        <IconTile icon={worst.icon} color={worstColor} size={48} />
        <View style={styles.flex}>
          <Text style={TYPE.caption}>Maior gargalo</Text>
          <Text style={styles.worstName}>{worst.name}</Text>
        </View>
        <Text style={[styles.worstPct, { color: worstColor }]}>
          {worst.deficit > 0 ? '+' : ''}
          {Math.round(worst.deficit * 100)}%
        </Text>
      </View>

      {gain > 0 && (
        <View style={styles.gain}>
          <Text style={styles.gainValue}>
            −{formatTime(gain)}
            <Text style={styles.gainUnit}> min</Text>
          </Text>
          <Text style={styles.gainLabel}>
            é o tempo que você pode tirar da sua prova chegando ao ideal da categoria
          </Text>
        </View>
      )}

      {top.length > 0 && (
        <View style={styles.list}>
          {top.map((r) => {
            const color = deficitColor(r.deficit, COLORS)
            return (
              <View key={r.key} style={styles.item}>
                <View style={styles.itemTop}>
                  <Text style={styles.itemName}>{r.name}</Text>
                  <Text style={[styles.itemPct, { color }]}>+{Math.round(r.deficit * 100)}%</Text>
                </View>
                <ProgressBar ratio={r.benchmark / r.time} color={color} />
              </View>
            )
          })}
        </View>
      )}

      <PrimaryButton
        title={`Treinar ${worst.key === 'run_avg' ? 'corrida' : worst.name}`}
        onPress={() => navigation.navigate('Gravar', { station: worst.key })}
        style={styles.cta}
      />
      <Pressable onPress={openAnalysis} style={styles.link} hitSlop={8}>
        <Text style={styles.linkText}>Ver análise completa</Text>
        <ChevronRight size={18} color={COLORS.primary} strokeWidth={ICON.stroke} />
      </Pressable>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { padding: 20, marginBottom: 8 },
  loading: { marginVertical: 40 },
  flex: { flex: 1 },
  kicker: { fontFamily: FONTS.bold, color: COLORS.primary, fontSize: 11, letterSpacing: 1.4, marginBottom: 16 },
  emptyHead: { gap: 14, marginBottom: 8 },
  emptyTitle: { fontSize: 24 },
  worstRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  worstName: { fontFamily: FONTS.bold, color: COLORS.text, fontSize: 24, letterSpacing: -0.5 },
  worstPct: { fontFamily: FONTS.light, fontSize: 30, letterSpacing: -1, fontVariant: ['tabular-nums'] },
  gain: {
    marginTop: 18,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  gainValue: { fontFamily: FONTS.thin, color: COLORS.text, fontSize: 48, letterSpacing: -1.5, fontVariant: ['tabular-nums'] },
  gainUnit: { fontFamily: FONTS.regular, color: COLORS.textMuted, fontSize: 18, letterSpacing: 0 },
  gainLabel: { ...TYPE.body, fontSize: 13, marginTop: 2 },
  list: { gap: 12, marginTop: 16 },
  item: { gap: 6 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { fontFamily: FONTS.medium, color: COLORS.text, fontSize: 14 },
  itemPct: { fontFamily: FONTS.medium, fontSize: 13, fontVariant: ['tabular-nums'] },
  cta: { marginTop: 20 },
  ctaSecondary: { marginTop: 10 },
  link: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2, marginTop: 14 },
  linkText: { fontFamily: FONTS.semibold, color: COLORS.primary, fontSize: 15 },
})
