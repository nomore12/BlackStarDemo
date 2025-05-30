// src/App.tsx
import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';
import theme from './styles/Theme';
import {
  BrowserRouter as Router,
  useLocation /* useNavigate */,
} from 'react-router-dom'; // useNavigate는 현재 사용되지 않으므로 주석 처리 가능
import AppRoutes from './routes/Routes';
import { PageTransitionProvider } from './contexts/PageTransitionContext';
import CharacterInfo from './components/ui/CharacterInfo';
import { Box, Button, Typography } from '@mui/material';
import { useSceneStore } from './store/sceneStore';
import { Snackbar, Alert } from '@mui/material';
import { useSnackbarStore } from './store/uiStore';
import { useGameStore } from './store/characterStore';

function AppContent() {
  // Router 컨텍스트 내부에서 훅을 사용하기 위한 내부 컴포넌트
  const location = useLocation();
  // const navigate = useNavigate(); // navigate는 현재 뒤로가기 방지 로직에서 직접 사용 안 함

  useEffect(() => {
    // 현재 상태를 히스토리 스택에 추가 (최초 로드 시)
    // 이렇게 하면 사용자가 처음 뒤로가기를 시도할 때 이 상태로 돌아오게 됨
    // (그러나 popstate 핸들러가 즉시 다시 현재 URL로 밀어넣음)
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      // 뒤로가기 시도 시, 다시 현재 URL로 강제 푸시하여 이동을 막음
      // console.log('Back button blocked. Staying on:', location.pathname);
      window.history.pushState(null, '', window.location.href);
      // 만약 React Router의 상태와 완벽하게 동기화하려면 아래와 같이 navigate 사용도 고려 가능
      // 하지만 window.history.pushState만으로도 대부분의 뒤로가기 차단은 가능
      // navigate(location.pathname + location.search, { replace: true });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname]); // location.pathname이 바뀔 때마다 리스너가 새 경로를 기준으로 작동하도록 함

  return (
    <PageTransitionProvider>
      <AppRoutes />
    </PageTransitionProvider>
  );
}

function App() {
  const { open, message, severity, showSnackbar, closeSnackbar } =
    useSnackbarStore();

  const { currentSceneIndex, currentSceneId, currentRunSceneIds, reset } =
    useSceneStore();

  const handleSnackbarClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    // 'clickaway' (바깥 클릭) 시에는 닫히지 않도록 함
    if (reason === 'clickaway') {
      return;
    }
    // 그 외의 경우 (Alert의 X 버튼 클릭 등)에는 닫도록 함
    closeSnackbar();
  };

  useEffect(() => {
    reset();
    console.log(currentSceneIndex, currentSceneId, currentRunSceneIds);
    const handleContextMenu = (event: MouseEvent) => {
      // REACT_APP_DEBUG_MODE가 'false'일 때 오른쪽 클릭 방지
      if (process.env.REACT_APP_DEBUG_MODE === 'false') {
        event.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />{' '}
      <div
        id="game-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100vh',
        }}
      >
        <div
          style={{
            border: '1px solid #0f0f0f',
            backgroundColor: '#282d29',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '800px',
            height: '600px',
            position: 'relative',
          }}
        >
          <Router>
            <AppContent /> {/* 로직을 담은 내부 컴포넌트 사용 */}
          </Router>
          {currentSceneIndex > -1 && (
            <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
              <CharacterInfo />
            </Box>
          )}
        </div>
        <Snackbar
          sx={{ zIndex: 10000, position: 'absolute', top: 550, left: 0 }}
          open={open}
          autoHideDuration={10000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={closeSnackbar}
            severity={severity}
            sx={{ width: '100%' }}
          >
            {message}
          </Alert>
        </Snackbar>
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 2,
          }}
        >
          <Typography variant="h6">Debug</Typography>
          <Button
            variant="outlined"
            component="a"
            href="/"
            onClick={() => {
              // useGameStore.getState().selectCharacter(null);
              useSceneStore.getState().goHome();
            }}
          >
            Go to title scene
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              useGameStore.getState().resetDialogSelections();
            }}
          >
            Reset dialog selections
          </Button>
        </Box>
      </div>
    </ThemeProvider>
  );
}

export default App;
