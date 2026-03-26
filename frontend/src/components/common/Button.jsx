// variant: 'primary' | 'outline' | 'ghost'
// size: 'sm' | 'md' | 'lg'
// 이 컴포넌트가 받는 props 목록을 주석으로 문서화한다.

function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
// children: 버튼 안의 내용 (텍스트, 아이콘 등)
// variant: 버튼 스타일 종류. 기본값은 'primary'.
// size: 버튼 크기. 기본값은 'md'.
// className: 추가로 덮어씌울 Tailwind 클래스. 개별 상황에 맞게 조절할 수 있다.
// ...props: onClick, disabled, type 등 나머지 모든 HTML 버튼 속성을 그대로 전달.

  const base = 'inline-flex items-center justify-center font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';
  // inline-flex: 버튼 크기가 내용에 맞춰지고, 내부 요소를 flex로 배치한다.
  // items-center justify-center: 아이콘+텍스트가 수직/수평 가운데 정렬된다.
  // font-bold: 굵은 글씨체
  // rounded-xl: 모서리 둥글게 (14px)
  // transition-all: 색상, 크기 변화 시 부드러운 전환 애니메이션
  // active:scale-[0.98]: 클릭할 때 살짝 작아지는 피드백 효과
  // disabled:opacity-50: disabled 상태에서 반투명하게
  // disabled:cursor-not-allowed: disabled 상태에서 마우스 커서가 금지 모양으로

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    // bg-primary: tailwind.config.js에 정의된 #10b981 (에메랄드 그린)
    // text-white: 흰색 글씨
    // hover:bg-primary/90: 마우스 올리면 90% 불투명도 (약간 어두워짐)
    outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary/5',
    // border-2: 2px 테두리
    // bg-transparent: 배경 없음
    // hover:bg-primary/5: 마우스 올리면 5% 불투명 배경 (살짝 초록 배경)
    ghost:   'text-primary bg-transparent hover:bg-primary/10',
    // 테두리도 없고 배경도 없는 가장 가벼운 스타일
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',   // 작은 버튼: 좌우 패딩 12px, 상하 6px, 작은 글씨
    md: 'px-4 py-2.5 text-sm',   // 중간 버튼: 좌우 패딩 16px
    lg: 'px-6 py-3.5 text-base', // 큰 버튼: 좌우 패딩 24px, 기본 글씨 크기
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
    {/* 기본 클래스 + variant 클래스 + size 클래스 + 추가 클래스를 조합한다. */}
    {/* {...props}: onClick, type, disabled 등 모든 HTML 버튼 속성을 그대로 전달한다. */}
      {children}
      {/* 버튼 안의 내용. <Button>로그인</Button>이면 "로그인"이 여기 들어온다. */}
    </button>
  );
}

export default Button;
// 다른 파일에서 import Button from './common/Button' 으로 가져다 쓸 수 있다.
