import React from 'react';
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { cn } from '../../utils/cn';

type ButtonVariant = 'primary' | 'outline' | 'ghost';

type ButtonProps = {
  label: string;
  variant?: ButtonVariant;
  leftIcon?: React.ReactNode;
} & TouchableOpacityProps;

export function Button({
  label,
  variant = 'primary',
  leftIcon,
  className,
  disabled,
  ...touchableProps
}: ButtonProps) {
  const baseClasses =
    'flex-row items-center justify-center rounded-full px-6 py-4';

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-sf-primary',
    outline: 'bg-white border border-zinc-200',
    ghost: 'bg-transparent',
  };

  const textVariantClasses: Record<ButtonVariant, string> = {
    primary: 'text-white',
    outline: 'text-sf-text',
    ghost: 'text-sf-primary',
  };

  const disabledClasses = disabled ? 'opacity-50' : '';

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.85}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        disabledClasses,
        className,
      )}
      {...touchableProps}
    >
      {leftIcon ? (
        <View className="mr-2">{leftIcon}</View>
      ) : null}
      <Text
        className={cn(
          'text-base font-semibold',
          textVariantClasses[variant],
          disabled && 'opacity-70',
        )}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
