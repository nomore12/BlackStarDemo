import React, { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';

const CharacterSelect: React.FC = () => {
  const [openInfoModal, setOpenInfoModal] = useState(false);

  return (
    <div>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Box
          sx={{
            width: 240,
            padding: 2,
            border: '1px solid white',
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <Button sx={{ width: 240, height: 320 }}>
              <img
                src="images/character_01.png"
                alt="학자"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </Button>
          </Box>
          <Alert severity="info" icon={false}>
            이름: 엘리어트 웨이트
            <br />
            직업: 풋내기 학자
            <br />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="text"
                color="inherit"
                onClick={() => {
                  setOpenInfoModal(true);
                }}
              >
                <Typography variant="caption">더 많은 정보</Typography>
              </Button>
            </Box>
            <Dialog
              open={openInfoModal}
              onClose={() => setOpenInfoModal(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>캐릭터 정보</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  <p>
                    &quot;지식에 대한 갈증은 때로는 가장 위험한 문을 열게
                    한다.&quot;
                  </p>
                  <p>
                    미스카토닉 대학의 젊은 학자로, 금단의 지식에 매료되어 실종된
                    선배의 연구 기록을 따라 외딴 저택으로 향합니다. 그곳에서
                    그의 이성은 불가해한 현상들 앞에 시험받게 됩니다.
                  </p>
                  <p style={{ marginTop: '16px', fontWeight: 'bold' }}>
                    주요 기술:
                  </p>
                  <ul
                    style={{
                      paddingLeft: '20px',
                      marginTop: '8px',
                      marginBottom: 0,
                    }}
                  >
                    <li>
                      <strong>분석적 사고:</strong> 단서와 문헌을 통해
                      논리적으로 추론합니다.
                    </li>
                    <li>
                      <strong>미약한 &apos;광기의 공감각&apos;:</strong> 금지된
                      지식의 영향으로 현실 너머의 존재를 어렴풋이 감지합니다.
                    </li>
                    <li>
                      <strong>초기 학문 지식:</strong> 일부 고대 상징 및 오컬트
                      지식을 알고 있습니다.
                    </li>
                  </ul>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenInfoModal(false)}>닫기</Button>
              </DialogActions>
            </Dialog>
          </Alert>
        </Box>
        <Box
          sx={{
            width: 240,
            padding: 2,
            border: '1px solid white',
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <Button sx={{ width: 240, height: 320 }}>
              <img
                src="images/character_02.png"
                alt="추적자"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </Button>
          </Box>

          <Alert severity="info" icon={false}>
            이름: 애비게일 홀로웨이
            <br />
            직업: 절박한 탐사자
            <br />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="text"
                color="inherit"
                onClick={() => {
                  setOpenInfoModal(true);
                }}
              >
                <Typography variant="caption">더 많은 정보</Typography>
              </Button>
            </Box>
            <Dialog
              open={openInfoModal}
              onClose={() => setOpenInfoModal(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>캐릭터 정보</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  <p>
                    &quot;어둠 속에 묻힌 진실보다 더 깊은 것은, 잃어버린 이에
                    대한 그리움이다.&quot;
                  </p>
                  <p>
                    몇 년 전, 폭풍우 치던 밤 외딴 저택에서 실종된 여동생을 잊지
                    못하고 깊은 상실감과 죄책감에 시달리는 인물입니다. 익명의
                    편지를 받고 마지막 희망을 품은 채, 홀로 폐허가 된 저택으로
                    향합니다.
                  </p>
                  <p style={{ marginTop: '16px', fontWeight: 'bold' }}>
                    주요 기술:
                  </p>
                  <ul
                    style={{
                      paddingLeft: '20px',
                      marginTop: '8px',
                      marginBottom: 0,
                    }}
                  >
                    <li>
                      <strong>강인한 의지:</strong> 절박한 상황에서도 쉽게
                      포기하지 않으며, 특정 위협에 일시적인 저항력을 보입니다.
                    </li>
                    <li>
                      <strong>직감적 &apos;광기의 공감각&apos;:</strong> 실종된
                      가족의 유품이나 특정 장소에서 강한 감정적 동요와 함께
                      보이지 않는 존재나 과거의 잔상을 느낍니다.
                    </li>
                    <li>
                      <strong>생존 본능:</strong> 위험한 상황에서 본능적으로
                      대처하거나 숨겨진 통로를 발견하는 데 재능을 보입니다.
                    </li>
                  </ul>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenInfoModal(false)}>닫기</Button>
              </DialogActions>
            </Dialog>
          </Alert>
        </Box>
      </Box>
    </div>
  );
};

export default CharacterSelect;
