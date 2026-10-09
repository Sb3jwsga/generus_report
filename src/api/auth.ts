import { supabase } from './supabase';
import type { User } from '../types';
import bcrypt from 'bcryptjs';

export const login = async (username: string, password: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !data) return null;

  const match = await bcrypt.compare(password, data.password);
  if (!match) return null;

  return data as User;
};