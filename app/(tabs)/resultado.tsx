import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { AppStackParamList } from '../../lib/navigation'
import { supabase } from '../../lib/supabase'
import { showAlert } from '../../lib/alert'
import Screen from '../../components/Screen'
import { BackHeader, Card, IconTile, PrimaryButton, ProgressBar, SecondaryButton, Stat } from '../../components/ui'
import { COLORS, FONTS, TYPE } from '../../constants/theme'
import { analyze, deficitColor, formatDeficit, formatTime, StationResult } from '../../constants/hyrox'

type Props = NativeStackScreenProps<AppStackParamList, 'Resultado'>

// "+18%" / "-5%" / "0%"
function shortDeficit(deficit: number) {
  const pct = Math.round(deficit * 100)
  return pct > 0 ? `+${pct}%` : `${pct}%`
}

export default function Resultado({ navigation, route }: Props) {
  const { athleteId, category } = route.params
  const [results, setResults] = useState<StationResult[] | null>(null)

  useEffect(() => {
    supabase
      .from('station_times')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) showAlert('Erro ao carregar', error.message)
        setResults(data ? analyze(data, category) : [])
      })
  }, [athleteId, category])

  const worst = results?.[0]

  return (
    <Screen header={<BackHeader title="Análise de Performance" onBack={() => navigation.popToTop()} />}>
      {results === null ? (
        <ActivityIndicator color={COLORS.textMuted} size="large" style={styles.loading} />
      ) : !worst ? (
        <Text style={[TYPE.body, styles.loading]}>Nenhum diagnóstico encontrado.</Text>
      ) : (
        <>
          <Card style={styles.hero}>
            <Text style={[TYPE.caption, styles.heroLabel]}>
              {worst.deficit > 0 ? 'SEU MAIOR GARGALO' : 'SUA ESTAÇÃO MAIS APERTADA'}
            </Text>
            <View style={styles.heroTop}>
              <IconTile icon={worst.icon} color={deficitColor(worst.deficit, COLORS)} size={48} />
              <Text style={[TYPE.title, styles.flex]}>{worst.name}</Text>
            </View>
            <View style={styles.stats}>
              <Stat label="Seu tempo" value={formatTime(worst.time)} />
              <Stat label="Ideal" value={formatTime(worst.benchmark)} />
              <Stat label="Diferença" value={shortDeficit(worst.deficit)} color={deficitColor(worst.deficit, COLORS)} />
            </View>
            <Text style={TYPE.body}>Foco aqui vai ter o maior impacto no seu resultado.</Text>
          </Card>

          <View style={styles.sectionRow}>
            <Text style={styles.section}>Ranking das estações</Text>
            <Text style={TYPE.caption}>{category || 'INDIVIDUAL OPEN'}</Text>
          </View>

          <Card style={styles.list}>
            {results.map((r, i) => {
              const color = deficitColor(r.deficit, COLORS)
              return (
                <View key={r.key} style={[styles.row, i < results.length - 1 && styles.divider]}>
                  <Text style={styles.rank}>{i + 1}</Text>
                  <View style={styles.flex}>
                    <View style={styles.rowTop}>
                      <Text style={[TYPE.heading, styles.flex]} numberOfLines={1}>
                        {r.name}
                      </Text>
                      <Text style={[styles.rowDeficit, { color }]}>{formatDeficit(r.deficit)}</Text>
                    </View>
                    {/* Trilho = benchmark; preenchimento = quão perto do ideal o atleta está */}
                    <ProgressBar ratio={r.benchmark / r.time} color={color} />
                    <Text style={[TYPE.caption, styles.rowTimes]}>
                      {formatTime(r.time)} · ideal {formatTime(r.benchmark)}
                    </Text>
                  </View>
                </View>
              )
            })}
          </Card>

          <PrimaryButton
            title="Ver plano de treino"
            onPress={() => showAlert('Em breve', 'O plano de treino personalizado está chegando.')}
            style={styles.buttonTop}
          />
          <SecondaryButton
            title="Novo diagnóstico"
            onPress={() => navigation.navigate('Diagnostico')}
            style={styles.buttonBottom}
          />
        </>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  loading: { marginTop: 80, textAlign: 'center' },
  flex: { flex: 1 },
  hero: { marginTop: 4, padding: 20 },
  heroLabel: { letterSpacing: 1.2, marginBottom: 12 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stats: { flexDirection: 'row', marginTop: 20, marginBottom: 16 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 12, marginBottom: 10 },
  section: { fontFamily: FONTS.bold, color: COLORS.text, fontSize: 18 },
  list: { paddingVertical: 4 },
  row: { flexDirection: 'row', paddingVertical: 14, gap: 12 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border },
  rank: { fontFamily: FONTS.medium, color: COLORS.textDim, fontSize: 15, width: 18, marginTop: 1 },
  rowTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  rowDeficit: { fontFamily: FONTS.semibold, fontSize: 12 },
  rowTimes: { marginTop: 6 },
  buttonTop: { marginTop: 12 },
  buttonBottom: { marginTop: 12, marginBottom: 12 },
})
