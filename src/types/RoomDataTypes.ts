import { GameState } from '../store/characterStore';

export interface Exit {
  destinationRoomId: string;
  description: string;
  isLocked?: boolean;
  requiredKeyId?: string;
  lockedDescription?: string;
}

export interface Interactable {
  objectId: string;
  name: string;
  dialogId: string;
  position: { top: number; left: number };
}

export interface RoomData {
  id: string;
  name: string;
  sceneUrl: string;
  description: string | ((cs: CharacterState, gs: GameState) => string);
  backgroundImagePath: string;
  interactables: Interactable[];
  exits: Record<string, Exit>;
}
