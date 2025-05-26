// store/characterStore.ts (또는 유사한 파일)

import { create } from 'zustand';

// 스킬 정보를 위한 인터페이스 정의

// 각 캐릭터의 초기 데이터를 정의합니다.
export const initialScholarData: CharacterState = {
  id: 'scholar',
  name: '엘리어트 웨이트',
  title: '풋내기 학자',
  currentHP: 70,
  maxHP: 70,
  currentSanity: 80,
  maxSanity: 100,
  skills: [
    {
      id: 'analytical_thinking',
      type: 'investigate', // 스킬 타입 명시
      name: '분석적 사고',
      description:
        '단서와 문헌을 통해 논리적으로 추론하는 데 능숙합니다. 특정 조사 관련 행동 시 추가 정보를 얻을 확률이 있습니다.',
      difficulty: 3, // 예시 난이도 (낮을수록 쉬움)
      successChanceModifier: 10, // 예시 성공 확률 보정치 (%)
      outcomeTexts: {
        success: '날카로운 관찰력으로 숨겨진 단서를 발견했다!',
        failure: '집중했지만, 특별한 점을 찾지 못했다.',
        general: '엘리어트가 주변을 꼼꼼히 살피며 분석을 시작한다.',
      },
    },
    {
      id: 'faint_madness_resonance',
      type: 'investigate', // '광기의 공감각'은 조사나 특정 상황 감지 패시브/액티브로 간주
      name: "미약한 '광기의 공감각'",
      description:
        '금지된 지식에 노출되면서 현실 너머의 존재나 의도를 어렴풋이 감지하기 시작합니다. 이성 수치가 낮을수록 이 감각은 왜곡될 수 있습니다.',
      difficulty: 5, // 감지 난이도
      outcomeTexts: {
        general: '기묘한 직감이 엘리어트의 정신을 스친다...',
        success: '불길한 예감과 함께, 무언가 잘못되었다는 것을 감지했다!',
        failure: '애써 집중했지만, 혼란스러운 감각만이 느껴질 뿐이다.',
      },
    },
    {
      id: 'basic_academic_knowledge',
      type: 'investigate', // 지식을 활용하는 것도 조사의 일환
      name: '초기 학문 지식',
      description:
        '일부 고대 상징이나 기본적인 오컬트 지식을 알고 있어, 특정 퍼즐이나 문서 해독에 단서를 제공할 수 있습니다.',
      difficulty: 2,
      outcomeTexts: {
        general: '엘리어트가 자신의 학문적 지식을 떠올려본다.',
        success: '기억 속 지식 덕분에 이 상징의 의미를 어렴풋이 알 것 같다!',
      },
    },
    // (프로토타입용) 학자의 기본 공격 스킬 예시
    {
      id: 'scholar_basic_attack',
      type: 'action',
      name: '무거운 책으로 내려치기',
      description:
        '손에 잡히는 무거운 책으로 상대를 공격합니다. 별로 효과는 없어 보입니다.',
      actionPointsCost: 2,
      damage: 3, // 매우 낮은 피해
      counterReaction: 'defend', // 방어에 취약
      outcomeTexts: {
        general: '엘리어트가 급히 책을 휘둘러 공격합니다!',
      },
    },
  ],
  acquiredKeys: [],
  items: [
    // 초기 아이템 예시
    {
      id: 'item_magnifying_glass',
      itemType: 'equipment', // 또는 quest 타입으로 분류하여 조사에 도움
      slot: 'trinket',
      name: '낡은 돋보기',
      description: '세밀한 관찰에 도움을 주는 낡은 돋보기입니다.',
      iconPath: 'images/items/magnifying_glass.png',
      passiveEffects: [{ effectId: 'increase_investigation', value: 5 }],
    },
  ],
  attackPower: 5, // 기본 공격력 (무기 미장착 시)
  defensePower: 3, // 기본 방어력
  actionPoints: 3, // 턴당 기본 AP
  reactionPoints: 1, // 턴당 기본 RP
  investigationPoints: 15, // 조사 관련 스탯
  observationPoints: 12, // 관찰 관련 스탯
  luckPoints: 5,
  mutate: {
    tentacled: { isTentacle: false },
    theOtherWorldKnowledge: {
      isTheOtherWorldKnowledge: false,
      theOtherWorldKnowledgeProgress: 0,
    },
  },
};

