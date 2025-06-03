import React, { useEffect } from 'react';
import { useGameStore } from '../store/characterStore';
import { useRoomDialogManager } from '../hooks/useRoomDialogManager';
import CommonEventModal from './CommonEventModal';
import type { DialogSequence } from '../types/DialogSystemTypes';
import type { RoomOutcome } from '../types/RoomEventsType';

interface RoomDialogControllerProps {
  dialogSequences: Record<string, DialogSequence>;
  activeDialogId: string | null;
  onCloseDialog: () => void;
  processSingleOutcome: (outcome: RoomOutcome) => void;
}

const RoomDialogController: React.FC<RoomDialogControllerProps> = ({
  dialogSequences,
  activeDialogId,
  onCloseDialog,
  processSingleOutcome,
}) => {
  const characterStateFromStore = useGameStore(
    (state) => state.selectedCharacter
  );

  const addDialogSelectionToStore = useGameStore(
    (state) => state.addDialogSelection
  );
  const getDialogSelectionsFromStore = useGameStore(
    (state) => state.getDialogSelections
  );

  const {
    isDialogActive,
    currentDialogStep,
    startDialog,
    handleDialogAction,
    closeDialog,
    selectedActionIdsForCurrentDialog,
  } = useRoomDialogManager({
    dialogSequences,
    characterState: characterStateFromStore,
    processSingleOutcome,
    addDialogSelection: addDialogSelectionToStore,
    getDialogSelections: getDialogSelectionsFromStore,
    onDialogShouldCloseByAction: onCloseDialog,
  });

  useEffect(() => {
    if (activeDialogId && !isDialogActive) {
      console.log(
        '[RoomDialogController] useEffect: activeDialogId set, starting dialog:',
        activeDialogId
      );
      startDialog(activeDialogId);
    } else if (!activeDialogId && isDialogActive) {
      console.log(
        '[RoomDialogController] useEffect: activeDialogId is null, closing internal dialog.'
      );
      closeDialog();
    }
  }, [activeDialogId, isDialogActive, startDialog, closeDialog]);

  const handleModalClose = () => {
    console.log(
      '[RoomDialogController] handleModalClose: User initiated close from modal UI.'
    );
    closeDialog();
    onCloseDialog();
  };

  if (!isDialogActive || !currentDialogStep) {
    return null;
  }

  return (
    <CommonEventModal
      open={isDialogActive}
      onClose={handleModalClose}
      title={currentDialogStep.title}
      description={currentDialogStep.description}
      imagePath={currentDialogStep.imagePath}
      dialogActions={currentDialogStep.actions}
      onDialogActionSelect={handleDialogAction}
      selectedActionIds={selectedActionIdsForCurrentDialog}
    />
  );
};

export default RoomDialogController;
