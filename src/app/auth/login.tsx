import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Heart, Chrome } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';

export default function LoginScreen() {
  function handleLogin() {
    // Por enquanto apenas um log para testar o fluxo
    console.log('Login com Google acionado');
  }

  return (
    <Screen withHorizontalPadding={false} className="items-center">
      <View className="flex-1 w-full items-center justify-center px-8">
        <View
          className="mb-8 h-24 w-24 items-center justify-center rounded-3xl bg-sf-primary"
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.16,
            shadowOffset: { width: 0, height: 14 },
            shadowRadius: 28,
            elevation: 4,
          }}
        >
          <Heart size={40} color="#ffffff" strokeWidth={2.4} />
        </View>

        <Text className="text-[28px] font-extrabold text-sf-text mb-2">
          ShareFinance
        </Text>

        <Text className="text-center text-[15px] leading-6 text-sf-muted px-6">
          Divida os gastos com seu amor de forma simples e sem estresse
        </Text>
      </View>

      <View className="w-full px-6 mb-8">
        <Button
          variant="outline"
          label="Entrar com Google"
          onPress={handleLogin}
          className="w-full rounded-[999px] py-4 shadow-soft-lg"
          leftIcon={
            <View className="h-6 w-6 items-center justify-center rounded-full bg-white">
              <Chrome size={18} color="#EA4335" />
            </View>
          }
        />
      </View>

      <View className="w-full px-10 pb-6">
        <Text className="text-center text-xs leading-5 text-sf-muted">
          Ao continuar, você concorda com nossos{' '}
          <Pressable onPress={() => console.log('Termos de Uso')}>
            <Text className="text-xs font-semibold text-sf-primary">
              Termos de Uso
            </Text>
          </Pressable>{' '}
          <Text className="text-xs text-sf-muted">e </Text>
          <Pressable onPress={() => console.log('Política de Privacidade')}>
            <Text className="text-xs font-semibold text-sf-primary">
              Política de Privacidade
            </Text>
          </Pressable>
        </Text>
      </View>
    </Screen>
  );
}

