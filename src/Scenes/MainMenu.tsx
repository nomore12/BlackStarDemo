import { Typography } from '@mui/material';
import React from 'react';

const MainMenu: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Typography variant="h1">검은 별 아래에서</Typography>

      {/* 여기에 메인 메뉴 내용 추가 */}
    </div>
  );
};

export default MainMenu;
