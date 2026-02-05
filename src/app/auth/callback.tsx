import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Screen } from '@/components/layout/Screen';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    async function handleCallback() {
      try {
        console.log('[AuthCallback] Processando callback com params:', params);
        
        // Se houver código na URL, troca por sessão
        if (params.code) {
          console.log('[AuthCallback] Código encontrado, trocando por sessão...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(
            params.code as string,
          );

          if (error) {
            console.error('[AuthCallback] Erro ao trocar código por sessão:', error);
            router.replace('/auth/login');
            return;
          }

          console.log('[AuthCallback] Sessão obtida:', {
            user: data.session?.user?.email,
            expiresAt: data.session?.expires_at,
          });
        } else {
          console.log('[AuthCallback] Nenhum código encontrado nos params');
        }

        // Verifica se há sessão ativa
        console.log('[AuthCallback] Verificando sessão atual...');
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[AuthCallback] Erro ao obter sessão:', sessionError);
          router.replace('/auth/login');
          return;
        }

        if (session) {
          console.log('[AuthCallback] Sessão encontrada, redirecionando para home');
          router.replace('/(tabs)');
        } else {
          console.log('[AuthCallback] Nenhuma sessão encontrada, redirecionando para login');
          router.replace('/auth/login');
        }
      } catch (error) {
        console.error('[AuthCallback] Erro no callback de autenticação:', error);
        router.replace('/auth/login');
      }
    }

    handleCallback();
  }, [params.code, router]);

  return (
    <Screen className="items-center justify-center">
      <ActivityIndicator size="large" color="#007C82" />
      <Text className="mt-4 text-sf-muted">Processando autenticação...</Text>
    </Screen>
  );
}
