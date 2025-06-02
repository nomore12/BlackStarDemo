// store/characterStore.ts (또는 유사한 파일)

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { useSnackbarStore } from './uiStore';

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
  currentInvestigationPoints: number;
  maxInvestigationPoints: number;
  skills: Skill[];
  acquiredKeys: string[];
  items: Item[];
  attackPower: number;
  defensePower: number;
  actionPoints: number;
  reactionPoints: number;
  observationPoints: number;
  luckPoints: number;
  mutate: MutateState; // 업데이트된 MutateState 타입 사용
}

// Skill 및 Item 타입 정의 (예시 - 실제 프로젝트에 맞게 수정 필요)
export interface Skill {
  id: string;
  name: string;
  description: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
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
    {
      id: 'skill_s_1',
      name: '고대 지식',
      description: '고대 문헌 해독 능력 증가',
    },
  ],
  acquiredKeys: [],
  items: [
    { id: 'item_s_1', name: '연구 일지', description: '단서 기록용 일지' },
  ],
  attackPower: 5,
  defensePower: 3,
  actionPoints: 3,
  reactionPoints: 1,
  currentInvestigationPoints: 5,
  maxInvestigationPoints: 5,
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
    {
      id: 'skill_e_1',
      name: '생존 본능',
      description: '위험 감지 및 회피 능력 향상',
    },
  ],
  acquiredKeys: [],
  items: [
    {
      id: 'item_e_1',
      name: '낡은 사진',
      description:
        '행방불명된 동생과 함께 찍은 사진. 뒷 면에는 동생이 오빠에게 쓴 글이 있다.',
    },
  ],
  attackPower: 8,
  defensePower: 5,
  actionPoints: 4,
  reactionPoints: 1,
  currentInvestigationPoints: 4,
  maxInvestigationPoints: 4,
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
  dialogSelections: Record<string, string[]>;

  selectCharacter: (characterType: 'scholar' | 'explorer' | null) => void;
  changeDoomGauge: (delta: number) => void;
  changeCharacterHp: (delta: number) => void;
  changeCharacterSanity: (delta: number, reason?: string) => void;
  changeCharacterActionPoints: (delta: number) => void;
  changeCharacterReactionPoints: (delta: number) => void;
  changeCharacterInvestigationPoints: (delta: number) => void;
  resetCharacterInvestigationPoints: () => void;
  changeCharacterObservationPoints: (delta: number) => void;
  changeCharacterLuckPoints: (delta: number) => void;
  setCharacterMutate: (value: MutateState) => void;
  applyPlayerEffect: (effect: {
    hpChange?: number;
    sanityChange?: number;
    message?: string;
    reason?: string;
    newItemId?: string;
    newItemName?: string;
    newItemDescription?: string;
    [key: string]: unknown;
  }) => void;

  addDialogSelection: (dialogKey: string, actionId: string) => void;
  getDialogSelections: (dialogKey: string) => Set<string>;
  resetDialogSelections: (dialogKey?: string) => void;
}

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set, get) => ({
        selectedCharacter: null,
        doomGauge: 0,
        currentRoomId: null,
        dialogSelections: {},

        selectCharacter: (characterType) => {
          if (characterType === null) {
            set({ selectedCharacter: null });
            return;
          }
          let characterData: CharacterState;
          if (characterType === 'scholar') {
            characterData = JSON.parse(JSON.stringify(initialScholarData));
          } else if (characterType === 'explorer') {
            characterData = JSON.parse(JSON.stringify(initialExplorerData));
          } else {
            console.error('Unknown character type:', characterType);
            return;
          }
          set({
            selectedCharacter: characterData,
          });
        },

        changeDoomGauge: (delta: number) => {
          set((state) => {
            const newDoomGauge = Math.max(
              0,
              Math.min(100, state.doomGauge + delta)
            );
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
                selectedCharacter: {
                  ...state.selectedCharacter,
                  currentHP: newHP,
                },
              };
            }
            return {};
          });
        },

        changeCharacterSanity: (delta: number, reason?: string) => {
          set((state) => {
            if (state.selectedCharacter) {
              const newSanity = Math.max(
                0,
                Math.min(
                  state.selectedCharacter.maxSanity,
                  state.selectedCharacter.currentSanity + delta
                )
              );
              if (delta < 0) {
                useSnackbarStore.getState().showSnackbar(
                  `이성이 ${Math.abs(delta)} 만큼 감소했습니다. (${reason})`,
                  newSanity < state.selectedCharacter.maxSanity * 0.3
                    ? 'warning'
                    : 'info' // 이성이 낮으면 경고
                );
              }
              console.log(
                `[Sanity Change] Amount: ${delta}, New: ${newSanity}, Max: ${state.selectedCharacter.maxSanity}, Reason: ${reason || 'N/A'}`
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
              const newAP = Math.max(
                0,
                state.selectedCharacter.actionPoints + delta
              );
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

        resetCharacterInvestigationPoints: () => {
          set((state) => {
            if (state.selectedCharacter) {
              return {
                selectedCharacter: {
                  ...state.selectedCharacter,
                  currentInvestigationPoints:
                    state.selectedCharacter.maxInvestigationPoints,
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
              const newVal = Math.max(
                0,
                state.selectedCharacter.luckPoints + delta
              );
              return {
                selectedCharacter: {
                  ...state.selectedCharacter,
                  luckPoints: newVal,
                },
              };
            }
            return {};
          });
        },

        setCharacterMutate: (value: MutateState) => {
          set((state) => {
            if (state.selectedCharacter) {
              return {
                selectedCharacter: {
                  ...state.selectedCharacter,
                  mutate: value,
                },
              };
            }
            return {};
          });
        },

        applyPlayerEffect: (effect) => {
          set((state) => {
            if (!state.selectedCharacter) return {};

            // eslint-disable-next-line prefer-const
            let characterUpdate = {
              ...state.selectedCharacter,
            } as CharacterState;
            // eslint-disable-next-line prefer-const
            let logMessages: string[] = [];

            if (typeof effect.hpChange === 'number') {
              const newHP = Math.max(
                0,
                Math.min(
                  characterUpdate.maxHP,
                  characterUpdate.currentHP + effect.hpChange
                )
              );
              characterUpdate.currentHP = newHP;
              logMessages.push(
                `HP changed by ${effect.hpChange}. New HP: ${newHP}.`
              );
            }

            if (typeof effect.sanityChange === 'number') {
              // applyPlayerEffect 내에서 changeCharacterSanity를 직접 호출하는 대신 로직을 통합합니다.
              const newSanity = Math.max(
                0,
                Math.min(
                  characterUpdate.maxSanity,
                  characterUpdate.currentSanity + effect.sanityChange
                )
              );
              characterUpdate.currentSanity = newSanity;
              logMessages.push(
                `Sanity changed by ${effect.sanityChange}. New Sanity: ${newSanity}. Reason: ${effect.reason || (effect.message && effect.sanityChange < 0 ? effect.message : 'N/A')}`
              );
            }

            if (effect.message) {
              logMessages.push(effect.message);
            }

            // 여기에 다른 effect 속성 처리 로직 추가 가능 (e.g., 아이템 추가, 스킬 변경 등)
            // 예시: effect.newItemId가 있다면 아이템 목록에 추가
            if (effect.newItemId && typeof effect.newItemId === 'string') {
              // 실제 Item 객체를 생성하거나 찾아야 할 수 있음
              const newItem: Item = {
                id: effect.newItemId as string,
                name: (effect.newItemName as string) || '새 아이템',
                description: (effect.newItemDescription as string) || '',
              };
              characterUpdate.items = [...characterUpdate.items, newItem];
              logMessages.push(`Item added: ${newItem.name}.`);
            }

            if (logMessages.length > 0) {
              // 중복 메시지 제거 (예: effect.message가 sanityChange의 reason으로 사용된 경우)
              const uniqueLogMessages = Array.from(new Set(logMessages));
              console.log(
                `[Player Effect Applied] ${uniqueLogMessages.join(' ')}`,
                effect
              );
            }

            return { selectedCharacter: characterUpdate };
          });
        },

        addDialogSelection: (dialogKey, actionId) => {
          set((state) => {
            const currentSelections = state.dialogSelections[dialogKey] || [];
            if (!currentSelections.includes(actionId)) {
              return {
                dialogSelections: {
                  ...state.dialogSelections,
                  [dialogKey]: [...currentSelections, actionId],
                },
              };
            }
            return {};
          });
        },
        getDialogSelections: (dialogKey) => {
          const selectionsArray = get().dialogSelections[dialogKey] || [];
          return new Set(selectionsArray);
        },
        resetDialogSelections: (dialogKey) => {
          set((state) => {
            if (dialogKey) {
              const newSelections = { ...state.dialogSelections };
              delete newSelections[dialogKey];
              return { dialogSelections: newSelections };
            }
            return { dialogSelections: {} };
          });
        },
      }),
      {
        name: 'blackstar-character-storage',
      }
    ),
    {
      name: 'GameStore',
    }
  )
);
