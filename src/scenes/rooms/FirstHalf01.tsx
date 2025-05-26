import React from 'react';
import { useSceneStore } from '../../store/sceneStore';
import { usePageTransition } from '../../contexts/PageTransitionContext';

const FirstHalf01: React.FC = () => {
  const { getNextSceneUrl } = useSceneStore();
  const { startFadeOutToBlack } = usePageTransition();

  return (
    <div>
      <div>FirstHalf01</div>
      <button onClick={() => startFadeOutToBlack(getNextSceneUrl(), 1500)}>
        Next Scene
      </button>
    </div>
  );
};

export default FirstHalf01;
