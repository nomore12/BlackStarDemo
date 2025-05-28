// src/scenes/rooms/ExplorerRoom.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useSceneStore, SceneStoreState } from '../../store/sceneStore';
import {
  useGameStore,
  CharacterState,
  GameState,
  MutateState,
} from '../../store/characterStore';
import { usePageTransition } from '../../contexts/PageTransitionContext';
import CommonEventModal from '../../components/CommonEventModal';
// import { explorerRoom_SkullAndNote_Data as actualRoomData } from '../../data/ExplorerRoomEvents';

import {
  ModalContent,
  RoomOutcome,
  RoomInteractAction,
  CustomEffectOutcomePayload,
} from '../../types/RoomEventsType';

type GameStateForCallbacks = GameState & SceneStoreState;

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
  const characterFromStore = useGameStore((state) => state.selectedCharacter);
  const characterState = characterFromStore || createDummyCharacterState();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModalContent, setCurrentModalContent] =
    useState<ModalContent | null>(null);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [modalKeyHistory, setModalKeyHistory] = useState<string[]>([]); // 모달 키 히스토리 상태

  const addLog = useCallback((message: string) => {
    setEventLog((prev) => [message, ...prev.slice(0, 9)]);
    console.log(message);
  }, []);

  const gameStateForCallbacks = useMemo((): GameStateForCallbacks | null => {
    if (!characterState) return null;
    return {
      /* ... 이전과 동일 ... */ selectedCharacter: characterState,
      doomGauge: gameStoreInstance.doomGauge,
      currentRoomId: sceneStoreInstance.currentSceneId,
      selectCharacter: gameStoreInstance.selectCharacter,
      changeDoomGauge: gameStoreInstance.changeDoomGauge,
      changeCharacterHp: gameStoreInstance.changeCharacterHp,
      changeCharacterSanity: gameStoreInstance.changeCharacterSanity,
      changeCharacterActionPoints:
        gameStoreInstance.changeCharacterActionPoints,
      changeCharacterReactionPoints:
        gameStoreInstance.changeCharacterReactionPoints,
      changeCharacterInvestigationPoints:
        gameStoreInstance.changeCharacterInvestigationPoints,
      changeCharacterObservationPoints:
        gameStoreInstance.changeCharacterObservationPoints,
      changeCharacterLuckPoints: gameStoreInstance.changeCharacterLuckPoints,
      setCharacterMutate: gameStoreInstance.setCharacterMutate,
      currentRunSceneIds: sceneStoreInstance.currentRunSceneIds,
      currentSceneIndex: sceneStoreInstance.currentSceneIndex,
      currentSceneId: sceneStoreInstance.currentSceneId,
      totalScenesInRun: sceneStoreInstance.totalScenesInRun,
      initializeRunScenes: sceneStoreInstance.initializeRunScenes,
      getNextSceneUrl: sceneStoreInstance.getNextSceneUrl,
      reset: sceneStoreInstance.reset,
    };
  }, [characterState, gameStoreInstance, sceneStoreInstance]);

  const tempModalDataStore: Record<string, ModalContent> = useMemo(
    () => ({
      INITIAL_TYPE1: {
        title: '방 안에 잡동사니가 잔뜩 있는 테이블이 있다.',
        description: '테이블에서 단서를 찾을 수 있을까 싶어 테이블을 뒤져본다.',
        actions: [
          {
            id: 'next_to_type2',
            buttonText: '다음',
            outcome: {
              type: 'customEffect',
              payload: {
                effectId: 'OPEN_MODAL',
                params: { modalKey: 'CHOICE_TYPE2_A' },
              },
            } as RoomOutcome,
          },
        ],
      },
      CHOICE_TYPE2_A: {
        title: '해골과 펼쳐져 있는 낡은 노트',
        description: (cs, gs) =>
          '사람의 해골과 낡은 노트가 펼쳐져 있다. 무언가 단서가 될 수 있을까?',
        actions: [
          {
            id: 'skull_observation',
            buttonText: '해골을 관찰한다.',
            outcome: [
              {
                type: 'decreaseSanity',
                payload: {
                  amount: -10,
                  reason: '끔찍한 광경 목격',
                },
                text: '끔찍한 광경을 목격하여 정신력이 크게 감소합니다!',
              } as RoomOutcome,
              {
                type: 'customEffect',
                payload: {
                  effectId: 'OPEN_MODAL',
                  params: { modalKey: 'RESULT_SKULL' }, // RESULT_SKULL 모달로 연결
                },
              } as RoomOutcome,
            ], // 배열로 닫음
          },
          {
            id: 'note_observation',
            buttonText: '노트를 관찰한다.',
            outcome: {
              type: 'customEffect',
              payload: {
                effectId: 'OPEN_MODAL',
                params: { modalKey: 'RESULT_NOTE' },
              },
            } as RoomOutcome,
          },
          {
            id: 'choice_A_ignore',
            buttonText: '무시한다.',
            outcome: {
              type: 'customEffect',
              payload: { effectId: 'CLOSE_MODAL' },
            } as RoomOutcome,
          },
        ],
      },
      RESULT_SKULL: {
        title: '해골을 관찰한다.',
        description: `눈앞의 해골, 그 눈구멍은 공허하지 않았다. 역겨운 벌레가 꿈틀대며 기어 나왔고, 그것은 본능적으로 나의 가장 취약한 곳, 눈을 향해 날아들었다. 숨 막히는 공포에 눈을 감았다 뜨자, 해골의 눈에서 뿜어져 나온 빛만이 잔상처럼 남았을 뿐, 벌레는 사라지고 없었다. 정말 사라진 걸까? \n
이성추치가 감소했습니다.(-10)`,
        actions: [
          {
            id: 'skull_result_confirm',
            buttonText: '확인',
            outcome: {
              type: 'customEffect',
              payload: {
                effectId: 'GO_BACK_MODAL',
              },
            } as RoomOutcome,
          },
          {
            id: 'skull_result_close',
            buttonText: '탐색 종료',
            outcome: {
              type: 'customEffect',
              payload: { effectId: 'CLOSE_MODAL' },
            } as RoomOutcome,
          },
        ],
      },
      RESULT_NOTE: {
        title: '노트를 읽어본다.',
        description:
          '노트의 필체가 익숙하다. 동생과 함께 찍은 사진의 뒷면을 확인하니 동생이 쓴 메모가 있다. 확실하다. 이 노트는 동생이 작성한것이다.',
        actions: [
          {
            id: 'right_door_trap_effect',
            buttonText: '동생은 이 저택에 있었다!',
            outcome: [
              {
                type: 'customEffect',
                payload: {
                  effectId: 'PLAYER_EFFECT',
                  params: {
                    message: '함정에 빠져 체력이 5 감소했다!',
                    hpChange: -5,
                  },
                },
              },
              { type: 'customEffect', payload: { effectId: 'CLOSE_MODAL' } },
            ] as RoomOutcome[],
          },
        ],
      },
    }),
    []
  );

  const processSingleOutcome = useCallback(
    (outcome: RoomOutcome) => {
      addLog(
        `Outcome: ${outcome.type}, Payload: ${JSON.stringify(outcome.payload)}`
      );

      switch (outcome.type) {
        case 'text':
          addLog(`[텍스트 이벤트] ${outcome.payload}`);
          break;
        case 'customEffect': {
          const payload = outcome.payload as CustomEffectOutcomePayload;
          addLog(
            `[커스텀 효과]: ${payload.effectId}, Params: ${JSON.stringify(payload.params)}`
          );

          if (payload.effectId === 'OPEN_MODAL' && payload.params?.modalKey) {
            const newModalKey = payload.params.modalKey;
            const nextModalData = tempModalDataStore[newModalKey];
            if (nextModalData) {
              addLog(`모달 전환: ${newModalKey}`);
              setCurrentModalContent(nextModalData);
              setModalKeyHistory((prevHistory) => {
                // 히스토리 업데이트
                if (prevHistory[prevHistory.length - 1] === newModalKey)
                  return prevHistory; // 중복 추가 방지
                return [...prevHistory, newModalKey];
              });
              setIsModalOpen(true);
            } else {
              addLog(`오류: ${newModalKey}에 해당하는 모달 데이터 없음`);
              setIsModalOpen(false);
              setCurrentModalContent(null);
              setModalKeyHistory([]); // 오류 시 히스토리 초기화
            }
          } else if (payload.effectId === 'PLAYER_EFFECT') {
            const message = payload.params?.message || '효과 발생!';
            const hpChange = payload.params?.hpChange;
            addLog(`[플레이어 영향] ${message}`);
            if (typeof hpChange === 'number' && characterState) {
              addLog(
                `(시뮬레이션) ${characterState.name} 체력 ${hpChange > 0 ? '+' : ''}${hpChange}`
              );
              // gameStoreInstance.changeCharacterHp(hpChange);
            }
          } else if (payload.effectId === 'CLOSE_MODAL') {
            addLog('모달 닫기 명령 실행');
            setIsModalOpen(false);
            setCurrentModalContent(null);
            setModalKeyHistory([]); // 모달 닫을 때 히스토리 초기화
          } else if (payload.effectId === 'GO_BACK_MODAL') {
            addLog('이전 모달로 돌아가기 시도');
            setModalKeyHistory((prevHistory) => {
              if (prevHistory.length <= 1) {
                addLog('돌아갈 이전 모달이 없어 현재 모달을 닫습니다.');
                setIsModalOpen(false);
                setCurrentModalContent(null);
                return []; // 히스토리 초기화
              }
              const newHistory = prevHistory.slice(0, -1); // 현재 모달 키 제거
              const previousModalKey = newHistory[newHistory.length - 1]; // 이전 모달 키 가져오기

              if (previousModalKey) {
                const previousModalData = tempModalDataStore[previousModalKey];
                if (previousModalData) {
                  addLog(`'${previousModalKey}' 모달로 돌아갑니다.`);
                  setCurrentModalContent(previousModalData);
                  setIsModalOpen(true); // 이전 모달을 다시 염
                } else {
                  addLog(
                    `오류: 이전 모달 키 '${previousModalKey}' 데이터 없음. 모달을 닫습니다.`
                  );
                  setIsModalOpen(false);
                  setCurrentModalContent(null);
                  return []; // 오류 시 히스토리 초기화
                }
              } else {
                // 이론적으로는 prevHistory.length <= 1 에서 걸러짐
                addLog(
                  '치명적 오류: 이전 모달 키를 찾을 수 없음. 모달을 닫습니다.'
                );
                setIsModalOpen(false);
                setCurrentModalContent(null);
                return [];
              }
              return newHistory; // 업데이트된 히스토리 반환
            });
          }
          break;
        }
        case 'decreaseSanity': {
          gameStoreInstance.changeCharacterSanity(-10);
          break;
        }
        case 'moveToNextScene': {
          addLog('다음 씬으로 이동합니다.');
          setIsModalOpen(false);
          setCurrentModalContent(null);
          setModalKeyHistory([]); // 씬 이동 시 히스토리 초기화
          const nextSceneUrl = sceneStoreInstance.getNextSceneUrl();
          if (nextSceneUrl.startsWith('/error')) {
            addLog(`씬 이동 오류: ${nextSceneUrl}`);
            console.error('씬 이동 오류:', nextSceneUrl);
            alert(`다음 씬 정보를 가져오는 데 실패했습니다: ${nextSceneUrl}`);
          } else {
            startFadeOutToBlack(nextSceneUrl, 1000);
          }
          break;
        }
        default: {
          let logMessage = `알 수 없는 Outcome, 전체 값: ${JSON.stringify(outcome)}`;
          if (
            typeof outcome === 'object' &&
            outcome !== null &&
            'type' in outcome
          ) {
            logMessage = `알 수 없는 Outcome 타입: ${String((outcome as { type: unknown }).type)}, 전체 값: ${JSON.stringify(outcome)}`;
          } else if (typeof outcome !== 'object' || outcome === null) {
            logMessage = `알 수 없는 Outcome (원시 타입 또는 null), 값: ${String(outcome)}`;
          }
          addLog(logMessage);
          break;
        }
      }
    },
    [
      addLog,
      tempModalDataStore,
      characterState,
      gameStoreInstance,
      sceneStoreInstance,
      startFadeOutToBlack,
      setCurrentModalContent,
      setIsModalOpen,
      setModalKeyHistory, // navigate는 startFadeOutToBlack이 내부적으로 처리 가정
    ]
  );

  const processModalActionOutcome = useCallback(
    (outcomes: RoomOutcome | RoomOutcome[]) => {
      if (Array.isArray(outcomes)) {
        outcomes.forEach(processSingleOutcome);
      } else {
        processSingleOutcome(outcomes);
      }
    },
    [processSingleOutcome]
  );

  const startRoomEventWithModal = () => {
    addLog('방 이벤트 시작 - 초기 모달(타입1) 표시');
    const initialModalKey = 'INITIAL_TYPE1'; // 초기 모달 키
    const initialModalData = tempModalDataStore[initialModalKey];
    if (initialModalData) {
      setCurrentModalContent(initialModalData);
      setModalKeyHistory([initialModalKey]); // 히스토리 시작
      setIsModalOpen(true);
    } else {
      addLog('오류: 초기 모달 데이터를 찾을 수 없음');
    }
  };

  const handleCloseFromModalComponent = () => {
    addLog('모달 컴포넌트의 자체 닫기 기능 사용됨 (배경 클릭 등)');
    setIsModalOpen(false);
    setCurrentModalContent(null);
    setModalKeyHistory([]); // 모달 강제 종료 시 히스토리 초기화
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
  if (!gameStateForCallbacks) {
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
        }}
        onClick={startRoomEventWithModal}
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
      <Button
        sx={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          zIndex: 101,
          transform: 'translateX(-50%)',
        }}
        onClick={() =>
          startFadeOutToBlack(sceneStoreInstance.getNextSceneUrl(), 1500)
        }
      >
        Next Scene
      </Button>
      {currentModalContent && (
        <CommonEventModal
          open={isModalOpen}
          onClose={handleCloseFromModalComponent}
          content={currentModalContent}
          onProcessOutcomes={processModalActionOutcome}
        />
      )}
    </Box>
    // <Box sx={{ padding: 2, backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
    //   <Typography variant="h5">ExplorerRoom (모달 테스트 통합)</Typography>
    //   <Button
    //     variant="contained"
    //     onClick={startRoomEventWithModal}
    //     sx={{ my: 2 }}
    //   >
    //     방 이벤트 시작 (모달)
    //   </Button>

    //   <Box
    //     sx={{
    //       mt: 1,
    //       p: 1,
    //       border: '1px solid lightgray',
    //       backgroundColor: 'white',
    //       color: 'black',
    //       maxHeight: 200,
    //       overflowY: 'auto',
    //     }}
    //   >
    //     <Typography variant="subtitle2">이벤트 로그:</Typography>
    //     {eventLog.map((log, i) => (
    //       <Typography
    //         key={i}
    //         variant="caption"
    //         display="block"
    //         sx={{ whiteSpace: 'pre-wrap' }}
    //       >
    //         {log}
    //       </Typography>
    //     ))}
    //   </Box>

    //   {currentModalContent && (
    //     <CommonEventModal
    //       open={isModalOpen}
    //       onClose={handleCloseFromModalComponent}
    //       content={currentModalContent}
    //       onProcessOutcomes={processModalActionOutcome}
    //     />
    //   )}
    // </Box>
  );
};

export default ExplorerRoom;
