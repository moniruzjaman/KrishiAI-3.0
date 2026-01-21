
import { createClient } from '@supabase/supabase-js';
import { User, SavedReport } from '../types';

const supabaseUrl = 'https://nmngzjrrysjzuxfcklrk.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export const syncUserProfile = async (user: User) => {
  if (!supabase || !user.uid) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.uid,
        display_name: user.displayName,
        mobile: user.mobile,
        role: user.role,
        farm_location: user.farmLocation,
        progress: user.progress,
        preferred_categories: user.preferredCategories,
        updated_at: new Date().toISOString(),
      });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Supabase Sync Error:', err);
    return null;
  }
};

export const saveReportToSupabase = async (userId: string, report: SavedReport) => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('reports')
      .insert({
        id: report.id,
        user_id: userId,
        timestamp: new Date(report.timestamp).toISOString(),
        type: report.type,
        title: report.title,
        content: report.content,
        audio_base64: report.audioBase64,
        image_url: report.imageUrl,
        icon: report.icon,
      });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Supabase Report Error:', err);
    return null;
  }
};
