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

const FirstHalf06: React.FC = () => {
  const { startFadeOutToBlack } = usePageTransition();
  const gameStoreInstance = useGameStore();
  const sceneStoreInstance = useSceneStore();

  const [activeDialogId, setActiveDialogId] = useState<string | null>(null);

  const selectedCharacter = useGameStore((state) => state.selectedCharacter);

  const roomDialogs: Record<string, DialogSequence> = useMemo(
    () => ({
      // --- 침대 위의 인형 조사 다이얼로그 시퀀스 ---
      dollInvestigation: {
        id: 'dollInvestigation',
        initialStepId: 'start_doll_observation', // 오브젝트 조사를 시작할지 묻는 스텝 (포인트 소모X)
        steps: {
          start_doll_observation: {
            id: 'start_doll_observation',
            title: '침대 위의 낡은 인형',
            imagePath: 'images/dollandbed.jpg', // 인형 이미지
            description:
              '침대 위에 누군가의 흔적처럼 놓여있는 낡은 인형이 당신을 응시하고 있다. 단추로 된 눈이 어둠 속에서 희미하게 빛나며, 마치 살아있는 것처럼 당신의 움직임을 따라가는 것 같다. 이 인형을 조사해 보시겠습니까?',
            actions: [
              {
                id: ACTION_ID_NEXT,
                text: '인형을 조사한다.',
                nextStepId: 'detail_doll_main_choices_IP', // 포인트 소모 선택지가 있는 스텝으로 이동
              },
              {
                id: 'doll_cancel_initial_investigation',
                text: '아니, 건드리지 않겠다.',
                isDialogEnd: true,
              },
            ],
          },
          // 1단계: 인형의 주요 조사 방식 선택 (포인트 소모)
          detail_doll_main_choices_IP: {
            id: 'detail_doll_main_choices_IP',
            title: '인형 조사 방식 선택',
            imagePath: 'images/dollandbed.jpg',
            description: (characterState, gameState) => {
              return '인형을 어떤 방식으로 조사하시겠습니까? (학자: 6 IP, 탐험가: 4 IP 전체 공유)';
            },
            actions: [
              {
                id: 'doll_choice_observe_appearance',
                text: '인형의 겉모습과 주변을 살펴본다. [조사 포인트 1]',
                investigationPoints: 1,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 1, reason: '인형 겉모습 관찰' },
                  },
                ],
                nextStepId: 'sub_detail_doll_observe_appearance', // 2단계 세부 조사로
              },
              {
                id: 'doll_choice_touch_and_check',
                text: '인형을 직접 만져보고, 옷이나 숨겨진 부분을 확인한다. [조사 포인트 2]',
                investigationPoints: 2,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 2, reason: '인형 만져보기' },
                  },
                ],
                nextStepId: 'sub_detail_doll_touch_and_check',
              },
              {
                id: 'doll_choice_stare_and_talk',
                text: '인형의 눈을 똑바로 쳐다보며 말을 걸어본다. [조사 포인트 3]',
                investigationPoints: 3,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 3, reason: '인형과 교감 시도' },
                  },
                ],
                nextStepId: 'sub_detail_doll_stare_and_talk',
              },
              {
                id: 'doll_finish_this_object_investigation',
                text: '인형 조사를 마친다.',
                isDialogEnd: true,
              },
            ],
          },
          // 2단계: 인형 세부 조사 (포인트 소모 없음)
          sub_detail_doll_observe_appearance: {
            id: 'sub_detail_doll_observe_appearance',
            title: '인형 겉모습 관찰',
            description: '인형의 외형과 침대 주변을 자세히 살펴본다.',
            actions: [
              {
                id: 'doll_observe_result_1',
                text: '인형 목의 얼룩을 자세히 본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '인형의 목 부분에 보이는 검붉은 얼룩은 오래된 피처럼 보인다. 섬뜩하다.',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: { amount: -1, reason: '인형의 피얼룩 발견' },
                  },
                ],
                nextStepId: 'detail_doll_main_choices_IP', // 다시 인형 조사 방식 선택으로
              },
              {
                id: 'doll_observe_result_2',
                text: '인형이 놓인 침대의 상태를 본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '침대는 비교적 깨끗하지만, 인형이 놓인 자리만 유독 깊게 눌려있다. 오랫동안 같은 자세로 있었던 것 같다.',
                  },
                ],
                nextStepId: 'detail_doll_main_choices_IP',
              },
            ],
          },
          sub_detail_doll_touch_and_check: {
            id: 'sub_detail_doll_touch_and_check',
            title: '인형 만져보기',
            description: '인형을 들어 옷 속이나 다른 부분을 만져본다.',
            actions: [
              {
                id: 'doll_touch_result_1',
                text: '인형의 옷 속을 더듬어본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '인형의 허름한 옷 안쪽 주머니에서 작게 접힌 쪽지를 발견했다. "나가지 마. 그가 보고 있어." (경고 쪽지 획득 - 텍스트 언급)',
                  },
                  // { type: 'addItem', payload: { item: { id: 'warning_note_doll', name: '인형 속 경고 쪽지', description: '"나가지 마. 그가 보고 있어."' }}},
                ],
                nextStepId: 'detail_doll_main_choices_IP',
              },
              {
                id: 'doll_touch_result_2',
                text: '인형의 머리카락이나 팔다리 관절을 살펴본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '인형의 머리카락 한 올이 부자연스럽게 뻣뻣하다. 자세히 보니 가느다란 금속 철사다. 인형의 팔다리는 섬유가 거의 삭아 흐느적거린다.',
                  },
                ],
                nextStepId: 'detail_doll_main_choices_IP',
              },
            ],
          },
          sub_detail_doll_stare_and_talk: {
            id: 'sub_detail_doll_stare_and_talk',
            title: '인형과 교감 시도',
            description: '인형의 단추 눈을 똑바로 마주 본다.',
            actions: [
              {
                id: 'doll_stare_result_1',
                text: '조용히 인형에게 말을 걸어본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '인형은 미동도 없지만, 방 안의 공기가 순간 차가워지는 것을 느꼈다. 귓가에 "도망쳐..." 라는 속삭임이 스쳐 지나간 것 같다.',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: {
                      amount: -5,
                      reason: '인형과의 섬뜩한 교감 시도',
                    },
                  },
                ],
                nextStepId: 'detail_doll_main_choices_IP',
              },
              {
                id: 'doll_stare_result_2',
                text: '인형의 눈을 통해 무언가를 보려고 집중한다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '인형의 단추 눈 깊은 곳에서 순간적으로 붉은 안광이 스치는 것을 보았다! 너무나도 짧은 순간이라 확신할 수 없지만, 온몸에 소름이 돋는다.',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: {
                      amount: -7,
                      reason: '인형 눈에서 붉은 안광 목격',
                    },
                  },
                ],
                nextStepId: 'detail_doll_main_choices_IP',
              },
            ],
          },
        },
      },

      // --- 벽에 걸린 아이의 그림 조사 다이얼로그 시퀀스 ---
      drawingInvestigation: {
        id: 'drawingInvestigation',
        initialStepId: 'start_drawing_analysis', // 그림 조사를 시작할지 묻는 스텝 (포인트 소모X)
        steps: {
          start_drawing_analysis: {
            id: 'start_drawing_analysis',
            title: '아이의 그림',
            imagePath: 'images/picturefromkid.jpg', // 그림 이미지
            description:
              '벽에 걸린 아이의 그림은 마치 악몽에서 튀어나온 듯한 기괴한 형상들로 가득하다. 검붉은 색과 탁한 녹색이 뒤엉킨 그림 속에서, 중앙의 커다란 문을 향해 꿈틀거리는 촉수들과 겁에 질린 듯한 작은 형상들이 보인다. 이 그림을 조사해 보시겠습니까?',
            actions: [
              {
                id: ACTION_ID_NEXT,
                text: '그림을 분석한다.',
                nextStepId: 'detail_drawing_main_choices_IP', // 포인트 소모 선택지가 있는 스텝으로 이동
              },
              {
                id: 'drawing_cancel_initial_analysis',
                text: '아니, 보고 싶지 않다.',
                isDialogEnd: true,
              },
            ],
          },
          // 1단계: 그림의 주요 조사 방식 선택 (포인트 소모)
          detail_drawing_main_choices_IP: {
            id: 'detail_drawing_main_choices_IP',
            title: '그림 분석 방식 선택',
            imagePath: 'images/picturefromkid.jpg',
            description: (characterState, gameState) => {
              return '그림을 어떤 방식으로 분석하시겠습니까? (학자: 6 IP, 탐험가: 4 IP 전체 공유)';
            },
            actions: [
              {
                id: 'drawing_choice_identify_shapes',
                text: '그림의 전체적인 형태와 사용된 색깔을 파악한다. [조사 포인트 1]',
                investigationPoints: 1,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 1, reason: '그림 전체 형태 파악' },
                  },
                ],
                nextStepId: 'sub_detail_drawing_identify_shapes',
              },
              {
                id: 'drawing_choice_focus_on_parts',
                text: '그림 중 특정 부분(예: 문, 촉수, 눈)을 집중적으로 관찰한다. [조사 포인트 2]',
                investigationPoints: 2,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 2, reason: '그림 특정 부분 관찰' },
                  },
                ],
                nextStepId: 'sub_detail_drawing_focus_on_parts',
              },
              {
                id: 'drawing_choice_check_backside',
                text: '그림 뒷면이나 액자틀에 다른 단서가 있는지 확인한다. [조사 포인트 2]',
                investigationPoints: 2,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 2, reason: '그림 뒷면 확인' },
                  },
                ],
                nextStepId: 'sub_detail_drawing_check_backside',
              },
              {
                id: 'drawing_finish_this_object_analysis',
                text: '그림 분석을 마친다.',
                isDialogEnd: true,
              },
            ],
          },
          // 2단계: 그림 세부 조사 (포인트 소모 없음)
          sub_detail_drawing_identify_shapes: {
            id: 'sub_detail_drawing_identify_shapes',
            title: '그림 형태 및 색깔 파악',
            description:
              '그림의 전체적인 구도와 색 사용을 통해 아이의 심리나 그림의 의미를 추론해본다.',
            actions: [
              {
                id: 'drawing_shapes_result_1',
                text: '주요 형체들의 상징성을 생각해본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '중앙의 문은 명백히 "경계"를, 주변의 촉수나 괴물들은 그 경계를 넘어서려는 "위협" 혹은 "유혹"을 상징하는 것 같다. 작은 인물들은 공포에 질려있다.',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: {
                      amount: -2,
                      reason: '그림의 불길한 상징성 인지',
                    },
                  },
                ],
                nextStepId: 'detail_drawing_main_choices_IP',
              },
              {
                id: 'drawing_shapes_result_2',
                text: '색 사용의 의미를 분석한다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '검붉은 색은 폭력이나 위험을, 탁한 녹색은 부패나 질병을 암시하는 듯하다. 그림 전체에서 희망적인 색은 찾아볼 수 없다.',
                  },
                ],
                nextStepId: 'detail_drawing_main_choices_IP',
              },
            ],
          },
          sub_detail_drawing_focus_on_parts: {
            id: 'sub_detail_drawing_focus_on_parts',
            title: '그림 특정 부분 관찰',
            description:
              '그림에서 유독 눈에 띄거나 중요해 보이는 부분을 자세히 들여다본다.',
            actions: [
              {
                id: 'drawing_focus_result_1',
                text: '중앙의 문을 자세히 본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '문의 손잡이 부분에 아주 작게, 하지만 분명히 알아볼 수 있는 별 모양의 문양이 새겨져 있다. GateKeeper의 표식과 일치한다! (GateKeeper 표식 확인 - 텍스트 언급)',
                  },
                ],
                nextStepId: 'detail_drawing_main_choices_IP',
              },
              {
                id: 'drawing_focus_result_2',
                text: '겁에 질린 작은 형체들을 자세히 본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '작은 형체들 중 하나는 탐험가 당신의 동생 릴리가 항상 가지고 다니던 토끼 인형과 똑같이 생겼다! 설마... (릴리 관련 단서 발견 - 텍스트 언급)',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: {
                      amount: -3,
                      reason: '그림에서 충격적인 형상 발견',
                    },
                  },
                ],
                nextStepId: 'detail_drawing_main_choices_IP',
              },
            ],
          },
          sub_detail_drawing_check_backside: {
            id: 'sub_detail_drawing_check_backside',
            title: '그림 뒷면 및 액자 확인',
            description:
              '그림을 벽에서 떼어내어 뒷면이나 액자 자체에 숨겨진 것이 있는지 살펴본다.',
            actions: [
              {
                id: 'drawing_backside_result_1',
                text: '그림 뒷면에 적힌 글씨를 확인한다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '그림 뒷면에는 떨리는 아이의 글씨로 "나쁜 꿈. 문지기가 모두 데려갈 거야. 엄마, 아빠, 나..." 라고 적혀있다. (아이의 공포 기록 발견 - 텍스트 언급)',
                  },
                ],
                nextStepId: 'detail_drawing_main_choices_IP',
              },
              {
                id: 'drawing_backside_result_2',
                text: '액자틀을 분해하거나 틈새를 살펴본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '액자틀 한쪽 구석이 살짝 헐거워져 있다. 조심스럽게 벌려보니 그 안에 아주 작은 접힌 종이가 숨겨져 있다. "비밀 통로는 침대 밑이야." (비밀 통로 단서 획득 - 텍스트 언급)',
                  },
                  // { type: 'addItem', payload: { item: { id: 'note_secret_passage', name: '비밀 통로 쪽지', description: '"비밀 통로는 침대 밑이야."' }}},
                ],
                nextStepId: 'detail_drawing_main_choices_IP',
              },
            ],
          },
        },
      },
      // 방에서 나가는 등의 공통 액션을 위한 doorInteraction은 별도로 유지합니다.
      doorInteraction: {
        id: 'doorInteraction',
        initialStepId: 'ask_open_childs_room_exit', // ID 충돌 방지
        steps: {
          ask_open_childs_room_exit: {
            id: 'ask_open_childs_room_exit',
            title: '방 나가기',
            description: '이 아이의 방에서 나가시겠습니까?',
            actions: [
              {
                id: 'di_exit_childs_room',
                text: '방에서 나간다.',
                outcomes: [{ type: 'moveToNextScene', payload: undefined }],
                isDialogEnd: true,
              },
              {
                id: 'di_stay_childs_room',
                text: '아직 방에 더 머무른다.',
                isDialogEnd: true,
              },
            ],
          },
        },
      },
    }),
    [selectedCharacter] // useMemo 의존성 배열 (실제 사용 시 characterState 등 필요한 상태 추가)
  );

  const handleBedAndDollClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setActiveDialogId('dollInvestigation');
  };

  const handlePictureFromKidClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setActiveDialogId('drawingInvestigation');
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
          width: 320,
          height: 320,
          position: 'absolute',
          top: 280,
          left: 435,
        }}
        onClick={handleBedAndDollClick}
      >
        <img
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          src="images/dollandbed.png"
          alt="gate"
        />
      </Box>
      <Box
        sx={{
          width: 160,
          height: 160,
          position: 'absolute',
          top: 140,
          left: 130,
        }}
        onClick={handlePictureFromKidClick}
      >
        <img
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          src="images/picturefromkid.png"
          alt="gate"
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

export default FirstHalf06;
