import { useMemo } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { CalendarDays, ChevronRight, Dumbbell, LucideIcon, Plus, Timer, Zap } from 'lucide-react-native'
import { useAthlete } from '../../lib/athlete'
import { useRaces, useWorkouts } from '../../lib/hooks'
import { useAppNavigation, TabParamList } from '../../lib/navigation'
import { addDays, daysUntil, formatLongDate, parseIsoDate, startOfWeek } from '../../lib/date'
import Screen from '../../components/Screen'
import Logo from '../../components/Logo'
import WeekStreak from '../../components/WeekStreak'
import GapHero from '../../components/GapHero'
import WorkoutCard from '../../components/WorkoutCard'
import { Avatar, Card, IconTile, SectionTitle } from '../../components/ui'
import { COLORS, FONTS, ICON, TYPE } from '../../constants/theme'
import { categoryLabel } from '../../constants/hyrox'

// Histórico suficiente para calcular a sequência de semanas
const STREAK_WINDOW_WEEKS = 26

type NextRace = { name: string; date: Date | null; category: string | null }

export default function Home() {
  const { athlete } = useAthlete()
  const root = useAppNavigation()
  const tabs = useNavigation<BottomTabNavigationProp<TabParamList>>()
  const since = useMemo(() => addDays(startOfWeek(new Date()), -7 * STREAK_WINDOW_WEEKS), [])
  const races = useRaces(athlete?.id)
  const workouts = useWorkouts(athlete?.id, { since })

  const dates = useMemo(() => workouts.data.map((w) => new Date(w.performed_at)), [workouts.data])

  if (!athlete) return null

  // Próxima prova: a mais próxima ainda por vir; sem a tabela nova, usa a do onboarding
  const upcoming: NextRace[] = races.data
    .map((r) => ({ name: r.name, date: parseIsoDate(r.race_date), category: r.category }))
    .filter((r) => r.date && daysUntil(r.date) >= 0)
  const fallback: NextRace[] =
    races.missingTable && athlete.next_race
      ? [{ name: athlete.next_race, date: parseIsoDate(athlete.race_date), category: athlete.category }]
      : []
  const nextRace = upcoming[0] ?? fallback[0]
  const days = nextRace?.date ? daysUntil(nextRace.date) : null

  const header = (
    <View style={styles.header}>
      <Logo width={92} />
      <Pressable onPress={() => tabs.navigate('Perfil')} hitSlop={8} accessibilityLabel="Perfil">
        <Avatar name={athlete.name} size={36} />
      </Pressable>
    </View>
  )

  const shortcuts: { icon: LucideIcon; label: string; onPress: () => void }[] = [
    { icon: Timer, label: 'Simulado completo', onPress: () => root.navigate('Gravar') },
    { icon: Dumbbell, label: 'Teste de estação', onPress: () => tabs.navigate('Treinar') },
    { icon: Zap, label: 'Diagnóstico', onPress: () => root.navigate('Diagnostico') },
    { icon: Plus, label: 'Nova prova', onPress: () => root.navigate('NovaProva') },
  ]

  return (
    <Screen header={header} edges={['top']}>
      <WeekStreak dates={dates} />

      <SectionTitle title="Próxima prova" action="Ver provas" onAction={() => tabs.navigate('Provas')} />
      {nextRace ? (
        <Pressable onPress={() => tabs.navigate('Provas')}>
          <Card style={styles.raceCard}>
            <View style={styles.raceInfo}>
              <Text style={styles.raceName} numberOfLines={2}>
                {nextRace.name}
              </Text>
              {nextRace.date && <Text style={[TYPE.body, styles.raceDate]}>{formatLongDate(nextRace.date)}</Text>}
              {nextRace.category && <Text style={TYPE.caption}>{categoryLabel(nextRace.category)}</Text>}
            </View>
            <View style={styles.countdown}>
              <Text style={styles.days}>{days ?? '--'}</Text>
              <Text style={styles.daysLabel}>{days === 1 ? 'dia' : 'dias'}</Text>
            </View>
          </Card>
        </Pressable>
      ) : (
        <Pressable onPress={() => root.navigate('NovaProva')}>
          <Card style={styles.emptyRace}>
            <IconTile icon={CalendarDays} color={COLORS.primary} />
            <View style={styles.flex}>
              <Text style={TYPE.heading}>Cadastre sua próxima prova</Text>
              <Text style={[TYPE.body, styles.small]}>Para acompanhar a contagem regressiva</Text>
            </View>
            <ChevronRight size={20} color={COLORS.textDim} strokeWidth={ICON.stroke} />
          </Card>
        </Pressable>
      )}

      <View style={styles.gap}>
        <GapHero athlete={athlete} />
      </View>

      <View style={styles.grid}>
        {shortcuts.map((s) => (
          <Pressable key={s.label} onPress={s.onPress} style={({ pressed }) => [styles.shortcut, pressed && styles.pressed]}>
            <s.icon size={24} color={COLORS.primary} strokeWidth={ICON.stroke} />
            <Text style={styles.shortcutLabel}>{s.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionTitle title="Atividades recentes" />
      {workouts.loading ? (
        <ActivityIndicator color={COLORS.textMuted} style={styles.loading} />
      ) : workouts.missingTable ? (
        <Card>
          <Text style={TYPE.body}>{workouts.error}</Text>
        </Card>
      ) : workouts.data.length === 0 ? (
        <Card style={styles.emptyFeed}>
          <Text style={TYPE.heading}>Nenhum treino gravado ainda</Text>
          <Text style={[TYPE.body, styles.small]}>
            Toque no botão central para gravar um simulado ou testar uma estação.
          </Text>
        </Card>
      ) : (
        workouts.data
          .slice(0, 10)
          .map((w) => <WorkoutCard key={w.id} workout={w} athleteName={athlete.name} category={athlete.category} />)
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  flex: { flex: 1 },
  gap: { marginTop: 4, marginBottom: 4 },
  small: { fontSize: 13, marginTop: 2 },
  raceCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18 },
  raceInfo: { flex: 1, gap: 2 },
  raceName: { fontFamily: FONTS.bold, color: COLORS.text, fontSize: 20, letterSpacing: -0.3 },
  raceDate: { fontSize: 13 },
  countdown: { alignItems: 'center', minWidth: 72 },
  days: { fontFamily: FONTS.thin, color: COLORS.primary, fontSize: 52, letterSpacing: -1.5, lineHeight: 56 },
  daysLabel: { fontFamily: FONTS.semibold, color: COLORS.textMuted, fontSize: 12 },
  emptyRace: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10, marginTop: 4 },
  shortcut: {
    width: '48.5%',
    height: 96,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  shortcutLabel: { fontFamily: FONTS.medium, color: COLORS.text, fontSize: 14 },
  pressed: { opacity: 0.7 },
  loading: { marginVertical: 24 },
  emptyFeed: { paddingVertical: 20 },
})
