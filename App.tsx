import { StatusBar } from 'expo-status-bar';
import './global.css';
import RootNavigator from './navigation/RootNavigator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a single QueryClient instance outside the component to avoid re-creation
const queryClient = new QueryClient();

export default function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <RootNavigator />
      </QueryClientProvider>
      <StatusBar style="auto" />
    </>
  );
}
