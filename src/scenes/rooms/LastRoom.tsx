import React from 'react';
import { useSceneStore } from '../../store/sceneStore';

const LastRoom: React.FC = () => {
  const { getNextSceneUrl } = useSceneStore();

  return (
    <div>
      <div>LastRoom</div>
    </div>
  );
};

export default LastRoom;
