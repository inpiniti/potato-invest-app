import { create, type StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Env = 'real';

export type Tokens = {
  accessToken: string | null;
  tokenExpiresAt: number | null; // epoch ms
  approvalKey: string | null;
};

type AuthState = {
  account: string;
  appKey: string;
  secretKey: string;
  env: Env;
  tokens: Tokens;
  setCredentials: (p: Partial<Pick<AuthState, 'account' | 'appKey' | 'secretKey' | 'env'>>) => void;
  setTokens: (p: Partial<Tokens>) => void;
  reset: () => void;
};

const creator: StateCreator<AuthState> = (set) => ({
  account: '',
  appKey: '',
  secretKey: '',
  env: 'real',
  tokens: { accessToken: null, tokenExpiresAt: null, approvalKey: null },
  setCredentials: (p) => set((s) => ({ ...s, ...p })),
  setTokens: (p) => set((s) => ({ ...s, tokens: { ...s.tokens, ...p } })),
  reset: () =>
    set({
      account: '',
      appKey: '',
      secretKey: '',
      env: 'real',
      tokens: { accessToken: null, tokenExpiresAt: null, approvalKey: null },
    }),
});

export const useAuthStore = create<AuthState>()(
  persist(creator, {
    name: 'auth',
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (s) => ({
      account: s.account,
      appKey: s.appKey,
      secretKey: s.secretKey,
      env: s.env,
      tokens: s.tokens,
    }),
  })
);
