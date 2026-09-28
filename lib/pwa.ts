import { useEffect, useState } from 'react'
import { Platform } from 'react-native'

// Evento de instalação do Chrome/Edge (não existe nos tipos padrão do DOM)
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined'
const DISMISS_KEY = 'roxgo:install-dismissed-at'
const DISMISS_DAYS = 7

let deferredPrompt: InstallPromptEvent | null = null
let installed = false
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

// O evento dispara uma única vez, logo no carregamento: precisa ser capturado no início
if (isWeb) {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e as InstallPromptEvent
    notify()
  })
  window.addEventListener('appinstalled', () => {
    installed = true
    deferredPrompt = null
    notify()
  })
}

function isStandalone() {
  if (!isWeb) return true
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

// iPhone/iPad (inclusive o Chrome do iOS): instalação só pelo menu Compartilhar
function isIos() {
  if (!isWeb) return false
  const ua = window.navigator.userAgent
  const iPadOs = window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1
  return /iPhone|iPad|iPod/.test(ua) || iPadOs
}

function readDismissed() {
  try {
    const at = Number(window.localStorage.getItem(DISMISS_KEY))
    return Boolean(at) && Date.now() - at < DISMISS_DAYS * 86_400_000
  } catch {
    return false
  }
}

export function usePwaInstall() {
  const [, force] = useState(0)
  const [dismissed, setDismissed] = useState(() => (isWeb ? readDismissed() : true))

  useEffect(() => {
    const update = () => force((n) => n + 1)
    listeners.add(update)
    return () => {
      listeners.delete(update)
    }
  }, [])

  const ios = isIos()
  // Disponível quando o navegador oferece instalação (Android/desktop) ou no iPhone (passo a passo)
  const available = isWeb && !installed && !isStandalone() && (Boolean(deferredPrompt) || ios)

  async function install(): Promise<'installed' | 'dismissed' | 'ios-instructions'> {
    if (deferredPrompt) {
      const event = deferredPrompt
      await event.prompt()
      const { outcome } = await event.userChoice
      deferredPrompt = null
      notify()
      return outcome === 'accepted' ? 'installed' : 'dismissed'
    }
    return 'ios-instructions'
  }

  function dismiss() {
    setDismissed(true)
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      // Sem armazenamento (aba anônima): o convite só some nesta sessão
    }
  }

  return { available, showBanner: available && !dismissed, ios, install, dismiss }
}
