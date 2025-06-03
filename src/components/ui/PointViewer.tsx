import React from 'react';
import { Box, Typography } from '@mui/material';

interface PointViewerProps {
  title: string;
  currentPoints: number;
  maxPoints: number;
}

const PointViewer: React.FC<PointViewerProps> = ({
  title,
  currentPoints,
  maxPoints,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Typography variant="body2" color="white">
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5 }}>
        {Array.from({ length: maxPoints }).map((_, index) => (
          <Box
            key={index}
            className="point-viewer-point"
            sx={{
              width: 12,
              height: 12,
              border: '1px solid #fff',
              borderRadius: '50%',
              backgroundColor: index < currentPoints ? '#fff' : 'transparent',
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default PointViewer;
