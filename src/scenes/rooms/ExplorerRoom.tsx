// src/scenes/rooms/ExplorerRoom.tsx
import React, { useState, useCallback, useMemo } from 'react';
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
import { DialogSequence } from '../../types/DialogSystemTypes';
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
              '방 안에 잡동사니가 잔뜩 있는 테이블이 있다. 테이블에서 단서를 찾을 수 있을까 싶어 테이블을 뒤져본다.',
            actions: [
              { id: 's_next', text: '다음', nextStepId: 'choice_table' },
            ],
          },
          choice_table: {
            id: 'choice_table',
            title: '해골과 펼쳐져 있는 낡은 노트',
            description:
              '사람의 해골과 낡은 노트가 펼쳐져 있다. 무언가 단서가 될 수 있을까?',
            actions: [
              {
                id: 's_observe_skull',
                text: '해골을 관찰한다.',
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
                nextStepId: 'result_note',
              },
              {
                id: 's_ignore_table',
                text: '조사를 그만둔다.',
                isDialogEnd: true,
              },
            ],
          },
          result_skull: {
            id: 'result_skull',
            title: '해골을 관찰한다.',
            description: `눈앞의 해골, 그 눈구멍은 공허하지 않았다. 역겨운 벌레가 꿈틀대며 기어 나왔고, 그것은 본능적으로 나의 가장 취약한 곳, 눈을 향해 날아들었다. 숨 막히는 공포에 눈을 감았다 뜨자, 해골의 눈에서 뿜어져 나온 빛만이 잔상처럼 남았을 뿐, 벌레는 사라지고 없었다. 정말 사라진 걸까? \n이성 수치가 감소했습니다.(-10)`,
            actions: [
              {
                id: 'rs_confirm_initial',
                text: '확인 (처음으로)',
                nextStepId: 'start',
              },
              {
                id: 'rs_close',
                text: '탐색 종료',
                isDialogEnd: true,
              },
            ],
          },
          result_note: {
            id: 'result_note',
            title: '노트를 읽어본다.',
            description:
              '노트의 필체가 익숙하다. 동생과 함께 찍은 사진의 뒷면을 확인하니 동생이 쓴 메모가 있다. 확실하다. 이 노트는 동생이 작성한것이다.',
            actions: [
              {
                id: 'rn_confirm_brother',
                text: '동생은 이 저택에 있었다!',
                outcomes: [
                  {
                    type: 'customEffect',
                    payload: {
                      effectId: 'PLAYER_EFFECT',
                    },
                  },
                ],
                nextStepId: 'start',
              },
            ],
          },
        },
      },
      doorInteraction: {
        id: 'doorInteraction',
        initialStepId: 'ask_open',
        steps: {
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
    startDialog,
    handleActionSelect: handleDialogAction,
    closeDialog: closeSystemDialog,
  } = useDialogSystem({
    dialogSequences: explorerRoomDialogs,
    characterState,
    gameStateForCallbacks,
    processSingleOutcome: processSingleOutcomeCallback,
  });

  const handleSkullTableClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    startDialog('skullAndNote');
  };

  const handleDoorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    startDialog('doorInteraction');
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

      {isDialogActive && currentDialogStep && (
        <CommonEventModal
          open={isDialogActive}
          onClose={closeSystemDialog}
          title={currentDialogStep.title}
          description={currentDialogStep.description}
          imagePath={currentDialogStep.imagePath}
          dialogActions={currentDialogStep.actions}
          onDialogActionSelect={handleDialogAction}
        />
      )}
    </Box>
  );
};

export default ExplorerRoom;
