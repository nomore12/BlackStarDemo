// store/characterStore.ts (또는 유사한 파일)

import { create } from 'zustand';

// --- 제공해주신 Mutate 관련 인터페이스 정의 ---
export interface TentacleState {
  // 'declare' 대신 'export' 사용 (일반 .ts 파일에서 사용 가정)
  isTentacle: boolean;
  tentacleTransformationProgress?: number;
  tentacleType?: 'face' | 'leftArm' | 'rightArm' | 'bothArms';
  canSpeak?: boolean;
  canGrasp?: boolean;
  additionalMaxHp?: number;
  additionalAttackPower?: number;
  additionalDefensePower?: number;
  additionalActionPoints?: number;
  additionalReactionPoints?: number;
}

export interface TheOtherWorldKnowledgeState {
  // 'declare' 대신 'export' 사용
  isTheOtherWorldKnowledge: boolean;
  theOtherWorldKnowledgeProgress?: number;
  additionalMaxSanity?: number;
  additionalLuck?: number;
  additionalInvestigationPoints?: number;
  additionalObservationPoints?: number;
}

export interface MutateState {
  // 'declare' 대신 'export' 사용
  tentacled: TentacleState;
  theOtherWorldKnowledge: TheOtherWorldKnowledgeState;
}
// --- ---

export interface CharacterState {
  id: string;
  name: string;
  title: string;
  currentHP: number;
  maxHP: number;
  currentSanity: number;
  maxSanity: number;
  skills: Skill[];
  acquiredKeys: string[];
  items: Item[];
  attackPower: number;
  defensePower: number;
  actionPoints: number;
  reactionPoints: number;
  investigationPoints: number;
  observationPoints: number;
  luckPoints: number;
  mutate: MutateState; // 업데이트된 MutateState 타입 사용
}

// 초기 데이터 (initialScholarData, initialExplorerData)는 이전과 동일하다고 가정합니다.
// MutateState 구조에 맞게 초기 데이터의 mutate 부분도 업데이트되어야 합니다.
// 예시:
export const initialScholarData: CharacterState = {
  id: 'scholar',
  name: '엘리어트 웨이트',
  title: '풋내기 학자',
  currentHP: 70,
  maxHP: 70,
  currentSanity: 80,
  maxSanity: 100,
  skills: [
    /* ...skills... */
  ],
  acquiredKeys: [],
  items: [
    /* ...items... */
  ],
  attackPower: 5,
  defensePower: 3,
  actionPoints: 3,
  reactionPoints: 1,
  investigationPoints: 15,
  observationPoints: 12,
  luckPoints: 5,
  mutate: {
    // 새로운 MutateState 구조에 맞춘 초기값
    tentacled: {
      isTentacle: false,
      // 나머지 선택적 필드들은 필요에 따라 초기화
    },
    theOtherWorldKnowledge: {
      isTheOtherWorldKnowledge: false,
      // 나머지 선택적 필드들은 필요에 따라 초기화
    },
  },
};

export const initialExplorerData: CharacterState = {
  id: 'explorer',
  name: '애비게일 홀로웨이',
  title: '절박한 탐사자',
  currentHP: 85,
  maxHP: 85,
  currentSanity: 65,
  maxSanity: 100,
  skills: [
    /* ...skills... */
  ],
  acquiredKeys: [],
  items: [
    /* ...items... */
  ],
  attackPower: 8,
  defensePower: 5,
  actionPoints: 4,
  reactionPoints: 1,
  investigationPoints: 8,
  observationPoints: 15,
  luckPoints: 7,
  mutate: {
    // 새로운 MutateState 구조에 맞춘 초기값
    tentacled: {
      isTentacle: false,
    },
    theOtherWorldKnowledge: {
      isTheOtherWorldKnowledge: false,
    },
  },
};

// Zustand 스토어에서 사용할 전체 게임 상태 타입
export interface GameState {
  selectedCharacter: CharacterState | null;
  doomGauge: number;
  currentRoomId: string | null;

