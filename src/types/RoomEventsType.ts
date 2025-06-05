import {
  type Item,
  type GameState,
  type CharacterState,
  type Skill,
  type MutateState,
} from '../store/characterStore';
import type { SceneStoreState } from '../store/sceneStore';

// 캐릭터 상태와 게임 전체 상태, 씬 상태를 결합한 타입
export type CombinedGameAndSceneState = GameState & SceneStoreState;

// 스킬 체크 결과
export interface SkillCheckResult {
  success: boolean;
  roll: number;
  targetNumber: number;
  criticalSuccess?: boolean;
  criticalFailure?: boolean;
}

// --- RoomOutcome 페이로드 타입 정의 ---
export type TextOutcomePayload = string; // RoomEventsType.d.ts 에서는 string 이었지만, 이전 RoomEventsType.ts 에서는 객체였으므로 확인 필요. 우선 d.ts 기준으로 string.

export interface UpdateCharacterStatePayload {
  currentHP?: number;
  maxHP?: number;
  currentSanity?: number;
  maxSanity?: number;
  hpChange?: number;
  sanityChange?: number;
  maxHpChange?: number;
  maxSanityChange?: number;
  skillsToAdd?: Skill[];
  skillsToRemoveIds?: string[];
  itemsToAdd?: Item[]; // d.ts 에서는 Item[] 이었음
  itemsToRemoveIds?: string[];
  acquiredKeysToAdd?: string[];
  acquiredKeysToRemove?: string[];
  attackPowerChange?: number;
  defensePowerChange?: number;
  actionPointsChange?: number;
  reactionPointsChange?: number;
  investigationPointsChange?: number;
  observationPointsChange?: number;
  luckPointsChange?: number;
  mutate?: Partial<MutateState>;
}

// AddItemOutcomePayload 는 RoomEventsType.ts 와 RoomEventsType.d.ts 모두에 존재했음. d.ts 기준으로 message 필드 제거.
export interface AddItemOutcomePayload {
  item: Item;
  // message?: string; // d.ts 기준으로 제거
}

export interface RemoveItemOutcomePayload {
  itemId: string;
  quantity?: number;
}

export interface StartCombatOutcomePayload {
  encounterId: string;
}

// ModalContent는 이 파일 아래에 정의되므로, OpenModalOutcomePayload는 ModalContent를 직접 확장합니다.
export interface OpenModalOutcomePayload extends ModalContent {}

// CustomEffectOutcomePayload 는 RoomEventsType.ts 와 RoomEventsType.d.ts 모두에 존재했음. d.ts 기준으로 params의 상세 타입을 유지.
export interface CustomEffectOutcomePayload {
  effectId: string; // 효과를 식별하는 ID
  params?: {
    // 효과에 필요한 추가 파라미터 (선택적)
    modalKey?: string;
    message?: string;
    hpChange?: number;
    reason?: string; // 이전 RoomEventsType.ts에 있던 reason 추가
    // 다른 필요한 파라미터들...
    [key: string]: any; // 이전 RoomEventsType.ts 처럼 유연성 확보
  };
  // message?: string; // d.ts 에서는 없었지만, BaseOutcomePayload 같은 개념이 없으므로 params.message로 통합하거나 여기에 유지할지 결정 필요. params.message로 통합.
}

export interface DecreaseSanityOutcomePayload {
  amount: number; // 감소시킬 정신력의 양 (양수로 전달하고, 처리 시 음수로 변환)
  reason?: string; // (선택적) 정신력 감소 이유 로그용
}

export interface DecreaseInvestigationPointsOutcomePayload {
  amount: number; // 감소시킬 조사 포인트의 양 (양수로 전달하고, 처리 시 음수로 변환)
  reason?: string; // (선택적) 조사 포인트 감소 이유 로그용
}

// --- RoomOutcome 타입 (Discriminated Union) ---
// OutcomeType 정의는 이전 RoomEventsType.ts 버전을 참고하여 좀 더 포괄적으로 만들 수 있으나,
// 우선 RoomEventsType.d.ts 에 정의된 타입들로 구성합니다.
export type OutcomeType =
  | 'text'
  | 'updateCharacterState'
  | 'addItem'
  | 'removeItem'
  | 'startCombat'
  | 'moveToNextScene'
  | 'openModal'
  | 'customEffect'
  | 'decreaseSanity'
  | 'decreaseInvestigationPoints';
