import { useState } from 'react';

export const useDataFusion = () => {
  const [dataFusion] = useState<any>(null);
  
  return {
    dataFusion,
  };
};
