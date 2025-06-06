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

const FirstHalf05: React.FC = () => {
  const { startFadeOutToBlack } = usePageTransition();
  const gameStoreInstance = useGameStore();
  const sceneStoreInstance = useSceneStore();

  const [activeDialogId, setActiveDialogId] = useState<string | null>(null);

  const selectedCharacter = useGameStore((state) => state.selectedCharacter);

  const roomDialogs: Record<string, DialogSequence> = useMemo(
    () => ({
      // --- 쓰레기 더미 조사 다이얼로그 시퀀스 ---
      trashInvestigation: {
        id: 'trashInvestigation',
        initialStepId: 'start_trash_observation', // 오브젝트 조사를 시작할지 묻는 스텝 (포인트 소모X)
        steps: {
          start_trash_observation: {
            id: 'start_trash_observation',
            title: '역겨운 쓰레기 더미',
            imagePath: 'images/trash.png', // 쓰레기 더미 이미지
            description:
              '방 한구석에 산처럼 쌓인 쓰레기 더미에서 시큼한 악취가 진동한다. 음식물 찌꺼기와 정체불명의 오물 사이로 바퀴벌레가 기어 다니고, 살아있는 쥐 한 마리가 무언가를 갉아먹고 있다. 이런 곳에 무언가 단서가 있을 리 없겠지만...',
            actions: [
              {
                id: ACTION_ID_NEXT,
                text: '쓰레기 더미를 조사한다.',
                nextStepId: 'detail_trash_main_choices_IP', // 포인트 소모 선택지가 있는 스텝으로 이동
              },
              {
                id: 'trash_cancel_initial_investigation',
                text: '가까이 가고 싶지 않다.',
                isDialogEnd: true,
              },
            ],
          },
          // 1단계: 쓰레기 더미의 주요 조사 방식 선택 (포인트 소모)
          detail_trash_main_choices_IP: {
            id: 'detail_trash_main_choices_IP',
            title: '쓰레기 더미 조사 방식 선택',
            imagePath: 'images/trash.png',
            description: (characterState, gameState) => {
              return '이 역겨운 더미를 어떻게 조사하시겠습니까? (학자: 6 IP, 탐험가: 4 IP 전체 공유)';
            },
            actions: [
              {
                id: 'trash_choice_observe_papers',
                text: '흩어진 종이 조각들을 살펴본다. [조사 포인트 1]',
                investigationPoints: 1,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 1, reason: '쓰레기 속 종이 조각 확인' },
                  },
                ],
                nextStepId: 'sub_detail_trash_papers',
              },
              {
                id: 'trash_choice_observe_rat',
                text: '살아있는 쥐의 행동을 관찰한다. [조사 포인트 2]',
                investigationPoints: 2,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 2, reason: '쓰레기 더미의 쥐 관찰' },
                  },
                ],
                nextStepId: 'sub_detail_trash_rat',
              },
              {
                id: 'trash_choice_rummage_pile',
                text: '쓰레기 더미 전체를 뒤져본다. (위험 감수) [조사 포인트 4]',
                investigationPoints: 4,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 4, reason: '쓰레기 더미 전체 수색' },
                  },
                ],
                nextStepId: 'sub_detail_trash_rummage',
              },
              {
                id: 'trash_finish_this_object_investigation',
                text: '쓰레기 더미 조사를 마친다.',
                isDialogEnd: true,
              },
            ],
          },
          // 2단계: 세부 조사 (포인트 소모 없음)
          sub_detail_trash_papers: {
            id: 'sub_detail_trash_papers',
            title: '종이 조각 살펴보기',
            description:
              '오물에 젖은 종이 조각들을 조심스럽게 집어 들어 내용을 확인한다.',
            actions: [
              {
                id: 'papers_result_1',
                text: '얼룩진 글씨를 읽어본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '물에 번진 잉크 사이로 "열쇠... 쥐... 놈이 삼켰다..."라는 내용을 간신히 해독했다! (쥐가 열쇠를 삼켰다는 단서 획득 - 텍스트 언급)',
                  },
                ],
                nextStepId: 'detail_trash_main_choices_IP',
              },
              {
                id: 'papers_result_2',
                text: '다른 종이 조각을 확인한다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '다른 종이는 오래된 신문 기사 조각이다. "저택 인근에서 연이어 애완동물 실종 사건 발생..."이라는 제목이 눈에 들어온다.',
                  },
                ],
                nextStepId: 'detail_trash_main_choices_IP',
              },
            ],
          },
          sub_detail_trash_rat: {
            id: 'sub_detail_trash_rat',
            title: '쥐 관찰하기',
            description:
              '쓰레기 더미를 파헤치고 있는 쥐를 멀리서 조용히 지켜본다.',
            actions: [
              {
                id: 'rat_result_1',
                text: '쥐의 외형을 자세히 본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '쥐는 다른 쥐들에 비해 유난히 배가 볼록하다. 무언가 소화되지 않는 것을 삼킨 것처럼 부자연스럽다. (쥐의 이상한 상태 확인 - 텍스트 언급)',
                  },
                ],
                nextStepId: 'sub_detail_rat_choice_after_observation', // 쥐에 대한 추가 행동 선택으로
              },
              {
                id: 'rat_result_2',
                text: '쥐를 쫓아내고 그 자리를 살펴본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '쥐는 날렵하게 도망쳐 버렸다. 쥐가 있던 자리에는 반쯤 씹다 만 생선 뼈다귀 외에는 아무것도 없다.',
                  },
                ],
                nextStepId: 'detail_trash_main_choices_IP',
              },
            ],
          },
          // '쥐 관찰' 이후 이어지는 특별 선택 스텝
          sub_detail_rat_choice_after_observation: {
            id: 'sub_detail_rat_choice_after_observation',
            title: '볼록한 배의 쥐',
            description:
              '쥐의 배는 확실히 이상하다. 반짝이는 무언가를 삼킨 것일지도 모른다. 어떻게 할까?',
            actions: [
              {
                id: 'rat_final_choice_cut',
                text: '쥐를 잡아 배를 갈라 내용물을 확인한다. (잔혹한 선택)',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '당신은 끔찍한 일을 저질렀다. 쥐의 내장 사이로, 위액에 살짝 녹은 낡은 황동 열쇠가 모습을 드러냈다. 손에 피와 오물을 묻힌 채, 당신은 열쇠를 얻었다. (황동 열쇠 획득 - 텍스트 언급)',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: {
                      amount: -10,
                      reason: '살아있는 생물의 배를 가름',
                    },
                  },
                  // { type: 'addItem', payload: { item: { id: 'brass_key_from_rat', name: '피 묻은 황동 열쇠', description: '쥐의 배 속에서 꺼낸, 불쾌한 기억이 담긴 열쇠.' }}},
                ],
                nextStepId: 'detail_trash_main_choices_IP',
              },
              {
                id: 'rat_final_choice_leave',
                text: '찝찝하다. 그냥 내버려 둔다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '잠깐의 고민 끝에, 당신은 그 끔찍한 생각을 떨쳐버리고 쥐를 내버려 두기로 했다.',
                  },
                ],
                nextStepId: 'detail_trash_main_choices_IP',
              },
            ],
          },
          sub_detail_trash_rummage: {
            id: 'sub_detail_trash_rummage',
            title: '쓰레기 더미 수색',
            description:
              '역한 냄새를 참아내며 쓰레기 더미를 손으로 직접 파헤치기 시작한다.',
            actions: [
              {
                id: 'rummage_result_1',
                text: '더미 위쪽을 조심스럽게 뒤진다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '쓰레기 더미 위쪽에서는 썩은 음식물과 깨진 병 조각 외에 별다른 것을 찾지 못했다. 날카로운 무언가에 손가락을 살짝 베였다.',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: {
                      amount: -3,
                      reason: '역겨운 쓰레기 더미를 뒤짐',
                    },
                  },
                ],
                nextStepId: 'detail_trash_main_choices_IP',
              },
              {
                id: 'rummage_result_2',
                text: '더미 깊숙한 곳까지 손을 넣어 뒤진다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '오물 속을 헤집던 손끝에 차갑고 단단한 감촉이 느껴졌다. 조심스럽게 꺼내보니, 더럽혀졌지만 분명한 형태를 가진 낡은 황동 열쇠다! (황동 열쇠 획득 - 텍스트 언급)',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: {
                      amount: -7,
                      reason: '쓰레기 더미 깊숙한 곳을 뒤짐',
                    },
                  },
                  // { type: 'addItem', payload: { item: { id: 'brass_key_from_trash', name: '오물 묻은 황동 열쇠', description: '쓰레기 더미 속에서 찾아낸, 악취가 나는 열쇠.' }}},
                ],
                nextStepId: 'detail_trash_main_choices_IP',
              },
            ],
          },
        },
      },
      // 방에서 나가는 등의 공통 액션을 위한 doorInteraction은 별도로 유지합니다.
      doorInteraction: {
        id: 'doorInteraction',
        initialStepId: 'ask_open_trash_room_exit', // ID 충돌 방지
        steps: {
          ask_open_trash_room_exit: {
            id: 'ask_open_trash_room_exit',
            title: '방 나가기',
            description: '이 역겨운 방에서 나가시겠습니까?',
            actions: [
              {
                id: 'di_exit_trash_room',
                text: '방에서 나간다.',
                outcomes: [{ type: 'moveToNextScene', payload: undefined }],
                isDialogEnd: true,
              },
              {
                id: 'di_stay_trash_room',
                text: '아직 조사할 것이 남았다.',
                isDialogEnd: true,
              },
            ],
          },
        },
      },
    }),
    [selectedCharacter] // useMemo 의존성 배열
  );

  const handleTrashClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('handleNoteTableClick');
    e.stopPropagation();
    setActiveDialogId('trashInvestigation');
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
          top: 300,
          left: 250,
        }}
        onClick={handleTrashClick}
      >
        <img
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          src="images/trash.png"
          alt="trash"
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

export default FirstHalf05;
