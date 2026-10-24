
import { supabase } from './supabase';

export async function testSupabaseConnection() {
  if (!supabase) {
    console.error('Supabase is not configured. Check .env.local');
    return;
  }

  const { data, error } = await supabase
    .from('mess_status')
    .select('*')
    .order('id');

  if (error) {
    console.error('Supabase query failed:', error.message);
    return;
  }

  console.log('Supabase connected! Mess records:', data);
}
