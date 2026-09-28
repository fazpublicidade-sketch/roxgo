import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { MapPin, Plus, Trash2 } from 'lucide-react-native'
import { useAthlete } from '../../lib/athlete'
import { useRaces } from '../../lib/hooks'
import { deleteRace, Race } from '../../lib/data'
import { useAppNavigation } from '../../lib/navigation'
import { confirmAction, showAlert } from '../../lib/alert'
import { daysUntil, formatLongDate, formatShortDate, parseIsoDate } from '../../lib/date'
import Screen from '../../components/Screen'
import { Card, PrimaryButton, SectionTitle } from '../../components/ui'
import { COLORS, FONTS, ICON, TYPE } from '../../constants/theme'
import { categoryLabel } from '../../constants/hyrox'

export default function Provas() {
  const { athlete } = useAthlete()
  const navigation = useAppNavigation()
  const races = useRaces(athlete?.id)
  const [removed, setRemoved] = useState<string[]>([])

  if (!athlete) return null

  const list = races.data.filter((r) => !removed.includes(r.id))
  const upcoming = list.filter((r) => daysUntil(parseIsoDate(r.race_date)!) >= 0)
  const past = list.filter((r) => daysUntil(parseIsoDate(r.race_date)!) < 0).reverse()

  async function remove(race: Race) {
    const ok = await confirmAction('Remover prova?', `${race.name} será removida da sua lista.`, 'Remover')
    if (!ok) return
    const { error } = await deleteRace(race.id)
    if (error) showAlert('Erro ao remover', error)
    else setRemoved((r) => [...r, race.id])
  }

  const header = (
    <View style={styles.header}>
      <Text style={TYPE.title}>Provas</Text>
      <Pressable
        onPress={() => navigation.navigate('NovaProva')}
        style={({ pressed }) => [styles.add, pressed && styles.pressed]}
        accessibilityLabel="Adicionar prova"
      >
        <Plus size={22} color={COLORS.text} strokeWidth={ICON.stroke} />
      </Pressable>
    </View>
  )

  return (
    <Screen header={header} edges={['top']}>
      {races.loading ? (
        <ActivityIndicator color={COLORS.textMuted} style={styles.loading} />
      ) : races.missingTable ? (
        <Card>
          <Text style={TYPE.body}>{races.error}</Text>
        </Card>
      ) : list.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[TYPE.title, styles.center]}>Nenhuma prova ainda</Text>
          <Text style={[TYPE.body, styles.center, styles.emptyText]}>
            Cadastre as provas do seu calendário para acompanhar a contagem regressiva.
          </Text>
          <PrimaryButton title="Adicionar prova" onPress={() => navigation.navigate('NovaProva')} />
        </View>
      ) : (
        <>
          <SectionTitle title="Próximas" />
          {upcoming.length === 0 && <Text style={TYPE.body}>Nenhuma prova agendada.</Text>}
          {upcoming.map((race) => (
            <RaceCard key={race.id} race={race} onRemove={() => remove(race)} />
          ))}

          {past.length > 0 && (
            <>
              <SectionTitle title="Realizadas" />
              {past.map((race) => (
                <RaceCard key={race.id} race={race} onRemove={() => remove(race)} past />
              ))}
            </>
          )}
        </>
      )}
    </Screen>
  )
}

function RaceCard({ race, onRemove, past }: { race: Race; onRemove: () => void; past?: boolean }) {
  const date = parseIsoDate(race.race_date)!
  const days = daysUntil(date)
  return (
    <Card style={[styles.card, past ? styles.past : {}]}>
      <View style={styles.flex}>
        <Text style={styles.name}>{race.name}</Text>
        <Text style={[TYPE.body, styles.small]}>{past ? formatShortDate(date) : formatLongDate(date)}</Text>
        <View style={styles.meta}>
          {race.city ? (
            <View style={styles.metaItem}>
              <MapPin size={13} color={COLORS.textDim} strokeWidth={ICON.stroke} />
              <Text style={TYPE.caption}>{race.city}</Text>
            </View>
          ) : null}
          {race.category ? <Text style={TYPE.caption}>{categoryLabel(race.category)}</Text> : null}
        </View>
      </View>
      {!past && (
        <View style={styles.countdown}>
          <Text style={styles.days}>{days}</Text>
          <Text style={styles.daysLabel}>{days === 1 ? 'dia' : 'dias'}</Text>
        </View>
      )}
      <Pressable onPress={onRemove} hitSlop={10} style={styles.remove} accessibilityLabel="Remover prova">
        <Trash2 size={18} color={COLORS.textDim} strokeWidth={ICON.stroke} />
      </Pressable>
    </Card>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  add: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  loading: { marginTop: 40 },
  empty: { paddingTop: 60 },
  center: { textAlign: 'center' },
  emptyText: { marginTop: 8, marginBottom: 28 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18 },
  past: { opacity: 0.6 },
  flex: { flex: 1 },
  name: { fontFamily: FONTS.bold, color: COLORS.text, fontSize: 18, letterSpacing: -0.3 },
  small: { fontSize: 13, marginTop: 2 },
  meta: { flexDirection: 'row', gap: 12, marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  countdown: { alignItems: 'center', minWidth: 56 },
  days: { fontFamily: FONTS.light, color: COLORS.primary, fontSize: 36, letterSpacing: -1 },
  daysLabel: { fontFamily: FONTS.semibold, color: COLORS.textMuted, fontSize: 11 },
  remove: { alignSelf: 'flex-start' },
})
