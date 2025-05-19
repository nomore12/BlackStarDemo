// src/Styles/Theme.ts
import { createTheme } from '@mui/material/styles';

// '검은 별 아래에서' 다크 모드 테마 (전체 버전)
const theme = createTheme({
  palette: {
    mode: 'dark', // 다크 모드 명시
    primary: {
      main: '#a88b5a', // 낮은 채도의 황금색/황동색 계열 (핵심 상호작용)
      contrastText: '#e0e0e0', // 어두운 primary 색상 위에 밝은 텍스트
    },
    secondary: {
      main: '#4a6b7c', // 어둡고 차분한 청록색/잿빛 파란색 계열 (보조 상호작용)
      contrastText: '#d0d0d0',
    },
    error: {
      main: '#c62828', // 어두운 핏빛 또는 녹슨 붉은색 (오류 메시지, 위험 경고)
      contrastText: '#ffffff',
    },
    warning: {
      main: '#b07d3a', // 채도 낮은 앰버/겨자색 (경고 알림)
      contrastText: 'rgba(0, 0, 0, 0.87)', // 어두운 배경의 경고색이므로 대비 텍스트는 어둡게
    },
    info: {
      main: '#546e7a', // 잿빛 파란색 (정보 알림, 중립적/차분함)
      contrastText: '#ffffff',
    },
    success: {
      main: '#38703a', // 어두운 숲 녹색 (성공/긍정보다는 '위험 해제' 정도의 차분함)
      contrastText: '#e0e0e0',
    },
    background: {
      default: '#0a0a0a', // 거의 검은색에 가까운 아주 어두운 회색 (전체 배경)
      paper: '#1c1c1c',   // 컴포넌트 배경 (카드, 다이얼로그 등), default보다 약간 밝지만 어둡게
    },
    text: {
      primary: '#c5c5c5',   // 밝은 회색 (주요 텍스트, 완전한 흰색보다 부드러움)
      secondary: '#8e8e8e', // 중간 회색 (보조 텍스트, 설명 등)
      disabled: '#5e5e5e',  // 비활성화된 텍스트/컴포넌트
    }
  },
  typography: {
    fontFamily: [
          'Danjo',
        'Hahmlet',
      'Roboto',
      'Arial',
      'sans-serif'
    ].join(','),
    h1: { fontWeight: 700, fontSize: '2.75rem', color: '#d0d0d0' },
    h2: { fontWeight: 700, fontSize: '2.25rem', color: '#c8c8c8' },
    h3: { fontWeight: 700, fontSize: '1.75rem', color: '#c0c0c0' },
    h4: { fontWeight: 600, fontSize: '1.25rem', color: '#b8b8b8' },
    h5: { fontWeight: 600, fontSize: '1.1rem', color: '#b0b0b0' },
    h6: { fontWeight: 600, fontSize: '1rem', color: '#a8a8a8' },
    body1: {
      lineHeight: 1.6,
      color: '#c5c5c5', // 기본 텍스트 색상 명시
    },
    body2: {
      lineHeight: 1.5,
      color: '#8e8e8e', // 보조 본문 텍스트
    },
    button: { // 버튼 텍스트 스타일
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'none', // 버튼 텍스트 기본 대문자화 방지 (선호에 따라)
    },
    caption: { color: '#757575' },
    overline: { color: '#757575', letterSpacing: '0.1em' },
  },
  components: {
    // 모든 버튼 기반 컴포넌트에서 리플 효과를 기본적으로 비활성화
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.1s ease-out, border-color 0.1s ease-out, color 0.1s ease-out', // 부드러운 색상 전환 효과
          borderRadius: '4px', // 버튼 모서리 약간 둥글게 (선택 사항)
          '&:focus-visible': { // 키보드 등으로 포커스 시 명확한 아웃라인 (접근성)
            outline: `2px solid #6fc3df`, // 포커스 시 아웃라인 색상 (예시: 밝은 파랑, 테마에 맞게 조정 가능)
            outlineOffset: '2px',
          }
        },
        containedPrimary: {
          backgroundColor: '#a88b5a', // 기본 배경색 명시
          color: '#e0e0e0', // 기본 텍스트 색상 명시
          '&:hover': {
            backgroundColor: '#8a6f43', // 호버 시 약간 더 어두운 primary
          },
          '&:active': { // 클릭하고 있는 동안 (누르고 있는 상태)
            backgroundColor: '#705a30', // primary를 더 어둡게
          },
          '&:focus': { // 마우스 클릭 후에도 포커스가 남아있을 때의 스타일
            backgroundColor: '#a88b5a', // 클릭 후 포커스 시 다시 원래 primary.main 색상으로
          }
        },
        containedSecondary: {
          backgroundColor: '#4a6b7c',
          color: '#d0d0d0',
          '&:hover': {
            backgroundColor: '#37505d',
          },
          '&:active': {
            backgroundColor: '#2a3f4a',
          },
          '&:focus': {
            backgroundColor: '#4a6b7c',
          }
        },
        outlinedPrimary: {
          borderColor: '#a88b5a',
          color: '#a88b5a',
          '&:hover': {
            borderColor: '#8a6f43',
            backgroundColor: 'rgba(168, 139, 90, 0.08)', // 호버 시 약간의 배경색 변화
          },
          '&:active': {
            borderColor: '#705a30',
            backgroundColor: 'rgba(168, 139, 90, 0.16)',
          },
          '&:focus': {
            borderColor: '#a88b5a',
            backgroundColor: 'transparent',
          },
        },
        outlinedSecondary: { // secondary outlined 버튼 추가
          borderColor: '#4a6b7c',
          color: '#4a6b7c',
          '&:hover': {
            borderColor: '#37505d',
            backgroundColor: 'rgba(74, 107, 124, 0.08)',
          },
          '&:active': {
            borderColor: '#2a3f4a',
            backgroundColor: 'rgba(74, 107, 124, 0.16)',
          },
          '&:focus': {
            borderColor: '#4a6b7c',
            backgroundColor: 'transparent',
          },
        },
        textPrimary: {
          color: '#a88b5a',
          '&:hover': {
            backgroundColor: 'rgba(168, 139, 90, 0.08)',
          },
          '&:active': {
            backgroundColor: 'rgba(168, 139, 90, 0.16)',
          },
          '&:focus': {
            backgroundColor: 'transparent',
          },
        },
        textSecondary: { // secondary text 버튼 추가
          color: '#4a6b7c',
          '&:hover': {
            backgroundColor: 'rgba(74, 107, 124, 0.08)',
          },
          '&:active': {
            backgroundColor: 'rgba(74, 107, 124, 0.16)',
          },
          '&:focus': {
            backgroundColor: 'transparent',
          },
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // 다크모드에서 불필요한 paper 배경 이미지 제거 (필요시)
          border: `1px solid ${'#333333'}`, // 종이 컴포넌트에 희미한 테두리 (선택 사항, 색상 조정)
          padding: '16px', // Paper 컴포넌트에 기본 패딩 (선택 사항)
        }
      }
    },
    MuiAppBar: { // 예시: 앱바 스타일
      styleOverrides: {
        root: {
          backgroundColor: '#1c1c1c', // paper 색상과 유사하게 또는 더 어둡게
          backgroundImage: 'none',
          boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)', // 그림자 추가 (선택 사항)
        }
      }
    },
    MuiTooltip: { // 예시: 툴팁 스타일
        styleOverrides: {
            tooltip: {
                backgroundColor: '#2e2e2e', // 툴팁 배경색
                color: '#c5c5c5', // 툴팁 텍스트색
                border: '1px solid rgba(255, 255, 255, 0.12)',
            },
            arrow: {
                color: '#2e2e2e',
            }
        }
    },
    MuiAlert: { // 예시: Alert 컴포넌트 스타일
      styleOverrides: {
        root: { // 모든 Alert 공통
          borderRadius: '4px',
          borderWidth: '1px',
          borderStyle: 'solid',
        },
        standardError: { borderColor: '#c62828', backgroundColor: 'rgba(198, 40, 40, 0.1)' },
        standardWarning: { borderColor: '#b07d3a', backgroundColor: 'rgba(176, 125, 58, 0.1)' },
        standardInfo: { borderColor: '#546e7a', backgroundColor: 'rgba(84, 110, 122, 0.1)' },
        standardSuccess: { borderColor: '#38703a', backgroundColor: 'rgba(56, 112, 58, 0.1)' },
      }
    }
    // ... 다른 MUI 컴포넌트들에 대한 스타일 오버라이드 추가 가능 ...
  }
});

export default theme;