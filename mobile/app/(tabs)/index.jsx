import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import fetchWithAuth from '../../api/fetchWithAuth';

const BASE_URL = 'http://localhost:8080';

const CATEGORIES = [
  { label: '신체적 이완', emoji: '🏃', color: 'bg-red-50', textColor: 'text-red-500', path: 'physical' },
  { label: '정신적 고요', emoji: '🧘', color: 'bg-emerald-50', textColor: 'text-emerald-500', path: 'mental' },
  { label: '감각의 정화', emoji: '👁️', color: 'bg-amber-50', textColor: 'text-amber-500', path: 'sensory' },
  { label: '정서적 지지', emoji: '❤️', color: 'bg-pink-50', textColor: 'text-pink-500', path: 'emotional' },
  { label: '사회적 휴식', emoji: '👥', color: 'bg-purple-50', textColor: 'text-purple-500', path: 'social' },
  { label: '창조적 몰입', emoji: '🎨', color: 'bg-orange-50', textColor: 'text-orange-500', path: 'creative' },
  { label: '자연의 연결', emoji: '🌲', color: 'bg-green-50', textColor: 'text-green-600', path: 'nature' },
];

function formatMinutes(minutes) {
  if (!minutes) return '0분';
  if (minutes < 60) return `${minutes}분`;
  return `${Math.floor(minutes / 60)}시간`;
}

export default function MainDashboard() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [places, setPlaces] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [placesLoading, setPlacesLoading] = useState(true);
  const [userNickname, setUserNickname] = useState('');

  useEffect(() => {
    checkAuth();
    loadPlaces();
  }, []);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    const userStr = await AsyncStorage.getItem('user');
    if (token) {
      setIsLoggedIn(true);
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserNickname(user.nickname || '');
      }
      loadMonthlyStats();
    }
  };

  const loadPlaces = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/places?page=1&size=3&status=approved`);
      const data = await res.json();
      if (data.success && data.data?.places) setPlaces(data.data.places);
    } catch {
      // 장소 로드 실패 시 무시
    } finally {
      setPlacesLoading(false);
    }
  };

  const loadMonthlyStats = async () => {
    try {
      const data = await fetchWithAuth('/api/stats/monthly');
      if (data.success && data.data) setMonthlyStats(data.data);
    } catch {
      // 무시
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F9F7F2]">
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* 헤더 */}
        <View className="px-5 pt-6 pb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-black text-slate-800">쉼표,</Text>
            {isLoggedIn && userNickname ? (
              <Text className="text-slate-500 text-sm mt-0.5">{userNickname}님의 오늘 휴식</Text>
            ) : (
              <Text className="text-slate-500 text-sm mt-0.5">오늘의 휴식을 시작해보세요</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => router.push(isLoggedIn ? '/my' : '/(auth)/login')}
            className="w-10 h-10 bg-white rounded-full items-center justify-center border border-slate-100 shadow-sm"
          >
            <Text className="text-lg">{isLoggedIn ? '👤' : '🔑'}</Text>
          </TouchableOpacity>
        </View>

        {/* 진단 배너 */}
        <View className="mx-5 mb-6 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl border border-emerald-100 p-5" style={{ backgroundColor: '#ECFDF5' }}>
          <Text className="text-xs font-bold text-primary mb-2 tracking-wider">지금 바로 시작하세요</Text>
          <Text className="text-xl font-bold text-slate-800 mb-1">나에게 맞는{'\n'}휴식을 찾아볼까요?</Text>
          <Text className="text-slate-500 text-sm mb-4">심박수 측정 또는 설문 진단으로{'\n'}맞춤 휴식을 추천받아요</Text>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push('/heartrate')}
              className="flex-1 bg-emerald-500 rounded-xl py-3 items-center"
            >
              <Text className="text-white font-bold text-sm">❤️ 심박 측정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/rest-test')}
              className="flex-1 bg-primary rounded-xl py-3 items-center"
            >
              <Text className="text-white font-bold text-sm">🧠 유형 진단</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 휴식 카테고리 */}
        <View className="mb-6">
          <Text className="text-base font-bold text-slate-800 px-5 mb-3">휴식 카테고리</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.path}
                className={`items-center ${cat.color} rounded-2xl p-4 w-[90px]`}
              >
                <Text className="text-2xl mb-2">{cat.emoji}</Text>
                <Text className={`text-xs font-bold ${cat.textColor} text-center`}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 이번 달 통계 (로그인 시) */}
        {isLoggedIn && (
          <View className="mx-5 mb-6 bg-primary rounded-2xl p-5">
            <Text className="text-white font-bold text-base mb-4">나의 휴식 지표</Text>
            <View className="flex-row gap-3">
              <View className="flex-1 bg-white/20 rounded-xl p-4">
                <Text className="text-white/70 text-[10px] font-bold mb-1">총 휴식 시간</Text>
                <Text className="text-white text-xl font-bold">
                  {monthlyStats ? formatMinutes(monthlyStats.totalRestMinutes) : '0분'}
                </Text>
              </View>
              <View className="flex-1 bg-white/20 rounded-xl p-4">
                <Text className="text-white/70 text-[10px] font-bold mb-1">기록 횟수</Text>
                <Text className="text-white text-xl font-bold">{monthlyStats?.logCount || 0}회</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/rest-record')}
              className="mt-3 bg-white/20 rounded-xl py-3 items-center"
            >
              <Text className="text-white font-bold text-sm">휴식 기록하기 →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 추천 장소 */}
        <View className="px-5 pb-8">
          <Text className="text-base font-bold text-slate-800 mb-3">추천 장소</Text>
          {placesLoading ? (
            <View className="h-24 items-center justify-center">
              <ActivityIndicator color="#10b981" />
            </View>
          ) : places.length === 0 ? (
            <View className="bg-white rounded-2xl border border-slate-100 py-10 items-center">
              <Text className="text-3xl mb-2">📍</Text>
              <Text className="text-slate-400 text-sm">아직 등록된 장소가 없어요</Text>
            </View>
          ) : (
            places.map((place) => (
              <View
                key={place.id}
                className="bg-white rounded-2xl border border-slate-100 p-4 mb-3 shadow-sm"
              >
                <Text className="font-bold text-slate-800 mb-1">{place.name}</Text>
                <Text className="text-slate-500 text-xs">{place.address}</Text>
                {place.aiScore != null && (
                  <Text className="text-amber-500 text-xs font-bold mt-1">⭐ {place.aiScore.toFixed(1)}</Text>
                )}
              </View>
            ))
          )}
        </View>

      </ScrollView>

      {/* 플로팅 버튼 */}
      <TouchableOpacity
        onPress={() => router.push('/rest-test')}
        className="absolute bottom-8 right-5 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg"
      >
        <Text className="text-2xl">🧠</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
