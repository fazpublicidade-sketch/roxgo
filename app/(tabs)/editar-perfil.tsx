import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { User } from 'lucide-react-native'
import { supabase } from '../../lib/supabase'
import { useAthlete } from '../../lib/athlete'
import { useAppNavigation } from '../../lib/navigation'
import { showAlert } from '../../lib/alert'
import Screen from '../../components/Screen'
import { BackHeader, Chip, Input, OptionRow, PrimaryButton } from '../../components/ui'
import { TYPE } from '../../constants/theme'
import { CATEGORIES, CATEGORY_LABELS, EXPERIENCES } from '../../constants/hyrox'

export default function EditarPerfil() {
  const { athlete, refreshAthlete } = useAthlete()
  const navigation = useAppNavigation()
  const [name, setName] = useState(athlete?.name ?? '')
  const [category, setCategory] = useState(athlete?.category ?? null)
  const [experience, setExperience] = useState(athlete?.experience ?? null)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!athlete) return
    if (!name.trim()) {
      showAlert('Atenção', 'Digite seu nome')
      return
    }
    setSaving(true)
    const { error } = await supabase
      .from('athletes')
      .update({ name: name.trim(), category, experience })
      .eq('id', athlete.id)
    if (error) {
      setSaving(false)
      showAlert('Erro ao salvar', error.message)
      return
    }
    await refreshAthlete()
    setSaving(false)
    navigation.goBack()
  }

  return (
    <Screen
      header={<BackHeader title="Editar perfil" onBack={() => navigation.goBack()} />}
      footer={
        <View style={styles.footer}>
          <PrimaryButton title="Salvar" onPress={save} loading={saving} />
        </View>
      }
    >
      <Text style={styles.label}>Nome</Text>
      <Input icon={User} placeholder="Seu nome" value={name} onChangeText={setName} />

      <Text style={styles.label}>Categoria</Text>
      <View style={styles.grid}>
        {CATEGORIES.map((c) => (
          <Chip key={c} label={CATEGORY_LABELS[c]} selected={category === c} onPress={() => setCategory(c)} style={styles.chip} />
        ))}
      </View>

      <Text style={styles.label}>Nível</Text>
      {EXPERIENCES.map((e) => (
        <OptionRow
          key={e.value}
          title={e.label}
          description={e.description}
          selected={experience === e.value}
          onPress={() => setExperience(e.value)}
        />
      ))}
    </Screen>
  )
}

const styles = StyleSheet.create({
  label: { ...TYPE.label, marginTop: 18, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  chip: { width: '48.5%' },
  footer: { padding: 16 },
})
