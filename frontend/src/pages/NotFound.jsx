import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center px-4">
      <div className="text-center">
        {/* 쉼표 로고 */}
        <img
          src="/logo_comma.png"
          alt="쉼표 로고"
          className="w-24 h-24 mx-auto mb-6 object-contain"
        />

        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          앗, 길을 잃었어요
        </h1>
        <p className="text-slate-500 mb-1">
          찾으시는 페이지가 존재하지 않거나
        </p>
        <p className="text-slate-400 text-sm mb-8">
          주소가 변경되었을 수 있어요.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98]"
        >
          <span className="material-icons text-lg">home</span>
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
