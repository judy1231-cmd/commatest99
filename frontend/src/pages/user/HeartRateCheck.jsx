import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import UserNavbar from '../../components/user/UserNavbar';
import Toast from '../../components/common/Toast';

function simulateBpm(baseBpm) {
  return baseBpm + Math.floor(Math.random() * 7) - 3;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// 현재 접속 호스트 기반으로 백엔드 URL 자동 생성
function getBackendUrl() {
  const { protocol, hostname, port } = window.location;
  const backendPort = port === '3000' ? '8080' : (port || '');
  const portStr = backendPort ? `:${backendPort}` : '';
  return `${protocol}//${hostname}${portStr}`;
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
  const [pollCount, setPollCount] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const intervalRef = useRef(null);
  const timerRef = useRef(null);
  const pollRef = useRef(null);

  const backendBase = getBackendUrl();
  const shortcutUrl = `${backendBase}/api/diagnosis/measurements`;
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const token = localStorage.getItem('accessToken') || '';

  const copyToClipboard = useCallback(async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'url') {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      } else {
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 2000);
      }
    } catch {
      setToast({ message: '복사에 실패했어요. 직접 선택해서 복사해주세요.', type: 'error' });
    }
  }, []);

  // 측정 시작
  const startMeasuring = async () => {
    if (!isLoggedIn) {
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

  // Apple Watch 모드 — 3초마다 폴링
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

  // 시뮬레이션 모드
  const startSimulation = (sid) => {
    const baseBpm = 70 + Math.floor(Math.random() * 15);
    const history = [];

    intervalRef.current = setInterval(() => {
      const bpm = simulateBpm(baseBpm);
      setCurrentBpm(bpm);
      history.push(bpm);
      setBpmHistory([...history]);

      if (sid && history.length % 10 === 0) {
        const hrv = parseFloat((Math.random() * 30 + 20).toFixed(1));
        fetchWithAuth(`/api/diagnosis/sessions/${sid}/measurements`, {
          method: 'POST',
          body: JSON.stringify({ bpm, hrv }),
        }).catch(() => {});
      }
    }, 1000);

    timerRef.current = setInterval(() => setElapsed((prev) => prev + 1), 1000);
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
      } catch { /* 무시 */ }
    }
    setPhase('done');
  };

  const reset = () => {
    setPhase('idle');
    setSessionId(null);
    setCurrentBpm(72);
    setBpmHistory([]);
    setElapsed(0);
    setAvgBpm(null);
    setPollCount(0);
  };

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
      clearInterval(pollRef.current);
    };
  }, []);

  const getBpmStatus = (bpm) => {
    if (bpm < 60) return { label: '낮음', color: 'text-blue-500' };
    if (bpm <= 80) return { label: '정상', color: 'text-emerald-500' };
    if (bpm <= 100) return { label: '보통', color: 'text-amber-500' };
    return { label: '높음', color: 'text-red-500' };
  };

  const bpmStatus = getBpmStatus(phase === 'done' ? (avgBpm || currentBpm) : currentBpm);
  const chartBars = bpmHistory.slice(-10);
  const maxBar = Math.max(...chartBars, 90);

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />
      <main className="max-w-2xl mx-auto px-6 py-10 pb-24 flex flex-col items-center space-y-8">

        {/* 제목 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">심박수 체크</h1>
          <p className="text-slate-500">
            {phase === 'idle' && '스마트워치 또는 시뮬레이션으로 심박수를 측정해요'}
            {phase === 'measuring' && '편안한 자세로 호흡에 집중해 주세요'}
            {phase === 'done' && '측정이 완료되었어요!'}
          </p>
        </div>

        {/* 디바이스 선택 */}
        {phase === 'idle' && (
          <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-3 text-sm">측정 방식 선택</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'apple_watch', label: 'Apple Watch', icon: 'watch', sub: 'iPhone 단축어' },
                { value: 'galaxy_watch', label: 'Galaxy Watch', icon: 'watch', sub: '시뮬레이션' },
                { value: 'manual', label: '시뮬레이션', icon: 'computer', sub: '테스트용' },
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
                  <span>{d.label}</span>
                  <span className="text-[10px] opacity-60">{d.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 심박수 원형 표시 */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-30" />
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

        {/* Apple Watch 가이드 (측정 중) */}
        {phase === 'measuring' && deviceType === 'apple_watch' && (
          <div className="w-full space-y-3">

            {/* 수신 상태 배너 */}
            <div className={`w-full rounded-2xl border p-4 flex items-center gap-3 ${
              pollCount > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
            }`}>
              <span className="text-2xl">{pollCount > 0 ? '✅' : '⏳'}</span>
              <div>
                <p className={`text-sm font-bold ${pollCount > 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {pollCount > 0
                    ? `심박수 수신 중 (총 ${pollCount}회)`
                    : 'iPhone 단축어 실행을 기다리는 중...'}
                </p>
                <p className={`text-xs mt-0.5 ${pollCount > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {pollCount > 0
                    ? '단축어를 반복 실행할수록 BPM이 업데이트돼요'
                    : '아래 STEP을 따라 단축어를 설정하고 실행해주세요'}
                </p>
              </div>
            </div>

            {/* localhost 경고 */}
            {isLocalhost && (
              <div className="w-full bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <span className="material-icons text-red-500 mt-0.5">warning</span>
                  <div>
                    <p className="text-sm font-bold text-red-700">iPhone에서 localhost로는 접근 불가!</p>
                    <p className="text-xs text-red-600 mt-1 leading-relaxed">
                      지금 브라우저가 <code className="bg-red-100 px-1 rounded">localhost</code>로 열려 있어요.
                      iPhone 단축어가 작동하려면 맥북과 같은 WiFi에 연결된 상태에서
                      <strong> 맥북의 실제 IP 주소</strong>로 접속해야 해요.
                    </p>
                    <p className="text-xs text-red-500 mt-2 font-semibold">
                      📌 맥북 IP 확인: 시스템 설정 → Wi-Fi → 세부사항 → IP 주소
                    </p>
                    <p className="text-xs text-red-500">
                      그 후 iPhone Safari에서 <code className="bg-red-100 px-1 rounded">http://맥북IP:3000/heartrate</code> 로 접속
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: 단축어 URL */}
            <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">STEP 1 — 단축어에 사용할 URL 복사</p>

              <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2 mb-3">
                <code className="text-xs text-slate-700 break-all flex-1 font-mono">{shortcutUrl}</code>
                <button
                  onClick={() => copyToClipboard(shortcutUrl, 'url')}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    copiedUrl ? 'bg-emerald-500 text-white' : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  {copiedUrl ? '✓ 복사됨' : '복사'}
                </button>
              </div>

              {isLocalhost && (
                <p className="text-[11px] text-slate-400">
                  ⚠️ localhost URL은 iPhone에서 작동 안 해요. 위 경고를 확인해주세요.
                </p>
              )}
            </div>

            {/* STEP 2: 토큰 QR */}
            <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">STEP 2 — 인증 토큰 iPhone으로 전송</p>
              <p className="text-xs text-slate-400 mb-4">
                QR 코드를 iPhone 카메라로 스캔하거나, 아래 버튼으로 복사하세요.
              </p>

              <div className="flex flex-col items-center gap-4">
                <div className="p-3 bg-white border-2 border-slate-200 rounded-2xl">
                  <QRCodeSVG
                    value={token}
                    size={180}
                    bgColor="#ffffff"
                    fgColor="#1e293b"
                    level="M"
                  />
                </div>
                <p className="text-[11px] text-slate-400 text-center">
                  iPhone 카메라로 스캔 → 텍스트 탭 → 전체 선택 → 복사
                </p>

                {/* 토큰 직접 복사 버튼 */}
                <button
                  onClick={() => copyToClipboard(token, 'token')}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                    copiedToken
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                  }`}
                >
                  {copiedToken ? '✓ 토큰 복사됨!' : '💻 맥북에서 토큰 복사하기'}
                </button>
              </div>
            </div>

            {/* STEP 3: 단축어 설정 가이드 */}
            <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">📱</span>
                <p className="text-sm font-bold text-slate-700">STEP 3 — iPhone 단축어 설정 (최초 1회만)</p>
              </div>
              <p className="text-xs text-slate-400 mb-4 pl-7">한 번 만들면 계속 써요 — URL이 고정이라 재설정 불필요</p>

              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">단축어 앱 → 새 단축어 만들기</p>
                    <p className="text-xs text-slate-400 mt-1">iPhone 「단축어」앱 → 우측 상단 「+」</p>
                  </div>
                </li>

                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">심박수 읽기 동작 추가</p>
                    <p className="text-xs text-slate-400 mt-1">「동작 추가」→ 검색: 「건강」→ 「건강 샘플 찾기」</p>
                    <div className="mt-2 bg-slate-50 rounded-lg p-2.5 text-xs text-slate-600 space-y-1">
                      <p>• 유형 → 「심박수」</p>
                      <p>• 정렬 기준 → 「최신 항목」</p>
                      <p>• 제한 → 「1」</p>
                    </div>
                  </div>
                </li>

                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">URL 전송 동작 추가</p>
                    <p className="text-xs text-slate-400 mt-1">「동작 추가」→ 「URL 내용 가져오기」</p>
                    <div className="mt-2 bg-slate-50 rounded-lg p-2.5 text-xs space-y-2">
                      <div>
                        <p className="text-slate-500 font-semibold mb-1">URL (STEP 1에서 복사한 것):</p>
                        <p className="font-mono text-slate-700 break-all bg-white rounded px-2 py-1.5 border border-slate-200 text-[11px]">
                          {shortcutUrl}
                        </p>
                      </div>
                      <p className="text-slate-600">• 방법 → 「POST」</p>
                      <p className="text-slate-600">• 헤더 → 「헤더 추가」</p>
                      <div className="bg-white rounded px-2 py-1.5 border border-slate-200 space-y-1">
                        <p className="text-slate-500">키: <span className="font-mono font-semibold text-slate-700">Authorization</span></p>
                        <p className="text-slate-500">값: <span className="font-mono font-semibold text-slate-700">Bearer </span>
                          <span className="text-primary font-semibold">← STEP 2 토큰 붙여넣기</span>
                        </p>
                      </div>
                      <p className="text-slate-600">• 요청 본문 → 「JSON」</p>
                      <div className="bg-white rounded px-2 py-1.5 border border-slate-200">
                        <p className="text-slate-500">키: <span className="font-mono font-semibold text-slate-700">bpm</span></p>
                        <p className="text-slate-500">값: 「변수」 탭 → 「건강 샘플」 → 「수량」</p>
                      </div>
                    </div>
                  </div>
                </li>

                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">4</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">저장 후 실행!</p>
                    <p className="text-xs text-slate-400 mt-1">
                      「완료」→ 이름: 「심박수 전송」→ ▶ 실행
                    </p>
                  </div>
                </li>
              </ol>

              <div className="mt-4 bg-primary/5 rounded-xl p-3 space-y-1">
                <p className="text-xs font-bold text-primary">💡 이렇게 사용해요</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  웹에서 「측정 시작」→ iPhone에서 「심박수 전송」 단축어 실행 (10~20초 간격으로 반복)
                  → 웹에서 BPM 실시간 업데이트 확인
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Apple Watch가 있다면 Watch에서도 단축어 앱을 열어 바로 실행할 수 있어요!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 경과 시간 */}
        {phase === 'measuring' && (
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-700 font-mono">{formatTime(elapsed)}</div>
            <p className="text-xs text-slate-400 mt-1">측정 경과 시간</p>
          </div>
        )}

        {/* BPM 차트 */}
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

        {/* 결과 화면 */}
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
                  <p className="text-2xl font-bold text-slate-800">{bpmHistory.length ? Math.min(...bpmHistory) : avgBpm}</p>
                  <p className="text-xs text-slate-400">최저 BPM</p>
                </div>
                <div className="bg-[#F9F7F2] rounded-xl p-3">
                  <p className="text-2xl font-bold text-slate-800">{bpmHistory.length ? Math.max(...bpmHistory) : avgBpm}</p>
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
