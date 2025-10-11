import { createClient } from '@supabase/supabase-js';
import { auth } from './firebase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const setSupabaseUserContext = async () => {
  const userId = auth.currentUser?.uid;
  if (userId) {
    await supabase.rpc('set_config', {
      setting: 'app.current_user_id',
      value: userId
    });
  }
};

export interface Project {
  id: string;
  user_id: string;
  name: string;
  type: 'chat' | 'code' | 'design' | 'video';
  description?: string;
  ai_model?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  project_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
}