// 이전 RoomEventsType.ts에 있던 타입들:
// | 'playerDies'
// | 'playAudio'
// | 'stopAudio'
// | 'startCutscene'
// | 'addItemAndEquip'
// | 'addQuest'
// | 'updateQuest'
// | 'completeQuest'
// | 'unlockAchievement'
// | 'changeRoomState'
// | 'conditionalOutcome'
// | 'gainSkill'
// | 'loseSkill'
// | 'changePlayerAttribute';

// RoomOutcome의 condition 시그니처에서 CharacterState 대신 GameState['selectedCharacter'] 사용 가능성 고려
export type RoomOutcome =
  | {
      type: 'text';
      payload: TextOutcomePayload; // d.ts 에서는 string, 이전에는 TextOutcomePayload 객체였음. d.ts 기준.
      condition?: (
        characterState: CharacterState | null | undefined, // selectedCharacter가 null일 수 있음
        gameState: CombinedGameAndSceneState,
        skillCheckResult?: SkillCheckResult
      ) => boolean;
    }
  | {
      type: 'updateCharacterState';
      payload: UpdateCharacterStatePayload;
      condition?: (
        characterState: CharacterState | null | undefined,
        gameState: CombinedGameAndSceneState,
        skillCheckResult?: SkillCheckResult
      ) => boolean;
    }
  | {
      type: 'addItem';
      payload: AddItemOutcomePayload;
      condition?: (
        characterState: CharacterState | null | undefined,
        gameState: CombinedGameAndSceneState,
        skillCheckResult?: SkillCheckResult
      ) => boolean;
    }
  | {
      type: 'removeItem';
      payload: RemoveItemOutcomePayload;
      condition?: (
        characterState: CharacterState | null | undefined,
        gameState: CombinedGameAndSceneState,
        skillCheckResult?: SkillCheckResult
      ) => boolean;
    }
  | {
      type: 'startCombat';
      payload: StartCombatOutcomePayload;
      condition?: (
        characterState: CharacterState | null | undefined,
        gameState: CombinedGameAndSceneState,
        skillCheckResult?: SkillCheckResult
      ) => boolean;
    }
  | {
      type: 'moveToNextScene';
      payload?: undefined; // d.ts 에서는 undefined, 이전에는 MoveToNextScenePayload 객체 가능성. d.ts 기준.
      condition?: (
        characterState: CharacterState | null | undefined,
        gameState: CombinedGameAndSceneState,
        skillCheckResult?: SkillCheckResult
      ) => boolean;
    }
  | {
      type: 'openModal';
      payload: OpenModalOutcomePayload;
      condition?: (
        characterState: CharacterState | null | undefined,
        gameState: CombinedGameAndSceneState,
        skillCheckResult?: SkillCheckResult
      ) => boolean;
    }
  | {
      type: 'customEffect';
      payload: CustomEffectOutcomePayload;
      condition?: (
        characterState: CharacterState | null | undefined,
        gameState: CombinedGameAndSceneState,
        skillCheckResult?: SkillCheckResult
      ) => boolean;
    }
  | {
      type: 'decreaseSanity';
      payload: DecreaseSanityOutcomePayload;
      condition?: (
        characterState: CharacterState | null | undefined,
        gameState: CombinedGameAndSceneState,
        skillCheckResult?: SkillCheckResult
      ) => boolean;
    }
  | {
      type: 'decreaseInvestigationPoints';
      payload: DecreaseInvestigationPointsOutcomePayload;
      condition?: (
        characterState: CharacterState | null | undefined,
        gameState: CombinedGameAndSceneState,
        skillCheckResult?: SkillCheckResult
      ) => boolean;
    };

// 모달에 표시될 내용 및 액션 타입 정의
// DialogSystemAction 과 유사한 역할. d.ts의 ModalAction 사용.
export interface ModalAction {
  id: string;
  buttonText: // d.ts 에서는 text 였으나, DialogSystemAction 에서는 text였음. d.ts 의 buttonText 사용.
  | string
    | ((
        characterState: CharacterState | null | undefined,
        gameState: CombinedGameAndSceneState
      ) => string);
  condition?: (
    characterState: CharacterState | null | undefined,
    gameState: CombinedGameAndSceneState
  ) => boolean;
  outcome: RoomOutcome | RoomOutcome[]; // d.ts 와 동일
  // DialogSystemAction 에 있던 isDialogEnd, nextStepId, investigationPoints 등은 ModalAction에 없음. 필요시 추가 고려.
  isDialogEnd?: boolean; // CommonEventModal 등에서 사용하므로 추가
  nextStepId?: string; // CommonEventModal 등에서 사용하므로 추가
  investigationPoints?: number; // 필요시 추가
}

