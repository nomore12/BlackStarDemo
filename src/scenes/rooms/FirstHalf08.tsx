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

const FirstHalf08: React.FC = () => {
  const { startFadeOutToBlack } = usePageTransition();
  const gameStoreInstance = useGameStore();
  const sceneStoreInstance = useSceneStore();

  const [activeDialogId, setActiveDialogId] = useState<string | null>(null);

  const selectedCharacter = useGameStore((state) => state.selectedCharacter);

  const roomDialogs: Record<string, DialogSequence> = useMemo(
    () => ({
      tableInvestigation: {
        id: 'tableInvestigation',
        initialStepId: 'start_table_observation',
        steps: {
          start_table_observation: {
            id: 'start_table_observation',
            title: '책상 조사 시작',
            description:
              '낡은 나무 책상 위는 온통 기괴한 물건들로 가득하다. 유리병 속의 섬뜩한 생물, 수상한 내용이 적힌 듯한 펼쳐진 책과 흩어진 종이들, 그리고 굳게 닫힌 서랍까지... 무엇부터 조사해야 할까? 모든 것을 다 살펴볼 시간은 없을 것 같다.',
            actions: [
              {
                id: ACTION_ID_NEXT,
                text: '조사를 시작한다...',
                nextStepId: 'choice_table_IP',
              },
              {
                id: 'leave_table_early',
                text: '불길하다. 이 책상은 무시한다.',
                isDialogEnd: true,
                outcomes: [
                  {
                    type: 'text',
                    payload: '본능적인 위험을 감지하고 책상에서 물러섰다.',
                  },
                ],
              },
            ],
          },
          choice_table_IP: {
            id: 'choice_table_IP',
            title: '어떤 것을 조사할까?',
            description: (cs, gs) => {
              return '테이블 위의 물건들 중 무엇을 먼저 조사하시겠습니까? 신중하게 선택해야 합니다.';
            },
            actions: [
              {
                id: 'choice_investigate_jar',
                text: '유리병 속의 기괴한 생물을 조사한다.',
                investigationPoints: 2,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 2, reason: '유리병 생물 조사' },
                  },
                ],
                nextStepId: 'detail_jar_investigation',
              },
              {
                id: 'choice_investigate_book',
                text: '펼쳐진 낡은 책을 조사한다.',
                investigationPoints: 2,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 2, reason: '낡은 책 조사' },
                  },
                ],
                nextStepId: 'detail_book_investigation',
              },
              {
                id: 'choice_investigate_papers',
                text: '흩어진 종이들을 조사한다.',
                investigationPoints: 1,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 1, reason: '흩어진 종이 조사' },
                  },
                ],
                nextStepId: 'detail_papers_investigation',
              },
              {
                id: 'choice_investigate_drawer',
                text: '책상 서랍을 조사한다.',
                investigationPoints: 2,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 2, reason: '책상 서랍 조사' },
                  },
                ],
                nextStepId: 'detail_drawer_investigation',
              },
              {
                id: 'finish_table_investigation',
                text: '이만하면 됐다. 테이블 조사를 마친다.',
                isDialogEnd: true,
                outcomes: [
                  {
                    type: 'text',
                    payload: '책상에서 더 이상 조사할 것을 찾지 못했다.',
                  },
                ],
              },
            ],
          },
          detail_jar_investigation: {
            id: 'detail_jar_investigation',
            title: '병 속의 생물',
            description:
              '끈적한 액체 속에 잠긴 생물은 형언하기 어려운 모습이다. 미세하게 꿈틀거리는 것 같기도 하다.',
            actions: [
              {
                id: 'jar_observe_detail',
                text: '병을 조심스럽게 들어 빛에 비춰보며 생물의 세부 형태를 관찰한다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '생물의 몸에는 기하학적인 문양이 희미하게 새겨져 있고, 여러 개의 눈은 공허하게 앞을 응시하고 있다. 섬뜩한 모습에 이성이 약간 흔들린다.',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: { amount: -3, reason: '기괴한 생물 관찰' },
                  },
                ],
                nextStepId: 'choice_table_IP',
              },
              {
                id: 'jar_try_open',
                text: '병마개를 조심스럽게 열어보려 시도하거나, 내용물의 냄새를 맡아본다. (위험 감수)',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '마개를 열려는 순간, 역한 암모니아 냄새와 함께 섬뜩한 기운이 터져 나온다! 정신을 차리기 어렵다. 하지만 병 안쪽에서 작은 금속 조각 같은 것을 발견한 것 같다! (금속 조각 획득)',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: { amount: -10, reason: '위험한 병 개방 시도' },
                  },
                ],
                nextStepId: 'choice_table_IP',
              },
              {
                id: 'jar_leave_it',
                text: '더 이상 건드리지 않고 돌아간다.',
                nextStepId: 'choice_table_IP',
              },
            ],
          },
          detail_book_investigation: {
            id: 'detail_book_investigation',
            title: '낡은 책',
            description:
              '가죽 표지의 책은 수없이 많은 손길을 탄 듯 낡았고, 펼쳐진 페이지에는 알아보기 힘든 고대 문자와 기괴한 삽화가 가득하다.',
            actions: [
              {
                id: 'book_read_current_page',
                text: '펼쳐진 페이지의 본문 내용을 자세히 읽어본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '내용은 "문지기(GateKeeper)"라 불리는 존재와 그를 소환하는 방법에 대한 것이다. 몇몇 구절은 검게 칠해져 있다.',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: { amount: -5, reason: '금지된 책 내용 열람' },
                  },
                ],
                nextStepId: 'choice_table_IP',
              },
              {
                id: 'book_search_other_parts',
                text: '책 전체를 꼼꼼히 살펴보며 다른 중요한 부분(밑줄, 접힌 페이지, 숨겨진 메모 등)이 있는지 확인한다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '책장을 넘기던 중, 한 페이지 모서리가 작게 접혀있었고 그곳에는 피로 보이는 얼룩과 함께 "그는 기다린다"라는 짧은 메모가 적혀 있었다.',
                  },
                ],
                nextStepId: 'choice_table_IP',
              },
              {
                id: 'book_leave_it',
                text: '더 이상 읽지 않고 돌아간다.',
                nextStepId: 'choice_table_IP',
              },
            ],
          },
          detail_papers_investigation: {
            id: 'detail_papers_investigation',
            title: '흩어진 종이들',
            description:
              '양피지로 보이는 종이 조각들이 책상 위에 어지럽게 흩어져 있다. 무언가를 급하게 적은 듯한 필체다.',
            actions: [
              {
                id: 'papers_read_top_one',
                text: '가장 위에 놓인 종이 한 장의 내용을 빠르게 확인한다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '종이에는 "별들이 정렬될 때, 문이 열릴 것이다. 하지만 대가가 필요하다."라는 경고문이 적혀 있다.',
                  },
                ],
                nextStepId: 'choice_table_IP',
              },
              {
                id: 'papers_analyze_all',
                text: '흩어진 종이들을 모아 순서를 맞춰보거나, 내용을 종합적으로 분석한다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '여러 조각을 맞추자, 저택 어딘가에 숨겨진 방을 가리키는 듯한 약도가 드러난다! 하지만 약도 일부는 피에 젖어 훼손되어 있다.',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: { amount: -2, reason: '훼손된 약도 분석' },
                  },
                ],
                nextStepId: 'choice_table_IP',
              },
              {
                id: 'papers_leave_them',
                text: '종이들은 무시하고 돌아간다.',
                nextStepId: 'choice_table_IP',
              },
            ],
          },
          detail_drawer_investigation: {
            id: 'detail_drawer_investigation',
            title: '책상 서랍',
            description:
              '책상에는 두 개의 서랍이 있다. 어느 쪽을 열어볼까, 아니면 좀 더 다른 방법을 찾아볼까?',
            actions: [
              {
                id: 'drawer_check_left',
                text: '왼쪽 서랍을 열어 내부를 꼼꼼히 살펴본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '왼쪽 서랍 안에는 낡은 가죽 일기장 한 권과 녹슨 만년필이 들어있다. 일기장은 대부분 비어있지만, 마지막 장에 "그의 눈을 피해야 해"라는 글이 남아있다. (일기장 조각 획득)',
                  },
                ],
                nextStepId: 'choice_table_IP',
              },
              {
                id: 'drawer_check_right',
                text: '오른쪽 서랍을 열어 내부를 꼼꼼히 살펴본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '오른쪽 서랍에서는 작은 나무 상자가 나왔다. 안에는 기이한 문양이 새겨진 작은 돌멩이 하나가 들어있다. 만지자 차가운 기운이 느껴진다. (문양 돌멩이 획득)',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: { amount: -3, reason: '기이한 돌멩이 발견' },
                  },
                ],
                nextStepId: 'choice_table_IP',
              },
              {
                id: 'drawer_search_secret_compartment',
                text: '서랍 안쪽이나 바닥에 비밀 공간이 있는지 정밀하게 조사한다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '오른쪽 서랍 바닥을 더듬던 손끝에 무언가 걸렸다. 조심스럽게 당기자, 서랍 밑에 숨겨져 있던 얇은 금속판이 드러났다. 표면에는 복잡한 별자리가 새겨져 있다. (별자리 금속판 획득)',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: { amount: -5, reason: '비밀 공간의 불길한 발견' },
                  },
                ],
                nextStepId: 'choice_table_IP',
              },
              {
                id: 'drawer_leave_it',
                text: '서랍은 그대로 두고 돌아간다.',
                nextStepId: 'choice_table_IP',
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
    [selectedCharacter]
  );

  const handleNoteTableClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('handleNoteTableClick');
    e.stopPropagation();
    setActiveDialogId('tableInvestigation');
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
          zIndex: 10,
        }}
        onClick={handleNoteTableClick}
      >
        <img
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          src="images/noteondesk.png"
          alt="noteondesk"
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

export default FirstHalf08;
