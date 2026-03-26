import { useEffect } from 'react';
// useEffect: 컴포넌트 마운트/언마운트/의존성 변화 시 실행될 사이드이펙트를 등록한다.

// type: 'success' | 'error' | 'info'
function Toast({ message, type = 'success', onClose, duration = 3000 }) {
// message: 표시할 텍스트. null이면 컴포넌트를 숨긴다.
// type: 메시지 종류. 배경색이 달라진다.
// onClose: 닫힐 때 호출할 함수. 부모가 message를 null로 초기화한다.
// duration: 자동 닫힘 시간(밀리초). 기본값 3000ms = 3초.

  useEffect(() => {
    if (!message) return;
    // message가 없으면 타이머를 설정할 필요 없다.
    const timer = setTimeout(onClose, duration);
    // duration 밀리초 후에 onClose를 자동 호출한다. (자동 닫힘)
    return () => clearTimeout(timer);
    // cleanup 함수: 컴포넌트가 사라지거나 message가 바뀌면 이전 타이머를 취소한다.
    // 안 하면 오래된 타이머가 나중에 실행돼서 의도치 않게 닫힐 수 있다.
  }, [message, duration, onClose]);
  // 의존성 배열: message, duration, onClose가 바뀔 때만 useEffect를 다시 실행한다.

  if (!message) return null;
  // message가 null/undefined/빈문자열이면 아무것도 렌더링하지 않는다.

  const styles = {
    success: 'bg-primary text-white',   // 성공: 초록 배경
    error:   'bg-red-500 text-white',   // 오류: 빨간 배경
    info:    'bg-slate-700 text-white', // 정보: 어두운 회색 배경
  };

  const icons = {
    success: 'check_circle', // material-icons 체크 원형 아이콘
    error:   'error',        // material-icons 에러 아이콘
    info:    'info',         // material-icons 정보 아이콘
  };

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] animate-fade-in">
    {/* fixed: 스크롤해도 화면 하단에 고정된다. */}
    {/* bottom-24: 화면 아래서 96px 위. 하단 네비게이션(56px)보다 위에 표시된다. */}
    {/* left-1/2 -translate-x-1/2: 가로 정중앙 정렬 */}
    {/* z-[200]: 다른 요소들보다 앞에 표시된다. */}
    {/* animate-fade-in: tailwind.config.js에 정의된 나타나는 애니메이션 */}
      <div className={`flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold ${styles[type]}`}>
      {/* flex items-center gap-2: 아이콘과 텍스트를 수평 배치, 간격 8px */}
      {/* shadow-lg: 그림자로 떠있는 느낌 */}
        <span className="material-icons text-lg">{icons[type]}</span>
        {/* type에 맞는 material-icons 아이콘 */}
        {message}
        {/* 표시할 메시지 텍스트 */}
      </div>
    </div>
  );
}

export default Toast;
