import React, { useCallback, useMemo, useState } from 'react';
import { useSceneStore } from '../../store/sceneStore';
import { usePageTransition } from '../../contexts/PageTransitionContext';
import { Box, Button, Typography } from '@mui/material';
import {
  DialogSequence,
  DialogSystemAction,
  DialogSystemStep,
} from '../../types/DialogSystemTypes'; // 경로에 맞게 수정해주세요
import {
  CharacterState,
  GameState as OverallGameState,
} from '../../store/characterStore'; // 경로에 맞게 수정해주세요
import { SceneStoreState } from '../../store/sceneStore'; // 경로에 맞게 수정해주세요
import {
  CombinedGameAndSceneState,
  CustomEffectOutcomePayload,
  RoomOutcome,
} from '../../types/RoomEventsType'; // 경로에 맞게 수정해주세요
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/characterStore';
import { useDialogSystem } from '../../hooks/useDialogSystem';
import CommonEventModal from '../../components/CommonEventModal';
import { processSingleOutcome } from '../../utils/outcomeHandlers'; // 유틸리티 함수 임포트

const createDummyCharacterState = (): CharacterState => ({
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

// 참고:
// - 위 코드에서 `investigationPointsRequired`는 1단계 주요 대상 선택 시 필요한 조사 포인트를 나타냅니다.
//   실제 게임 로직에서는 플레이어의 현재 조사 포인트와 비교하여 이 액션의 활성화 여부를 결정해야 합니다.
// - `nextStepId`는 1단계 선택 시 해당 대상의 2단계 세부 조사 스텝으로,
//   2단계 세부 조사 완료 후에는 다시 1단계 선택 스텝(`choice_table_IP`)으로 돌아가도록 설정했습니다.
//   이를 통해 플레이어는 남은 조사 포인트로 다른 대상을 추가 조사하거나 조사를 마칠 수 있습니다.
// - `outcomes` 배열에는 텍스트 출력 외에 `decreaseSanity` (이성 감소) 효과를 추가했습니다.
//   아이템 획득은 `텍스트 언급`으로 처리했고, 실제 아이템 시스템 구현 시 `addItem` outcome을 사용하시면 됩니다.
// - 이미지 경로는 예시이며, 실제 프로젝트의 이미지 경로로 수정해주세요.
// - `DialogSystemAction` 타입 정의에 `investigationPointsRequired?: number;` 필드를 추가해야 할 수 있습니다. (이미 있다면 OK)

const FirstHalf08: React.FC = () => {
  const { getNextSceneUrl } = useSceneStore();
  const navigate = useNavigate();
  const { startFadeOutToBlack } = usePageTransition();
  const gameStoreInstance = useGameStore();
  const sceneStoreInstance = useSceneStore();
  const characterState =
    useGameStore((state) => state.selectedCharacter) ??
    createDummyCharacterState();

  const gameStateForCallbacks =
    useMemo((): CombinedGameAndSceneState | null => {
      if (!gameStoreInstance.selectedCharacter) return null;

      return {
        ...gameStoreInstance,
        ...sceneStoreInstance,
      };
    }, [gameStoreInstance, sceneStoreInstance]);

  const firstHalfRoomDialogs: Record<string, DialogSequence> = useMemo(
    () => ({
      tableInvestigation: {
        // 다이얼로그 ID를 좀 더 명확하게 변경
        id: 'tableInvestigation',
        initialStepId: 'start_table_observation',
        steps: {
          // --- 1단계: 주요 조사 대상 선택 (포인트 소모) ---
          start_table_observation: {
            id: 'start_table_observation',
            title: '책상 조사 시작',
            description:
              '낡은 나무 책상 위는 온통 기괴한 물건들로 가득하다. 유리병 속의 섬뜩한 생물, 수상한 내용이 적힌 듯한 펼쳐진 책과 흩어진 종이들, 그리고 굳게 닫힌 서랍까지... 무엇부터 조사해야 할까? 모든 것을 다 살펴볼 시간은 없을 것 같다.',
            actions: [
              {
                id: 'go_to_choice_table_IP', // IP (Investigation Point) 스텝으로 이동 명시
                text: '조사를 시작한다...',
                nextStepId: 'choice_table_IP',
              },
              {
                id: 'leave_table_early',
                text: '불길하다. 이 책상은 무시한다.',
                isDialogEnd: true,
                outcomes: [
                  {
                    type: 'text',
                    payload: '본능적인 위험을 감지하고 책상에서 물러섰다.',
                  },
                ],
              },
            ],
          },
          choice_table_IP: {
            id: 'choice_table_IP',
            title: '어떤 것을 조사할까?',
            description: (characterState, gameState) => {
              // 캐릭터의 현재 조사 포인트를 표시 (실제 구현 시 characterState에서 가져와야 함)
              // 예시: const currentIP = characterState?.investigationPoints_current || 0;
              // return `남은 조사 포인트: ${currentIP}\n\n테이블 위의 물건들 중 무엇을 먼저 조사하시겠습니까? 신중하게 선택해야 합니다.`;
              // 우선은 고정 텍스트로
              return '테이블 위의 물건들 중 무엇을 먼저 조사하시겠습니까? 신중하게 선택해야 합니다.';
            },
            actions: [
              {
                id: 'choice_investigate_jar',
                text: '유리병 속의 기괴한 생물을 조사한다. (조사 포인트 2 소모)',
                investigationPointsRequired: 2, // 1단계 조사 포인트
                nextStepId: 'detail_jar_investigation', // 2단계 세부 조사로 연결
                // condition: (cs, gs) => (cs?.investigationPoints_current || 0) >= 2, // 실제 구현 시 필요
              },
              {
                id: 'choice_investigate_book',
                text: '펼쳐진 낡은 책을 조사한다. (조사 포인트 2 소모)',
                investigationPointsRequired: 2, // 1단계 조사 포인트
                nextStepId: 'detail_book_investigation',
                // condition: (cs, gs) => (cs?.investigationPoints_current || 0) >= 2,
              },
              {
                id: 'choice_investigate_papers',
                text: '흩어진 종이들을 조사한다. (조사 포인트 1 소모)',
                investigationPointsRequired: 1, // 1단계 조사 포인트
                nextStepId: 'detail_papers_investigation',
                // condition: (cs, gs) => (cs?.investigationPoints_current || 0) >= 1,
              },
              {
                id: 'choice_investigate_drawer',
                text: '책상 서랍을 조사한다. (조사 포인트 2 소모)',
                investigationPointsRequired: 2, // 1단계 조사 포인트
                nextStepId: 'detail_drawer_investigation',
                // condition: (cs, gs) => (cs?.investigationPoints_current || 0) >= 2,
              },
              {
                id: 'finish_table_investigation',
                text: '이만하면 됐다. 테이블 조사를 마친다.',
                isDialogEnd: true, // 다이얼로그 종료
                outcomes: [
                  {
                    type: 'text',
                    payload: '책상에서 더 이상 조사할 것을 찾지 못했다.',
                  },
                ],
              },
            ],
          },

          // --- 2단계: 세부 조사 (포인트 소모 없음) ---

          // 2-1. 유리병 속 생물 세부 조사
          detail_jar_investigation: {
            id: 'detail_jar_investigation',
            title: '병 속의 생물',
            description:
              '끈적한 액체 속에 잠긴 생물은 형언하기 어려운 모습이다. 미세하게 꿈틀거리는 것 같기도 하다.',
            actions: [
              {
                id: 'jar_observe_detail', // A-1
                text: '병을 조심스럽게 들어 빛에 비춰보며 생물의 세부 형태를 관찰한다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '생물의 몸에는 기하학적인 문양이 희미하게 새겨져 있고, 여러 개의 눈은 공허하게 앞을 응시하고 있다. 섬뜩한 모습에 이성이 약간 흔들린다.',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: { amount: -3, reason: '기괴한 생물 관찰' },
                  },
                ],
                nextStepId: 'choice_table_IP', // 다시 1단계 선택으로 (다른 것을 조사하거나 종료)
              },
              {
                id: 'jar_try_open', // A-2
                text: '병마개를 조심스럽게 열어보려 시도하거나, 내용물의 냄새를 맡아본다. (위험 감수)',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '마개를 열려는 순간, 역한 암모니아 냄새와 함께 섬뜩한 기운이 터져 나온다! 정신을 차리기 어렵다. 하지만 병 안쪽에서 작은 금속 조각 같은 것을 발견한 것 같다! (금속 조각 획득)',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: { amount: -10, reason: '위험한 병 개방 시도' },
                  },
                  // { type: 'addItem', payload: { item: { id: 'metal_fragment_jar', name: '병 속의 금속 조각', description: '기괴한 생물이 담겨있던 병 안에서 발견된 정체불명의 금속 조각.' }}}, // 아이템 구현 시
                ],
                nextStepId: 'choice_table_IP',
              },
              {
                id: 'jar_leave_it',
                text: '더 이상 건드리지 않고 돌아간다.',
                nextStepId: 'choice_table_IP',
              },
            ],
          },

          // 2-2. 펼쳐진 책 세부 조사
          detail_book_investigation: {
            id: 'detail_book_investigation',
            title: '낡은 책',
            description:
              '가죽 표지의 책은 수없이 많은 손길을 탄 듯 낡았고, 펼쳐진 페이지에는 알아보기 힘든 고대 문자와 기괴한 삽화가 가득하다.',
            actions: [
              {
                id: 'book_read_current_page', // B-1
                text: '펼쳐진 페이지의 본문 내용을 자세히 읽어본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '내용은 "문지기(GateKeeper)"라 불리는 존재와 그를 소환하는 방법에 대한 것이다. 몇몇 구절은 검게 칠해져 있다.',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: { amount: -5, reason: '금지된 책 내용 열람' },
                  },
                ],
                nextStepId: 'choice_table_IP',
              },
              {
                id: 'book_search_other_parts', // B-2
                text: '책 전체를 꼼꼼히 살펴보며 다른 중요한 부분(밑줄, 접힌 페이지, 숨겨진 메모 등)이 있는지 확인한다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '책장을 넘기던 중, 한 페이지 모서리가 작게 접혀있었고 그곳에는 피로 보이는 얼룩과 함께 "그는 기다린다"라는 짧은 메모가 적혀 있었다.',
                  },
                ],
                nextStepId: 'choice_table_IP',
              },
              {
                id: 'book_leave_it',
                text: '더 이상 읽지 않고 돌아간다.',
                nextStepId: 'choice_table_IP',
              },
            ],
          },

          // 2-3. 흩어진 종이들 세부 조사
          detail_papers_investigation: {
            id: 'detail_papers_investigation',
            title: '흩어진 종이들',
            description:
              '양피지로 보이는 종이 조각들이 책상 위에 어지럽게 흩어져 있다. 무언가를 급하게 적은 듯한 필체다.',
            actions: [
              {
                id: 'papers_read_top_one', // C-1
                text: '가장 위에 놓인 종이 한 장의 내용을 빠르게 확인한다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '종이에는 "별들이 정렬될 때, 문이 열릴 것이다. 하지만 대가가 필요하다."라는 경고문이 적혀 있다.',
                  },
                ],
                nextStepId: 'choice_table_IP',
              },
              {
                id: 'papers_analyze_all', // C-2
                text: '흩어진 종이들을 모아 순서를 맞춰보거나, 내용을 종합적으로 분석한다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '여러 조각을 맞추자, 저택 어딘가에 숨겨진 방을 가리키는 듯한 약도가 드러난다! 하지만 약도 일부는 피에 젖어 훼손되어 있다.',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: { amount: -2, reason: '훼손된 약도 분석' },
                  },
                ],
                nextStepId: 'choice_table_IP',
              },
              {
                id: 'papers_leave_them',
                text: '종이들은 무시하고 돌아간다.',
                nextStepId: 'choice_table_IP',
              },
            ],
          },

          // 2-4. 책상 서랍 세부 조사
          detail_drawer_investigation: {
            id: 'detail_drawer_investigation',
            title: '책상 서랍',
            description:
              '책상에는 두 개의 서랍이 있다. 어느 쪽을 열어볼까, 아니면 좀 더 다른 방법을 찾아볼까?',
            actions: [
              {
                id: 'drawer_check_left', // D-1
                text: '왼쪽 서랍을 열어 내부를 꼼꼼히 살펴본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '왼쪽 서랍 안에는 낡은 가죽 일기장 한 권과 녹슨 만년필이 들어있다. 일기장은 대부분 비어있지만, 마지막 장에 "그의 눈을 피해야 해"라는 글이 남아있다. (일기장 조각 획득)',
                  },
                ],
                nextStepId: 'choice_table_IP',
              },
              {
                id: 'drawer_check_right', // D-2
                text: '오른쪽 서랍을 열어 내부를 꼼꼼히 살펴본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '오른쪽 서랍에서는 작은 나무 상자가 나왔다. 안에는 기이한 문양이 새겨진 작은 돌멩이 하나가 들어있다. 만지자 차가운 기운이 느껴진다. (문양 돌멩이 획득)',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: { amount: -3, reason: '기이한 돌멩이 발견' },
                  },
                ],
                nextStepId: 'choice_table_IP',
              },
              {
                id: 'drawer_search_secret_compartment', // D-3
                text: '서랍 안쪽이나 바닥에 비밀 공간이 있는지 정밀하게 조사한다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '오른쪽 서랍 바닥을 더듬던 손끝에 무언가 걸렸다. 조심스럽게 당기자, 서랍 밑에 숨겨져 있던 얇은 금속판이 드러났다. 표면에는 복잡한 별자리가 새겨져 있다. (별자리 금속판 획득)',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: { amount: -5, reason: '비밀 공간의 불길한 발견' },
                  },
                ],
                nextStepId: 'choice_table_IP',
              },
              {
                id: 'drawer_leave_it',
                text: '서랍은 그대로 두고 돌아간다.',
                nextStepId: 'choice_table_IP',
              },
            ],
          },
          // ... (기존의 다른 스텝들: result_skull, result_note_start 등은 필요시 유지하거나 이 구조에 맞게 통합/수정)
        },
      },
      doorInteraction: {
        // 기존 doorInteraction 부분은 동일하게 유지
        id: 'doorInteraction',
        initialStepId: 'ask_open',
        steps: {
          // ... (doorInteraction 스텝 내용 동일)
          ask_open: {
            id: 'ask_open',
            title: '문을 열어본다.',
            description: '문을 열어본다.',
            actions: [
              {
                id: 'di_open_door',
                text: '문을 열고 다음 방으로 이동한다.',
                outcomes: [
                  {
                    type: 'moveToNextScene',
                    payload: undefined,
                  },
                ],
                isDialogEnd: true,
              },
              {
                id: 'di_dont_open_door',
                text: '문을 열지 않는다.',
                isDialogEnd: true,
              },
            ],
          },
        },
      },
      // ... (doorInteraction 등 다른 다이얼로그 시퀀스가 있다면 여기에 추가)
    }),
    [] // useMemo 의존성 배열
  );

  const processSingleOutcomeCallback = useCallback(
    (outcome: RoomOutcome) => {
      processSingleOutcome(outcome, {
        applyPlayerEffect: gameStoreInstance.applyPlayerEffect,
        changeCharacterSanity: gameStoreInstance.changeCharacterSanity,
        addItem: gameStoreInstance.addItem,
        getNextSceneUrl: sceneStoreInstance.getNextSceneUrl, // sceneStoreInstance에서 직접 가져옴
        startFadeOutToBlack: startFadeOutToBlack,
      });
    },
    [gameStoreInstance, sceneStoreInstance, startFadeOutToBlack] // 의존성 배열 업데이트
  );

  const {
    isOpen: isDialogActive,
    currentStep: currentDialogStep,
    startDialog: startDialogFromUseDialogSystem,
    handleActionSelect: handleDialogActionFromUseDialogSystem,
    closeDialog: closeSystemDialogFromUseDialogSystem,
  } = useDialogSystem({
    dialogSequences: firstHalfRoomDialogs,
    characterState,
    gameStateForCallbacks,
    processSingleOutcome: processSingleOutcomeCallback,
  });

  const addDialogSelectionToStore = useGameStore(
    (state) => state.addDialogSelection
  );
  const getDialogSelectionsFromStore = useGameStore(
    (state) => state.getDialogSelections
  );

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    currentDialogId: string | null;
    currentStepId: string | null;
    history: { dialogId: string; stepId: string }[];
    selectedActionIds: Set<string>;
  }>({
    isOpen: false,
    currentDialogId: null,
    currentStepId: null,
    history: [],
    selectedActionIds: new Set(),
  });

  const actualStartDialog = useCallback(
    (dialogId: string, stepId?: string) => {
      const sequence = firstHalfRoomDialogs[dialogId];
      if (!sequence) {
        console.error(`Dialog sequence ${dialogId} not found.`);
        return;
      }
      const initialStepId = stepId || sequence.initialStepId;
      const selectionsFromStore = getDialogSelectionsFromStore(dialogId);
      setDialogState({
        isOpen: true,
        currentDialogId: dialogId,
        currentStepId: initialStepId,
        history: [],
        selectedActionIds: selectionsFromStore,
      });
    },
    [firstHalfRoomDialogs, getDialogSelectionsFromStore]
  );

  const actualCloseDialog = useCallback(() => {
    setDialogState((prev) => ({
      ...prev,
      isOpen: false,
      currentDialogId: null,
      currentStepId: null,
      history: [],
    }));
  }, []);

  const actualCurrentStep: DialogSystemStep | null = useMemo(() => {
    if (
      !dialogState.isOpen ||
      !dialogState.currentDialogId ||
      !dialogState.currentStepId
    ) {
      return null;
    }
    const sequence = firstHalfRoomDialogs[dialogState.currentDialogId];
    if (!sequence) return null;
    return sequence.steps[dialogState.currentStepId] || null;
  }, [
    dialogState.isOpen,
    dialogState.currentDialogId,
    dialogState.currentStepId,
    firstHalfRoomDialogs,
  ]);

  const actualHandleActionSelect = useCallback(
    (action: DialogSystemAction) => {
      if (!actualCurrentStep || !dialogState.currentDialogId || !action.id)
        return;

      if (action.outcomes) {
        const outcomesToProcess = Array.isArray(action.outcomes)
          ? action.outcomes
          : [action.outcomes];
        outcomesToProcess.forEach(processSingleOutcomeCallback);
      }

      if (!action.isDialogEnd) {
        addDialogSelectionToStore(dialogState.currentDialogId, action.id);
        setDialogState((prev) => ({
          ...prev,
          selectedActionIds: new Set(prev.selectedActionIds).add(action.id!),
        }));
      }

      if (action.isDialogEnd) {
        actualCloseDialog();
      } else if (action.nextStepId) {
        const currentDialogId = dialogState.currentDialogId;
        const newHistory = [
          ...dialogState.history,
          { dialogId: currentDialogId!, stepId: dialogState.currentStepId! },
        ];
        setDialogState((prev) => ({
          ...prev,
          currentStepId: action.nextStepId!,
          history: newHistory,
        }));
      }
    },
    [
      actualCurrentStep,
      dialogState.currentDialogId,
      dialogState.history,
      actualCloseDialog,
      processSingleOutcomeCallback,
      addDialogSelectionToStore,
    ]
  );

  const finalIsDialogActive = dialogState.isOpen;
  const finalCurrentDialogStep = actualCurrentStep;
  const finalStartDialog = actualStartDialog;
  const finalHandleDialogAction = actualHandleActionSelect;
  const finalCloseSystemDialog = actualCloseDialog;
  const finalSelectedActionIdsForCurrentStep = dialogState.selectedActionIds;

  const handleNoteTableClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('handleNoteTableClick');
    e.stopPropagation();
    finalStartDialog('tableInvestigation');
  };

  const handleDoorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('handleDoorClick');
    e.stopPropagation();
    finalStartDialog('doorInteraction');
  };

  if (!characterState) {
    return (
      <Box
        sx={{
          padding: 2,
          color: 'black',
          textAlign: 'center',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h5">캐릭터 정보를 로딩 중입니다...</Typography>
      </Box>
    );
  }
  if (!gameStateForCallbacks && characterState) {
    return (
      <Box
        sx={{
          padding: 2,
          color: 'black',
          textAlign: 'center',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h5">게임 상태를 초기화 중입니다...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '600px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <img
        style={{
          width: '100%',
          height: '600px',
          objectFit: 'cover',
        }}
        src="images/room.png"
        alt="manor"
      />
      <Box
        sx={{
          width: 300,
          height: 300,
          position: 'absolute',
          top: 300,
          left: 250,
          zIndex: 10,
        }}
        onClick={handleNoteTableClick}
      >
        <img
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          src="images/noteondesk.png"
          alt="noteondesk"
        />
      </Box>
      <Typography
        sx={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          zIndex: 101,
          transform: 'translateX(-50%)',
        }}
        variant="h1"
      >
        FirstHalf08
      </Typography>
      <Box
        sx={{
          position: 'absolute',
          width: '187px',
          height: '310px',
          top: 130,
          left: 304,
          zIndex: 1,
        }}
        onClick={handleDoorClick}
      ></Box>

      {finalIsDialogActive && finalCurrentDialogStep && (
        <CommonEventModal
          open={finalIsDialogActive}
          onClose={finalCloseSystemDialog}
          title={finalCurrentDialogStep.title}
          description={finalCurrentDialogStep.description}
          imagePath={finalCurrentDialogStep.imagePath}
          dialogActions={finalCurrentDialogStep.actions}
          onDialogActionSelect={finalHandleDialogAction}
          selectedActionIds={finalSelectedActionIdsForCurrentStep}
        />
      )}
      {/* <Button
        sx={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          zIndex: 101,
          transform: 'translateX(-50%)',
        }}
        onClick={() => startFadeOutToBlack(getNextSceneUrl(), 1500)}
      >
        Next Scene
      </Button> */}
    </Box>
  );
};

export default FirstHalf08;
