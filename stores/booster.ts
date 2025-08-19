import { create, type StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type BoosterItem = {
  ticker: string; // 종목코드
  addedAt: number; // epoch ms
};

type BoosterState = {
  items: BoosterItem[];
  add: (ticker: string) => void;
  remove: (ticker: string) => void;
  toggle: (ticker: string) => void;
  clear: () => void;
};

const creator: StateCreator<BoosterState> = (set, get) => ({
  items: [],
  add: (ticker) =>
    set((s) => {
      if (!ticker) return s;
      if (s.items.find((i) => i.ticker === ticker)) return s; // 중복 방지
      return { items: [...s.items, { ticker, addedAt: Date.now() }] };
    }),
  remove: (ticker) => set((s) => ({ items: s.items.filter((i) => i.ticker !== ticker) })),
  toggle: (ticker) => {
    const { items } = get();
    if (items.find((i) => i.ticker === ticker)) {
      get().remove(ticker);
    } else {
      get().add(ticker);
    }
  },
  clear: () => set({ items: [] }),
});

export const useBoosterStore = create<BoosterState>()(
  persist(creator, {
    name: 'booster',
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (s) => ({ items: s.items }),
  })
);

export const useIsBoosted = (ticker?: string) => {
  const items = useBoosterStore((s) => s.items);
  if (!ticker) return false;
  return items.some((i) => i.ticker === ticker);
};
