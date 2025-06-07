import React, { useMemo, useState } from 'react';
import { useSceneStore } from '../../store/sceneStore';
import { usePageTransition } from '../../contexts/PageTransitionContext';
import { Box } from '@mui/material';
import type { DialogSequence } from '../../types/DialogSystemTypes';
import { useGameStore } from '../../store/characterStore';
import CharacterLoadingPlaceholder from '../../components/CharacterLoadingPlaceholder';
import RoomDialogController from '../../components/RoomDialogController';
import { createDummyCharacterState } from '../../utils/characterUtils';
import { ACTION_ID_NEXT } from '../../constants/dialogConstants';

const FirstHalf02: React.FC = () => {
  const { startFadeOutToBlack } = usePageTransition();
  const gameStoreInstance = useGameStore();
  const sceneStoreInstance = useSceneStore();

  const [activeDialogId, setActiveDialogId] = useState<string | null>(null);

  const selectedCharacter = useGameStore((state) => state.selectedCharacter);

  const roomDialogs: Record<string, DialogSequence> = useMemo(
    () => ({
      // --- 좀비 조우 다이얼로그 시퀀스 ---
      zombieEncounter: {
        id: 'zombieEncounter',
        initialStepId: 'start-zombie-encounter', // 조우 시작 (포인트 소모X)
        steps: {
          'start-zombie-encounter': {
            id: 'start-zombie-encounter',
            title: '걸어 다니는 시체',
            imagePath: 'images/zombie.png', // 좀비 이미지
            description:
              '복도 저편에서 비틀거리는 인영이 당신을 발견하고 천천히 다가온다. 생기 없는 눈, 썩어가는 피부, 셔츠의 핏자국... 살아있는 인간이 아니다. 낮은 신음 소리를 내며 당신의 길을 막아선다.',
            actions: [
              {
                id: ACTION_ID_NEXT,
                text: '어떻게든 대응한다.',
                nextStepId: 'detail-zombie-main-choices-IP', // 포인트 소모 선택지가 있는 스텝으로 이동
              },
              {
                id: 'zombie-cancel-initial-encounter',
                text: '조용히 뒷걸음질 쳐 다른 길을 찾아본다.',
                isDialogEnd: true,
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '소리를 내지 않고 조심스럽게 물러나 다른 복도로 향했다.',
                  },
                ],
              },
            ],
          },
          // 1단계: 좀비에 대한 주요 접근 방식 선택 (포인트 소모)
          'detail-zombie-main-choices-IP': {
            id: 'detail-zombie-main-choices-IP',
            title: '대응 방식 선택',
            imagePath: 'images/zombie.png',
            description: (characterState, gameState) => {
              return '이 끔찍한 존재를 어떻게 상대하시겠습니까? (학자: 6 IP, 탐험가: 4 IP 전체 공유)';
            },
            actions: [
              {
                id: 'zombie-choice-attack',
                text: '정면으로 공격하여 돌파를 시도한다. (전투) [조사 포인트 1]',
                investigationPoints: 1,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 1, reason: '좀비 정면 공격' },
                  },
                ],
                nextStepId: 'sub-detail-zombie-fight', // 무조건 전투 스텝으로
              },
              {
                id: 'zombie-choice-distract',
                text: '주변의 사물을 이용해 주의를 끈다. [조사 포인트 2]',
                investigationPoints: 2,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 2, reason: '좀비 주의 끌기 시도' },
                  },
                ],
                nextStepId: 'sub-detail-zombie-distraction',
              },
              {
                id: 'zombie-choice-observe',
                text: '좀비의 상태나 소지품을 자세히 관찰한다. [조사 포인트 3]',
                investigationPoints: 3,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 3, reason: '좀비 상태 관찰' },
                  },
                ],
                nextStepId: 'sub-detail-zombie-observation',
              },
              {
                id: 'zombie-finish-this-encounter',
                text: '대응을 포기하고 물러선다.',
                isDialogEnd: true,
              },
            ],
          },
          // 2단계: 세부 조사 (포인트 소모 없음)
          'sub-detail-zombie-fight': {
            id: 'sub-detail-zombie-fight',
            title: '전투!',
            description:
              '당신은 무기를 꺼내 들고 좀비에게 달려들었다. 다른 선택지는 없다!',
            actions: [
              {
                id: 'zombie-fight-result',
                text: '결판을 낸다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '좀비의 저항은 거셌지만, 결국 놈의 머리를 가격하여 쓰러뜨리는 데 성공했다. 하지만 이 과정에서 당신도 상처를 피할 수는 없었다.',
                  },
                  {
                    type: 'decreaseHitPoints',
                    payload: { amount: 25, reason: '좀비와의 정면 전투' },
                  },
                  {
                    type: 'text',
                    payload:
                      '전투에서 간신히 살아남았다. / (체력이 0 이하면) 당신은 좀비에게 물어뜯겨 쓰러졌다. 중 하나가 출력되도록 구현',
                  },
                ],
                isDialogEnd: true, // 전투 후 다이얼로그 종료
              },
            ],
          },
          'sub-detail-zombie-distraction': {
            id: 'sub-detail-zombie-distraction',
            title: '주의 끌기',
            description:
              '좀비의 시선을 다른 곳으로 돌려, 그 틈에 지나갈 방법을 모색한다. 어떻게 주의를 끌까?',
            actions: [
              {
                id: 'distraction-result-1',
                text: '반대편 복도로 돌멩이를 던진다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '돌멩이가 복도 저편에서 소리를 내자, 좀비가 느릿하게 그쪽으로 몸을 돌린다. 당신은 그 틈을 타 조용히 좀비 곁을 지나쳤다. (전투 회피 성공)',
                  },
                ],
                isDialogEnd: true,
              },
              {
                id: 'distraction-result-2',
                text: '가까이 있는 선반을 밀어 넘어뜨린다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '선반이 큰 소리를 내며 넘어지자 좀비가 움찔한다! 하지만 소리가 너무 가까웠던 탓에, 좀비는 곧장 당신을 향해 달려들었다!',
                  },
                  {
                    type: 'decreaseHitPoints',
                    payload: {
                      amount: 15,
                      reason: '주의 끌기 실패로 인한 전투',
                    },
                  },
                  {
                    type: 'text',
                    payload:
                      '예상치 못한 전투에서 간신히 살아남았다. / (체력이 0 이하면) 당신은 좀비에게 붙잡혀 쓰러졌다. 중 하나가 출력되도록 구현',
                  },
                ],
                isDialogEnd: true,
              },
            ],
          },
          'sub-detail-zombie-observation': {
            id: 'sub-detail-zombie-observation',
            title: '상태 관찰',
            description:
              '좀비가 당신을 완전히 인지하기 전에, 그에게서 단서를 찾으려 한다. 무엇을 중점적으로 관찰할까?',
            actions: [
              {
                id: 'observation-result-1',
                text: '멀리서 가슴의 명찰이나 옷차림을 본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '좀비의 셔츠 주머니에 꽂힌 명찰을 간신히 읽을 수 있었다. "연구원 존 도". 그는 이 저택의 직원이었다. 가슴의 핏자국은 총상처럼 보인다. (좀비의 신원 단서 획득 - 텍스트 언급)',
                  },
                ],
                nextStepId: 'detail-zombie-main-choices-IP', // 관찰 후 다시 선택지로
              },
              {
                id: 'observation-result-2',
                text: '허리춤의 열쇠 꾸러미를 확인하기 위해 조심스럽게 다가간다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '당신이 몇 걸음 다가서는 순간, 바닥의 삐걱이는 소리에 좀비의 고개가 홱 돌아갔다! 굶주린 눈이 당신을 발견하고는 끔찍한 신음을 내며 달려든다!',
                  },
                  {
                    type: 'decreaseHitPoints',
                    payload: {
                      amount: 20,
                      reason: '관찰 중 발각되어 전투 발생',
                    },
                  },
                  {
                    type: 'text',
                    payload:
                      '기습적인 전투에서 간신히 살아남았다. / (체력이 0 이하면) 당신은 좀비의 손아귀에 붙잡혔다. 중 하나가 출력되도록 구현',
                  },
                ],
                isDialogEnd: true,
              },
            ],
          },
        },
      },
      // 방에서 나가는 등의 공통 액션을 위한 doorInteraction은 별도로 유지합니다.
      doorInteraction: {
        id: 'doorInteraction',
        initialStepId: 'ask-open-zombie-room-exit',
        steps: {
          'ask-open-zombie-room-exit': {
            id: 'ask-open-zombie-room-exit',
            title: '방 나가기',
            description: '이 위험한 곳에서 벗어나시겠습니까?',
            actions: [
              {
                id: 'di-exit-zombie-room',
                text: '다음 장소로 이동한다.',
                outcomes: [{ type: 'moveToNextScene', payload: undefined }],
                isDialogEnd: true,
              },
              {
                id: 'di-stay-zombie-room',
                text: '아직 이곳에 머무른다.',
                isDialogEnd: true,
              },
            ],
          },
        },
      },
    }),
    [selectedCharacter] // useMemo 의존성 배열
  );

  const handleZombieClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('handleNoteTableClick');
    e.stopPropagation();
    setActiveDialogId('zombieEncounter');
  };

  const handleDoorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setActiveDialogId('doorInteraction');
  };

  const handleCloseDialog = () => {
    setActiveDialogId(null);
  };

  if (!selectedCharacter) {
    return <CharacterLoadingPlaceholder />;
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
          top: 240,
          left: 360,
        }}
        onClick={handleZombieClick}
      >
        <img
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          src="images/zombie.png"
          alt="zombie"
        />
      </Box>
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
      <RoomDialogController
        dialogSequences={roomDialogs}
        activeDialogId={activeDialogId}
        onCloseDialog={handleCloseDialog}
        applyPlayerEffect={gameStoreInstance.applyPlayerEffect}
        changeCharacterSanity={gameStoreInstance.changeCharacterSanity}
        changeCharacterHitPoints={gameStoreInstance.changeCharacterHitPoints}
        changeCharacterInvestigationPoints={
          gameStoreInstance.changeCharacterInvestigationPoints
        }
        addItem={gameStoreInstance.addItem}
        getNextSceneUrl={sceneStoreInstance.getNextSceneUrl}
        startFadeOutToBlack={startFadeOutToBlack}
        characterState={selectedCharacter ?? createDummyCharacterState()}
        resetCharacterAllPoints={gameStoreInstance.resetCharacterAllPoints}
      />
    </Box>
  );
};

export default FirstHalf02;
