import { StyleSheet, Text } from 'react-native'
import { Activity, Bot, ClipboardList, Zap } from 'lucide-react-native'
import { useAthlete } from '../../lib/athlete'
import { useWorkouts } from '../../lib/hooks'
import { useAppNavigation } from '../../lib/navigation'
import Screen from '../../components/Screen'
import { Badge, Card, ListRow, SectionTitle } from '../../components/ui'
import { bestStationTimes, SimuladoCard, StationTestList } from '../../components/WorkoutOptions'
import { TYPE } from '../../constants/theme'

export default function Treinar() {
  const { athlete } = useAthlete()
  const navigation = useAppNavigation()
  const workouts = useWorkouts(athlete?.id)

  if (!athlete) return null

  return (
    <Screen edges={['top']}>
      <Text style={[TYPE.title, styles.title]}>Treinar</Text>

      <SimuladoCard />

      <SectionTitle title="Testes por estação" />
      <Text style={[TYPE.body, styles.intro]}>
        Grave uma estação isolada e compare com o ideal da sua categoria.
      </Text>
      <StationTestList bests={bestStationTimes(workouts.data)} />

      <SectionTitle title="Análise" />
      <Card style={styles.list}>
        <ListRow
          icon={Zap}
          title="Diagnóstico manual"
          subtitle="Digite seus tempos de treino ou prova"
          onPress={() => navigation.navigate('Diagnostico')}
        />
        <ListRow
          icon={Activity}
          title="Última análise"
          subtitle="Gargalos do seu último simulado ou diagnóstico"
          onPress={() => navigation.navigate('Resultado', { athleteId: athlete.id, category: athlete.category ?? '' })}
          last
        />
      </Card>

      <SectionTitle title="Em breve" />
      <Card style={styles.list}>
        <ListRow icon={ClipboardList} title="Plano de treino" subtitle="Treinos focados nos seus gargalos" disabled right={<Badge>Em breve</Badge>} />
        <ListRow icon={Bot} title="Coach IA" subtitle="Tire dúvidas sobre sua preparação" disabled right={<Badge>Em breve</Badge>} last />
      </Card>
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: { marginTop: 8, marginBottom: 16 },
  intro: { fontSize: 14, marginTop: -4, marginBottom: 12 },
  list: { paddingVertical: 2 },
})
