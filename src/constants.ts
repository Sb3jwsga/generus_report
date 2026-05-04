import { Santri, Materi, Target, Laporan, Rombel, Desa, Kelompok, Keterangan, LaporanKeterangan, User } from './types';

export const MOCK_USERS: User[] = [
  {
    id_user: 'u1',
    username: 'admin',
    nama_user: 'Administrator',
    role: 'admin',
    id_kelompok: '',
    id_desa: ''
  },
  {
    id_user: 'u2',
    username: 'pengurus1',
    nama_user: 'Pengurus Kelompok 1',
    role: 'pengurus',
    id_kelompok: 'k1',
    id_desa: 'd1'
  }
];

export const MOCK_DESA: Desa[] = [
  { id_desa: 'd1', nama_desa: 'Pelaihari' },
  { id_desa: 'd2', nama_desa: 'Angsau' }
];

export const MOCK_KELOMPOK: Kelompok[] = [
  { id_kelompok: 'k1', nama_kelompok: 'Kelompok A', id_desa: 'd1' },
  { id_kelompok: 'k2', nama_kelompok: 'Kelompok B', id_desa: 'd1' }
];

export const MOCK_ROMBEL: Rombel[] = [
  { id_rombel: 'r1', nama_rombel: 'Ula 1' },
  { id_rombel: 'r2', nama_rombel: 'Ula 2' }
];

export const MOCK_SANTRI: Santri[] = [
  {
    id_santri: '1',
    nama_santri: 'Ahmad Fauzi',
    tanggal_lahir: '2012-05-10',
    id_kelompok: 'k1',
    id_rombel: 'r1',
    id_desa: 'd1',
    jenis_kelamin: 'L'
  },
  {
    id_santri: '2',
    nama_santri: 'Zaidan Al-Fatih',
    tanggal_lahir: '2013-02-15',
    id_kelompok: 'k1',
    id_rombel: 'r2',
    id_desa: 'd1',
    jenis_kelamin: 'L'
  }
];

export const MOCK_MATERI: Materi[] = [
  { nama_materi: 'An-Naba', jenis_materi: 'Tahfizh', id_rombel: 'r1' },
  { nama_materi: 'Fiqh Thaharah', jenis_materi: 'Diniyah', id_rombel: 'r1' },
  { nama_materi: 'Al-Mulk', jenis_materi: 'Tahfizh', id_rombel: 'r2' }
];

export const MOCK_TARGETS: Target[] = [
  { id_target: 't1', nama_target: 'Hafalan Baru', angka_target: 20, id_rombel: 'r1', satuan: 'Halaman' },
  { id_target: 't2', nama_target: 'Murojaah', angka_target: 50, id_rombel: 'r1', satuan: 'Baris' },
  { id_target: 't3', nama_target: 'Hafalan Baru', angka_target: 30, id_rombel: 'r2', satuan: 'Halaman' }
];

export const MOCK_LAPORAN: Laporan[] = [
  {
    id_laporan: 'lap1',
    tanggal_laporan: '2024-04-24',
    id_santri: '1',
    id_target: 't1',
    id_laporanketerangan: 'lk1',
    id_kelompok: 'k1',
    id_desa: 'd1',
    nama_santri: 'Ahmad Fauzi',
    nama_target: 'Hafalan Baru',
    pencapaian_target: 15,
    angka_target: 20,
    hadir: 1,
    sakit: 0,
    izin: 0,
    alfa: 0
  },
  {
    id_laporan: 'lap2',
    tanggal_laporan: '2024-04-24',
    id_santri: '1',
    id_target: 't2',
    id_laporanketerangan: '',
    id_kelompok: 'k1',
    id_desa: 'd1',
    nama_santri: 'Ahmad Fauzi',
    nama_target: 'Murojaah',
    pencapaian_target: 40,
    angka_target: 50,
    hadir: 1,
    sakit: 0,
    izin: 0,
    alfa: 0
  }
];

export const MOCK_KETERANGAN: Keterangan[] = [
  {
    id_keterangan: 'k1',
    jenis_keterangan: 'Tajwid'
  },
  {
    id_keterangan: 'k2',
    jenis_keterangan: 'Fashohah'
  },
  {
    id_keterangan: 'k3',
    jenis_keterangan: 'Kelancaran'
  }
];

export const MOCK_LAPORAN_KETERANGAN: LaporanKeterangan[] = [
  {
    id_laporanketerangan: 'lk1',
    id_santri: '1',
    id_laporan: 'lap1',
    id_keterangan: 'k1',
    catatan: 'Santri batuk pilek saat setoran'
  }
];
