import type { CharacterState } from '../store/characterStore';

export const createDummyCharacterState = (): CharacterState => ({
  id: 'explorer-char',
  name: '탐험가',
  title: '길잃은 탐험가',
  currentHP: 80,
  maxHP: 100,
  currentSanity: 60,
  maxSanity: 100,
  skills: [{ id: 'survival', name: '생존술', description: '생존에 유리' }],
  acquiredKeys: [],
  items: [],
  attackPower: 7,
  defensePower: 4,
  currentActionPoints: 3,
  maxActionPoints: 3,
  currentReactionPoints: 1,
  maxReactionPoints: 1,
  currentInvestigationPoints: 5,
  maxInvestigationPoints: 5,
  observationPoints: 12,
  luckPoints: 5,
  mutate: {
    tentacled: { isTentacle: false },
    theOtherWorldKnowledge: { isTheOtherWorldKnowledge: false },
  },
});
