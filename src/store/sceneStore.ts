// store/sceneStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// 사용 가능한 씬 ID 목록
const firstHalfScenePool: string[] = [
  'first-half-01',
  'first-half-02',
  'first-half-03',
  'first-half-04',
  'first-half-05',
  'first-half-06',
  'first-half-07',
  'first-half-08',
];

const secondHalfScenePool: string[] = [
  'second-half-01',
  'second-half-02',
  'second-half-03',
  'second-half-04',
  'second-half-05',
  'second-half-06',
  'second-half-07',
  'second-half-08',
];

// 캐릭터 타입 정의
export type CharacterType = 'scholar' | 'explorer';

// 캐릭터별 고정 씬 ID
const CHARACTER_FIXED_SCENES: Record<CharacterType, string> = {
  scholar: 'scholar-specific-room',
  explorer: 'explorer-specific-room',
};

const LAST_STAGE_SCENE_ID = 'last-stage-room';

// SceneStore의 상태 인터페이스
export interface SceneStoreState {
  currentRunSceneIds: string[];
  currentSceneIndex: number;
  currentSceneId: string | null;
  readonly totalScenesInRun: number;

  initializeRunScenes: (characterId: CharacterType) => void;
  getNextSceneUrl: () => string; // 이 함수는 URL을 반환하고 내부적으로 상태를 업데이트합니다.
  // 실제 URL 변경은 라우팅 라이브러리가 담당해야 합니다.
}

/**
 * 배열에서 중복되지 않게 랜덤하게 N개의 요소를 선택하고, 특정 요소를 제외하는 헬퍼 함수
 */
