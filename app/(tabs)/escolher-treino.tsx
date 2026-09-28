import { Pressable, StyleSheet, Text, View } from 'react-native'
import { X } from 'lucide-react-native'
import { useAthlete } from '../../lib/athlete'
import { useWorkouts } from '../../lib/hooks'
import { useAppNavigation } from '../../lib/navigation'
import Screen from '../../components/Screen'
import { SectionTitle } from '../../components/ui'
import { bestStationTimes, SimuladoCard, StationTestList } from '../../components/WorkoutOptions'
import { COLORS, FONTS, ICON } from '../../constants/theme'

// Aberta pelo botão central: escolhe entre simulado completo e teste de estação
export default function EscolherTreino() {
  const { athlete } = useAthlete()
  const navigation = useAppNavigation()
  const workouts = useWorkouts(athlete?.id)

  // Fecha esta tela antes de abrir a gravação, para o "voltar" dela ir direto às abas
  const closeOnStart = () => navigation.goBack()

  const header = (
    <View style={styles.header}>
      <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.side} accessibilityLabel="Fechar">
        <X size={24} color={COLORS.text} strokeWidth={ICON.stroke} />
      </Pressable>
      <Text style={styles.title}>Gravar treino</Text>
      <View style={styles.side} />
    </View>
  )

  return (
    <Screen header={header}>
      <SimuladoCard onStart={closeOnStart} />
      <SectionTitle title="Teste de estação" />
      <StationTestList bests={bestStationTimes(workouts.data)} onStart={closeOnStart} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  side: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontFamily: FONTS.bold, color: COLORS.text, fontSize: 17 },
})
