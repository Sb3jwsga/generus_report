export interface Desa {
  id_desa: string;
  nama_desa: string;
}

export interface Kelompok {
  id_kelompok: string;
  nama_kelompok: string;
  id_desa: string | null;
}

export interface Rombel {
  id_rombel: string;
  nama_rombel: string;
}

export interface User {
  id_user: string;
  nama_user: string;
  username: string;
  password: string;
  role: 'Admin' | 'Pengurus';
  id_kelompok: string | null;
}

export interface Generus {
  id_generus: string;
  nama_generus: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  tanggal_lahir: string;
  id_kelompok: string | null;
  id_rombel: string | null;
}

export interface CategoryCatatan {
  id_category: string;
  nama_category: string;
}

export interface Catatan {
  id_catatan: string;
  id_category: string | null;
  catatan: string;
}

export interface TargetBulanan {
  id_target_bulan: string;
  nama_target: string;
  jumlah_target: number;
  satuan_target: string;
  bulan_target: string;
  id_rombel: string | null;
}

export interface LaporanBulanan {
  id_laporan: string;
  tanggal_laporan: string;
  id_santri: string;
  id_catatan: string | null;
  jumlah_hadir: number | null;
  jumlah_izin: number | null;
  jumlah_sakit: number | null;
  jumlah_alfa: number | null;
}

export interface DetailLaporanBulanan {
  id_detail: string;
  id_laporan: string;
  id_target: string;
  jumlah_capaian: number;
}

export interface CatatanRaport {
  id_catatan_raport: string;
  catatan_raport: string;
}

export interface TargetRaport {
  id_target_raport: string;
  nama_target: string;
  id_rombel: string | null;
  semester: string;
  jumlah_target: number;
  satuan_target: string;
}

export interface LaporanRaport {
  id_laporan_raport: string;
  id_santri: string;
  id_catatan_raport: string | null;
  semester: string;
  tahun_ajaran: string;
}

export interface DetailRaport {
  id_detail_raport: string;
  id_laporan_raport: string;
  id_target: string;
  nilai_raport: number;
}

export interface Materi {
  id_materi: string;
  nama_materi: string;
  kategori_materi: string;
  id_rombel: string | null;
}

export interface SemesterConfig {
  id_config: string;
  tahun_ajaran: string;
  ganjil_bulan_awal: number;
  ganjil_bulan_akhir: number;
  genap_bulan_awal: number;
  genap_bulan_akhir: number;
}
