export function rollDice(sides: number = 100): number {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * 성공을 위해 넘어야 하는 목표치를 계산합니다.
 * 주사위 결과가 이 목표치 이상이면 성공입니다.
 * 기본적인 아이디어: 난이도가 높을수록 목표치가 높아지고, 스탯이나 보정치가 높을수록 목표치가 낮아집니다.
 * (이 계산식은 게임 디자인에 따라 다양하게 조정될 수 있습니다.)
 */
export function calculateTargetNumber(
  difficulty: number,
  characterStat: number,
  otherModifiers: number = 0
): number {
  // 예시: 기본 목표치는 난이도. 스탯 10당 목표치 5 감소, 보정치만큼 목표치 감소.
  let target = difficulty - Math.floor(characterStat / 2) - otherModifiers; // 스탯 계산 방식을 더 정교하게 할 수 있음
  if (target < 5) target = 5; // 최소 성공 목표치 (예: 5% 확률은 항상 있게)
  if (target > 95) target = 95; // 최대 성공 목표치 (예: 5% 실패 확률은 항상 있게)
  return target;
}

export function checkSuccess(
  difficulty: number,
  characterRelevantStat: number,
  otherModifiers: number = 0
): { success: boolean; roll: number; targetNumber: number } {
  // 1. 성공 목표치 계산 (위의 calculateTargetNumber 함수 활용 또는 내부 로직으로)
  // 예시: 기본적으로 난이도가 목표치. 스탯이나 보정치로 이 목표치를 낮춤.
  // (계산 방식은 게임 밸런스에 맞춰 정교하게 설계 필요)
  let targetNumber = difficulty; // 높을수록 어려운 목표
  // 예시: 스탯 10당 목표치 5 감소, 보정치만큼 목표치 감소
  targetNumber -= Math.floor(characterRelevantStat / 2); // 스탯이 높을수록 목표치 하락 (성공률 증가)
  targetNumber -= otherModifiers; // 보정치가 높을수록 목표치 하락 (성공률 증가)

  // 최소/최대 목표치 설정 (항상 약간의 성공/실패 확률 보장)
  if (targetNumber < 5) targetNumber = 5; // 100면체 주사위 기준, 최소 5 이상 나와야 성공
  if (targetNumber > 95) targetNumber = 95; // 최대 95 이상 나와야 성공 (즉, 96~100은 실패)
  // 또는 반대로, targetNumber가 성공확률(%)을 의미하게 할 수도 있음.
  // 여기서는 "목표치 이상이면 성공"으로 가정.

  // 2. 주사위 굴림
  const roll = rollDice(100); // 100면체 주사위 사용

  // 3. 성공 여부 판정
  const success = roll >= targetNumber;

  return { success, roll, targetNumber };
}

// Zustand 스토어 내 액션 (간략화된 예시)
// import { useGameStore } from './gameStore'; // 실제 스토어
// import { checkSuccess, getSkillOutcomeText } from './skillCheckUtils'; // 위 함수들이 있는 유틸 파일

// ... 스토어 정의 ...
// attemptInvestigateSkill: (skillId: string, targetDifficulty?: number) => {
//   set((state) => {
//     const character = state.selectedCharacter;
//     if (!character) return {};

//     const skill = character.skills.find(s => s.id === skillId && s.type === 'investigate') as InvestigateSkill | undefined;
//     if (!skill) {
//       console.error("해당 조사 스킬을 찾을 수 없습니다:", skillId);
//       return {};
//     }

//     const difficultyToUse = targetDifficulty ?? skill.difficulty; // 외부에서 난이도 지정 가능
//     const relevantStat = character.investigationPoints; // 해당 스킬에 맞는 스탯
//     // TODO: 아이템, 이성 수치 등으로 인한 otherModifiers 계산
//     const otherModifiers = (skill.successChanceModifier || 0) + (character.luckPoints / 5); // 예시 보정

//     const result = checkSuccess(difficultyToUse, relevantStat, otherModifiers);
//     const outcomeText = getSkillOutcomeText(skill, result.success, result.roll, result.targetNumber);

//     // 상태 업데이트
//     let newSanity = character.currentSanity;
//     if (result.success) {
//       // 성공 시 효과 (예: 특정 키 획득, 정보 로그 추가 등)
//       // newSanity += 5; // 예시: 성공 시 이성 약간 회복
//     } else {
//       // 실패 시 효과 (예: 이성 감소 등)
//       newSanity -= skill.type === 'ritual' ? skill.sanityCost / 2 : 5; // 예시: 실패 시 이성 감소
//     }

//     return {
//       selectedCharacter: { ...character, currentSanity: Math.max(0, Math.min(newSanity, character.maxSanity)) },
//       eventLog: [...state.eventLog, outcomeText],
//       // ... 기타 상태 변경
//     };
//   });
// },
// ...
