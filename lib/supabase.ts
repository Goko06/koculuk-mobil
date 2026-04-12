import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Web projesindeki değerleri buraya yapıştır
const supabaseUrl = 'https://zkmcnbacjbgfgklcbfkb.supabase.co';
const supabaseAnonKey = 'sb_publishable_CElq7eQV94a6p_8d5alDLg_er83360S';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
