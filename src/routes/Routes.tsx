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
  ScholarRoom,
  ExplorerRoom,
  LastRoom,
  SecondHalf01,
  SecondHalf02,
  SecondHalf03,
  SecondHalf04,
  SecondHalf05,
  SecondHalf06,
  SecondHalf07,
  SecondHalf08,
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
      <Route path="/scholar-specific-room" element={<ScholarRoom />} />
      <Route path="/explorer-specific-room" element={<ExplorerRoom />} />
      <Route path="/last-stage-room" element={<LastRoom />} />
      <Route path="/second-half-01" element={<SecondHalf01 />} />
      <Route path="/second-half-02" element={<SecondHalf02 />} />
      <Route path="/second-half-03" element={<SecondHalf03 />} />
      <Route path="/second-half-04" element={<SecondHalf04 />} />
      <Route path="/second-half-05" element={<SecondHalf05 />} />
      <Route path="/second-half-06" element={<SecondHalf06 />} />
      <Route path="/second-half-07" element={<SecondHalf07 />} />
      <Route path="/second-half-08" element={<SecondHalf08 />} />
      {/* 필요에 따라 다른 라우트들을 여기에 추가합니다. */}
      {/* 예: <Route path="/gameplay" element={<GamePlayScene />} /> */}
      {/* 예: <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
};

export default AppRoutes;
