import { Box, Button } from '@mui/material';
import React from 'react';
import { useGameStore } from '../../store/characterStore';

interface HpSanityBarProps {
  type: 'hp' | 'sanity';
}

const HpSanityBar = ({ type }: HpSanityBarProps) => {
  const { selectedCharacter, changeCharacterHp, changeCharacterSanity } =
    useGameStore();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        ml: 1.5,
        mb: 0.5,
        position: 'relative',
      }}
    >
      <Box
        component="span"
        sx={{
          minWidth: { xs: 60, sm: 75 }, // Responsive min-width
          fontSize: '12px',
          color: 'white',
          mr: 1,
          ml: 2,
          fontFamily: 'monospace', // Ensures numbers have similar width
          whiteSpace: 'pre', // To respect spaces from padStart
          zIndex: 10,
        }}
      >
        {type === 'hp' ? 'HP' : 'SANITY'}:{' '}
        {String(
          type === 'hp'
            ? (selectedCharacter?.currentHP ?? 0)
            : (selectedCharacter?.currentSanity ?? 0)
        ).padStart(3, ' ')}
        /
        {String(
          type === 'hp'
            ? (selectedCharacter?.maxHP ?? 0)
            : (selectedCharacter?.maxSanity ?? 0)
        ).padStart(3, ' ')}
      </Box>
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          flexGrow: 1, // Allow bar to take available space if needed, or set fixed width
          maxWidth: '140px', // Max width for the bar
          width: '140px', // Try to fill available space up to maxWidth
          height: '18px',
          backgroundColor: 'grey.600', // A lighter background for the bar track
          borderRadius: '7px', // Pill shape
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'grey.400',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${
              type === 'hp'
                ? selectedCharacter?.maxHP && selectedCharacter.maxHP > 0
                  ? (selectedCharacter.currentHP / selectedCharacter.maxHP) *
                    100
                  : 0
                : selectedCharacter?.maxSanity &&
                    selectedCharacter.maxSanity > 0
                  ? (selectedCharacter.currentSanity /
                      selectedCharacter.maxSanity) *
                    100
                  : 0
            }%`,
            //               `${
            //   selectedCharacter &&
            //   selectedCharacter.maxHP &&
            //   selectedCharacter.maxHP > 0
            //     ? (Math.max(0, selectedCharacter.currentHP) /
            //         selectedCharacter.maxHP) *
            //       100
            //     : 0
            //               }%`
            backgroundColor: type === 'hp' ? 'red' : 'blue',
            transition: 'width 0.3s ease-in-out',
            // borderRadius: '7px', // Inner bar can also be rounded, or rely on parent's overflow:hidden
          }}
        />
      </Box>
    </Box>
  );
};

export default HpSanityBar;
