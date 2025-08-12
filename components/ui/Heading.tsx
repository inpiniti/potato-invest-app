import React from 'react';
import { Text, TextProps } from 'react-native';

export type HeadingProps = TextProps & {
  level?: 1 | 2 | 3;
};

export const Heading = ({ level = 1, className = '', ...rest }: HeadingProps) => {
  const sizes = {
    1: 'text-2xl',
    2: 'text-xl',
    3: 'text-lg',
  } as const;
  return <Text className={`${sizes[level]} font-bold text-foreground ${className}`} {...rest} />;
};
