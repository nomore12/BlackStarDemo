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

const FirstHalf07: React.FC = () => {
  const { startFadeOutToBlack } = usePageTransition();
  const gameStoreInstance = useGameStore();
  const sceneStoreInstance = useSceneStore();

  const [activeDialogId, setActiveDialogId] = useState<string | null>(null);

  const selectedCharacter = useGameStore((state) => state.selectedCharacter);

  const roomDialogs: Record<string, DialogSequence> = useMemo(
    () => ({
      libraryExploration: {
        // 다이얼로그 ID
        id: 'libraryExploration',
        initialStepId: 'start_library_observation',
        steps: {
          // --- 1단계: 조사할 책 선택 (포인트 소모) ---
          start_library_observation: {
            id: 'start_library_observation',
            title: '고대의 서재',
            description:
              '먼지와 시간의 무게가 느껴지는 책장이다. 수많은 고서들이 금방이라도 바스러질 듯 위태롭게 꽂혀 있다. 몇몇 책은 가죽 표지가 해졌고, 어떤 책은 불길한 검은색으로 제본되어 있다. 이 금지된 지식들 속에서 무엇을 발견하게 될까?',
            actions: [
              {
                id: ACTION_ID_NEXT,
                text: '책 조사를 시작한다...',
                nextStepId: 'choice_book_IP',
              },
              {
                id: 'leave_library_untouched',
                text: '이곳의 책들은 건드리지 않는 것이 좋겠다.',
                isDialogEnd: true,
                outcomes: [
                  {
                    type: 'text',
                    payload: '불길한 예감에 책장을 뒤로하고 방을 나섰다.',
                  },
                ],
              },
            ],
          },
          choice_book_IP: {
            id: 'choice_book_IP',
            title: '어떤 책을 조사할까?',
            description: (characterState, gameState) => {
              return '선반 위의 책들 중 어떤 것을 먼저 조사하시겠습니까? 신중하게 선택해야 합니다.';
            },
            actions: [
              {
                id: 'choice_book_whispers_of_stars',
                text: "'별들의 속삭임과 티끌 같은 인간 군상' (시집)",
                investigationPoints: 1,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: {
                      amount: 1,
                      reason: '별들의 속삭임과 티끌 같은 인간 군상 조사',
                    },
                  },
                ],
                nextStepId: 'detail_book_whispers_of_stars',
              },
              {
                id: 'choice_book_forgotten_rituals',
                text: "'잊혀진 의식과 제물에 관한 소고' (연구서)",
                investigationPoints: 2,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: {
                      amount: 2,
                      reason: '잊혀진 의식과 제물에 관한 소고 조사',
                    },
                  },
                ],
                nextStepId: 'detail_book_forgotten_rituals',
              },
              {
                id: 'choice_book_kingsport_history',
                text: "'킹스포트 항구 이면사' (지역 역사서)",
                investigationPoints: 2,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 2, reason: '킹스포트 항구 이면사 조사' },
                  },
                ],
                nextStepId: 'detail_book_kingsport_history',
              },
              {
                id: 'choice_book_lunar_dialect',
                text: "'월족 언어 해독 시론' (언어학 서적)",
                investigationPoints: 3,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 3, reason: '월족 언어 해독 시론 조사' },
                  },
                ],
                nextStepId: 'detail_book_lunar_dialect',
              },
              {
                id: 'choice_book_necronomicon',
                text: "'네크로노미콘' (검은 가죽의 두꺼운 책)",
                investigationPoints: 4,
                outcomes: [
                  {
                    type: 'decreaseInvestigationPoints',
                    payload: { amount: 4, reason: '네크로노미콘 조사' },
                  },
                ],
                nextStepId: 'detail_book_necronomicon',
              },
              {
                id: 'finish_library_investigation',
                text: '책 조사를 마친다.',
                isDialogEnd: true,
                outcomes: [
                  {
                    type: 'text',
                    payload: '책장에서 더 이상 흥미로운 것을 찾지 못했다.',
                  },
                ],
              },
            ],
          },
          // 2-1. '별들의 속삭임과 티끌 같은 인간 군상' (시집)
          detail_book_whispers_of_stars: {
            id: 'detail_book_whispers_of_stars',
            title: "'별들의 속삭임과 티끌 같은 인간 군상'",
            description:
              '낡고 해진 시집이다. 표지에는 희미하게 별 문양이 그려져 있다.',
            actions: [
              {
                id: 'whispers_read_random_poem',
                text: '아무 페이지나 펼쳐 시를 한 수 읽어본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '시는 우주의 광대함과 그에 비해 하찮은 인간의 존재를 노래하고 있다. 읽는 것만으로도 현기증과 함께 알 수 없는 공포가 엄습한다.',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: {
                      amount: -2,
                      reason: '우주적 공포를 담은 시를 읽음',
                    },
                  },
                ],
                nextStepId: 'choice_book_IP',
              },
              {
                id: 'whispers_check_annotations',
                text: '페이지 여백에 적힌 메모나 주석이 있는지 살펴본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '한 페이지 구석에 누군가 급하게 휘갈겨 쓴 듯한 글씨가 있다: "그들은 항상 지켜보고 있다. 달이 없는 밤, 별이 유독 밝을 때 조심하라." (별과 달에 대한 경고 획득)',
                  },
                ],
                nextStepId: 'choice_book_IP',
              },
              {
                id: 'whispers_smell_book',
                text: '책에서 나는 냄새를 맡아본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '오래된 종이 냄새와 함께 희미하게 바닷바람 같은 짠 내와 별빛처럼 차가운 오존 냄새가 섞여 나는 듯하다. 기묘한 감각이다.',
                  },
                ],
                nextStepId: 'choice_book_IP',
              },
              {
                id: 'library_back_to_main_choices_1',
                text: '다른 책을 찾아본다.',
                nextStepId: 'choice_book_IP',
              },
            ],
          },
          // 2-2. '잊혀진 의식과 제물에 관한 소고' (연구서)
          detail_book_forgotten_rituals: {
            id: 'detail_book_forgotten_rituals',
            title: "'잊혀진 의식과 제물에 관한 소고'",
            description:
              '두꺼운 연구서로, 표지에는 복잡한 기하학적 문양이 음각되어 있다.',
            actions: [
              {
                id: 'rituals_glance_table_of_contents',
                text: '목차를 훑어보며 특정 의식에 대한 내용이 있는지 확인한다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '목차에는 "차원 문 개방 의식", "고대 존재 소환술", "희생을 통한 계약" 등 위험해 보이는 항목들이 가득하다. (위험한 의식 목록 확인)',
                  },
                ],
                nextStepId: 'choice_book_IP',
              },
              {
                id: 'rituals_examine_illustrations',
                text: '책 속의 삽화나 도해를 집중적으로 살펴본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '삽화에는 인간의 형상을 벗어난 존재에게 무언가를 바치는 모습, 혹은 별의 배열에 따라 작동하는 기괴한 장치 등이 그려져 있다. 보고 있자니 머리가 아파온다.',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: { amount: -4, reason: '불경한 의식 삽화 목격' },
                  },
                ],
                nextStepId: 'choice_book_IP',
              },
              {
                id: 'rituals_tear_out_page',
                text: '가장 중요해 보이는 페이지 하나를 몰래 찢어 가진다. (아이템 획득 시도)',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      "신중하게 '차원 문 개방 의식'에 대한 설명이 적힌 페이지를 찢어 품에 숨겼다. 언젠가 필요할지도 모른다. (의식 페이지 조각 획득)",
                  },
                  // { type: 'addItem', payload: { item: { id: 'ritual_page_dimension_gate', name: '차원 문 개방 의식 페이지', description: '금지된 책에서 찢어낸, 차원 문을 여는 의식에 대한 설명이 담긴 종이 조각.' }}},
                ],
                nextStepId: 'choice_book_IP',
              },
              {
                id: 'library_back_to_main_choices_2',
                text: '다른 책을 찾아본다.',
                nextStepId: 'choice_book_IP',
              },
            ],
          },

          // 2-3. '킹스포트 항구 이면사' (지역 역사서)
          detail_book_kingsport_history: {
            id: 'detail_book_kingsport_history',
            title: "'킹스포트 항구 이면사'",
            description:
              '지역 역사서인 듯 하지만, 표지부터 음산한 분위기를 풍긴다. "이면사"라는 부제가 마음에 걸린다.',
            actions: [
              {
                id: 'kingsport_find_strange_events',
                text: '책 내용 중 기이한 사건이나 실종 관련 기록을 찾아본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '수십 년 전, 이 저택과 관련된 일련의 실종 사건 기록을 발견했다. 당시 기록에는 "알 수 없는 존재에 의한 납치" 혹은 "스스로 별을 향해 떠났다"는 상반된 증언들이 남아있다. (저택 실종 사건 기록 발견)',
                  },
                ],
                nextStepId: 'choice_book_IP',
              },
              {
                id: 'kingsport_check_maps_or_locations',
                text: '책에 언급된 특정 장소나 지도가 있는지 확인한다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '책의 마지막 부분에 손으로 그린 듯한 낡은 해안가 지도가 끼워져 있다. 특정 동굴 입구에 X 표시가 되어 있고, "그들이 오는 곳"이라고 적혀있다. (비밀 해안 동굴 지도 획득)',
                  },
                  // { type: 'addItem', payload: { item: { id: 'map_secret_coastal_cave', name: '비밀 해안 동굴 지도', description: '킹스포트 역사서에서 발견된, 기이한 존재가 나타난다는 해안 동굴 지도.' }}},
                ],
                nextStepId: 'choice_book_IP',
              },
              {
                id: 'kingsport_compare_with_known_facts',
                text: '내가 알고 있는 사실이나 다른 단서와 이 책의 내용을 비교 분석한다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '(학자라면) 이 책의 내용은 이전에 읽었던 미스카토닉 대학의 금서 목록에 언급된 특정 사건과 유사하다는 것을 깨달았다. (탐험가라면) 이 책에 묘사된 실종자들의 특징이 동생 릴리의 마지막 모습과 겹쳐 보여 섬뜩하다.',
                  },
                ],
                nextStepId: 'choice_book_IP',
              },
              {
                id: 'library_back_to_main_choices_3',
                text: '다른 책을 찾아본다.',
                nextStepId: 'choice_book_IP',
              },
            ],
          },

          // 2-4. '월족 언어 해독 시론' (언어학 서적)
          detail_book_lunar_dialect: {
            id: 'detail_book_lunar_dialect',
            title: "'월족 언어 해독 시론'",
            description:
              '매우 전문적인 언어학 서적으로 보이지만, "월족"이라는 단어가 심상치 않다.',
            actions: [
              {
                id: 'lunar_try_decipher_symbols',
                text: '책에 설명된 내용을 바탕으로, 이전에 보았던 다른 기호나 문자를 해독 시도해본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '(특정 단서 보유 시) 이 책의 도움으로 이전에 발견했던 암호문 일부를 해독했다! 내용은 "달이 차오를 때, 경계가 약해지리라"이다. (암호 일부 해독 성공)',
                  },
                  {
                    type: 'text',
                    payload:
                      '(단서 미보유 시) 책의 내용은 너무나 복잡하고 난해하여 지금 당장은 이해하기 어렵다. 하지만 몇몇 기호는 확실히 눈에 익혀두었다.',
                  },
                ],
                nextStepId: 'choice_book_IP',
              },
              {
                id: 'lunar_find_pronunciation_guide',
                text: '월족 언어의 발음이나 음성적 특징에 대한 설명을 찾아본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '책에는 월족 언어가 인간의 발성기관으로는 정확히 발음하기 어려운 초저주파나 고주파 음역을 포함한다고 적혀있다. 듣는 것만으로도 정신에 영향을 줄 수 있다고 한다.',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: {
                      amount: -3,
                      reason: '인지 불가능한 언어에 대한 지식 습득',
                    },
                  },
                ],
                nextStepId: 'choice_book_IP',
              },
              {
                id: 'lunar_look_for_cultural_context',
                text: '언어와 관련된 월족의 문화나 신화에 대한 정보가 있는지 찾아본다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      "월족은 꿈을 통해 다른 차원을 여행하며, 별들 사이의 공허에 거대한 도시를 건설했다고 전해진다. 그들은 지상의 존재들을 하등하게 여기지만, 때로는 특정 인간과 '계약'을 맺기도 한다. (월족 문화 단서 획득)",
                  },
                ],
                nextStepId: 'choice_book_IP',
              },
              {
                id: 'library_back_to_main_choices_4',
                text: '다른 책을 찾아본다.',
                nextStepId: 'choice_book_IP',
              },
            ],
          },

          // 2-5. '네크로노미콘' (검은 가죽의 두꺼운 책)
          detail_book_necronomicon: {
            id: 'detail_book_necronomicon',
            title: "'네크로노미콘'",
            description:
              '단순히 오래된 책이라고 하기에는 너무나도 강력한 사악함과 금단의 기운이 느껴지는 책이다. 표지를 만지는 것조차 꺼려진다. 이것이 바로 미친 아랍인 압둘 알하자드가 저술했다는 전설의 마도서인가...',
            actions: [
              {
                id: 'necro_read_forbidden_knowledge',
                text: '공포를 억누르고 책을 펼쳐 그 내용을 확인한다. (극도의 위험 감수)',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '책을 펼치자, 이해할 수 없는 언어와 함께 우주의 가장 깊은 심연과 태초의 혼돈이 눈앞에 펼쳐지는 듯한 환각에 휩싸인다! 당신의 정신은 이 끔찍한 진실의 무게를 감당할 수 없을지도 모른다! (심연의 지식 일부 접촉)',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: { amount: -25, reason: '네크로노미콘 열람' },
                  }, // 대량 이성 감소
                  // { type: 'customEffect', payload: { effectId: 'EVENT_NECRONOMICON_READ', params: { knowledgeGained: true } } } // 특정 게임 이벤트 트리거
                ],
                nextStepId: 'choice_book_IP',
              },
              {
                id: 'necro_search_specific_spell',
                text: 'GateKeeper나 이 저택의 비밀과 관련된 특정 주문이나 정보를 찾아보려 시도한다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '정신을 집중하여 GateKeeper를 속박하거나 약화시킬 수 있는 희미한 단서를 발견한 것 같다! 하지만 그 대가로 당신의 영혼 일부가 책에 잠식당한 듯한 끔찍한 느낌이 든다. (GateKeeper 대항 주문 단서 획득)',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: {
                      amount: -15,
                      reason: '네크로노미콘에서 특정 정보 검색',
                    },
                  },
                  // { type: 'addSkill', payload: { skill: { id: 'SKILL_GATEKEEPER_WARD', name: '문지기 방어술 (미완)', description: '네크로노미콘에서 얻은 지식으로 문지기의 힘을 약화시키는 방법을 어렴풋이 알게 되었다.'}}} // 스킬 추가 구현 시
                ],
                nextStepId: 'choice_book_IP',
              },
              {
                id: 'necro_close_book_immediately',
                text: '이 책은 너무 위험하다. 즉시 덮고 멀리한다.',
                outcomes: [
                  {
                    type: 'text',
                    payload:
                      '책에서 풍겨 나오는 사악한 기운에 질려 황급히 책을 덮었다. 온몸에 소름이 돋고 식은땀이 흐른다.',
                  },
                  {
                    type: 'decreaseSanity',
                    payload: {
                      amount: -5,
                      reason: '네크로노미콘의 기운에 노출됨',
                    },
                  },
                ],
                nextStepId: 'choice_book_IP',
              },
              {
                id: 'library_back_to_main_choices_5',
                text: '다른 책을 찾아본다.',
                nextStepId: 'choice_book_IP',
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
    [selectedCharacter] // useMemo 의존성 배열
  );

  const handleBookShelfClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('handleNoteTableClick');
    e.stopPropagation();
    setActiveDialogId('libraryExploration');
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
          width: 230,
          height: 390,
          position: 'absolute',
          top: 150,
          left: 490,
          zIndex: 10,
        }}
        onClick={handleBookShelfClick}
      >
        <img
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          src="images/books.png"
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

export default FirstHalf07;
