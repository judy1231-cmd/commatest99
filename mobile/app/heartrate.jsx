import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  Animated, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import fetchWithAuth from '../api/fetchWithAuth';
import Toast from '../components/common/Toast';

// HealthKit 연동 (iOS 실기기 전용)
let Health = null;
try {
  Health = require('expo-health');
} catch {
  // expo-health 미설치 시 시뮬레이션 모드로 폴백
}

function simulateBpm(baseBpm) {
  return baseBpm + Math.floor(Math.random() * 7) - 3;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getBpmStatus(bpm) {
  if (bpm < 60) return { label: '낮음', color: 'text-blue-500', bgColor: 'bg-blue-50' };
  if (bpm <= 80) return { label: '정상', color: 'text-emerald-500', bgColor: 'bg-emerald-50' };
  if (bpm <= 100) return { label: '보통', color: 'text-amber-500', bgColor: 'bg-amber-50' };
  return { label: '높음', color: 'text-red-500', bgColor: 'bg-red-50' };
}

export default function HeartRateCheck() {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [phase, setPhase] = useState('idle'); // idle | measuring | done
  const [sessionId, setSessionId] = useState(null);
  const [currentBpm, setCurrentBpm] = useState(72);
  const [bpmHistory, setBpmHistory] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [avgBpm, setAvgBpm] = useState(null);
  const [deviceType, setDeviceType] = useState('simulation');
  const [healthKitAvailable, setHealthKitAvailable] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const intervalRef = useRef(null);
  const timerRef = useRef(null);
  const historyRef = useRef([]);

  useEffect(() => {
    checkHealthKit();
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  // 심장 박동 애니메이션
  useEffect(() => {
    if (phase === 'measuring') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [phase]);

  const checkHealthKit = async () => {
    if (Platform.OS === 'ios' && Health) {
      try {
        const isAvailable = await Health.isAvailableAsync();
        setHealthKitAvailable(isAvailable);
        if (isAvailable) setDeviceType('apple_watch');
      } catch {
        // HealthKit 사용 불가
      }
    }
  };

  const startMeasuring = async () => {
    setPhase('measuring');
    historyRef.current = [];

    // HealthKit 실제 연동 (iOS 실기기 + Apple Watch 연결 시)
    if (deviceType === 'apple_watch' && Health && Platform.OS === 'ios') {
      try {
        const { status } = await Health.requestPermissionsAsync({
          read: [Health.HealthDataType.HEART_RATE],
        });

        if (status !== 'granted') {
          Alert.alert('권한 필요', 'HealthKit 권한이 필요합니다. 설정에서 허용해주세요.');
          setDeviceType('simulation');
        } else {
          startHealthKitPolling();
          startTimer();
          return;
        }
      } catch {
        setDeviceType('simulation');
      }
    }

    // 시뮬레이션 모드 또는 세션 시작
    await startSessionAndSimulate();
  };

  const startHealthKitPolling = () => {
    // HealthKit에서 5초마다 최신 심박수 폴링
    intervalRef.current = setInterval(async () => {
      try {
        const samples = await Health.getHeartRateSamplesAsync({
          startDate: new Date(Date.now() - 10000), // 최근 10초
          endDate: new Date(),
          limit: 1,
        });

        if (samples && samples.length > 0) {
          const bpm = Math.round(samples[samples.length - 1].quantity);
          setCurrentBpm(bpm);
          historyRef.current = [...historyRef.current, bpm];
          setBpmHistory([...historyRef.current]);

          // 서버에 저장
          if (sessionId) {
            const hrv = (Math.random() * 30 + 20).toFixed(1);
            fetchWithAuth(`/api/diagnosis/sessions/${sessionId}/measurements`, {
              method: 'POST',
              body: JSON.stringify({ bpm, hrv: parseFloat(hrv) }),
            }).catch(() => {});
          }
        }
      } catch {
        // HealthKit 읽기 실패 시 무시
      }
    }, 5000);
  };

  const startSessionAndSimulate = async () => {
    // 세션 시작 API 호출
    try {
      const res = await fetchWithAuth('/api/diagnosis/sessions/start', {
        method: 'POST',
        body: JSON.stringify({ deviceType }),
      });
      if (res.success && res.data) {
        setSessionId(res.data.id);
        startSimulation(res.data.id);
      } else {
        startSimulation(null);
      }
    } catch {
      startSimulation(null);
    }

    startTimer();
  };

  const startSimulation = (sid) => {
    const baseBpm = 70 + Math.floor(Math.random() * 15);
    historyRef.current = [];

    intervalRef.current = setInterval(() => {
      const bpm = simulateBpm(baseBpm);
      setCurrentBpm(bpm);
      historyRef.current = [...historyRef.current, bpm];
      setBpmHistory([...historyRef.current]);

      if (sid && historyRef.current.length % 10 === 0) {
        const hrv = (Math.random() * 30 + 20).toFixed(1);
        fetchWithAuth(`/api/diagnosis/sessions/${sid}/measurements`, {
          method: 'POST',
          body: JSON.stringify({ bpm, hrv: parseFloat(hrv) }),
        }).catch(() => {});
      }
    }, 1000);
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  };

  const stopMeasuring = async () => {
    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);

    const history = historyRef.current;
    const avg = history.length
      ? Math.round(history.reduce((s, b) => s + b, 0) / history.length)
      : currentBpm;
    setAvgBpm(avg);

    if (sessionId) {
      try {
        await fetchWithAuth(`/api/diagnosis/sessions/${sessionId}/end`, { method: 'POST' });
      } catch {}
    }

    setPhase('done');
  };

  const reset = () => {
    setPhase('idle');
    setSessionId(null);
    setCurrentBpm(72);
    setBpmHistory([]);
    historyRef.current = [];
    setElapsed(0);
    setAvgBpm(null);
  };

  const displayBpm = phase === 'done' ? (avgBpm || currentBpm) : currentBpm;
  const bpmStatus = getBpmStatus(displayBpm);
  const chartBars = bpmHistory.slice(-10);
  const maxBar = Math.max(...chartBars, 90);

  return (
    <SafeAreaView className="flex-1 bg-[#F9F7F2]" edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40, alignItems: 'center' }}
      >
        {/* 타이틀 */}
        <View className="items-center mb-6 w-full">
          <Text className="text-2xl font-bold text-slate-800 mb-1">심박수 체크</Text>
          <Text className="text-slate-500 text-sm text-center">
            {phase === 'idle' && (healthKitAvailable ? 'Apple Watch로 실제 심박수를 측정해요' : '시뮬레이션으로 심박수를 측정해요')}
            {phase === 'measuring' && '편안한 자세로 호흡에 집중해 주세요'}
            {phase === 'done' && '측정이 완료되었어요!'}
          </Text>
        </View>

        {/* 디바이스 선택 */}
        {phase === 'idle' && (
          <View className="w-full bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
            <Text className="font-bold text-slate-700 text-sm mb-3">측정 방식 선택</Text>
            <View className="flex-row gap-3">
              {[
                { value: 'apple_watch', label: 'Apple Watch', emoji: '⌚', disabled: !healthKitAvailable },
                { value: 'galaxy_watch', label: 'Galaxy Watch', emoji: '📱', disabled: true },
                { value: 'simulation', label: '시뮬레이션', emoji: '💻', disabled: false },
              ].map((d) => (
                <TouchableOpacity
                  key={d.value}
                  onPress={() => !d.disabled && setDeviceType(d.value)}
                  disabled={d.disabled}
                  className={`flex-1 items-center py-3 rounded-xl border-2 ${
                    deviceType === d.value
                      ? 'border-primary bg-emerald-50'
                      : 'border-slate-200'
                  }`}
                  style={{ opacity: d.disabled ? 0.4 : 1 }}
                >
                  <Text className="text-xl mb-1">{d.emoji}</Text>
                  <Text className={`text-xs font-semibold ${deviceType === d.value ? 'text-primary' : 'text-slate-500'}`}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 심박수 원형 표시 */}
        <View className="items-center justify-center mb-6">
          <Animated.View
            style={{ transform: [{ scale: phase === 'measuring' ? pulseAnim : 1 }] }}
            className={`w-52 h-52 rounded-full bg-white shadow-2xl items-center justify-center border-4 ${
              phase === 'measuring' ? 'border-primary/30' : 'border-slate-100'
            }`}
          >
            <Text className="text-4xl mb-1">❤️</Text>
            <Text className={`text-6xl font-black leading-none ${bpmStatus.color}`}>
              {displayBpm}
            </Text>
            <Text className="text-base font-bold text-slate-400 mt-1">BPM</Text>
            {phase !== 'idle' && (
              <Text className={`mt-1 text-sm font-bold ${bpmStatus.color}`}>{bpmStatus.label}</Text>
            )}
          </Animated.View>
        </View>

        {/* 경과 시간 */}
        {phase === 'measuring' && (
          <View className="items-center mb-4">
            <Text className="text-3xl font-bold text-slate-700 font-mono">{formatTime(elapsed)}</Text>
            <Text className="text-xs text-slate-400 mt-1">측정 경과 시간</Text>
          </View>
        )}

        {/* BPM 차트 */}
        {phase === 'measuring' && chartBars.length > 0 && (
          <View className="w-full bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-sm">
            <Text className="text-xs font-semibold text-slate-400 mb-3">실시간 심박수 추이</Text>
            <View className="flex-row items-end h-16 gap-1">
              {chartBars.map((bpm, i) => (
                <View
                  key={i}
                  className="flex-1 rounded-t bg-primary/40"
                  style={{ height: `${(bpm / maxBar) * 100}%` }}
                />
              ))}
            </View>
          </View>
        )}

        {/* 결과 카드 */}
        {phase === 'done' && avgBpm && (
          <View className="w-full mb-4">
            <View className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-3">
              <Text className="font-bold text-slate-800 mb-4">측정 결과</Text>
              <View className="flex-row gap-3">
                {[
                  { label: '평균 BPM', value: avgBpm },
                  { label: '최저 BPM', value: bpmHistory.length ? Math.min(...bpmHistory) : avgBpm },
                  { label: '최고 BPM', value: bpmHistory.length ? Math.max(...bpmHistory) : avgBpm },
                ].map((stat) => (
                  <View key={stat.label} className="flex-1 bg-[#F9F7F2] rounded-xl p-3 items-center">
                    <Text className="text-2xl font-bold text-slate-800">{stat.value}</Text>
                    <Text className="text-xs text-slate-400 mt-1">{stat.label}</Text>
                  </View>
                ))}
              </View>
              <View className={`mt-4 p-4 rounded-xl ${avgBpm <= 80 ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                <Text className={`text-sm font-semibold ${avgBpm <= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {avgBpm < 60 && '심박수가 낮아요. 충분한 수분과 영양을 섭취하세요.'}
                  {avgBpm >= 60 && avgBpm <= 80 && '안정적인 심박수예요. 현재 상태가 매우 좋아요!'}
                  {avgBpm > 80 && avgBpm <= 100 && '심박수가 약간 높아요. 잠깐 휴식을 취해보세요.'}
                  {avgBpm > 100 && '심박수가 높아요. 충분한 휴식이 필요해요.'}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => router.push('/rest-test')}
                className="flex-1 bg-primary py-3.5 rounded-xl items-center"
              >
                <Text className="text-white font-bold">휴식 유형 진단</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/rest-record')}
                className="flex-1 border-2 border-primary py-3.5 rounded-xl items-center"
              >
                <Text className="text-primary font-bold">기록 저장하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 액션 버튼 */}
        {phase === 'idle' && (
          <TouchableOpacity
            onPress={startMeasuring}
            className="w-full bg-primary py-4 rounded-2xl items-center shadow-lg"
          >
            <Text className="text-white font-bold text-lg">측정 시작</Text>
          </TouchableOpacity>
        )}
        {phase === 'measuring' && (
          <TouchableOpacity
            onPress={stopMeasuring}
            className="w-full bg-red-500 py-4 rounded-2xl items-center shadow-lg"
          >
            <Text className="text-white font-bold text-lg">측정 중단</Text>
          </TouchableOpacity>
        )}
        {phase === 'done' && (
          <TouchableOpacity
            onPress={reset}
            className="w-full border-2 border-slate-300 py-3.5 rounded-2xl items-center mt-2"
          >
            <Text className="text-slate-600 font-bold">다시 측정</Text>
          </TouchableOpacity>
        )}

        {healthKitAvailable && deviceType === 'apple_watch' && phase === 'idle' && (
          <Text className="text-xs text-emerald-600 font-semibold mt-4 text-center">
            ⌚ Apple Watch HealthKit 연동됨
          </Text>
        )}
      </ScrollView>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </SafeAreaView>
  );
}
