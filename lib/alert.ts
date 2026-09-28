import { Alert, Platform } from 'react-native'

// Alert.alert não faz nada no react-native-web; na web usamos window.alert
export function showAlert(title: string, message?: string) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title)
    return
  }
  Alert.alert(title, message)
}

// Pergunta de confirmação que funciona no celular e na web
export function confirmAction(title: string, message: string, confirmText: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`))
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: confirmText, style: 'destructive', onPress: () => resolve(true) },
    ])
  })
}
