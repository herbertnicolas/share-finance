import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Copy, Share2, Check } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { createGroup } from '@/lib/groups';

export default function CreateGroupScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState<'form' | 'success'>('form');
  const [groupName, setGroupName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupCode, setGroupCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCreateGroup() {
    if (!groupName.trim() || !displayName.trim()) {
      setError('Preencha todos os campos');
      return;
    }

    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createGroup(
        { name: groupName.trim() },
        user.id,
        displayName.trim()
      );

      if (result) {
        setGroupCode(result.group.code);
        setStep('success');
      } else {
        setError('Erro ao criar grupo. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao criar grupo:', err);
      setError('Erro ao criar grupo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyCode() {
    if (groupCode) {
      await Clipboard.setStringAsync(groupCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleShareCode() {
    if (groupCode) {
      try {
        await Share.share({
          message: `Entre no nosso grupo no Lovinance! Use o código: ${groupCode}`,
        });
      } catch (err) {
        console.error('Erro ao compartilhar:', err);
      }
    }
  }

  function handleContinue() {
    router.replace('/(tabs)');
  }

  // Tela de sucesso com código
  if (step === 'success' && groupCode) {
    return (
      <Screen className="px-6">
        <View className="flex-1 items-center justify-center">
          {/* Ícone de sucesso */}
          <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-sf-card-success">
            <Check size={48} color="#00809D" />
          </View>

          <Text className="text-2xl font-bold text-sf-text text-center">
            Grupo criado!
          </Text>

          <Text className="mt-3 text-base text-sf-muted text-center px-4">
            Compartilhe o código abaixo com seu parceiro(a) para ele(a) entrar
            no grupo.
          </Text>

          {/* Card com código */}
          <View className="mt-8 w-full rounded-2xl bg-white p-6 shadow-sm">
            <Text className="text-sm text-sf-muted text-center mb-2">
              Código do grupo
            </Text>

            <Text className="text-4xl font-bold text-sf-primary text-center tracking-widest">
              {groupCode}
            </Text>

            {/* Botões de ação */}
            <View className="flex-row mt-6 space-x-3">
              <Pressable
                onPress={handleCopyCode}
                className="flex-1 mr-2 flex-row items-center justify-center rounded-xl bg-sf-primary-soft py-3"
              >
                {copied ? (
                  <Check size={18} color="#00809D" />
                ) : (
                  <Copy size={18} color="#00809D" />
                )}
                <Text className="ml-2 text-sm font-medium text-sf-primary">
                  {copied ? 'Copiado!' : 'Copiar'}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleShareCode}
                className="flex-1 ml-2 flex-row items-center justify-center rounded-xl bg-sf-primary py-3"
              >
                <Share2 size={18} color="#FFFFFF" />
                <Text className="ml-2 text-sm font-medium text-white">
                  Compartilhar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Botão continuar */}
        <View className="pb-8">
          <Button label="Continuar para o app" onPress={handleContinue} />

          <Text className="mt-4 text-center text-xs text-sf-muted">
            Você pode compartilhar o código depois nas configurações.
          </Text>
        </View>
      </Screen>
    );
  }

  // Formulário de criação
  return (
    <Screen className="px-6">
      {/* Header */}
      <View className="flex-row items-center py-4">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white"
        >
          <ArrowLeft size={20} color="#111827" />
        </Pressable>
        <Text className="ml-4 text-lg font-semibold text-sf-text">
          Criar grupo
        </Text>
      </View>

      {/* Conteúdo */}
      <View className="flex-1 pt-6">
        <Text className="text-2xl font-bold text-sf-text">
          Vamos criar seu grupo
        </Text>
        <Text className="mt-2 text-base text-sf-muted">
          Escolha um nome para o grupo e como você quer ser chamado(a).
        </Text>

        {/* Inputs */}
        <View className="mt-8">
          {/* Nome do grupo */}
          <Text className="text-sm font-medium text-sf-text mb-2">
            Nome do grupo
          </Text>
          <TextInput
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Ex: Casal Silva, Nosso Lar..."
            placeholderTextColor="#9CA3AF"
            className="rounded-xl bg-white px-4 py-4 text-base text-sf-text border border-gray-200"
            autoCapitalize="words"
          />

          {/* Seu nome */}
          <Text className="text-sm font-medium text-sf-text mb-2 mt-6">
            Seu nome
          </Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Como você quer ser chamado(a)?"
            placeholderTextColor="#9CA3AF"
            className="rounded-xl bg-white px-4 py-4 text-base text-sf-text border border-gray-200"
            autoCapitalize="words"
          />

          {/* Erro */}
          {error && (
            <View className="mt-4 rounded-lg bg-red-50 p-3">
              <Text className="text-red-600 text-center text-sm">{error}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Botão de ação */}
      <View className="pb-8">
        <Button
          label={loading ? 'Criando...' : 'Criar grupo'}
          onPress={handleCreateGroup}
          disabled={loading || !groupName.trim() || !displayName.trim()}
        />
      </View>
    </Screen>
  );
}
