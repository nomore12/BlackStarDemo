// store/characterStore.ts (또는 유사한 파일)

// 스킬 정보를 위한 인터페이스 정의
export interface Skill {
  id: string; // 스킬 고유 ID (로직 연결용, 예: 'analytical_thinking')
  name: string; // UI에 표시될 스킬 이름 (예: "분석적 사고")
  description: string; // 스킬 상세 설명 (툴팁이나 상세 정보 창에 표시)
  // type?: 'investigate' | 'passive' | 'innate'; // 스킬 유형 (선택적, 예: 패시브, 타고난 능력 등)
}

// 캐릭터의 기본 상태 타입을 정의합니다.
export interface CharacterState {
  id: string;
  name: string;
  title: string;
  currentHP: number;
  maxHP: number;
  currentSanity: number;
  maxSanity: number;
  skills: Skill[]; // 주요 기술 (Skill 인터페이스 객체 배열)
  acquiredKeys: string[];
  // 기타 캐릭터 고유 상태값...
}

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
      name: '분석적 사고',
      description:
        '단서와 문헌을 통해 논리적으로 추론하는 데 능숙합니다. 특정 조사 관련 행동 시 추가 정보를 얻을 확률이 있습니다.',
    },
    {
      id: 'faint_madness_resonance',
      name: "미약한 '광기의 공감각'",
      description:
        '금지된 지식에 노출되면서 현실 너머의 존재나 의도를 어렴풋이 감지하기 시작합니다. 이성 수치가 낮을수록 이 감각은 왜곡될 수 있습니다.',
    },
    {
      id: 'basic_academic_knowledge',
      name: '초기 학문 지식',
      description:
        '일부 고대 상징이나 기본적인 오컬트 지식을 알고 있어, 특정 퍼즐이나 문서 해독에 단서를 제공할 수 있습니다.',
    },
  ],
  acquiredKeys: [],
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
      name: '강인한 의지',
      description:
        '절박한 상황에서도 쉽게 포기하지 않으며, 특정 정신적 충격이나 공포 상황에서 이성 수치 감소에 약간의 저항력을 보입니다.',
    },
    {
      id: 'intuitive_madness_resonance',
      name: "직감적 '광기의 공감각'",
      description:
        '실종된 가족의 유품이나 특정 장소에서 강한 감정적 동요와 함께, 보이지 않는 존재나 과거의 잔상을 다른 이들보다 선명하게 느낍니다.',
    },
    {
      id: 'survival_instinct',
      name: '생존 본능',
      description:
        '위험한 상황에서 본능적으로 대처하거나 숨겨진 통로, 안전한 장소를 발견하는 데 남다른 재능을 보입니다.',
    },
  ],
  acquiredKeys: [],
};

// Zustand 스토어에서 사용할 전체 게임 상태 타입 (캐릭터 데이터 포함)
export interface GameState {
  selectedCharacter: CharacterState | null;
  doomGauge: number;
  currentZoneId: string | null;
  currentRoomId: string | null;
  // ... 기타 전역 상태 ...
  // 액션 함수들 ...
  selectCharacter: (characterType: 'scholar' | 'explorer') => void;
  // ...
}

// Zustand 스토어 생성 (예시)
// import create from 'zustand';
//
// export const useGameStore = create<GameState>((set) => ({
//   selectedCharacter: null,
//   doomGauge: 0,
//   currentZoneId: null,
//   currentRoomId: null,
//   // ... 기타 초기 상태값 ...
//
//   selectCharacter: (characterType) => {
//     let characterData: CharacterState;
//     if (characterType === 'scholar') {
//       characterData = initialScholarData;
//     } else if (characterType === 'explorer') {
//       characterData = initialExplorerData;
//     } else {
//       console.error("Unknown character type:", characterType);
//       return;
//     }
//     set({
//       selectedCharacter: { ...characterData }, // 객체 복사하여 할당
//       // 캐릭터별 다른 초기 상태값도 여기서 설정 가능
//       // currentHP: characterData.currentHP,
//       // currentSanity: characterData.currentSanity,
//     });
//   },
//   // ... 기타 액션 함수들 ...
// }));
