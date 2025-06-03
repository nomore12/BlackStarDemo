import {
  type RoomOutcome,
  type CustomEffectOutcomePayload,
  type AddItemOutcomePayload,
} from '../types/RoomEventsType';
import type { GameState } from '../store/characterStore';
import type { SceneStoreState } from '../store/sceneStore';

interface OutcomeHandlerDependencies {
  applyPlayerEffect: GameState['applyPlayerEffect'];
  changeCharacterSanity: GameState['changeCharacterSanity'];
  addItem: GameState['addItem'];
  getNextSceneUrl: SceneStoreState['getNextSceneUrl'];
  startFadeOutToBlack: (path: string, duration: number) => void;
}

export const processSingleOutcome = (
  outcome: RoomOutcome,
  dependencies: OutcomeHandlerDependencies
) => {
  console.log('[OutcomeHandler] Processing outcome:', outcome);

  const {
    applyPlayerEffect,
    changeCharacterSanity,
    addItem,
    getNextSceneUrl,
    startFadeOutToBlack,
  } = dependencies;

  switch (outcome.type) {
    case 'text':
      console.log('[テキストイベント]:', outcome.payload);
      break;
    case 'customEffect': {
      const payload = outcome.payload as CustomEffectOutcomePayload;
      if (payload.effectId === 'PLAYER_EFFECT') {
        applyPlayerEffect({
          hpChange: payload.params?.hpChange,
          sanityChange: payload.params?.sanityChange,
          message: payload.params?.message || '특수 효과 발생!',
          reason: payload.params?.reason,
          ...payload.params,
        });
      } else {
        console.warn(
          `[OutcomeHandler] Unhandled customEffect ID: ${payload.effectId}`
        );
      }
      break;
    }
    case 'decreaseSanity': {
      changeCharacterSanity(outcome.payload.amount, outcome.payload.reason);
      break;
    }
    case 'moveToNextScene': {
      const nextSceneUrl = getNextSceneUrl();
      if (nextSceneUrl.startsWith('/error')) {
        console.error(
          `[OutcomeHandler] Scene transition error: ${nextSceneUrl}`
        );
        alert(`다음 씬 정보를 가져오는 데 실패했습니다: ${nextSceneUrl}`);
      } else {
        startFadeOutToBlack(nextSceneUrl, 1000);
      }
      break;
    }
    case 'updateCharacterState': {
      console.log(
        '[OutcomeHandler] Character state update (TODO: Refine to specific store actions):',
        outcome.payload
      );
      break;
    }
    case 'addItem': {
      const payload = outcome.payload as AddItemOutcomePayload;
      if (payload && payload.item) {
        addItem(payload.item);
        console.log('[OutcomeHandler] Item added:', payload.item.name);
      } else {
        console.warn(
          '[OutcomeHandler] addItem outcome missing item payload:',
          outcome
        );
      }
      break;
    }
    default: {
      let logMessage = `[OutcomeHandler] Unknown Outcome, full value: ${JSON.stringify(outcome)}`;
      if (
        typeof outcome === 'object' &&
        outcome !== null &&
        'type' in outcome
      ) {
        logMessage = `[OutcomeHandler] Unknown Outcome type: ${(outcome as { type: string }).type}, full value: ${JSON.stringify(outcome)}`;
      }
      console.warn(logMessage);
      break;
    }
  }
};