export const initialExplorerData: CharacterState = {
  id: 'explorer',
  name: '애비게일 홀로웨이',
  title: '절박한 탐사자',
  currentHP: 85,
  maxHP: 85,
  currentSanity: 65,
  maxSanity: 100,
  skills: [
    {
      id: 'strong_will',
      type: 'reaction', // 특정 상황에 대한 반응으로 볼 수도, 패시브로 볼 수도 있음. 여기서는 대응 개념으로.
      name: '강인한 의지',
      description:
        '절박한 상황에서도 쉽게 포기하지 않으며, 특정 정신적 충격이나 공포 상황에서 이성 수치 감소에 약간의 저항력을 보입니다.',
      rpCost: 0, // 패시브적 성격이라면 RP 소모 없음, 또는 특정 조건부 자동 발동
      concern: 'magic', // 정신 공격(magic)에 대한 대응으로 가정
      outcomeTexts: {
        general: '애비게일이 공포에 맞서 정신을 다잡습니다!',
      },
    },
    {
      id: 'intuitive_madness_resonance',
      type: 'investigate',
      name: "직감적 '광기의 공감각'",
      description:
        '실종된 가족의 유품이나 특정 장소에서 강한 감정적 동요와 함께, 보이지 않는 존재나 과거의 잔상을 다른 이들보다 선명하게 느낍니다.',
      difficulty: 4,
      outcomeTexts: {
        general:
          '애비게일의 가슴이 뛰며, 설명할 수 없는 감각이 그녀를 덮친다...',
        success: '릴리의 기척이 느껴져... 이 근처에 무언가 있어!',
        failure: '불안감만 커질 뿐, 아무것도 느껴지지 않는다.',
      },
    },
    {
      id: 'survival_instinct',
      type: 'investigate', // 생존 본능으로 위험 감지 또는 해결책 모색
      name: '생존 본능',
      description:
        '위험한 상황에서 본능적으로 대처하거나 숨겨진 통로, 안전한 장소를 발견하는 데 남다른 재능을 보입니다.',
      difficulty: 3,
      successChanceModifier: 15,
      outcomeTexts: {
        general: '애비게일이 생존자의 감각으로 주변의 위험을 살핀다.',
        success: '이곳은 위험해! 직감적으로 안전한 곳을 찾아냈다.',
        failure:
          '본능적으로 무언가 잘못됐다는 건 알겠지만, 뾰족한 수가 떠오르지 않는다.',
      },
    },
    // (프로토타입용) 탐사자의 기본 공격 스킬 예시
    {
      id: 'explorer_basic_attack',
      type: 'action',
      name: '거친 주먹질',
      description: '급한 대로 주먹을 휘둘러 공격합니다.',
      actionPointsCost: 1, // AP 소모 적음
      damage: 5,
      counterReaction: 'dodge', // 회피에 취약할 수 있음
      outcomeTexts: {
        general: '애비게일이 생존을 위해 거칠게 주먹을 날립니다!',
      },
    },
  ],
  acquiredKeys: [],
  items: [
    {
      id: 'item_old_photo',
      itemType: 'consumable', // 또는 quest 아이템으로, 사용 시 이성 회복 효과
      name: '빛바랜 가족 사진',
      description:
        '소중한 가족의 모습이 담긴 낡은 사진입니다. 보면 마음이 조금 진정됩니다.',
      iconPath: 'images/items/family_photo.png',
      useEffect: 'RESTORE_SANITY_SMALL', // 이 효과 ID에 맞는 로직 구현 필요
      effectValue: 10, // 이성 10 회복
      duration: 0, // 즉시 효과
    },
  ],
  attackPower: 8,
  defensePower: 5,
  actionPoints: 4, // 학자보다 AP가 높을 수 있음 (행동적)
  reactionPoints: 1,
  investigationPoints: 8,
  observationPoints: 15, // 탐사자는 관찰력이 뛰어남
  luckPoints: 7,
  mutate: {
    tentacled: { isTentacle: false },
    theOtherWorldKnowledge: {
      isTheOtherWorldKnowledge: false,
      theOtherWorldKnowledgeProgress: 0,
    },
  },
};

// Zustand 스토어에서 사용할 전체 게임 상태 타입 (캐릭터 데이터 포함)
export interface GameState {
  selectedCharacter: CharacterState | null;
  doomGauge: number;
  currentZoneId: string | null;
  currentRoomId: string | null;
  // ... 기타 전역 상태 ...
  // 액션 함수들 ...
  selectCharacter: (characterType: 'scholar' | 'explorer' | null) => void;
  // ...
}

// Zustand 스토어 생성 (예시)
// import create from 'zustand';
//
export const useGameStore = create<GameState>((set) => ({
  selectedCharacter: null,
  doomGauge: 0,
  currentZoneId: null,
  currentRoomId: null,
  // ... 기타 초기 상태값 ...

  selectCharacter: (characterType) => {
    let characterData: CharacterState;
    if (characterType === 'scholar') {
      characterData = initialScholarData;
    } else if (characterType === 'explorer') {
      characterData = initialExplorerData;
    } else {
      console.error('Unknown character type:', characterType);
      return;
    }
    set({
      selectedCharacter: { ...characterData }, // 객체 복사하여 할당
      // 캐릭터별 다른 초기 상태값도 여기서 설정 가능
      // currentHP: characterData.currentHP,
      // currentSanity: characterData.currentSanity,
    });
  },
  // ... 기타 액션 함수들 ...
}));