// ModalContent는 이전 RoomEventsType.ts와 d.ts의 내용을 종합.
// 이전 RoomEventsType.ts의 actions는 DialogSystemAction[] 이었으나, d.ts의 ModalAction[]을 사용.
export interface ModalContent {
  title?: string; // d.ts 에서는 필수였으나, 이전 버전에서는 선택. 선택으로 변경.
  description: // d.ts 에서는 필수, 이전 버전에서는 선택. d.ts 따라 필수로 유지하되, characterState nullable 처리.
  | string
    | ((
        characterState: CharacterState | null | undefined,
        gameState: CombinedGameAndSceneState
      ) => string);
  imagePath?: string;
  actions: ModalAction[]; // d.ts와 동일하게 ModalAction[] 사용
}

// 방에서 플레이어가 선택할 수 있는 고유 행동 타입 정의
export interface RoomInteractAction {
  id: string;
  buttonText:
    | string
    | ((
        characterState: CharacterState | null | undefined,
        gameState: CombinedGameAndSceneState
      ) => string);
  condition?: (
    characterState: CharacterState | null | undefined,
    gameState: CombinedGameAndSceneState
  ) => boolean;
  outcome: RoomOutcome | RoomOutcome[];
}

// 방 내부의 상호작용 가능한 요소 타입 정의
export interface InteractableElement {
  id: string;
  name: string;
  description?:
    | string
    | ((
        characterState: CharacterState | null | undefined,
        gameState: CombinedGameAndSceneState
      ) => string);
  imagePath?: string;
  condition?: (
    characterState: CharacterState | null | undefined,
    gameState: CombinedGameAndSceneState
  ) => boolean;
  actions: RoomInteractAction[]; // RoomInteractAction 사용
}

// 각 방(씬)의 데이터를 정의하는 인터페이스
// 이전 RoomEventsType.ts의 RoomData와 d.ts의 RoomData를 통합.
export interface RoomData {
  id: string;
  name?: string; // d.ts 에는 없었으나, 이전 RoomData 에 있었음. 추가.
  description?: string; // d.ts 에는 없었으나, 이전 RoomData 에 있었음. 추가.
  backgroundImagePath: string; // d.ts 기준. 이전에는 backgroundImage
  initialDescription?: // d.ts 기준. 이전에는 RoomData에 없었음. characterState nullable 처리.
  | string
    | ((
        characterState: CharacterState | null | undefined,
        gameState: CombinedGameAndSceneState
      ) => string);
  interactables?: InteractableElement[]; // d.ts 기준. 이전에는 events: Record<string, RoomEvent>
  generalActions?: RoomInteractAction[]; // d.ts 기준.
  entryPoints?: Record<string, string>; // 이전 RoomData 에 있었음. 추가.
  initialEventId?: string; // 이전 RoomData 에 있었음. 추가.
}

// RoomEvent 타입은 d.ts에 없었고, 이전 RoomEventsType.ts 에 있었음.
// d.ts의 InteractableElement와 RoomData.interactables로 대체된 것으로 보임.
// 필요하다면 RoomEvent 와 events: Record<string, RoomEvent> 구조를 다시 살릴 수 있음.
// export interface RoomEvent { ... }

// PlayerEffectParams는 이전 RoomEventsType.ts 에만 있었음. CustomEffectOutcomePayload.params 로 통합되는 추세.
// 필요하다면 별도로 유지.
// export interface PlayerEffectParams { ... }

// BaseOutcomePayload, TextOutcomePayload (객체 버전), MoveToNextScenePayload 등은 d.ts에 없었음.
// RoomOutcome의 payload를 각 타입별로 명확히 정의하는 d.ts 스타일을 따름.

// DialogSystemAction 타입 import 는 d.ts 에 없었으므로 제거. ModalAction으로 대체.
// import type { DialogSystemAction } from './DialogSystemTypes';
