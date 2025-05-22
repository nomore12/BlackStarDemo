import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface GameState {
  hitPoint: number;
  sanity: number;
  setHitPoint: (points: number) => void;
  setSanity: (points: number) => void;
}

const useGameManagerStore = create<GameState>()(
  devtools(
    persist(
      (set) => ({
        hitPoint: 100,
        sanity: 100,

        setHitPoint: (points) =>
          set((state) => {
            const newHitPoint = Math.max(0, points);
            console.log(
              `HitPoint changed from ${state.hitPoint} to ${newHitPoint}`
            );
            return { hitPoint: newHitPoint };
          }),

        setSanity: (points) =>
          set((state) => {
            const newSanity = Math.max(0, Math.min(100, points));
            console.log(`Sanity changed from ${state.sanity} to ${newSanity}`);
            return { sanity: newSanity };
          }),
      }),
      {
        name: 'game-manager-storage',
        // (Optional) partialize: (state) => ({ hitPoint: state.hitPoint })
        // 위와 같이 설정하면 hitPoint만 localStorage에 저장합니다.
        // 기본적으로 모든 상태를 저장합니다.
      }
    ),
    { name: 'GameManagerStore' } // Redux DevTools에 표시될 스토어 이름
  )
);

export default useGameManagerStore;
