import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainMenu from '../scenes/MainMenu';
import CharacterSelect from '../scenes/CharacterSelect';
import UiTest from '../scenes/UiTest';
import {
  FirstHalf01,
  FirstHalf02,
  FirstHalf03,
  FirstHalf04,
  FirstHalf05,
  FirstHalf06,
  FirstHalf07,
  FirstHalf08,
} from '../scenes/rooms/index';
import IntroductionScene from '../scenes/IntroductionScene';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route path="/character-select" element={<CharacterSelect />} />
      <Route path="/introduction" element={<IntroductionScene />} />
      <Route path="/ui-test" element={<UiTest />} />
      <Route path="/first-half-01" element={<FirstHalf01 />} />
      <Route path="/first-half-02" element={<FirstHalf02 />} />
      <Route path="/first-half-03" element={<FirstHalf03 />} />
      <Route path="/first-half-04" element={<FirstHalf04 />} />
      <Route path="/first-half-05" element={<FirstHalf05 />} />
      <Route path="/first-half-06" element={<FirstHalf06 />} />
      <Route path="/first-half-07" element={<FirstHalf07 />} />
      <Route path="/first-half-08" element={<FirstHalf08 />} />
      {/* 필요에 따라 다른 라우트들을 여기에 추가합니다. */}
      {/* 예: <Route path="/gameplay" element={<GamePlayScene />} /> */}
      {/* 예: <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
};

export default AppRoutes;
