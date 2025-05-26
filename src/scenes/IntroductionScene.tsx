import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Fade,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/characterStore'; // Zustand 스토어 임포트
import { usePageTransition } from '../contexts/PageTransitionContext'; // 페이지 전환 훅 (페이드아웃용)
import { useSceneStore } from '../store/sceneStore';

const scholarText = [
  '미스카토닉 대학의 고문서 서고… 이 희미한 가스등 아래서, 나는 마침내 그것을 발견했다. 낡은 양피지 한 장. 존경하는 에드워드 선배님께서 실종 직전까지 매달리셨던 바로 그 연구였다. 뉴잉글랜드 외곽, 의문의 블랙우드 저택… 모든 단서가 그곳을 가리키고 있었다.',
  "선배님의 연구 노트는 온통 이해할 수 없는 기호들뿐이었다. '경계를 넘나드는 지혜', 혹은 '광기의 속삭임'이라니… 대체 무엇을 찾으려 하셨던 걸까? 학자로서의 명예를 위해서든, 혹은 이 금지된 지식에 대한 억누를 수 없는 갈증 때문이든, 나는 가야만 했다. 블랙우드 저택. 그곳에 선배님의 행방, 그리고 어쩌면 그 이상의 해답이 있을 것이다.",
  '폭풍우가 몰아치는 밤, 드디어 도착한 저택은… 형언할 수 없는 음산한 기운으로 나를 맞이했다. 삐걱이는 대문 너머의 어둠은 마치 살아있는 생물처럼 꿈틀거리는 듯했다. 심장이 불안하게 요동쳤지만, 여기서 물러설 수는 없다. 이 문 너머에 무엇이 기다리고 있든, 나는 알아내야만 한다. 나의 이성이… 버텨줄 수 있을까?',
];

const explorerText = [
  '몇 년 전, 내 사랑하는 여동생 릴리가 사라졌던 그 밤도… 오늘처럼 이렇게 폭풍우가 몰아쳤었지. 경찰은 단순 가출이라 했지만, 난 믿지 않아. 매일 밤 악몽 속에서 릴리는 언제나 그 낡은 저택, 블랙우드를 향해 내게 손짓하고 있었으니까.',
  "얼마 전, 발신인도 없는 낡은 편지 한 통. '동생의 마지막 흔적이 그곳에 남아있다'는 짧은 메시지와 함께 그려진 블랙우드 저택의 약도… 어쩌면 이것이 내 마지막 희망일지도 모른다. 떨리는 가슴을 부여잡았다. 릴리의 작은 토끼 인형을 품에 안고, 나는 그 저주받은 저택으로 향했다. 반드시 찾아야 해.",
  '저택은 거대한 묘비처럼 음산하게 서 있었다. 빗줄기는 점점 거세지고, 낡은 창문 안쪽에서 무언가… 그림자가 어른거리는 것만 같다. 심장이 공포로 얼어붙을 것 같지만, 릴리를 찾아야 한다는 생각뿐이다. 이 문을 열면, 대체 무엇이 나를 기다리고 있을까? …괜찮아, 할 수 있어.',
];

const MODAL_APPEAR_DELAY = 7000; // 모달이 7초 후에 나타나도록 설정

const IntroductionScene = () => {
  const navigate = useNavigate();
  const { selectedCharacter } = useGameStore();
  const { startFadeOutToBlack } = usePageTransition(); // 페이드아웃 함수 가져오기

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentDisplayedText, setCurrentDisplayedText] = useState('');

  const { getNextSceneUrl } = useSceneStore();

  const textsToDisplay =
    selectedCharacter?.id === 'scholar' ? scholarText : explorerText;

  // 페이지 로드 후 7초 뒤에 모달 열기
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedCharacter) {
        // 선택된 캐릭터가 있을 때만 모달을 엶
        setIsModalOpen(true);
      }
    }, MODAL_APPEAR_DELAY); // 7초 지연
    return () => clearTimeout(timer);
  }, [selectedCharacter]); // selectedCharacter가 변경될 때도 실행 (혹시 모를 경우 대비)

  // 모달이 열리거나 텍스트 인덱스가 변경될 때 타이핑 효과 적용
  useEffect(() => {
    if (isModalOpen && currentTextIndex < textsToDisplay.length) {
      const textToType = textsToDisplay[currentTextIndex]; // 현재 타이핑할 전체 텍스트

      setCurrentDisplayedText(''); // 이전 텍스트 초기화
      let charIndex = 0; // 변수명을 'i' 대신 'charIndex'로 변경하여 명확성 증진

      const typingInterval = setInterval(() => {
        if (charIndex < textToType.length) {
          const charToAdd = textToType.charAt(charIndex);

          setCurrentDisplayedText((prev) => {
            const newText = prev + charToAdd;
            return newText;
          });
          charIndex++;
        } else {
          clearInterval(typingInterval);
        }
      }, 30); // 타이핑 속도를 100ms로 느리게 조정하여 로그 확인 용이하게 함 (원래는 30)

      return () => {
        clearInterval(typingInterval);
      };
    }
  }, [isModalOpen, currentTextIndex, textsToDisplay]);

  const handleNextText = () => {
    if (currentTextIndex < textsToDisplay.length - 1) {
      setCurrentTextIndex(currentTextIndex + 1);
    }
  };

  const handleCloseModalAndProceed = () => {
    setIsModalOpen(false);
    startFadeOutToBlack(getNextSceneUrl(), 1500);
  };

  if (!selectedCharacter) {
    return <Typography>캐릭터 정보를 불러오는 중...</Typography>;
  }

  const isLastText = currentTextIndex >= textsToDisplay.length - 1;

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
        src="images/manor.png"
        alt="manor"
      />
      <Dialog
        open={isModalOpen}
        disableEscapeKeyDown
        maxWidth="md"
        PaperProps={{
          sx: {
            position: 'absolute',
            bottom: 'calc((100vh - 600px) / 2)',
            left: '50%',
            transform: 'translateX(calc(-50% - 32px))',
            width: '100%',
            maxWidth: '700px',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            color: '#e0e0e0',
            borderRadius: 2,
            border: '1px solid #444',
            minHeight: '180px',
            maxHeight: '40%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px',
            boxSizing: 'border-box',
            zIndex: 10,
          },
        }}
      >
        <DialogContent sx={{ flexGrow: 1, overflowY: 'auto' }}>
          <Typography
            sx={{
              fontFamily: 'Hahmlet',
              fontSize: '1rem',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
            }}
          >
            {currentDisplayedText}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: '0', justifyContent: 'flex-end' }}>
          {isLastText ? (
            <Button
              onClick={handleCloseModalAndProceed}
              color="primary"
              variant="contained"
              size="small"
            >
              저택으로...
            </Button>
          ) : (
            <Button
              onClick={handleNextText}
              color="primary"
              variant="outlined"
              size="small"
            >
              다음
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IntroductionScene;
