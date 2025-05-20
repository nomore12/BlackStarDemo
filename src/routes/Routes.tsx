import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainMenu from '../Scenes/MainMenu';
import CharacterSelect from '../Scenes/CharacterSelect';
import UiTest from '../Scenes/UiTest';
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route path="/character-select" element={<CharacterSelect />} />
      <Route path="/ui-test" element={<UiTest />} />
      {/* 필요에 따라 다른 라우트들을 여기에 추가합니다. */}
      {/* 예: <Route path="/gameplay" element={<GamePlayScene />} /> */}
      {/* 예: <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
};

export default AppRoutes;
