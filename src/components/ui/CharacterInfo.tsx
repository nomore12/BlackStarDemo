import { Box, Stack } from '@mui/material';
import React from 'react';
import { useGameStore } from '../../store/characterStore';
import HpSanityBar from './HpSanityBar';

const CharacterInfo = () => {
  const { selectedCharacter } = useGameStore();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
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
      <Box sx={{ ml: 2 }}>Inventory</Box>
    </Box>
  );
};

export default CharacterInfo;
