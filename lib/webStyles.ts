import { Platform } from 'react-native'
import { COLORS } from '../constants/theme'

// Ajustes globais só da versão web
export function applyWebStyles() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return
  const style = document.createElement('style')
  style.textContent = `
    html, body { background-color: ${COLORS.bg}; }

    /* O autopreenchimento do navegador pinta o campo de azul claro; mantém o visual do app */
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 1000px ${COLORS.surfaceAlt} inset !important;
      -webkit-text-fill-color: ${COLORS.text} !important;
      caret-color: ${COLORS.text};
      transition: background-color 9999s ease-in-out 0s;
    }
  `
  document.head.appendChild(style)
}
