import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loadData, saveData, AppData, defaultData, UserProfile } from '@/utils/storage';

interface DataContextType {
  data: AppData;
  setData: (data: AppData) => Promise<void>;
  updateData: (updater: (data: AppData) => AppData) => Promise<void>;
  loading: boolean;
}

const DataContext = createContext<DataContextType>({
  data: defaultData,
  setData: async () => {},
  updateData: async () => {},
  loading: true,
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataState] = useState<AppData>(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData().then((loaded) => {
      setDataState(loaded);
      setLoading(false);
    });
  }, []);

  const setData = useCallback(async (newData: AppData) => {
    setDataState(newData);
    await saveData(newData);
  }, []);

  const updateData = useCallback(async (updater: (data: AppData) => AppData) => {
    setDataState((prev) => {
      const updated = updater(prev);
      saveData(updated);
      return updated;
    });
  }, []);

  return (
    <DataContext.Provider value={{ data, setData, updateData, loading }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
