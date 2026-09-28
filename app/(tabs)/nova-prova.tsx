import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { CalendarDays, Flag, MapPin } from 'lucide-react-native'
import { useAthlete } from '../../lib/athlete'
import { addRace } from '../../lib/data'
import { useAppNavigation } from '../../lib/navigation'
import { showAlert } from '../../lib/alert'
import { maskDate, toIsoDate } from '../../lib/date'
import Screen from '../../components/Screen'
import { BackHeader, Chip, Input, PrimaryButton } from '../../components/ui'
import { TYPE } from '../../constants/theme'
import { CATEGORIES, CATEGORY_LABELS } from '../../constants/hyrox'

export default function NovaProva() {
  const { athlete } = useAthlete()
  const navigation = useAppNavigation()
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [city, setCity] = useState('')
  const [category, setCategory] = useState<string | null>(athlete?.category ?? null)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!athlete) return
    if (!name.trim() || !date) {
      showAlert('Atenção', 'Preencha o nome e a data da prova')
      return
    }
    const isoDate = toIsoDate(date)
    if (!isoDate) {
      showAlert('Atenção', 'Data inválida. Use o formato DD/MM/AAAA')
      return
    }
    setSaving(true)
    const { error } = await addRace({
      athlete_id: athlete.id,
      name: name.trim(),
      race_date: isoDate,
      city: city.trim() || null,
      category,
    })
    setSaving(false)
    if (error) {
      showAlert('Erro ao salvar', error)
      return
    }
    navigation.goBack()
  }

  return (
    <Screen
      header={<BackHeader title="Nova prova" onBack={() => navigation.goBack()} />}
      footer={
        <View style={styles.footer}>
          <PrimaryButton title="Salvar prova" onPress={save} loading={saving} />
        </View>
      }
    >
      <Text style={styles.label}>Nome da prova</Text>
      <Input icon={Flag} placeholder="Ex: HYROX São Paulo" value={name} onChangeText={setName} />

      <Text style={styles.label}>Data</Text>
      <Input
        icon={CalendarDays}
        placeholder="DD/MM/AAAA"
        value={date}
        onChangeText={(t) => setDate(maskDate(t))}
        keyboardType="number-pad"
        maxLength={10}
      />

      <Text style={styles.label}>Cidade (opcional)</Text>
      <Input icon={MapPin} placeholder="Ex: São Paulo" value={city} onChangeText={setCity} />

      <Text style={styles.label}>Categoria</Text>
      <View style={styles.grid}>
        {CATEGORIES.map((c) => (
          <Chip key={c} label={CATEGORY_LABELS[c]} selected={category === c} onPress={() => setCategory(c)} style={styles.chip} />
        ))}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  label: { ...TYPE.label, marginTop: 18, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  chip: { width: '48.5%' },
  footer: { padding: 16 },
})
