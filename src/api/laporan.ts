import { supabase } from './supabase';
import type { LaporanBulanan, DetailLaporanBulanan, LaporanRaport, DetailRaport } from '../types';

const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

export const laporanBulanan = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('laporan_bulanan')
      .select(`*, generus!laporan_bulanan_id_santri_fkey (id_generus, nama_generus, jenis_kelamin, tanggal_lahir)`);
    if (error) throw error;
    return data || [];
  },
  create: async (data: Omit<LaporanBulanan, 'id_laporan'>) => {
    const { data: result, error } = await supabase
      .from('laporan_bulanan')
      .insert({ ...data, id_laporan: generateId() })
      .select();
    if (error) throw error;
    return result[0];
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('laporan_bulanan').delete().eq('id_laporan', id);
    if (error) throw error;
  },
};

export const detailLaporanBulanan = {
  getByLaporan: async (id_laporan: string) => {
    const { data, error } = await supabase
      .from('detail_laporan_bulanan')
      .select(`*, target_bulanan!detail_laporan_bulanan_id_target_fkey (id_target_bulan, nama_target, jumlah_target, satuan_target, bulan_target)`)
      .eq('id_laporan', id_laporan);
    if (error) throw error;
    return data || [];
  },
  create: async (data: Omit<DetailLaporanBulanan, 'id_detail'>) => {
    const { data: result, error } = await supabase
      .from('detail_laporan_bulanan')
      .insert({ ...data, id_detail: generateId() })
      .select();
    if (error) throw error;
    return result[0];
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('detail_laporan_bulanan').delete().eq('id_detail', id);
    if (error) throw error;
  },
};

export const laporanRaport = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('laporan_raport')
      .select(`*, generus!laporan_raport_id_santri_fkey (id_generus, nama_generus, jenis_kelamin)`);
    if (error) throw error;
    return data || [];
  },
  create: async (data: Omit<LaporanRaport, 'id_laporan_raport'>) => {
    const { data: result, error } = await supabase
      .from('laporan_raport')
      .insert({ ...data, id_laporan_raport: generateId() })
      .select();
    if (error) throw error;
    return result[0];
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('laporan_raport').delete().eq('id_laporan_raport', id);
    if (error) throw error;
  },
};

export const detailRaport = {
  getByLaporan: async (id_laporan_raport: string) => {
    const { data, error } = await supabase
      .from('detail_raport')
      .select(`*, target_raport!detail_raport_id_target_fkey (id_target_raport, nama_target, jumlah_target, satuan_target, semester)`)
      .eq('id_laporan_raport', id_laporan_raport);
    if (error) throw error;
    return data || [];
  },
  create: async (data: Omit<DetailRaport, 'id_detail_raport'>) => {
    const { data: result, error } = await supabase
      .from('detail_raport')
      .insert({ ...data, id_detail_raport: generateId() })
      .select();
    if (error) throw error;
    return result[0];
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('detail_raport').delete().eq('id_detail_raport', id);
    if (error) throw error;
  },
};