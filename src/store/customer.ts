import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CustomerProfile = {
  id: string
  email: string
  name: string
  phone?: string
  points: number
  tier: 'regular' | 'silver' | 'gold'
  totalSpent: number
  defaultAddress?: {
    recipient?: string
    phone?: string
    zip?: string
    city?: string
    district?: string
    address?: string
  }
}

type CustomerStore = {
  customer: CustomerProfile | null
  token: string | null
  isLoading: boolean
  // Actions
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  register: (data: {
    email: string
    password: string
    name: string
    phone?: string
    marketingConsent?: boolean
    privacyConsent?: boolean
    emailConsent?: boolean
  }) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  updateProfile: (data: Partial<CustomerProfile & { password?: string }>) => Promise<{ ok: boolean; error?: string }>
}

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set, get) => ({
      customer: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const res = await fetch('/api/customers/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include',
          })
          const data = await res.json()
          if (!res.ok) {
            return { ok: false, error: data?.errors?.[0]?.message ?? '帳號或密碼錯誤' }
          }
          set({ customer: data.user, token: data.token })
          return { ok: true }
        } catch {
          return { ok: false, error: '無法連線，請稍後再試' }
        } finally {
          set({ isLoading: false })
        }
      },

      register: async ({ email, password, name, phone, marketingConsent, privacyConsent, emailConsent }) => {
        set({ isLoading: true })
        try {
          const res = await fetch('/api/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name, phone, marketingConsent, privacyConsent, emailConsent }),
            credentials: 'include',
          })
          const data = await res.json()
          if (!res.ok) {
            return { ok: false, error: data?.errors?.[0]?.message ?? '註冊失敗，請確認資料' }
          }
          // Auto-login after registration
          return get().login(email, password)
        } catch {
          return { ok: false, error: '無法連線，請稍後再試' }
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        try {
          await fetch('/api/customers/logout', { method: 'POST', credentials: 'include' })
        } catch {}
        set({ customer: null, token: null })
      },

      fetchMe: async () => {
        try {
          const res = await fetch('/api/customers/me', { credentials: 'include' })
          if (res.ok) {
            const data = await res.json()
            set({ customer: data.user })
          } else {
            set({ customer: null, token: null })
          }
        } catch {}
      },

      updateProfile: async (data) => {
        const { customer } = get()
        if (!customer) return { ok: false, error: '請先登入' }
        try {
          const res = await fetch(`/api/customers/${customer.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include',
          })
          const result = await res.json()
          if (!res.ok) {
            return { ok: false, error: result?.errors?.[0]?.message ?? '更新失敗' }
          }
          set({ customer: { ...customer, ...result.doc } })
          return { ok: true }
        } catch {
          return { ok: false, error: '無法連線，請稍後再試' }
        }
      },
    }),
    {
      name: 'asahi-customer',
      partialize: (state) => ({ customer: state.customer, token: state.token }),
    }
  )
)
