import { useState, useCallback, useMemo } from 'react';
import {
  DialogSequence,
  DialogSystemStep,
  DialogSystemAction,
  DialogActionContext,
} from '../types/DialogSystemTypes';
import { CharacterState } from '../store/characterStore';
import {
  CombinedGameAndSceneState,
  RoomOutcome,
} from '../types/RoomEventsType';

interface UseDialogSystemProps {
  dialogSequences: Record<string, DialogSequence>;
  characterState: CharacterState | null;
  gameStateForCallbacks: CombinedGameAndSceneState | null;
  processSingleOutcome: (outcome: RoomOutcome) => void;
}

export const useDialogSystem = ({
  dialogSequences,
  characterState,
  gameStateForCallbacks,
  processSingleOutcome,
}: UseDialogSystemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDialogId, setCurrentDialogId] = useState<string | null>(null);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const currentDialog = useMemo(() => {
    if (!currentDialogId) return null;
    return dialogSequences[currentDialogId] || null;
  }, [currentDialogId, dialogSequences]);

  const currentStep = useMemo((): DialogSystemStep | null => {
    if (!currentDialog || !currentStepId) return null;
    return currentDialog.steps[currentStepId] || null;
  }, [currentDialog, currentStepId]);

  const startDialog = useCallback(
    (dialogId: string, stepId?: string) => {
      const dialog = dialogSequences[dialogId];
      if (dialog) {
        setCurrentDialogId(dialogId);
        const initialStep = stepId || dialog.initialStepId;
        setCurrentStepId(initialStep);
        setIsOpen(true);
        setHistory([initialStep]);
      } else {
        console.error(`Dialog with id "${dialogId}" not found.`);
      }
    },
    [dialogSequences]
  );

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    // 상태를 즉시 초기화하기보다는, Dialog가 닫히는 애니메이션 후 초기화하는 것이 좋을 수 있음
    // 하지만 우선은 즉시 초기화
    setCurrentDialogId(null);
    setCurrentStepId(null);
    setHistory([]);
  }, []);

  const goToStep = useCallback(
    (stepId: string) => {
      if (currentDialog?.steps[stepId]) {
        setCurrentStepId(stepId);
        setHistory((prev) => [...prev, stepId]);
      } else {
        console.error(
          `Step with id "${stepId}" not found in current dialog "${currentDialogId}".`
        );
        closeDialog();
      }
    },
    [currentDialog, currentDialogId, closeDialog]
  );

  const goBackStep = useCallback(() => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setCurrentStepId(newHistory[newHistory.length - 1]);
      setHistory(newHistory);
    } else {
      closeDialog();
    }
  }, [history, closeDialog]);

  const handleActionSelect = useCallback(
    (action: DialogSystemAction) => {
      const context: DialogActionContext = {
        characterState,
        gameState: gameStateForCallbacks,
        goToStep,
        closeDialog,
        processOutcomes: (outcomesToProcess) => {
          if (Array.isArray(outcomesToProcess)) {
            outcomesToProcess.forEach((o) => processSingleOutcome(o));
          } else {
            processSingleOutcome(outcomesToProcess);
          }
        },
      };

      let preventDefaultNavigation = false;
      if (action.onSelect) {
        const onSelectResult = action.onSelect(context);
        if (onSelectResult === true) {
          preventDefaultNavigation = true;
        }
      }

      if (action.outcomes) {
        context.processOutcomes(action.outcomes);
      }

      if (preventDefaultNavigation) {
        return;
      }

      if (action.nextStepId) {
        goToStep(action.nextStepId);
      } else if (action.isDialogEnd) {
        closeDialog();
      }
    },
    [
      characterState,
      gameStateForCallbacks,
      goToStep,
      closeDialog,
      processSingleOutcome,
    ]
  );

  return {
    isOpen,
    currentStep,
    startDialog,
    handleActionSelect,
    closeDialog, // 모달 외부 클릭 등으로 직접 닫을 때 사용
    goBackStep,
  };
};
