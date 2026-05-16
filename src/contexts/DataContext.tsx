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
  error: string | null;
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
    loading: true,
    error: null as string | null
  });

  const loadData = async (silent: boolean = false) => {
    if (!silent) {
      setData(prev => ({ ...prev, loading: true, error: null }));
    }
    try {
      // Reduced minMs to 500ms for faster feel, kept 45s max for slow Apps Script
      const result = await clampedTask(fetchAllData(), 500, 45000);
      if (result && result.status === 'success') {
        console.log("Data loaded successfully:", result);
        
        // Helper to deduplicate items by a key
        const uniqueById = <T,>(arr: T[], idKey: keyof T): T[] => {
          if (!arr) return [];
          const seen = new Set();
          return arr.filter(item => {
            const id = item[idKey];
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
          });
        };

        setData({
          santri: uniqueById(result.santri || [], 'id_santri'),
          rombel: uniqueById(result.rombel || [], 'id_rombel'),
          targets: result.target || [], // Target depends on rombel+targetName, might need careful deduplication if needed but usually okay
          laporan: result.laporan || [],
          keterangan: uniqueById(result.keterangan || [], 'id_keterangan'),
          laporanKeterangan: result.laporan_keterangan || [],
          desa: uniqueById(result.desa || [], 'id_desa'),
          kelompok: uniqueById(result.kelompok || [], 'id_kelompok'),
          materi: uniqueById(result.materi || [], 'id_materi'),
          loading: false,
          error: null
        });
      } else {
        const errorMsg = result?.message || "Apps Script returned an unsuccessful status or is unreachable.";
        console.warn("fetchAllData failed:", errorMsg);
        setData(prev => ({ 
          ...prev, 
          loading: false, 
          error: errorMsg 
        }));
      }
    } catch (error) {
      let message = "Gagal memuat data dari database.";
      if (error instanceof Error) {
        if (error.message === 'TIMEOUT') {
          message = "Koneksi ke database terlalu lama (Timeout). Pastikan Apps Script sudah di-deploy dengan benar.";
        } else {
          message = `Error: ${error.message}`;
        }
      }
      console.error("Failed to load data:", error);
      setData(prev => ({ ...prev, loading: false, error: message }));
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
