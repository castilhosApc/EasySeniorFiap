import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface TrustContactState {
  name: string;
  phone: string;
  setTrustContact: (name: string, phone: string) => void;
}

export const useTrustContactStore = create<TrustContactState>()(
  persist(
    (set) => ({
      name: '',
      phone: '',
      setTrustContact: (name, phone) => set({ name: name.trim(), phone: phone.trim() }),
    }),
    {
      name: 'seniorease-trust-contact',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function phoneToDialString(raw: string): string {
  const t = raw.trim();
  if (!t) return '';
  const plus = t.startsWith('+');
  const digits = t.replace(/\D/g, '');
  if (!digits) return '';
  return plus ? `+${digits}` : digits;
}
