// src/App.tsx
import React from 'react';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu'; // 예시 아이콘
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import '../App.css';
import theme from '../Styles/Theme';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from '../routes/Routes';

// 스타일링된 컨테이너
const StyledContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
}));

const Section = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  padding: theme.spacing(2),
}));

function UiTest() {
  return (
    <ThemeProvider theme={theme}>
     
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            검은 별 아래에서 - UI 데모
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>

      <StyledContainer>
        <Typography variant="h1" gutterBottom align="center">H1: 어둠 속의 표류</Typography>
        <Typography variant="h2" gutterBottom align="center">H2: Strange Encounter</Typography>
        <Typography variant="h3" gutterBottom align="center">H3: 잊혀진 의식</Typography>
        <Typography variant="h4" gutterBottom>H4: 속삭이는 그림자</Typography>
        <Typography variant="h5" gutterBottom>H5: 금지된 지식의 파편</Typography>
        <Typography variant="h6" gutterBottom>H6: 경계 너머의 존재</Typography>
        <Typography variant="body1" paragraph fontFamily="Hahmlet">
          Hahmlet 이것은 `body1` 텍스트입니다. "검은 별 아래에서"의 세계는 어둡고 불가해한 공포로 가득 차 있습니다. 
          플레이어는 살아남기 위해, 혹은 진실을 찾기 위해 이성을 대가로 위험한 선택을 해야 할 것입니다. 
          이곳의 텍스트는 `theme.palette.text.primary` 색상을 따릅니다.
        </Typography>
        <Typography variant="body2" fontFamily="Hahmlet" paragraph>
          Hahmlet 이것은 `body2` 텍스트입니다. 부가적인 설명이나 덜 중요한 정보에 사용됩니다. 
          `theme.palette.text.secondary` 색상으로 표시됩니다. <Typography component="span" variant="caption">이것은 caption입니다.</Typography> <Typography component="span" variant="overline">이것은 OVERLINE입니다.</Typography>
        </Typography>
        <Typography variant="button" display="block" gutterBottom>
          이것은 BUTTON 스타일의 텍스트입니다.
        </Typography>

        <Section elevation={3}>
          <Typography variant="h5" gutterBottom>버튼 (Buttons)</Typography>
          <Stack spacing={2} direction="row" justifyContent="center" flexWrap="wrap">
            <Button variant="contained" color="primary">Primary Contained</Button>
            <Button variant="contained" color="secondary">Secondary Contained</Button>
            <Button variant="contained" color="success">Success Contained</Button>
            <Button variant="contained" color="error">Error Contained</Button>
            <Button variant="contained" color="warning">Warning Contained</Button>
            <Button variant="contained" color="info">Info Contained</Button>
            <Button variant="contained" disabled>Disabled Contained</Button>
          </Stack>
          <Stack spacing={2} direction="row" justifyContent="center" flexWrap="wrap" sx={{ mt: 2 }}>
            <Button variant="outlined" color="primary">Primary Outlined</Button>
            <Button variant="outlined" color="secondary">Secondary Outlined</Button>
            <Button variant="outlined" color="success">Success Outlined</Button>
            <Button variant="outlined" color="error">Error Outlined</Button>
            <Button variant="outlined" disabled>Disabled Outlined</Button>
          </Stack>
          <Stack spacing={2} direction="row" justifyContent="center" flexWrap="wrap" sx={{ mt: 2 }}>
            <Button variant="text" color="primary">Primary Text</Button>
            <Button variant="text" color="secondary">Secondary Text</Button>
            <Button variant="text" color="success">Success Text</Button>
            <Button variant="text" color="error">Error Text</Button>
            <Button variant="text" disabled>Disabled Text</Button>
          </Stack>
        </Section>

        <Section elevation={1}>
          <Typography variant="h5" gutterBottom>페이퍼 (Paper) & 툴팁 (Tooltip)</Typography>
          <Paper sx={{ padding: 2, mt: 2, display: 'inline-block' }}>
            <Typography variant="body1">이것은 Paper 컴포넌트 내부의 텍스트입니다.</Typography>
            <Typography variant="body2" sx={{mb: 2}}>어두운 테마에 맞춰 배경색과 테두리가 적용되었습니다.</Typography>
            <Tooltip title="이것은 툴팁입니다! (기본 스타일 적용)" arrow>
              <Button variant="outlined">툴팁 버튼</Button>
            </Tooltip>
          </Paper>
        </Section>
        
        <Section>
            <Typography variant="h5" gutterBottom>경고 (Alerts)</Typography>
            <Stack sx={{ width: '100%', mt: 2 }} spacing={2}>
                <Alert severity="error">
                    <AlertTitle>오류</AlertTitle>
                    이것은 오류(error) 경고입니다 — <strong>확인해보세요!</strong>
                </Alert>
                <Alert severity="warning">
                    <AlertTitle>경고</AlertTitle>
                    이것은 경고(warning) 알림입니다 — <strong>주의하세요!</strong>
                </Alert>
                <Alert severity="info">
                    <AlertTitle>정보</AlertTitle>
                    이것은 정보(info) 알림입니다 — <strong>참고하세요.</strong>
                </Alert>
                <Alert severity="success">
                    <AlertTitle>성공</AlertTitle>
                    이것은 성공(success) 알림입니다 — <strong>잘 처리되었습니다!</strong>
                </Alert>
            </Stack>
        </Section>

        <Box sx={{mt: 4}}>
          <Typography variant="caption" display="block" gutterBottom>
            * 버튼 클릭 시 리플 효과는 테마에서 `disableRipple: true`로 전역 비활성화 되었습니다.
          </Typography>
          <Typography variant="caption" display="block">
            * 버튼 클릭 후 포커스 상태에서도 원래 색상으로 돌아오도록 테마가 설정되었습니다.
          </Typography>
        </Box>

      </StyledContainer>
    </ThemeProvider>
  );
}

export default UiTest;