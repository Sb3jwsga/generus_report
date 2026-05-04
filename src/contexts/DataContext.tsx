import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchAllData } from '../services/apiService';
import { Santri, Rombel, Target, Laporan, Keterangan, LaporanKeterangan, Desa, Kelompok, Materi } from '../types';
import { withTimeout, clampedTask } from '../lib/utils';

interface DataContextType {
  santri: Santri[];
  rombel: Rombel[];
  targets: Target[];
  laporan: Laporan[];
  keterangan: Keterangan[];
  laporanKeterangan: LaporanKeterangan[];
  desa: Desa[];
  kelompok: Kelompok[];
  materi: Materi[];
  loading: boolean;
  refreshData: (silent?: boolean) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState({
    santri: [],
    rombel: [],
    targets: [],
    laporan: [],
    keterangan: [],
    laporanKeterangan: [],
    desa: [],
    kelompok: [],
    materi: [],
    loading: true
  });

  const loadData = async (silent: boolean = false) => {
    if (!silent) {
      setData(prev => ({ ...prev, loading: true }));
    }
    try {
      // Increased timeout to 30s for slow Apps Script environments
      const result = await clampedTask(fetchAllData(), 1500, 30000);
      if (result) {
        console.log("Data loaded successfully:", result);
        setData({
          santri: result.santri || [],
          rombel: result.rombel || [],
          targets: result.target || [],
          laporan: result.laporan || [],
          keterangan: result.keterangan || [],
          laporanKeterangan: result.laporan_keterangan || [],
          desa: result.desa || [],
          kelompok: result.kelompok || [],
          materi: result.materi || [],
          loading: false
        });
      } else {
        console.warn("fetchAllData returned null. Apps Script might be unreachable.");
        setData(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'TIMEOUT') {
        console.warn("Data fetching timed out after 30 seconds.");
      } else {
        console.error("Failed to load data:", error);
      }
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <DataContext.Provider value={{ ...data, refreshData: loadData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