  selectCharacter: (characterType: 'scholar' | 'explorer' | null) => void;
  changeDoomGauge: (delta: number) => void;
  changeCharacterHp: (delta: number) => void;
  changeCharacterSanity: (delta: number) => void;
  changeCharacterActionPoints: (delta: number) => void;
  changeCharacterReactionPoints: (delta: number) => void;
  changeCharacterInvestigationPoints: (delta: number) => void;
  changeCharacterObservationPoints: (delta: number) => void;
  changeCharacterLuckPoints: (delta: number) => void;
  setCharacterMutate: (value: MutateState) => void; // 원래대로 복원
}

export const useGameStore = create<GameState>((set) => ({
  selectedCharacter: null,
  doomGauge: 0,
  currentRoomId: null,

  selectCharacter: (characterType) => {
    if (characterType === null) {
      set({ selectedCharacter: null });
      return;
    }
    let characterData: CharacterState;
    if (characterType === 'scholar') {
      characterData = initialScholarData;
    } else if (characterType === 'explorer') {
      characterData = initialExplorerData;
    } else {
      console.error('Unknown character type:', characterType);
      return;
    }
    set({
      selectedCharacter: { ...characterData },
    });
  },

  changeDoomGauge: (delta: number) => {
    set((state) => {
      const newDoomGauge = Math.max(0, Math.min(100, state.doomGauge + delta));
      return { doomGauge: newDoomGauge };
    });
  },

  changeCharacterHp: (delta: number) => {
    set((state) => {
      if (state.selectedCharacter) {
        const newHP = Math.max(
          0,
          Math.min(
            state.selectedCharacter.maxHP,
            state.selectedCharacter.currentHP + delta
          )
        );
        return {
          selectedCharacter: { ...state.selectedCharacter, currentHP: newHP },
        };
      }
      return {};
    });
  },

  changeCharacterSanity: (delta: number) => {
    set((state) => {
      if (state.selectedCharacter) {
        const newSanity = Math.max(
          0,
          Math.min(
            state.selectedCharacter.maxSanity,
            state.selectedCharacter.currentSanity + delta
          )
        );
        return {
          selectedCharacter: {
            ...state.selectedCharacter,
            currentSanity: newSanity,
          },
        };
      }
      return {};
    });
  },

  changeCharacterActionPoints: (delta: number) => {
    set((state) => {
      if (state.selectedCharacter) {
        const newAP = Math.max(0, state.selectedCharacter.actionPoints + delta);
        return {
          selectedCharacter: {
            ...state.selectedCharacter,
            actionPoints: newAP,
          },
        };
      }
      return {};
    });
  },

  changeCharacterReactionPoints: (delta: number) => {
    set((state) => {
      if (state.selectedCharacter) {
        const newRP = Math.max(
          0,
          state.selectedCharacter.reactionPoints + delta
        );
        return {
          selectedCharacter: {
            ...state.selectedCharacter,
            reactionPoints: newRP,
          },
        };
      }
      return {};
    });
  },

  changeCharacterInvestigationPoints: (delta: number) => {
    set((state) => {
      if (state.selectedCharacter) {
        const newVal = Math.max(
          0,
          state.selectedCharacter.investigationPoints + delta
        );
        return {
          selectedCharacter: {
            ...state.selectedCharacter,
            investigationPoints: newVal,
          },
        };
      }
      return {};
    });
  },

  changeCharacterObservationPoints: (delta: number) => {
    set((state) => {
      if (state.selectedCharacter) {
        const newVal = Math.max(
          0,
          state.selectedCharacter.observationPoints + delta
        );
        return {
          selectedCharacter: {
            ...state.selectedCharacter,
            observationPoints: newVal,
          },
        };
      }
      return {};
    });
  },

  changeCharacterLuckPoints: (delta: number) => {
    set((state) => {
      if (state.selectedCharacter) {
        const newVal = Math.max(0, state.selectedCharacter.luckPoints + delta);
        return {
          selectedCharacter: { ...state.selectedCharacter, luckPoints: newVal },
        };
      }
      return {};
    });
  },

  setCharacterMutate: (value: MutateState) => {
    // 👈 원래대로 복원된 setCharacterMutate
    set((state) => {
      if (state.selectedCharacter) {
        return {
          selectedCharacter: {
            ...state.selectedCharacter,
            mutate: value, // 전달받은 MutateState 값으로 전체를 교체
          },
        };
      }
      return {};
    });
  },
}));
