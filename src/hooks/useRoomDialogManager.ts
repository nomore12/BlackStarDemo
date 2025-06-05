import { useState, useCallback, useMemo } from 'react';
import type { CharacterState, Item, GameState } from '../store/characterStore';
import type {
  DialogSequence,
  DialogSystemStep,
  DialogSystemAction,
} from '../types/DialogSystemTypes';
import type { RoomOutcome } from '../types/RoomEventsType';
import { processSingleOutcome as callProcessSingleOutcomeUtil } from '../utils/outcomeHandlers';
import { ACTION_ID_NEXT } from '../constants/dialogConstants';

interface UseRoomDialogManagerProps {
  dialogSequences: Record<string, DialogSequence>;
  characterState: CharacterState | null | undefined;
  // gameStateForCallbacks: any; // CombinedGameAndSceneState 대신 우선 any로 처리. 추후 정확한 타입 지정 필요
  addDialogSelection: (dialogKey: string, actionId: string) => void;
  getDialogSelections: (dialogKey: string) => Set<string>;
  onDialogShouldCloseByAction: () => void;
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
  changeCharacterSanity: (
    amount: number,
    reason?: string,
    characterId?: string
  ) => void;
  changeCharacterInvestigationPoints: (
    amount: number,
    reason?: string,
    characterId?: string
  ) => void;
  addItem: (item: Item, characterId?: string) => void;
  getNextSceneUrl: () => string | undefined;
  startFadeOutToBlack: (path: string, duration?: number) => void;
  resetCharacterAllPoints: GameState['resetCharacterAllPoints'];
}

export const useRoomDialogManager = ({
  dialogSequences,
  characterState,
  // gameStateForCallbacks, // 현재 훅 내부에서 직접 사용되지 않음
  addDialogSelection,
  getDialogSelections,
  onDialogShouldCloseByAction,
  applyPlayerEffect,
  changeCharacterSanity,
  changeCharacterInvestigationPoints,
  addItem,
  getNextSceneUrl,
  startFadeOutToBlack,
  resetCharacterAllPoints,
}: UseRoomDialogManagerProps) => {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    currentDialogId: string | null;
    currentStepId: string | null;
    history: { dialogId: string; stepId: string }[];
    selectedActionIds: Set<string>; // 현재 다이얼로그의 선택된 액션 ID
  }>({
    isOpen: false,
    currentDialogId: null,
    currentStepId: null,
    history: [],
    selectedActionIds: new Set(),
  });

  const startDialog = useCallback(
    (dialogId: string, stepId?: string) => {
      const sequence = dialogSequences[dialogId];
      if (!sequence) {
        console.error(`Dialog sequence ${dialogId} not found.`);
        return;
      }
      const initialStepId = stepId || sequence.initialStepId;
      const selectionsFromStore = getDialogSelections(dialogId);
      console.log(
        `[useRoomDialogManager] Starting dialog: ${dialogId}, initialStep: ${initialStepId}, selections from store:`,
        selectionsFromStore
      );
      setDialogState({
        isOpen: true,
        currentDialogId: dialogId,
        currentStepId: initialStepId,
        history: [],
        selectedActionIds: selectionsFromStore, // 스토어에서 불러온 선택 기록으로 초기화
      });
    },
    [dialogSequences, getDialogSelections]
  );

  const closeDialog = useCallback(() => {
    console.log('[useRoomDialogManager] Closing dialog.');
    setDialogState((prev) => ({
      ...prev,
      isOpen: false,
      currentDialogId: null,
      currentStepId: null,
      history: [],
      // selectedActionIds는 dialog가 새로 시작될 때 초기화되므로 여기서는 유지
    }));
  }, []);

  const currentDialogStep: DialogSystemStep | null = useMemo(() => {
    if (
      !dialogState.isOpen ||
      !dialogState.currentDialogId ||
      !dialogState.currentStepId
    ) {
      return null;
    }
    const sequence = dialogSequences[dialogState.currentDialogId];
    if (!sequence) return null;
    return sequence.steps[dialogState.currentStepId] || null;
  }, [
    dialogState.isOpen,
    dialogState.currentDialogId,
    dialogState.currentStepId,
    dialogSequences,
  ]);

  const handleDialogAction = useCallback(
    (action: DialogSystemAction) => {
      if (!currentDialogStep || !dialogState.currentDialogId || !action.id) {
        console.warn(
          '[useRoomDialogManager] handleDialogAction called with invalid state or action.',
          {
            currentDialogStep,
            currentDialogId: dialogState.currentDialogId,
            actionId: action.id,
          }
        );
        return;
      }
      console.log(
        '[useRoomDialogManager] Handling action:',
        action,
        'for dialog:',
        dialogState.currentDialogId
      );

      if (action.outcomes) {
        const outcomesToProcess = Array.isArray(action.outcomes)
          ? action.outcomes
          : [action.outcomes];
        outcomesToProcess.forEach((outcome) =>
          callProcessSingleOutcomeUtil(outcome, {
            applyPlayerEffect: applyPlayerEffect,
            changeCharacterSanity: (amount: number, reason?: string) =>
              changeCharacterSanity(amount, reason, characterState?.id),
            changeCharacterInvestigationPoints: (amount: number) =>
              changeCharacterInvestigationPoints(
                amount,
                undefined,
                characterState?.id
              ),
            addItem: (itemPayload: Item) =>
              addItem(itemPayload, characterState?.id),
            getNextSceneUrl: () => getNextSceneUrl() || '',
            startFadeOutToBlack: startFadeOutToBlack,
            resetCharacterAllPoints: resetCharacterAllPoints,
          })
        );
      }

      if (!action.isDialogEnd && action.id !== ACTION_ID_NEXT) {
        addDialogSelection(dialogState.currentDialogId, action.id);
        setDialogState((prev) => ({
          ...prev,
          selectedActionIds: new Set(prev.selectedActionIds).add(action.id!),
        }));
        console.log(
          `[useRoomDialogManager] Action ${action.id} added to selections for dialog ${dialogState.currentDialogId}`
        );
      }

      if (action.isDialogEnd) {
        closeDialog();
        onDialogShouldCloseByAction();
      } else if (action.nextStepId) {
        const currentDialogId = dialogState.currentDialogId;
        const newHistory = [
          ...dialogState.history,
          { dialogId: currentDialogId!, stepId: dialogState.currentStepId! },
        ];
        setDialogState((prev) => ({
          ...prev,
          currentStepId: action.nextStepId!,
          history: newHistory,
        }));
        console.log(
          `[useRoomDialogManager] Moving to next step: ${action.nextStepId}`
        );
      } else {
        console.log(
          '[useRoomDialogManager] Action does not end dialog or move to next step.'
        );
      }
    },
    [
      currentDialogStep,
      dialogState.currentDialogId,
      dialogState.history,
      dialogState.currentStepId,
      closeDialog,
      addDialogSelection,
      getDialogSelections,
      onDialogShouldCloseByAction,
      applyPlayerEffect,
      changeCharacterSanity,
      changeCharacterInvestigationPoints,
      addItem,
      getNextSceneUrl,
      startFadeOutToBlack,
      resetCharacterAllPoints,
      characterState,
    ]
  );

  return {
    isDialogActive: dialogState.isOpen,
    currentDialogStep,
    startDialog,
    handleDialogAction,
    closeDialog,
    selectedActionIdsForCurrentDialog: dialogState.selectedActionIds, // 현재 다이얼로그에 대한 선택된 액션 ID Set
  };
};
