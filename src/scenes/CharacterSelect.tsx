import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useGameStore } from '../store/characterStore';
import { usePageTransition } from '../contexts/PageTransitionContext';

interface Character {
  id: string;
  name: string;
  title: string;
  image: string;
  alt: string;
  quote: string;
  description: string;
  skills: string[];
}

const charactersData: Character[] = [
  {
    id: 'scholar',
    name: '엘리어트 웨이트',
    title: '풋내기 학자',
    image: 'images/character_01.png',
    alt: '학자',
    quote: '&quot;지식에 대한 갈증은 때로는 가장 위험한 문을 열게 한다.&quot;',
    description:
      '미스카토닉 대학의 젊은 학자로, 금단의 지식에 매료되어 실종된 선배의 연구 기록을 따라 외딴 저택으로 향합니다. 그곳에서 그의 이성은 불가해한 현상들 앞에 시험받게 됩니다.',
    skills: [
      '<strong>분석적 사고:</strong> 단서와 문헌을 통해 논리적으로 추론합니다.',
      '<strong>미약한 &apos;광기의 공감각&apos;:</strong> 금지된 지식의 영향으로 현실 너머의 존재를 어렴풋이 감지합니다.',
      '<strong>초기 학문 지식:</strong> 일부 고대 상징 및 오컬트 지식을 알고 있습니다.',
    ],
  },
  {
    id: 'explorer',
    name: '애비게일 홀로웨이',
    title: '절박한 탐사자',
    image: 'images/character_02.png',
    alt: '탐사자',
    quote:
      '&quot;어둠 속에 묻힌 진실보다 더 깊은 것은, 잃어버린 이에 대한 그리움이다.&quot;',
    description:
      '몇 년 전, 폭풍우 치던 밤 외딴 저택에서 실종된 여동생을 잊지 못하고 깊은 상실감과 죄책감에 시달리는 인물입니다. 익명의 편지를 받고 마지막 희망을 품은 채, 홀로 폐허가 된 저택으로 향합니다.',
    skills: [
      '<strong>강인한 의지:</strong> 절박한 상황에서도 쉽게 포기하지 않으며, 특정 위협에 일시적인 저항력을 보입니다.',
      '<strong>직감적 &apos;광기의 공감각&apos;:</strong> 실종된 가족의 유품이나 특정 장소에서 강한 감정적 동요와 함께 보이지 않는 존재나 과거의 잔상을 느낍니다.',
      '<strong>생존 본능:</strong> 위험한 상황에서 본능적으로 대처하거나 숨겨진 통로를 발견하는 데 재능을 보입니다.',
    ],
  },
];

