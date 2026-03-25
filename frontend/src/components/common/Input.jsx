// icon: material-icons 이름 (선택)
// icon prop이 있으면 왼쪽에 아이콘이 붙은 인풋을 렌더링한다.

function Input({ icon, className = '', ...props }) {
// icon: material-icons 아이콘 이름 (예: "email", "lock"). 없으면 아이콘 없는 인풋.
// className: 추가 클래스. 기본 스타일 위에 덮어씌울 수 있다.
// ...props: value, onChange, placeholder, type 등 모든 input 속성을 그대로 전달.

  if (icon) {
  // 아이콘이 있는 경우: 아이콘 + 인풋을 relative 컨테이너로 감싼다.
    return (
      <div className="relative">
      {/* relative: 자식 요소들이 이 div 기준으로 위치를 잡도록 한다. */}
        <span className="material-icons absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">{icon}</span>
        {/* absolute: div 안에서 절대 위치로 배치. 인풋 텍스트 위에 겹치지 않는다. */}
        {/* left-3.5: 왼쪽에서 14px */}
        {/* top-1/2 -translate-y-1/2: 수직 가운데 정렬 */}
        {/* text-slate-400: 회색 아이콘 */}
        {/* text-xl: 아이콘 크기 20px */}
        <input
          className={`w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 ${className}`}
          // w-full: 부모 너비에 꽉 차게
          // h-12: 높이 48px
          // pl-11: 왼쪽 패딩 44px (아이콘 공간 확보)
          // pr-4: 오른쪽 패딩 16px
          // rounded-xl: 모서리 둥글게
          // border border-gray-200: 연한 회색 테두리
          // bg-gray-50: 아주 연한 회색 배경
          // focus:ring-2 focus:ring-primary/20: 포커스 시 초록색 ring 효과
          // focus:border-primary: 포커스 시 테두리가 초록색으로
          // outline-none: 브라우저 기본 파란 outline 제거
          // placeholder:text-slate-400: placeholder 텍스트 회색
          {...props}
        />
      </div>
    );
  }

  // 아이콘이 없는 경우: 단순 인풋
  return (
    <input
      className={`w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 ${className}`}
      // px-4: 아이콘 없으니 좌우 패딩 동일 16px
      {...props}
    />
  );
}

export default Input;
