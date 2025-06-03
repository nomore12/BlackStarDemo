import { Box, Stack } from '@mui/material';
import React from 'react';
import { useGameStore } from '../../store/characterStore';
import HpSanityBar from './HpSanityBar';
import PointViewer from './PointViewer';

const CharacterInfo = () => {
  const { selectedCharacter } = useGameStore();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        gap: 1,
      }}
    >
      {/* profile image */}
      <Box
        sx={{
          width: '48px',
          height: '48px',
          backgroundColor: 'white',
          borderRadius: '50%',
          border: '1px solid black',
          overflow: 'hidden', // 이미지가 Box 경계를 넘어가지 않도록 마스크 처리
          display: 'flex', // 내부 이미지 정렬을 위해 flex 사용
          alignItems: 'center', // 수직 중앙 정렬
          justifyContent: 'center', // 수평 중앙 정렬
        }}
      >
        <img
          style={{
            width: '90%', // Box 크기의 90%로 이미지 크기 설정
            height: '90%', // Box 크기의 90%로 이미지 크기 설정
            objectFit: 'contain', // 이미지 비율을 유지하면서 요소에 맞춤
          }}
          src={
            selectedCharacter?.id === 'scholar'
              ? 'images/profile01.png'
              : selectedCharacter?.id === 'explorer'
                ? 'images/profile02.png'
                : undefined
          }
          alt="profile"
        />
      </Box>
      <Stack>
        <HpSanityBar type="hp" />
        <HpSanityBar type="sanity" />
      </Stack>
      <Stack sx={{ ml: 2 }}>
        <PointViewer
          title="조사 포인트"
          currentPoints={selectedCharacter?.currentInvestigationPoints || 0}
          maxPoints={selectedCharacter?.maxInvestigationPoints || 0}
        />
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
          <PointViewer
            title="AP"
            currentPoints={selectedCharacter?.currentActionPoints || 0}
            maxPoints={selectedCharacter?.maxActionPoints || 0}
          />
          <PointViewer
            title="RP"
            currentPoints={selectedCharacter?.currentReactionPoints || 0}
            maxPoints={selectedCharacter?.maxReactionPoints || 0}
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default CharacterInfo;