const CharacterSelect: React.FC = () => {
  const { selectCharacter } = useGameStore();
  const { startFadeOutToBlack } = usePageTransition();
  const [selectedCharacterForInfo, setSelectedCharacterForInfo] = useState<
    string | null
  >(null);
  const [selectedCharacter, setSelectedCharacter] = useState<
    'scholar' | 'explorer' | null
  >(null);

  const handleOpenInfoModal = (characterId: string) => {
    setSelectedCharacterForInfo(characterId);
  };

  const handleCloseInfoModal = () => {
    setSelectedCharacterForInfo(null);
  };

  const handleStartGame = (characterId: 'scholar' | 'explorer' | null) => {
    if (!characterId) return;
    selectCharacter(characterId);
    startFadeOutToBlack('/introduction', 1500);
  };

  const selectedCharacterData = selectedCharacterForInfo
    ? charactersData.find((char) => char.id === selectedCharacterForInfo)
    : undefined;

  return (
    <div>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          marginTop: 1,
          paddingBottom: 2,
        }}
      >
        <Typography variant="h3" sx={{ fontFamily: 'Danjo' }}>
          캐릭터 선택
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        {charactersData.map((character) => (
          <Box
            key={character.id}
            sx={{
              width: 280,
              padding: 2,
              border: '1px solid #555',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 1.5,
              backgroundColor: '#2a2a2a',
              color: '#c0c0c0',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontFamily: 'Danjo', color: '#e0e0e0', mb: 1 }}
              >
                {character.title}
              </Typography>
              <Box
                sx={{
                  width: 240,
                  height: 280,
                  backgroundColor: '#111',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <img
                  src={character.image}
                  alt={character.alt}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </Box>
            </Box>
            <Alert
              severity="info"
              icon={false}
              sx={{
                backgroundColor: 'transparent',
                color: 'inherit',
                padding: '6px 10px',
                textAlign: 'left',
              }}
            >
              <strong>이름:</strong> {character.name}
              <br />
              <strong>직업:</strong> {character.title}
              <Box
                sx={{ display: 'flex', justifyContent: 'center', marginTop: 1 }}
              >
                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={() => handleOpenInfoModal(character.id)}
                  sx={{
                    borderColor: '#777',
                    '&:hover': { borderColor: '#ccc' },
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                    더 많은 정보
                  </Typography>
                </Button>
              </Box>
            </Alert>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 'auto' }}
              onClick={() =>
                setSelectedCharacter(character.id as 'scholar' | 'explorer')
              }
            >
              선택하기
            </Button>
          </Box>
        ))}
      </Box>
      <Dialog
        open={!!selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1e1e1e',
            color: '#c0c0c0',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: 'Danjo',
            color: '#e0e0e0',
            borderBottom: '1px solid #444',
          }}
        >
          캐릭터 선택 확인
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '20px !important' }}>
          <Typography
            sx={{
              fontFamily: 'Hahmlet',
              fontSize: '1rem',
              textAlign: 'center',
            }}
          >
            정말{' '}
            {selectedCharacter
              ? charactersData.find((char) => char.id === selectedCharacter)
                  ?.name
              : ''}
            를 선택하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{ borderTop: '1px solid #444', padding: '12px 24px' }}
        >
          <Button
            onClick={() => setSelectedCharacter(null)}
            color="inherit"
            variant="outlined"
            sx={{ borderColor: '#777' }}
          >
            취소
          </Button>
          <Button
            onClick={() => handleStartGame(selectedCharacter)}
            color="inherit"
            variant="outlined"
            sx={{ borderColor: '#777' }}
          >
            시작하기
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!selectedCharacterForInfo && !!selectedCharacterData}
        onClose={handleCloseInfoModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1e1e1e',
            color: '#c0c0c0',
          },
        }}
      >
        {selectedCharacterData && (
          <>
            <DialogTitle
              sx={{
                fontFamily: 'Danjo',
                color: '#e0e0e0',
                borderBottom: '1px solid #444',
              }}
            >
              캐릭터 정보: {selectedCharacterData.title}
            </DialogTitle>
            <DialogContent sx={{ paddingTop: '20px !important' }}>
              <Box
                component="div"
                sx={{
                  fontFamily: 'Hahmlet',
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                }}
              >
                <p
                  dangerouslySetInnerHTML={{
                    __html: selectedCharacterData.quote,
                  }}
                  style={{
                    fontStyle: 'italic',
                    color: '#a0a0a0',
                    marginBottom: '16px',
                  }}
                />
                <p>{selectedCharacterData.description}</p>
                <p
                  style={{
                    marginTop: '20px',
                    fontWeight: 'bold',
                    color: '#e0e0e0',
                    fontSize: '1.1rem',
                  }}
                >
                  주요 기술:
                </p>
                <ul
                  style={{
                    paddingLeft: '20px',
                    marginTop: '8px',
                    marginBottom: 0,
                    listStyleType: "'✧ '",
                  }}
                >
                  {selectedCharacterData.skills.map((skill, index) => (
                    <li
                      key={index}
                      dangerouslySetInnerHTML={{ __html: skill }}
                      style={{ marginBottom: '6px' }}
                    />
                  ))}
                </ul>
              </Box>
            </DialogContent>
            <DialogActions
              sx={{ borderTop: '1px solid #444', padding: '12px 24px' }}
            >
              <Button
                onClick={handleCloseInfoModal}
                color="inherit"
                variant="outlined"
                sx={{ borderColor: '#777' }}
              >
                닫기
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default CharacterSelect;
