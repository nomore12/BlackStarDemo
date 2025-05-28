// src/types/roomEvents.types.ts
import {
  CharacterState,
  Skill,
  Item,
  GameState as OverallGameState,
  MutateState,
} from '../store/characterStore';
import { SceneStoreState } from '../store/sceneStore';

// 캐릭터 상태와 게임 전체 상태, 씬 상태를 결합한 타입
export type CombinedGameAndSceneState = OverallGameState & SceneStoreState;

// 스킬 체크 결과
export interface SkillCheckResult {
  success: boolean;
  roll: number;
  targetNumber: number;
  criticalSuccess?: boolean;
  criticalFailure?: boolean;
}

// --- RoomOutcome 페이로드 타입 정의 ---
export type TextOutcomePayload = string;

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
  itemsToAdd?: Item[];
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

export interface AddItemOutcomePayload {
  item: Item;
}

export interface RemoveItemOutcomePayload {
  itemId: string;
  quantity?: number;
}

export interface StartCombatOutcomePayload {
  encounterId: string;
}

export interface OpenModalOutcomePayload extends ModalContent {} // ModalContent는 이 파일 아래에 정의

export interface CustomEffectOutcomePayload {
  effectId: string;
  params?: any;
}

export interface DecreaseSanityOutcomePayload {
  amount: number; // 감소시킬 정신력의 양 (양수로 전달하고, 처리 시 음수로 변환)
  reason?: string; // (선택적) 정신력 감소 이유 로그용
}

// --- RoomOutcome 타입 (Discriminated Union) ---
export type RoomOutcome =
  | {
      type: 'text';
      payload: TextOutcomePayload;
      text?: string;
      condition?: (
        characterState: CharacterState,
        gameState: CombinedGameAndSceneState,
        skillCheckResult?: SkillCheckResult
      ) => boolean;
    }
  | {
      type: 'updateCharacterState';
      payload: UpdateCharacterStatePayload;
      text?: string;
      condition?: (
        characterState: CharacterState,
        gameState: CombinedGameAndSceneState,
        skillCheckResult?: SkillCheckResult
      ) => boolean;
    }
  | {
      type: 'addItem';
      payload: AddItemOutcomePayload;
      text?: string;
      condition?: (
        characterState: CharacterState,
        gameState: CombinedGameAndSceneState,
        skillCheckResult?: SkillCheckResult
      ) => boolean;
    }
  | {
      type: 'removeItem';
      payload: RemoveItemOutcomePayload;
      text?: string;
      condition?: (
        characterState: CharacterState,
        gameState: CombinedGameAndSceneState,
        skillCheckResult?: SkillCheckResult
      ) => boolean;
    }
  | {
      type: 'startCombat';
      payload: StartCombatOutcomePayload;
      text?: string;
      condition?: (
        characterState: CharacterState,
        gameState: CombinedGameAndSceneState,
        skillCheckResult?: SkillCheckResult
      ) => boolean;
    }
  | {
      type: 'moveToNextScene';
      payload?: undefined;
      text?: string;
      condition?: (
        characterState: CharacterState,
        gameState: CombinedGameAndSceneState,
        skillCheckResult?: SkillCheckResult
      ) => boolean;
    }
  | {
      type: 'openModal';
      payload: OpenModalOutcomePayload;
      text?: string;
      condition?: (
        characterState: CharacterState,
        gameState: CombinedGameAndSceneState,
        skillCheckResult?: SkillCheckResult
      ) => boolean;
    }
  | {
      type: 'customEffect';
      payload: CustomEffectOutcomePayload;
      text?: string;
      condition?: (
        characterState: CharacterState,
        gameState: CombinedGameAndSceneState,
        skillCheckResult?: SkillCheckResult
      ) => boolean;
    }
  | {
      type: 'decreaseSanity';
      payload: DecreaseSanityOutcomePayload;
      text?: string;
      condition?: (
        characterState: CharacterState,
        gameState: CombinedGameAndSceneState,
        skillCheckResult?: SkillCheckResult
      ) => boolean;
    };

// 모달에 표시될 내용 및 액션 타입 정의
export interface ModalAction {
  id: string;
  buttonText:
    | string
    | ((
        characterState: CharacterState,
        gameState: CombinedGameAndSceneState
      ) => string);
  condition?: (
    characterState: CharacterState,
    gameState: CombinedGameAndSceneState
  ) => boolean;
  outcome: RoomOutcome | RoomOutcome[];
}

export interface ModalContent {
  title: string;
  description:
    | string
    | ((
        characterState: CharacterState,
        gameState: CombinedGameAndSceneState
      ) => string);
  imagePath?: string;
  actions: ModalAction[];
}

// 방에서 플레이어가 선택할 수 있는 고유 행동 타입 정의
export interface RoomInteractAction {
  id: string;
  buttonText:
    | string
    | ((
        characterState: CharacterState,
        gameState: CombinedGameAndSceneState
      ) => string);
  condition?: (
    characterState: CharacterState,
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
        characterState: CharacterState,
        gameState: CombinedGameAndSceneState
      ) => string);
  imagePath?: string;
  condition?: (
    characterState: CharacterState,
    gameState: CombinedGameAndSceneState
  ) => boolean;
  actions: RoomInteractAction[];
}

// 각 방(씬)의 데이터를 정의하는 인터페이스
export interface RoomData {
  id: string;
  backgroundImagePath: string;
  initialDescription:
    | string
    | ((
        characterState: CharacterState,
        gameState: CombinedGameAndSceneState
      ) => string);
  interactables: InteractableElement[];
  generalActions?: RoomInteractAction[];
}

export interface CustomEffectOutcomePayload {
  effectId: string; // 효과를 식별하는 ID
  params?: {
    // 효과에 필요한 추가 파라미터 (선택적)
    modalKey?: string;
    message?: string;
    hpChange?: number;
    // 다른 필요한 파라미터들...
  };
}
