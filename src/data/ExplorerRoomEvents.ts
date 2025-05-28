// src/data/RoomEvents.ts
import { CharacterState } from '../store/characterStore'; // 데이터 함수 시그니처에 필요할 수 있음
import {
  CombinedGameAndSceneState,
  RoomData,
  ModalContent,
} from '../types/RoomEventsType'; // 타입 파일에서 임포트

// --- 실제 데이터 예시: ExplorerRoom의 해골과 노트 ---
export const explorerRoom_SkullAndNote_Data: RoomData = {
  id: 'explorer-specific-room',
  backgroundImagePath: 'images/room_gloomy_study.png',
  initialDescription: (
    cs: CharacterState,
    gs: CombinedGameAndSceneState // 타입 명시
  ) =>
    `음산한 기운이 감도는 ${gs.currentRoomId || '이'} 방에 들어섰다. 테이블 위에는 먼지가 뽀얗게 쌓인 해골과 낡은 노트 한 권이 놓여 있다.`,
  interactables: [
    {
      id: 'skullOnTable',
      name: '테이블 위 해골',
      imagePath: 'images/skullontable.png',
      description: (
        cs: CharacterState // 타입 명시
      ) =>
        `섬뜩한 해골이다. ${cs.observationPoints > 10 ? '눈구멍 안쪽에서 미세한 움직임이 느껴지는 것 같다.' : '눈구멍 안쪽은 어두워 잘 보이지 않는다.'}`,
      actions: [
        {
          id: 'observeSkull',
          buttonText: '해골을 관찰한다',
          outcome: {
            type: 'openModal',
            payload: {
              // OpenModalOutcomePayload (ModalContent)
              title: '해골 관찰',
              description: `눈앞의 해골, 그 눈구멍은 공허하지 않았다. 역겨운 벌레가 꿈틀대며 기어 나왔고, 그것은 본능적으로 나의 가장 취약한 곳, 눈을 향해 날아들었다. 숨 막히는 공포에 눈을 감았다 뜨자, 해골의 눈에서 뿜어져 나온 빛만이 잔상처럼 남았을 뿐, 벌레는 사라지고 없었다. 정말 사라진 걸까?\n\n(이성 수치가 15 감소합니다.)`,
              actions: [
                {
                  id: 'skull_modal_close',
                  buttonText: '끔찍한 광경에서 눈을 돌린다',
                  outcome: {
                    type: 'text',
                    payload: '애써 침착하려 했지만, 심장이 미친듯이 뛰고 있다.',
                  },
                },
                {
                  id: 'skull_modal_investigate_light',
                  buttonText: '빛의 근원을 조사한다',
                  condition: (
                    cs: CharacterState // 타입 명시
                  ) => cs.skills.some((s) => s.id === 'analytical_thinking'),
                  outcome: {
                    type: 'text',
                    payload: '학자라면 빛을 조사할 수 있을 텐데...',
                  },
                },
              ],
            } as ModalContent, // ModalContent로 캐스팅 (타입 파일에서 ModalContent를 가져와 사용)
          },
          condition: (cs: CharacterState) => cs.currentSanity > 20, // 타입 명시
        },
        {
          id: 'touchSkull',
          buttonText: '해골을 만져본다 (위험 감수)',
          outcome: [
            {
              type: 'updateCharacterState',
              payload: { sanityChange: -15 },
              text: '해골에 손을 대자 차가운 냉기가 온몸으로 퍼져나간다.',
            },
            {
              type: 'text',
              payload:
                '손끝에서 기이한 진동이 느껴진다... 무언가 반응하는 것 같다!',
            },
          ],
          condition: (
            cs: CharacterState // 타입 명시
          ) => !cs.mutate.tentacled.isTentacle,
        },
      ],
    },
    {
      id: 'oldNote',
      name: '낡은 노트',
      actions: [
        {
          id: 'readNote',
          buttonText: '노트를 읽어본다',
          outcome: {
            type: 'openModal',
            payload: {
              // OpenModalOutcomePayload (ModalContent)
              title: '노트 내용',
              description: (
                cs: CharacterState // 타입 명시
              ) =>
                cs.skills.some((s) => s.id === 'basic_academic_knowledge')
                  ? '학문 지식 덕분에 일부 내용을 해독할 수 있었다: "그것은 공허에서 왔고, 별들의 사이를 떠돈다..." (새로운 단서 획득!)'
                  : '알아보기 힘든 글씨와 기괴한 그림 뿐이다. 전혀 이해할 수 없다.',
              actions: [
                {
                  id: 'note_modal_close',
                  buttonText: '노트를 덮는다',
                  outcome: { type: 'text', payload: '기묘한 내용이다...' },
                },
              ],
            } as ModalContent, // ModalContent로 캐스팅
          },
        },
      ],
    },
  ],
  generalActions: [
    {
      id: 'leaveRoom',
      buttonText: '다음 장소로 이동한다',
      outcome: { type: 'moveToNextScene' },
    },
    {
      id: 'ignoreObjects',
      buttonText: '모든 것을 무시하고 주변만 살핀다',
      outcome: {
        type: 'text',
        payload:
          '불길한 예감이 들지만, 일단 눈앞의 것들을 무시하고 방의 다른 출구를 찾아본다.',
      },
      condition: (cs: CharacterState, gs: CombinedGameAndSceneState) =>
        gs.doomGauge < 50, // 타입 명시
    },
  ],
};

// 여기에 다른 방 데이터( 예: anotherRoomData: RoomData = { ... } )를 계속 추가할 수 있습니다.
