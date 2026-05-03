import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

type CartStore = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id)
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          }))
        } else {
          set((state) => ({ items: [...state.items, { ...item, quantity: 1 }] }))
        }
      },
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, qty) => {
        if (qty <= 0) {
          set((state) => ({ items: state.items.filter((i) => i.id !== id) }))
        } else {
          set((state) => ({
            items: state.items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
          }))
        }
      },
      clearCart: () => set({ items: [] }),
      get totalItems() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },
      get totalPrice() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
      },
    }),
    { name: 'asahi-cart' }
  )
)
