import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Lock, Mail } from 'lucide-react-native'
import { supabase } from '../../lib/supabase'
import { showAlert } from '../../lib/alert'
import Screen from '../../components/Screen'
import Logo from '../../components/Logo'
import { Input, PrimaryButton, SecondaryButton } from '../../components/ui'
import { COLORS, FONTS } from '../../constants/theme'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState<'signIn' | 'signUp' | null>(null)

  function validate() {
    if (!email.trim() || !password) {
      showAlert('Atenção', 'Preencha todos os campos')
      return false
    }
    if (password.length < 6) {
      showAlert('Atenção', 'Senha deve ter ao menos 6 caracteres')
      return false
    }
    return true
  }

  async function signIn() {
    if (!validate()) return
    setLoading('signIn')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(null)
    if (error) showAlert('Erro ao entrar', error.message)
  }

  async function signUp() {
    if (!validate()) return
    setLoading('signUp')
    const { error } = await supabase.auth.signUp({ email: email.trim(), password })
    setLoading(null)
    if (error) showAlert('Erro ao criar conta', error.message)
    else showAlert('Conta criada!', 'Confirme seu email para continuar')
  }

  return (
    <Screen contentStyle={styles.content} edges={['top', 'bottom']}>
      <View style={styles.top}>
        <Logo width={200} />
        <Text style={styles.tagline}>Performance Intelligence</Text>
      </View>

      <View style={styles.form}>
        <Input
          icon={Mail}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />
        <Input
          icon={Lock}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          onSubmitEditing={signIn}
          style={styles.gap}
        />

        <PrimaryButton
          title="Entrar"
          onPress={signIn}
          loading={loading === 'signIn'}
          disabled={loading !== null}
          style={styles.primary}
        />
        <SecondaryButton
          title="Criar conta"
          onPress={signUp}
          loading={loading === 'signUp'}
          disabled={loading !== null}
          style={styles.gap}
        />

        <Text style={styles.terms}>Ao criar conta você concorda com os Termos de Uso</Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24 },
  top: { flex: 1, minHeight: 260, alignItems: 'center', justifyContent: 'center' },
  tagline: {
    fontFamily: FONTS.medium,
    color: COLORS.textMuted,
    fontSize: 15,
    marginTop: 14,
    letterSpacing: 0.2,
  },
  form: { paddingBottom: 16 },
  gap: { marginTop: 12 },
  primary: { marginTop: 24 },
  terms: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
})