const getRandomElementsExcluding = <T>(
  arr: T[],
  count: number,
  exclude: T[] = []
): T[] => {
  const filteredArr = arr.filter((item) => !exclude.includes(item));
  if (count > filteredArr.length) {
    console.warn(
      `요청한 요소 개수(${count})가 제외 후 배열 길이(${filteredArr.length})보다 큽니다. 가능한 최대 개수만 반환합니다.`
    );
    count = filteredArr.length;
  }
  const shuffled = [...filteredArr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const useSceneStore = create<SceneStoreState>()(
  devtools(
    // 1. Redux DevTools 연동
    persist(
      // 2. 로컬 스토리지 등을 사용한 데이터 영속화
      (set, get) => ({
        currentRunSceneIds: [],
        currentSceneIndex: -1,
        currentSceneId: null,
        totalScenesInRun: 10,

        initializeRunScenes: (characterId) => {
          const fixedSceneId = CHARACTER_FIXED_SCENES[characterId];
          if (!fixedSceneId) {
            console.error(
              '유효하지 않은 캐릭터 ID로 고정 씬을 찾을 수 없습니다:',
              characterId
            );
            set({
              currentRunSceneIds: [],
              currentSceneIndex: -1,
              currentSceneId: null,
            });
            return;
          }

          const randomFirstHalfScenes = getRandomElementsExcluding(
            firstHalfScenePool,
            4,
            [fixedSceneId] // 고정 씬이 firstHalfScenePool에 있을 경우를 대비해 제외
          );
          const randomSecondHalfScenes = getRandomElementsExcluding(
            secondHalfScenePool,
            4,
            [fixedSceneId] // 고정 씬이 secondHalfScenePool에 있을 경우를 대비해 제외
          );

          const runScenes: string[] = [];

          if (randomFirstHalfScenes.length >= 2) {
            runScenes.push(...randomFirstHalfScenes.slice(0, 2));
          } else {
            console.warn(
              'First-half 씬 풀이 부족하여 1, 2번 씬을 모두 채우지 못했습니다.'
            );
            runScenes.push(...randomFirstHalfScenes);
          }

          runScenes.push(fixedSceneId); // 3번 씬

          if (randomFirstHalfScenes.length >= 4) {
            const remainingFirstHalf = randomFirstHalfScenes.slice(2);
            runScenes.push(...remainingFirstHalf.slice(0, 2)); // 최대 2개만 추가
            if (remainingFirstHalf.length < 2) {
              console.warn(
                'First-half 씬 풀이 부족하여 4, 5번 씬을 모두 채우지 못했습니다.'
              );
            }
          } else if (randomFirstHalfScenes.length > 2) {
            const remainingFirstHalf = randomFirstHalfScenes.slice(2);
            runScenes.push(
              ...remainingFirstHalf.slice(
                0,
                Math.min(remainingFirstHalf.length, 2)
              )
            );
            console.warn(
              'First-half 씬 풀이 부족하여 4, 5번 씬 중 일부만 채웠습니다.'
            );
          }

          runScenes.push(...randomSecondHalfScenes.slice(0, 4)); // 최대 4개만 추가
          if (randomSecondHalfScenes.length < 4) {
            console.warn(
              'Second-half 씬 풀이 부족하여 6,7,8,9번 씬을 모두 채우지 못했습니다.'
            );
          }

          runScenes.push(LAST_STAGE_SCENE_ID);

          const desiredTotalScenes = get().totalScenesInRun; // totalScenesInRun 초기값(10) 사용

          while (
            runScenes.length < desiredTotalScenes &&
            runScenes.length > 0
          ) {
            console.warn(
              `씬이 부족하여 임의의 씬으로 채웁니다. 현재 ${runScenes.length}개, 목표: ${desiredTotalScenes}개`
            );
            const poolToUse =
              runScenes.length < Math.floor(desiredTotalScenes / 2)
                ? firstHalfScenePool
                : secondHalfScenePool;
            const fillerScene =
              poolToUse.find(
                (s) =>
                  !runScenes.includes(s) &&
                  s !== fixedSceneId &&
                  s !== LAST_STAGE_SCENE_ID
              ) || poolToUse[0]; // fallback으로 pool의 첫번째 요소
            if (fillerScene && !runScenes.includes(fillerScene)) {
              // 중복 추가 방지
              runScenes.push(fillerScene);
            } else {
              // 모든 pool을 다 사용했는데도 부족하거나, 유일한 fillerScene이 이미 포함된 경우
              // 이 경우, 가장 간단한 방법은 루프를 중단하거나, 아니면 중복을 허용하는 것입니다.
              // 여기서는 중단을 선택하고, 실제 씬 개수를 totalScenesInRun에 반영합니다.
              console.warn(
                '더 이상 채울 유니크한 씬이 없습니다. 현재 씬 개수로 진행합니다.'
              );
              break;
            }
          }
          if (runScenes.length > desiredTotalScenes) {
            runScenes.splice(desiredTotalScenes);
            console.warn(`씬이 많아 ${desiredTotalScenes}개로 조정합니다.`);
          }

          set({
            currentRunSceneIds: runScenes,
            currentSceneIndex: -1,
            currentSceneId: null,
            totalScenesInRun: runScenes.length, // 실제 생성된 씬의 개수로 totalScenesInRun 업데이트
          });

          console.log(
            `[${characterId}] 새로운 런 씬 순서:`,
            runScenes,
            '총 씬 개수:',
            runScenes.length
          );
        },

        getNextSceneUrl: (): string => {
          const currentIndex = get().currentSceneIndex;
          const runScenes = get().currentRunSceneIds;
          // totalScenesInRun은 initializeRunScenes에서 실제 생성된 씬의 길이로 업데이트됨
          const totalScenes = get().totalScenesInRun;

          if (runScenes.length === 0) {
            console.error(
              'getNextSceneUrl: 런 씬 목록이 비어있습니다. initializeRunScenes를 먼저 호출해야 합니다.'
            );
            return '/error-no-scenes';
          }

          let nextIndex: number;

          if (currentIndex === -1) {
            nextIndex = 0;
            console.log(
              'getNextSceneUrl - 런 시작, 첫 번째 씬으로 이동:',
              runScenes[nextIndex],
              '새 인덱스:',
              nextIndex
            );
          } else if (currentIndex < totalScenes - 1) {
            nextIndex = currentIndex + 1;
            console.log(
              'getNextSceneUrl - 다음 씬으로 이동:',
              runScenes[nextIndex],
              '새 인덱스:',
              nextIndex
            );
          } else {
            console.log(
              '모든 씬을 완료했거나 더 이상 진행할 씬이 없습니다. 현재 인덱스:',
              currentIndex
            );
            set({ currentSceneId: null, currentSceneIndex: -1 });
            return '/run-complete';
          }

          // nextIndex가 runScenes 배열 범위를 벗어나는지 확인
          if (nextIndex >= runScenes.length) {
            console.error(
              'nextIndex가 runScenes 배열의 범위를 벗어났습니다. Index:',
              nextIndex,
              'Run Scenes:',
              runScenes
            );
            set({ currentSceneId: null, currentSceneIndex: -1 });
            return '/error-scene-index-out-of-bounds';
          }

          const nextSceneId = runScenes[nextIndex];

          // nextSceneId가 실제로 유효한 문자열인지 확인 (undefined나 null이 아닌지)
          if (typeof nextSceneId === 'string') {
            set({
              currentSceneIndex: nextIndex,
              currentSceneId: nextSceneId,
            });
            return `/${nextSceneId}`;
          } else {
            console.error(
              '다음 씬 ID를 찾을 수 없거나 유효하지 않습니다 (내부 오류). Index:',
              nextIndex,
              'Run Scenes:',
              runScenes
            );
            set({ currentSceneId: null, currentSceneIndex: -1 });
            return '/error-scene-not-found';
          }
        },
      }),
      {
        name: 'blackstar-scene-storage', // 로컬 스토리지 키
        // (선택) 상태의 특정 부분만 영속화하려면:
        // partialize: (state) => ({ currentRunSceneIds: state.currentRunSceneIds, currentSceneIndex: state.currentSceneIndex, currentSceneId: state.currentSceneId, totalScenesInRun: state.totalScenesInRun }),
      }
    ),
    {
      name: 'SceneStore', // Redux DevTools에 표시될 스토어 이름
      // (선택) DevTools 옵션
      // enabled: process.env.NODE_ENV === 'development',
    }
  )
);
