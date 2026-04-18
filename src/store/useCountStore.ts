import { create } from 'zustand'

interface CountState {
  count: number
}

interface CountActions {
  increment: () => void
}

const initialState: CountState = {
  count: 0,
}

export const useCountStore = create<CountState & CountActions>()((set) => ({
  ...initialState,

  increment: () => set((state) => ({ count: state.count + 1 })),
}))
