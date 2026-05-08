import { create } from 'zustand'

type ModalStore = {
  loginOpen: boolean
  openLogin: () => void
  closeLogin: () => void
}

export const useModalStore = create<ModalStore>((set) => ({
  loginOpen: false,
  openLogin: () => set({ loginOpen: true }),
  closeLogin: () => set({ loginOpen: false }),
}))
