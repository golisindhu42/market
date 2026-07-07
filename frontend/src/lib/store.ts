import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SubscriptionInfo {
  plan: 'starter' | 'pro' | 'enterprise'
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  renewsAt: string
  autoRenew: boolean
  paymentMethod: { brand: string; last4: string; exp: string }
  invoices: { id: string; date: string; amount: number; status: 'paid' | 'pending' | 'failed'; url: string }[]
}

export interface SettingsState {
  darkMode: boolean
  accentColor: string
  language: string
  notifications: { price: boolean; earnings: boolean; aiSignal: boolean; system: boolean }
  security: { twoFactor: boolean; sessionTimeout: number; dataSharing: boolean }
  subscription: SubscriptionInfo
  setDarkMode: (v: boolean) => void
  setAccentColor: (v: string) => void
  setLanguage: (v: string) => void
  setNotifications: (v: Partial<SettingsState['notifications']>) => void
  setSecurity: (v: Partial<SettingsState['security']>) => void
  setSubscription: (v: Partial<SubscriptionInfo>) => void
  reset: () => void
}

const DEFAULT_SUBSCRIPTION: SubscriptionInfo = {
  plan: 'pro',
  status: 'active',
  renewsAt: 'July 1, 2026',
  autoRenew: true,
  paymentMethod: { brand: 'Visa', last4: '4242', exp: '12/28' },
  invoices: [
    { id: 'INV-2026-001', date: 'Jun 1, 2026', amount: 49, status: 'paid', url: '#' },
    { id: 'INV-2026-002', date: 'May 1, 2026', amount: 49, status: 'paid', url: '#' },
    { id: 'INV-2026-003', date: 'Apr 1, 2026', amount: 49, status: 'paid', url: '#' },
    { id: 'INV-2026-004', date: 'Mar 1, 2026', amount: 49, status: 'paid', url: '#' },
  ],
}

const DEFAULT_SETTINGS = {
  darkMode: true,
  accentColor: 'Blue',
  language: 'English',
  notifications: { price: true, earnings: true, aiSignal: true, system: false },
  security: { twoFactor: true, sessionTimeout: 30, dataSharing: false },
}

export const useStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      subscription: DEFAULT_SUBSCRIPTION,
      setDarkMode: (v) => set({ darkMode: v }),
      setAccentColor: (v) => set({ accentColor: v }),
      setLanguage: (v) => set({ language: v }),
      setNotifications: (v) => set((s) => ({ notifications: { ...s.notifications, ...v } })),
      setSecurity: (v) => set((s) => ({ security: { ...s.security, ...v } })),
      setSubscription: (v) => set((s) => ({ subscription: { ...s.subscription, ...v } })),
      reset: () => set({ ...DEFAULT_SETTINGS, subscription: DEFAULT_SUBSCRIPTION }),
    }),
    { name: 'marketpulse_store' },
  ),
)
