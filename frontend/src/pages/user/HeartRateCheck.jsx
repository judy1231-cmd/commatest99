import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import UserNavbar from '../../components/user/UserNavbar';
import Toast from '../../components/common/Toast';

// 심박수 시뮬레이션 — 실제 디바이스 없을 때 사용
function simulateBpm(baseBpm) {
  return baseBpm + Math.floor(Math.random() * 7) - 3;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function HeartRateCheck() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('accessToken');

  const [phase, setPhase] = useState('idle'); // idle | measuring | done
  const [sessionId, setSessionId] = useState(null);
  const [currentBpm, setCurrentBpm] = useState(72);
  const [bpmHistory, setBpmHistory] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [avgBpm, setAvgBpm] = useState(null);
  const [deviceType, setDeviceType] = useState('manual');
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [pollCount, setPollCount] = useState(0); // Apple Watch 폴링 횟수

  const intervalRef = useRef(null);
  const timerRef = useRef(null);
  const pollRef = useRef(null);

  // 측정 시작
  const startMeasuring = async () => {
    if (!isLoggedIn) {
      // 비로그인 시 로컬 시뮬레이션만
      setPhase('measuring');
      startSimulation(null);
      return;
    }

    try {
      const res = await fetchWithAuth('/api/diagnosis/sessions/start', {
        method: 'POST',
        body: JSON.stringify({ deviceType }),
      });
      if (res.success && res.data) {
        const sid = res.data.id;
        setSessionId(sid);
        setPhase('measuring');
        if (deviceType === 'apple_watch') {
          startAppleWatchPolling(sid);
        } else {
          startSimulation(sid);
        }
      } else {
        setToast({ message: res.message || '측정 시작에 실패했어요.', type: 'error' });
      }
    } catch {
      setToast({ message: '서버에 연결할 수 없어요.', type: 'error' });
    }
  };

  // Apple Watch 모드 — 3초마다 백엔드 폴링하여 모바일 앱이 보낸 BPM 표시
  const startAppleWatchPolling = (sid) => {
    setPollCount(0);
    timerRef.current = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetchWithAuth(`/api/diagnosis/sessions/${sid}/measurements/latest`);
        if (res.success && res.data?.latest) {
          const bpm = res.data.latest.bpm;
          setCurrentBpm(bpm);
          setBpmHistory((prev) => [...prev.slice(-49), bpm]);
          setPollCount(res.data.measurementCount || 0);
        }
      } catch { /* 폴링 실패 시 무시 */ }
    }, 3000);
  };

  const startSimulation = (sid) => {
    const baseBpm = 70 + Math.floor(Math.random() * 15);
    const history = [];

    // 1초마다 BPM 업데이트
    intervalRef.current = setInterval(() => {
      const bpm = simulateBpm(baseBpm);
      setCurrentBpm(bpm);
      history.push(bpm);
      setBpmHistory([...history]);

      // 로그인 시 10초마다 서버에 저장
      if (sid && history.length % 10 === 0) {
        const hrv = (Math.random() * 30 + 20).toFixed(1);
        fetchWithAuth(`/api/diagnosis/sessions/${sid}/measurements`, {
          method: 'POST',
          body: JSON.stringify({ bpm, hrv: parseFloat(hrv) }),
        }).catch(() => { /* 저장 실패 시 무시 */ });
      }
    }, 1000);

    // 경과 시간
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  };

  // 측정 중단
  const stopMeasuring = async () => {
    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);
    clearInterval(pollRef.current);

    const avg = bpmHistory.length
      ? Math.round(bpmHistory.reduce((s, b) => s + b, 0) / bpmHistory.length)
      : currentBpm;
    setAvgBpm(avg);

    if (sessionId) {
      try {
        await fetchWithAuth(`/api/diagnosis/sessions/${sessionId}/end`, { method: 'POST' });
      } catch {
        // 세션 종료 실패 시 무시
      }
    }

    setPhase('done');
  };

  // 다시 시작
  const reset = () => {
    setPhase('idle');
    setSessionId(null);
    setCurrentBpm(72);
    setBpmHistory([]);
    setElapsed(0);
    setAvgBpm(null);
  };

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
      clearInterval(pollRef.current);
    };
  }, []);

  // BPM 상태 판단
  const getBpmStatus = (bpm) => {
    if (bpm < 60) return { label: '낮음', color: 'text-blue-500' };
    if (bpm <= 80) return { label: '정상', color: 'text-emerald-500' };
    if (bpm <= 100) return { label: '보통', color: 'text-amber-500' };
    return { label: '높음', color: 'text-red-500' };
  };

  const bpmStatus = getBpmStatus(phase === 'done' ? (avgBpm || currentBpm) : currentBpm);

  // 막대 차트용 히스토리 (최근 10개)
  const chartBars = bpmHistory.slice(-10);
  const maxBar = Math.max(...chartBars, 90);

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />
      <main className="max-w-2xl mx-auto px-6 py-10 pb-24 flex flex-col items-center space-y-8">

        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">심박수 체크</h1>
          <p className="text-slate-500">
            {phase === 'idle' && '스마트워치 또는 시뮬레이션으로 심박수를 측정해요'}
            {phase === 'measuring' && '편안한 자세로 호흡에 집중해 주세요'}
            {phase === 'done' && '측정이 완료되었어요!'}
          </p>
        </div>

        {/* 디바이스 선택 (idle 상태에서만) */}
        {phase === 'idle' && (
          <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-3 text-sm">측정 방식 선택</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'apple_watch', label: 'Apple Watch', icon: 'watch' },
                { value: 'galaxy_watch', label: 'Galaxy Watch', icon: 'watch' },
                { value: 'manual', label: '시뮬레이션', icon: 'computer' },
              ].map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDeviceType(d.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-semibold ${
                    deviceType === d.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-slate-200 text-slate-500 hover:border-primary/40'
                  }`}
                >
                  <span className="material-icons text-xl">{d.icon}</span>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 심박수 원형 표시 */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-30"></div>
          <div className={`relative w-64 h-64 rounded-full bg-white shadow-2xl flex flex-col items-center justify-center border-4 transition-all ${
            phase === 'measuring' ? 'border-primary/30 animate-pulse' : 'border-slate-100'
          }`}>
            <span className="material-icons text-5xl mb-2 text-red-400">favorite</span>
            <div className={`text-7xl font-black leading-none ${bpmStatus.color}`}>
              {phase === 'done' ? avgBpm : currentBpm}
            </div>
            <div className="text-lg font-bold text-slate-400 mt-2">BPM</div>
            {phase !== 'idle' && (
              <div className={`mt-2 text-sm font-bold ${bpmStatus.color}`}>{bpmStatus.label}</div>
            )}
          </div>
        </div>

        {/* Apple Watch 연동 안내 (측정 중) */}
        {phase === 'measuring' && deviceType === 'apple_watch' && (
          <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-icons text-primary text-lg">smartphone</span>
              <span className="text-sm font-bold text-slate-700">모바일 앱 연동</span>
              {pollCount > 0 && (
                <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                  ✓ 수신 중 ({pollCount}회)
                </span>
              )}
            </div>
            <div className="bg-slate-50 rounded-xl p-3 mb-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">세션 ID</span>
              <span className="font-mono font-bold text-lg text-slate-800">{sessionId}</span>
            </div>
            <ol className="text-xs text-slate-500 space-y-1 list-decimal list-inside">
              <li>쉼표 모바일 앱 실행</li>
              <li>세션 ID <strong className="text-slate-700">{sessionId}</strong> 입력</li>
              <li>Apple Watch 착용 상태로 측정 시작</li>
            </ol>
            {pollCount === 0 && (
              <p className="text-xs text-amber-600 mt-3 text-center animate-pulse">
                모바일 앱의 데이터를 기다리는 중...
              </p>
            )}
          </div>
        )}

        {/* 경과 시간 (측정 중) */}
        {phase === 'measuring' && (
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-700 font-mono">{formatTime(elapsed)}</div>
            <p className="text-xs text-slate-400 mt-1">측정 경과 시간</p>
          </div>
        )}

        {/* BPM 차트 (측정 중) */}
        {phase === 'measuring' && chartBars.length > 0 && (
          <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 mb-3">실시간 심박수 추이</p>
            <div className="flex items-end gap-1 h-16">
              {chartBars.map((bpm, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-primary/40 transition-all"
                  style={{ height: `${(bpm / maxBar) * 100}%` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 결과 (done 상태) */}
        {phase === 'done' && (
          <div className="w-full space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">측정 결과</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-[#F9F7F2] rounded-xl p-3">
                  <p className="text-2xl font-bold text-slate-800">{avgBpm}</p>
                  <p className="text-xs text-slate-400">평균 BPM</p>
                </div>
                <div className="bg-[#F9F7F2] rounded-xl p-3">
                  <p className="text-2xl font-bold text-slate-800">{Math.min(...bpmHistory) || avgBpm}</p>
                  <p className="text-xs text-slate-400">최저 BPM</p>
                </div>
                <div className="bg-[#F9F7F2] rounded-xl p-3">
                  <p className="text-2xl font-bold text-slate-800">{Math.max(...bpmHistory) || avgBpm}</p>
                  <p className="text-xs text-slate-400">최고 BPM</p>
                </div>
              </div>
              <div className={`mt-4 p-4 rounded-xl ${avgBpm <= 80 ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                <p className={`text-sm font-semibold ${avgBpm <= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {avgBpm < 60 && '심박수가 낮아요. 충분한 수분과 영양을 섭취하세요.'}
                  {avgBpm >= 60 && avgBpm <= 80 && '안정적인 심박수예요. 현재 상태가 매우 좋아요!'}
                  {avgBpm > 80 && avgBpm <= 100 && '심박수가 약간 높아요. 잠깐 휴식을 취해보세요.'}
                  {avgBpm > 100 && '심박수가 높아요. 충분한 휴식이 필요해요.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/rest-test')}
                className="py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all"
              >
                휴식 유형 진단
              </button>
              <button
                onClick={() => navigate('/rest-record')}
                className="py-3 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-all"
              >
                기록 저장하기
              </button>
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        {phase === 'idle' && (
          <button
            onClick={startMeasuring}
            className="w-full bg-primary text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-primary/90 transition-all"
          >
            측정 시작
          </button>
        )}
        {phase === 'measuring' && (
          <button
            onClick={stopMeasuring}
            className="w-full bg-red-500 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-red-600 transition-all"
          >
            측정 중단
          </button>
        )}
        {phase === 'done' && (
          <button
            onClick={reset}
            className="w-full border-2 border-slate-300 text-slate-600 px-12 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all"
          >
            다시 측정
          </button>
        )}

        {!isLoggedIn && phase === 'idle' && (
          <p className="text-xs text-slate-400 text-center">
            로그인하면 측정 결과가 저장되고 진단에 활용돼요
          </p>
        )}
      </main>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  );
}

export default HeartRateCheck;
