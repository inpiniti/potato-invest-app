import React from 'react';
import { Pressable, Text, PressableProps } from 'react-native';

export type ButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
};

export const Button = ({ title, variant = 'primary', className = '', ...rest }: ButtonProps) => {
  const base = 'px-4 py-2 rounded-app items-center justify-center';
  const variants: Record<string, string> = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    destructive: 'bg-destructive',
    ghost: 'bg-transparent',
  };
  const textVariants: Record<string, string> = {
    primary: 'text-primary-foreground',
    secondary: 'text-secondary-foreground',
    destructive: 'text-white',
    ghost: 'text-foreground',
  };

  return (
    <Pressable className={`${base} ${variants[variant]} ${className}`} {...rest}>
      <Text className={`font-semibold ${textVariants[variant]}`}>{title}</Text>
    </Pressable>
  );
};
