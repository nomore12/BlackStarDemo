import React, { useEffect } from 'react';
import { useGameStore } from '../store/characterStore';
import { useRoomDialogManager } from '../hooks/useRoomDialogManager';
import CommonEventModal from './CommonEventModal';
import type { DialogSequence } from '../types/DialogSystemTypes';
import type { CharacterState, Item } from '../store/characterStore';

interface RoomDialogControllerProps {
  dialogSequences: Record<string, DialogSequence>;
  activeDialogId: string | null;
  onCloseDialog: () => void;
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
  addItem: (item: Item, characterId?: string) => void;
  getNextSceneUrl: () => string | undefined;
  startFadeOutToBlack: (path: string, duration?: number) => void;
  characterState: CharacterState | null;
}

const RoomDialogController: React.FC<RoomDialogControllerProps> = ({
  dialogSequences,
  activeDialogId,
  onCloseDialog,
  applyPlayerEffect,
  changeCharacterSanity,
  addItem,
  getNextSceneUrl,
  startFadeOutToBlack,
  characterState,
}) => {
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
    characterState: characterState,
    addDialogSelection: addDialogSelectionToStore,
    getDialogSelections: getDialogSelectionsFromStore,
    onDialogShouldCloseByAction: onCloseDialog,
    applyPlayerEffect,
    changeCharacterSanity,
    addItem,
    getNextSceneUrl,
    startFadeOutToBlack,
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
