import { useState, useEffect } from 'react';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';

// Completa a sessão do navegador após autenticação
WebBrowser.maybeCompleteAuthSession();

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verifica a sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      console.log('[useAuth] Sessão inicial verificada:', {
        hasSession: !!session,
        userEmail: session?.user?.email,
      });
    });

    // Escuta mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[useAuth] Auth state changed:', {
        event,
        hasSession: !!session,
        userEmail: session?.user?.email,
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // NOTA: Removido redirecionamento automático aqui para evitar conflitos
      // O redirecionamento é feito no index.tsx baseado no estado de autenticação
    });

    return () => subscription.unsubscribe();
  }, [router]);

  async function signInWithGoogle() {
    try {
      setLoading(true);
      console.log('[useAuth] Iniciando login com Google...');
      console.log('[useAuth] Platform:', Platform.OS);

      // No web, usamos redirect direto (evita bloqueio de popup)
      if (Platform.OS === 'web') {
        console.log('[useAuth] Usando redirect para web...');
        
        // Define a URL de callback para o web
        const redirectUrl = `${window.location.origin}/auth/callback`;
        console.log('[useAuth] Redirect URL (web):', redirectUrl);

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            // skipBrowserRedirect: false faz o redirect automático
            skipBrowserRedirect: false,
          },
        });

        if (error) {
          console.error('[useAuth] Erro no signInWithOAuth:', error);
          throw error;
        }

        // No web com skipBrowserRedirect: false, o Supabase redireciona automaticamente
        // Não precisamos fazer mais nada aqui
        console.log('[useAuth] Redirect iniciado para:', data.url);
        return;
      }

      // Para mobile, usamos o fluxo com WebBrowser
      console.log('[useAuth] Usando WebBrowser para mobile...');
      
      // Cria a URL de redirect para o OAuth
      const redirectUrl = makeRedirectUri({
        scheme: 'share-finance',
        path: 'auth/callback',
      });

      console.log('[useAuth] Redirect URL (mobile):', redirectUrl);

      // Inicia o fluxo OAuth do Google (skipBrowserRedirect: true para controlar manualmente)
      console.log('[useAuth] Chamando signInWithOAuth...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true, // Controlamos o browser manualmente no mobile
        },
      });

      if (error) {
        console.error('[useAuth] Erro no signInWithOAuth:', error);
        throw error;
      }

      console.log('[useAuth] OAuth URL recebida:', data.url);

      // Abre o navegador para autenticação
      if (data.url) {
        console.log('[useAuth] Abrindo WebBrowser...');
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl,
        );

        console.log('[useAuth] Resultado do WebBrowser:', {
          type: result.type,
          url: result.url,
        });

        if (result.type === 'success') {
          // A URL de callback contém os parâmetros necessários
          const url = result.url;
          console.log('[useAuth] URL de callback:', url);
          
          try {
            // Extrai o código da URL se presente
            const urlObj = new URL(url);
            const code = urlObj.searchParams.get('code');
            const errorParam = urlObj.searchParams.get('error');
            const errorDescription = urlObj.searchParams.get('error_description');

            console.log('[useAuth] Parâmetros da URL:', {
              code: code ? 'presente' : 'ausente',
              error: errorParam,
              errorDescription,
            });

            if (errorParam) {
              const errorMsg = errorDescription || errorParam;
              console.error('[useAuth] Erro na URL de callback:', errorMsg);
              throw new Error(`Erro de autenticação: ${errorMsg}`);
            }

            if (code) {
              console.log('[useAuth] Trocando código por sessão...');
              // Troca o código por uma sessão
              const { data: sessionData, error: exchangeError } =
                await supabase.auth.exchangeCodeForSession(code);

              if (exchangeError) {
                console.error('[useAuth] Erro ao trocar código:', exchangeError);
                throw exchangeError;
              }

              console.log('[useAuth] Sessão obtida com sucesso:', {
                user: sessionData.session?.user?.email,
                expiresAt: sessionData.session?.expires_at,
              });
            } else {
              console.log('[useAuth] Nenhum código na URL, verificando sessão...');
              // Se não houver código, tenta obter a sessão diretamente
              // Isso pode funcionar se o Supabase já processou o callback
              const { data: { session: newSession }, error: sessionError } = 
                await supabase.auth.getSession();
              
              if (sessionError) {
                console.error('[useAuth] Erro ao obter sessão:', sessionError);
                throw sessionError;
              }

              if (!newSession) {
                console.error('[useAuth] Nenhuma sessão encontrada após autenticação');
                throw new Error('Não foi possível obter a sessão após autenticação');
              }

              console.log('[useAuth] Sessão obtida diretamente:', {
                user: newSession.user?.email,
              });
            }
          } catch (urlError) {
            console.error('[useAuth] Erro ao processar URL de callback:', urlError);
            throw urlError;
          }
        } else if (result.type === 'cancel') {
          console.log('[useAuth] Usuário cancelou o login');
          // Usuário cancelou o login
          return;
        } else {
          console.warn('[useAuth] Tipo de resultado inesperado:', result.type);
        }
      } else {
        console.error('[useAuth] Nenhuma URL retornada do OAuth');
        throw new Error('Não foi possível obter a URL de autenticação');
      }
    } catch (error) {
      console.error('[useAuth] Erro geral ao fazer login com Google:', error);
      throw error;
    } finally {
      setLoading(false);
      console.log('[useAuth] Login finalizado');
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }

  return {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user,
  };
}
