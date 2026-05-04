export interface Kelompok {
  id_kelompok: string;
  nama_kelompok: string;
  id_desa: string;
}

export interface Desa {
  id_desa: string;
  nama_desa: string;
}

export interface Rombel {
  id_rombel: string;
  nama_rombel: string;
}

export interface Materi {
  nama_materi: string;
  jenis_materi: string;
  id_rombel: string;
}

export interface Target {
  id_target: string;
  nama_target: string;
  angka_target: number;
  id_rombel: string;
  satuan: string;
}

export interface User {
  id_user: string;
  username: string;
  nama_user: string;
  role: 'admin' | 'pengurus';
  id_kelompok: string;
  id_desa: string;
}

export interface Santri {
  id_santri: string;
  nama_santri: string;
  tanggal_lahir: string;
  id_kelompok: string;
  id_rombel: string;
  id_desa: string;
  jenis_kelamin: 'L' | 'P';
}

export interface Laporan {
  id_laporan: string;
  tanggal_laporan: string;
  id_santri: string;
  id_target: string;
  id_laporanketerangan?: string;
  id_kelompok: string;
  id_desa: string;
  nama_santri: string;
  nama_target: string;
  pencapaian_target: number;
  angka_target: number;
  hadir: number;
  sakit: number;
  izin: number;
  alfa: number;
}

export interface Keterangan {
  id_keterangan: string;
  jenis_keterangan: string;
}

export interface LaporanKeterangan {
  id_laporanketerangan: string;
  id_santri: string;
  id_laporan: string;
  id_keterangan: string;
  catatan: string;
}
