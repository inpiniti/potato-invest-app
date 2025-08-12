import { StatusBar } from 'expo-status-bar';
import './global.css';
import RootNavigator from './navigation/RootNavigator';

export default function App() {
  return (
    <>
      <RootNavigator />
      <StatusBar style="auto" />
    </>
  );
}
