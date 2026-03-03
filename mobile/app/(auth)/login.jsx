import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const BASE_URL = 'http://localhost:8080';

export default function LoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);

    if (!identifier.trim()) {
      setError('아이디 또는 이메일을 입력해주세요.');
      return;
    }
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || '로그인에 실패했습니다.');
        return;
      }

      // JWT 토큰 AsyncStorage 저장
      await AsyncStorage.setItem('accessToken', data.data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(data.data.user));

      router.replace('/(tabs)/');
    } catch {
      setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F9F7F2]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 py-16 justify-center">

            {/* 헤더 */}
            <View className="items-center mb-10">
              <View className="w-16 h-16 bg-primary rounded-full items-center justify-center mb-5 shadow-lg">
                <Text className="text-white text-3xl font-black">,</Text>
              </View>
              <Text className="text-2xl font-bold text-slate-800">다시 만나서 반가워요</Text>
              <Text className="text-slate-500 text-sm mt-2">쉼표와 함께 오늘의 휴식을 시작해보세요</Text>
            </View>

            {/* 카드 */}
            <View className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              {error && (
                <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <Text className="text-sm text-red-600">{error}</Text>
                </View>
              )}

              {/* 아이디 */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-slate-700 mb-2">아이디 또는 이메일</Text>
                <TextInput
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
                  placeholder="아이디 또는 이메일을 입력하세요"
                  placeholderTextColor="#94a3b8"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>

              {/* 비밀번호 */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-slate-700 mb-2">비밀번호</Text>
                <TextInput
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
                  placeholder="비밀번호를 입력하세요"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                />
              </View>

              {/* 로그인 버튼 */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                className="w-full bg-primary h-12 rounded-xl items-center justify-center"
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-base">로그인</Text>
                )}
              </TouchableOpacity>

              <View className="flex-row items-center my-5">
                <View className="flex-1 h-px bg-slate-100" />
                <Text className="text-slate-400 text-xs px-4">또는</Text>
                <View className="flex-1 h-px bg-slate-100" />
              </View>

              <TouchableOpacity
                onPress={() => router.push('/(tabs)/')}
                className="items-center"
              >
                <Text className="text-slate-400 text-sm">
                  나중에 로그인하기 → <Text className="text-primary font-semibold">둘러보기</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-6">
              <Text className="text-slate-400 text-sm">아직 계정이 없으신가요? </Text>
              <TouchableOpacity>
                <Text className="text-primary font-bold text-sm">회원가입</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
