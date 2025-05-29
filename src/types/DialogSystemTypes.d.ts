import { CharacterState } from '../store/characterStore';
import { CombinedGameAndSceneState, RoomOutcome } from './RoomEventsType';

// 다이얼로그 액션 실행 시 컨텍스트 정보 (콜백 함수에 전달)
export interface DialogActionContext {
  characterState: CharacterState | null;
  gameState: CombinedGameAndSceneState | null;
  goToStep: (stepId: string) => void; // 특정 단계로 이동
  closeDialog: () => void; // 다이얼로그 닫기
  processOutcomes: (outcomes: RoomOutcome | RoomOutcome[]) => void; // 기존 RoomOutcome 처리 함수 호출
}

// 다이얼로그의 각 선택지
export interface DialogSystemAction {
  id?: string; // 버튼 key 생성을 위한 고유 ID (선택적, 없으면 text나 index 사용)
  text: string; // 버튼에 표시될 텍스트
  nextStepId?: string; // 다음으로 이동할 다이얼로그 단계 ID
  isDialogEnd?: boolean; // 이 선택지를 고르면 다이얼로그가 종료되는지 여부
  outcomes?: RoomOutcome | RoomOutcome[]; // 이 선택지의 결과 (기존 RoomOutcome 재활용)
  onSelect?: (context: DialogActionContext) => boolean | void; // 선택 시 실행될 커스텀 콜백 함수
  condition?: (
    characterState: CharacterState | null,
    gameState: CombinedGameAndSceneState | null
  ) => boolean; // 버튼 표시 조건
}

// 다이얼로그의 한 단계(화면)
export interface DialogSystemStep {
  id: string; // 단계의 고유 ID
  title?: string; // 모달 제목 (옵션)
  description:
    | string
    | ((
        characterState: CharacterState | null,
        gameState: CombinedGameAndSceneState | null
      ) => string); // 모달 내용
  imagePath?: string; // (옵션) 관련 이미지 경로
  actions: DialogSystemAction[]; // 이 단계에서 가능한 선택지들
}

// 하나의 완전한 다이얼로그 (여러 단계로 구성)
export interface DialogSequence {
  id: string; // 다이얼로그의 고유 ID (예: 'skullInteraction', 'doorChoice')
  initialStepId: string; // 시작 단계 ID
  steps: Record<string, DialogSystemStep>; // 단계 ID를 키로 하는 단계 객체들
}
