import { supabase } from './supabaseClient';

export async function getUserStats(userId) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('user_stats').select('stats').eq('id', userId).single();
    if (error) {
      console.warn('getUserStats error', error.message || error);
      return null;
    }
    return data ? data.stats : null;
  } catch (err) {
    console.error('getUserStats failed', err);
    return null;
  }
}

export async function saveUserStats(userId, stats) {
  if (!supabase) return;
  try {
    const payload = { id: userId, stats };
    const { error } = await supabase.from('user_stats').upsert(payload, { returning: 'minimal' });
    if (error) console.warn('saveUserStats error', error.message || error);
  } catch (err) {
    console.error('saveUserStats failed', err);
  }
}
