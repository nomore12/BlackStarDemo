// src/scenes/rooms/ExplorerRoom.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useSceneStore, SceneStoreState } from '../../store/sceneStore';
import {
  useGameStore,
  CharacterState,
  GameState as OverallGameState,
} from '../../store/characterStore';
import { usePageTransition } from '../../contexts/PageTransitionContext';
import CommonEventModal from '../../components/CommonEventModal';

import {
  RoomOutcome,
  CustomEffectOutcomePayload,
  CombinedGameAndSceneState,
} from '../../types/RoomEventsType';
import {
  DialogSequence,
  DialogSystemStep,
  DialogSystemAction,
} from '../../types/DialogSystemTypes';
import { useDialogSystem } from '../../hooks/useDialogSystem';

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
  actionPoints: 3,
  reactionPoints: 1,
  investigationPoints: 10,
  observationPoints: 12,
  luckPoints: 5,
  mutate: {
    tentacled: { isTentacle: false },
    theOtherWorldKnowledge: { isTheOtherWorldKnowledge: false },
  },
});

const ExplorerRoom: React.FC = () => {
  const navigate = useNavigate();
  const { startFadeOutToBlack } = usePageTransition();
  const gameStoreInstance = useGameStore();
  const sceneStoreInstance = useSceneStore();
  const characterState =
    useGameStore((state) => state.selectedCharacter) ??
    createDummyCharacterState();
  const { changeCharacterInvestigationPoints } = useGameStore();

  const gameStateForCallbacks =
    useMemo((): CombinedGameAndSceneState | null => {
      if (!gameStoreInstance.selectedCharacter) return null;

      return {
        ...gameStoreInstance,
        ...sceneStoreInstance,
      };
    }, [gameStoreInstance, sceneStoreInstance]);

  const explorerRoomDialogs: Record<string, DialogSequence> = useMemo(
    () => ({
      skullAndNote: {
        id: 'skullAndNote',
        initialStepId: 'start',
        steps: {
          start: {
            id: 'start',
            description:
              '방 안의 낡은 테이블은 기이한 물건들로 가득 차, 마치 광인의 제단과도 같다. 가까이 다가서자 알 수 없는 속삭임이 귓가를 맴도는 듯하고, 테이블 표면에서는 차가운 한기가 스며 나온다. 이 금지된 물건들 사이 어딘가에 내가 찾는 답이 있을지도 모른다는 생각에, 본능적인 공포를 억누르며 조심스럽게 손을 뻗어 잡동사니를 헤집는다.',
            actions: [
              { id: 's_next', text: '다음', nextStepId: 'choice_table' },
            ],
          },
          choice_table: {
            id: 'choice_table',
            title: '해골과 펼쳐져 있는 낡은 노트, 그리고 서랍', // 서랍 언급 추가
            description:
              '섬뜩한 해골과 그 해골이 지키는 낡은 노트. 그 안의 이야기는 분명 위험하지만, 참을 수 없이 궁금해진다. 테이블 한쪽에는 작은 서랍도 보인다.', // 서랍 언급 추가
            actions: [
              {
                id: 's_observe_skull',
                text: '해골을 관찰한다.',
                investigationPoints: 1,
                outcomes: [
                  {
                    type: 'decreaseSanity',
                    payload: { amount: -10, reason: '끔찍한 광경 목격' },
                  },
                ],
                nextStepId: 'result_skull',
              },
              {
                id: 's_observe_note',
                text: '노트를 관찰한다.',
                investigationPoints: 3,
                nextStepId: 'result_note_start',
              },
              {
                id: 's_check_drawer', // === 새로운 서랍 조사 액션 추가 ===
                text: '테이블 서랍을 살펴본다.',
                investigationPoints: 2,
                nextStepId: 'drawer_interaction_start_unique', // 새로운 서랍 상호작용 시작 스텝으로 연결 (ID 고유하게 변경)
              },
              {
                id: 's_ignore_table',
                text: '테이블 조사를 그만둔다.',
                isDialogEnd: true,
              },
            ],
          },
          result_skull: {
            // === 기존 해골 조사 내용 (변경 없음) ===
            id: 'result_skull',
            title: '해골을 관찰한다.',
            description: `눈앞의 해골, 그 눈구멍은 공허하지 않았다. 역겨운 벌레가 꿈틀대며 기어 나왔고, 그것은 본능적으로 나의 가장 취약한 곳, 눈을 향해 날아들었다. 숨 막히는 공포에 눈을 감았다 뜨자, 해골의 눈에서 뿜어져 나온 빛만이 잔상처럼 남았을 뿐, 벌레는 사라지고 없었다. 정말 사라진 걸까?`,
            actions: [
              {
                id: 'rs_confirm_initial',
                text: '확인 (테이블 조사 처음으로)',
                nextStepId: 'choice_table',
              },
              {
                id: 'rs_close',
                text: '탐색 종료',
                isDialogEnd: true,
              },
            ],
          },
          // --- 기존 노트 읽기 스텝 (점진적 공개 - 변경 없음) ---
          result_note_start: {
            id: 'result_note_start',
            title: '낡은 노트를 읽어본다.',
            description:
              '한 자 한 자, 익숙하지만 어딘가 뒤틀린 필체. 설마 하는 마음에 동생 사진 뒷면의 메모와 대조했다. 틀림없는 릴리의 글씨였다. \n\n첫 장은 릴리가 저택에 처음 도착했을 때의 호기심과 약간의 두려움이 담겨 있었다. "이곳은 뭔가 특별해. 벽 너머에서 이상한 소리가 들리지만, 나쁜 느낌은 아니야."',
            actions: [
              {
                id: 'rn_continue_reading_1',
                text: '계속 읽는다...',
                nextStepId: 'result_note_middle',
              },
              {
                id: 'rn_stop_reading_early',
                text: '그만 읽는다.',
                isDialogEnd: true,
                outcomes: [
                  {
                    type: 'text',
                    payload: '왠지 모를 불길함에 노트를 덮었다.',
                  },
                ],
              },
            ],
          },
          result_note_middle: {
            id: 'result_note_middle',
            title: '계속해서 노트를 읽는다...',
            description:
              '페이지를 넘길수록, 내용은 점차 기괴하게 변해갔다. 알아볼 수 없는 기호들이 글자 사이를 파고들고, 평범했던 그림들은 점차 끔찍한 형상으로 변해 있었다. 릴리의 순수했던 문장들은 점차 광적인 열망으로 가득 찼다.\n\n"그분들이 내게 말을 걸어와. 별들의 언어로 속삭여. 처음엔 무서웠지만, 이젠... 아름답게 느껴져. 내 몸이 변하는 것 같아. 새로운 눈이 생기고, 새로운 목소리가 들려와. 이건 축복이야!"',
            actions: [
              {
                id: 'rn_continue_reading_2',
                text: '마지막 장을 확인한다.',
                nextStepId: 'result_note_end',
                outcomes: [
                  {
                    type: 'decreaseSanity',
                    payload: {
                      amount: -5,
                      reason: '동생의 광기 어린 기록을 계속 읽음',
                    },
                  },
                ],
              },
              {
                id: 'rn_stop_reading_middle',
                text: '더는 못 읽겠다.',
                isDialogEnd: true,
                outcomes: [
                  {
                    type: 'decreaseSanity',
                    payload: {
                      amount: -5,
                      reason: '동생의 광기 어린 기록을 읽다가 멈춤',
                    },
                  },
                  { type: 'text', payload: '끔찍한 내용에 속이 메스꺼워진다.' },
                ],
              },
            ],
          },
          result_note_end: {
            id: 'result_note_end',
            title: '노트의 마지막 장...',
            description: (characterState, gameState) => {
              let text =
                '마지막 장에는 피로 보이는 검붉은 얼룩과 함께, 거의 해독 불가능할 정도로 뒤틀린 글씨로 단 한 문장만이 갈겨져 있었다.\n\n"오빠... 모든 것이 연결되어 있어. 곧 만나게 될 거야... 이면에서. 나처럼... 아름답게..."\n\n';
              text +=
                '그 아래에는, 알아볼 수 없는 존재, 마치 꿈틀거리는 그림자 같은 형상이 그려져 있었다. 그것이 릴리라고는 믿고 싶지 않았다.\n\n';
              text +=
                '이것은 더 이상 희망의 단서가 아니었다. 동생이 이미 돌아올 수 없는 강을 건넜다는, 끔찍한 현실을 알리는 경고장이었다.';

              if (
                characterState &&
                characterState.mutate.theOtherWorldKnowledge
                  .isTheOtherWorldKnowledge
              ) {
                text +=
                  "\n\n...하지만 이면의 지식을 가진 당신은 이 문장에서 단순한 광기 이상의, 어떤 '초대'의 의미를 읽어낸다.";
              }
              return text;
            },
            actions: [
              {
                id: 'rn_confirm_sister_lost',
                text: '릴리는... 이미...',
                isDialogEnd: true,
                outcomes: [
                  {
                    type: 'decreaseSanity',
                    payload: {
                      amount: -10,
                      reason: '동생이 완전히 변해버렸음을 깨달음',
                    },
                  },
                  {
                    type: 'customEffect',
                    payload: {
                      effectId: 'EVENT_EXPLORER_SISTER_LOST_CONFIRMED',
                    },
                  },
                ],
              },
              {
                id: 'rn_back_to_table_choice',
                text: '테이블 조사를 계속한다.',
                nextStepId: 'choice_table',
                outcomes: [
                  {
                    type: 'decreaseSanity',
                    payload: {
                      amount: -10, // 이 부분은 중복될 수 있으므로 시나리오에 맞게 조정이 필요합니다.
                      reason: '동생이 완전히 변해버렸음을 깨달음 (재확인)',
                    },
                  },
                ],
              },
            ],
          },
          // --- 기존 노트 읽기 스텝 종료 ---

          // === 제안 2: 특이한 내용물이 있는 서랍 (새로 추가되는 부분) ===
          drawer_interaction_start_unique: {
            // ID를 고유하게 변경 (기존 제안과 다르게)
            id: 'drawer_interaction_start_unique',
            title: '테이블 서랍',
            description:
              '테이블 아래의 낡은 서랍. 손잡이에 희미하게나마 별 모양 문양이 새겨져 있는 것 같다.',
            actions: [
              {
                id: 'drawer_open_carefully_unique', // 액션 ID도 고유하게
                text: '조심스럽게 서랍을 열어본다.',
                nextStepId: 'drawer_contents_reveal_unique',
              },
              {
                id: 'drawer_leave_it_star_unique',
                text: '수상해 보인다. 건드리지 말자.',
                nextStepId: 'choice_table', // 테이블 선택지로 돌아감
              },
            ],
          },

          drawer_contents_reveal_unique: {
            id: 'drawer_contents_reveal_unique',
            title: '서랍 속 내용물',
            imagePath: 'images/letterNstone.png', // 서랍 내부 이미지 경로 (실제 이미지 파일 필요)
            description:
              '서랍 안쪽 바닥에는 빛바랜 편지 한 통과 함께, 작고 검은 돌멩이가 놓여 있다. 돌멩이는 이상할 정도로 차갑고, 가만히 귀 기울이면 희미한 속삭임 같은 것이 들려오는 듯하다.',
            actions: [
              {
                id: 'drawer_read_letter_unique',
                text: '빛바랜 편지를 읽는다.',
                nextStepId: 'drawer_letter_content_unique',
              },
              {
                id: 'drawer_touch_stone_unique',
                text: '검은 돌멩이를 만져본다.',
                outcomes: [
                  {
                    type: 'decreaseSanity',
                    payload: { amount: -5, reason: '기이한 돌멩이를 만짐' },
                  },
                  {
                    type: 'text',
                    payload:
                      '돌멩이를 만지자 섬뜩한 한기가 손끝을 통해 온몸으로 퍼져나간다! 머릿속에 알 수 없는 환영이 스쳐 지나갔다.',
                  },
                  // { type: 'customEffect', payload: { effectId: 'VISION_OF_THE_PAST_UNIQUE' } } // 이벤트 트리거 시 ID 고유하게
                ],
                nextStepId: 'drawer_contents_reveal_unique', // 다시 내용물 확인으로 (돌멩이 만진 후)
              },
              {
                id: 'drawer_take_all_unique',
                text: '모두 챙긴다.',
                outcomes: [
                  {
                    type: 'addItem',
                    payload: {
                      item: {
                        id: 'faded_letter_item_unique',
                        name: '빛바랜 편지 (서랍)',
                        description:
                          '서랍에서 발견된 오래되어 바스러질듯한 편지.',
                      },
                    },
                  },
                  {
                    type: 'addItem',
                    payload: {
                      item: {
                        id: 'whispering_stone_unique',
                        name: '속삭이는 검은 돌 (서랍)',
                        description:
                          '서랍에서 발견된, 기묘한 냉기와 속삭임이 느껴지는 검은 돌.',
                      },
                    },
                  },
                  { type: 'text', payload: '편지와 검은 돌멩이를 챙겼다.' },
                ],
                nextStepId: 'choice_table', // 아이템 획득 후 테이블 선택지로
              },
              {
                id: 'drawer_close_contents_unique',
                text: '서랍을 다시 닫는다.',
                nextStepId: 'choice_table', // 테이블 선택지로 돌아감
              },
            ],
          },

          drawer_letter_content_unique: {
            id: 'drawer_letter_content_unique',
            title: '빛바랜 편지 (서랍)',
            description: (cs, gs) => {
              let content =
                '편지는 거의 해독하기 어려울 정도로 낡았지만, 몇몇 단어는 간신히 알아볼 수 있었다.\n\n"...별들이 정렬될 때...", "...문이 열리리라...", 그리고 마지막엔 피로 보이는 얼룩과 함께 "...그녀를 막아야 해..." 라는 글자가 적혀있었다.';
              if (cs?.mutate.theOtherWorldKnowledge.isTheOtherWorldKnowledge) {
                //
                content +=
                  '\n\n이면의 지식 덕분에, 당신은 이 편지가 단순한 경고가 아니라, 어떤 의식의 실패와 그 결과에 대한 기록임을 깨닫는다.';
              }
              return content;
            },
            actions: [
              {
                id: 'drawer_letter_understood_unique',
                text: '알 수 없는 불안감이 엄습한다.',
                outcomes: [
                  {
                    type: 'decreaseSanity',
                    payload: { amount: -3, reason: '불길한 편지(서랍)를 읽음' },
                  },
                ],
                nextStepId: 'drawer_contents_reveal_unique', // 이전 내용물 확인 스텝으로 돌아감
              },
            ],
          },
          // === 서랍 관련 스텝 종료 ===
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
    }),
    []
  );

  const processSingleOutcomeCallback = useCallback(
    (outcome: RoomOutcome) => {
      console.log('Processing outcome via callback:', outcome);
      switch (outcome.type) {
        case 'text':
          console.log('[텍스트 이벤트]:', outcome.payload);
          break;
        case 'customEffect': {
          const payload = outcome.payload as CustomEffectOutcomePayload;
          if (payload.effectId === 'PLAYER_EFFECT') {
            gameStoreInstance.applyPlayerEffect({
              hpChange: payload.params?.hpChange,
              sanityChange: payload.params?.sanityChange,
              message: payload.params?.message || '특수 효과 발생!',
              reason: payload.params?.reason,
              ...payload.params,
            });
          } else {
            console.warn(`Unhandled customEffect ID: ${payload.effectId}`);
          }
          break;
        }
        case 'decreaseSanity': {
          gameStoreInstance.changeCharacterSanity(
            outcome.payload.amount,
            outcome.payload.reason
          );
          break;
        }
        case 'moveToNextScene': {
          const nextSceneUrl = sceneStoreInstance.getNextSceneUrl();
          if (nextSceneUrl.startsWith('/error')) {
            console.error(`씬 이동 오류: ${nextSceneUrl}`);
            alert(`다음 씬 정보를 가져오는 데 실패했습니다: ${nextSceneUrl}`);
          } else {
            startFadeOutToBlack(nextSceneUrl, 1000);
          }
          break;
        }
        case 'updateCharacterState': {
          console.log(
            '캐릭터 상태 업데이트 (TODO: 스토어 액션으로 구체화):',
            outcome.payload
          );
          break;
        }
        default: {
          let logMessage = `알 수 없는 Outcome, 전체 값: ${JSON.stringify(outcome)}`;
          if (
            typeof outcome === 'object' &&
            outcome !== null &&
            'type' in outcome
          ) {
            logMessage = `알 수 없는 Outcome 타입: ${(outcome as { type: unknown }).type}, 전체 값: ${JSON.stringify(outcome)}`;
          }
          console.warn(logMessage);
          break;
        }
      }
    },
    [gameStoreInstance, sceneStoreInstance, startFadeOutToBlack]
  );

  const {
    isOpen: isDialogActive,
    currentStep: currentDialogStep,
    startDialog: startDialogFromUseDialogSystem,
    handleActionSelect: handleDialogActionFromUseDialogSystem,
    closeDialog: closeSystemDialogFromUseDialogSystem,
  } = useDialogSystem({
    dialogSequences: explorerRoomDialogs,
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
      const sequence = explorerRoomDialogs[dialogId];
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
    [explorerRoomDialogs, getDialogSelectionsFromStore]
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
    const sequence = explorerRoomDialogs[dialogState.currentDialogId];
    if (!sequence) return null;
    return sequence.steps[dialogState.currentStepId] || null;
  }, [
    dialogState.isOpen,
    dialogState.currentDialogId,
    dialogState.currentStepId,
    explorerRoomDialogs,
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

  const handleSkullTableClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('handleSkullTableClick');
    e.stopPropagation();
    finalStartDialog('skullAndNote');
  };

  const handleDoorClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
        onClick={handleSkullTableClick}
      >
        <img
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          src="images/skullontable.png"
          alt="skullontable"
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
        FirstHalf01
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
    </Box>
  );
};

export default ExplorerRoom;
