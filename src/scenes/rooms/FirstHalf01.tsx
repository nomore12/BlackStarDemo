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

const FirstHalf01: React.FC = () => {
  const { startFadeOutToBlack } = usePageTransition();
  const gameStoreInstance = useGameStore();
  const sceneStoreInstance = useSceneStore();

  const [activeDialogId, setActiveDialogId] = useState<string | null>(null);

  const selectedCharacter = useGameStore((state) => state.selectedCharacter);

  const roomDialogs: Record<string, DialogSequence> = useMemo(
    () => ({
      // --- 지친 신부 조우 다이얼로그 시퀀스 ---
      priestEncounter: {
        id: 'priestEncounter',
        initialStepId: 'start-priest-encounter', // 조우 시작 (포인트 소모X)
        steps: {
          'start-priest-encounter': {
            id: 'start-priest-encounter',
            title: '지쳐 보이는 신부',
            imagePath: 'images/father.png', // 신부 이미지
            description:
              '방 한구석에 낡고 해진 옷을 입은 신부가 주저앉아 있다. 그의 얼굴에는 깊은 피로와 공포가 서려 있으며, 멍한 눈으로 허공을 응시하고 있다. 당신의 발소리에 그는 움찔하며 경계심 가득한 눈으로 당신을 바라본다.',
            actions: [
              {
                id: ACTION_ID_NEXT,
                text: '그에게 다가가 말을 건다.',
                nextStepId: 'detail-priest-main-choices-IP', // 포인트 소모 선택지가 있는 스텝으로 이동
              },
              {
                id: 'priest-cancel-initial-encounter',
                text: '그를 자극하지 않고 조용히 지나간다.',
                isDialogEnd: true,
              },
            ],
          },
          // 1단계: 신부에 대한 주요 접근 방식 선택 (포인트 소모)
          'detail-priest-main-choices-IP': {
            id: 'detail-priest-main-choices-IP',
            title: '신부와의 대화',
            imagePath: 'images/father.png',
            description: (characterState, gameState) => {
              return '신부는 여전히 당신을 경계하고 있다. 어떻게 대화를 이끌어 가시겠습니까? (학자: 6 IP, 탐험가: 4 IP 전체 공유)';
            },
            actions: [
              {
                id: 'priest-choice-ask-what-happened',
                text: '저택에서 겪은 일에 대해 묻는다. [조사 포인트 1]',
                investigationPoints: 1,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 1, reason: '신부에게 겪은 일 질문' },
                  },
                ],
                nextStepId: 'sub-detail-priest-what-happened',
              },
              {
                id: 'priest-choice-ask-condition',
                text: '몸 상태를 살피며 괜찮은지 묻는다. [조사 포인트 1]',
                investigationPoints: 1,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 1, reason: '신부의 상태 질문' },
                  },
                ],
                nextStepId: 'sub-detail-priest-check-condition',
              },
              {
                id: 'priest-choice-ask-reason',
                text: "그가 이곳에 온 '이유'에 대해 묻는다. [조사 포인트 3]",
                investigationPoints: 3,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 3, reason: '신부가 온 이유 질문' },
                  },
                ],
                nextStepId: 'sub-detail-priest-reason', // ★★★ 핵심 단서로 이어지는 유일한 경로 ★★★
              },
              {
                id: 'priest-finish-this-encounter',
                text: '그를 홀로 내버려 둔다.',
                isDialogEnd: true,
              },
            ],
          },
          // 2단계: 세부 조사 (포인트 소모 없음)
          'sub-detail-priest-what-happened': {
            id: 'sub-detail-priest-what-happened',
            title: '저택에서 겪은 일',
            description:
              '당신의 질문에 신부는 몸서리를 치며 대답한다.\n\n"이곳은... 저주받았소. 벽이 숨을 쉬고, 복도는 스스로 길이를 바꾸지... 어둠 속에서 속삭임이 들려오고, 그림자는 살아있는 것처럼 날 따라다녔소..."',
            actions: [
              {
                id: 'what-happened-result-1',
                text: "'그림자라니요? 자세히 말씀해 주십시오.'",
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '"형태를... 특정할 수 없었소. 그저 시야의 가장자리에서 무언가 꿈틀거리는 느낌... 그것과 눈이 마주치면 정신을 잃을 것만 같았지." (저택의 현상 정보 획득)',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: {
                      amount: -2,
                      reason: '신부의 끔찍한 경험을 들음',
                    },
                  },
                ],
                nextStepId: 'detail-priest-main-choices-IP',
              },
              {
                id: 'what-happened-result-2',
                text: "'속삭임은... 무슨 내용이었습니까?'",
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '"알아들을 수 없는 언어였지만... 그 안에는 굶주림과 조롱이 담겨 있었소. 마치... 거대한 존재가 우릴 보며 비웃는 듯한..." (저택의 현상 정보 획득)',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: {
                      amount: -2,
                      reason: '신부의 끔찍한 경험을 들음',
                    },
                  },
                ],
                nextStepId: 'detail-priest-main-choices-IP',
              },
            ],
          },
          'sub-detail-priest-check-condition': {
            id: 'sub-detail-priest-check-condition',
            title: '신부의 상태',
            description:
              '당신의 걱정스러운 질문에 신부는 자신의 찢어진 옷을 내려다본다.\n\n"괜찮지 않소. 잠시 눈을 감았다 떴을 뿐인데... 눈앞의 복도가 사라지고 발밑이 무너져 내렸지. 정신을 차려보니 이곳에 쓰러져 있었소."',
            actions: [
              {
                id: 'condition-result-1',
                text: "'다친 곳은 없습니까?'",
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '신부는 고개를 젓는다. "외상은 없지만... 영혼이 긁혀나간 기분이오. 이 저택은... 사람의 정신을 갉아먹는 곳이야." (저택의 위험성 정보 획득)',
                  },
                ],
                nextStepId: 'detail-priest-main-choices-IP',
              },
              {
                id: 'condition-result-2',
                text: "'복도가 사라졌다니, 무슨 말씀이십니까?'",
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '"말 그대로요! 공간 자체가... 살아있는 생물처럼 변하고 뒤틀리는 곳이란 말이오! 여긴 신의 피조물이 아니야!" (저택의 위험성 정보 획득)',
                  },
                ],
                nextStepId: 'detail-priest-main-choices-IP',
              },
            ],
          },
          // ★★★ 핵심 단서가 있는 경로 ★★★
          'sub-detail-priest-reason': {
            id: 'sub-detail-priest-reason',
            title: '이곳에 온 이유',
            description:
              '신부는 당신을 잠시 응시하더니, 무언가 결심한 듯 입을 연다.\n\n"나는... 교단으로부터 이 저택의 \'근원\'을 정화하라는 명을 받고 왔소. 이곳에서 벌어지는 모든 기이한 현상들은... 그저 결과일 뿐. 문제의 핵심은 이 저택의 시작에 있소."',
            actions: [
              {
                id: 'reason-result-1', // ★ 올바른 선택지
                text: "'근원'이라 함은... 이 저택이 평범하게 지어진 장소가 아니라는 것을 알고 오셨군요.",
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      "신부의 눈빛이 흔들린다. \"그렇소... 당신은 이해하는군. 오래전, 교단의 기록에 따르면... 이 땅은 현실계와 다른 차원 사이의 '상처'가 아물지 않은 곳이라고 하오. 그 상처의 틈새를 통해 '문지기'가 이곳에 강림하여 경계를 감시하게 되었지. 이 저택은 그를 위한 제단이자... 감옥인 셈이오.\" (저택의 기원과 GateKeeper의 역할에 대한 핵심 단서 획득)",
                  },
                ],
                nextStepId: 'detail-priest-main-choices-IP',
              },
              {
                id: 'reason-result-2', // 잘못된 선택지
                text: "'누가 그런 위험한 임무를 당신에게 맡겼습니까?'",
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '신부는 실망한 듯 고개를 젓는다. "그것은 당신이 알 바 아니오... 내 사명을 이해하지 못하는 자에게 더 이상 해줄 말은 없소." 그는 입을 굳게 다물었다.',
                  },
                ],
                nextStepId: 'detail-priest-main-choices-IP',
              },
            ],
          },
        },
      },
      // 방에서 나가는 등의 공통 액션을 위한 doorInteraction은 별도로 유지합니다.
      doorInteraction: {
        id: 'doorInteraction',
        initialStepId: 'ask-open-priest-room-exit',
        steps: {
          'ask-open-priest-room-exit': {
            id: 'ask-open-priest-room-exit',
            title: '방 나가기',
            description: '신부와의 대화를 마치고 방을 나가시겠습니까?',
            actions: [
              {
                id: 'di-exit-priest-room',
                text: '방에서 나간다.',
                outcomes: [{ type: 'moveToNextScene', payload: undefined }],
                isDialogEnd: true,
              },
              {
                id: 'di-stay-priest-room',
                text: '아직 그에게서 더 알아낼 것이 있다.',
                isDialogEnd: true,
              },
            ],
          },
        },
      },
    }),
    [selectedCharacter] // useMemo 의존성 배열
  );

  const handleFatherClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('handleNoteTableClick');
    e.stopPropagation();
    setActiveDialogId('priestEncounter');
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
        onClick={handleFatherClick}
      >
        <img
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          src="images/father.png"
          alt="father"
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

export default FirstHalf01;
