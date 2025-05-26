import React from 'react';
import { useSceneStore } from '../../store/sceneStore';
import { usePageTransition } from '../../contexts/PageTransitionContext';
import { Box, Typography, Button } from '@mui/material';

const ExplorerRoom: React.FC = () => {
  const { getNextSceneUrl } = useSceneStore();
  const { startFadeOutToBlack } = usePageTransition();

  return (
    <Box
      sx={{
        width: '100%',
        height: '600px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <img
        style={{
          width: '100%',
          height: '600px',
          objectFit: 'cover',
        }}
        src="images/room.png"
        alt="manor"
      />
      <Typography
        sx={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          zIndex: 101,
          transform: 'translateX(-50%)',
        }}
        variant="h1"
      >
        ExplorerRoom
      </Typography>
      <Button
        sx={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          zIndex: 101,
          transform: 'translateX(-50%)',
        }}
        onClick={() => startFadeOutToBlack(getNextSceneUrl(), 1500)}
      >
        Next Scene
      </Button>
    </Box>
  );
};

export default ExplorerRoom;
