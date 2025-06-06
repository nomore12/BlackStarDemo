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

const FirstHalf03: React.FC = () => {
  const { startFadeOutToBlack } = usePageTransition();
  const gameStoreInstance = useGameStore();
  const sceneStoreInstance = useSceneStore();

  const [activeDialogId, setActiveDialogId] = useState<string | null>(null);

  const selectedCharacter = useGameStore((state) => state.selectedCharacter);

  const roomDialogs: Record<string, DialogSequence> = useMemo(
    () => ({
      // --- 인스머스풍 남자 조우 다이얼로그 시퀀스 ---
      innsmouthManEncounter: {
        id: 'innsmouthManEncounter',
        initialStepId: 'start-innsmouth-man-encounter', // 조우 시작 (포인트 소모X)
        steps: {
          'start-innsmouth-man-encounter': {
            id: 'start-innsmouth-man-encounter',
            title: '기이한 몰골의 남자',
            imagePath: 'images/fishman.png', // 인스머스풍 남자 이미지
            description:
              '방 한구석, 축축한 물비린내와 함께 기이한 남자가 서 있다. 툭 튀어나온 눈은 좀처럼 깜빡이지 않고, 목에서는 아가미 같은 것이 미세하게 떨린다. 인간의 옷을 어색하게 걸친 그는 당신을 물끄러미 바라볼 뿐, 아무 말이 없다.',
            actions: [
              {
                id: ACTION_ID_NEXT,
                text: '그에게 말을 건다.',
                nextStepId: 'detail-innsmouth-man-main-choices-IP', // 포인트 소모 선택지가 있는 스텝으로 이동
              },
              {
                id: 'innsmouth-man-cancel-initial-encounter',
                text: '엮이고 싶지 않다. 조용히 지나간다.',
                isDialogEnd: true,
              },
            ],
          },
          // 1단계: 남자에게 던질 질문(접근 방식) 선택 (포인트 소모)
          'detail-innsmouth-man-main-choices-IP': {
            id: 'detail-innsmouth-man-main-choices-IP',
            title: '수수께끼 같은 대화',
            imagePath: 'images/fishman.png',
            description: (characterState, gameState) => {
              return '그는 당신의 질문을 기다리는 듯하다. 무엇에 대해 물어보시겠습니까? (학자: 6 IP, 탐험가: 4 IP 전체 공유)';
            },
            actions: [
              {
                id: 'innsmouth-man-choice-ask-identity',
                text: '당신은 누구인지 묻는다. [조사 포인트 1]',
                investigationPoints: 1,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 1, reason: '남자의 정체에 대해 질문' },
                  },
                ],
                nextStepId: 'sub-detail-riddle-identity',
              },
              {
                id: 'innsmouth-man-choice-ask-about-mansion',
                text: '이 저택에 대해 아는 것을 묻는다. [조사 포인트 2]',
                investigationPoints: 2,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 2, reason: '저택에 대해 질문' },
                  },
                ],
                nextStepId: 'sub-detail-riddle-mansion',
              },
              {
                id: 'innsmouth-man-choice-ask-why-strange', // 수정된 질문
                text: '어쩌다가 이 이상한 저택에 오게 되었는지 묻는다. [조사 포인트 3]',
                investigationPoints: 3,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 3, reason: '저택의 근원에 대해 질문' },
                  },
                ],
                nextStepId: 'sub-detail-riddle-why-strange', // 수정된 질문에 대한 새 스텝
              },
              {
                id: 'innsmouth-man-finish-encounter',
                text: '그에게서 등을 돌린다.',
                isDialogEnd: true,
              },
            ],
          },
          // 2단계: 수수께끼 해석 (포인트 소모 없음)
          'sub-detail-riddle-identity': {
            id: 'sub-detail-riddle-identity',
            title: '그의 정체',
            description:
              '당신의 질문에 남자는 나직이 읊조린다.\n\n"우리는 깊은 곳의 부름을 듣고, 잠든 도시의 꿈을 꾸지. 별들이 제자리를 찾을 때, 우리는 깨어난다네."',
            actions: [
              {
                id: 'riddle-identity-answer-1',
                text: "'...당신들은 물의 자손이군요.'",
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '남자는 만족스러운 듯 희미하게 고개를 끄덕인다. "물은 모든 것을 기억하지..."',
                  },
                ],
                nextStepId: 'detail-innsmouth-man-main-choices-IP',
              },
              {
                id: 'riddle-identity-answer-2',
                text: "'...당신은 미치광이일 뿐이오.'",
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '남자는 아무런 표정 변화 없이 당신을 바라본다. "어리석은 자는 눈앞의 파도만을 보는 법..."',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: {
                      amount: -1,
                      reason: '수수께끼같은 존재를 이해하지 못함',
                    },
                  },
                ],
                nextStepId: 'detail-innsmouth-man-main-choices-IP',
              },
            ],
          },
          'sub-detail-riddle-mansion': {
            id: 'sub-detail-riddle-mansion',
            title: '저택의 비밀',
            description:
              '저택에 대한 질문에, 그는 창밖을 응시하며 말한다.\n\n"이곳은 집이 아니야. 껍데기일 뿐. 돌은 피를 기억하고, 나무는 비명을 머금었으며, 심장은 가장 깊은 곳에서 뛰고 있다네."',
            actions: [
              {
                id: 'riddle-mansion-answer-1',
                text: "'...이 저택 자체가 살아있다는 뜻이군요.'",
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '그의 눈이 섬뜩하게 빛난다. "깨어날 때가 가까워지고 있지..." (저택이 살아있는 유기체라는 단서 획득 - 텍스트 언급)',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: {
                      amount: -3,
                      reason: '저택의 끔찍한 진실을 깨달음',
                    },
                  },
                ],
                nextStepId: 'detail-innsmouth-man-main-choices-IP',
              },
              {
                id: 'riddle-mansion-answer-2',
                text: "'...헛소리 마시오. 여긴 그저 낡은 집일 뿐.'",
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '남자는 당신을 경멸하듯 바라본다. "그래서 네놈들은 항상 길을 잃는 것이다..."',
                  },
                ],
                nextStepId: 'detail-innsmouth-man-main-choices-IP',
              },
            ],
          },
          // 수정된 질문에 대한 새로운 스텝
          'sub-detail-riddle-why-strange': {
            id: 'sub-detail-riddle-why-strange',
            title: '저택의 근원',
            description:
              '당신의 질문에 남자는 대답 대신, 천천히 손을 들어 저택의 벽을 가리킨다.\n\n"이곳은 집이 아니야. 문이지. 모든 문에는 문지기가 있는 법. 그는 부르지 않아도 찾아오고, 원하지 않아도 길을 여는 자... 나 또한 그 길을 따라 이곳에 섰을 뿐."',
            actions: [
              {
                id: 'riddle-why-strange-answer-1',
                text: "'...'문지기'가 당신을, 그리고 이 저택을 이렇게 만들었다는 거군요.'",
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '남자의 툭 튀어나온 눈이 크게 뜨인다. 그는 당신을 다시 보며, 거의 알아들을 수 없는 목소리로 말한다. "...이해하는 자가 나타났군. 하지만 이해는 저주의 시작일 뿐..." (GateKeeper가 이 저택의 존재 이유 그 자체이며, 다른 이들을 이곳으로 끌어들인다는 단서를 얻었다.)',
                  },
                ],
                nextStepId: 'detail-innsmouth-man-main-choices-IP',
              },
              {
                id: 'riddle-why-strange-answer-2',
                text: "'...'문'이라니... 비밀 통로를 말하는 겁니까?'",
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '남자는 깊은 물 속에서 한숨을 쉬는 듯한 소리를 낸다. "눈에 보이는 것만 믿는군..." 그의 말에 담긴 의미를 알 수 없어 불쾌한 기분이 든다.',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: {
                      amount: -2,
                      reason: '남자의 비유를 이해하지 못함',
                    },
                  },
                ],
                nextStepId: 'detail-innsmouth-man-main-choices-IP',
              },
            ],
          },
        },
      },
      // 방에서 나가는 등의 공통 액션을 위한 doorInteraction은 별도로 유지합니다.
      doorInteraction: {
        id: 'doorInteraction',
        initialStepId: 'ask-open-innsmouth-room-exit',
        steps: {
          'ask-open-innsmouth-room-exit': {
            id: 'ask-open-innsmouth-room-exit',
            title: '방 나가기',
            description:
              '이 기묘한 남자와의 대화를 마치고 방을 나가시겠습니까?',
            actions: [
              {
                id: 'di-exit-innsmouth-room',
                text: '방에서 나간다.',
                outcomes: [{ type: 'moveToNextScene', payload: undefined }],
                isDialogEnd: true,
              },
              {
                id: 'di-stay-innsmouth-room',
                text: '아직 그에게서 더 알아낼 것이 있다.',
                isDialogEnd: true,
              },
            ],
          },
        },
      },
    }),
    [] // useMemo 의존성 배열
  );

  const handleFishmanClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('handleNoteTableClick');
    e.stopPropagation();
    setActiveDialogId('innsmouthManEncounter');
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
        onClick={handleFishmanClick}
      >
        <img
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          src="images/fishman.png"
          alt="fishman"
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

export default FirstHalf03;
