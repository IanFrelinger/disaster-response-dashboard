import { useState } from 'react';

export const useMap = () => {
  const [map, setMap] = useState<any>(null);
  
  return {
    map,
    setMap,
  };
};
