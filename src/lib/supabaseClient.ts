import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key exists:', !!supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Test the connection
// supabase.from('projects').select('count').then(
//   ({ data, error }) => {
//     if (error) {
//       console.error('Supabase connection test failed:', error);
//     } else {
//       console.log('Supabase connection test successful:', data);
//     }
//   }
// );

export type User = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}; 