import { StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { Flag, LogOut, Pencil } from 'lucide-react-native'
import { supabase } from '../../lib/supabase'
import { useAthlete } from '../../lib/athlete'
import { useWorkouts } from '../../lib/hooks'
import { TabParamList, useAppNavigation } from '../../lib/navigation'
import { confirmAction } from '../../lib/alert'
import Screen from '../../components/Screen'
import { Avatar, Card, ListRow, SectionTitle, Stat } from '../../components/ui'
import { TYPE } from '../../constants/theme'
import { categoryLabel, experienceLabel } from '../../constants/hyrox'

export default function Perfil() {
  const { athlete } = useAthlete()
  const root = useAppNavigation()
  const tabs = useNavigation<BottomTabNavigationProp<TabParamList>>()
  const workouts = useWorkouts(athlete?.id)

  if (!athlete) return null

  const simulados = workouts.data.filter((w) => w.type === 'simulado').length
  const testes = workouts.data.filter((w) => w.type === 'estacao').length

  async function signOut() {
    if (await confirmAction('Sair da conta?', 'Você precisará entrar novamente.', 'Sair')) {
      supabase.auth.signOut()
    }
  }

  return (
    <Screen edges={['top']}>
      <View style={styles.profile}>
        <Avatar name={athlete.name} size={84} />
        <Text style={[TYPE.title, styles.name]}>{athlete.name}</Text>
        <Text style={TYPE.body}>
          {[categoryLabel(athlete.category), experienceLabel(athlete.experience)].filter(Boolean).join(' · ')}
        </Text>
      </View>

      <Card style={styles.stats}>
        <Stat label="Treinos" value={String(workouts.data.length)} />
        <Stat label="Simulados" value={String(simulados)} />
        <Stat label="Testes" value={String(testes)} />
      </Card>

      <SectionTitle title="Conta" />
      <Card style={styles.list}>
        <ListRow icon={Pencil} title="Editar perfil" subtitle="Nome, categoria e nível" onPress={() => root.navigate('EditarPerfil')} />
        <ListRow icon={Flag} title="Minhas provas" subtitle="Calendário de provas" onPress={() => tabs.navigate('Provas')} last />
      </Card>

      <Card style={styles.list}>
        <ListRow icon={LogOut} title="Sair" onPress={signOut} last right={<View />} />
      </Card>

      <Text style={[TYPE.caption, styles.email]}>{athlete.email}</Text>
    </Screen>
  )
}

const styles = StyleSheet.create({
  profile: { alignItems: 'center', paddingTop: 16, paddingBottom: 20 },
  name: { marginTop: 14, marginBottom: 2 },
  stats: { flexDirection: 'row', paddingVertical: 16 },
  list: { paddingVertical: 2 },
  email: { textAlign: 'center', marginTop: 8 },
})

