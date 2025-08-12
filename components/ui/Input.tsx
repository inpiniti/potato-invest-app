import React from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';

export type InputProps = TextInputProps & {
  label?: string;
  helperText?: string;
  error?: string;
  className?: string;
};

export const Input = ({ label, helperText, error, className = '', ...rest }: InputProps) => {
  return (
    <View className={`w-full ${className}`}>
      {label ? <Text className="mb-1 text-sm text-foreground">{label}</Text> : null}
      <TextInput
        className={`rounded-app border border-input bg-card px-3 py-2 text-foreground ${error ? 'border-red-400' : ''}`}
        placeholderTextColor="#94a3b8"
        {...rest}
      />
      {helperText && !error ? (
        <Text className="mt-1 text-xs text-muted-foreground">{helperText}</Text>
      ) : null}
      {error ? <Text className="mt-1 text-xs text-red-500">{error}</Text> : null}
    </View>
  );
};
