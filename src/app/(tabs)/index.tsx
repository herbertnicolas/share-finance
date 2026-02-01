import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { Bell, Plus, Settings2, ShoppingBag } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { ExpenseCard } from '@/components/expenses/ExpenseCard';

const MOCK_EXPENSES = [
  {
    id: '1',
    title: 'Pizza Hut',
    subtitle: 'Ontem • Pago por Maria',
    amount: 'R$ 40,00',
    originalAmount: 'R$ 80,00',
  },
  {
    id: '2',
    title: 'Supermercado Extra',
    subtitle: 'Ontem • Pago por Você',
    amount: 'R$ 122,75',
    originalAmount: 'R$ 245,50',
  },
  {
    id: '3',
    title: 'Uber para o shopping',
    subtitle: 'Segunda • Pago por Você',
    amount: 'R$ 16,00',
    originalAmount: 'R$ 32,00',
  },
  {
    id: '4',
    title: 'Cinema',
    subtitle: 'Domingo • Pago por Maria',
    amount: 'R$ 30,00',
    originalAmount: 'R$ 60,00',
  },
];

export default function HomeTabScreen() {
  return (
    <Screen withHorizontalPadding={false}>
      <View className="px-6 pt-2 pb-4 bg-sf-bg">
        <View className="mb-5 mt-1 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="mr-2 flex-row">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-sf-primary">
                <Text className="text-xs font-semibold text-white">V</Text>
              </View>
              <View className="-ml-2 h-8 w-8 items-center justify-center rounded-full bg-amber-300">
                <Text className="text-xs font-semibold text-sf-text">M</Text>
              </View>
            </View>
            <View>
              <Text className="text-xs text-sf-muted">Olá,</Text>
              <Text className="text-[15px] font-semibold text-sf-text">
                Casal Silva
              </Text>
            </View>
          </View>

          <View className="flex-row items-center space-x-3">
            <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-white">
              <Bell size={18} color="#111827" />
            </View>
            <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
              <Settings2 size={18} color="#111827" />
            </View>
          </View>
        </View>

        <View
          className="mb-6 rounded-3xl bg-white px-5 py-5"
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowOffset: { width: 0, height: 10 },
            shadowRadius: 24,
            elevation: 3,
          }}
        >
          <Text className="text-xs font-medium text-sf-muted mb-1">
            Saldo atual
          </Text>
          <Text className="mb-3 text-[17px] font-semibold text-[#F97373]">
            Você deve R$ 45,00 para Maria
          </Text>

          <Button
            label="Pagar agora"
            className="w-full rounded-2xl py-3"
            onPress={() => {
              console.log('Pagar agora acionado');
            }}
          />
        </View>

        <Text className="mb-3 text-[15px] font-semibold text-sf-text">
          Movimentações
        </Text>
      </View>

      <FlatList
        data={MOCK_EXPENSES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 96 }}
        renderItem={({ item }) => (
          <ExpenseCard
            title={item.title}
            subtitle={item.subtitle}
            amount={item.amount}
            originalAmount={item.originalAmount}
            icon={<ShoppingBag size={18} color="#111827" />}
          />
        )}
      />

      <View className="pointer-events-none absolute bottom-8 right-7">
        <View
          className="pointer-events-auto h-14 w-14 items-center justify-center rounded-full bg-sf-primary"
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.22,
            shadowOffset: { width: 0, height: 16 },
            shadowRadius: 32,
            elevation: 5,
          }}
        >
          <Plus size={24} color="#ffffff" />
        </View>
      </View>
    </Screen>
  );
}

