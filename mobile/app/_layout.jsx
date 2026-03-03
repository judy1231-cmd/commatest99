import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#F9F7F2' },
          headerTintColor: '#334155',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#F9F7F2' },
        }}
      >
        <Stack.Screen name="(auth)/login" options={{ title: '로그인', headerShown: false }} />
        <Stack.Screen name="(tabs)/index" options={{ headerShown: false }} />
        <Stack.Screen name="heartrate" options={{ title: '심박수 체크' }} />
        <Stack.Screen name="rest-test" options={{ title: '휴식 유형 진단' }} />
        <Stack.Screen name="rest-record" options={{ title: '휴식 기록' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
