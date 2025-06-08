import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface DoomGaugeStore {
  currentDoomGauge: number;
  maxDoomGauge: number;
  decreaseDoomGauge: (investigationPoints: number) => void;
}

export const useDoomGaugeStore = create<DoomGaugeStore>()(
  devtools(
    persist(
      (set) => ({
        currentDoomGauge: 100,
        maxDoomGauge: 100,
        decreaseDoomGauge: (investigationPoints) =>
          set((state) => ({
            currentDoomGauge: Math.max(
              0,
              state.currentDoomGauge - investigationPoints
            ),
          })),
      }),
      {
        name: 'doom-gauge-storage',
      }
    )
  )
);
