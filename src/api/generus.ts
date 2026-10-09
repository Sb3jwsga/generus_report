import { supabase } from './supabase';
import type { Desa, Kelompok, Rombel, User, Generus, CategoryCatatan, TargetBulanan, TargetRaport, Materi } from '../types';

const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

const insertData = async (table: string, data: any) => {
  const { data: result, error } = await supabase.from(table).insert(data).select();
  if (error) throw error;
  return result[0];
};

const getAllData = async (table: string) => {
  const { data, error } = await supabase.from(table).select('*');
  if (error) throw error;
  return data || [];
};

const getDataFiltered = async (table: string, filter: string, value: any) => {
  const { data, error } = await supabase.from(table).select('*').eq(filter, value);
  if (error) throw error;
  return data || [];
};

const updateData = async (table: string, id: string, data: any) => {
  const { data: result, error } = await supabase.from(table).update(data).eq('id', id).select();
  if (error) throw error;
  return result[0];
};

const deleteData = async (table: string, id: string) => {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
};

export const desa = {
  getAll: () => getAllData('desa'),
  create: (data: Omit<Desa, 'id_desa'>) => insertData('desa', { ...data, id_desa: generateId() }),
  update: (id: string, data: Partial<Desa>) => updateData('desa', id, data),
  delete: (id: string) => deleteData('desa', id),
};

export const kelompok = {
  getAll: () => getAllData('kelompok'),
  create: (data: Omit<Kelompok, 'id_kelompok'>) => insertData('kelompok', { ...data, id_kelompok: generateId() }),
  update: (id: string, data: Partial<Kelompok>) => updateData('kelompok', id, data),
  delete: (id: string) => deleteData('kelompok', id),
};

export const rombel = {
  getAll: () => getAllData('rombel'),
  create: (data: Omit<Rombel, 'id_rombel'>) => insertData('rombel', { ...data, id_rombel: generateId() }),
  update: (id: string, data: Partial<Rombel>) => updateData('rombel', id, data),
  delete: (id: string) => deleteData('rombel', id),
};

export const user = {
  getAll: () => getAllData('user'),
  create: (data: Omit<User, 'id_user'>) => insertData('user', { ...data, id_user: generateId() }),
  update: (id: string, data: Partial<User>) => updateData('user', id, data),
  delete: (id: string) => deleteData('user', id),
};

export const generusData = {
  getAll: () => getAllData('generus'),
  getAllByKelompok: (id_kelompok: string) => getDataFiltered('generus', 'id_kelompok', id_kelompok),
  create: (data: Omit<Generus, 'id_generus'>) => insertData('generus', { ...data, id_generus: generateId() }),
  update: (id: string, data: Partial<Generus>) => updateData('generus', id, data),
  delete: (id: string) => deleteData('generus', id),
};

export const categoryCatatan = {
  getAll: () => getAllData('category_catatan'),
  create: (data: Omit<CategoryCatatan, 'id_category'>) => insertData('category_catatan', { ...data, id_category: generateId() }),
  update: (id: string, data: Partial<CategoryCatatan>) => updateData('category_catatan', id, data),
  delete: (id: string) => deleteData('category_catatan', id),
};

export const targetBulanan = {
  getAll: () => getAllData('target_bulanan'),
  getAllByRombel: (id_rombel: string) => getDataFiltered('target_bulanan', 'id_rombel', id_rombel),
  create: (data: Omit<TargetBulanan, 'id_target_bulan'>) => insertData('target_bulanan', { ...data, id_target_bulan: generateId() }),
  update: (id: string, data: Partial<TargetBulanan>) => updateData('target_bulanan', id, data),
  delete: (id: string) => deleteData('target_bulanan', id),
};

export const targetRaport = {
  getAll: () => getAllData('target_raport'),
  getAllByRombel: (id_rombel: string) => getDataFiltered('target_raport', 'id_rombel', id_rombel),
  create: (data: Omit<TargetRaport, 'id_target_raport'>) => insertData('target_raport', { ...data, id_target_raport: generateId() }),
  update: (id: string, data: Partial<TargetRaport>) => updateData('target_raport', id, data),
  delete: (id: string) => deleteData('target_raport', id),
};

export const materi = {
  getAll: () => getAllData('materi'),
  getAllByRombel: (id_rombel: string) => getDataFiltered('materi', 'id_rombel', id_rombel),
  create: (data: Omit<Materi, 'id_materi'>) => insertData('materi', { ...data, id_materi: generateId() }),
  update: (id: string, data: Partial<Materi>) => updateData('materi', id, data),
  delete: (id: string) => deleteData('materi', id),
};