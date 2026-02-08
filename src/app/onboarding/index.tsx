import React from 'react';
import { View, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, UserPlus } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';

export default function GettingStartedScreen() {
  const router = useRouter();

  return (
    <Screen className="px-6">
      {/* Header com ilustração */}
      <View className="flex-1 items-center justify-center">
        {/* Ícone/Ilustração */}
        <View className="mb-8 h-32 w-32 items-center justify-center rounded-full bg-sf-primary-soft">
          <Users size={64} color="#00809D" />
        </View>

        {/* Título */}
        <Text className="text-3xl font-bold text-sf-text text-center">
          Bem-vindo ao Lovinance!
        </Text>

        {/* Subtítulo */}
        <Text className="mt-4 text-base text-sf-muted text-center px-4">
          Gerencie os gastos do casal de forma simples. Saiba sempre quem deve
          pra quem.
        </Text>
      </View>

      {/* Botões de ação */}
      <View className="pb-8">
        {/* Criar novo grupo */}
        <Button
          label="Criar novo grupo"
          leftIcon={<UserPlus size={20} color="#FFFFFF" />}
          onPress={() => router.push('/onboarding/create-group')}
          className="mb-4"
        />

        {/* Entrar em grupo existente */}
        <Button
          label="Entrar em um grupo"
          variant="outline"
          leftIcon={<Users size={20} color="#00809D" />}
          onPress={() => router.push('/onboarding/join-group')}
        />

        {/* Descrição */}
        <Text className="mt-6 text-center text-xs text-sf-muted">
          Crie um grupo e convide seu parceiro(a) com um código único, ou entre
          em um grupo existente usando o código recebido.
        </Text>
      </View>
    </Screen>
  );
}
