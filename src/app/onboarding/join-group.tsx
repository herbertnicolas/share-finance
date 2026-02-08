import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Users, Check } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { findGroupByCode, joinGroup } from '@/lib/groups';
import type { GroupSearchResult } from '@/types';

export default function JoinGroupScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundGroup, setFoundGroup] = useState<GroupSearchResult | null>(null);
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Atualiza um dígito do código
  function handleCodeChange(index: number, value: string) {
    // Aceita apenas letras e números
    const char = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (char.length <= 1) {
      const newCode = [...code];
      newCode[index] = char;
      setCode(newCode);
      setError(null);
      setFoundGroup(null);

      // Move para próximo input
      if (char && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      // Busca grupo quando código completo
      if (char && index === 5) {
        const fullCode = newCode.join('');
        if (fullCode.length === 6) {
          searchGroup(fullCode);
        }
      }
    }
  }

  // Trata backspace
  function handleKeyPress(index: number, key: string) {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  // Busca grupo pelo código
  async function searchGroup(fullCode: string) {
    setSearching(true);
    setError(null);

    try {
      const group = await findGroupByCode(fullCode);

      if (group) {
        setFoundGroup(group);
      } else {
        setError('Grupo não encontrado. Verifique o código.');
      }
    } catch (err) {
      console.error('Erro ao buscar grupo:', err);
      setError('Erro ao buscar grupo. Tente novamente.');
    } finally {
      setSearching(false);
    }
  }

  // Entra no grupo
  async function handleJoinGroup() {
    if (!foundGroup || !displayName.trim() || !user) {
      setError('Preencha seu nome para continuar');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const member = await joinGroup(
        code.join(''),
        user.id,
        displayName.trim()
      );

      if (member) {
        setSuccess(true);
        // Aguarda um momento para mostrar sucesso e redireciona
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1500);
      } else {
        setError('Não foi possível entrar no grupo. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao entrar no grupo:', err);
      setError('Erro ao entrar no grupo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  // Tela de sucesso
  if (success) {
    return (
      <Screen className="items-center justify-center px-6">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-sf-card-success mb-6">
          <Check size={48} color="#00809D" />
        </View>
        <Text className="text-2xl font-bold text-sf-text text-center">
          Você entrou no grupo!
        </Text>
        <Text className="mt-2 text-base text-sf-muted text-center">
          Redirecionando...
        </Text>
      </Screen>
    );
  }

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
          Entrar em grupo
        </Text>
      </View>

      {/* Conteúdo */}
      <View className="flex-1 pt-6">
        <Text className="text-2xl font-bold text-sf-text">
          Digite o código
        </Text>
        <Text className="mt-2 text-base text-sf-muted">
          Peça o código de 6 caracteres para seu parceiro(a).
        </Text>

        {/* Inputs do código */}
        <View className="flex-row justify-between mt-8">
          {code.map((char, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              value={char}
              onChangeText={(value) => handleCodeChange(index, value)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(index, nativeEvent.key)
              }
              maxLength={1}
              autoCapitalize="characters"
              className={`h-14 w-12 rounded-xl bg-white text-center text-xl font-bold border-2 ${
                char
                  ? 'border-sf-primary text-sf-primary'
                  : 'border-gray-200 text-sf-text'
              }`}
            />
          ))}
        </View>

        {/* Loading da busca */}
        {searching && (
          <View className="flex-row items-center justify-center mt-4">
            <ActivityIndicator size="small" color="#00809D" />
            <Text className="ml-2 text-sm text-sf-muted">
              Buscando grupo...
            </Text>
          </View>
        )}

        {/* Grupo encontrado */}
        {foundGroup && !searching && (
          <View className="mt-6 rounded-2xl bg-sf-card-success p-4">
            <View className="flex-row items-center">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-sf-primary">
                <Users size={24} color="#FFFFFF" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-sf-text">
                  {foundGroup.name}
                </Text>
                <Text className="text-sm text-sf-muted">
                  {foundGroup.member_count} membro(s)
                </Text>
              </View>
              <Check size={24} color="#00809D" />
            </View>
          </View>
        )}

        {/* Input do nome (aparece quando grupo encontrado) */}
        {foundGroup && !searching && (
          <View className="mt-6">
            <Text className="text-sm font-medium text-sf-text mb-2">
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
          </View>
        )}

        {/* Erro */}
        {error && (
          <View className="mt-4 rounded-lg bg-red-50 p-3">
            <Text className="text-red-600 text-center text-sm">{error}</Text>
          </View>
        )}
      </View>

      {/* Botão de ação */}
      <View className="pb-8">
        <Button
          label={loading ? 'Entrando...' : 'Entrar no grupo'}
          onPress={handleJoinGroup}
          disabled={loading || !foundGroup || !displayName.trim()}
        />
      </View>
    </Screen>
  );
}
