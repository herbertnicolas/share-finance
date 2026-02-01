import React from 'react';
import { Text, View } from 'react-native';
import { cn } from '../../utils/cn';

export type ExpenseCardProps = {
  title: string;
  subtitle: string;
  amount: string;
  originalAmount?: string;
  accentColor?: string;
  icon?: React.ReactNode;
  className?: string;
};

export function ExpenseCard({
  title,
  subtitle,
  amount,
  originalAmount,
  accentColor = '#FFEFB3',
  icon,
  className,
}: ExpenseCardProps) {
  return (
    <View
      className={cn(
        'flex-row items-center rounded-2xl px-3 py-3 mb-3 bg-white',
        className,
      )}
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 2,
      }}
    >
      <View
        className="mr-3 h-11 w-11 items-center justify-center rounded-2xl"
        style={{ backgroundColor: accentColor }}
      >
        {icon}
      </View>

      <View className="flex-1">
        <Text className="text-[15px] font-semibold text-sf-text" numberOfLines={1}>
          {title}
        </Text>
        <Text className="mt-0.5 text-xs text-sf-muted" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <View className="items-end ml-3">
        <Text className="text-[15px] font-semibold text-sf-text">
          {amount}
        </Text>
        {originalAmount ? (
          <Text className="mt-0.5 text-xs text-sf-muted">
            {originalAmount}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

