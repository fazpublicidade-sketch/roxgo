import { useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native'
import { Download, Share, SquarePlus, X } from 'lucide-react-native'
import { usePwaInstall } from '../lib/pwa'
import { Card, IconTile, PrimaryButton } from './ui'
import { COLORS, FONTS, ICON, TYPE } from '../constants/theme'

// Passo a passo do iPhone: o iOS não deixa o site abrir a instalação sozinho
export function IosInstallModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const steps = [
    { icon: Share, text: 'Toque no botão Compartilhar', detail: 'No Safari fica na barra de baixo; no Chrome, no topo, ao lado do endereço.' },
    { icon: SquarePlus, text: 'Escolha "Adicionar à Tela de Início"', detail: 'Se não aparecer, role a lista de opções para baixo.' },
    { icon: Download, text: 'Toque em "Adicionar"', detail: 'O ROXGO aparece na tela inicial e abre em tela cheia.' },
  ]
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.sheetHeader}>
            <Text style={TYPE.title}>Instalar o ROXGO</Text>
            <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Fechar">
              <X size={24} color={COLORS.text} strokeWidth={ICON.stroke} />
            </Pressable>
          </View>
          <Text style={[TYPE.body, styles.sheetIntro]}>Em 3 toques ele fica na sua tela inicial, como um app.</Text>
          {steps.map((s, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={TYPE.heading}>{s.text}</Text>
                <Text style={[TYPE.body, styles.stepDetail]}>{s.detail}</Text>
              </View>
              <s.icon size={24} color={COLORS.primary} strokeWidth={ICON.stroke} />
            </View>
          ))}
          <PrimaryButton title="Entendi" onPress={onClose} style={styles.sheetButton} />
        </Pressable>
      </Pressable>
    </Modal>
  )
}

// Convite de instalação: aparece sozinho quando o app ainda não está instalado
export function InstallBanner({ style }: { style?: ViewStyle }) {
  const { showBanner, install, dismiss } = usePwaInstall()
  const [iosHelp, setIosHelp] = useState(false)
  if (!showBanner) return null

  return (
    <>
      <Card style={[styles.banner, style ?? {}]}>
        <IconTile icon={Download} color={COLORS.primary} />
        <View style={styles.flex}>
          <Text style={TYPE.heading}>Instale o ROXGO</Text>
          <Text style={[TYPE.body, styles.bannerText]}>Acesso direto da tela inicial, em tela cheia.</Text>
        </View>
        <Pressable
          onPress={async () => {
            if ((await install()) === 'ios-instructions') setIosHelp(true)
          }}
          style={({ pressed }) => [styles.installButton, pressed && styles.pressed]}
        >
          <Text style={styles.installText}>Instalar</Text>
        </Pressable>
        <Pressable onPress={dismiss} hitSlop={10} style={styles.close} accessibilityLabel="Agora não">
          <X size={16} color={COLORS.textDim} strokeWidth={ICON.stroke} />
        </Pressable>
      </Card>
      <IosInstallModal visible={iosHelp} onClose={() => setIosHelp(false)} />
    </>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.8 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingRight: 28 },
  bannerText: { fontSize: 13, lineHeight: 18, marginTop: 1 },
  installButton: {
    backgroundColor: COLORS.text,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  installText: { fontFamily: FONTS.bold, color: COLORS.onPrimary, fontSize: 14 },
  close: { position: 'absolute', top: 8, right: 8 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheetIntro: { marginTop: 6, marginBottom: 12 },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { fontFamily: FONTS.bold, color: COLORS.text, fontSize: 14 },
  stepDetail: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  sheetButton: { marginTop: 20 },
})
