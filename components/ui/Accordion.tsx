import React, { useState } from 'react';
import { View, Text, Pressable, ViewProps } from 'react-native';

export type AccordionProps = ViewProps & {
  title: string;
  defaultOpen?: boolean;
  children?: React.ReactNode;
};

export const Accordion = ({ title, defaultOpen = false, className = '', children, ...rest }: AccordionProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View className={className} {...rest}>
      <Pressable className="flex-row items-center justify-between py-2" onPress={() => setOpen((v) => !v)}>
        <Text className="text-base font-semibold text-foreground">{title}</Text>
        <Text className="text-muted-foreground">{open ? '▾' : '▸'}</Text>
      </Pressable>
      {open ? <View className="mt-2">{children}</View> : null}
    </View>
  );
};
