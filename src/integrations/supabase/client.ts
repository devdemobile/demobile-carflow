
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vzzrcdjmexavxooifqwh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6enJjZGptZXhhdnhvb2lmcXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTI5OTksImV4cCI6MjA2MzQ4ODk5OX0.gaS9t3-kH5aBanBgdcD3MG0aPeg-D06L3Kh4lf1vH-g";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Helper para criar funções de acesso tipadas ao supabase
export function createTypedSupabaseClient<T extends keyof Database['public']['Tables']>(
  table: T
) {
  return {
    select: () => supabase.from(table).select(),
    insert: (data: any) => supabase.from(table).insert(data),
    update: (data: any) => supabase.from(table).update(data),
    delete: () => supabase.from(table).delete(),
  };
}
