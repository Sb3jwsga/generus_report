export const BULAN_LIST = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export const SEMESTER_LIST = ['Ganjil', 'Genap'];

export const TAHUN_AJARAN_LIST = ['2023', '2024', '2025', '2026', '2027', '2028'];

export const EXPORT_DATE_FORMAT = new Intl.DateTimeFormat('id-ID', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export const getBulanSekarang = () => {
  const now = new Date();
  const bulan = now.getMonth() + 1;
  const tahun = now.getFullYear();
  return `${BULAN_LIST[bulan - 1]} ${tahun}`;
};

export interface SemesterRangeConfig {
  id_config?: string;
  tahun_ajaran: string;
  ganjil_bulan_awal: number; // 1-12
  ganjil_bulan_akhir: number; // 1-12
  genap_bulan_awal: number; // 1-12
  genap_bulan_akhir: number; // 1-12
}

export const DEFAULT_SEMESTER_CONFIG: SemesterRangeConfig = {
  tahun_ajaran: new Date().getFullYear().toString(),
  ganjil_bulan_awal: 1, // Januari
  ganjil_bulan_akhir: 6, // Juni
  genap_bulan_awal: 7, // Juli
  genap_bulan_akhir: 12, // Desember
};

export const getCurrentSemester = () => {
  const bulan = new Date().getMonth() + 1;
  if (bulan <= 6) {
    return 'Ganjil';
  }
  return 'Genap';
};

export const getCurrentTahunAjaran = () => {
  return new Date().getFullYear().toString();
};
