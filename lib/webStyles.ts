import { Platform } from 'react-native'
import { COLORS } from '../constants/theme'

// Ajustes globais só da versão web
export function applyWebStyles() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return
  const style = document.createElement('style')
  style.textContent = `
    /* Tema escuro declarado: o Chrome usa a paleta escura nos controles e no autopreenchimento */
    html { color-scheme: dark; }
    html, body { background-color: ${COLORS.bg}; }

    /*
      O autopreenchimento do navegador pinta o campo de azul claro/branco. Versões recentes
      do Chrome ignoram o truque de box-shadow, então a troca de cor é adiada indefinidamente
      com transition, e o fundo pintado pelo navegador fica recortado atrás do texto
      (background-clip: text), invisível sob as letras brancas.
    */
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 1000px ${COLORS.surfaceAlt} inset !important;
      box-shadow: 0 0 0 1000px ${COLORS.surfaceAlt} inset !important;
      -webkit-text-fill-color: ${COLORS.text} !important;
      caret-color: ${COLORS.text};
      transition: background-color 0s 600000s, color 0s 600000s !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
    }

    /* Seletor padrão em regra separada: navegador que não o conhece descarta só esta regra */
    input:autofill {
      -webkit-box-shadow: 0 0 0 1000px ${COLORS.surfaceAlt} inset !important;
      box-shadow: 0 0 0 1000px ${COLORS.surfaceAlt} inset !important;
      -webkit-text-fill-color: ${COLORS.text} !important;
      caret-color: ${COLORS.text};
      transition: background-color 0s 600000s, color 0s 600000s !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
    }
  `
  document.head.appendChild(style)
}
