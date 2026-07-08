import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for database tables
export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  status: 'active' | 'completed' | 'archived';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string | null;
  project_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  is_pinned: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string;
  favicon: string;
  category: string;
  user_id: string;
  created_at: string;
}

export interface DeveloperResource {
  id: string;
  title: string;
  url: string;
  description: string;
  category: 'tool' | 'library' | 'documentation' | 'tutorial' | 'course' | 'other';
  tags: string[];
  user_id: string;
  created_at: string;
}
