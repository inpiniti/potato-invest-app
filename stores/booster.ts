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
      if (__DEV__) console.log('[Booster][STORE] add', ticker);
      return { items: [...s.items, { ticker, addedAt: Date.now() }] };
    }),
  remove: (ticker) =>
    set((s) => {
      if (__DEV__) console.log('[Booster][STORE] remove', ticker);
      return { items: s.items.filter((i) => i.ticker !== ticker) };
    }),
  toggle: (ticker) => {
    const { items } = get();
    if (items.find((i) => i.ticker === ticker)) {
      if (__DEV__) console.log('[Booster][STORE] toggle->remove', ticker);
      get().remove(ticker);
    } else {
      if (__DEV__) console.log('[Booster][STORE] toggle->add', ticker);
      get().add(ticker);
    }
  },
  clear: () =>
    set((s) => {
      if (__DEV__) console.log('[Booster][STORE] clear all', s.items.length);
      return { items: [] };
    }),
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
