interface BaseSkill {
  id: string;
  name: string;
  description: string;
  outcomeTexts?: {
    success?: string; // 스킬 사용 성공 시 텍스트
    failure?: string; // 스킬 사용 실패 시 텍스트
    criticalSuccess?: string; // 대성공 시 텍스트 (선택적)
    criticalFailure?: string; // 대실패 또는 부작용 발생 시 텍스트 (선택적)
    general?: string; // 일반적인 발동 또는 상황 묘사 텍스트
    // 필요에 따라 더 많은 케이스 추가 가능 (예: 'no_target', 'insufficient_resource')
  };
}

interface InvestigateSkill extends BaseSkill {
  type: 'investigate';
  successChanceModifier?: number; // 성공 확률 보정치
  requiredTool?: string[]; // 필요한 도구 ID
  difficulty: number; // 난이도
}

interface ReactionSkill extends BaseSkill {
  type: 'reaction';
  rpCost: number; // RP 소모량
  concern: 'counterAttack' | 'defend' | 'dodge' | 'magic' | 'dontLook';
  counterAttackDamage?: number; // 반격 피해량
}

interface RitualSkill extends BaseSkill {
  type: 'ritual';
  // 의식 스킬 고유 속성
  requiredComponents: string[]; // 필요한 재료 목록
  sanityCost: number; // 이성 소모량
  difficulty: number; // 난이도
}

interface ActionSkill extends BaseSkill {
  type: 'action';
  // 행동 스킬 고유 속성
  actionPointsCost: number; // AP 소모량
  damage: number; // 피해량
  counterReaction: 'counterAttack' | 'defend' | 'dodge' | 'magic' | 'dontLook';
}

interface ConversationSkill extends BaseSkill {
  type: 'conversation';
  desirability: number; // 호감도 보정치
  difficulty: number; // 난이도
}

declare type Skill =
  | InvestigateSkill
  | ReactionSkill
  | RitualSkill
  | ActionSkill
  | ConversationSkill;
