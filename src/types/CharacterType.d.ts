declare interface TentacleState {
  isTentacle: boolean;
  tentacleTransformationProgress?: number;
  tentacleType?: 'face' | 'leftArm' | 'rightArm' | 'bothArms';
  canSpeak?: boolean;
  canGrasp?: boolean;
  additionalMaxHp?: number;
  additionalAttackPower?: number;
  additionalDefensePower?: number;
  additionalActionPoints?: number;
  additionalReactionPoints?: number;
}

declare interface TheOtherWorldKnowledgeState {
  isTheOtherWorldKnowledge: boolean;
  theOtherWorldKnowledgeProgress?: number;
  additionalMaxSanity?: number;
  additionalLuck?: number;
  additionalInvestigationPoints?: number;
  additionalObservationPoints?: number;
}

declare interface MutateState {
  tentacled: TentacleState;
  theOtherWorldKnowledge: TheOtherWorldKnowledgeState;
}

// 캐릭터의 기본 상태 타입을 정의합니다.
declare interface CharacterState {
  id: string;
  name: string;
  title: string;
  currentHP: number;
  maxHP: number;
  currentSanity: number;
  maxSanity: number;
  skills: Skill[]; // 주요 기술 (Skill 인터페이스 객체 배열)
  acquiredKeys: string[]; // 획득한 키
  items: Item[];
  attackPower: number;
  defensePower: number;
  actionPoints: number;
  reactionPoints: number;
  investigationPoints: number;
  observationPoints: number;
  luckPoints: number;
  mutate: MutateState;
}
