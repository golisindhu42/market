import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './translations/en'
import { es } from './translations/es'
import { de } from './translations/de'
import { fr } from './translations/fr'
import { ja } from './translations/ja'
import { zh } from './translations/zh'

const LANG_MAP: Record<string, string> = {
  English: 'en', Spanish: 'es', German: 'de', French: 'fr',
  Japanese: 'ja', Chinese: 'zh',
}

function detectLanguage(): string {
  try {
    const s = localStorage.getItem('marketpulse_store')
    if (s) {
      const parsed = JSON.parse(s)
      if (parsed?.state?.language) {
        return LANG_MAP[parsed.state.language] || 'en'
      }
    }
  } catch {}
  return 'en'
}

const resources = { en: { translation: en }, es: { translation: es }, de: { translation: de }, fr: { translation: fr }, ja: { translation: ja }, zh: { translation: zh } }

i18n.use(initReactI18next).init({
  resources,
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'German', value: 'de' },
  { label: 'French', value: 'fr' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Chinese', value: 'zh' },
]

export const LANG_TO_CODE: Record<string, string> = {
  English: 'en', Spanish: 'es', German: 'de', French: 'fr', Japanese: 'ja', Chinese: 'zh',
}

export function applyLanguage(lang: string) {
  const code = LANG_MAP[lang] || 'en'
  if (i18n.language !== code) i18n.changeLanguage(code)
}

export default i18n
