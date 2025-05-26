import React from 'react';
import { useSceneStore } from '../../store/sceneStore';
import { usePageTransition } from '../../contexts/PageTransitionContext';

const ExplorerRoom = () => {
  const { getNextSceneUrl } = useSceneStore();
  const { startFadeOutToBlack } = usePageTransition();

  return (
    <div>
      <div>ExplorerRoom</div>
      <button onClick={() => startFadeOutToBlack(getNextSceneUrl(), 1500)}>
        Next Scene
      </button>
    </div>
  );
};

export default ExplorerRoom;
