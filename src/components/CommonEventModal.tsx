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
import { useSnackbarStore } from '../store/uiStore'; // 스낵바 스토어 추가
import { CombinedGameAndSceneState } from '../types/RoomEventsType'; // CombinedGameAndSceneState는 유지
import {
  DialogSystemAction,
  DialogSystemStep,
} from '../types/DialogSystemTypes'; // 새로운 타입 임포트
import { ACTION_ID_NEXT } from '../constants/dialogConstants'; // ACTION_ID_NEXT 상수 임포트

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
  selectedActionIds?: Set<string>; // 추가된 prop
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
  selectedActionIds,
}) => {
  const characterState = useGameStore.getState().selectedCharacter;
  const gameStoreState = useGameStore.getState();
  const sceneStoreState = useSceneStore.getState();
  const showSnackbar = useSnackbarStore.getState().showSnackbar; // 스낵바 함수 가져오기

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

  const handleDialogClose = (event: object, reason: string) => {
    // 바깥쪽 클릭(backdropClick)으로 인한 닫힘 요청일 경우, 항상 닫히지 않도록 함
    if (reason === 'backdropClick') {
      return; // 아무것도 하지 않고 함수 종료
    }

    // 그 외의 이유로 닫힘이 요청된 경우 (예: Escape 키)
    // 부모로부터 전달받은 onClose 함수를 호출하여 다이얼로그를 닫음
    // (만약 Escape 키로도 닫히지 않게 하려면, 아래 if(onClose) { onClose(); } 부분을 주석 처리하거나
    // Dialog 컴포넌트에 disableEscapeKeyDown={true} 를 추가합니다.)
    if (onClose) {
      onClose();
    }
  };

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
      }, 15);

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
      onClose={handleDialogClose}
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
                maxHeight: '100px',
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
          {dialogActions
            .filter((action) => {
              // selectedActionIds에 포함되어 있고, isDialogEnd가 아니며, id가 's_next'가 아닌 액션은 필터링 (숨김)
              if (
                action.id &&
                selectedActionIds &&
                selectedActionIds.has(action.id) &&
                !action.isDialogEnd &&
                action.id !== ACTION_ID_NEXT // 's_next' ID 예외 처리 추가
              ) {
                return false;
              }
              return true;
            })
            .map((action, index) => {
              const isVisible = action.condition
                ? action.condition(characterState, combinedGameState)
                : true;

              if (!isVisible) {
                return null;
              }

              const requiredPoints = action.investigationPoints || 0;
              const currentPoints =
                characterState?.currentInvestigationPoints || 0;
              const canPerformAction = currentPoints >= requiredPoints;

              return (
                <Button
                  key={action.id || `action-${index}`}
                  variant="outlined"
                  onClick={() => {
                    if (isTyping) {
                      setDisplayedDescription(descriptionText);
                      setIsTyping(false);
                      return; // 타이핑 중에는 액션 처리 안 함
                    }

                    if (requiredPoints > 0 && !canPerformAction) {
                      showSnackbar(
                        `조사 포인트가 부족합니다. (필요: ${requiredPoints}, 현재: ${currentPoints})`,
                        'warning'
                      );
                      return;
                    }
                    onDialogActionSelect(action);
                  }}
                  fullWidth
                  color="inherit"
                  sx={{
                    borderColor: canPerformAction ? '#777' : '#555', // 포인트 부족 시 더 어둡게
                    opacity: canPerformAction ? 1 : 0.6, // 포인트 부족 시 투명도
                    '&:hover': {
                      borderColor: canPerformAction ? '#ccc' : '#555',
                    },
                    fontFamily: 'Hahmlet',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      textAlign: 'center',
                      marginRight: requiredPoints > 0 ? '8px' : '0px',
                    }}
                  >
                    {action.text}
                  </Box>
                  {requiredPoints > 0 && (
                    <Box
                      component="span"
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      ( {/* 여는 괄호 */}
                      {Array.from({ length: requiredPoints }).map((_, i) => (
                        <Box
                          key={i}
                          component="span"
                          sx={{
                            width: 12,
                            height: 12,
                            // 현재 포인트가 해당 원보다 많거나 같으면 채움, 아니면 테두리만
                            backgroundColor:
                              currentPoints >= i + 1
                                ? canPerformAction
                                  ? '#fff'
                                  : '#777'
                                : 'transparent',
                            border: `1px solid ${canPerformAction ? '#fff' : '#777'}`,
                            borderRadius: '50%',
                            marginLeft: '4px',
                            display: 'inline-block',
                            flexShrink: 0,
                          }}
                        />
                      ))}
                      ) {/* 닫는 괄호 */}
                    </Box>
                  )}
                </Button>
              );
            })}
          {/* 모든 액션이 숨겨졌거나 actions 배열이 비었을 때 기본 닫기 버튼 (기존 로직과 유사하게) */}
          {dialogActions.filter((act) => {
            // 여기 필터링도 selectedActionIds 및 's_next'를 고려해야 함
            if (
              act.id &&
              selectedActionIds &&
              selectedActionIds.has(act.id) &&
              !act.isDialogEnd &&
              act.id !== ACTION_ID_NEXT // 's_next' ID 예외 처리 추가
            ) {
              return false;
            }
            const isActVisible = act.condition
              ? act.condition(characterState, combinedGameState)
              : true;
            return isActVisible; // 이 필터는 visibility만 체크
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
