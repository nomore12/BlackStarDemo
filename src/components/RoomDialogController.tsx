import React, { useEffect } from 'react';
import { GameState, useGameStore } from '../store/characterStore';
import { useRoomDialogManager } from '../hooks/useRoomDialogManager';
import CommonEventModal from './CommonEventModal';
import type { DialogSequence } from '../types/DialogSystemTypes';
import type { CharacterState, Item } from '../store/characterStore';

interface RoomDialogControllerProps {
  dialogSequences: Record<string, DialogSequence>;
  activeDialogId: string | null;
  onCloseDialog: () => void;
  applyPlayerEffect: GameState['applyPlayerEffect'];
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
  characterState: CharacterState | null;
  resetCharacterAllPoints: GameState['resetCharacterAllPoints'];
}

const RoomDialogController: React.FC<RoomDialogControllerProps> = ({
  dialogSequences,
  activeDialogId,
  onCloseDialog,
  applyPlayerEffect,
  changeCharacterSanity,
  changeCharacterInvestigationPoints,
  addItem,
  getNextSceneUrl,
  startFadeOutToBlack,
  characterState,
  resetCharacterAllPoints,
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
    changeCharacterInvestigationPoints,
    addItem,
    getNextSceneUrl,
    startFadeOutToBlack,
    resetCharacterAllPoints,
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
