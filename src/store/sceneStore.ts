// store/sceneStore.ts
import { create } from 'zustand';

// 사용 가능한 씬 ID 목록 - 실제 프로젝트에서는 이 부분을 더 동적으로 관리할 수 있습니다.
// 예를 들어, scenes/rooms/index.ts 에서 export된 컴포넌트 이름을 기반으로 생성할 수 있습니다.
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

// 캐릭터별 고정 씬 ID (예시 - 실제 씬 ID로 대체 필요)
const CHARACTER_FIXED_SCENES: Record<CharacterType, string> = {
  scholar: 'scholar-specific-room', // 학자 전용 3번째 씬
  explorer: 'explorer-specific-room', // 탐사자 전용 3번째 씬
  // 다른 캐릭터 타입이 있다면 여기에 추가
};

const LAST_STAGE_SCENE_ID = 'last-stage-room'; // 마지막 스테이지 씬 ID

// 캐릭터 타입 정의 (CharacterStore 등 다른 곳에서 가져올 수도 있습니다)
export type CharacterType = 'scholar' | 'explorer';

// SceneStore의 상태 인터페이스
interface SceneStoreState {
  currentRunSceneIds: string[]; // 현재 플레이의 전체 씬 ID 순서 (총 10개)
  currentSceneIndex: number; // 현재 씬의 인덱스 (0부터 9까지)
  currentSceneId: string | null; // 현재 씬의 ID

  readonly totalScenesInRun: number; // 현재 런의 총 씬 개수 (고정 10)

  initializeRunScenes: (characterId: CharacterType) => void;
  getNextSceneUrl: () => string;
  //   moveToNextScene: () => void;
  // moveToSceneAtIndex: (index: number) => void; // 필요시 주석 해제
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

export const useSceneStore = create<SceneStoreState>((set, get) => ({
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
      // 고정 씬을 찾을 수 없는 경우의 기본 처리 (예: 기본 씬 할당 또는 오류 발생)
      // 여기서는 임시로 빈 배열과 함께 경고를 남깁니다.
      set({
        currentRunSceneIds: [],
        currentSceneIndex: -1,
        currentSceneId: null,
      });
      return;
    }

    // 고정 씬을 제외하고 랜덤 씬 선택
    const randomFirstHalfScenes = getRandomElementsExcluding(
      firstHalfScenePool,
      4,
      [fixedSceneId]
    );
    const randomSecondHalfScenes = getRandomElementsExcluding(
      secondHalfScenePool,
      4,
      [fixedSceneId]
    );

    // 씬 순서 구성
    const runScenes: string[] = [];

    // 1, 2번 씬 (first-half 랜덤 중 2개)
    if (randomFirstHalfScenes.length >= 2) {
      runScenes.push(...randomFirstHalfScenes.slice(0, 2));
    } else {
      console.warn(
        'First-half 씬 풀이 부족하여 1, 2번 씬을 모두 채우지 못했습니다.'
      );
      runScenes.push(...randomFirstHalfScenes); // 가능한 만큼만 추가
    }

    // 3번 씬 (캐릭터별 고정)
    runScenes.push(fixedSceneId);

    // 4, 5번 씬 (first-half 나머지 랜덤 2개)
    if (randomFirstHalfScenes.length >= 4) {
      runScenes.push(...randomFirstHalfScenes.slice(2, 4));
    } else if (randomFirstHalfScenes.length > 2) {
      console.warn(
        'First-half 씬 풀이 부족하여 4, 5번 씬을 모두 채우지 못했습니다.'
      );
      runScenes.push(...randomFirstHalfScenes.slice(2)); // 가능한 만큼만 추가
    }

    // 6, 7, 8, 9번 씬 (second-half 랜덤 4개)
    runScenes.push(...randomSecondHalfScenes);

    // 10번 씬 (마지막 스테이지)
    runScenes.push(LAST_STAGE_SCENE_ID);

    // 최종 씬 목록의 길이가 10개가 되도록 조정 (부족하거나 넘칠 경우 대비)
    // 실제로는 각 풀의 크기가 충분하고, fixedSceneId가 풀에 없다는 가정하에 10개가 되어야 함
    // 여기서는 간단히 로그만 남기고, 실제 구현 시에는 더 견고한 로직 필요
    if (runScenes.length !== get().totalScenesInRun) {
      console.warn(
        `생성된 씬의 개수가 ${get().totalScenesInRun}개가 아닙니다. 현재 ${runScenes.length}개 입니다. 씬 풀을 확인해주세요.`
        // 부족할 경우, 특정 기본 씬으로 채우거나, 넘칠 경우 자르는 등의 예외 처리 로직을 추가할 수 있습니다.
        // 여기서는 일단 생성된 그대로 진행합니다.
      );
    }

    set({
      currentRunSceneIds: runScenes,
      currentSceneIndex: 0,
      currentSceneId: runScenes[0] || null,
      totalScenesInRun: runScenes.length, // 실제 생성된 씬의 개수로 업데이트
    });

    console.log(`[${characterId}] 새로운 런 씬 순서:`, runScenes);
  },

  getNextSceneUrl: () => {
    const currentSceneId = get().currentSceneId;
    if (!currentSceneId) {
      return '/';
    }
    return `/${currentSceneId}`;
  },
}));
