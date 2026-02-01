import React from 'react';
import { SafeAreaView, View, ViewProps } from 'react-native';
import { cn } from '../../utils/cn';

type ScreenProps = {
  children: React.ReactNode;
  withHorizontalPadding?: boolean;
} & ViewProps;

export function Screen({
  children,
  className,
  withHorizontalPadding = true,
  ...viewProps
}: ScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-sf-bg">
      <View
        className={cn(
          'flex-1',
          withHorizontalPadding ? 'px-6' : '',
          className,
        )}
        {...viewProps}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

