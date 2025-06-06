import {
  type RoomOutcome,
  type CustomEffectOutcomePayload,
  type AddItemOutcomePayload,
  type DecreaseSanityOutcomePayload,
  type DecreaseInvestigationPointsOutcomePayload,
  type TextOutcomePayload,
  type UpdateCharacterStatePayload,
  type RemoveItemOutcomePayload,
  type StartCombatOutcomePayload,
  type OpenModalOutcomePayload,
  type OutcomeType,
} from '../types/RoomEventsType';
import type { GameState } from '../store/characterStore';
import type { SceneStoreState } from '../store/sceneStore';

interface OutcomeHandlerDependencies {
  applyPlayerEffect: GameState['applyPlayerEffect'];
  changeCharacterSanity: GameState['changeCharacterSanity'];
  changeCharacterHitPoints: GameState['changeCharacterHitPoints'];
  changeCharacterInvestigationPoints: GameState['changeCharacterInvestigationPoints'];
  addItem: GameState['addItem'];
  getNextSceneUrl: SceneStoreState['getNextSceneUrl'];
  startFadeOutToBlack: (path: string, duration: number) => void;
  resetCharacterAllPoints: GameState['resetCharacterAllPoints'];
}

type SpecificOutcomeHandler<T extends OutcomeType> = (
  payload: Extract<RoomOutcome, { type: T }>['payload'],
  dependencies: OutcomeHandlerDependencies
) => void;

type OutcomeHandlersMap = {
  [K in OutcomeType]: SpecificOutcomeHandler<K>;
};

const outcomeHandlers: OutcomeHandlersMap = {
  text: (payload, dependencies) => {
    console.log('[텍스트 이벤트]:', payload);
  },
  customEffect: (payload, dependencies) => {
    const { applyPlayerEffect } = dependencies;
    if (payload.effectId === 'PLAYER_EFFECT') {
      applyPlayerEffect({
        hpChange: payload.params?.hpChange,
        sanityChange: payload.params?.sanityChange,
        message: payload.params?.message || '특수 효과 발생!',
        reason: payload.params?.reason,
        ...(payload.params || {}),
      });
    } else {
      console.warn(
        `[OutcomeHandler] Unhandled customEffect ID: ${payload.effectId}`
      );
    }
  },
  decreaseSanity: (payload, dependencies) => {
    const { changeCharacterSanity } = dependencies;
    changeCharacterSanity(payload.amount, payload.reason);
  },
  decreaseHitPoints: (payload, dependencies) => {
    const { changeCharacterHitPoints } = dependencies;
    changeCharacterHitPoints(-payload.amount, payload.reason);
  },
  decreaseInvestigationPoints: (payload, dependencies) => {
    const { changeCharacterInvestigationPoints } = dependencies;
    changeCharacterInvestigationPoints(-payload.amount);
  },
  moveToNextScene: (payload, dependencies) => {
    const { getNextSceneUrl, startFadeOutToBlack, resetCharacterAllPoints } =
      dependencies;
    const nextSceneUrl = getNextSceneUrl();
    if (nextSceneUrl.startsWith('/error')) {
      console.error(`[OutcomeHandler] Scene transition error: ${nextSceneUrl}`);
      alert(`다음 씬 정보를 가져오는 데 실패했습니다: ${nextSceneUrl}`);
    } else {
      if (resetCharacterAllPoints) {
        resetCharacterAllPoints();
        console.log(
          '[OutcomeHandler] Character points reset due to moveToNextScene.'
        );
      } else {
        console.warn(
          '[OutcomeHandler] resetCharacterAllPoints function is not provided.'
        );
      }
      startFadeOutToBlack(nextSceneUrl, 1000);
    }
  },
  updateCharacterState: (payload, dependencies) => {
    console.log(
      '[OutcomeHandler] Character state update (TODO: Refine to specific store actions):',
      payload
    );
  },
  addItem: (payload, dependencies) => {
    const { addItem } = dependencies;
    if (payload && payload.item) {
      addItem(payload.item);
      console.log('[OutcomeHandler] Item added:', payload.item.name);
    } else {
      console.warn(
        '[OutcomeHandler] addItem outcome missing item payload:',
        payload
      );
    }
  },
  removeItem: (payload, dependencies) => {
    console.warn(
      `[OutcomeHandler] 'removeItem' handler not fully implemented. Payload:`,
      payload
    );
  },
  startCombat: (payload, dependencies) => {
    console.warn(
      `[OutcomeHandler] 'startCombat' handler not fully implemented. Payload:`,
      payload
    );
  },
  openModal: (payload, dependencies) => {
    console.warn(
      `[OutcomeHandler] 'openModal' handler not fully implemented. Payload:`,
      payload
    );
  },
};

export const processSingleOutcome = (
  outcome: RoomOutcome,
  dependencies: OutcomeHandlerDependencies
) => {
  console.log('[OutcomeHandler] Processing outcome:', outcome);
  const handler = outcomeHandlers[outcome.type];

  if (handler) {
    try {
      (handler as SpecificOutcomeHandler<typeof outcome.type>)(
        outcome.payload as Parameters<
          SpecificOutcomeHandler<typeof outcome.type>
        >[0],
        dependencies
      );
    } catch (error) {
      console.error(
        `[OutcomeHandler] Error executing handler for type ${outcome.type}:`,
        error
      );
      console.error(`[OutcomeHandler] Outcome causing error:`, outcome);
    }
  } else {
    let logMessage = `[OutcomeHandler] Unknown or unhandled outcome, full value: ${JSON.stringify(
      outcome
    )}`;
    if (typeof outcome === 'object' && outcome !== null && 'type' in outcome) {
      logMessage = `[OutcomeHandler] No handler defined for outcome type: ${
        (outcome as { type: string }).type
      }, full value: ${JSON.stringify(outcome)}`;
    }
    console.warn(logMessage);
  }
};
