import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const url = process.env.VITE_SUPABASE_URL || process.argv[2];
const key = process.env.VITE_SUPABASE_ANON_KEY || process.argv[3];

if (!url || !key) {
  console.error('Usage: node scripts/seed-admin.mjs <SUPABASE_URL> <ANON_KEY> [username] [password] [nama]');
  process.exit(1);
}

const username = process.argv[4] || 'admin';
const plainPassword = process.argv[5] || 'admin123';
const nama = process.argv[6] || 'Administrator';

const sb = createClient(url, key, { db: { schema: 'generus' } });

const hash = await bcrypt.hash(plainPassword, 10);

const { data: existing } = await sb.from('user').select('id_user').eq('username', username).maybeSingle();
if (existing) {
  const { error } = await sb.from('user').update({ password: hash, nama_user: nama, role: 'Admin' }).eq('username', username);
  if (error) { console.error('Update gagal:', error.message); process.exit(1); }
  console.log(`User '${username}' diperbarui (password di-reset).`);
} else {
  const { error } = await sb.from('user').insert({ nama_user: nama, username, password: hash, role: 'Admin' });
  if (error) { console.error('Insert gagal:', error.message); process.exit(1); }
  console.log(`Admin '${username}' dibuat dengan password '${plainPassword}'. SEGERA GANTI setelah login.`);
}
