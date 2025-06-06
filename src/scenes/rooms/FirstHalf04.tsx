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

const FirstHalf04: React.FC = () => {
  const { startFadeOutToBlack } = usePageTransition();
  const gameStoreInstance = useGameStore();
  const sceneStoreInstance = useSceneStore();

  const [activeDialogId, setActiveDialogId] = useState<string | null>(null);

  const selectedCharacter = useGameStore((state) => state.selectedCharacter);

  const roomDialogs: Record<string, DialogSequence> = useMemo(
    () => ({
      // --- 추종자 조우 다이얼로그 시퀀스 ---
      fanaticEncounter: {
        id: 'fanaticEncounter',
        initialStepId: 'start_fanatic_encounter', // 추종자와 마주친 상황 (포인트 소모X)
        steps: {
          start_fanatic_encounter: {
            id: 'start_fanatic_encounter',
            title: '검은 로브의 추종자',
            imagePath: 'images/fanatic.png', // 추종자 이미지
            description:
              '방 한가운데, 검은 로브를 뒤집어쓴 인물이 미동도 없이 서 있다. 로브 가슴에는 금색 실로 기이한 별 모양의 문양이 새겨져 있고, 손에는 낡은 책 한 권을 소중하게 들고 있다. 그의 얼굴은 그림자에 가려 보이지 않지만, 당신을 향한 차가운 시선이 느껴진다.',
            actions: [
              {
                id: ACTION_ID_NEXT,
                text: '그에게 말을 건다.',
                nextStepId: 'detail_fanatic_main_choices_IP', // 포인트 소모 선택지가 있는 스텝으로 이동
              },
              {
                id: 'fanatic_cancel_initial_encounter',
                text: '그를 무시하고 조용히 지나간다.',
                isDialogEnd: true,
              },
            ],
          },
          // 1단계: 추종자에 대한 주요 접근 방식 선택 (포인트 소모)
          detail_fanatic_main_choices_IP: {
            id: 'detail_fanatic_main_choices_IP',
            title: '접근 방식 선택',
            imagePath: 'images/fanatic.png',
            description: (characterState, gameState) => {
              return '그에게 어떻게 접근하시겠습니까? (학자: 6 IP, 탐험가: 4 IP 전체 공유)';
            },
            actions: [
              {
                id: 'fanatic_choice_bluff',
                text: '그가 믿는 존재에 대해 아는 척하며 떠본다. [조사 포인트 2]',
                investigationPoints: 2,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 2, reason: '추종자 떠보기' },
                  },
                ],
                nextStepId: 'sub_detail_fanatic_bluff',
              },
              {
                id: 'fanatic_choice_persuade',
                text: '그를 회유하거나 설득하여 정보를 얻으려 시도한다. [조사 포인트 2]',
                investigationPoints: 2,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 2, reason: '추종자 설득 시도' },
                  },
                ],
                nextStepId: 'sub_detail_fanatic_persuade',
              },
              {
                id: 'fanatic_choice_threaten',
                text: '그를 협박하여 강제로 정보를 털어놓게 한다. [조사 포인트 3]',
                investigationPoints: 3,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 3, reason: '추종자 협박' },
                  },
                ],
                nextStepId: 'sub_detail_fanatic_threaten',
              },
              {
                id: 'fanatic_finish_this_encounter',
                text: '대화를 그만둔다.',
                isDialogEnd: true,
              },
            ],
          },
          // 2단계: 세부 조사 (포인트 소모 없음)
          sub_detail_fanatic_bluff: {
            id: 'sub_detail_fanatic_bluff',
            title: '아는 척 떠보기',
            description:
              '당신은 조심스럽게 그의 믿음에 대해 아는 척하며 대화를 시작한다.',
            actions: [
              {
                id: 'bluff_result_1',
                text: "'저 또한 '검은 별'의 인도를 받은 자입니다.'",
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '추종자는 잠시 당신을 훑어보더니, "...동지여, "문지기"께서 곧 모든 것을 제자리로 돌려놓으실 것입니다." 라고 나직이 읊조린다. (GateKeeper에 대한 언급 획득 - 텍스트 언급)',
                  },
                ],
                nextStepId: 'detail_fanatic_main_choices_IP',
              },
              {
                id: 'bluff_result_2',
                text: "'곧 '문'이 열릴 시간이 다가오지 않았습니까?'",
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '추종자는 고개를 끄덕이며, "준비는 거의 끝났습니다. 마지막 "열쇠"만 있으면..." 이라고 중얼거린다. 그는 당신이 무언가 알고 있다고 착각한 것 같다. (열쇠의 존재에 대한 단서 획득 - 텍스트 언급)',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: {
                      amount: -2,
                      reason: '불길한 계획에 대한 정보 획득',
                    },
                  },
                ],
                nextStepId: 'detail_fanatic_main_choices_IP',
              },
            ],
          },
          sub_detail_fanatic_persuade: {
            id: 'sub_detail_fanatic_persuade',
            title: '회유 및 설득',
            description:
              '당신은 이성적인 대화를 통해 그에게서 정보를 얻어내려 한다.',
            actions: [
              {
                id: 'persuade_result_1',
                text: "'당신도 한때는 다른 삶을 살지 않았습니까? 어쩌다 이렇게 된 거죠?'",
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '추종자의 어깨가 잠시 움찔한다. "...과거는 무의미하다. 오직 그분의 영광만이 존재할 뿐." 그는 더 이상 대답하지 않으려 한다.',
                  },
                ],
                nextStepId: 'detail_fanatic_main_choices_IP',
              },
              {
                id: 'persuade_result_2', // 전투로 이어지는 선택지
                text: "'그런 헛된 것을 믿다니, 어리석군요. 현실을 직시하십시오.'",
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '"...네놈이 감히 그분의 위대함을 모독하는가!" 추종자는 격분하며 품 속에서 녹슨 단검을 꺼내 당신을 찔렀다!',
                  },
                  {
                    type: 'decreaseHitPoints',
                    payload: {
                      amount: 15,
                      reason: '추종자를 모욕하여 공격받음',
                    },
                  }, // 체력 감소
                  {
                    type: 'text',
                    payload:
                      '전투에서 간신히 살아남았다. / (체력이 0이 되면) 전투에서 패배했다. 중 하나가 출력되도록 구현',
                  },
                ],
                nextStepId: 'detail_fanatic_main_choices_IP',
              },
            ],
          },
          sub_detail_fanatic_threaten: {
            id: 'sub_detail_fanatic_threaten',
            title: '협박하기',
            description:
              '당신은 그를 힘으로 굴복시켜 정보를 캐내기로 결심했다.',
            actions: [
              {
                id: 'threaten_result_1', // 단서 획득 선택지
                text: "'당신들의 '의식'과 '제물'에 대해 알고 있다. 방해받고 싶지 않다면 아는 것을 전부 말해라.'",
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '추종자의 눈이 당혹감으로 흔들린다. "...어떻게 그것을... 좋다. 다음 의식은 "달 없는 밤"에 저택의 가장 깊은 곳에서 열린다. 하지만 알아서 좋을 것 없을 거다." (다음 의식에 대한 단서 획득 - 텍스트 언급)',
                  },
                ],
                nextStepId: 'detail_fanatic_main_choices_IP',
              },
              {
                id: 'threaten_result_2', // 전투로 이어지는 선택지
                text: "'조용히 따르는 게 좋을 거다. 다치기 싫으면.' (무기를 꺼내 보인다)",
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      "'어리석은 필멸자여! 그분의 권능 앞에서 무력함을 깨닫게 해주마!' 추종자는 조금도 위축되지 않고 당신에게 달려들었다!",
                  },
                  {
                    type: 'decreaseHitPoints',
                    payload: {
                      amount: 20,
                      reason: '추종자를 협박하여 전투 발생',
                    },
                  }, // 체력 감소
                  {
                    type: 'text',
                    payload:
                      '전투에서 간신히 살아남았다. / (체력이 0이 되면) 전투에서 패배했다. 중 하나가 출력되도록 구현',
                  },
                ],
                nextStepId: 'detail_fanatic_main_choices_IP',
              },
            ],
          },
        },
      },
      // 방에서 나가는 등의 공통 액션을 위한 doorInteraction은 별도로 유지합니다.
      doorInteraction: {
        id: 'doorInteraction',
        initialStepId: 'ask_open_fanatic_room_exit', // ID 충돌 방지
        steps: {
          ask_open_fanatic_room_exit: {
            id: 'ask_open_fanatic_room_exit',
            title: '방 나가기',
            description: '이 위험한 인물과 더 이상 엮이고 싶지 않다.',
            actions: [
              {
                id: 'di_exit_fanatic_room',
                text: '방에서 나간다.',
                outcomes: [{ type: 'moveToNextScene', payload: undefined }],
                isDialogEnd: true,
              },
              {
                id: 'di_stay_fanatic_room',
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

  const handleFnaticClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('handleNoteTableClick');
    e.stopPropagation();
    setActiveDialogId('fanaticEncounter');
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
        onClick={handleFnaticClick}
      >
        <img
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          src="images/fanatic.png"
          alt="fanatic"
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

export default FirstHalf04;
