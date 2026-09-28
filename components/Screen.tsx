import { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS } from '../constants/theme'

type Props = {
  // Padrão só 'top': a barra de abas já cuida da margem de baixo. Telas fora das abas passam 'bottom'.
  edges?: ('top' | 'bottom')[]
  children: ReactNode
  header?: ReactNode
  contentStyle?: ViewStyle
  // Fica fixo abaixo do conteúdo rolável (ex: controles do cronômetro)
  footer?: ReactNode
  backgroundColor?: string
}

// Tela padrão: fundo liso + safe area + teclado + scroll
export default function Screen({ children, header, contentStyle, footer, backgroundColor, edges = ['top'] }: Props) {
  return (
    <SafeAreaView style={[styles.root, backgroundColor ? { backgroundColor } : null]} edges={edges}>
      {header}
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inner}>{children}</View>
        </ScrollView>
        {footer}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: 16, alignItems: 'center' },
  // Limita a largura no navegador para não esticar em telas grandes
  inner: { width: '100%', maxWidth: 520, flexGrow: 1 },
})
