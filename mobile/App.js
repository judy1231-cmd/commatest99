/**
 * 쉼표(,) 모바일 앱 — Apple Watch 심박수 연동
 *
 * ⚠️ HealthKit 사용을 위해 Expo Go 대신 아래 명령으로 실행해야 합니다:
 *   npx expo prebuild --platform ios
 *   npx expo run:ios --device
 *
 * 또는 EAS Build:
 *   eas build --platform ios --profile development
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, Platform, ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// HealthKit은 iOS 실기기 + 네이티브 빌드에서만 동작
let AppleHealthKit = null;
try {
  AppleHealthKit = require('react-native-health').default;
} catch {
  // Expo Go 또는 Android — 시뮬레이션 모드로 동작
}

const BACKEND_URL = 'http://192.168.0.15:8080';

const HEALTHKIT_OPTIONS = {
  permissions: {
    read: [
      'HeartRate',
      'HeartRateVariability',
    ],
    write: [],
  },
};

export default function App() {
  const [screen, setScreen] = useState('home'); // home | session | measuring | done
  const [sessionId, setSessionId] = useState('');
  const [sessionIdInput, setSessionIdInput] = useState('');
  const [token, setToken] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [currentBpm, setCurrentBpm] = useState(null);
  const [bpmHistory, setBpmHistory] = useState([]);
  const [isHealthKitAvailable, setIsHealthKitAvailable] = useState(false);
  const [measureCount, setMeasureCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState('');

  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  // 저장된 토큰 불러오기
  useEffect(() => {
    AsyncStorage.getItem('accessToken').then((t) => {
      if (t) setToken(t);
    });
    initHealthKit();
  }, []);

  const initHealthKit = () => {
    if (!AppleHealthKit || Platform.OS !== 'ios') {
      setIsHealthKitAvailable(false);
      setStatus('HealthKit 미지원 — 시뮬레이션 모드');
      return;
    }
    AppleHealthKit.initHealthKit(HEALTHKIT_OPTIONS, (err) => {
      if (err) {
        setIsHealthKitAvailable(false);
        setStatus('HealthKit 권한 거부됨');
      } else {
        setIsHealthKitAvailable(true);
        setStatus('HealthKit 연결됨 ✓');
      }
    });
  };

  const saveToken = async () => {
    await AsyncStorage.setItem('accessToken', tokenInput.trim());
    setToken(tokenInput.trim());
    Alert.alert('저장됨', '로그인 토큰이 저장되었습니다.');
  };

  const startMeasuring = () => {
    const sid = parseInt(sessionIdInput.trim(), 10);
    if (!sid || isNaN(sid)) {
      Alert.alert('오류', '웹에서 확인한 세션 ID를 입력해주세요.');
      return;
    }
    if (!token) {
      Alert.alert('오류', '로그인 토큰을 먼저 입력해주세요.');
      return;
    }
    setSessionId(sid);
    setScreen('measuring');
    setBpmHistory([]);
    setMeasureCount(0);
    setElapsed(0);
    startReadingHeartRate(sid);
  };

  const startReadingHeartRate = (sid) => {
    // 경과 시간 타이머
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    // 5초마다 심박수 읽기
    intervalRef.current = setInterval(() => {
      readAndSendBpm(sid);
    }, 5000);

    // 시작 즉시 1회 실행
    readAndSendBpm(sid);
  };

  const readAndSendBpm = (sid) => {
    if (isHealthKitAvailable && AppleHealthKit) {
      // 실제 HealthKit에서 최근 1분 심박수 읽기
      const options = {
        startDate: new Date(Date.now() - 60000).toISOString(),
        endDate: new Date().toISOString(),
        limit: 1,
        ascending: false,
      };
      AppleHealthKit.getHeartRateSamples(options, (err, results) => {
        if (!err && results && results.length > 0) {
          const bpm = Math.round(results[0].value);
          const hrv = results[0].metadata?.HKMetadataKeyHeartRateMotionContext ?? null;
          updateBpmAndSend(sid, bpm, null);
        } else {
          // HealthKit 데이터 없으면 시뮬레이션
          updateBpmAndSend(sid, simulateBpm(), null);
        }
      });
    } else {
      // 시뮬레이션 모드 (Expo Go / Android)
      updateBpmAndSend(sid, simulateBpm(), null);
    }
  };

  const simulateBpm = () => 65 + Math.floor(Math.random() * 25);

  const updateBpmAndSend = async (sid, bpm, hrv) => {
    setCurrentBpm(bpm);
    setBpmHistory((prev) => [...prev.slice(-19), bpm]);
    setMeasureCount((prev) => prev + 1);

    try {
      await fetch(`${BACKEND_URL}/api/diagnosis/sessions/${sid}/measurements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bpm, hrv }),
      });
    } catch {
      // 전송 실패 시 무시 (다음 인터벌에 재시도)
    }
  };

  const stopMeasuring = () => {
    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);
    setScreen('done');
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);
    setScreen('home');
    setSessionIdInput('');
    setCurrentBpm(null);
    setBpmHistory([]);
  };

  const avgBpm = bpmHistory.length
    ? Math.round(bpmHistory.reduce((s, b) => s + b, 0) / bpmHistory.length)
    : currentBpm;

  const getBpmColor = (bpm) => {
    if (!bpm) return '#64748b';
    if (bpm < 60) return '#3b82f6';
    if (bpm <= 80) return '#10b981';
    if (bpm <= 100) return '#f59e0b';
    return '#ef4444';
  };

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  // ==================== 홈 화면 ====================
  if (screen === 'home') {
    return (
      <ScrollView style={s.bg} contentContainerStyle={s.container}>
        <StatusBar style="dark" />

        <Text style={s.title}>🔗 쉼표 심박수 연동</Text>
        <Text style={s.subtitle}>Apple Watch → 백엔드 전송</Text>

        {/* HealthKit 상태 */}
        <View style={[s.card, { backgroundColor: isHealthKitAvailable ? '#ecfdf5' : '#fef3c7' }]}>
          <Text style={{ fontSize: 13, color: isHealthKitAvailable ? '#065f46' : '#92400e', fontWeight: '600' }}>
            {isHealthKitAvailable ? '✅ ' : '⚠️ '}{status || 'HealthKit 초기화 중...'}
          </Text>
          {!isHealthKitAvailable && (
            <Text style={{ fontSize: 11, color: '#92400e', marginTop: 4 }}>
              실기기 + expo run:ios 필요 (시뮬레이션 모드로 동작 중)
            </Text>
          )}
        </View>

        {/* 로그인 토큰 */}
        <View style={s.card}>
          <Text style={s.label}>로그인 토큰 (웹 localStorage에서 복사)</Text>
          <TextInput
            style={s.input}
            placeholder="eyJhbGciOiJIUzI1NiJ9..."
            value={tokenInput}
            onChangeText={setTokenInput}
            autoCapitalize="none"
            multiline
            numberOfLines={2}
          />
          <TouchableOpacity style={s.btnSecondary} onPress={saveToken}>
            <Text style={s.btnSecondaryText}>토큰 저장</Text>
          </TouchableOpacity>
          {token ? (
            <Text style={{ fontSize: 11, color: '#10b981', marginTop: 6 }}>
              ✓ 토큰 저장됨 ({token.substring(0, 20)}...)
            </Text>
          ) : null}
        </View>

        {/* 세션 ID */}
        <View style={s.card}>
          <Text style={s.label}>세션 ID (웹 심박수 페이지에서 확인)</Text>
          <TextInput
            style={s.input}
            placeholder="예: 42"
            value={sessionIdInput}
            onChangeText={setSessionIdInput}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity
          style={[s.btnPrimary, (!token || !sessionIdInput) && s.disabled]}
          onPress={startMeasuring}
          disabled={!token || !sessionIdInput}
        >
          <Text style={s.btnPrimaryText}>❤️ 측정 시작</Text>
        </TouchableOpacity>

        <Text style={s.hint}>
          1. 웹에서 Apple Watch 모드로 측정 시작{'\n'}
          2. 웹에 표시된 세션 ID를 여기에 입력{'\n'}
          3. 측정 시작 → 웹에서 실시간 BPM 확인
        </Text>
      </ScrollView>
    );
  }

  // ==================== 측정 중 ====================
  if (screen === 'measuring') {
    const color = getBpmColor(currentBpm);
    return (
      <View style={[s.bg, s.center]}>
        <StatusBar style="dark" />

        <Text style={s.title}>측정 중</Text>
        <Text style={{ color: '#64748b', marginBottom: 32 }}>세션 #{sessionId} · {formatTime(elapsed)}</Text>

        {/* BPM 원형 */}
        <View style={[s.bpmCircle, { borderColor: color }]}>
          <Text style={{ fontSize: 16, marginBottom: 4 }}>❤️</Text>
          <Text style={[s.bpmNumber, { color }]}>
            {currentBpm ?? '...'}
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 14, fontWeight: '700' }}>BPM</Text>
        </View>

        <Text style={{ color: '#64748b', marginTop: 20, marginBottom: 8 }}>
          전송 횟수: {measureCount}회
        </Text>

        {/* 미니 차트 */}
        {bpmHistory.length > 0 && (
          <View style={s.chart}>
            {bpmHistory.slice(-10).map((b, i) => (
              <View
                key={i}
                style={[s.bar, {
                  height: Math.max(8, (b / 140) * 60),
                  backgroundColor: getBpmColor(b),
                }]}
              />
            ))}
          </View>
        )}

        <TouchableOpacity style={s.btnStop} onPress={stopMeasuring}>
          <Text style={s.btnPrimaryText}>측정 중단</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ==================== 완료 ====================
  if (screen === 'done') {
    return (
      <View style={[s.bg, s.center]}>
        <StatusBar style="dark" />
        <Text style={{ fontSize: 48, marginBottom: 16 }}>✅</Text>
        <Text style={s.title}>측정 완료</Text>
        <View style={s.card}>
          <Text style={{ textAlign: 'center', color: '#334155' }}>
            평균 BPM: <Text style={{ fontWeight: '800', fontSize: 24, color: '#10b981' }}>{avgBpm}</Text>
          </Text>
          <Text style={{ textAlign: 'center', color: '#64748b', marginTop: 8 }}>
            총 {measureCount}회 측정 · {formatTime(elapsed)}
          </Text>
        </View>
        <Text style={{ color: '#64748b', marginTop: 8, marginBottom: 24, textAlign: 'center' }}>
          웹 페이지에서 결과를 확인하고{'\n'}휴식 유형 진단을 진행하세요
        </Text>
        <TouchableOpacity style={s.btnPrimary} onPress={reset}>
          <Text style={s.btnPrimaryText}>다시 측정</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#F9F7F2' },
  container: { padding: 24, paddingTop: 60 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#1e293b', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 8, elevation: 2,
  },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 13,
    backgroundColor: '#f8fafc', color: '#1e293b',
  },
  btnPrimary: {
    backgroundColor: '#10b981', borderRadius: 14, paddingVertical: 16,
    paddingHorizontal: 40, alignItems: 'center', marginBottom: 16, width: '100%',
  },
  btnPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  btnSecondary: {
    borderWidth: 2, borderColor: '#10b981', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center', marginTop: 10,
  },
  btnSecondaryText: { color: '#10b981', fontWeight: '700', fontSize: 14 },
  btnStop: {
    backgroundColor: '#ef4444', borderRadius: 14, paddingVertical: 16,
    paddingHorizontal: 40, alignItems: 'center', marginTop: 32, width: '80%',
  },
  disabled: { opacity: 0.4 },
  hint: {
    fontSize: 12, color: '#94a3b8', lineHeight: 20,
    textAlign: 'center', paddingHorizontal: 16,
  },
  bpmCircle: {
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 4, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 8,
  },
  bpmNumber: { fontSize: 64, fontWeight: '900', lineHeight: 72 },
  chart: {
    flexDirection: 'row', alignItems: 'flex-end',
    height: 70, gap: 4, marginVertical: 16, paddingHorizontal: 8,
  },
  bar: { flex: 1, borderRadius: 4, minHeight: 8 },
});
