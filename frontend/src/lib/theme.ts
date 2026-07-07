export const ACCENT_COLORS = [
  { name: 'Blue', color: '#3B82F6' },
  { name: 'Purple', color: '#8B5CF6' },
  { name: 'Emerald', color: '#10B981' },
  { name: 'Amber', color: '#F59E0B' },
  { name: 'Rose', color: '#F43F5E' },
] as const

export type AccentName = typeof ACCENT_COLORS[number]['name']

export function applyAccent(name: string) {
  const c = ACCENT_COLORS.find(a => a.name === name)
  if (c) {
    document.documentElement.style.setProperty('--accent', c.color)
    document.documentElement.style.setProperty('--accent-dim', `${c.color}1A`)
    document.documentElement.style.setProperty('--accent-glow', `${c.color}40`)
  }
}

export function applyTheme(dark: boolean) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
}

export function getInitialTheme(): boolean {
  try {
    const s = localStorage.getItem('marketpulse_store')
    if (s) {
      const parsed = JSON.parse(s)
      if (parsed?.state?.darkMode !== undefined) return parsed.state.darkMode
    }
  } catch {}
  return true
}

export function getInitialAccent(): string {
  try {
    const s = localStorage.getItem('marketpulse_store')
    if (s) {
      const parsed = JSON.parse(s)
      if (parsed?.state?.accentColor) return parsed.state.accentColor
    }
  } catch {}
  return 'Blue'
}
