import { Text, View } from 'react-native';

import { EditScreenInfo } from './EditScreenInfo';

type ScreenContentProps = {
  title: string;
  path: string;
  children?: React.ReactNode;
  centered?: boolean; // when false, content starts from top
};

export const ScreenContent = ({ title, path, children, centered = true }: ScreenContentProps) => {
  return (
    <View className={centered ? styles.containerCentered : styles.containerTop}>
      <Text className={styles.title}>{title}</Text>
      <View className={styles.separator} />
      <EditScreenInfo path={path} />
      {children}
    </View>
  );
};
const styles = {
  containerCentered: `items-center flex-1 justify-center bg-background` ,
  containerTop: `flex-1 bg-background px-0`,
  separator: `h-[1px] my-7 w-4/5 bg-border`,
  title: `text-xl font-bold text-foreground`,
};
