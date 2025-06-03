import React from 'react';
import { Box, Typography } from '@mui/material';

const CharacterLoadingPlaceholder: React.FC = () => {
  return (
    <Box
      sx={{
        padding: 2,
        color: 'black',
        textAlign: 'center',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h5">캐릭터 정보를 로딩 중입니다...</Typography>
    </Box>
  );
};

export default CharacterLoadingPlaceholder;
