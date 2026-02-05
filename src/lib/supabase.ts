import { AppState, type AppStateStatus, Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { storage } from './storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Detecta se estamos no web para habilitar detectSessionInUrl
const isWeb = Platform.OS === 'web';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    // No web, precisamos detectar a sessão na URL para OAuth redirect funcionar
    detectSessionInUrl: isWeb,
    // Fluxo PKCE é mais seguro e funciona melhor em ambientes web
    flowType: isWeb ? 'pkce' : 'pkce',
  },
});

// Gerencia o refresh automático do token baseado no estado do app
AppState.addEventListener('change', (state: AppStateStatus) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
