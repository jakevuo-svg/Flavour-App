import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://smnzfdzzdhratyonfqdg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtbnpmZHp6ZGhyYXR5b25mcWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NDIxNTUsImV4cCI6MjA4NjIxODE1NX0.B27KC8lFBnqPINWmFJIVKSpU__VBGjd1zNB4PrWY-Xg';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Running in demo mode.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isDemoMode = !supabase;
