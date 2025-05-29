// components/CommonEventModal.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Stack,
  Box,
  Typography,
} from '@mui/material';
import { CharacterState, useGameStore } from '../store/characterStore';
import { useSceneStore, SceneStoreState } from '../store/sceneStore';
import { CombinedGameAndSceneState } from '../types/RoomEventsType'; // CombinedGameAndSceneState는 유지
import {
  DialogSystemAction,
  DialogSystemStep,
} from '../types/DialogSystemTypes'; // 새로운 타입 임포트

interface CommonEventModalProps {
  open: boolean;
  onClose: () => void;
  // content: ModalContent | null; // 기존 content prop 제거
  // onProcessOutcomes: (outcomes: RoomOutcome | RoomOutcome[]) => void; // 기존 onProcessOutcomes prop 제거
  title?: string; // DialogSystemStep의 title (optional)
  description:
    | string
    | ((
        characterState: CharacterState | null,
        gameState: CombinedGameAndSceneState | null
      ) => string);
  imagePath?: string; // DialogSystemStep의 imagePath (optional)
  dialogActions: DialogSystemAction[]; // 새로운 actions prop
  onDialogActionSelect: (action: DialogSystemAction) => void; // 새로운 action select 핸들러
  // goBackStep?: () => void; // (선택적) 뒤로가기 버튼용 콜백
}

const CommonEventModal: React.FC<CommonEventModalProps> = ({
  open,
  onClose,
  title,
  description,
  imagePath,
  dialogActions,
  onDialogActionSelect,
  // goBackStep,
}) => {
  const characterState = useGameStore.getState().selectedCharacter;
  const gameStoreState = useGameStore.getState();
  const sceneStoreState = useSceneStore.getState();

  const [displayedDescription, setDisplayedDescription] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const combinedGameState: CombinedGameAndSceneState | null = characterState
    ? { ...gameStoreState, ...sceneStoreState }
    : null;

  const descriptionText = useMemo(() => {
    if (typeof description === 'function') {
      return description(characterState, combinedGameState);
    }
    return description;
  }, [description, characterState, combinedGameState]);

  useEffect(() => {
    // descriptionText가 유효한 문자열이고, open 상태일 때만 실행
    if (open && descriptionText && descriptionText.trim() !== '') {
      setDisplayedDescription('');
      setIsTyping(true);
      let charIndex = 0;
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      typingIntervalRef.current = setInterval(() => {
        if (charIndex < descriptionText.length) {
          const charToAdd = descriptionText.charAt(charIndex);
          setDisplayedDescription((prev) => prev + charToAdd);
          charIndex++;
        } else {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          setIsTyping(false);
        }
      }, 30);

      return () => {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        setIsTyping(false);
      };
    } else {
      // open이 false이거나 descriptionText가 유효하지 않은 경우
      console.log(
        '[CommonEventModal] Effect SKIP. Open:',
        open,
        'Text available:',
        !!(descriptionText && descriptionText.trim() !== '')
      );
    }
  }, [open, descriptionText]);

  // title이 없거나 비어있으면 렌더링하지 않음 (또는 기본값 설정)
  // if (!title && !getDescriptionText()) {
  //   return null; // 내용이 아예 없으면 모달을 띄우지 않을 수 있음 (정책에 따라)
  // }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { backgroundColor: '#1e1e1e', color: '#c0c0c0' } }}
    >
      {title && (
        <DialogTitle
          sx={{
            fontFamily: 'Danjo',
            color: '#e0e0e0',
            borderBottom: '1px solid #444',
          }}
        >
          {title}
        </DialogTitle>
      )}
      <DialogContent
        onClick={() => {
          if (isTyping && descriptionText) {
            if (typingIntervalRef.current) {
              clearInterval(typingIntervalRef.current);
              typingIntervalRef.current = null;
            }
            setDisplayedDescription(descriptionText);
            setIsTyping(false);
          }
        }}
        sx={{ paddingTop: title ? '20px !important' : '30px !important' }}
      >
        {' '}
        {/* title 유무에 따라 패딩 조정 */}
        {imagePath && (
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <img
              src={imagePath}
              alt={title || 'dialog-image'}
              style={{
                maxHeight: '200px',
                maxWidth: '100%',
                borderRadius: '4px',
              }}
            />
          </Box>
        )}
        <Typography
          component="div"
          sx={{
            fontFamily: 'Hahmlet',
            lineHeight: 1.7,
            whiteSpace: 'pre-line',
            color: '#e0e0e0', // 본문 텍스트 색상 명시 (기존 스타일 유지 시)
          }}
        >
          {displayedDescription.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid #444', padding: '12px 24px' }}>
        <Stack sx={{ width: '100%', gap: 1 }}>
          {dialogActions.map((action, index) => {
            const isVisible = action.condition
              ? action.condition(characterState, combinedGameState)
              : true;

            if (!isVisible) {
              return null;
            }

            return (
              <Button
                key={action.id || `action-${index}`}
                variant="outlined"
                onClick={() => {
                  if (isTyping) {
                    setDisplayedDescription(descriptionText);
                    setIsTyping(false);
                  } else {
                    onDialogActionSelect(action);
                  }
                }}
                fullWidth
                color="inherit"
                sx={{
                  borderColor: '#777',
                  '&:hover': { borderColor: '#ccc' },
                  fontFamily: 'Hahmlet',
                }} // 글꼴 일관성
              >
                {action.text}
              </Button>
            );
          })}
          {/* 모든 액션이 숨겨졌거나 actions 배열이 비었을 때 기본 닫기 버튼 (기존 로직과 유사하게) */}
          {dialogActions.filter((act) => {
            return act.condition
              ? act.condition(characterState, combinedGameState)
              : true;
          }).length === 0 && (
            <Button
              onClick={onClose}
              variant="contained"
              fullWidth
              sx={{ fontFamily: 'Hahmlet' }}
            >
              확인
            </Button>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default CommonEventModal;
