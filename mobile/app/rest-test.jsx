import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import fetchWithAuth from '../api/fetchWithAuth';
import Toast from '../components/common/Toast';

const BASE_URL = 'http://localhost:8080';

const REST_TYPE_INFO = {
  physical:  { name: '신체적 이완',    emoji: '🏃', color: '#EF4444', desc: '몸의 긴장을 풀고 신체를 편안하게 하는 휴식이 필요해요.', activities: ['스트레칭', '가벼운 산책', '요가'] },
  mental:    { name: '정신적 고요',    emoji: '🧘', color: '#10B981', desc: '복잡한 생각을 내려놓고 마음의 고요함을 찾는 휴식이 필요해요.', activities: ['명상', '심호흡', '차 마시기'] },
  sensory:   { name: '감각의 정화',   emoji: '👁️', color: '#F59E0B', desc: '과도한 자극에서 벗어나 감각을 쉬게 해주는 시간이 필요해요.', activities: ['디지털 디톡스', '눈 감고 쉬기', '아로마테라피'] },
  emotional: { name: '정서적 지지',   emoji: '❤️', color: '#EC4899', desc: '감정적 위안과 지지가 필요한 시기예요.', activities: ['음악 감상', '일기 쓰기', '대화 나누기'] },
  social:    { name: '사회적 휴식',   emoji: '👥', color: '#8B5CF6', desc: '사람들과의 관계에서 에너지를 재충전할 시간이에요.', activities: ['친구와 수다', '혼자 카페 가기', '소모임'] },
  nature:    { name: '자연과의 연결', emoji: '🌲', color: '#059669', desc: '자연 속에서 에너지를 충전하는 시간이 필요해요.', activities: ['공원 산책', '등산', '숲 속 힐링'] },
  creative:  { name: '창조적 몰입',   emoji: '🎨', color: '#F97316', desc: '창작 활동에 몰입하면서 스트레스를 해소해보세요.', activities: ['그림 그리기', '글쓰기', '요리'] },
};

