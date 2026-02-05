import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Platform } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const { signInWithGoogle, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      console.error('[LoginScreen] Erro no login:', err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    }
  }

  return (
    <Screen className="items-center justify-center px-6">
      {/* Logo / Título */}
      <View className="mb-12 items-center">
        <Text className="text-4xl font-bold text-sf-primary">Share Finance</Text>
        <Text className="mt-2 text-sf-muted text-center">
          Gerencie suas finanças compartilhadas de forma simples
        </Text>
      </View>

      {/* Área de Login */}
      <View className="w-full max-w-sm">
        {/* Botão Google */}
        <Pressable
          onPress={handleGoogleLogin}
          disabled={loading}
          className="flex-row items-center justify-center rounded-xl bg-white border border-gray-300 px-6 py-4 shadow-sm active:bg-gray-50 disabled:opacity-50"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#007C82" />
          ) : (
            <>
              {/* Ícone do Google (emoji como fallback simples) */}
              <Text className="mr-3 text-xl">🔐</Text>
              <Text className="text-base font-medium text-gray-700">
                Entrar com Google
              </Text>
            </>
          )}
        </Pressable>

        {/* Mensagem de erro */}
        {error && (
          <View className="mt-4 rounded-lg bg-red-50 p-4">
            <Text className="text-red-600 text-center">{error}</Text>
          </View>
        )}

        {/* Termos */}
        <Text className="mt-8 text-center text-xs text-sf-muted">
          Ao continuar, você concorda com nossos{' '}
          <Text className="text-sf-primary">Termos de Uso</Text> e{' '}
          <Text className="text-sf-primary">Política de Privacidade</Text>
        </Text>
      </View>
    </Screen>
  );
}
