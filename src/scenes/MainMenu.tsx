import { Box, Button, Typography } from '@mui/material';
import React from 'react';
// useNavigate는 이제 PageTransitionContext 내부의 훅에서 사용됩니다.
// import { useNavigate } from 'react-router-dom';
import { usePageTransition } from '../contexts/PageTransitionContext'; // 수정된 훅 임포트

const MainMenu: React.FC = () => {
  // const navigate = useNavigate(); // 더 이상 직접 사용하지 않음
  const { startFadeOutToBlack } = usePageTransition(); // 변경된 함수 이름 사용

  const handleGameStart = () => {
    startFadeOutToBlack('/character-select', 2000); // 2초(2000ms) 후 페이지 이동
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        // height: '100vh', // 부모 div가 이미 중앙 정렬 및 높이 설정
        height: '100%', // 부모 컨테이너에 꽉 차도록
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '598px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <img
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          src="images/title5.png"
          alt="logo"
        />
      </Box>
      <Typography
        sx={{
          position: 'absolute',
          top: 150,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
        variant="h1"
      >
        검은 별 아래에서
      </Typography>
      <Button
        sx={{
          width: 320,
          fontSize: 24,
          position: 'absolute',
          top: 500,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
        variant="text"
        color="primary"
        size="large"
        onClick={handleGameStart} // 수정된 핸들러 연결
      >
        게임 시작
      </Button>

      {/* 여기에 메인 메뉴 내용 추가 */}
    </div>
  );
};

export default MainMenu;
