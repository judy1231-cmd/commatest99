import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  TextInput, Modal, ActivityIndicator, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import fetchWithAuth from '../api/fetchWithAuth';
import Toast from '../components/common/Toast';

const BASE_URL = 'http://localhost:8080';

const TYPE_INFO = {
  physical:  { label: '신체적 이완',   emoji: '🏃', bg: '#FEF2F2', text: '#DC2626' },
  mental:    { label: '정신적 고요',   emoji: '🧘', bg: '#ECFDF5', text: '#059669' },
  sensory:   { label: '감각의 정화',  emoji: '👁️', bg: '#FFFBEB', text: '#D97706' },
  emotional: { label: '정서적 지지',  emoji: '❤️', bg: '#FDF2F8', text: '#DB2777' },
  social:    { label: '사회적 휴식',  emoji: '👥', bg: '#F5F3FF', text: '#7C3AED' },
  nature:    { label: '자연과의 연결', emoji: '🌲', bg: '#F0FDF4', text: '#16A34A' },
  creative:  { label: '창조적 몰입',  emoji: '🎨', bg: '#FFF7ED', text: '#EA580C' },
};

function formatDuration(startTime, endTime) {
  if (!startTime || !endTime) return '-';
  const minutes = Math.round((new Date(endTime) - new Date(startTime)) / 60000);
  if (minutes < 60) return `${minutes}분`;
  return `${Math.floor(minutes / 60)}시간 ${minutes % 60}분`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return `오늘 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (diffDays === 1) return '어제';
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

const INITIAL_FORM = {
  restTypeId: '',
  startTime: '',
  endTime: '',
  memo: '',
  emotionBefore: 5,
  emotionAfter: 7,
};

export default function RestRecord() {
  const router = useRouter();
  const [restTypes, setRestTypes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    loadRestTypes();
  }, []);

  useEffect(() => {
    loadLogs();
  }, [selectedTypeId]);

  const loadRestTypes = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/rest-types`);
      const data = await res.json();
      if (data.success && data.data) setRestTypes(data.data);
    } catch {}
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('/api/rest-logs?page=1&size=50');
      if (data.success && data.data) {
        const allLogs = data.data.logs || [];
        setLogs(selectedTypeId ? allLogs.filter((l) => l.restTypeId === selectedTypeId) : allLogs);
        setTotalCount(data.data.totalCount || 0);
      }
    } catch {
      setToast({ message: '기록을 불러오지 못했어요.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.restTypeId || !form.startTime || !form.endTime) {
      setToast({ message: '유형, 시작/종료 시간을 모두 입력해주세요.', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetchWithAuth('/api/rest-logs', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          restTypeId: Number(form.restTypeId),
          emotionBefore: Number(form.emotionBefore),
          emotionAfter: Number(form.emotionAfter),
        }),
      });
      if (res.success) {
        setToast({ message: '휴식 기록이 저장되었어요!', type: 'success' });
        setShowModal(false);
        setForm(INITIAL_FORM);
        loadLogs();
      } else {
        setToast({ message: res.message || '저장에 실패했어요.', type: 'error' });
      }
    } catch {
      setToast({ message: '저장 중 오류가 발생했어요.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const getTypeInfo = (typeId) => {
    const type = restTypes.find((t) => t.id === typeId);
    return type ? (TYPE_INFO[type.typeName] || { label: type.typeName, emoji: '🌙', bg: '#F8FAFC', text: '#64748B' })
      : { label: '기타', emoji: '🌙', bg: '#F8FAFC', text: '#64748B' };
  };

  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const weekLogs = logs.filter((l) => new Date(l.startTime) >= weekAgo);
  const totalMinutes = logs.reduce((sum, l) => {
    if (!l.startTime || !l.endTime) return sum;
    return sum + Math.round((new Date(l.endTime) - new Date(l.startTime)) / 60000);
  }, 0);
  const avgEmotion = logs.length
    ? Math.round(logs.reduce((sum, l) => sum + (l.emotionAfter || 0), 0) / logs.length)
    : 0;

  return (
    <SafeAreaView className="flex-1 bg-[#F9F7F2]" edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* 헤더 */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
          <View>
            <Text className="text-2xl font-bold text-slate-800">휴식 기록</Text>
            <Text className="text-slate-500 text-sm">나의 휴식 패턴을 분석해드려요</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            className="flex-row items-center gap-1.5 bg-primary px-4 py-2.5 rounded-xl"
          >
            <Text className="text-white font-bold text-sm">+ 기록 추가</Text>
          </TouchableOpacity>
        </View>

        {/* 요약 카드 */}
        <View className="flex-row flex-wrap px-5 py-3 gap-3">
          {[
            { label: '이번 주 휴식', value: `${weekLogs.length}회`, emoji: '📅' },
            { label: '총 휴식 시간', value: totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : `${totalMinutes}분`, emoji: '⏰' },
            { label: '평균 기분', value: avgEmotion ? `${avgEmotion}/10` : '-', emoji: '❤️' },
            { label: '전체 기록', value: `${totalCount}개`, emoji: '📋' },
          ].map((stat) => (
            <View key={stat.label} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm" style={{ width: '47%' }}>
              <Text className="text-xl mb-1">{stat.emoji}</Text>
              <Text className="text-2xl font-bold text-slate-800">{stat.value}</Text>
              <Text className="text-xs text-slate-400 font-medium mt-1">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* 유형 필터 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 8, gap: 8 }}
        >
          <TouchableOpacity
            onPress={() => setSelectedTypeId(null)}
            className={`px-4 py-2 rounded-full border ${!selectedTypeId ? 'bg-primary border-primary' : 'bg-white border-slate-200'}`}
          >
            <Text className={`text-sm font-bold ${!selectedTypeId ? 'text-white' : 'text-slate-600'}`}>전체</Text>
          </TouchableOpacity>
          {restTypes.map((type) => {
            const info = TYPE_INFO[type.typeName];
            const isSelected = selectedTypeId === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                onPress={() => setSelectedTypeId(isSelected ? null : type.id)}
                className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full border ${isSelected ? 'bg-primary border-primary' : 'bg-white border-slate-200'}`}
              >
                <Text className="text-sm">{info?.emoji}</Text>
                <Text className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                  {info?.label || type.typeName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 기록 목록 */}
        <View className="px-5 pb-8">
          {loading ? (
            <View className="h-40 items-center justify-center">
              <ActivityIndicator color="#10b981" />
            </View>
          ) : logs.length === 0 ? (
            <View className="bg-white rounded-2xl border border-slate-100 py-12 items-center">
              <Text className="text-4xl mb-3">📔</Text>
              <Text className="text-slate-400 text-sm mb-4">아직 기록이 없어요</Text>
              <TouchableOpacity
                onPress={() => setShowModal(true)}
                className="bg-primary px-5 py-2.5 rounded-xl"
              >
                <Text className="text-white font-bold text-sm">기록 추가</Text>
              </TouchableOpacity>
            </View>
          ) : (
            logs.map((log) => {
              const typeInfo = getTypeInfo(log.restTypeId);
              return (
                <View
                  key={log.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-3 flex-row items-center gap-4"
                >
                  <View
                    className="w-14 h-14 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: typeInfo.bg }}
                  >
                    <Text className="text-2xl">{typeInfo.emoji}</Text>
                  </View>
                  <View className="flex-1">
                    <View
                      className="self-start px-2 py-0.5 rounded-full mb-1"
                      style={{ backgroundColor: typeInfo.bg }}
                    >
                      <Text className="text-xs font-bold" style={{ color: typeInfo.text }}>
                        {typeInfo.label}
                      </Text>
                    </View>
                    <Text className="font-bold text-slate-800">{log.memo || '휴식 기록'}</Text>
                    <View className="flex-row gap-3 mt-1">
                      <Text className="text-xs text-slate-400">⏱ {formatDuration(log.startTime, log.endTime)}</Text>
                      <Text className="text-xs text-slate-400">📅 {formatDate(log.startTime)}</Text>
                      {log.emotionAfter != null && (
                        <Text className="text-xs text-slate-400">❤️ {log.emotionAfter}/10</Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* 기록 추가 모달 */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white">
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-lg font-bold text-slate-800">휴식 기록 추가</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text className="text-slate-400 text-2xl">✕</Text>
              </TouchableOpacity>
            </View>

            {/* 휴식 유형 */}
            <Text className="text-sm font-semibold text-slate-700 mb-2">휴식 유형</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {restTypes.map((t) => {
                  const info = TYPE_INFO[t.typeName] || {};
                  const isSelected = form.restTypeId === String(t.id);
                  return (
                    <TouchableOpacity
                      key={t.id}
                      onPress={() => setForm({ ...form, restTypeId: String(t.id) })}
                      className={`items-center px-4 py-3 rounded-xl border-2 ${isSelected ? 'border-primary' : 'border-slate-200'}`}
                      style={{ backgroundColor: isSelected ? '#ECFDF5' : '#F8FAFC' }}
                    >
                      <Text className="text-2xl mb-1">{info.emoji}</Text>
                      <Text className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-slate-500'}`}>
                        {info.label || t.typeName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* 메모 */}
            <Text className="text-sm font-semibold text-slate-700 mb-2">메모 (선택)</Text>
            <TextInput
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 mb-4"
              placeholder="어떤 휴식이었나요?"
              placeholderTextColor="#94a3b8"
              value={form.memo}
              onChangeText={(v) => setForm({ ...form, memo: v })}
            />

            {/* 시간 (텍스트 입력 — datetime-local 대체) */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-slate-700 mb-2">시작 시간</Text>
                <TextInput
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700"
                  placeholder="2024-01-15T14:30"
                  placeholderTextColor="#94a3b8"
                  value={form.startTime}
                  onChangeText={(v) => setForm({ ...form, startTime: v })}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-slate-700 mb-2">종료 시간</Text>
                <TextInput
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700"
                  placeholder="2024-01-15T15:00"
                  placeholderTextColor="#94a3b8"
                  value={form.endTime}
                  onChangeText={(v) => setForm({ ...form, endTime: v })}
                />
              </View>
            </View>

            {/* 기분 슬라이더 대체 — 숫자 선택 */}
            <View className="flex-row gap-3 mb-6">
              {[
                { label: `휴식 전 기분 (${form.emotionBefore}점)`, key: 'emotionBefore' },
                { label: `휴식 후 기분 (${form.emotionAfter}점)`, key: 'emotionAfter' },
              ].map(({ label, key }) => (
                <View key={key} className="flex-1">
                  <Text className="text-xs font-semibold text-slate-700 mb-2">{label}</Text>
                  <View className="flex-row flex-wrap gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <TouchableOpacity
                        key={n}
                        onPress={() => setForm({ ...form, [key]: n })}
                        className={`w-7 h-7 rounded-full items-center justify-center ${form[key] === n ? 'bg-primary' : 'bg-slate-100'}`}
                      >
                        <Text className={`text-[10px] font-bold ${form[key] === n ? 'text-white' : 'text-slate-500'}`}>{n}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={saving}
              className="w-full bg-primary py-3.5 rounded-xl items-center"
              style={{ opacity: saving ? 0.6 : 1 }}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">기록 저장</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </SafeAreaView>
  );
}
