// components/CommonEventModal.tsx
import React from 'react';
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
import {
  ModalContent,
  ModalAction,
  RoomOutcome,
  RoomData,
} from '../types/RoomEventsType'; // 타입 임포트
import { CharacterState } from '../store/characterStore';
import {
  useGameStore,
  GameState as OverallGameStatePlusDoom,
} from '../store/characterStore';
import { useSceneStore, SceneStoreState } from '../store/sceneStore';

type CombinedGameAndSceneState = OverallGameStatePlusDoom & SceneStoreState;

interface CommonEventModalProps {
  open: boolean;
  onClose: () => void;
  content: ModalContent | null;
  onProcessOutcomes: (outcomes: RoomOutcome | RoomOutcome[]) => void;
}

const CommonEventModal: React.FC<CommonEventModalProps> = ({
  open,
  onClose,
  content,
  onProcessOutcomes,
}) => {
  const characterState = useGameStore.getState().selectedCharacter;
  const gameStoreState = useGameStore.getState();
  const sceneStoreState = useSceneStore.getState();

  if (!content) {
    // content가 없으면 렌더링 안 함
    return null;
  }

  const combinedGameState: CombinedGameAndSceneState = {
    ...gameStoreState,
    ...sceneStoreState,
  };

  const getDescriptionText = (): string => {
    if (typeof content.description === 'function') {
      if (!characterState) return '캐릭터 정보를 불러올 수 없습니다.'; // 방어 코드
      return content.description(characterState, combinedGameState);
    }
    return content.description;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { backgroundColor: '#1e1e1e', color: '#c0c0c0' } }}
    >
      <DialogTitle
        sx={{
          fontFamily: 'Danjo',
          color: '#e0e0e0',
          borderBottom: '1px solid #444',
        }}
      >
        {content.title}
      </DialogTitle>
      <DialogContent sx={{ paddingTop: '20px !important' }}>
        {content.imagePath && (
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <img
              src={content.imagePath}
              alt={content.title}
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
          }}
        >
          {getDescriptionText()
            .split('\n')
            .map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid #444', padding: '12px 24px' }}>
        <Stack sx={{ width: '100%', gap: 1 }}>
          {content.actions.map((action: ModalAction) => {
            // action 타입을 명시적으로 ModalAction
            // characterState가 null일 경우 버튼 조건/텍스트 함수 실행 불가
            if (!characterState) return null;

            const isActionVisible = action.condition
              ? action.condition(characterState, combinedGameState)
              : true;

            if (!isActionVisible) {
              return null;
            }

            let buttonTextContent: string;
            if (typeof action.buttonText === 'function') {
              buttonTextContent = action.buttonText(
                characterState,
                combinedGameState
              );
            } else {
              buttonTextContent = action.buttonText; // string 타입으로 이미 보장됨
            }

            return (
              <Button
                key={action.id}
                variant="outlined"
                onClick={() => {
                  onProcessOutcomes(action.outcome);
                }}
                fullWidth
                color="inherit"
                sx={{ borderColor: '#777', '&:hover': { borderColor: '#ccc' } }}
              >
                {buttonTextContent}
              </Button>
            );
          })}
          {/* 모든 액션이 숨겨졌거나 actions 배열이 비었을 때 기본 닫기 버튼 */}
          {characterState &&
            content.actions.filter((act) => {
              return act.condition
                ? act.condition(characterState, combinedGameState)
                : true;
            }).length === 0 && (
              <Button onClick={onClose} variant="contained" fullWidth>
                확인
              </Button>
            )}
          {/* content.actions가 아예 없을 때를 위한 닫기 버튼 (선택적) */}
          {!content.actions && (
            <Button onClick={onClose} variant="contained" fullWidth>
              확인
            </Button>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default CommonEventModal;
