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
  const [currentBpm, setCurrentBpm] = useState(null); // null이면 '--' 표시, DB에서 로드
  const [bpmHistory, setBpmHistory] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [avgBpm, setAvgBpm] = useState(null);
  const [deviceType, setDeviceType] = useState('manual');
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [pollCount, setPollCount] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [deviceToken, setDeviceToken] = useState(null);
  const [deviceTokenLoading, setDeviceTokenLoading] = useState(false);

  const [lastReceivedAt, setLastReceivedAt] = useState(null); // 마지막 BPM 수신 시각
  const [lastMeasurementId, setLastMeasurementId] = useState(null); // 신규 수신 감지용 ID

  const intervalRef = useRef(null);
  const timerRef = useRef(null);
  const pollRef = useRef(null);
  const idlePollRef = useRef(null);     // apple_watch idle 상태 자동 폴링
  const lastIdRef = useRef(null);       // 폴링 콜백 내부에서 ID 비교용

  const backendBase = getBackendUrl();
  const shortcutUrl = `${backendBase}/api/diagnosis/measurements/device`;
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

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

  // DB에서 최신 BPM을 받아 상태 업데이트 — idle/measuring 공통 사용
  const applyLatestBpm = useCallback((data) => {
    if (!data?.bpm) return;
    const isNew = data.id !== lastIdRef.current;
    lastIdRef.current = data.id;
    setCurrentBpm(data.bpm);
    if (isNew) {
      setBpmHistory((prev) => [...prev.slice(-49), data.bpm]);
      setPollCount((prev) => prev + 1);
      setLastReceivedAt(new Date());
      setLastMeasurementId(data.id);
    }
  }, []);

  // Apple Watch 측정 중 폴링 — my-latest 엔드포인트 사용
  const startAppleWatchPolling = useCallback((sid) => {
    clearInterval(idlePollRef.current); // idle 폴링 중지 후 측정 폴링으로 전환
    setPollCount(0);
    timerRef.current = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    // 즉시 1회 폴링 (3초 기다리지 않고 세션 시작 직후 바로 확인)
    fetchWithAuth('/api/diagnosis/measurements/my-latest')
      .then((res) => { if (res.success && res.data) applyLatestBpm(res.data); })
      .catch(() => {});
    // 이후 3초 간격 폴링
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetchWithAuth('/api/diagnosis/measurements/my-latest');
        if (res.success && res.data) applyLatestBpm(res.data);
      } catch { /* 폴링 실패 시 무시 */ }
    }, 3000);
  }, [applyLatestBpm]);

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

    // 로컬 변수로 현재 상태 캡처 (state 업데이트와 무관하게 안전하게 계산)
    let history = bpmHistory;
    let lastBpm = currentBpm;

    // 데이터가 없으면 중단 시점에 DB 최신값 1회 직접 조회
    if (!history.length && !lastBpm) {
      try {
        const res = await fetchWithAuth('/api/diagnosis/measurements/my-latest');
        if (res.success && res.data?.bpm) {
          lastBpm = res.data.bpm;
          history = [res.data.bpm];
          applyLatestBpm(res.data); // 화면 표시도 업데이트
        }
      } catch { /* 무시 */ }
    }

    const avg = history.length
      ? Math.round(history.reduce((s, b) => s + b, 0) / history.length)
      : lastBpm;
    setAvgBpm(avg);

    if (sessionId) {
      try {
        await fetchWithAuth(`/api/diagnosis/sessions/${sessionId}/end`, { method: 'POST' });
        localStorage.setItem('lastSessionId', sessionId);
      } catch { /* 무시 */ }
    }
    setPhase('done');
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);
    clearInterval(pollRef.current);
    setPhase('idle');
    setSessionId(null);
    setCurrentBpm(null);
    setBpmHistory([]);
    setElapsed(0);
    setAvgBpm(null);
    setPollCount(0);
    setLastReceivedAt(null);
    lastIdRef.current = null;
  };

  // apple_watch + idle 상태: 3초마다 my-latest 자동 폴링 (단축어 실행 즉시 반영)
  useEffect(() => {
    if (deviceType !== 'apple_watch' || phase !== 'idle' || !isLoggedIn) {
      clearInterval(idlePollRef.current);
      return;
    }
    // 선택 즉시 1회 로드
    fetchWithAuth('/api/diagnosis/measurements/my-latest')
      .then((res) => { if (res.success && res.data) applyLatestBpm(res.data); })
      .catch(() => {});
    // 이후 3초 간격 폴링
    idlePollRef.current = setInterval(async () => {
      try {
        const res = await fetchWithAuth('/api/diagnosis/measurements/my-latest');
        if (res.success && res.data) applyLatestBpm(res.data);
      } catch {}
    }, 3000);
    return () => clearInterval(idlePollRef.current);
  }, [deviceType, phase, isLoggedIn, applyLatestBpm]);

  // deviceToken 발급 (apple_watch 선택 시 자동)
  useEffect(() => {
    if (deviceType === 'apple_watch' && isLoggedIn && !deviceToken) {
      setDeviceTokenLoading(true);
      fetchWithAuth('/api/user/device-token', { method: 'POST' })
        .then((res) => { if (res.success) setDeviceToken(res.data.deviceToken); })
        .catch(() => {})
        .finally(() => setDeviceTokenLoading(false));
    }
  }, [deviceType, isLoggedIn]);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
      clearInterval(pollRef.current);
      clearInterval(idlePollRef.current);
    };
  }, []);

  const getBpmStatus = (bpm) => {
    if (bpm == null) return { label: '대기', color: 'text-slate-500', badgeBg: 'bg-slate-500/20 text-slate-400 border-slate-500/30', ringColor: 'border-slate-700', glowColor: 'bg-slate-500' };
    if (bpm < 60) return { label: '낮음', color: 'text-blue-400', badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30', ringColor: 'border-blue-400/50', glowColor: 'bg-blue-500' };
    if (bpm <= 80) return { label: '정상', color: 'text-emerald-400', badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', ringColor: 'border-emerald-400/50', glowColor: 'bg-emerald-500' };
    if (bpm <= 100) return { label: '주의', color: 'text-amber-400', badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30', ringColor: 'border-amber-400/50', glowColor: 'bg-amber-500' };
    return { label: '위험', color: 'text-red-400', badgeBg: 'bg-red-500/20 text-red-300 border-red-500/30', ringColor: 'border-red-400/50', glowColor: 'bg-red-500' };
  };

  const displayBpm = phase === 'done' ? (avgBpm ?? currentBpm) : currentBpm;
  const bpmStatus = getBpmStatus(displayBpm);
  const chartBars = bpmHistory.slice(-12);
  const maxBar = Math.max(...chartBars, 90);

  // idle + apple_watch 모드에서 수신 중일 때 원형 애니메이션 활성화
  const isAppleWatchLive = deviceType === 'apple_watch' && phase === 'idle' && lastMeasurementId != null;

  // 마지막 수신으로부터 경과 시간 텍스트
  const getReceivedAgoText = () => {
    if (!lastReceivedAt) return null;
    const secs = Math.floor((Date.now() - lastReceivedAt.getTime()) / 1000);
    if (secs < 5) return '방금 전';
    if (secs < 60) return `${secs}초 전`;
    return `${Math.floor(secs / 60)}분 전`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <UserNavbar />

      <main className="max-w-2xl mx-auto px-6 pt-8 pb-36 flex flex-col items-center gap-6">

        {/* 헤더 */}
        <div className="text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Heart Rate Monitor</p>
          <h1 className="text-[28px] font-extrabold text-white tracking-tight">
            {phase === 'idle' && '심박수 측정'}
            {phase === 'measuring' && '측정 중...'}
            {phase === 'done' && '측정 완료'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {phase === 'idle' && '측정 방식을 선택하고 시작해주세요'}
            {phase === 'measuring' && '편안한 자세로 호흡에 집중해 주세요'}
            {phase === 'done' && '아래에서 결과를 확인하세요'}
          </p>
        </div>

        {/* 심박수 원형 디스플레이 */}
        <div className="relative flex items-center justify-center w-72 h-72">
          {/* Ping 애니메이션 레이어 (측정 중 or apple_watch 수신 중) */}
          {(phase === 'measuring' || isAppleWatchLive) && (
            <>
              <span className={`absolute w-72 h-72 rounded-full ${bpmStatus.glowColor} opacity-10 animate-ping`} />
              <span className={`absolute w-60 h-60 rounded-full ${bpmStatus.glowColor} opacity-10 animate-ping`} style={{ animationDelay: '0.3s' }} />
            </>
          )}

          {/* 메인 원형 */}
          <div className={`relative w-64 h-64 rounded-full bg-slate-800 border-2 ${
            phase === 'measuring' || isAppleWatchLive ? bpmStatus.ringColor : 'border-slate-700'
          } flex flex-col items-center justify-center shadow-2xl transition-all duration-500`}>
            {/* 내부 글로우 */}
            {(phase === 'measuring' || isAppleWatchLive) && (
              <div className={`absolute inset-4 rounded-full ${bpmStatus.glowColor} opacity-5 blur-xl`} />
            )}

            {/* 심장 아이콘 */}
            <span className={`material-icons text-4xl mb-1 transition-all ${
              phase === 'measuring' || isAppleWatchLive ? `${bpmStatus.color} animate-pulse` : 'text-slate-500'
            }`}>
              favorite
            </span>

            {/* BPM 숫자 */}
            <div className={`text-[80px] font-black leading-none tracking-tighter transition-all ${
              phase === 'idle' && !isAppleWatchLive ? 'text-slate-600' : bpmStatus.color
            }`}>
              {displayBpm ?? '--'}
            </div>

            {/* BPM 라벨 */}
            <div className="text-slate-400 text-sm font-bold tracking-widest mt-1">BPM</div>

            {/* 상태 배지 */}
            {(phase !== 'idle' || isAppleWatchLive) && (
              <div className={`mt-2 px-3 py-0.5 rounded-full border text-xs font-bold ${bpmStatus.badgeBg}`}>
                {bpmStatus.label}
              </div>
            )}
          </div>
        </div>

        {/* 경과 시간 (측정 중) */}
        {phase === 'measuring' && (
          <div className="text-center">
            <div className="text-3xl font-black text-white font-mono tracking-widest">{formatTime(elapsed)}</div>
            <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">측정 경과</p>
          </div>
        )}

        {/* 실시간 BPM 차트 (측정 중 or apple_watch 수신 중) */}
        {(phase === 'measuring' || isAppleWatchLive) && chartBars.length > 0 && (
          <div className="w-full bg-slate-800/60 backdrop-blur rounded-2xl border border-slate-700 p-5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">실시간 심박수 추이</p>
            <div className="flex items-end gap-1.5 h-14">
              {chartBars.map((bpm, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t transition-all duration-300 ${bpmStatus.glowColor} opacity-70`}
                  style={{ height: `${(bpm / maxBar) * 100}%` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 디바이스 선택 (idle) */}
        {phase === 'idle' && (
          <div className="w-full bg-slate-800/60 backdrop-blur rounded-2xl border border-slate-700 p-5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">측정 방식</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'apple_watch', label: 'Apple Watch', icon: 'watch', sub: 'iPhone 단축어' },
                { value: 'manual', label: '시뮬레이션', icon: 'computer', sub: '테스트용' },
              ].map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDeviceType(d.value)}
                  className={`flex flex-col items-center gap-1.5 p-3.5 rounded-xl border transition-all text-sm font-semibold ${
                    deviceType === d.value
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                      : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400'
                  }`}
                >
                  <span className="material-icons text-xl">{d.icon}</span>
                  <span className="text-xs text-center leading-tight">{d.label}</span>
                  <span className="text-[10px] opacity-50">{d.sub}</span>
                </button>
              ))}
              {/* Galaxy Watch — 준비 중 */}
              <div className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl border border-slate-700/50 opacity-40 cursor-not-allowed select-none">
                <span className="material-icons text-xl text-slate-500">watch</span>
                <span className="text-xs text-center leading-tight text-slate-500">Galaxy Watch</span>
                <span className="text-[10px] text-slate-600 bg-slate-700/60 px-1.5 py-0.5 rounded-full">준비 중</span>
              </div>
            </div>

            {/* apple_watch 선택 시 자동 수신 안내 */}
            {deviceType === 'apple_watch' && isLoggedIn && (
              <div className={`mt-4 rounded-xl border p-3 flex items-center gap-2.5 transition-all ${
                lastMeasurementId != null
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-slate-700/40 border-slate-600/50'
              }`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${lastMeasurementId != null ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <p className={`text-xs font-semibold ${lastMeasurementId != null ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {lastMeasurementId != null
                    ? `실시간 수신 중 · 마지막 ${getReceivedAgoText()} — 단축어 실행 시 자동 반영`
                    : '단축어를 실행하면 BPM이 자동으로 표시됩니다'}
                </p>
              </div>
            )}

            {!isLoggedIn && (
              <p className="text-xs text-slate-500 text-center mt-4">
                로그인하면 측정 결과가 저장되고 진단에 활용돼요
              </p>
            )}
          </div>
        )}

        {/* Apple Watch 가이드 (idle 또는 측정 중) */}
        {(phase === 'idle' || phase === 'measuring') && deviceType === 'apple_watch' && (
          <div className="w-full space-y-3">

            {/* 수신 상태 배너 */}
            <div className={`w-full rounded-2xl border p-4 flex items-center gap-3 ${
              pollCount > 0
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-amber-500/10 border-amber-500/30'
            }`}>
              <span className="text-2xl">{pollCount > 0 ? '✅' : '⏳'}</span>
              <div className="flex-1">
                <p className={`text-sm font-bold ${pollCount > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {pollCount > 0
                    ? `심박수 수신 중 (총 ${pollCount}회)`
                    : 'iPhone 단축어 실행을 기다리는 중...'}
                </p>
                <p className={`text-xs mt-0.5 ${pollCount > 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {pollCount > 0
                    ? `단축어를 실행할 때마다 BPM이 업데이트돼요${getReceivedAgoText() ? ` · 마지막 수신 ${getReceivedAgoText()}` : ''}`
                    : '아래 STEP을 따라 단축어를 설정하고 실행해주세요'}
                </p>
              </div>
            </div>

            {/* localhost 경고 */}
            {isLocalhost && (
              <div className="w-full bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <span className="material-icons text-red-400 mt-0.5 text-lg">warning</span>
                  <div>
                    <p className="text-sm font-bold text-red-400">iPhone에서 localhost로는 접근 불가!</p>
                    <p className="text-xs text-red-400/80 mt-1 leading-relaxed">
                      지금 브라우저가 <code className="bg-red-500/20 px-1 rounded">localhost</code>로 열려 있어요.
                      iPhone 단축어가 작동하려면 맥북과 같은 WiFi에 연결된 상태에서
                      <strong> 맥북의 실제 IP 주소</strong>로 접속해야 해요.
                    </p>
                    <p className="text-xs text-red-400 mt-2 font-semibold">
                      📌 맥북 IP 확인: 시스템 설정 → Wi-Fi → 세부사항 → IP 주소
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1 */}
            <div className="w-full bg-slate-800/60 backdrop-blur rounded-2xl border border-slate-700 p-5">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">STEP 1 — 단축어에 사용할 URL 복사</p>
              <div className="bg-slate-900/60 rounded-xl p-3 flex items-center gap-2 mb-3">
                <code className="text-xs text-slate-300 break-all flex-1 font-mono">{shortcutUrl}</code>
                <button
                  onClick={() => copyToClipboard(shortcutUrl, 'url')}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    copiedUrl ? 'bg-emerald-500 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  {copiedUrl ? '✓ 복사됨' : '복사'}
                </button>
              </div>
              {isLocalhost && (
                <p className="text-[11px] text-slate-500">
                  ⚠️ localhost URL은 iPhone에서 작동 안 해요. 위 경고를 확인해주세요.
                </p>
              )}
            </div>

            {/* STEP 2 */}
            <div className="w-full bg-slate-800/60 backdrop-blur rounded-2xl border border-slate-700 p-5">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">STEP 2 — 내 디바이스 토큰 복사</p>
              <p className="text-xs text-slate-500 mb-4">QR 코드로 스캔하거나 버튼으로 복사해서 단축어에 붙여넣으세요. 최초 1회만 설정하면 돼요.</p>
              {deviceTokenLoading ? (
                <p className="text-xs text-slate-500 text-center py-4">토큰 발급 중...</p>
              ) : deviceToken ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl">
                    <QRCodeSVG value={deviceToken} size={180} bgColor="#ffffff" fgColor="#1e293b" level="M" />
                  </div>
                  <p className="text-[11px] text-slate-500 text-center">
                    iPhone 카메라로 스캔 → 텍스트 탭 → 전체 선택 → 복사
                  </p>
                  <div className="w-full bg-slate-900/60 rounded-xl p-3 flex items-center gap-2">
                    <code className="text-xs text-slate-300 break-all flex-1 font-mono">{deviceToken}</code>
                    <button
                      onClick={() => copyToClipboard(deviceToken, 'token')}
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        copiedToken ? 'bg-emerald-500 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500'
                      }`}
                    >
                      {copiedToken ? '✓ 복사됨' : '복사'}
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-400/80 text-center">
                    ⚠️ 이 토큰은 내 계정 전용이에요. 외부에 공유하지 마세요.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-red-400 text-center py-4">토큰 발급에 실패했어요. 로그인 상태를 확인해주세요.</p>
              )}
            </div>

            {/* STEP 3 */}
            <div className="w-full bg-slate-800/60 backdrop-blur rounded-2xl border border-slate-700 p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">📱</span>
                <p className="text-sm font-bold text-slate-200">STEP 3 — iPhone 단축어 설정 (최초 1회만)</p>
              </div>
              <p className="text-xs text-slate-500 mb-4 pl-7">한 번 만들면 계속 써요 — 재설정 불필요</p>
              <ol className="space-y-4">
                {[
                  {
                    title: '단축어 앱 → 새 단축어 만들기',
                    desc: 'iPhone 「단축어」앱 → 우측 상단 「+」',
                  },
                  {
                    title: '심박수 읽기 동작 추가',
                    desc: '「동작 추가」→ 검색: 「건강」→ 「건강 샘플 찾기」',
                    detail: ['유형 → 「심박수」', '정렬 기준 → 「최신 항목」', '제한 → 「1」'],
                  },
                  {
                    title: 'URL 내용 가져오기 동작 추가',
                    desc: '「동작 추가」→ 「URL 내용 가져오기」 선택',
                    detail: [
                      `URL: ${shortcutUrl}`,
                      '방법: POST',
                      '헤더 추가 → 이름: X-Device-Key / 값: comma-apple-watch-2026',
                      '헤더 추가 → 이름: Content-Type / 값: application/json',
                      '요청 본문: JSON',
                      '본문에 추가 → deviceToken: (STEP 2에서 복사한 토큰 붙여넣기)',
                      '본문에 추가 → bpm: (건강 샘플 변수)',
                    ],
                  },
                  {
                    title: '저장 후 실행!',
                    desc: '「완료」→ 이름: 「심박수 전송」→ ▶ 실행',
                  },
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-6 h-6 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{step.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                      {step.detail && (
                        <div className="mt-2 bg-slate-900/50 rounded-lg p-2.5 text-xs text-slate-400 space-y-1">
                          {step.detail.map((d, j) => <p key={j}>• {d}</p>)}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 space-y-1">
                <p className="text-xs font-bold text-emerald-400">💡 이렇게 사용해요</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  웹에서 「측정 시작」→ Apple Watch에서 심박수 측정 후 iPhone 단축어 실행
                  (10~20초 간격으로 반복) → 웹에서 BPM 실시간 업데이트 확인
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 결과 화면 */}
        {phase === 'done' && (
          <div className="w-full space-y-4">

            {/* 데이터 없음 안내 (apple_watch 모드에서 단축어 미수신 시) */}
            {avgBpm == null && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
                <span className="material-icons text-amber-400 text-lg mt-0.5">warning</span>
                <div>
                  <p className="text-sm font-bold text-amber-400">심박수 데이터가 수신되지 않았어요</p>
                  <p className="text-xs text-amber-400/70 mt-1 leading-relaxed">
                    iPhone 단축어가 실행됐는지 확인해주세요.<br />
                    단축어 URL이 올바른지, deviceToken이 일치하는지 체크해보세요.
                  </p>
                </div>
              </div>
            )}

            {/* 통계 카드 */}
            <div className="bg-slate-800/60 backdrop-blur rounded-2xl border border-slate-700 p-6">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">측정 결과 요약</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-900/50 rounded-xl p-4">
                  <p className={`text-3xl font-black ${bpmStatus.color}`}>{avgBpm ?? '--'}</p>
                  <p className="text-[11px] text-slate-500 mt-1 font-semibold">평균 BPM</p>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4">
                  <p className="text-3xl font-black text-blue-400">
                    {bpmHistory.length ? Math.min(...bpmHistory) : (avgBpm ?? '--')}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 font-semibold">최저 BPM</p>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4">
                  <p className="text-3xl font-black text-red-400">
                    {bpmHistory.length ? Math.max(...bpmHistory) : (avgBpm ?? '--')}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 font-semibold">최고 BPM</p>
                </div>
              </div>

              {/* 상태 메시지 — avgBpm 있을 때만 표시 */}
              {avgBpm != null && (
                <div className={`mt-4 p-4 rounded-xl border ${
                  avgBpm < 60
                    ? 'bg-blue-500/10 border-blue-500/20'
                    : avgBpm <= 80
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : avgBpm <= 100
                    ? 'bg-amber-500/10 border-amber-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`material-icons text-sm ${bpmStatus.color}`}>info</span>
                    <span className={`text-xs font-bold ${bpmStatus.color}`}>{bpmStatus.label} 범위</span>
                  </div>
                  <p className={`text-sm ${bpmStatus.color} leading-relaxed`}>
                    {avgBpm < 60 && '심박수가 낮아요. 충분한 수분과 영양을 섭취하세요.'}
                    {avgBpm >= 60 && avgBpm <= 80 && '안정적인 심박수예요. 현재 상태가 매우 좋아요!'}
                    {avgBpm > 80 && avgBpm <= 100 && '심박수가 약간 높아요. 잠깐 휴식을 취해보세요.'}
                    {avgBpm > 100 && '심박수가 높아요. 충분한 휴식이 필요해요.'}
                  </p>
                </div>
              )}
            </div>

            {/* 다음 행동 카드 */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/rest-test')}
                className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/40 flex flex-col items-center gap-1"
              >
                <span className="material-icons text-xl">psychology</span>
                <span className="text-sm">휴식 유형 진단</span>
              </button>
              <button
                onClick={() => navigate('/rest-record')}
                className="py-4 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-bold rounded-xl transition-all flex flex-col items-center gap-1"
              >
                <span className="material-icons text-xl">edit_note</span>
                <span className="text-sm">기록 저장하기</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-700/60 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          {phase === 'idle' && (
            <button
              onClick={startMeasuring}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-base shadow-lg shadow-emerald-900/50 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-icons text-xl">favorite</span>
              측정 시작
            </button>
          )}
          {phase === 'measuring' && (
            <button
              onClick={stopMeasuring}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold text-base shadow-lg shadow-red-900/50 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-icons text-xl">stop_circle</span>
              측정 중단
            </button>
          )}
          {phase === 'done' && (
            <button
              onClick={reset}
              className="w-full py-4 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2"
            >
              <span className="material-icons text-xl">refresh</span>
              다시 측정
            </button>
          )}
        </div>
      </div>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  );
}

export default HeartRateCheck;
