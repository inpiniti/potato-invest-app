import React from 'react';
import { View, ViewProps } from 'react-native';

export type CardProps = ViewProps & {
  padded?: boolean;
};

export const Card = ({ className = '', padded = true, ...rest }: CardProps) => {
  const padding = padded ? 'p-4' : '';
  return (
    <View className={`rounded-app bg-card ${padding} ${className}`} {...rest} />
  );
};
