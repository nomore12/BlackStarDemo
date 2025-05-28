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
  const [isDoorOpen, setIsDoorOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModalContent, setCurrentModalContent] =
    useState<ModalContent | null>(null);
  const [eventLog, setEventLog] = useState<string[]>([]);
  // const [modalKeyHistory, setModalKeyHistory] = useState<string[]>([]); //   모달 키 히스토리 상태

  const gameStateForCallbacks = useMemo((): GameStateForCallbacks | null => {
    if (!characterState) return null;
    return {
      selectedCharacter: characterState,
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
            id: 'skull_result_confirm_goto_initial', // ID를 좀 더 명확하게 변경 (선택 사항)
            buttonText: '확인 (처음으로)', // 버튼 텍스트 변경 (선택 사항)
            outcome: {
              type: 'customEffect',
              payload: {
                effectId: 'OPEN_MODAL', // <<< 'OPEN_MODAL' effectId 사용
                params: { modalKey: 'INITIAL_TYPE1' }, // <<< 열고 싶은 모달의 키를 지정
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
      DOOR_OPEN: {
        title: '문을 열어본다.',
        description: '문을 열어본다.',
        actions: [
          {
            id: 'door_open_effect',
            buttonText: '문을 열고 다음 방으로 이동한다.',
            outcome: [
              {
                type: 'moveToNextScene',
                payload: {
                  effectId: 'PLAYER_EFFECT',
                  params: {
                    message: '문이 열렸다!',
                  },
                },
              },
              { type: 'customEffect', payload: { effectId: 'CLOSE_MODAL' } },
            ] as RoomOutcome[],
          },
        ],
      },
      DOOR_CANCEL: {
        title: '문을 열지 않는다.',
        description: '문을 열지 않는다.',
        actions: [
          {
            id: 'door_open_effect',
            buttonText: '문을 열지 않는다.',
            outcome: [
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
      switch (outcome.type) {
        case 'text':
          break;
        case 'customEffect': {
          const payload = outcome.payload as CustomEffectOutcomePayload;

          if (payload.effectId === 'OPEN_MODAL' && payload.params?.modalKey) {
            const newModalKey = payload.params.modalKey;
            const nextModalData = tempModalDataStore[newModalKey];
            if (nextModalData) {
              setCurrentModalContent(nextModalData);
              // setModalKeyHistory((prevHistory: string[]) => {
              //   if (prevHistory[prevHistory.length - 1] === newModalKey)
              //     return prevHistory;
              //   return [...prevHistory, newModalKey];
              // });
              setIsModalOpen(true);
            } else {
              setIsModalOpen(false);
              setCurrentModalContent(null);
              // setModalKeyHistory([]);
            }
          } else if (payload.effectId === 'PLAYER_EFFECT') {
            const message = payload.params?.message || '효과 발생!';
            const hpChange = payload.params?.hpChange;
            // if (typeof hpChange === 'number' && characterState) {
            // }
          } else if (payload.effectId === 'CLOSE_MODAL') {
            setIsModalOpen(false);
            setCurrentModalContent(null);
            // setModalKeyHistory([]);
          } else if (payload.effectId === 'GO_BACK_MODAL') {
            // setModalKeyHistory((prevHistory: string[]) => {
            //   if (prevHistory.length <= 1) {
            //     setIsModalOpen(false);
            //     setCurrentModalContent(null);
            //     return [];
            //   }
            //   const newHistory = prevHistory.slice(0, -1);
            //   const previousModalKey = newHistory[newHistory.length - 1];
            //   if (previousModalKey) {
            //     const previousModalData = tempModalDataStore[previousModalKey];
            //     if (previousModalData) {
            //       setCurrentModalContent(previousModalData);
            //       setIsModalOpen(true);
            //     } else {
            //       setIsModalOpen(false);
            //       setCurrentModalContent(null);
            //       return [];
            //     }
            //   } else {
            //     setIsModalOpen(false);
            //     setCurrentModalContent(null);
            //     return [];
            //   }
            // });
          }
          break;
        }
        case 'decreaseSanity': {
          gameStoreInstance.changeCharacterSanity(-10);
          break;
        }
        case 'moveToNextScene': {
          setIsModalOpen(false);
          setCurrentModalContent(null);
          // setModalKeyHistory([]);
          const nextSceneUrl = sceneStoreInstance.getNextSceneUrl();
          console.log('nextSceneUrl', nextSceneUrl);
          if (nextSceneUrl.startsWith('/error')) {
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
        }
      }
    },
    [
      tempModalDataStore,
      characterState,
      gameStoreInstance,
      sceneStoreInstance,
      startFadeOutToBlack,
      setCurrentModalContent,
      setIsModalOpen,
      // setModalKeyHistory,
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

  const handleDoorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDoorOpen(!isDoorOpen);
    const initialModalKey = 'DOOR_OPEN';
    const initialModalData = tempModalDataStore[initialModalKey];
    if (initialModalData) {
      setCurrentModalContent(initialModalData);
      // setModalKeyHistory([initialModalKey]);
      setIsModalOpen(true);
    }
  };

  const startRoomEventWithModal = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const initialModalKey = 'INITIAL_TYPE1';
    const initialModalData = tempModalDataStore[initialModalKey];
    if (initialModalData) {
      setCurrentModalContent(initialModalData);
      // setModalKeyHistory([initialModalKey]);
      setIsModalOpen(true);
    }
  };

  const handleCloseFromModalComponent = () => {
    setIsModalOpen(false);
    setCurrentModalContent(null);
    // setModalKeyHistory([]);
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
          zIndex: 10,
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
      {currentModalContent && (
        <CommonEventModal
          open={isModalOpen}
          onClose={handleCloseFromModalComponent}
          content={currentModalContent}
          onProcessOutcomes={processModalActionOutcome}
        />
      )}
    </Box>
  );
};

export default ExplorerRoom;