export default function RestTypeTest() {
  const router = useRouter();
  const [step, setStep] = useState('intro'); // intro | survey | loading | result
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [otherTexts, setOtherTexts] = useState({});
  const [result, setResult] = useState(null);
  const [typeScores, setTypeScores] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    checkAuth();
    loadQuestions();
  }, []);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  };

  const loadQuestions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/survey/questions`);
      const data = await res.json();
      if (data.success && data.data) setQuestions(data.data);
    } catch {
      setToast({ message: '질문을 불러오지 못했어요.', type: 'error' });
    }
  };

  const handleSelect = (questionId, choiceId) => {
    const newAnswers = { ...answers, [questionId]: choiceId };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
      }
    }, 300);
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      showOfflineResult();
      return;
    }

    setStep('loading');
    try {
      const responseList = Object.entries(answers).map(([questionId, choiceId]) => ({
        questionId: Number(questionId),
        choiceId: Number(choiceId),
      }));

      await fetchWithAuth('/api/survey/responses', {
        method: 'POST',
        body: JSON.stringify(responseList),
      });

      const otherTextList = Object.values(otherTexts).filter((t) => t.trim() !== '');
      const diagRes = await fetchWithAuth('/api/diagnosis/calculate', {
        method: 'POST',
        body: JSON.stringify({ sessionId: null, otherTexts: otherTextList }),
      });

      if (diagRes.success && diagRes.data) {
        setResult(diagRes.data);
        const scores = JSON.parse(diagRes.data.scoresJson || '{}');
        const sorted = Object.entries(scores)
          .map(([type, score]) => ({ type, score }))
          .sort((a, b) => b.score - a.score);
        setTypeScores(sorted);
        setStep('result');
      } else {
        setToast({ message: diagRes.message || '진단에 실패했어요.', type: 'error' });
        setStep('survey');
      }
    } catch {
      setToast({ message: '진단 중 오류가 발생했어요.', type: 'error' });
      setStep('survey');
    }
  };

  const showOfflineResult = () => {
    setStep('loading');
    const SCORE_TO_TYPE = { 1: 'physical', 2: 'mental', 3: 'sensory', 4: 'emotional', 5: 'social', 6: 'nature', 7: 'creative' };
    const types = Object.keys(REST_TYPE_INFO);
    const frequency = {};
    types.forEach((t) => { frequency[t] = 0; });

    for (const q of questions) {
      const choiceId = answers[q.question.id];
      if (!choiceId) continue;
      const selected = q.choices.find((c) => c.id === choiceId);
      if (selected) {
        const mappedType = SCORE_TO_TYPE[selected.score];
        if (mappedType) frequency[mappedType]++;
      }
    }

    const maxFreq = Math.max(...Object.values(frequency), 1);
    const typeScoreMap = {};
    for (const t of types) {
      typeScoreMap[t] = Math.round((frequency[t] / maxFreq) * 100);
    }

    const sorted = Object.entries(typeScoreMap)
      .map(([type, score]) => ({ type, score }))
      .sort((a, b) => b.score - a.score);

    const primary = sorted[0].type;
    const avgScore = Math.round(sorted.reduce((sum, s) => sum + s.score, 0) / 7);
    const stressIndex = Math.min(100, sorted[0].score - avgScore + 40);

    setResult({ primaryRestType: primary, stressIndex, scoresJson: JSON.stringify(typeScoreMap) });
    setTypeScores(sorted);
    setTimeout(() => setStep('result'), 1500);
  };

  // ===== 인트로 =====
  if (step === 'intro') {
    return (
      <SafeAreaView className="flex-1 bg-[#F9F7F2]" edges={['bottom']}>
        <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center', paddingBottom: 40 }}>
          <View className="w-20 h-20 bg-emerald-50 rounded-full items-center justify-center mb-6 mt-4">
            <Text className="text-4xl">🧠</Text>
          </View>
          <Text className="text-2xl font-bold text-slate-800 mb-3">나의 휴식 유형 진단</Text>
          <Text className="text-slate-500 text-center leading-relaxed mb-8">
            {`${questions.length || 5}가지 질문에 답하면 지금 당신에게\n가장 필요한 휴식 유형을 알려드려요.`}
          </Text>

          <View className="w-full bg-white rounded-2xl border border-slate-100 p-5 mb-8 shadow-sm">
            {[
              { emoji: '⏱️', text: '약 2분 소요' },
              { emoji: '❓', text: `${questions.length || 5}개 질문` },
              { emoji: '✨', text: '7가지 휴식유형 분석' },
            ].map((item) => (
              <View key={item.emoji} className="flex-row items-center gap-3 mb-3">
                <Text className="text-xl">{item.emoji}</Text>
                <Text className="text-sm font-semibold text-slate-700">{item.text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => setStep('survey')}
            disabled={questions.length === 0}
            className="w-full bg-primary py-4 rounded-xl items-center"
            style={{ opacity: questions.length === 0 ? 0.5 : 1 }}
          >
            {questions.length === 0 ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">진단 시작하기</Text>
            )}
          </TouchableOpacity>

          {!isLoggedIn && (
            <Text className="text-xs text-slate-400 mt-4 text-center">
              로그인하면 결과가 저장되고 맞춤 추천을 받을 수 있어요
            </Text>
          )}
        </ScrollView>
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
      </SafeAreaView>
    );
  }

  // ===== 설문 =====
  if (step === 'survey' && questions.length > 0) {
    const current = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const allAnswered = Object.keys(answers).length === questions.length;

    return (
      <SafeAreaView className="flex-1 bg-[#F9F7F2]" edges={['bottom']}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          {/* 진행 바 */}
          <View className="mb-5">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-slate-400">질문 {currentIndex + 1} / {questions.length}</Text>
              <Text className="text-sm text-slate-400">{Math.round(progress)}%</Text>
            </View>
            <View className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <View className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
            </View>
          </View>

          {/* 질문 카드 */}
          <View className="bg-white rounded-2xl border border-slate-100 p-5 mb-4 shadow-sm">
            <View className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center mb-4">
              <Text className="text-xl">{REST_TYPE_INFO[current.question.category]?.emoji || '❓'}</Text>
            </View>
            <Text className="text-lg font-bold text-slate-800 mb-5 leading-relaxed">
              {current.question.questionContent}
            </Text>

            <View className="gap-3">
              {current.choices.map((choice) => {
                const isSelected = answers[current.question.id] === choice.id;
                return (
                  <TouchableOpacity
                    key={choice.id}
                    onPress={() => handleSelect(current.question.id, choice.id)}
                    className={`flex-row items-center gap-3 p-4 rounded-xl border-2 ${
                      isSelected
                        ? 'border-primary bg-emerald-50'
                        : 'border-slate-200'
                    }`}
                  >
                    <View className={`w-8 h-8 rounded-full items-center justify-center ${
                      isSelected ? 'bg-primary' : 'bg-slate-100'
                    }`}>
                      <Text className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                        {choice.displayOrder}
                      </Text>
                    </View>
                    <Text className={`flex-1 font-medium ${isSelected ? 'text-primary' : 'text-slate-700'}`}>
                      {choice.choiceContent}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* 기타 입력 */}
              <View className="flex-row items-center gap-3 mt-1">
                <View className="w-8 h-8 rounded-full items-center justify-center bg-slate-100">
                  <Text className="text-xs font-bold text-slate-400">기타</Text>
                </View>
                <TextInput
                  className="flex-1 h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700"
                  placeholder="보기에 없으면 직접 입력 (선택)"
                  placeholderTextColor="#94a3b8"
                  value={otherTexts[current.question.id] || ''}
                  onChangeText={(t) => setOtherTexts({ ...otherTexts, [current.question.id]: t })}
                />
              </View>
            </View>
          </View>

          {/* 네비게이션 */}
          <View className="flex-row gap-3">
            {currentIndex > 0 && (
              <TouchableOpacity
                onPress={() => setCurrentIndex((i) => i - 1)}
                className="flex-1 py-3.5 border-2 border-slate-200 rounded-xl items-center"
              >
                <Text className="text-slate-600 font-bold">이전</Text>
              </TouchableOpacity>
            )}
            {currentIndex < questions.length - 1 ? (
              <TouchableOpacity
                onPress={() => setCurrentIndex((i) => i + 1)}
                disabled={!answers[current.question.id]}
                className="flex-1 py-3.5 bg-primary rounded-xl items-center"
                style={{ opacity: answers[current.question.id] ? 1 : 0.4 }}
              >
                <Text className="text-white font-bold">다음</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!allAnswered}
                className="flex-1 py-3.5 bg-primary rounded-xl items-center"
                style={{ opacity: allAnswered ? 1 : 0.4 }}
              >
                <Text className="text-white font-bold">결과 보기</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
      </SafeAreaView>
    );
  }

  // ===== 로딩 =====
  if (step === 'loading') {
    return (
      <SafeAreaView className="flex-1 bg-[#F9F7F2] items-center justify-center">
        <View className="w-20 h-20 bg-emerald-50 rounded-full items-center justify-center mb-6">
          <Text className="text-4xl">🧠</Text>
        </View>
        <Text className="text-xl font-bold text-slate-800 mb-2">분석 중이에요</Text>
        <Text className="text-slate-500">당신에게 꼭 맞는 휴식을 찾고 있어요...</Text>
        <ActivityIndicator color="#10b981" size="large" style={{ marginTop: 24 }} />
      </SafeAreaView>
    );
  }

  // ===== 결과 =====
  if (step === 'result' && result) {
    const primary = REST_TYPE_INFO[result.primaryRestType] || REST_TYPE_INFO.mental;
    const top3 = typeScores.slice(0, 3);
    const maxScore = top3[0]?.score || 100;

    return (
      <SafeAreaView className="flex-1 bg-[#F9F7F2]" edges={['bottom']}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

          {/* 메인 결과 */}
          <View className="bg-white rounded-2xl border border-slate-100 p-5 items-center mb-4 shadow-sm">
            <Text className="text-sm font-semibold text-primary mb-3">당신에게 가장 필요한 휴식은</Text>
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: `${primary.color}20` }}
            >
              <Text className="text-4xl">{primary.emoji}</Text>
            </View>
            <Text className="text-2xl font-bold text-slate-800 mb-2">{primary.name}</Text>
            <Text className="text-slate-500 text-sm text-center leading-relaxed mb-4">{primary.desc}</Text>

            {/* 스트레스 지수 */}
            <View className="w-full bg-slate-50 rounded-xl p-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm font-semibold text-slate-600">스트레스 지수</Text>
                <Text className="text-lg font-bold text-primary">{result.stressIndex}점</Text>
              </View>
              <View className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${result.stressIndex}%`,
                    backgroundColor: result.stressIndex > 70 ? '#EF4444' : result.stressIndex > 40 ? '#F59E0B' : '#10B981',
                  }}
                />
              </View>
              <Text className="text-xs text-slate-400 mt-2">
                {result.stressIndex > 70 ? '스트레스가 높아요. 충분한 휴식이 필요해요!'
                  : result.stressIndex > 40 ? '보통 수준이에요. 규칙적인 휴식을 추천해요.'
                  : '좋은 상태예요! 지금의 습관을 유지하세요.'}
              </Text>
            </View>
          </View>

          {/* 유형별 분석 */}
          <View className="bg-white rounded-2xl border border-slate-100 p-5 mb-4 shadow-sm">
            <Text className="font-bold text-slate-800 mb-4">유형별 분석</Text>
            {top3.map((item, i) => {
              const info = REST_TYPE_INFO[item.type] || {};
              return (
                <View key={item.type} className="mb-3">
                  <View className="flex-row items-center justify-between mb-1.5">
                    <View className="flex-row items-center gap-2">
                      <Text>{info.emoji}</Text>
                      <Text className="text-sm font-semibold text-slate-700">{info.name}</Text>
                      {i === 0 && (
                        <View className="bg-emerald-50 px-2 py-0.5 rounded-full">
                          <Text className="text-xs text-primary font-bold">1위</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-sm font-bold text-slate-600">{item.score}점</Text>
                  </View>
                  <View className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${(item.score / maxScore) * 100}%`,
                        backgroundColor: info.color,
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {/* 추천 활동 */}
          <View className="bg-white rounded-2xl border border-slate-100 p-5 mb-4 shadow-sm">
            <Text className="font-bold text-slate-800 mb-4">추천 활동</Text>
            <View className="flex-row gap-3">
              {primary.activities.map((activity, i) => (
                <View
                  key={i}
                  className="flex-1 rounded-xl p-3 items-center"
                  style={{ backgroundColor: `${primary.color}15` }}
                >
                  <Text className="text-2xl mb-1">
                    {['🧘', '🚶', '🎨'][i]}
                  </Text>
                  <Text className="text-xs font-semibold text-slate-700 text-center">{activity}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 액션 버튼 */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => {
                setStep('intro');
                setCurrentIndex(0);
                setAnswers({});
                setOtherTexts({});
                setResult(null);
                setTypeScores([]);
              }}
              className="flex-1 py-3.5 border-2 border-primary rounded-xl items-center"
            >
              <Text className="text-primary font-bold">다시 진단</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(isLoggedIn ? '/rest-record' : '/(auth)/login')}
              className="flex-1 py-3.5 bg-primary rounded-xl items-center"
            >
              <Text className="text-white font-bold">
                {isLoggedIn ? '휴식 기록하기' : '로그인하기'}
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
      </SafeAreaView>
    );
  }

  // 기본 로딩
  return (
    <SafeAreaView className="flex-1 bg-[#F9F7F2] items-center justify-center">
      <ActivityIndicator color="#10b981" size="large" />
    </SafeAreaView>
  );
}
